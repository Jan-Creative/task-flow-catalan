-- Neteja de sessions incompletes orfes (més de 3 hores)
UPDATE pomodoro_sessions 
SET is_completed = true, 
    completed_at = NOW()
WHERE is_completed = false 
  AND started_at < NOW() - INTERVAL '3 hours';

-- Afegir índexs per millorar rendiment de consultes
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_date 
ON pomodoro_sessions(task_id, started_at DESC) 
WHERE is_completed = true;

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_active 
ON pomodoro_sessions(task_id, is_completed, started_at) 
WHERE is_completed = false;

-- Funció per cleanup automàtic de sessions molt antigues (opcional per futurs manteniments)
CREATE OR REPLACE FUNCTION cleanup_old_pomodoro_sessions()
RETURNS void AS $$
BEGIN
  -- Marcar com a completades sessions més antigues de 24 hores que no estan completades
  UPDATE pomodoro_sessions 
  SET is_completed = true, 
      completed_at = NOW()
  WHERE is_completed = false 
    AND started_at < NOW() - INTERVAL '24 hours';
    
  -- Esborrar sessions molt antigues (més de 90 dies) per mantenir la base de dades neta
  DELETE FROM pomodoro_sessions 
  WHERE started_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;