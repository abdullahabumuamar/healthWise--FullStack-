import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { useToast } from './ToastContainer'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const { warning } = useToast()
  const hasShownWarning = useRef(false)
  
  useEffect(() => {
    if (!isAuthenticated && !hasShownWarning.current) {
      warning('Please log in to access this page')
      hasShownWarning.current = true
    }
  }, [isAuthenticated, warning])
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  
  // Reset warning flag when authenticated
  if (isAuthenticated && hasShownWarning.current) {
    hasShownWarning.current = false
  }
  
  return children
}

