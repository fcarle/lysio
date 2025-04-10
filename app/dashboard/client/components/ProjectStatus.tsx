import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  status: 'in-progress' | 'completed' | 'on-hold'
  progress: number
  timeRemaining: string
}

interface ProjectStatusProps {
  projects: Project[]
}

export function ProjectStatus({ projects }: ProjectStatusProps) {
  const router = useRouter()

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleViewAllProjects = () => {
    router.push('/dashboard/client/projects')
  }

  const handleViewProjectDetails = (projectId: string) => {
    router.push(`/dashboard/client/projects?selected=${projectId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Status</h2>
        <Button variant="outline" size="sm" onClick={handleViewAllProjects}>View All Projects</Button>
      </div>
      
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>{project.timeRemaining}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewProjectDetails(project.id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 