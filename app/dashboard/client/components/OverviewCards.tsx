import { Card } from '@/components/ui/card'
import { Users, Calendar, FolderOpen } from 'lucide-react'

interface OverviewCardsProps {
  stats: {
    activeProjects: number
    teamMembers: number
    upcomingDeadlines: number
    incompleteTasks: number
  }
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Active Projects Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Projects</p>
            <p className="text-2xl font-semibold">{stats.activeProjects}</p>
          </div>
        </div>
      </Card>

      {/* Team Members Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Team Members</p>
            <p className="text-2xl font-semibold">{stats.teamMembers}</p>
          </div>
        </div>
      </Card>

      {/* Upcoming Deadlines Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Upcoming Deadlines</p>
            <p className="text-2xl font-semibold">{stats.upcomingDeadlines}</p>
            <p className="text-sm text-gray-500">{stats.incompleteTasks} incomplete tasks</p>
          </div>
        </div>
      </Card>
    </div>
  )
} 