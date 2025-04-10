'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { OverviewCards } from './components/OverviewCards'
import { ProjectStatus } from './components/ProjectStatus'
import { QuickActions } from './components/QuickActions'
import { LysioIntelligence } from './components/LysioIntelligence'
import { useAuth } from '@/components/providers/AuthProvider'
import { useProjects } from '@/lib/queries'

// Mock data for demonstration
const mockStats = {
  activeProjects: 5,
  teamMembers: 12,
  upcomingDeadlines: 3,
  recentActivities: 8
}

const mockProjects = [
  {
    id: '1',
    name: 'Summer Campaign',
    status: 'in-progress' as const,
    progress: 65,
    deadline: 'Jun 30, 2024',
    teamSize: 4,
    timeRemaining: '2 weeks'
  },
  {
    id: '2',
    name: 'Product Launch',
    status: 'completed' as const,
    progress: 100,
    deadline: 'Mar 15, 2024',
    teamSize: 6,
    timeRemaining: 'Completed'
  },
  {
    id: '3',
    name: 'Website Redesign',
    status: 'on-hold' as const,
    progress: 30,
    deadline: 'Jul 15, 2024',
    teamSize: 3,
    timeRemaining: '3 months'
  }
]

const mockActivities = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      initials: 'JD'
    },
    action: 'commented on',
    target: 'Summer Campaign',
    timestamp: '2 hours ago',
    type: 'comment' as const
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      initials: 'JS'
    },
    action: 'uploaded',
    target: 'Product Launch Plan',
    timestamp: '4 hours ago',
    type: 'file' as const
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      initials: 'MJ'
    },
    action: 'joined',
    target: 'Website Redesign',
    timestamp: '1 day ago',
    type: 'member' as const
  }
]

interface DashboardStats {
  activeProjects: number
  teamMembers: number
  upcomingDeadlines: number
  incompleteTasks: number
}

export default function ClientDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    teamMembers: 0,
    upcomingDeadlines: 0,
    incompleteTasks: 0
  })
  
  const { user, userId, loading: authLoading } = useAuth()
  const { data: projects = [], isLoading: projectsLoading } = useProjects(userId)
  const supabase = createClientComponentClient()

  // Calculate stats based on projects data
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      const today = new Date();
      
      const activeProjects = projects?.filter(project => 
        project.status === 'active' || project.status === 'in_progress'
      ) || []
      
      const projectsWithDeadlines = projects?.filter(project => 
        project.deadline && new Date(project.deadline) > today
      ) || []
      
      let incompleteTasks = 0;
      projects.forEach(project => {
        if (project.tasks) {
          incompleteTasks += project.tasks.filter(task => 
            task.status !== 'completed'
          ).length;
        }
      });
      
      // Set the stats
      setStats({
        activeProjects: activeProjects.length,
        teamMembers: 1, // Assuming teamMembers is always 1 for now
        upcomingDeadlines: projectsWithDeadlines.length,
        incompleteTasks: incompleteTasks
      });
    }
    
    setLoading(authLoading || projectsLoading);
  }, [projects, projectsLoading, authLoading]);

  // Helper function to calculate time remaining
  function getTimeRemaining(deadline: string) {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    
    if (deadlineDate < today) {
      return 'Overdue'
    }
    
    const days = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (days > 30) {
      const months = Math.floor(days / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    }
    return `${days} days`
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <OverviewCards stats={stats} />
          <LysioIntelligence />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <QuickActions />
          <ProjectStatus projects={projects} />
        </div>
      </div>
    </div>
  )
} 