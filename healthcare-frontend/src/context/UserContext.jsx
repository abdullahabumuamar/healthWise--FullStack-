import { createContext, useContext, useState, useMemo } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const value = useMemo(() => ({ profile, setProfile }), [profile])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserContext must be used within UserProvider')
  return ctx
}


