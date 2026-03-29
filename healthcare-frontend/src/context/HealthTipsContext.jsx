import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const HealthTipsContext = createContext()

export function HealthTipsProvider({ children }) {
  // Initialize state as empty array - data comes from API only
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch tips from API on mount
  useEffect(() => {
    const fetchTips = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/tips')
        if (response.data && Array.isArray(response.data)) {
          setTips(response.data)
          console.log('HealthTipsContext - Fetched tips from API:', response.data.length, 'tips')
        }
      } catch (error) {
        console.error('Error fetching tips from API:', error)
        setError('Failed to load health tips. Please check your connection.')
        setTips([])
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, []) // Only run on mount

  const addTip = async (tip) => {
    try {
      const tipData = {
        ...tip,
        createdAt: new Date().toISOString()
      }
      
      const response = await api.post('/tips', tipData)
      const newTip = response.data
      
      // Update local state
      setTips(prev => [...prev, newTip])
      console.log('HealthTipsContext - Tip added via API:', newTip)
      
      return newTip
    } catch (error) {
      console.error('Error adding tip to API:', error)
      throw error
    }
  }

  const updateTip = async (id, updatedTip) => {
    try {
      // Get existing tip to preserve fields
      const existingTip = tips.find(t => t.id === id)
      if (!existingTip) {
        throw new Error('Tip not found')
      }
      
      // Prepare tip data, preserving existing fields
      const tipData = {
        ...existingTip,
        ...updatedTip
      }
      
      const response = await api.put(`/tips/${id}`, tipData)
      const updated = response.data
      
      // Update local state
      setTips(prev => prev.map(tip => tip.id === id ? updated : tip))
      console.log('HealthTipsContext - Tip updated via API:', updated)
      
      return updated
    } catch (error) {
      console.error('Error updating tip in API:', error)
      throw error
    }
  }

  const deleteTip = async (id) => {
    try {
      await api.delete(`/tips/${id}`)
      
      // Update local state
      setTips(prev => prev.filter(tip => tip.id !== id))
      console.log('HealthTipsContext - Tip deleted via API:', id)
    } catch (error) {
      console.error('Error deleting tip from API:', error)
      throw error
    }
  }

  const getTipById = (id) => {
    // Backend returns id as string, so compare as strings
    return tips.find(tip => String(tip.id) === String(id))
  }

  return (
    <HealthTipsContext.Provider value={{ tips, addTip, updateTip, deleteTip, getTipById }}>
      {children}
    </HealthTipsContext.Provider>
  )
}

export function useHealthTips() {
  const context = useContext(HealthTipsContext)
  if (!context) {
    throw new Error('useHealthTips must be used within a HealthTipsProvider')
  }
  return context
}


