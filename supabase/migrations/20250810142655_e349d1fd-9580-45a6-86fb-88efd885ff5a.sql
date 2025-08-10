-- Create folders table
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  is_system BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendent' CHECK (status IN ('pendent', 'en_proces', 'completat')),
  priority TEXT NOT NULL DEFAULT 'mitjana' CHECK (priority IN ('alta', 'mitjana', 'baixa')),
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for folders
CREATE POLICY "Users can view their own folders" 
ON public.folders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" 
ON public.folders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
ON public.folders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders (except system folders)" 
ON public.folders 
FOR DELETE 
USING (auth.uid() = user_id AND is_system = FALSE);

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create system inbox folder for new users
CREATE OR REPLACE FUNCTION public.create_user_inbox()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.folders (name, color, is_system, user_id)
  VALUES ('Bustia', '#94a3b8', TRUE, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create inbox folder when user signs up
CREATE TRIGGER create_user_inbox_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_inbox();

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_folder_id ON public.tasks(folder_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_folders_user_id ON public.folders(user_id);