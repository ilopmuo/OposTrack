-- OpoTracker — schema
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS groups (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  position  INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  position  INT  NOT NULL DEFAULT 0,
  notes     TEXT NOT NULL DEFAULT '',
  rounds    JSONB NOT NULL DEFAULT '[false,false,false,false]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (anon full access — app personal sin auth)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_groups" ON groups;
DROP POLICY IF EXISTS "anon_all_topics" ON topics;

CREATE POLICY "anon_all_groups" ON groups FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_topics" ON topics FOR ALL TO anon USING (true) WITH CHECK (true);
