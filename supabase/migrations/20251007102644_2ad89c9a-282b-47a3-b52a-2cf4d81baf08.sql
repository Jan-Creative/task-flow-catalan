-- Eliminar la política que exposa els perfils de tots els usuaris
-- Això millora la privacitat: els usuaris només podran veure el seu propi perfil
DROP POLICY IF EXISTS "Users can view basic profile info of others" ON public.profiles;

-- La política "Users can view their own profile" es manté per permetre
-- que cada usuari vegi el seu propi perfil de forma segura