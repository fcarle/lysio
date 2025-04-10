import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { TeamMember, InviteTeamMemberInput, UpdateTeamMemberInput } from '@/app/dashboard/client/types/team';
import { DEFAULT_PERMISSIONS } from '@/app/dashboard/client/types/team';
import { sendTeamInvitation } from '@/lib/email';
import { nanoid } from 'nanoid';

const supabase = createClientComponentClient<Database>();

export async function getTeamMembers() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('No authenticated user found');

  console.log('Getting team members for user:', session.user.id);

  // First get the most recent team member record for this user
  const { data: userTeamMember, error: teamMemberError } = await supabase
    .from('team_members')
    .select('company_id')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (teamMemberError) {
    console.error('Error getting user team member:', teamMemberError);
    throw teamMemberError;
  }

  console.log('Found user team member:', userTeamMember);

  // Now get all team members for this company
  const { data: teamMembers, error } = await supabase
    .from('team_members')
    .select(`
      *,
      team_member_permissions (
        permission
      ),
      team_member_responsibilities (
        responsibility
      )
    `)
    .eq('company_id', userTeamMember.company_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting team members:', error);
    throw error;
  }

  console.log('Found team members:', teamMembers);

  return teamMembers.map(member => ({
    ...member,
    permissions: member.team_member_permissions?.map(p => p.permission) || [],
    responsibilities: member.team_member_responsibilities?.map(r => r.responsibility) || []
  }));
}

export async function inviteTeamMember(input: InviteTeamMemberInput) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('No authenticated user found');

  // Start a transaction
  const { data: teamMember, error: teamMemberError } = await supabase
    .from('team_members')
    .insert([{
      company_id: session.user.id,
      email: input.email,
      role: input.role,
      status: 'pending'
    }])
    .select()
    .single();

  if (teamMemberError) throw teamMemberError;

  // Insert permissions
  const permissions = input.permissions || DEFAULT_PERMISSIONS[input.role];
  const { error: permissionsError } = await supabase
    .from('team_member_permissions')
    .insert(
      permissions.map(permission => ({
        team_member_id: teamMember.id,
        permission
      }))
    );

  if (permissionsError) throw permissionsError;

  // Insert responsibilities if provided
  if (input.responsibilities?.length) {
    const { error: responsibilitiesError } = await supabase
      .from('team_member_responsibilities')
      .insert(
        input.responsibilities.map(responsibility => ({
          team_member_id: teamMember.id,
          responsibility
        }))
      );

    if (responsibilitiesError) throw responsibilitiesError;
  }

  // Generate invitation token and create invitation record
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

  const { error: invitationError } = await supabase
    .from('team_invitations')
    .insert([{
      team_member_id: teamMember.id,
      token,
      expires_at: expiresAt.toISOString()
    }]);

  if (invitationError) throw invitationError;

  // Send invitation email
  await sendTeamInvitation(
    input.email,
    session.user.email || 'Team Owner',
    token
  );

  return teamMember;
}

export async function updateTeamMember(memberId: string, input: UpdateTeamMemberInput) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('No authenticated user found');

  // Update team member
  const { error: teamMemberError } = await supabase
    .from('team_members')
    .update({
      role: input.role,
      status: input.status
    })
    .eq('id', memberId);

  if (teamMemberError) throw teamMemberError;

  // Update permissions if provided
  if (input.permissions) {
    // Delete existing permissions
    const { error: deleteError } = await supabase
      .from('team_member_permissions')
      .delete()
      .eq('team_member_id', memberId);

    if (deleteError) throw deleteError;

    // Insert new permissions
    const { error: insertError } = await supabase
      .from('team_member_permissions')
      .insert(
        input.permissions.map(permission => ({
          team_member_id: memberId,
          permission
        }))
      );

    if (insertError) throw insertError;
  }

  // Update responsibilities if provided
  if (input.responsibilities) {
    // Delete existing responsibilities
    const { error: deleteError } = await supabase
      .from('team_member_responsibilities')
      .delete()
      .eq('team_member_id', memberId);

    if (deleteError) throw deleteError;

    // Insert new responsibilities
    const { error: insertError } = await supabase
      .from('team_member_responsibilities')
      .insert(
        input.responsibilities.map(responsibility => ({
          team_member_id: memberId,
          responsibility
        }))
      );

    if (insertError) throw insertError;
  }
}

