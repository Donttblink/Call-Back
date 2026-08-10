CREATE TABLE auditions (
  id             SERIAL PRIMARY KEY,
  project_title  TEXT NOT NULL,
  role_name      TEXT NOT NULL,
  project_type   TEXT NOT NULL DEFAULT 'film',
  audition_date  DATE,
  status         TEXT NOT NULL DEFAULT 'upcoming',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE script_lines (
  id             SERIAL PRIMARY KEY,
  auditions_id   INTEGER NOT NULL REFERENCES auditions(id) ON DELETE CASCADE,
  position       INTEGER NOT NULL,
  element_type   TEXT NOT NULL CHECK (element_type IN ('scene_heading', 'action', 'dialogue' )),
  character_name TEXT,
  is_mine        BOOLEAN NOT NULL DEFAULT FALSE,
  content        TEXT NOT NULL
);