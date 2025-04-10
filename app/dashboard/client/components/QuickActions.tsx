import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CreateProjectDialog } from '../projects/components/create-project-dialog'
import InviteTeamMemberForm from './InviteTeamMemberForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function QuickActions() {
  const router = useRouter()
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const handleNewProject = () => {
    setShowNewProjectDialog(true)
  }

  const handleInviteTeam = () => {
    setShowInviteDialog(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Quick Actions</h2>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={handleNewProject}
          >
            <Plus className="h-6 w-6" />
            <span>New Project</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={handleInviteTeam}
          >
            <Users className="h-6 w-6" />
            <span>Invite Team</span>
          </Button>
        </div>
      </Card>

      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <CreateProjectDialog 
            onProjectCreated={() => {
              setShowNewProjectDialog(false)
              router.push('/dashboard/client/projects')
            }} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <InviteTeamMemberForm 
            onSuccess={() => {
              setShowInviteDialog(false)
              router.refresh()
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 