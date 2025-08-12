-- Create subtasks table
CREATE TABLE public.task_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table for tasks
CREATE TABLE public.task_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pomodoro sessions table
CREATE TABLE public.pomodoro_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  break_duration_minutes INTEGER NOT NULL DEFAULT 5,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  session_type TEXT NOT NULL DEFAULT 'work', -- 'work' or 'break'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_subtasks
CREATE POLICY "Users can view subtasks for their tasks" 
ON public.task_subtasks 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_subtasks.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can create subtasks for their tasks" 
ON public.task_subtasks 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_subtasks.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can update subtasks for their tasks" 
ON public.task_subtasks 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_subtasks.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can delete subtasks for their tasks" 
ON public.task_subtasks 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_subtasks.task_id 
  AND t.user_id = auth.uid()
));

-- Create RLS policies for task_notes
CREATE POLICY "Users can view notes for their tasks" 
ON public.task_notes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_notes.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can create notes for their tasks" 
ON public.task_notes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_notes.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can update notes for their tasks" 
ON public.task_notes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_notes.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can delete notes for their tasks" 
ON public.task_notes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = task_notes.task_id 
  AND t.user_id = auth.uid()
));

-- Create RLS policies for pomodoro_sessions
CREATE POLICY "Users can view pomodoro sessions for their tasks" 
ON public.pomodoro_sessions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = pomodoro_sessions.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can create pomodoro sessions for their tasks" 
ON public.pomodoro_sessions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = pomodoro_sessions.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can update pomodoro sessions for their tasks" 
ON public.pomodoro_sessions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = pomodoro_sessions.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can delete pomodoro sessions for their tasks" 
ON public.pomodoro_sessions 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.id = pomodoro_sessions.task_id 
  AND t.user_id = auth.uid()
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_task_subtasks_updated_at
  BEFORE UPDATE ON public.task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_notes_updated_at
  BEFORE UPDATE ON public.task_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pomodoro_sessions_updated_at
  BEFORE UPDATE ON public.pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();