-- Add time block integration fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN time_block_id UUID,
ADD COLUMN scheduled_start_time TIME,
ADD COLUMN scheduled_end_time TIME;

-- Create index for efficient queries on time-scheduled tasks
CREATE INDEX idx_tasks_time_block_id ON public.tasks(time_block_id) WHERE time_block_id IS NOT NULL;
CREATE INDEX idx_tasks_scheduled_time ON public.tasks(scheduled_start_time, scheduled_end_time) WHERE scheduled_start_time IS NOT NULL;

-- Create index for today's scheduled tasks (combines due_date and scheduled time)
CREATE INDEX idx_tasks_today_scheduled ON public.tasks(user_id, due_date, scheduled_start_time) 
WHERE due_date IS NOT NULL AND scheduled_start_time IS NOT NULL;