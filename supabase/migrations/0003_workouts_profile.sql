-- Run in Supabase SQL Editor after 0002_tracking.sql

alter table public.profiles
  add column if not exists fitness_goal text,
  add column if not exists experience_level text default 'beginner',
  add column if not exists height_cm numeric,
  add column if not exists weight_kg numeric,
  add column if not exists training_days integer[],
  add column if not exists equipment text[],
  add column if not exists preferred_duration_min integer default 45;

alter table public.workouts
  add column if not exists exercises jsonb,
  add column if not exists calories_burned integer,
  add column if not exists exercises_completed integer,
  add column if not exists plan_type text;

alter table public.nutrition_entries
  add column if not exists goal_calories integer,
  add column if not exists goal_protein_g numeric,
  add column if not exists goal_carbs_g numeric,
  add column if not exists goal_fat_g numeric;
