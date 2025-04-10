'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Network } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTeamMembers, isCompanyOwner, updateTeamMember } from '@/lib/supabase/team';
import type { TeamMember, Responsibility, TeamMemberRole, TeamMemberStatus } from '../types/team';
import InviteTeamMemberForm from '../components/InviteTeamMemberForm';
import TeamMembersList from '../components/TeamMembersList';
import TeamNetwork from '../components/TeamNetwork';
import ServiceBucket from '../components/ServiceBucket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function TeamPageContent() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadTeamMembers();
    checkOwnerStatus();
  }, []);

  const loadTeamMembers = async () => {
    try {
      console.log('Starting to load team members...');
      const data = await getTeamMembers();
      console.log('Loaded team members:', data);
      
      // Transform the data to match the TeamMember interface
      // Use type assertion to ensure the data conforms to TeamMember[]
      const formattedMembers = Array.isArray(data) ? data.map((item: any) => {
        // Ensure each member has all required fields from TeamMember interface
        const member: TeamMember = {
          id: item.id || '',
          company_id: item.company_id || '',
          user_id: item.user_id,
          role: (item.role || 'member') as TeamMemberRole,
          email: item.email || '',
          name: item.name || '',
          status: (item.status || 'active') as TeamMemberStatus,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          // Handle optional fields
          permissions: item.permissions || [],
          responsibilities: item.responsibilities || 
            (item.team_member_responsibilities?.map((r: any) => r.responsibility_name) || [])
        };
        return member;
      }) : [];
      
      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const checkOwnerStatus = async () => {
    try {
      console.log('Checking owner status...');
      const owner = await isCompanyOwner();
      console.log('Owner status:', owner);
      setIsOwner(owner);
    } catch (error) {
      console.error('Error checking owner status:', error);
    }
  };

  const handleAssignService = async (memberId: string, responsibility: Responsibility) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const updatedResponsibilities = [...(member.responsibilities || []), responsibility];
    await updateTeamMember(memberId, { responsibilities: updatedResponsibilities });
    await loadTeamMembers();
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-6 gap-4 items-center py-4 border-b border-gray-200">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your team members and their roles</p>
        </div>
        {isOwner && (
          <Button 
            onClick={() => setShowInviteForm(true)}
            className="bg-lysio-blue hover:bg-lysio-blue/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite Team Member
          </Button>
        )}
      </div>

      {showInviteForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="w-full border-lysio-blue/20">
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <InviteTeamMemberForm
                onSuccess={() => {
                  setShowInviteForm(false);
                  loadTeamMembers();
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="w-full space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lysio-blue/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-lysio-blue" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                  <p className="text-gray-500 mb-4">Start by inviting your first team member</p>
                  {isOwner && (
                    <Button 
                      onClick={() => setShowInviteForm(true)}
                      variant="outline"
                      className="border-lysio-blue text-lysio-blue hover:bg-lysio-blue/10"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Invite Team Member
                    </Button>
                  )}
                </div>
              ) : (
                <TeamMembersList
                  teamMembers={teamMembers}
                  onUpdate={loadTeamMembers}
                  onAssignService={handleAssignService}
                />
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <ServiceBucket
              teamMembers={teamMembers}
              onAssignService={handleAssignService}
            />
          </div>
        </TabsContent>
        <TabsContent value="network" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Team Network</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lysio-blue/10 flex items-center justify-center">
                    <Network className="w-8 h-8 text-lysio-blue" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team members to display</h3>
                  <p className="text-gray-500">Add team members to see the network visualization</p>
                </div>
              ) : (
                <TeamNetwork teamMembers={teamMembers} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
} 