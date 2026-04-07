-- OpoTracker — schema con autenticación por usuario
-- Ejecuta esto en el SQL Editor de Supabase

-- ── Tablas ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS groups (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  rounds    JSONB NOT NULL DEFAULT '[false,false,false]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS — cada usuario solo ve sus propios datos ──────────────────────────────

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_groups"   ON groups;
DROP POLICY IF EXISTS "anon_all_topics"   ON topics;
DROP POLICY IF EXISTS "users_own_groups"  ON groups;
DROP POLICY IF EXISTS "users_own_topics"  ON topics;

CREATE POLICY "users_own_groups" ON groups FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_topics" ON topics FOR ALL TO authenticated
  USING  (group_id IN (SELECT id FROM groups WHERE user_id = auth.uid()))
  WITH CHECK (group_id IN (SELECT id FROM groups WHERE user_id = auth.uid()));
