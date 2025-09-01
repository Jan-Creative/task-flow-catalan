-- Create daily_preparations table for planning tomorrow's activities
CREATE TABLE public.daily_preparations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preparation_date DATE NOT NULL,
  planned_tasks JSONB DEFAULT '[]'::jsonb,
  priorities JSONB DEFAULT '[]'::jsonb,
  time_blocks JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, preparation_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_preparations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own preparations" 
ON public.daily_preparations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preparations" 
ON public.daily_preparations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preparations" 
ON public.daily_preparations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preparations" 
ON public.daily_preparations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_preparations_updated_at
BEFORE UPDATE ON public.daily_preparations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();