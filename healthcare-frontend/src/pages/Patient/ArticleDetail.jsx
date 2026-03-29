import { useState, useEffect, Fragment, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useArticles } from '../../context/ArticlesContext'
import { useToast } from '../../components/common/ToastContainer'
import useAuth from '../../hooks/useAuth'
import api from '../../services/api'
import Loading from '../../components/common/Loading'
import { formatDateLong } from '../../utils/dateUtils'
import shareIcon from '../../assets/icons/share.svg'
import savedIcon from '../../assets/icons/my-saved-icon.svg'
import styles from '../../assets/style/ShowTipDetails.module.css'
import page from '../../assets/style/Page.module.css'

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getArticleById } = useArticles()
  const { success: showSuccess, warning: showWarning, error: showError } = useToast()
  const { isAuthenticated, user, setUser, updateUserInStorage } = useAuth()
  const [article, setArticle] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Format content to make lines starting with numbers or # bold
  const formatContent = (content) => {
    if (!content) return ''
    
    // Split content by newlines
    const lines = content.split('\n')
    
    return lines.map((line, index) => {
      // Check if line starts with a number followed by ., ), or -
      // Patterns: "1.", "2)", "3-", "10.", etc.
      const numberPattern = /^(\d+[.)\-])\s*(.*)$/
      // Check if line starts with #
      const hashPattern = /^#\s*(.*)$/
      const numberMatch = line.match(numberPattern)
      const hashMatch = line.match(hashPattern)
      const nextLine = index < lines.length - 1 ? lines[index + 1] : ''
      const isNextLineBold = nextLine && (numberPattern.test(nextLine) || hashPattern.test(nextLine))
      const isNextLineEmpty = !nextLine.trim()
      
      if (numberMatch || hashMatch) {
        // Line starts with number or # - make it bold
        // If it starts with #, remove the # symbol but keep it bold
        const displayLine = hashMatch ? line.replace(/^#\s*/, '') : line
        // Use minimal spacing if next line is description, normal spacing if next is bold/empty
        return (
          <Fragment key={index}>
            <span className={styles.boldLine}>{displayLine}</span>
            {index < lines.length - 1 && (
              isNextLineBold || isNextLineEmpty ? (
                <br />
              ) : (
                <span className={styles.boldLineBreak} />
              )
            )}
          </Fragment>
        )
      } else {
        // Regular line
        return (
          <Fragment key={index}>
            <span>{line}</span>
            {index < lines.length - 1 && <br />}
          </Fragment>
        )
      }
    })
  }

  const checkIfSaved = useCallback(async (articleId) => {
    // Only check saved status if user is authenticated
    if (!isAuthenticated || !user || !user.id) {
      setIsSaved(false)
      return
    }

    try {
      // Fetch current user data from API to check saved articles
      const response = await api.get(`/patients/${user.id}`)
      const patient = response.data
      const savedArticles = patient.savedArticles || [] // Array of article IDs (strings from MongoDB)
      // Compare as strings since backend returns string IDs
      const isArticleSaved = savedArticles.some(savedId => String(savedId) === String(articleId))
      setIsSaved(isArticleSaved)
    } catch (error) {
      console.error('Error checking if article is saved:', error)
      setIsSaved(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    const loadArticle = async () => {
      // First try to get from context
      let articleData = getArticleById(id)
      
      // If not found in context, fetch from API
      if (!articleData) {
        try {
          const response = await api.get(`/articles/${id}`)
          articleData = response.data
        } catch (error) {
          console.error('Error fetching article:', error)
          navigate('/patient/home')
          return
        }
      }
      
      if (articleData) {
        setArticle(articleData)
        // Check if article is already saved (only if user is authenticated)
        if (isAuthenticated && user) {
          checkIfSaved(articleData.id)
        }
      } else {
        navigate('/patient/home')
      }
    }
    
    loadArticle()
  }, [id, getArticleById, navigate, isAuthenticated, user, checkIfSaved])

  const handleShare = () => {
    if (!article) return
    
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl).then(() => {
      showSuccess('Link copied to clipboard!')
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showSuccess('Link copied to clipboard!')
    })
  }

  const handleSave = async () => {
    if (!article) return

    // Check if user is authenticated
    if (!isAuthenticated || !user || !user.id) {
      showWarning('Please log in to save items')
      navigate('/auth/login')
      return
    }

    if (isSaving) return // Prevent multiple simultaneous requests

    setIsSaving(true)

    try {
      if (!isSaved) {
        // Save the article - send only the ID
        const response = await api.post(`/patients/${user.id}/save-article`, { articleId: article.id })
        if (response.data.success) {
          setIsSaved(true)
          // Update user in context with latest saved articles
          if (response.data.patient) {
            const { password: _, ...userWithoutPassword } = response.data.patient
            setUser({ ...userWithoutPassword, role: 'patient' })
            // Update user in storage (localStorage or sessionStorage based on rememberMe)
            updateUserInStorage({ ...userWithoutPassword, role: 'patient' })
          }
          showSuccess('Article saved successfully!')
        }
      } else {
        // Remove the article
        const response = await api.delete(`/patients/${user.id}/save-article/${article.id}`)
        if (response.data.success) {
          setIsSaved(false)
          // Update user in context with latest saved articles
          if (response.data.patient) {
            const { password: _, ...userWithoutPassword } = response.data.patient
            setUser({ ...userWithoutPassword, role: 'patient' })
            // Update user in storage (localStorage or sessionStorage based on rememberMe)
            updateUserInStorage({ ...userWithoutPassword, role: 'patient' })
          }
          showSuccess('Article removed from saved')
        }
      }
    } catch (error) {
      console.error('Error saving/removing article:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save article. Please try again.'
      showError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!article) {
    return (
      <div className={page.wrap}>
        <Loading message="Loading article..." />
      </div>
    )
  }


  return (
    <div className={page.wrap}>
      <div className={styles.content}>
        {/* Author, Date, and Icons */}
        <div className={styles.articleMetaRow}>
          <div className={styles.articleMeta}>
            {article.author && <span className={styles.articleMetaAuthor}>{article.author}</span>}
            {article.author && article.date && <span> • </span>}
            {article.date && <span>{formatDateLong(article.date)}</span>}
          </div>
          <div className={`${styles.iconActions} ${styles.iconActionsNoMargin}`}>
            <button 
              className={styles.iconButton}
              onClick={handleShare}
              title="Share"
            >
              <img src={shareIcon} alt="Share" className={styles.icon} />
            </button>
            <button 
              className={`${styles.iconButton} ${isSaved ? styles.saved : ''}`}
              onClick={handleSave}
              disabled={isSaving}
              title={isSaved ? "Remove from saved" : "Save article"}
            >
              <img src={savedIcon} alt="Save" className={styles.icon} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className={styles.tipTitle}>{article.title}</h1>
        
        {/* Subtitle - Centered */}
        {article.subtitle && (
          <p className={`${styles.articleSubtitle} ${styles.articleSubtitleCentered}`}>
            {article.subtitle}
          </p>
        )}

        {/* Cover Image */}
        <div className={`${styles.tipImageContainer} ${styles.articleImageContainer}`}>
          <img 
            src={article.image || 'https://via.placeholder.com/800x400?text=No+Image'} 
            alt={article.title}
            className={styles.tipImage}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'
            }}
          />
        </div>

        {/* Full Content */}
        <div className={styles.tipContent}>
          <div className={styles.tipText}>
            {formatContent(article.content || article.fullContent)}
          </div>
        </div>

        {/* References */}
        {article.references && (
          Array.isArray(article.references) && article.references.length > 0 ? (
            <div className={styles.referencesContainer}>
              <h3 className={styles.referencesTitle}>References</h3>
              <div className={styles.referencesText}>
                <ul>
                  {article.references.map((ref, index) => (
                    <li key={index}>{ref}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            typeof article.references === 'string' && article.references.trim() && (
              <div className={styles.referencesContainer}>
                <h3 className={styles.referencesTitle}>References</h3>
                <div className={styles.referencesText}>
                  {article.references}
                </div>
              </div>
            )
          )
        )}

        <button className={styles.backButton} onClick={() => navigate('/patient/home')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}

