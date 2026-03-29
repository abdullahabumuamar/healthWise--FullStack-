import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

/**
 * RootRedirect - Redirects users based on their authentication and role:
 * - Admins -> /admin
 * - Authenticated patients -> /patient/home
 * - Non-authenticated users -> /patient/home (landing page)
 */
export default function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  
  return <Navigate to="/patient/home" replace />
}

