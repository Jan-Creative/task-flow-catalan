-- Crear preferències per defecte per usuaris existents que no en tenen
INSERT INTO public.notification_preferences (user_id, enabled, task_reminders, deadline_alerts, custom_notifications)
SELECT 
  u.id,
  true,
  true,
  true,
  true
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verificar que les preferències s'han creat correctament
DO $$
DECLARE
  preferences_count INTEGER;
  users_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO preferences_count FROM public.notification_preferences;
  SELECT COUNT(*) INTO users_count FROM auth.users;
  
  RAISE NOTICE 'Preferences created: % out of % users', preferences_count, users_count;
END $$;