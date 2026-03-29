import { lazy, Suspense } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import Loading from './Loading'

// Lazy load admin-only contexts
const UsersProviderLazy = lazy(() => 
  import('../../context/UsersContext.jsx').then(module => ({
    default: module.UsersProvider
  }))
)

/**
 * ConditionalProviders - Only loads admin contexts when user is admin
 * This reduces initial bundle size for non-admin users
 */
export function ConditionalProviders({ children }) {
  const { user } = useAuthContext()
  const isAdmin = user?.role === 'admin'

  return (
    <>
      {isAdmin ? (
        <Suspense fallback={<Loading message="Loading admin features..." />}>
          <UsersProviderLazy>
            {children}
          </UsersProviderLazy>
        </Suspense>
      ) : (
        children
      )}
    </>
  )
}

