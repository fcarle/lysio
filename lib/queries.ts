import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Hook to fetch projects with all related data
 */
export function useProjects(userId) {
  return useQuery({
    queryKey: ['projects', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tasks(*),
          project_team_members(
            team_members(id, email, role, user_id)
          ),
          project_timeline_events(*),
          project_budget_breakdown(*)
        `)
        .eq('company_id', userId);
      
      if (error) throw error;
      
      // Transform data to match expected structure
      return data.map(project => ({
        ...project,
        tasks: project.project_tasks || [],
        team: (project.project_team_members || []).flatMap(member => 
          member.team_members.map(tm => ({
            id: tm.id,
            email: tm.email,
            role: tm.role,
            avatar: tm.email.charAt(0).toUpperCase()
          }))
        ),
        timeline: project.project_timeline_events || [],
        budgetBreakdown: project.project_budget_breakdown || []
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch team members with their permissions and responsibilities
 */
export function useTeamMembers(userId) {
  return useQuery({
    queryKey: ['teamMembers', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          team_member_permissions(permission),
          team_member_responsibilities(responsibility)
        `)
        .eq('company_id', userId);
      
      if (error) throw error;
      
      return data?.map(member => ({
        ...member,
        responsibilities: member.team_member_responsibilities?.map(r => r.responsibility) || []
      })) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch company settings
 */
export function useCompanySettings(userId) {
  return useQuery({
    queryKey: ['companySettings', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('company_settings')
        .select('name, industry, about, location, budget, currency, budget_frequency, targeting, marketing_goal')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found
          return null;
        }
        throw error;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 