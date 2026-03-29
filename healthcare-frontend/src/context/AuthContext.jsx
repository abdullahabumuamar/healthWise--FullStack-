import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import api from '../services/api'
import { 
  validateEmail, 
  validatePassword, 
  validateDateOfBirth, 
  validatePasswordMatch,
  sanitizeEmail 
} from '../utils/validation'

const AuthContext = createContext(null)

// Helper functions to get/set storage based on rememberMe preference
const getStorage = (rememberMe) => rememberMe ? localStorage : sessionStorage

const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

const getUser = () => {
  return localStorage.getItem('user') || sessionStorage.getItem('user')
}

const setAuthData = (token, userData, rememberMe) => {
  const storage = getStorage(rememberMe)
  // Clear from both storages first
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  // Set in the appropriate storage
  storage.setItem('token', token)
  storage.setItem('user', JSON.stringify(userData))
}

const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Load user from either localStorage or sessionStorage
    const savedUser = getUser()
    const token = getToken()
    if (savedUser && token) {
      try {
        return JSON.parse(savedUser)
      } catch (error) {
        // Clear corrupted data
        clearAuthData()
        return null
      }
    }
    return null
  })

  // Verify token on app load
  useEffect(() => {
    const token = getToken()
    const savedUser = getUser()
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        clearAuthData()
        setUser(null)
      }
    }
  }, [])

  const login = async (email, password, rememberMe = false) => {
    try {
      // Validate email format
      const emailValidation = validateEmail(email)
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error }
      }

      // Validate password is provided
      if (!password) {
        return { success: false, error: 'Password is required' }
      }

      // Sanitize email
      const sanitizedEmail = sanitizeEmail(email)

      const response = await api.post('/auth/login', { 
        email: sanitizedEmail, 
        password 
      })
      const { token, user: userData } = response.data
      
      // Store token and user in appropriate storage based on rememberMe
      setAuthData(token, userData, rememberMe)
      
      // Update state
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email, password, dateOfBirth, confirmPassword, rememberMe = false) => {
    try {
      // Validate required fields
      if (!email || !password || !dateOfBirth) {
        return { success: false, error: 'Please fill in all required fields' }
      }

      // Validate email format
      const emailValidation = validateEmail(email)
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error }
      }

      // Validate password strength
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error }
      }

      // Validate password confirmation match
      const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)
      if (!passwordMatchValidation.valid) {
        return { success: false, error: passwordMatchValidation.error }
      }

      // Validate date of birth
      const dateValidation = validateDateOfBirth(dateOfBirth)
      if (!dateValidation.valid) {
        return { success: false, error: dateValidation.error }
      }

      // Sanitize email
      const sanitizedEmail = sanitizeEmail(email)

      console.log('Registering user with:', { email: sanitizedEmail, dateOfBirth, passwordLength: password.length })
      
      const response = await api.post('/auth/register', { 
        email: sanitizedEmail, 
        password, 
        dateOfBirth 
      })
      
      console.log('Registration response:', response.data)
      
      const { token, user: userData } = response.data
      
      // Store token and user in appropriate storage based on rememberMe
      setAuthData(token, userData, rememberMe)
      
      // Update state
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response)
      
      let errorMessage = 'Registration failed'
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Please check if the backend is running.'
      } else {
        // Something else happened
        errorMessage = error.message || 'Registration failed'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    clearAuthData()
    setUser(null)
  }

  // Helper function to update user data in the same storage where token is stored
  const updateUserInStorage = (userData) => {
    // Determine which storage is being used
    const token = getToken()
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage
    
    if (token && storage) {
      storage.setItem('user', JSON.stringify(userData))
    }
  }

  const value = useMemo(() => ({
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUserInStorage
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}


