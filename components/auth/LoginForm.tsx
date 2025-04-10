'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  baseDelay: 2000, // 2 seconds
  maxDelay: 30000, // 30 seconds
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Reset rate limiting state after a period of inactivity
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setAttemptCount(0)
      setIsRateLimited(false)
    }, 5 * 60 * 1000) // Reset after 5 minutes of inactivity

    return () => clearTimeout(resetTimer)
  }, [attemptCount])

  const calculateDelay = () => {
    return Math.min(
      RATE_LIMIT_CONFIG.baseDelay * Math.pow(2, attemptCount),
      RATE_LIMIT_CONFIG.maxDelay
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if we're rate limited
    if (isRateLimited) {
      const timeSinceLastAttempt = Date.now() - (lastAttemptTime || 0)
      const delay = calculateDelay()
      
      if (timeSinceLastAttempt < delay) {
        const remainingTime = Math.ceil((delay - timeSinceLastAttempt) / 1000)
        toast.error(`Please wait ${remainingTime} seconds before trying again`)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Check if we've exceeded max attempts
      if (attemptCount >= RATE_LIMIT_CONFIG.maxAttempts) {
        setIsRateLimited(true)
        setLastAttemptTime(Date.now())
        toast.error('Too many login attempts. Please try again later.')
        return
      }

      console.log('Attempting to sign in with email:', email)
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        
        if (signInError.message.includes('rate limit') || signInError.status === 429) {
          setAttemptCount(prev => prev + 1)
          setIsRateLimited(true)
          setLastAttemptTime(Date.now())
          
          if (attemptCount >= RATE_LIMIT_CONFIG.maxAttempts - 1) {
            toast.error('Maximum login attempts reached. Please try again later.')
          } else {
            const delay = calculateDelay()
            toast.error(`Too many attempts. Please wait ${Math.ceil(delay / 1000)} seconds before trying again.`)
          }
          return
        }
        throw signInError
      }

      // Reset rate limiting on successful login
      setAttemptCount(0)
      setIsRateLimited(false)
      setLastAttemptTime(null)

      if (!user) {
        throw new Error('No user returned from sign in')
      }

      console.log('Successfully signed in user:', user.id)
      
      // Get user's role from profiles
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        // Create a default profile if none exists
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert([{
            user_id: user.id,
            role: user.user_metadata?.role || 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError)
          throw new Error('Failed to create user profile')
        }

        profile = newProfile
      }

      console.log('Found existing profile:', profile)
      toast.success('Welcome back!')
      
      // Check for redirect URL in query parameters
      const redirectTo = searchParams.get('redirectTo')
      const redirectPath = redirectTo || (
        profile.role === 'admin'
          ? '/dashboard/admin'
          : profile.role === 'provider'
            ? '/dashboard/provider'
            : '/dashboard/client'
      )
          
      console.log('Redirecting to:', redirectPath)
      
      // Use replace instead of push to prevent back button from going back to login
      router.replace(redirectPath)
      
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to sign in')
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6 w-full max-w-md">
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isRateLimited && (
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {lastAttemptTime && `Please wait ${Math.ceil((calculateDelay() - (Date.now() - lastAttemptTime)) / 1000)} seconds before trying again`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Enter your email"
            disabled={isRateLimited}
          />
        </div>
      </div>

      <div>
        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="current-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Enter your password"
            disabled={isRateLimited}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isRateLimited}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200"
      >
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        ) : isRateLimited ? (
          'Please wait...'
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
} 