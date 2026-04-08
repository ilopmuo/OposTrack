-- ── 1. Tabla exams ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_exams" ON exams;
CREATE POLICY "users_own_exams" ON exams FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. Añadir exam_id a groups (nullable primero para la migración) ───────────
ALTER TABLE groups ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES exams(id) ON DELETE CASCADE;

-- ── 3. Crear un examen por defecto para cada usuario que ya tiene grupos ──────
DO $$
DECLARE
  uid UUID;
  eid UUID;
BEGIN
  FOR uid IN SELECT DISTINCT user_id FROM groups WHERE exam_id IS NULL LOOP
    INSERT INTO exams (user_id, name, position)
    VALUES (uid, 'Mi oposición', 0)
    RETURNING id INTO eid;

    UPDATE groups SET exam_id = eid WHERE user_id = uid AND exam_id IS NULL;
  END LOOP;
END $$;

-- ── 4. Hacer exam_id NOT NULL ahora que todos los grupos tienen uno ────────────
ALTER TABLE groups ALTER COLUMN exam_id SET NOT NULL;

-- ── 5. Actualizar política de groups para incluir exam_id en los inserts ──────
DROP POLICY IF EXISTS "users_own_groups" ON groups;
CREATE POLICY "users_own_groups" ON groups FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
