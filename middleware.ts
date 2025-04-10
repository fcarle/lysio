import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/auth/')
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    // If user is not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access public route
    if (session && isPublicRoute && pathname !== '/') {
      // Get user profile to determine the correct dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      if (profile?.role) {
        const dashboardPath = profile.role === 'provider'
          ? '/dashboard/provider'
          : profile.role === 'admin'
            ? '/dashboard/admin'
            : '/dashboard/client'
        return NextResponse.redirect(new URL(dashboardPath, req.url))
      }
    }

    // For authenticated users accessing protected routes, check role-based access
    if (session && !isPublicRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      const role = profile?.role || 'client'
      
      // Check if user is trying to access a route they don't have permission for
      if (pathname.includes('/dashboard/')) {
        const routeRole = pathname.split('/dashboard/')[1]?.split('/')[0]
        if (routeRole && role !== routeRole && role !== 'admin') {
          // Redirect to appropriate dashboard
          const correctDashboard = `/dashboard/${role}`
          return NextResponse.redirect(new URL(correctDashboard, req.url))
        }
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login for protected routes
    if (!isPublicRoute) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 