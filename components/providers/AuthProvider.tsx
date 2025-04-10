'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: any
  loading: boolean
  signOut: () => Promise<void>
  userId: string | null
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  userId: null,
})

interface AuthProviderProps {
  children: ReactNode
  redirectTo?: string
}

export function AuthProvider({ children, redirectTo = '/login' }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setUserId(currentUser?.id || null)
        setLoading(false)
        
        if (!currentUser && redirectTo) {
          router.push(redirectTo)
        }
      }
    )
    
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setUserId(currentUser?.id || null)
      setLoading(false)
      
      if (!currentUser && redirectTo) {
        router.push(redirectTo)
      }
    })
    
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router, redirectTo, supabase.auth])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserId(null)
      
      if (redirectTo) {
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }
  
  const value = {
    user,
    loading,
    signOut,
    userId,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 