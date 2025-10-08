-- Fase 2: Eliminar policy que exposa perfils d'altres usuaris
-- PROBLEMA: Qualsevol usuari autenticat pot veure perfils de tots els usuaris
-- SOLUCIÓ: Eliminar la policy permissiva i mantenir només accés al propi perfil

DROP POLICY IF EXISTS "Users can view basic profile info of others" ON profiles;

-- Fase 3: Limitar sessions Pomodoro òrfenes (sense task_id)
-- PROBLEMA: Es poden crear sessions il·limitades sense task_id vinculat
-- SOLUCIÓ: Permetre màxim 5 sessions/dia sense task_id per prevenir abús

-- Primer, eliminem la policy actual de creació
DROP POLICY IF EXISTS "Users can create their own pomodoro sessions" ON pomodoro_sessions;

-- Recreem amb validació millorada
CREATE POLICY "Users can create their own pomodoro sessions"
ON pomodoro_sessions
FOR INSERT
WITH CHECK (
  -- Sessions amb task_id: validar que la tasca és de l'usuari
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_id AND t.user_id = auth.uid()
  ))
  OR
  -- Sessions sense task_id: màxim 5 per dia
  (task_id IS NULL AND (
    SELECT COUNT(*) 
    FROM pomodoro_sessions ps
    WHERE ps.task_id IS NULL 
    AND ps.started_at::date = CURRENT_DATE
    AND EXISTS (
      SELECT 1 FROM tasks t2
      WHERE (t2.user_id = auth.uid() OR auth.uid() IS NOT NULL)
      LIMIT 1
    )
  ) < 5)
);

-- Comentari de seguretat
COMMENT ON POLICY "Users can create their own pomodoro sessions" ON pomodoro_sessions IS 
'Permet crear sessions vinculades a tasques pròpies, o màxim 5 sessions/dia sense tasca per prevenir abús';