# Chart Configurations Setup

This document provides instructions on how to set up the chart configurations feature in your Supabase project.

## Option 1: Using the Supabase Dashboard

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query and paste the following SQL:

```sql
-- Create chart_configurations table
CREATE TABLE IF NOT EXISTS public.chart_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.chart_configurations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own chart configurations
CREATE POLICY "Users can view their own chart configurations"
  ON public.chart_configurations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own chart configurations
CREATE POLICY "Users can insert their own chart configurations"
  ON public.chart_configurations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own chart configurations
CREATE POLICY "Users can update their own chart configurations"
  ON public.chart_configurations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own chart configurations
CREATE POLICY "Users can delete their own chart configurations"
  ON public.chart_configurations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX chart_configurations_user_id_idx ON public.chart_configurations(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chart_configurations_updated_at
BEFORE UPDATE ON public.chart_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

5. Run the query

## Option 2: Using the Migration Script

1. Make sure you have the following environment variables set in your `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the migration script:
   ```
   node scripts/apply-migration.js
   ```

## Fallback Mechanism

The application includes a fallback mechanism that stores chart configurations in the browser's localStorage when Supabase is not available or when there are issues with the database connection. This ensures that users can still save and load their chart configurations even if the backend is temporarily unavailable.

## Troubleshooting

If you encounter issues with saving chart configurations:

1. Check the browser console for error messages
2. Verify that the `chart_configurations` table exists in your Supabase project
3. Ensure that Row Level Security (RLS) policies are correctly set up
4. Check that your user is authenticated when trying to save configurations

For more help, contact the development team. 