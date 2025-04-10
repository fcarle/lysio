import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get the user's role from metadata
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role || 'client'

    if (user?.email) {
      try {
        // Call the function to fix permissions
        await supabase.rpc('fix_team_member_permissions', {
          p_email: user.email
        })
      } catch (error) {
        console.error('Error fixing permissions:', error)
      }
    }

    // Redirect based on role
    const dashboardPath = role === 'provider' 
      ? '/dashboard/provider'
      : role === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/client'

    return NextResponse.redirect(new URL(dashboardPath, requestUrl.origin))
  }

  // If no code, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
} 