CREATE TABLE public.air_quality_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estacion text NOT NULL UNIQUE,
  provincia text,
  latitud double precision,
  longitud double precision,
  fecha_dato date NOT NULL,
  no_ug_m3 numeric,
  no2_ug_m3 numeric,
  o3_ug_m3 numeric,
  pm10_ug_m3 numeric,
  pm25_ug_m3 numeric,
  so2_ug_m3 numeric,
  co_mg_m3 numeric,
  indice integer,
  categoria text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.air_quality_cache TO anon;
GRANT SELECT ON public.air_quality_cache TO authenticated;
GRANT ALL ON public.air_quality_cache TO service_role;

ALTER TABLE public.air_quality_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Air quality is publicly readable"
ON public.air_quality_cache FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_air_quality_cache_updated_at
BEFORE UPDATE ON public.air_quality_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();