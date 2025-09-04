-- First, remove any duplicate daily_reminder_preferences keeping only the most recent one per user
DELETE FROM daily_reminder_preferences 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM daily_reminder_preferences
  ORDER BY user_id, updated_at DESC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE daily_reminder_preferences 
ADD CONSTRAINT daily_reminder_preferences_user_id_unique UNIQUE (user_id);