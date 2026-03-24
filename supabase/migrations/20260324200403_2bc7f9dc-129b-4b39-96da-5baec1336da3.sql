
-- 1. Table: checkout_events (webhook data from Zouti)
CREATE TABLE public.checkout_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  order_id text,
  customer_email text,
  customer_name text,
  customer_phone text,
  amount numeric,
  currency text DEFAULT 'BRL',
  payment_method text,
  payment_status text,
  products jsonb,
  order_bumps jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  src text,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checkout_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.checkout_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select" ON public.checkout_events FOR SELECT TO authenticated USING (true);

-- 2. Table: page_analytics (behavioral tracking)
CREATE TABLE public.page_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  session_id text,
  event_type text NOT NULL,
  section_name text,
  scroll_percent integer,
  click_target text,
  viewport_x integer,
  viewport_y integer,
  page_height integer,
  viewport_width integer,
  viewport_height integer,
  time_on_page integer,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON public.page_analytics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated_select" ON public.page_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_role_all" ON public.page_analytics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Table: authorized_dashboard_users
CREATE TABLE public.authorized_dashboard_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.authorized_dashboard_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select" ON public.authorized_dashboard_users FOR SELECT TO authenticated USING (true);

-- 4. Security definer function to check dashboard access
CREATE OR REPLACE FUNCTION public.is_dashboard_user(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.authorized_dashboard_users WHERE email = user_email
  )
$$;

-- 5. Insert authorized emails
INSERT INTO public.authorized_dashboard_users (email) VALUES
  ('michelafiliadonagringa@gmail.com'),
  ('agencialetsgoup@gmail.com');
