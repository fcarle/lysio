-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for project-assets bucket
-- Policy for public reading of files
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-assets'
  );

-- Policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-assets' AND
    auth.role() = 'authenticated'
  );

-- Policy for authenticated users to update their files
CREATE POLICY "Authenticated users can update" ON storage.objects
  FOR UPDATE WITH CHECK (
    bucket_id = 'project-assets' AND
    auth.role() = 'authenticated'
  );

-- Policy for authenticated users to delete their files
CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-assets' AND
    auth.role() = 'authenticated'
  ); 