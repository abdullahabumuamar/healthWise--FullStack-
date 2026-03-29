import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { useHealthTips } from '../../context/HealthTipsContext'
import { useArticles } from '../../context/ArticlesContext'
import api from '../../services/api'
import FilterButtons from './FilterButtons'
import { formatDateLong } from '../../utils/dateUtils'
import Loading from '../common/Loading'
import styles from '../../assets/style/Profile.module.css'
import homeStyles from '../../assets/style/Home.module.css'
import page from '../../assets/style/Page.module.css'

export default function SavedItems() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [savedTipIds, setSavedTipIds] = useState([])
  const [savedArticleIds, setSavedArticleIds] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated, setUser, updateUserInStorage } = useAuth()
  const { tips } = useHealthTips()
  const { articles } = useArticles()
  const navigate = useNavigate()

  const loadSavedItems = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await api.get(`/patients/${user.id}`)
      const patient = response.data
      
      // Save only the IDs
      setSavedTipIds(patient.savedTips || [])
      setSavedArticleIds(patient.savedArticles || [])
    } catch (error) {
      console.error('Error loading saved items:', error)
      setSavedTipIds([])
      setSavedArticleIds([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Map saved IDs to full tip/article objects from contexts
  // Compare as strings since backend returns string IDs
  const savedTips = savedTipIds
    .map(tipId => tips.find(tip => String(tip.id) === String(tipId)))
    .filter(tip => tip !== undefined) // Filter out any tips that don't exist

  const savedArticles = savedArticleIds
    .map(articleId => articles.find(article => String(article.id) === String(articleId)))
    .filter(article => article !== undefined) // Filter out any articles that don't exist

  // Load saved items from API
  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      loadSavedItems()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, loadSavedItems])


  // Combine tips and articles with category info
  const allSavedItems = [
    ...savedTips.map(tip => ({ ...tip, category: 'LIVING HEALTHY', type: 'tip' })),
    ...savedArticles.map(article => ({ ...article, category: 'HEALTH ARTICLES', type: 'article' }))
  ]

  // Filter saved items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? allSavedItems 
    : allSavedItems.filter(item => item.category === selectedCategory)

  const handleRemove = async (item, e) => {
    e.stopPropagation()
    
    if (!user || !user.id) return

    try {
      if (item.type === 'tip') {
        const response = await api.delete(`/patients/${user.id}/save-tip/${item.id}`)
        if (response.data.success) {
          // Update saved tip IDs
          const updatedTipIds = savedTipIds.filter(tipId => tipId !== item.id)
          setSavedTipIds(updatedTipIds)
          // Update user in context
          if (response.data.patient) {
            const { password: _, ...userWithoutPassword } = response.data.patient
            setUser({ ...userWithoutPassword, role: 'patient' })
            // Update user in storage (localStorage or sessionStorage based on rememberMe)
            updateUserInStorage({ ...userWithoutPassword, role: 'patient' })
          }
        }
      } else if (item.type === 'article') {
        const response = await api.delete(`/patients/${user.id}/save-article/${item.id}`)
        if (response.data.success) {
          // Update saved article IDs
          const updatedArticleIds = savedArticleIds.filter(articleId => articleId !== item.id)
          setSavedArticleIds(updatedArticleIds)
          // Update user in context
          if (response.data.patient) {
            const { password: _, ...userWithoutPassword } = response.data.patient
            setUser({ ...userWithoutPassword, role: 'patient' })
            // Update user in storage (localStorage or sessionStorage based on rememberMe)
            updateUserInStorage({ ...userWithoutPassword, role: 'patient' })
          }
        }
      }
    } catch (error) {
      console.error('Error removing saved item:', error)
    }
  }

  const handleTipClick = (tipId) => {
    navigate(`/patient/tip/${tipId}`)
  }

  const handleArticleClick = (articleId) => {
    navigate(`/patient/article/${articleId}`)
  }

  if (loading) {
    return (
      <div className={page.wrap}>
        <Loading message="Loading saved items..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={page.wrap}>
        <h3 className={styles.topTitle}>Saved</h3>
        <div className={homeStyles.emptyState}>
          <p>Please log in to view your saved items.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={page.wrap}>
      <h3 className={styles.topTitle}>Saved</h3>
      
      {/* Category Filter Buttons */}
      <FilterButtons 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        savedItems={allSavedItems}
      />

      {filteredItems.length > 0 ? (
        <>
          <div className={page.content}>
            <div className={styles.sectionHeader} style={{ marginTop: '24px', marginBottom: '8px' }}>
              <h4 className={styles.sectionTitle}>
                {selectedCategory === 'all' ? 'ALL SAVED ITEMS' : selectedCategory}
              </h4>
              <span className={styles.articleCount}>{filteredItems.length} Saved</span>
            </div>

            {/* Display Tips with HomePage style */}
            {filteredItems.filter(item => item.type === 'tip').length > 0 && (
              <div className={homeStyles.cards} style={{ marginTop: '24px' }}>
                {filteredItems
                  .filter(item => item.type === 'tip')
                  .map(tip => (
                    <div 
                      key={tip.id} 
                      className={homeStyles.card}
                      onClick={() => handleTipClick(tip.id)}
                      style={{ position: 'relative' }}
                    >
                      <img 
                        className={homeStyles.cardImage} 
                        src={tip.image || 'https://via.placeholder.com/400x200?text=No+Image'} 
                        alt={tip.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'
                        }}
                      />
                      <div className={homeStyles.cardTitle}>{tip.title}</div>
                      <button
                        onClick={(e) => handleRemove(tip, e)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          zIndex: 3,
                          color: '#dc2626',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.2s ease-in-out',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dc2626'
                          e.currentTarget.style.color = '#fff'
                          e.currentTarget.style.transform = 'scale(1.05)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'
                          e.currentTarget.style.color = '#dc2626'
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Display Articles with HomePage style */}
            {filteredItems.filter(item => item.type === 'article').length > 0 && (
              <div className={homeStyles.articlesGrid} style={{ marginTop: '24px' }}>
                {filteredItems
                  .filter(item => item.type === 'article')
                  .map(article => (
                    <div 
                      key={article.id} 
                      className={homeStyles.articleCard}
                      onClick={() => handleArticleClick(article.id)}
                      style={{ position: 'relative' }}
                    >
                      <img 
                        src={article.image || 'https://via.placeholder.com/400x250?text=No+Image'} 
                        alt={article.title}
                        className={homeStyles.articleCardImage}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x250?text=No+Image'
                        }}
                      />
                      <div className={homeStyles.articleContent}>
                        <span className={homeStyles.articleDate}>{formatDateLong(article.date)}</span>
                        <h3 className={homeStyles.articleTitle}>{article.title}</h3>
                        <p className={homeStyles.articleExcerpt}>{article.shortDescription}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <button 
                            className={homeStyles.readMoreBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArticleClick(article.id)
                            }}
                          >
                            Read More →
                          </button>
                          <button
                            onClick={(e) => handleRemove(article, e)}
                            style={{
                              background: 'rgba(220, 38, 38, 0.1)',
                              border: '1px solid rgba(220, 38, 38, 0.2)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              color: '#dc2626',
                              padding: '8px 14px',
                              transition: 'all 0.2s ease-in-out',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#dc2626'
                              e.currentTarget.style.color = '#fff'
                              e.currentTarget.style.borderColor = '#dc2626'
                              e.currentTarget.style.transform = 'translateY(-1px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.25)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'
                              e.currentTarget.style.color = '#dc2626'
                              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={homeStyles.emptyState}>
          <p>No saved items yet. Start saving articles and tips to see them here!</p>
        </div>
      )}
    </div>
  )
}

