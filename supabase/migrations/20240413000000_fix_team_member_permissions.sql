-- Create function to fix team member permissions
CREATE OR REPLACE FUNCTION fix_team_member_permissions(p_email TEXT)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_team_member_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Create team member if it doesn't exist
    INSERT INTO public.team_members (user_id, email, role, status, company_id)
    SELECT 
      v_user_id,
      p_email,
      'owner',
      'active',
      v_user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.team_members WHERE user_id = v_user_id
    )
    RETURNING id INTO v_team_member_id;

    -- If team member already existed, get their ID
    IF v_team_member_id IS NULL THEN
      SELECT id INTO v_team_member_id
      FROM public.team_members
      WHERE user_id = v_user_id
      LIMIT 1;
    END IF;

    -- Delete existing permissions for this team member
    DELETE FROM public.team_member_permissions
    WHERE team_member_id = v_team_member_id;

    -- Insert default owner permissions
    INSERT INTO public.team_member_permissions (team_member_id, permission)
    VALUES
      (v_team_member_id, 'view_dashboard'),
      (v_team_member_id, 'view_projects'),
      (v_team_member_id, 'manage_projects'),
      (v_team_member_id, 'view_team'),
      (v_team_member_id, 'manage_team'),
      (v_team_member_id, 'view_settings'),
      (v_team_member_id, 'manage_settings'),
      (v_team_member_id, 'view_analytics'),
      (v_team_member_id, 'manage_analytics'),
      (v_team_member_id, 'use_ai_chat'),
      (v_team_member_id, 'invite_team_members'),
      (v_team_member_id, 'view_tasks'),
      (v_team_member_id, 'manage_tasks'),
      (v_team_member_id, 'view_all_tasks'),
      (v_team_member_id, 'manage_services'),
      (v_team_member_id, 'view_services');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION fix_team_member_permissions(TEXT) TO authenticated; 