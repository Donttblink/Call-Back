CREATE TABLE auditions (
  id            SERIAL PRIMARY KEY,
  project_title TEXT NOT NULL,
  role_name     TEXT NOT NULL,
  project_type  TEXT NOT NULL DEFAULT 'film',
  audition_date DATE,
  status        TEXT NOT NULL DEFAULT 'upcoming',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);