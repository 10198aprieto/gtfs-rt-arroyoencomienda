CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  stop_ids text[] NOT NULL DEFAULT '{}',
  notify_alerts boolean NOT NULL DEFAULT true,
  notify_arrivals boolean NOT NULL DEFAULT true,
  arrival_minutes int NOT NULL DEFAULT 5,
  notified jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.upsert_push_subscription(_endpoint text, _p256dh text, _auth text, _stop_ids text[], _alerts boolean, _arrivals boolean)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.push_subscriptions(endpoint, p256dh, auth, stop_ids, notify_alerts, notify_arrivals)
  VALUES (_endpoint, _p256dh, _auth, coalesce(_stop_ids[1:20], '{}'), _alerts, _arrivals)
  ON CONFLICT (endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth,
    stop_ids = excluded.stop_ids, notify_alerts = excluded.notify_alerts,
    notify_arrivals = excluded.notify_arrivals, updated_at = now();
$$;
CREATE OR REPLACE FUNCTION public.delete_push_subscription(_endpoint text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.push_subscriptions WHERE endpoint = _endpoint;
$$;
GRANT EXECUTE ON FUNCTION public.upsert_push_subscription(text,text,text,text[],boolean,boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_push_subscription(text) TO anon, authenticated;