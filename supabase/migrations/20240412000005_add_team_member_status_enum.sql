-- Create team_member_status enum type
CREATE TYPE public.team_member_status AS ENUM ('pending', 'active', 'inactive');

-- First, remove the default value if it exists
ALTER TABLE public.team_members 
  ALTER COLUMN status DROP DEFAULT;

-- Update team_members table to use the enum
ALTER TABLE public.team_members 
  ALTER COLUMN status TYPE public.team_member_status 
  USING status::public.team_member_status;

-- Set default value for existing rows
UPDATE public.team_members 
  SET status = 'active'::public.team_member_status 
  WHERE status IS NULL;

-- Add the default value back with the correct type
ALTER TABLE public.team_members 
  ALTER COLUMN status SET DEFAULT 'active'::public.team_member_status; 