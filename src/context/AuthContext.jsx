import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [adminRole, setAdminRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchAdminRole(session.user.id)
      else setLoading(false)
    })

const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchAdminRole(session.user.id)
      } else {
        setAdminRole(null)
        setLoading(false)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const fetchAdminRole = async (userId) => {
    const { data } = await supabase
      .from('admin_roles')
      .select('role, name')
      .eq('user_id', userId)
      .single()
    setAdminRole(data)
    setLoading(false)
  }

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, adminRole, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)