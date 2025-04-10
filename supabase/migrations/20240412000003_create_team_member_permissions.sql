-- Create team_member_permissions table
CREATE TABLE IF NOT EXISTS public.team_member_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(team_member_id, permission)
);

-- Enable Row Level Security
ALTER TABLE public.team_member_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own team member permissions"
  ON public.team_member_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = team_member_permissions.team_member_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own team member permissions"
  ON public.team_member_permissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = team_member_permissions.team_member_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own team member permissions"
  ON public.team_member_permissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = team_member_permissions.team_member_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX team_member_permissions_team_member_id_idx ON public.team_member_permissions(team_member_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_member_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_team_member_permissions_updated_at
  BEFORE UPDATE ON public.team_member_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_team_member_permissions_updated_at(); 