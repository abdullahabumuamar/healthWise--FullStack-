import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

/**
 * PatientRoute - Allows access to patient routes for:
 * - Non-authenticated users (landing page)
 * - Authenticated patients
 * - Redirects admins to admin dashboard
 */
export default function PatientRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  
  // If user is authenticated and is an admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  
  // Allow access for non-authenticated users (landing page) and patients
  return children
}

