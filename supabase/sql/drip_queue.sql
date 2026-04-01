create table if not exists public.drip_queue (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('x', 'telegram', 'email')),
  text text not null,
  scheduled_at timestamptz not null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create index if not exists drip_queue_scheduled_at_idx on public.drip_queue (scheduled_at);
