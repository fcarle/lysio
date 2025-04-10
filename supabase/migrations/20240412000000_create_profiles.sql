-- Drop existing types if they exist
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.provider_type CASCADE;

-- Create an enum for user roles
CREATE TYPE public.user_role AS ENUM ('provider', 'client', 'admin');

-- Create an enum for provider types
CREATE TYPE public.provider_type AS ENUM ('freelancer', 'agency', 'company');

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create a table for user profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'client',
  provider_type public.provider_type,
  avatar_url TEXT,
  services TEXT[] DEFAULT '{}',
  pricing_models TEXT[] DEFAULT '{}',
  typical_clients TEXT[] DEFAULT '{}',
  specialized_industries TEXT[] DEFAULT '{}',
  avoided_industries TEXT[] DEFAULT '{}',
  working_countries TEXT[] DEFAULT '{}',
  avoided_countries TEXT[] DEFAULT '{}',
  spoken_languages TEXT[] DEFAULT '{}',
  show_logo BOOLEAN DEFAULT false,
  allow_promotion BOOLEAN DEFAULT false,
  interested_in_paid_promotion BOOLEAN DEFAULT false,
  accept_success_fee BOOLEAN DEFAULT true,
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a policy for inserting profiles (needed for the trigger)
CREATE POLICY "Allow profile creation"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    email,
    full_name,
    role,
    provider_type,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'client'),
    CASE 
      WHEN (new.raw_user_meta_data->>'role')::public.user_role = 'provider' 
      THEN (new.raw_user_meta_data->>'provider_type')::public.provider_type
      ELSE NULL
    END,
    TIMEZONE('utc'::text, NOW()),
    TIMEZONE('utc'::text, NOW())
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create the trigger for updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS profiles_user_id_idx;
DROP INDEX IF EXISTS profiles_role_idx;
DROP INDEX IF EXISTS profiles_provider_type_idx;
DROP INDEX IF EXISTS profiles_email_idx;

-- Create indexes for better performance
CREATE INDEX profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_provider_type_idx ON public.profiles(provider_type);
CREATE INDEX profiles_email_idx ON public.profiles(email);

-- Add RLS policies for admin access
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 