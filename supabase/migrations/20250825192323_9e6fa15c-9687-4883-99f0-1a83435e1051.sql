-- Create notification_blocks table
CREATE TABLE public.notification_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notification_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_blocks
CREATE POLICY "Users can view their own notification blocks" 
ON public.notification_blocks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification blocks" 
ON public.notification_blocks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification blocks" 
ON public.notification_blocks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification blocks" 
ON public.notification_blocks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create block_notifications table to store the notifications within each block
CREATE TABLE public.block_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for block_notifications
ALTER TABLE public.block_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for block_notifications (access through block ownership)
CREATE POLICY "Users can view notifications for their blocks" 
ON public.block_notifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.notification_blocks nb 
  WHERE nb.id = block_notifications.block_id 
  AND nb.user_id = auth.uid()
));

CREATE POLICY "Users can create notifications for their blocks" 
ON public.block_notifications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.notification_blocks nb 
  WHERE nb.id = block_notifications.block_id 
  AND nb.user_id = auth.uid()
));

CREATE POLICY "Users can update notifications for their blocks" 
ON public.block_notifications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.notification_blocks nb 
  WHERE nb.id = block_notifications.block_id 
  AND nb.user_id = auth.uid()
));

CREATE POLICY "Users can delete notifications for their blocks" 
ON public.block_notifications 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.notification_blocks nb 
  WHERE nb.id = block_notifications.block_id 
  AND nb.user_id = auth.uid()
));

-- Add block_id to notification_reminders to link reminders to blocks
ALTER TABLE public.notification_reminders 
ADD COLUMN block_id UUID REFERENCES public.notification_blocks(id) ON DELETE SET NULL;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_notification_blocks_updated_at
BEFORE UPDATE ON public.notification_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_block_notifications_updated_at
BEFORE UPDATE ON public.block_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();