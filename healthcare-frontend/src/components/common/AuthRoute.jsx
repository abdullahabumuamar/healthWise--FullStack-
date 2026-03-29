import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

/**
 * AuthRoute - Prevents authenticated users from accessing auth pages (login/register):
 * - Admins -> redirect to /admin
 * - Authenticated patients -> redirect to /patient/home
 * - Non-authenticated users -> allow access to login/register pages
 */
export default function AuthRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  
  // If user is authenticated, redirect them to their appropriate dashboard
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/patient/home" replace />
    }
  }
  
  // Allow access for non-authenticated users
  return children
}

