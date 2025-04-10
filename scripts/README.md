# Admin Scripts

This directory contains scripts for administrative tasks.

## Make User Admin

The `make-admin.js` script allows you to make a user an admin by updating their role in the profiles table.

### Prerequisites

1. Make sure you have the following environment variables in your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (not the anon key)

2. Install the required dependencies:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

### Usage

Run the script with the email address of the user you want to make an admin:

```bash
node make-admin.js user@example.com
```

### Important Notes

- This script requires the Supabase service role key, which has full access to your database. Keep it secure and never expose it in client-side code.
- Only run this script when necessary and from a secure environment.
- The user must already exist in your application before you can make them an admin.

### Troubleshooting

If you encounter any errors:

1. Make sure your environment variables are correctly set in `.env.local`
2. Verify that the user exists in your Supabase auth system
3. Check that the user has a profile in the `profiles` table
4. Ensure you have the necessary permissions to update the profiles table 