# Fixing Supabase Storage Bucket Permissions

## Problem
Images aren't loading because the bucket permissions are not properly configured to allow public access.

## Solution
Follow these steps to fix the permissions:

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Select your project: "Lysio" (ID: cziotokdvlgbyeltmppy)
3. Go to "Storage" in the left sidebar
4. Select the "project-assets" bucket
5. Click on "Policies" in the left sidebar

## Required Policies

### 1. Public Read Access
Add a policy to allow anyone to view the files:

- Policy name: `Public Read Access`
- Policy definition (using policy editor): 
```sql
true
```
- Select "SELECT" (read) for the operation

### 2. Add RLS Policy with SQL Editor
Go to the SQL Editor and run this SQL to ensure storage objects can be accessed:

```sql
-- Enable row-level security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to read any object
CREATE POLICY "Public Access Policy" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-assets'
  );

-- Create an insert policy for authenticated users
CREATE POLICY "Upload Access Policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-assets' AND
    auth.role() = 'authenticated'
  );
  
-- Create a policy allowing authenticated users to update objects
CREATE POLICY "Update Access Policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-assets' AND
    auth.role() = 'authenticated'
  );

-- Create a policy allowing authenticated users to delete objects
CREATE POLICY "Delete Access Policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-assets' AND
    auth.role() = 'authenticated'
  );
```

## Verify Bucket Settings
Also check that your bucket is set as public:

1. Go to "Settings" for the bucket
2. Enable "Public bucket" if it's not already enabled
3. Save changes

## Test the Connection
After adding these policies:

1. Go back to your application
2. Click the "Test Bucket" button to verify connectivity
3. Try accessing your images again 