-- Schedule daily preparation reminders at 22:00 (Monday to Friday)
SELECT cron.schedule(
  'daily-preparation-reminder-22h',
  '0 22 * * 1-5',
  $$
  SELECT
    net.http_post(
      url:='https://umfrvkakvgsypqcyyzke.supabase.co/functions/v1/daily-preparation-reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZnJ2a2FrdmdzeXBxY3l5emtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzM3NDksImV4cCI6MjA3MDQwOTc0OX0.unXiHHRqKsM_0vRU20nJz7aE-hyV-t1PXH0k0VfEeR4"}'::jsonb,
      body:='{"source": "cron_job", "time": "22:00"}'::jsonb
    ) as request_id;
  $$
);