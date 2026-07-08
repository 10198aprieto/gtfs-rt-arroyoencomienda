
CREATE TABLE IF NOT EXISTS public.telegram_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  stop_id text NOT NULL,
  alias text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chat_id, stop_id)
);
GRANT ALL ON public.telegram_favorites TO service_role;
ALTER TABLE public.telegram_favorites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_telegram_favorites_chat ON public.telegram_favorites(chat_id);

CREATE TABLE IF NOT EXISTS public.telegram_alert_notified (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  alert_id uuid NOT NULL REFERENCES public.service_alerts(id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chat_id, alert_id)
);
GRANT ALL ON public.telegram_alert_notified TO service_role;
ALTER TABLE public.telegram_alert_notified ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_telegram_alert_notified_alert ON public.telegram_alert_notified(alert_id);

ALTER TABLE public.telegram_users
  ADD COLUMN IF NOT EXISTS alerts_opt_in boolean NOT NULL DEFAULT true;
