-- Create table for daily reminder preferences
CREATE TABLE public.daily_reminder_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_time TIME WITHOUT TIME ZONE NOT NULL DEFAULT '22:00:00',
  custom_title TEXT,
  custom_message TEXT,
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}'::integer[], -- 1=Monday, 7=Sunday
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.daily_reminder_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reminder preferences" 
ON public.daily_reminder_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder preferences" 
ON public.daily_reminder_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder preferences" 
ON public.daily_reminder_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder preferences" 
ON public.daily_reminder_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_reminder_preferences_updated_at
BEFORE UPDATE ON public.daily_reminder_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();