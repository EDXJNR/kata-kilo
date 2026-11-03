create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.body_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  weight_kg numeric,
  body_fat_pct numeric,
  waist_cm numeric,
  notes text
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  name text not null,
  duration_min integer,
  volume_kg numeric,
  notes text
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  name text not null,
  distance_km numeric not null,
  elevation_m numeric,
  duration_min integer
);

create table if not exists public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  meal text not null,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  water_ml integer default 0
);

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  duration_h numeric not null,
  quality integer check (quality between 1 and 5),
  notes text
);

create index if not exists idx_body_user on public.body_entries (user_id, recorded_at desc);
create index if not exists idx_workouts_user on public.workouts (user_id, recorded_at desc);
create index if not exists idx_routes_user on public.routes (user_id, recorded_at desc);
create index if not exists idx_nutrition_user on public.nutrition_entries (user_id, recorded_at desc);
create index if not exists idx_sleep_user on public.sleep_entries (user_id, recorded_at desc);

alter table public.profiles enable row level security;
alter table public.body_entries enable row level security;
alter table public.workouts enable row level security;
alter table public.routes enable row level security;
alter table public.nutrition_entries enable row level security;
alter table public.sleep_entries enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "body_select_own" on public.body_entries for select using (auth.uid() = user_id);
create policy "body_insert_own" on public.body_entries for insert with check (auth.uid() = user_id);
create policy "workouts_select_own" on public.workouts for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts for insert with check (auth.uid() = user_id);
create policy "routes_select_own" on public.routes for select using (auth.uid() = user_id);
create policy "routes_insert_own" on public.routes for insert with check (auth.uid() = user_id);
create policy "nutrition_select_own" on public.nutrition_entries for select using (auth.uid() = user_id);
create policy "nutrition_insert_own" on public.nutrition_entries for insert with check (auth.uid() = user_id);
create policy "sleep_select_own" on public.sleep_entries for select using (auth.uid() = user_id);
create policy "sleep_insert_own" on public.sleep_entries for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', null));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
