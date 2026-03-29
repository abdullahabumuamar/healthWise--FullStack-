import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const ArticlesContext = createContext()

export function ArticlesProvider({ children }) {
  // Initialize state as empty array - data comes from API only
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch articles from API on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/articles')
        if (response.data && Array.isArray(response.data)) {
          setArticles(response.data)
          console.log('ArticlesContext - Fetched articles from API:', response.data.length, 'articles')
        }
      } catch (error) {
        console.error('Error fetching articles from API:', error)
        setError('Failed to load articles. Please check your connection.')
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, []) // Only run on mount

  const addArticle = async (article) => {
    try {
      // Prepare article data for API
      const articleData = {
        ...article,
        content: article.fullContent || article.content || '',
        references: Array.isArray(article.references) 
          ? article.references 
          : (article.references ? article.references.split('\n').filter(r => r.trim()) : []),
        // date is the publish date (entered by user)
        // createdAt is automatically set when article is created
        createdAt: new Date().toISOString()
      }
      
      const response = await api.post('/articles', articleData)
      const newArticle = response.data
      
      // Update local state
      setArticles(prev => [...prev, newArticle])
      console.log('ArticlesContext - Article added via API:', newArticle)
      
      return newArticle
    } catch (error) {
      console.error('Error adding article to API:', error)
      throw error
    }
  }

  const updateArticle = async (id, updatedArticle) => {
    try {
      // Get existing article to preserve fields
      const existingArticle = articles.find(a => a.id === id)
      if (!existingArticle) {
        throw new Error('Article not found')
      }
      
      // Prepare article data for API, preserving existing fields
      const articleData = {
        ...existingArticle,
        ...updatedArticle,
        content: updatedArticle.fullContent || updatedArticle.content || existingArticle.content || '',
        references: Array.isArray(updatedArticle.references) 
          ? updatedArticle.references 
          : (updatedArticle.references 
              ? updatedArticle.references.split('\n').filter(r => r.trim()) 
              : (existingArticle.references || [])),
        // Preserve createdAt - it should never change after creation
        createdAt: existingArticle.createdAt
      }
      
      // Remove fullContent if we have content
      if (articleData.fullContent && articleData.content) {
        delete articleData.fullContent
      }
      
      const response = await api.put(`/articles/${id}`, articleData)
      const updated = response.data
      
      // Update local state
      setArticles(prev => prev.map(article => article.id === id ? updated : article))
      console.log('ArticlesContext - Article updated via API:', updated)
      
      return updated
    } catch (error) {
      console.error('Error updating article in API:', error)
      throw error
    }
  }

  const deleteArticle = async (id) => {
    try {
      await api.delete(`/articles/${id}`)
      
      // Update local state
      setArticles(prev => prev.filter(article => article.id !== id))
      console.log('ArticlesContext - Article deleted via API:', id)
    } catch (error) {
      console.error('Error deleting article from API:', error)
      throw error
    }
  }

  const getArticleById = (id) => {
    // Backend returns id as string, so compare as strings
    return articles.find(article => String(article.id) === String(id))
  }

  return (
    <ArticlesContext.Provider value={{ articles, addArticle, updateArticle, deleteArticle, getArticleById }}>
      {children}
    </ArticlesContext.Provider>
  )
}

export function useArticles() {
  const context = useContext(ArticlesContext)
  if (!context) {
    throw new Error('useArticles must be used within an ArticlesProvider')
  }
  return context
}