export async function removeTeamMember(memberId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('No authenticated user found');

  // Check if user is an owner
  const isOwner = await isCompanyOwner();
  if (!isOwner) throw new Error('Only company owners can remove team members');

  // Get the team member to check if they are an owner
  const { data: teamMember, error: getError } = await supabase
    .from('team_members')
    .select('role')
    .eq('id', memberId)
    .single();

  if (getError) throw getError;
  if (teamMember.role === 'owner') throw new Error('Cannot remove the company owner');

  // Delete the team member
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function isCompanyOwner() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('No authenticated user found');

  console.log('Checking company owner status for user:', session.user.id);

  // First get or create a company
  const { data: existingCompany, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', session.user.id)
    .single();

  let companyId;
  if (companyError && companyError.code === 'PGRST116') {
    // Create new company
    console.log('Creating new company for user');
    const { data: newCompany, error: createCompanyError } = await supabase
      .from('companies')
      .insert([{
        name: `${session.user.email}'s Company`,
        owner_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (createCompanyError) {
      console.error('Error creating company:', createCompanyError);
      throw createCompanyError;
    }
    companyId = newCompany.id;
  } else if (companyError) {
    console.error('Error checking company:', companyError);
    throw companyError;
  } else {
    companyId = existingCompany.id;
  }

  console.log('Using company ID:', companyId);

  // Now check for team member record
  const { data: existingTeamMember, error: teamError } = await supabase
    .from('team_members')
    .select('id, role')
    .eq('user_id', session.user.id)
    .eq('company_id', companyId)
    .single();

  if (teamError && teamError.code === 'PGRST116') {
    // Create new team member as owner
    console.log('Creating new team member record');
    const { data: newTeamMember, error: createTeamError } = await supabase
      .from('team_members')
      .insert([{
        company_id: companyId,
        user_id: session.user.id,
        email: session.user.email,
        role: 'owner',
        status: 'active'
      }])
      .select()
      .single();

    if (createTeamError) {
      console.error('Error creating team member:', createTeamError);
      throw createTeamError;
    }

    // Insert owner permissions
    const ownerPermissions = [
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
    ] as const;

    const { error: permissionsError } = await supabase
      .from('team_member_permissions')
      .insert(
        ownerPermissions.map(permission => ({
          team_member_id: newTeamMember.id,
          permission
        }))
      );

    if (permissionsError) {
      console.error('Error creating permissions:', permissionsError);
      throw permissionsError;
    }

    return true;
  } else if (teamError) {
    console.error('Error checking team member:', teamError);
    throw teamError;
  }

  // If we found an existing team member, check if they're an owner
  if (existingTeamMember.role !== 'owner') {
    // Upgrade to owner
    console.log('Upgrading team member to owner');
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ role: 'owner' })
      .eq('id', existingTeamMember.id);

    if (updateError) {
      console.error('Error updating team member role:', updateError);
      throw updateError;
    }

    // Update permissions
    const ownerPermissions = [
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
    ] as const;

    // Delete existing permissions
    const { error: deleteError } = await supabase
      .from('team_member_permissions')
      .delete()
      .eq('team_member_id', existingTeamMember.id);

    if (deleteError) {
      console.error('Error deleting old permissions:', deleteError);
      throw deleteError;
    }

    // Insert new permissions
    const { error: permissionsError } = await supabase
      .from('team_member_permissions')
      .insert(
        ownerPermissions.map(permission => ({
          team_member_id: existingTeamMember.id,
          permission
        }))
      );

    if (permissionsError) {
      console.error('Error updating permissions:', permissionsError);
      throw permissionsError;
    }
  }

  return true;
} 