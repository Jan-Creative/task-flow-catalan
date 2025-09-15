-- Clean up corrupted folder entries with JSON in name field
DELETE FROM folders WHERE name LIKE '{%' AND is_smart = false;

-- Recreate the trigger to ensure it's working properly
DROP TRIGGER IF EXISTS trigger_auto_assign_smart_folder ON tasks;

CREATE TRIGGER trigger_auto_assign_smart_folder
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_task_to_smart_folder();