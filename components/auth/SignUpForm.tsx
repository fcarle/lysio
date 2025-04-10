'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'provider' | 'client'>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev !== null ? prev - 1 : null)
      }, 1000)
    } else if (countdown === 0) {
      setRetryAfter(null)
      setCountdown(null)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Don't allow signup if we're in countdown
    if (countdown !== null && countdown > 0) {
      setLoading(false)
      return
    }

    try {
      console.log('Starting sign up process...')
      console.log('Attempting to sign up with email:', email)
      
      // Create the user with role in metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        console.error('Detailed sign up error:', {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
        })
        
        // Handle rate limiting error
        if (signUpError.message?.includes('security purposes')) {
          const waitTime = parseInt(signUpError.message.match(/\d+/)?.[0] || '60')
          setRetryAfter(waitTime)
          setCountdown(waitTime)
          throw new Error(`Too many signup attempts. Please wait ${waitTime} seconds before trying again.`)
        }

        // Handle SMTP error specifically
        if (signUpError.message?.includes('sending confirmation email')) {
          throw new Error('Unable to send confirmation email. Please try again or contact support if the issue persists.')
        }
        
        throw signUpError
      }

      if (!data.user) {
        throw new Error('No user returned from sign up')
      }

      console.log('User created successfully:', data.user.id)
      console.log('Confirmation email status:', data.user.confirmation_sent_at ? 'Sent' : 'Not sent')
      
      // Show success message
      toast.success(
        'Account created! Please check your email to confirm your account. ' +
        'If you don\'t see the email, please check your spam folder.'
      )
      
      // Redirect to confirmation page
      router.push('/confirm-email')
    } catch (error: any) {
      console.error('Sign up process error:', error)
      setError(error.message)
      
      // Show a more user-friendly error message
      if (error.message?.includes('sending confirmation email')) {
        toast.error(
          'We\'re having trouble sending the confirmation email. ' +
          'Please try again in a few minutes or contact support if the issue persists.'
        )
      } else {
        toast.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={loading || (countdown !== null && countdown > 0)}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={loading || (countdown !== null && countdown > 0)}
        />
        <p className="mt-1 text-sm text-gray-500">
          Password must be at least 6 characters long
        </p>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'provider' | 'client')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={loading || (countdown !== null && countdown > 0)}
        >
          <option value="client">Client</option>
          <option value="provider">Provider</option>
        </select>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {countdown !== null && countdown > 0 && (
        <div className="text-yellow-600 text-sm bg-yellow-50 p-3 rounded-md">
          Please wait {countdown} seconds before trying again
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (countdown !== null && countdown > 0)}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          (loading || (countdown !== null && countdown > 0)) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Signing up...' : 'Sign up'}
      </button>

      <p className="mt-2 text-sm text-gray-500 text-center">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
} 