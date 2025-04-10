'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if we have a confirmation token
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (type === 'signup' && token) {
          // Get session
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error || !user) {
            throw error || new Error('No user found')
          }

          // Get user's role from metadata
          const role = user.user_metadata?.role || 'client'

          // Try to create/verify profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              {
                user_id: user.id,
                role: role,
                created_at: new Date().toISOString()
              }
            ])

          if (profileError) {
            console.error('Profile error:', profileError)
          }

          // For clients, set up team member record and permissions
          if (role === 'client') {
            try {
              // Create team member record
              const { data: teamMember, error: teamError } = await supabase
                .from('team_members')
                .insert([{
                  company_id: user.id,
                  user_id: user.id,
                  email: user.email,
                  role: 'owner',
                  status: 'active'
                }])
                .select()
                .single()

              if (teamError) throw teamError

              // Set up default permissions
              const defaultPermissions = [
                'view_dashboard',
                'view_projects',
                'manage_projects',
                'view_team',
                'manage_team',
                'view_settings',
                'manage_settings',
                'view_analytics',
                'manage_analytics',
                'use_ai_chat',
                'invite_team_members',
                'view_tasks',
                'manage_tasks',
                'view_all_tasks',
                'manage_services',
                'view_services'
              ]

              const { error: permissionsError } = await supabase
                .from('team_member_permissions')
                .insert(
                  defaultPermissions.map(permission => ({
                    team_member_id: teamMember.id,
                    permission
                  }))
                )

              if (permissionsError) throw permissionsError
            } catch (error) {
              console.error('Error setting up team member:', error)
              // Don't block the confirmation process if this fails
            }
          }

          // Redirect based on role
          toast.success('Email confirmed successfully!')
          router.push(role === 'provider' ? '/dashboard/provider' : '/dashboard/client')
          return
        }

        setIsProcessing(false)
      } catch (error) {
        console.error('Confirmation error:', error)
        setIsProcessing(false)
      }
    }

    handleEmailConfirmation()
  }, [router, searchParams, supabase])

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Confirming your email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent you an email with a link to confirm your account. Please check your inbox and click the verification link.
          </p>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive an email?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                Return to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 