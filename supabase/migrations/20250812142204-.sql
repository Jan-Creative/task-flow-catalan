-- Update the check constraint to include 'urgent' priority
ALTER TABLE public.tasks 
DROP CONSTRAINT tasks_priority_check;

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_priority_check 
CHECK (priority = ANY (ARRAY['alta'::text, 'mitjana'::text, 'baixa'::text, 'urgent'::text]));