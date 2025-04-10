-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_team_members table for project assignments
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, team_member_id)
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  assigned_to UUID REFERENCES public.team_members(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their company's projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.company_id = projects.company_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects for their company"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.company_id = projects.company_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create policies for project_team_members
CREATE POLICY "Users can view their company's project team members"
  ON public.project_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.team_members ON team_members.company_id = projects.company_id
      WHERE projects.id = project_team_members.project_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create policies for project_tasks
CREATE POLICY "Users can view their company's project tasks"
  ON public.project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.team_members ON team_members.company_id = projects.company_id
      WHERE projects.id = project_tasks.project_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX projects_company_id_idx ON public.projects(company_id);
CREATE INDEX project_team_members_project_id_idx ON public.project_team_members(project_id);
CREATE INDEX project_team_members_team_member_id_idx ON public.project_team_members(team_member_id);
CREATE INDEX project_tasks_project_id_idx ON public.project_tasks(project_id);
CREATE INDEX project_tasks_assigned_to_idx ON public.project_tasks(assigned_to);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_team_members_updated_at
  BEFORE UPDATE ON public.project_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 