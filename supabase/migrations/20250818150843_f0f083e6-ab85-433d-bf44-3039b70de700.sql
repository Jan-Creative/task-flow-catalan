-- Enable required extensions for scheduling HTTP calls
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Triggers to initialize user-related defaults on signup (if not already present)
-- 1) Create profile from metadata
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Create default notification preferences
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_notification_preferences();

-- 3) Create default inbox folder
DROP TRIGGER IF EXISTS on_auth_user_created_inbox ON auth.users;
CREATE TRIGGER on_auth_user_created_inbox
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_inbox();

-- Schedule the reminders processor to run every minute
-- Uses the public anon key to authorize the request
select
  cron.schedule(
    'process-reminders-every-minute',
    '* * * * *',
    $$
    select net.http_post(
      url := 'https://umfrvkakvgsypqcyyzke.supabase.co/functions/v1/process-reminders',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZnJ2a2FrdmdzeXBxY3l5emtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzM3NDksImV4cCI6MjA3MDQwOTc0OX0.unXiHHRqKsM_0vRU20nJz7aE-hyV-t1PXH0k0VfEeR4"}'::jsonb,
      body := jsonb_build_object('source', 'pg_cron', 'invoked_at', now())
    ) as request_id;
    $$
  );