-- Create cron job to run daily preparation reminders at 22:00 every day
SELECT cron.schedule(
  'daily-preparation-reminder',
  '0 22 * * *', -- Every day at 22:00
  $$
  SELECT
    net.http_post(
      url := 'https://umfrvkakvgsypqcyyzke.supabase.co/functions/v1/daily-preparation-reminder',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZnJ2a2FrdmdzeXBxY3l5emtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgzMzc0OSwiZXhwIjoyMDcwNDA5NzQ5fQ.l4Zk0t9qFNW3zP13j6QLRP9K0wfBAJhWP3sOqQjzZxY"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    );
  $$
);