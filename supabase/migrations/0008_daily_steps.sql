-- Automatic / synced daily step counts

CREATE TABLE IF NOT EXISTS daily_steps (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  steps integer NOT NULL DEFAULT 0,
  distance_km numeric,
  source text NOT NULL DEFAULT 'auto',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_steps_user_date ON daily_steps(user_id, log_date DESC);

ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_steps_own ON daily_steps FOR ALL USING (auth.uid() = user_id);
