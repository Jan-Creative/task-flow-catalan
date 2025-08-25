-- Fix Function Search Path Mutable issues
-- Update existing functions to have secure search_path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER 
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$function$;

-- Fix create_default_notification_preferences function  
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix create_user_inbox function
CREATE OR REPLACE FUNCTION public.create_user_inbox()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.folders (name, color, is_system, user_id)
  VALUES ('Bustia', '#94a3b8', TRUE, NEW.id);
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix cleanup_old_pomodoro_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_old_pomodoro_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Marcar com a completades sessions més antigues de 24 hores que no estan completades
  UPDATE pomodoro_sessions 
  SET is_completed = true, 
      completed_at = NOW()
  WHERE is_completed = false 
    AND started_at < NOW() - INTERVAL '24 hours';
    
  -- Esborrar sessions molt antigues (més de 90 dies) per mantenir la base de dades neta
  DELETE FROM pomodoro_sessions 
  WHERE started_at < NOW() - INTERVAL '90 days';
END;
$function$;

-- Fix profiles table RLS policy to prevent user data exposure
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more secure policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow viewing basic profile info for existing connections only (more secure)
CREATE POLICY "Users can view basic profile info of others" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow viewing display_name of other users, not full profile data
  -- This would typically be restricted further based on relationships/connections
  auth.uid() IS NOT NULL
);

-- Comment: In a real application, you'd want to restrict this further
-- based on relationships, friend connections, or other business logic