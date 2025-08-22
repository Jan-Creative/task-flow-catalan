-- Step 1: Fix web_push_subscriptions table with proper indexes and triggers

-- Create unique index to prevent duplicate subscriptions per user/endpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_web_push_subscriptions_user_endpoint 
ON web_push_subscriptions(user_id, endpoint);

-- Create auxiliary index for performance
CREATE INDEX IF NOT EXISTS idx_web_push_subscriptions_user_active 
ON web_push_subscriptions(user_id, is_active) WHERE is_active = true;

-- Add updated_at trigger for web_push_subscriptions if not exists
DROP TRIGGER IF EXISTS update_web_push_subscriptions_updated_at ON web_push_subscriptions;
CREATE TRIGGER update_web_push_subscriptions_updated_at
  BEFORE UPDATE ON web_push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Create cron job to process reminders every minute
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing cron job if it exists
SELECT cron.unschedule('process-reminders-every-minute');

-- Create new cron job to invoke process-reminders function every minute
SELECT cron.schedule(
  'process-reminders-every-minute',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://umfrvkakvgsypqcyyzke.supabase.co/functions/v1/process-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZnJ2a2FrdmdzeXBxY3l5emtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzM3NDksImV4cCI6MjA3MDQwOTc0OX0.unXiHHRqKsM_0vRU20nJz7aE-hyV-t1PXH0k0VfEeR4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);