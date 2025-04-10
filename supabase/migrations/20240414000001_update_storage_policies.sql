-- Drop existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Make sure the bucket exists and is set to private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'project-assets';

-- Enable row level security for storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to select (read) files
-- This policy checks if the user has access to the project
CREATE POLICY "Project members can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'project-assets' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM projects p 
    INNER JOIN project_team_members ptm ON p.id = ptm.project_id
    INNER JOIN team_members tm ON ptm.team_member_id = tm.id
    WHERE 
      tm.user_id = auth.uid() AND
      SUBSTRING(storage.objects.name FROM '^([^/]+)') = p.id::text
  )
);

-- Create policy for authenticated users to upload files to projects they have access to
CREATE POLICY "Project members can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-assets' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM projects p 
    INNER JOIN project_team_members ptm ON p.id = ptm.project_id
    INNER JOIN team_members tm ON ptm.team_member_id = tm.id
    WHERE 
      tm.user_id = auth.uid() AND
      SUBSTRING(storage.objects.name FROM '^([^/]+)') = p.id::text
  )
);

-- Create policy for authenticated users to update files in projects they have access to
CREATE POLICY "Project members can update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-assets' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM projects p 
    INNER JOIN project_team_members ptm ON p.id = ptm.project_id
    INNER JOIN team_members tm ON ptm.team_member_id = tm.id
    WHERE 
      tm.user_id = auth.uid() AND
      SUBSTRING(storage.objects.name FROM '^([^/]+)') = p.id::text
  )
);

-- Create policy for authenticated users to delete files in projects they have access to
CREATE POLICY "Project members can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-assets' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM projects p 
    INNER JOIN project_team_members ptm ON p.id = ptm.project_id
    INNER JOIN team_members tm ON ptm.team_member_id = tm.id
    WHERE 
      tm.user_id = auth.uid() AND
      SUBSTRING(storage.objects.name FROM '^([^/]+)') = p.id::text
  )
); 