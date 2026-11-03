-- Run in Supabase SQL Editor

alter table public.profiles
  add column if not exists ring_goals jsonb default '{"move":500,"train":30,"distance":5}'::jsonb,
  add column if not exists nutrition_goals jsonb default '{"calories":2500,"protein_g":180,"carbs_g":250,"fat_g":90,"water_ml":2500}'::jsonb;
