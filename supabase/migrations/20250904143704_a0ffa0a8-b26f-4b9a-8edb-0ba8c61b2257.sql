-- Add timezone and last_sent_at to daily_reminder_preferences
ALTER TABLE daily_reminder_preferences 
ADD COLUMN timezone TEXT DEFAULT 'Europe/Madrid',
ADD COLUMN last_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying
CREATE INDEX idx_daily_reminder_preferences_timezone_time ON daily_reminder_preferences(timezone, reminder_time, is_enabled);

-- Schedule cron job to run every 5 minutes
SELECT cron.schedule(
  'daily-preparation-reminder-every-5min',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://umfrvkakvgsypqcyyzke.supabase.co/functions/v1/daily-preparation-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZnJ2a2FrdmdzeXBxY3l5emtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzM3NDksImV4cCI6MjA3MDQwOTc0OX0.unXiHHRqKsM_0vRU20nJz7aE-hyV-t1PXH0k0VfEeR4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Remove old daily cron job if it exists
SELECT cron.unschedule('daily-preparation-reminder') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-preparation-reminder'
);