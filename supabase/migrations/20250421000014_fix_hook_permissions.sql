-- Fix: hook needs SECURITY DEFINER to bypass RLS and SELECT on users table
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  app_role text;
  user_org_id uuid;
BEGIN
  SELECT role, org_id INTO app_role, user_org_id
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF app_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(app_role));
    claims := jsonb_set(claims, '{org_id}', to_jsonb(user_org_id));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

GRANT SELECT ON public.users TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
