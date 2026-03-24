CREATE OR REPLACE FUNCTION public.is_dashboard_user(user_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.authorized_dashboard_users WHERE lower(email) = lower(user_email)
  )
$$;