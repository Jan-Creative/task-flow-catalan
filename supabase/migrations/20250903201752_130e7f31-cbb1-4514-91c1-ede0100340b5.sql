-- Create daily_reflections table for tracking daily emotional state and reflections
CREATE TABLE public.daily_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reflection_date DATE NOT NULL,
  day_rating INTEGER NOT NULL CHECK (day_rating >= 1 AND day_rating <= 10),
  work_satisfaction INTEGER NOT NULL CHECK (work_satisfaction >= 1 AND work_satisfaction <= 10),
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  tasks_completed_percentage INTEGER NOT NULL DEFAULT 0 CHECK (tasks_completed_percentage >= 0 AND tasks_completed_percentage <= 100),
  notes TEXT,
  accomplishments TEXT[],
  obstacles TEXT[],
  mood_tags TEXT[],
  gratitude_notes TEXT,
  tomorrow_focus TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reflection_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reflections" 
ON public.daily_reflections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections" 
ON public.daily_reflections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
ON public.daily_reflections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" 
ON public.daily_reflections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_reflections_updated_at
BEFORE UPDATE ON public.daily_reflections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();