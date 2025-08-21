
-- 1) Índex únic per permetre l'UPSERT sobre (user_id, endpoint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'web_push_subscriptions_user_id_endpoint_key'
  ) THEN
    CREATE UNIQUE INDEX web_push_subscriptions_user_id_endpoint_key
      ON public.web_push_subscriptions (user_id, endpoint);
  END IF;
END$$;

-- 2) Índex auxiliar per accelerar consultes d'enviament
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'web_push_subscriptions_user_active_idx'
  ) THEN
    CREATE INDEX web_push_subscriptions_user_active_idx
      ON public.web_push_subscriptions (user_id, is_active);
  END IF;
END$$;

-- 3) Trigger per mantenir updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'set_timestamp_web_push_subscriptions'
  ) THEN
    CREATE TRIGGER set_timestamp_web_push_subscriptions
      BEFORE UPDATE ON public.web_push_subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;
