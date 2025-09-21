-- Make task_id nullable in pomodoro_sessions table to support generic timers
ALTER TABLE public.pomodoro_sessions 
ALTER COLUMN task_id DROP NOT NULL;

-- Update RLS policies to allow generic sessions (without task_id)
DROP POLICY IF EXISTS "Users can create pomodoro sessions for their tasks" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can view pomodoro sessions for their tasks" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can update pomodoro sessions for their tasks" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can delete pomodoro sessions for their tasks" ON public.pomodoro_sessions;

-- Create new RLS policies that support both task-linked and generic sessions
CREATE POLICY "Users can create their own pomodoro sessions" 
ON public.pomodoro_sessions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    task_id IS NULL OR 
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
  )
);

CREATE POLICY "Users can view their own pomodoro sessions" 
ON public.pomodoro_sessions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    task_id IS NULL OR 
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own pomodoro sessions" 
ON public.pomodoro_sessions 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    task_id IS NULL OR 
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own pomodoro sessions" 
ON public.pomodoro_sessions 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND (
    task_id IS NULL OR 
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
  )
);