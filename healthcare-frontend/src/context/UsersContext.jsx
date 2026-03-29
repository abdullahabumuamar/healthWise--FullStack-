import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const UsersContext = createContext()

export function UsersProvider({ children }) {
  // Initialize state as empty array - data comes from API only
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch users (patients) from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/patients')
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data)
          console.log('UsersContext - Fetched users from API:', response.data.length, 'users')
        }
      } catch (error) {
        console.error('Error fetching users from API:', error)
        setError('Failed to load users. Please check your connection.')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, []) // Only run on mount

  const addUser = async (user) => {
    try {
      const userData = {
        email: user.email,
        password: user.password || 'defaultPassword123',
        dateOfBirth: user.dob || user.dateOfBirth,
        gender: user.gender || null,
        // createdAt is the full timestamp (for accurate sorting and display)
        createdAt: new Date().toISOString(),
        savedTips: [],
        savedArticles: [],
        role: 'patient'
      }
      
      const response = await api.post('/patients', userData)
      const newUser = response.data
      
      // Update local state
      setUsers(prev => [...prev, newUser])
      console.log('UsersContext - User added via API:', newUser)
      
      return newUser
    } catch (error) {
      console.error('Error adding user to API:', error)
      throw error
    }
  }

  const updateUser = async (id, updatedUser) => {
    try {
      // Get existing user from API to ensure we have all fields including password
      const existingUserResponse = await api.get(`/patients/${id}`)
      const existingUser = existingUserResponse.data
      
      if (!existingUser) {
        throw new Error('User not found')
      }
      
      // Prepare user data, preserving existing fields
      const userData = {
        ...existingUser,
        email: updatedUser.email !== undefined ? updatedUser.email : existingUser.email,
        dateOfBirth: updatedUser.dateOfBirth || updatedUser.dob || existingUser.dateOfBirth,
        gender: updatedUser.gender !== undefined ? updatedUser.gender : existingUser.gender,
        // Preserve createdAt - it should never change after creation
        createdAt: existingUser.createdAt,
        savedTips: existingUser.savedTips || [],
        savedArticles: existingUser.savedArticles || []
      }
      
      // Only update password if provided and not empty
      // If password is not provided or empty, keep the existing password
      if (updatedUser.password && updatedUser.password.trim() !== '') {
        userData.password = updatedUser.password
      } else {
        // Keep existing password - use the one from API
        // This ensures the password is preserved when field is left blank
        userData.password = existingUser.password
      }
      
      // Remove dob if we have dateOfBirth
      if (userData.dob) {
        delete userData.dob
      }
      
      const response = await api.put(`/patients/${id}`, userData)
      const updated = response.data
      
      // Update local state (without password for security)
      const updatedForState = { ...updated }
      delete updatedForState.password
      setUsers(prev => prev.map(user => user.id === id ? updatedForState : user))
      console.log('UsersContext - User updated via API:', updatedForState)
      
      return updated
    } catch (error) {
      console.error('Error updating user in API:', error)
      throw error
    }
  }

  const deleteUser = async (id) => {
    try {
      await api.delete(`/patients/${id}`)
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== id))
      console.log('UsersContext - User deleted via API:', id)
    } catch (error) {
      console.error('Error deleting user from API:', error)
      throw error
    }
  }

  const clearAllUsers = () => {
    setUsers([])
  }

  const getUserById = (id) => {
    return users.find(user => user.id === parseInt(id))
  }

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, getUserById, clearAllUsers }}>
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider')
  }
  return context
}


