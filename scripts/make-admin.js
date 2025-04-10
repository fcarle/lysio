// This script makes a user an admin by updating their role in the profiles table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or service role key in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeUserAdmin(email) {
  try {
    // First, find the user by email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError) {
      console.error('Error finding user:', userError.message);
      return;
    }
    
    if (!userData || !userData.user) {
      console.error(`User with email ${email} not found`);
      return;
    }
    
    const userId = userData.user.id;
    
    // Update the user's role in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating user role:', error.message);
      return;
    }
    
    console.log(`Successfully made user ${email} an admin!`);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.error('Usage: node make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email); 