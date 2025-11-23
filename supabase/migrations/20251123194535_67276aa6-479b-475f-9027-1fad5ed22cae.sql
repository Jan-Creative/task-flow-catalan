-- ============================================================================
-- FASE 1: Crear Índexs Crítics per Reduir Disk IO
-- ============================================================================

-- 1.1. Índexs per pomodoro_sessions (95,335 sequential scans detectats)
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id 
ON pomodoro_sessions(task_id) WHERE task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_started_at 
ON pomodoro_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_completed 
ON pomodoro_sessions(task_id, is_completed) WHERE task_id IS NOT NULL;

-- 1.2. Índexs per daily_reminder_preferences
CREATE INDEX IF NOT EXISTS idx_daily_reminder_preferences_user_id 
ON daily_reminder_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_reminder_preferences_enabled 
ON daily_reminder_preferences(user_id, is_enabled) WHERE is_enabled = true;

-- 1.3. Índexs per property_definitions
CREATE INDEX IF NOT EXISTS idx_property_definitions_user_id 
ON property_definitions(user_id);

CREATE INDEX IF NOT EXISTS idx_property_definitions_user_type 
ON property_definitions(user_id, type);

-- 1.4. Índexs millorats per tasks
CREATE INDEX IF NOT EXISTS idx_tasks_folder_status 
ON tasks(folder_id, status) WHERE folder_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_user_is_today 
ON tasks(user_id, is_today) WHERE is_today = true;

CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date 
ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_user_status 
ON tasks(user_id, status);

-- ============================================================================
-- FASE 4: Neteja de Dades Antigues i Política de Retenció Automàtica
-- ============================================================================

-- 4.1. Esborrar sessions Pomodoro antigues (més de 90 dies)
DELETE FROM pomodoro_sessions 
WHERE started_at < NOW() - INTERVAL '90 days';

-- 4.2. Crear o actualitzar funció de neteja automàtica
CREATE OR REPLACE FUNCTION public.cleanup_old_pomodoro_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Esborrar sessions més antigues de 90 dies
  DELETE FROM pomodoro_sessions 
  WHERE started_at < NOW() - INTERVAL '90 days';
  
  -- Opcional: Log de quantes files s'han esborrat
  RAISE NOTICE 'Cleaned up old pomodoro sessions';
END;
$$;