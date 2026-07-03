
CREATE TABLE public.service_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  header TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cause TEXT NOT NULL DEFAULT 'UNKNOWN_CAUSE',
  effect TEXT NOT NULL DEFAULT 'UNKNOWN_EFFECT',
  stop_ids TEXT[] NOT NULL DEFAULT '{}',
  route_ids TEXT[] NOT NULL DEFAULT '{}',
  url TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_alerts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_alerts TO authenticated;
GRANT ALL ON public.service_alerts TO service_role;
ALTER TABLE public.service_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active alerts" ON public.service_alerts FOR SELECT USING (active = true);
CREATE INDEX idx_service_alerts_active ON public.service_alerts (active, starts_at DESC);
