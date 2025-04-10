'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, LineChart, Users, Briefcase, FileText, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalClients: 0,
    totalCaseStudies: 0,
    activeProviders: 0,
    activeClients: 0,
    completedCaseStudies: 0,
    pendingCaseStudies: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: totalUsers },
          { count: totalProviders },
          { count: totalClients },
          { count: totalCaseStudies },
          { count: activeProviders },
          { count: activeClients },
          { count: completedCaseStudies },
          { count: pendingCaseStudies }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
          supabase.from('case_studies').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider').eq('status', 'active'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client').eq('status', 'active'),
          supabase.from('case_studies').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('case_studies').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        setStats({
          totalUsers: totalUsers || 0,
          totalProviders: totalProviders || 0,
          totalClients: totalClients || 0,
          totalCaseStudies: totalCaseStudies || 0,
          activeProviders: activeProviders || 0,
          activeClients: activeClients || 0,
          completedCaseStudies: completedCaseStudies || 0,
          pendingCaseStudies: pendingCaseStudies || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active: {stats.activeClients + stats.activeProviders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProviders}</div>
            <p className="text-xs text-muted-foreground">
              Active: {stats.activeProviders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active: {stats.activeClients}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Studies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCaseStudies}</div>
            <p className="text-xs text-muted-foreground">
              Completed: {stats.completedCaseStudies}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Study Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span>Completed</span>
                </div>
                <span className="font-medium">{stats.completedCaseStudies}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  <span>Pending</span>
                </div>
                <span className="font-medium">{stats.pendingCaseStudies}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  <span>Active Providers</span>
                </div>
                <span className="font-medium">{stats.activeProviders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                  <span>Active Clients</span>
                </div>
                <span className="font-medium">{stats.activeClients}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 