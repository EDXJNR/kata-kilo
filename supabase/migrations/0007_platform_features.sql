-- Habits, squads, planner check-ins, public plans, health import log

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS habit_targets jsonb NOT NULL DEFAULT '{"walk_min": 20, "stretch_min": 5, "protein_g": 120}'::jsonb;

ALTER TABLE saved_plans
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_key text NOT NULL,
  log_date date NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  value numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, habit_key, log_date)
);

CREATE TABLE IF NOT EXISTS planner_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  weekday smallint NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start, weekday)
);

CREATE TABLE IF NOT EXISTS squads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weekly_goal jsonb NOT NULL DEFAULT '{"workouts": 3, "steps": 30000}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS squad_members (
  squad_id uuid NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (squad_id, user_id)
);

CREATE TABLE IF NOT EXISTS health_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL,
  payload jsonb NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_planner_checkins_user_week ON planner_checkins(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_saved_plans_public ON saved_plans(is_public, updated_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_squad_members_user ON squad_members(user_id);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY habit_logs_own ON habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY planner_checkins_own ON planner_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY health_imports_own ON health_imports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY squads_read ON squads FOR SELECT USING (true);
CREATE POLICY squads_insert ON squads FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY squad_members_own ON squad_members FOR ALL USING (auth.uid() = user_id);
