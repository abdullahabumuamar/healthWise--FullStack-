import { useState, useEffect, Fragment, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHealthTips } from '../../context/HealthTipsContext'
import { useToast } from '../../components/common/ToastContainer'
import useAuth from '../../hooks/useAuth'
import api from '../../services/api'
import Loading from '../../components/common/Loading'
import shareIcon from '../../assets/icons/share.svg'
import savedIcon from '../../assets/icons/my-saved-icon.svg'
import styles from '../../assets/style/ShowTipDetails.module.css'
import page from '../../assets/style/Page.module.css'

export default function ShowTipDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTipById } = useHealthTips()
  const { success: showSuccess, warning: showWarning, error: showError } = useToast()
  const { isAuthenticated, user, setUser, updateUserInStorage } = useAuth()
  const [tip, setTip] = useState(null)
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

  const checkIfSaved = useCallback(async (tipId) => {
    // Only check saved status if user is authenticated
    if (!isAuthenticated || !user || !user.id) {
      setIsSaved(false)
      return
    }

    try {
      // Fetch current user data from API to check saved tips
      const response = await api.get(`/patients/${user.id}`)
      const patient = response.data
      const savedTips = patient.savedTips || [] // Array of tip IDs (strings from MongoDB)
      // Compare as strings since backend returns string IDs
      const isTipSaved = savedTips.some(savedId => String(savedId) === String(tipId))
      setIsSaved(isTipSaved)
    } catch (error) {
      console.error('Error checking if tip is saved:', error)
      setIsSaved(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    const loadTip = async () => {
      // First try to get from context
      let tipData = getTipById(id)
      
      // If not found in context, fetch from API
      if (!tipData) {
        try {
          const response = await api.get(`/tips/${id}`)
          tipData = response.data
        } catch (error) {
          console.error('Error fetching tip:', error)
          navigate('/patient/home')
          return
        }
      }
      
      if (tipData) {
        setTip(tipData)
        // Check if tip is already saved (only if user is authenticated)
        if (isAuthenticated && user) {
          checkIfSaved(tipData.id)
        }
      } else {
        // Tip not found, redirect to home
        navigate('/patient/home')
      }
    }
    
    loadTip()
  }, [id, getTipById, navigate, isAuthenticated, user, checkIfSaved])

  const handleShare = () => {
    if (!tip) return
    
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
    if (!tip) return

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
        // Save the tip - send only the ID
        const tipId = tip.id
        if (!tipId) {
          showError('Tip ID is missing. Please refresh the page.')
          setIsSaving(false)
          return
        }
        console.log('Saving tip with ID:', tipId)
        const response = await api.post(`/patients/${user.id}/save-tip`, { tipId })
        if (response.data.success) {
          setIsSaved(true)
          // Update user in context with latest saved tips
          if (response.data.patient) {
            const { password: _, ...userWithoutPassword } = response.data.patient
            setUser({ ...userWithoutPassword, role: 'patient' })
            // Update user in storage (localStorage or sessionStorage based on rememberMe)
            updateUserInStorage({ ...userWithoutPassword, role: 'patient' })
          }
          showSuccess('Tip saved successfully!')
        }
      } else {
        // Remove the tip
        const response = await api.delete(`/patients/${user.id}/save-tip/${tip.id}`)
        if (response.data.success) {
          setIsSaved(false)
          // Update user in context with latest saved tips
          if (response.data.patient) {
            const { password: _, ...userWithoutPassword } = response.data.patient
            setUser({ ...userWithoutPassword, role: 'patient' })
            // Update user in storage (localStorage or sessionStorage based on rememberMe)
            updateUserInStorage({ ...userWithoutPassword, role: 'patient' })
          }
          showSuccess('Tip removed from saved')
        }
      }
    } catch (error) {
      console.error('Error saving/removing tip:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save tip. Please try again.'
      showError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!tip) {
    return (
      <div className={page.wrap}>
        <Loading message="Loading tip..." />
      </div>
    )
  }

  return (
    <div className={page.wrap}>
      <div className={styles.content}>
        <h1 className={styles.tipTitle}>{tip.title}</h1>
        
        <div className={styles.subtitleImageWrapper}>
          {tip.subtitle && (
            <p className={styles.tipSubtitle}>{tip.subtitle}</p>
          )}

          <div className={styles.tipImageContainer}>
            <img 
              src={tip.image || 'https://via.placeholder.com/800x400?text=No+Image'} 
              alt={tip.title}
              className={styles.tipImage}
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'
              }}
            />
          </div>
        </div>

        <div className={styles.iconActions}>
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
            title={isSaved ? "Remove from saved" : "Save tip"}
          >
            <img src={savedIcon} alt="Save" className={styles.icon} />
          </button>
        </div>

        <div className={styles.tipContent}>
          <div className={styles.tipText}>{formatContent(tip.content)}</div>
        </div>

        <button className={styles.backButton} onClick={() => navigate('/patient/home')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}

