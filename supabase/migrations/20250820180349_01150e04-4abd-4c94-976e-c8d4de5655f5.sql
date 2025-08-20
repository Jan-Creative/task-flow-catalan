-- Habilitar extensions necessàries per cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Crear cron job per processar recordatoris cada minut
SELECT cron.schedule(
  'process-notification-reminders',
  '* * * * *', -- Cada minut
  $$
  SELECT
    net.http_post(
        url:='https://umfrvkakvgsypqcyyzke.supabase.co/functions/v1/process-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZnJ2a2FrdmdzeXBxY3l5emtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzM3NDksImV4cCI6MjA3MDQwOTc0OX0.unXiHHRqKsM_0vRU20nJz7aE-hyV-t1PXH0k0VfEeR4"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);