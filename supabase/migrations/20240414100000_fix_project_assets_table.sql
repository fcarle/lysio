-- Create project_assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  url TEXT NOT NULL,
  description TEXT,
  size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS project_assets_project_id_idx ON public.project_assets(project_id);

-- Enable Row Level Security
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they interfere with our new ones
DROP POLICY IF EXISTS "Users can view their company's project assets" ON public.project_assets;
DROP POLICY IF EXISTS "Users can create project assets" ON public.project_assets;
DROP POLICY IF EXISTS "Users can update project assets" ON public.project_assets;
DROP POLICY IF EXISTS "Users can delete project assets" ON public.project_assets;

-- Create RLS policies for project_assets
-- Select Policy - Users can view project assets for projects they have access to
CREATE POLICY "Users can view their company's project assets"
  ON public.project_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.team_members ON team_members.company_id = projects.company_id
      WHERE projects.id = project_assets.project_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Insert Policy - Users can create project assets for projects they have access to
CREATE POLICY "Users can create project assets"
  ON public.project_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.team_members ON team_members.company_id = projects.company_id
      WHERE projects.id = project_assets.project_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Update Policy - Users can update project assets for projects they have access to
CREATE POLICY "Users can update project assets"
  ON public.project_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.team_members ON team_members.company_id = projects.company_id
      WHERE projects.id = project_assets.project_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Delete Policy - Users can delete project assets for projects they have access to
CREATE POLICY "Users can delete project assets"
  ON public.project_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.team_members ON team_members.company_id = projects.company_id
      WHERE projects.id = project_assets.project_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_project_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DROP TRIGGER IF EXISTS update_project_assets_updated_at ON public.project_assets;
CREATE TRIGGER update_project_assets_updated_at
  BEFORE UPDATE ON public.project_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_project_assets_updated_at(); 