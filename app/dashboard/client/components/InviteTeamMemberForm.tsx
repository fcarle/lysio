'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import { inviteTeamMember } from '@/lib/supabase/team';
import type { TeamMemberRole, Permission } from '../types/team';
import { DEFAULT_PERMISSIONS, PREDEFINED_PERMISSION_SETS } from '../types/team';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'member'] as const),
  permissions: z.array(z.string()).min(1, 'Select at least one permission')
});

type FormData = z.infer<typeof formSchema>;

interface InviteTeamMemberFormProps {
  onSuccess: () => void;
}

export default function InviteTeamMemberForm({ onSuccess }: InviteTeamMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissionSet, setSelectedPermissionSet] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'member',
      permissions: DEFAULT_PERMISSIONS.member
    }
  });

  const selectedRole = watch('role');
  const selectedPermissions = watch('permissions');

  const hasRestrictedVisibility = selectedPermissions.includes('view_assigned_only');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await inviteTeamMember({
        email: data.email,
        role: data.role,
        permissions: data.permissions as Permission[]
      });
      toast.success('Team member invited successfully');
      onSuccess();
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to invite team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (role: TeamMemberRole) => {
    setValue('role', role);
    setValue('permissions', DEFAULT_PERMISSIONS[role]);
    setSelectedPermissionSet(null);
  };

  const handlePermissionSetChange = (setKey: string) => {
    setSelectedPermissionSet(setKey);
    const permissionSet = PREDEFINED_PERMISSION_SETS[setKey];
    setValue('permissions', permissionSet.permissions);
  };

  const togglePermission = (permission: Permission) => {
    const currentPermissions = watch('permissions');
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    setValue('permissions', newPermissions);
    setSelectedPermissionSet(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={selectedRole}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Permission Sets</Label>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Preset Roles</TabsTrigger>
            <TabsTrigger value="custom">Custom Permissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PREDEFINED_PERMISSION_SETS).map(([key, set]) => (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all ${
                    selectedPermissionSet === key 
                      ? 'border-lysio-blue ring-1 ring-lysio-blue' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handlePermissionSetChange(key)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{set.name}</CardTitle>
                    <CardDescription className="text-xs">{set.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {set.permissions.slice(0, 3).map(permission => (
                        <span 
                          key={permission} 
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                        >
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                      {set.permissions.length > 3 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          +{set.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(DEFAULT_PERMISSIONS).map(([role, permissions]) => (
                <div key={role} className="space-y-2">
                  <h4 className="font-medium capitalize">{role} Permissions</h4>
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={watch('permissions').includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {errors.permissions && (
          <p className="text-sm text-red-500">{errors.permissions.message}</p>
        )}
        
        {hasRestrictedVisibility && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This team member will only be able to see projects and tasks they are directly assigned to.
              They won't have access to other team members' projects or tasks.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Selected Permissions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedPermissions.map(permission => (
                  <span 
                    key={permission} 
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Inviting...' : 'Invite Team Member'}
      </Button>
    </form>
  );
} 