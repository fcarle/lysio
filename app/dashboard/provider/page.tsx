'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Settings, Briefcase, UserCircle } from 'lucide-react'

interface ProfileProgress {
  total: number
  completed: number
  percentage: number
  items: {
    name: string
    completed: boolean
    icon: any
  }[]
}

export default function ProviderDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<ProfileProgress>({
    total: 0,
    completed: 0,
    percentage: 0,
    items: []
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          throw error || new Error('User not found')
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          // Try to create profile if it doesn't exist
          const userRole = user.user_metadata?.role || 'provider'
          const { error: createProfileError } = await supabase
            .from('profiles')
            .upsert([
              {
                user_id: user.id,
                role: userRole,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single()

          if (createProfileError) {
            console.error('Profile creation error:', createProfileError)
            throw new Error('Failed to create profile')
          }

          toast.success('Welcome! Your account has been set up.')
          setUser(user)
          return
        }

        if (!profile || profile.role !== 'provider') {
          toast.error('You do not have access to the provider dashboard')
          router.replace('/login')
          return
        }

        setUser(user)

        // Get case studies count
        const { count: caseStudiesCount } = await supabase
          .from('case_studies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Calculate profile completion
        const items = [
          {
            name: 'Basic Profile',
            completed: Boolean(profile.provider_type && profile.website_url),
            icon: UserCircle
          },
          {
            name: 'Services',
            completed: Boolean(profile.services && profile.services.length > 0),
            icon: Briefcase
          },
          {
            name: 'Location',
            completed: Boolean(profile.based_country && profile.based_city),
            icon: Settings
          },
          {
            name: 'Case Studies',
            completed: Boolean(caseStudiesCount && caseStudiesCount > 0),
            icon: Trophy
          }
        ]

        const completed = items.filter(item => item.completed).length
        const percentage = Math.round((completed / items.length) * 100)

        setProgress({
          total: items.length,
          completed,
          percentage,
          items
        })
      } catch (error) {
        console.error('Dashboard error:', error)
        toast.error('Please log in to access this page')
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router, supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>
      
      {/* Profile Progress Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.items.map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    item.completed
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${
                    item.completed ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.completed && (
                    <span className="ml-auto text-green-500">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
        <p className="text-gray-600">Email: {user?.email}</p>
      </div>
    </div>
  )
} 