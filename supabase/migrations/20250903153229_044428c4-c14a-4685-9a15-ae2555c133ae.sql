-- Create task_history table for archived completed tasks
CREATE TABLE public.task_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_task_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  folder_name TEXT,
  folder_color TEXT DEFAULT '#6366f1',
  priority TEXT NOT NULL DEFAULT 'mitjana',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  original_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own task history" 
ON public.task_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task history" 
ON public.task_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task history" 
ON public.task_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_history_updated_at
BEFORE UPDATE ON public.task_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();