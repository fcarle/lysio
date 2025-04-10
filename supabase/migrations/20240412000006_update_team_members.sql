-- Add additional fields to team_members table
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb;

-- Create index for last_active
CREATE INDEX IF NOT EXISTS team_members_last_active_idx ON public.team_members(last_active);

-- Update RLS policies to include company owners
CREATE POLICY "Company owners can view team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = team_members.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update team members"
  ON public.team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = team_members.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can create team members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = team_members.company_id
      AND companies.owner_id = auth.uid()
    )
  ); 