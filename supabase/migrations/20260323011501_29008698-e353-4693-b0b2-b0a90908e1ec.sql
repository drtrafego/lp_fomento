-- Create pixel_events table for Meta Pixel tracking
CREATE TABLE public.pixel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  client_ip TEXT,
  user_agent TEXT,
  external_id TEXT,
  fbp TEXT,
  fbc TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  custom_data JSONB,
  meta_response JSONB,
  hashed_em TEXT,
  hashed_ph TEXT,
  hashed_fn TEXT,
  hashed_ln TEXT,
  hashed_ct TEXT,
  hashed_st TEXT,
  hashed_zp TEXT,
  hashed_country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert" ON public.pixel_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated select" ON public.pixel_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service_role all" ON public.pixel_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_pixel_events_event_name ON public.pixel_events (event_name);
CREATE INDEX idx_pixel_events_created_at ON public.pixel_events (created_at DESC);