-- Function to clean up duplicate team members
CREATE OR REPLACE FUNCTION cleanup_duplicate_team_members()
RETURNS void AS $$
DECLARE
  duplicate_user RECORD;
BEGIN
  -- Find users with multiple team member records
  FOR duplicate_user IN
    SELECT user_id
    FROM team_members
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  LOOP
    -- Keep only the most recent record for each user
    DELETE FROM team_members
    WHERE user_id = duplicate_user.user_id
    AND id NOT IN (
      SELECT id
      FROM team_members
      WHERE user_id = duplicate_user.user_id
      ORDER BY created_at DESC
      LIMIT 1
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the cleanup function
SELECT cleanup_duplicate_team_members();

-- Add a partial unique constraint to prevent future duplicates
ALTER TABLE team_members 
  ADD CONSTRAINT unique_user_company 
  UNIQUE NULLS NOT DISTINCT (user_id, company_id); 