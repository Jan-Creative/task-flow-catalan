-- Create property definitions table
CREATE TABLE public.property_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('select', 'multiselect')),
  icon TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create property options table
CREATE TABLE public.property_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.property_definitions(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, value)
);

-- Create task properties table (junction table)
CREATE TABLE public.task_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.property_definitions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.property_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE public.property_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_definitions
CREATE POLICY "Users can view their own property definitions" 
ON public.property_definitions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own property definitions" 
ON public.property_definitions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property definitions" 
ON public.property_definitions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own non-system property definitions" 
ON public.property_definitions 
FOR DELETE 
USING (auth.uid() = user_id AND is_system = false);

-- Create RLS policies for property_options
CREATE POLICY "Users can view property options for their properties" 
ON public.property_options 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.property_definitions pd 
  WHERE pd.id = property_options.property_id 
  AND pd.user_id = auth.uid()
));

CREATE POLICY "Users can create options for their properties" 
ON public.property_options 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.property_definitions pd 
  WHERE pd.id = property_options.property_id 
  AND pd.user_id = auth.uid()
));

CREATE POLICY "Users can update options for their properties" 
ON public.property_options 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.property_definitions pd 
  WHERE pd.id = property_options.property_id 
  AND pd.user_id = auth.uid()
));

CREATE POLICY "Users can delete options for their properties" 
ON public.property_options 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.property_definitions pd 
  WHERE pd.id = property_options.property_id 
  AND pd.user_id = auth.uid()
));

-- Create RLS policies for task_properties
CREATE POLICY "Users can view properties for their tasks" 
ON public.task_properties 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_properties.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can create properties for their tasks" 
ON public.task_properties 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_properties.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can update properties for their tasks" 
ON public.task_properties 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_properties.task_id 
  AND t.user_id = auth.uid()
));

CREATE POLICY "Users can delete properties for their tasks" 
ON public.task_properties 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_properties.task_id 
  AND t.user_id = auth.uid()
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_property_definitions_updated_at
BEFORE UPDATE ON public.property_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_options_updated_at
BEFORE UPDATE ON public.property_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_properties_updated_at
BEFORE UPDATE ON public.task_properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system properties (Estat and Prioritat)
INSERT INTO public.property_definitions (name, type, icon, is_system, user_id)
SELECT 'Estat', 'select', 'circle', true, auth.uid()
WHERE auth.uid() IS NOT NULL;

INSERT INTO public.property_definitions (name, type, icon, is_system, user_id)
SELECT 'Prioritat', 'select', 'alert-triangle', true, auth.uid()
WHERE auth.uid() IS NOT NULL;

-- Insert default options for Estat
INSERT INTO public.property_options (property_id, value, label, color, sort_order, is_default)
SELECT pd.id, 'pendent', 'Pendent', '#94a3b8', 1, true
FROM public.property_definitions pd
WHERE pd.name = 'Estat' AND pd.is_system = true AND pd.user_id = auth.uid();

INSERT INTO public.property_options (property_id, value, label, color, sort_order)
SELECT pd.id, 'en_proces', 'En procés', '#f59e0b', 2
FROM public.property_definitions pd
WHERE pd.name = 'Estat' AND pd.is_system = true AND pd.user_id = auth.uid();

INSERT INTO public.property_options (property_id, value, label, color, sort_order)
SELECT pd.id, 'completat', 'Completat', '#10b981', 3
FROM public.property_definitions pd
WHERE pd.name = 'Estat' AND pd.is_system = true AND pd.user_id = auth.uid();

-- Insert default options for Prioritat
INSERT INTO public.property_options (property_id, value, label, color, sort_order, is_default)
SELECT pd.id, 'mitjana', 'Mitjana', '#f59e0b', 2, true
FROM public.property_definitions pd
WHERE pd.name = 'Prioritat' AND pd.is_system = true AND pd.user_id = auth.uid();

INSERT INTO public.property_options (property_id, value, label, color, sort_order)
SELECT pd.id, 'alta', 'Alta', '#ef4444', 1
FROM public.property_definitions pd
WHERE pd.name = 'Prioritat' AND pd.is_system = true AND pd.user_id = auth.uid();

INSERT INTO public.property_options (property_id, value, label, color, sort_order)
SELECT pd.id, 'baixa', 'Baixa', '#10b981', 3
FROM public.property_definitions pd
WHERE pd.name = 'Prioritat' AND pd.is_system = true AND pd.user_id = auth.uid();