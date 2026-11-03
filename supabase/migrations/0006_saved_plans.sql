-- User-created workout plans (persisted, usable in weekly planner)

CREATE TABLE IF NOT EXISTS saved_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'custom',
  duration_min integer NOT NULL DEFAULT 45,
  color text NOT NULL DEFAULT '#D4AF37',
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_plans_user ON saved_plans(user_id, updated_at DESC);

ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_plans_own ON saved_plans FOR ALL USING (auth.uid() = user_id);
