'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { updateTeamMember, removeTeamMember } from '@/lib/supabase/team';
import type { TeamMember, TeamMemberRole, TeamMemberStatus } from '../types/team';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { Responsibility } from '../types/services';
import * as Icons from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  onUpdate: () => void;
  onAssignService: (memberId: string, service: Responsibility) => Promise<void>;
}

export default function TeamMembersList({ teamMembers, onUpdate, onAssignService }: TeamMembersListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Responsibility | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [assignmentTab, setAssignmentTab] = useState<"team" | "network">("team");

  const handleRoleChange = async (memberId: string, newRole: TeamMemberRole) => {
    setIsUpdating(memberId);
    try {
      await updateTeamMember(memberId, { role: newRole });
      toast.success('Team member role updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Error updating team member role:', error);
      toast.error('Failed to update team member role');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusChange = async (memberId: string, newStatus: TeamMemberStatus) => {
    setIsUpdating(memberId);
    try {
      await updateTeamMember(memberId, { status: newStatus });
      toast.success('Team member status updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Error updating team member status:', error);
      toast.error('Failed to update team member status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    setIsUpdating(memberId);
    try {
      await removeTeamMember(memberId);
      toast.success('Team member removed successfully');
      onUpdate();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleAssignService = async () => {
    if (selectedService && selectedMember) {
      await onAssignService(selectedMember, selectedService);
      setIsAssignDialogOpen(false);
      setSelectedService(null);
      setSelectedMember(null);
    }
  };

  const renderMember = (member: TeamMember) => {
    return (
      <div
        key={member.id}
        className="bg-white rounded-lg border border-slate-200 p-3 group hover:shadow-sm transition-shadow duration-200"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-blue-50 text-lysio-blue shrink-0">
              <Icons.User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm text-slate-900 truncate">{member.name}</h3>
              <p className="text-xs text-slate-500 truncate">{member.role}</p>
            </div>
          </div>
          {selectedService && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedMember(member.id);
                setIsAssignDialogOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 h-auto"
            >
              Assign
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-lysio-blue/30 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-lysio-blue/10 text-lysio-blue shrink-0">
                  <Icons.User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(value) => handleRoleChange(member.id, value as TeamMemberRole)}
                  disabled={isUpdating === member.id}
                >
                  <SelectTrigger className="w-[130px] bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={member.status}
                  onValueChange={(value) => handleStatusChange(member.id, value as TeamMemberStatus)}
                  disabled={isUpdating === member.id}
                >
                  <SelectTrigger className="w-[130px] bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(member.id)}
                  disabled={isUpdating === member.id || member.role === 'owner'}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Responsibilities</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.responsibilities?.map((resp) => (
                  <Badge 
                    key={resp} 
                    variant="secondary"
                    className="bg-lysio-blue/10 text-lysio-blue hover:bg-lysio-blue/20"
                  >
                    {resp}
                  </Badge>
                )) || (
                  <span className="text-sm text-gray-500">No responsibilities assigned</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <Icons.Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {member.permissions?.length || 0} permissions
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Service</DialogTitle>
            <DialogDescription>
              Assign the selected service to a team member
            </DialogDescription>
          </DialogHeader>

          <Tabs value={assignmentTab} onValueChange={(value) => setAssignmentTab(value as "team" | "network")}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Icons.Users className="w-4 h-4" />
                Team Members
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Icons.Sparkles className="w-4 h-4" />
                Lysio Network
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team">
              <div className="space-y-4">
                {teamMembers.map(renderMember)}
              </div>
            </TabsContent>

            <TabsContent value="network">
              <Card className="border border-blue-100 bg-blue-50/50 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icons.Sparkles className="w-5 h-5 text-lysio-blue shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-1">Find your perfect match</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Connect with experienced professionals from our network who match your requirements.
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm text-slate-600 flex items-center gap-2">
                        <Icons.Building2 className="w-4 h-4 text-lysio-blue" />
                        Industry experience in your sector
                      </li>
                      <li className="text-sm text-slate-600 flex items-center gap-2">
                        <Icons.MapPin className="w-4 h-4 text-lysio-blue" />
                        Location and timezone alignment
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
} 