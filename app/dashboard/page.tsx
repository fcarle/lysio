'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">Loading...</div>
        <div className="text-gray-600">Please wait while we set up your dashboard</div>
      </div>
    </div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <p className="text-gray-600">Email: {user.email}</p>
        </div>
      </div>
    </div>
  )
} 