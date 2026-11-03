-- Weekly planner, buddy system, reminders

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS reminder_preferences jsonb NOT NULL DEFAULT '{"enabled": false, "time": "08:00"}'::jsonb,
  ADD COLUMN IF NOT EXISTS buddy_privacy jsonb NOT NULL DEFAULT '{"workouts": true, "progress": true, "achievements": true, "streaks": true, "challenges": true}'::jsonb;

CREATE TABLE IF NOT EXISTS weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE TABLE IF NOT EXISTS buddy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);

CREATE TABLE IF NOT EXISTS buddy_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)
);

CREATE TABLE IF NOT EXISTS buddy_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pair_id uuid NOT NULL REFERENCES buddy_pairs(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buddy_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id uuid NOT NULL REFERENCES buddy_pairs(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  goal_type text NOT NULL,
  goal_value numeric NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buddy_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES buddy_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress_value numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS buddy_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_week ON weekly_plans(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_to ON buddy_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_buddy_activities_pair ON buddy_activities(pair_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buddy_nudges_to ON buddy_nudges(to_user_id, read_at);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY weekly_plans_own ON weekly_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY buddy_requests_involved ON buddy_requests FOR ALL
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY buddy_pairs_involved ON buddy_pairs FOR ALL
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY buddy_activities_pair ON buddy_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM buddy_pairs p WHERE p.id = pair_id AND (p.user_a_id = auth.uid() OR p.user_b_id = auth.uid())
  ));
CREATE POLICY buddy_activities_insert ON buddy_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY buddy_challenges_pair ON buddy_challenges FOR ALL
  USING (EXISTS (
    SELECT 1 FROM buddy_pairs p WHERE p.id = pair_id AND (p.user_a_id = auth.uid() OR p.user_b_id = auth.uid())
  ));
CREATE POLICY buddy_challenge_progress_own ON buddy_challenge_progress FOR ALL
  USING (auth.uid() = user_id);
CREATE POLICY buddy_nudges_involved ON buddy_nudges FOR ALL
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
