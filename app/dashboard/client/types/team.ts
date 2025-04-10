import type { Responsibility } from './services';

export type TeamMemberRole = 'owner' | 'admin' | 'member';
export type TeamMemberStatus = 'pending' | 'active' | 'inactive';

export type Permission = 
  | 'view_dashboard'
  | 'view_projects'
  | 'manage_projects'
  | 'view_team'
  | 'manage_team'
  | 'view_settings'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_analytics'
  | 'use_ai_chat'
  | 'invite_team_members'
  | 'view_tasks'
  | 'manage_tasks'
  | 'view_all_tasks'
  | 'manage_services'
  | 'view_services'
  | 'view_assigned_only';

export interface TeamMember {
  id: string;
  company_id: string;
  user_id: string | null;
  role: TeamMemberRole;
  email: string;
  name: string;
  status: TeamMemberStatus;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
  responsibilities?: Responsibility[];
  assignedServices?: Responsibility[];
}

export interface InviteTeamMemberInput {
  email: string;
  role: TeamMemberRole;
  permissions: Permission[];
  responsibilities?: Responsibility[];
}

export interface UpdateTeamMemberInput {
  role?: TeamMemberRole;
  status?: TeamMemberStatus;
  permissions?: Permission[];
  responsibilities?: Responsibility[];
}

export const DEFAULT_PERMISSIONS: Record<TeamMemberRole, Permission[]> = {
  owner: [
    'view_dashboard',
    'view_projects',
    'manage_projects',
    'view_team',
    'manage_team',
    'view_settings',
    'manage_settings',
    'view_analytics',
    'manage_analytics',
    'use_ai_chat',
    'invite_team_members',
    'view_tasks',
    'manage_tasks',
    'view_all_tasks',
    'manage_services',
    'view_services'
  ],
  admin: [
    'view_dashboard',
    'view_projects',
    'manage_projects',
    'view_team',
    'view_settings',
    'view_analytics',
    'use_ai_chat',
    'view_tasks',
    'manage_tasks',
    'view_all_tasks',
    'view_services'
  ],
  member: [
    'view_dashboard',
    'view_projects',
    'view_tasks',
    'view_services',
    'view_assigned_only'
  ]
};

// Predefined permission sets for common roles
export const PREDEFINED_PERMISSION_SETS: Record<string, {
  name: string;
  description: string;
  permissions: Permission[];
}> = {
  freelancer: {
    name: 'Freelancer',
    description: 'Can only see and work on assigned projects and tasks',
    permissions: [
      'view_dashboard',
      'view_tasks',
      'view_assigned_only'
    ]
  },
  marketing_agency: {
    name: 'Marketing Agency',
    description: 'Can view and manage marketing-related projects and services',
    permissions: [
      'view_dashboard',
      'view_projects',
      'view_team',
      'view_tasks',
      'manage_tasks',
      'view_services',
      'manage_services'
    ]
  },
  employee: {
    name: 'Employee',
    description: 'Standard employee with access to company projects and tasks',
    permissions: [
      'view_dashboard',
      'view_projects',
      'view_team',
      'view_tasks',
      'manage_tasks',
      'view_services'
    ]
  },
  contractor: {
    name: 'Contractor',
    description: 'External contractor with limited access to specific projects',
    permissions: [
      'view_dashboard',
      'view_projects',
      'view_tasks',
      'manage_tasks',
      'view_assigned_only'
    ]
  },
  client: {
    name: 'Client',
    description: 'Client with read-only access to their projects',
    permissions: [
      'view_dashboard',
      'view_projects',
      'view_tasks',
      'view_services',
      'view_assigned_only'
    ]
  }
}; 