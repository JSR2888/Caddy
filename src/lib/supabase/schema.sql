-- Caddy schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- Requires anonymous sign-ins enabled: Authentication -> Providers -> Anonymous Sign-Ins.

create table if not exists shots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  club text,
  swing_effort_percentage integer,
  carry_distance_achieved integer,
  total_distance_achieved integer,
  slope text,
  wind text,
  created_at timestamptz not null default now()
);

create index if not exists shots_user_id_idx on shots(user_id);

alter table shots enable row level security;

create policy "Users can view their own shots"
  on shots for select
  using (auth.uid() = user_id);

create policy "Users can insert their own shots"
  on shots for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own shots"
  on shots for delete
  using (auth.uid() = user_id);


create table if not exists llm_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model text not null,
  request_type text not null check (request_type in ('logShot', 'advice')),
  latency_ms numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists llm_metrics_user_id_idx on llm_metrics(user_id);

alter table llm_metrics enable row level security;

create policy "Users can view their own metrics"
  on llm_metrics for select
  using (auth.uid() = user_id);

create policy "Users can insert their own metrics"
  on llm_metrics for insert
  with check (auth.uid() = user_id);
