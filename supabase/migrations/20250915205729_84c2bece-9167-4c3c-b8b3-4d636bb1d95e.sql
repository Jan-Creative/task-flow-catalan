-- Add smart folder functionality to folders table
ALTER TABLE public.folders 
ADD COLUMN is_smart boolean NOT NULL DEFAULT false,
ADD COLUMN smart_rules jsonb DEFAULT '{"keywords": [], "match_type": "any", "case_sensitive": false, "enabled": true}'::jsonb;

-- Create index for smart folder queries
CREATE INDEX idx_folders_smart ON public.folders(is_smart) WHERE is_smart = true;

-- Create function to evaluate smart folder rules
CREATE OR REPLACE FUNCTION public.evaluate_smart_folder_match(
  task_title text,
  task_description text,
  folder_rules jsonb
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  keywords text[];
  keyword text;
  match_type text;
  case_sensitive boolean;
  search_text text;
  found_match boolean := false;
BEGIN
  -- Extract rules
  keywords := array(SELECT jsonb_array_elements_text(folder_rules->'keywords'));
  match_type := COALESCE(folder_rules->>'match_type', 'any');
  case_sensitive := COALESCE((folder_rules->>'case_sensitive')::boolean, false);
  
  -- Return false if no keywords or disabled
  IF array_length(keywords, 1) IS NULL OR NOT COALESCE((folder_rules->>'enabled')::boolean, true) THEN
    RETURN false;
  END IF;
  
  -- Prepare search text
  search_text := COALESCE(task_title, '') || ' ' || COALESCE(task_description, '');
  IF NOT case_sensitive THEN
    search_text := lower(search_text);
  END IF;
  
  -- Check keywords based on match type
  IF match_type = 'all' THEN
    -- All keywords must match
    FOREACH keyword IN ARRAY keywords LOOP
      IF NOT case_sensitive THEN
        keyword := lower(keyword);
      END IF;
      
      IF search_text NOT LIKE '%' || keyword || '%' THEN
        RETURN false;
      END IF;
    END LOOP;
    RETURN true;
  ELSE
    -- Any keyword matches (default)
    FOREACH keyword IN ARRAY keywords LOOP
      IF NOT case_sensitive THEN
        keyword := lower(keyword);
      END IF;
      
      IF search_text LIKE '%' || keyword || '%' THEN
        RETURN true;
      END IF;
    END LOOP;
    RETURN false;
  END IF;
END;
$$;

-- Create function to auto-assign tasks to smart folders
CREATE OR REPLACE FUNCTION public.auto_assign_task_to_smart_folder()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  smart_folder record;
  target_folder_id uuid := NULL;
  folder_priority integer := 999;
  current_priority integer;
BEGIN
  -- Skip if task already has a folder (except inbox)
  IF NEW.folder_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM folders 
    WHERE id = NEW.folder_id 
    AND NOT is_system
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Check all smart folders for this user
  FOR smart_folder IN 
    SELECT f.id, f.smart_rules, f.created_at
    FROM folders f
    WHERE f.user_id = NEW.user_id 
    AND f.is_smart = true
    AND (f.smart_rules->>'enabled')::boolean = true
    ORDER BY f.created_at DESC -- Newer folders have priority
  LOOP
    -- Check if task matches this smart folder
    IF public.evaluate_smart_folder_match(NEW.title, NEW.description, smart_folder.smart_rules) THEN
      -- Use newest matching folder (first one found due to ORDER BY)
      target_folder_id := smart_folder.id;
      EXIT; -- Exit loop on first match
    END IF;
  END LOOP;
  
  -- Assign to smart folder if found
  IF target_folder_id IS NOT NULL THEN
    NEW.folder_id := target_folder_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic task assignment
CREATE TRIGGER trigger_auto_assign_smart_folder
  BEFORE INSERT OR UPDATE OF title, description ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_task_to_smart_folder();