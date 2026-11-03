-- Run in Supabase SQL Editor after initial schema

alter table public.routes
  add column if not exists activity_type text default 'run',
  add column if not exists path jsonb,
  add column if not exists steps integer,
  add column if not exists avg_pace_min_km numeric,
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz;

alter table public.sleep_entries
  add column if not exists source text default 'manual',
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz;

alter table public.body_entries
  add column if not exists source text default 'manual';
