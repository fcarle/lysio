import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Create a single instance of the Supabase client for components
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>()
  }
  return supabaseInstance
}

export interface CompanySettings {
  id?: string;
  user_id?: string;
  name: string;
  email?: string;
  industry?: string | null;
  about?: string | null;
  location?: string | null;
  targeting?: string | null;
  budget?: number | null;
  currency?: string;
  budget_frequency?: 'monthly' | 'quarterly' | 'yearly';
  logo?: File;
  logo_url?: string | null;
  marketing_goal?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getCurrentUserEmail() {
  const supabase = createClientComponentClient<Database>();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session?.user?.email) {
    throw new Error('No authenticated user found');
  }

  return session.user.email;
}

export async function getCompanySettings() {
  const supabase = createClientComponentClient<Database>();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('No authenticated user found');
  }

  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .limit(1);

  // If no settings exist or there's an error, return null
  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

export async function updateCompanySettings(settings: Partial<CompanySettings>) {
  const supabase = createClientComponentClient<Database>();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('No authenticated user found');
  }

  // Validate required fields
  if (!settings.name) {
    throw new Error('Company name is required');
  }

  // Remove undefined values to prevent null constraints
  const cleanSettings = Object.fromEntries(
    Object.entries(settings).filter(([key, value]) => value !== undefined && value !== '' && key !== 'email')
  );

  // Check if settings already exist for this user
  const { data: existingSettings } = await supabase
    .from('company_settings')
    .select('id')
    .eq('user_id', session.user.id)
    .limit(1);

  if (existingSettings && existingSettings.length > 0) {
    // Update existing settings
    const { data, error } = await supabase
      .from('company_settings')
      .update({
        ...cleanSettings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new settings
    const { data, error } = await supabase
      .from('company_settings')
      .insert([{
        ...cleanSettings,
        user_id: session.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function uploadLogo(file: File) {
  const supabase = createClientComponentClient<Database>();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('No authenticated user found');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('company-logos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get the public URL of the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('company-logos')
    .getPublicUrl(fileName);

  return publicUrl;
} 