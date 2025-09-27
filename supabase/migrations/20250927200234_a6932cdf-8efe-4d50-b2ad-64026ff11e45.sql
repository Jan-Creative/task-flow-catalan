-- Add is_today column to tasks table to explicitly mark tasks for today
ALTER TABLE public.tasks 
ADD COLUMN is_today BOOLEAN DEFAULT false;

-- Add index for better performance when filtering today's tasks
CREATE INDEX idx_tasks_is_today ON public.tasks(is_today) WHERE is_today = true;