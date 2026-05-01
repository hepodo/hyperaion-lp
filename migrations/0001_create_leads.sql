CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  purpose TEXT NOT NULL,
  timing TEXT NOT NULL,
  message TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  colo TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
