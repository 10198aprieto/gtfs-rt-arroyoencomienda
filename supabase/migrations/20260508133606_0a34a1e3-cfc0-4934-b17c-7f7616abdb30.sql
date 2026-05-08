
create table public.telegram_users (
  chat_id bigint primary key,
  username text,
  first_name text,
  language_code text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table public.telegram_subscriptions (
  id uuid primary key default gen_random_uuid(),
  chat_id bigint not null references public.telegram_users(chat_id) on delete cascade,
  stop_id text not null,
  threshold_minutes int not null check (threshold_minutes between 1 and 60),
  route_id text,
  last_notified_at timestamptz,
  last_notified_trip_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.telegram_subscriptions (active, chat_id);

create table public.telegram_reminders (
  id uuid primary key default gen_random_uuid(),
  chat_id bigint not null references public.telegram_users(chat_id) on delete cascade,
  stop_id text not null,
  hour smallint not null check (hour between 0 and 23),
  minute smallint not null check (minute between 0 and 59),
  weekdays smallint[] not null default '{1,2,3,4,5,6,7}',
  last_sent_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.telegram_reminders (active);

create table public.telegram_processed_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

alter table public.telegram_users enable row level security;
alter table public.telegram_subscriptions enable row level security;
alter table public.telegram_reminders enable row level security;
alter table public.telegram_processed_updates enable row level security;
