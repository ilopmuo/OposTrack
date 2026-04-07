-- OpoTracker — schema + seed data
-- Run this in the Supabase SQL editor

-- ── Tables ──────────────────────────────────────────────────────────────────

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

-- ── RLS (anon full access — app personal sin auth) ───────────────────────────

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_groups" ON groups;
DROP POLICY IF EXISTS "anon_all_topics" ON topics;

CREATE POLICY "anon_all_groups" ON groups FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_topics" ON topics FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── Seed data ────────────────────────────────────────────────────────────────

-- Bloque I
INSERT INTO groups (id, name, position) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Bloque I · Organización del Estado',           1),
  ('11111111-0000-0000-0000-000000000002', 'Bloque II · Derecho Administrativo',            2),
  ('11111111-0000-0000-0000-000000000003', 'Bloque III · Hacienda Pública',                 3),
  ('11111111-0000-0000-0000-000000000004', 'Bloque IV · Administración Electrónica',        4),
  ('11111111-0000-0000-0000-000000000005', 'Bloque V · Igualdad y Diversidad',              5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (group_id, name, position) VALUES
  -- Bloque I
  ('11111111-0000-0000-0000-000000000001', 'Tema 1. La Constitución Española de 1978. Estructura y contenido esencial',         1),
  ('11111111-0000-0000-0000-000000000001', 'Tema 2. Derechos y deberes fundamentales. Garantías y suspensión',                  2),
  ('11111111-0000-0000-0000-000000000001', 'Tema 3. La Corona. El Poder Legislativo. Congreso y Senado',                        3),
  ('11111111-0000-0000-0000-000000000001', 'Tema 4. El Gobierno y la Administración del Estado',                                4),
  ('11111111-0000-0000-0000-000000000001', 'Tema 5. El Poder Judicial. El Tribunal Constitucional',                             5),
  ('11111111-0000-0000-0000-000000000001', 'Tema 6. Organización territorial del Estado. CCAA y entidades locales',             6),
  -- Bloque II
  ('11111111-0000-0000-0000-000000000002', 'Tema 7. El acto administrativo. Concepto, clases y eficacia',                       1),
  ('11111111-0000-0000-0000-000000000002', 'Tema 8. El procedimiento administrativo común (LPACAP)',                            2),
  ('11111111-0000-0000-0000-000000000002', 'Tema 9. Los recursos administrativos. El recurso contencioso-administrativo',       3),
  ('11111111-0000-0000-0000-000000000002', 'Tema 10. La responsabilidad patrimonial de la Administración Pública',              4),
  ('11111111-0000-0000-0000-000000000002', 'Tema 11. Los contratos del sector público. Tipología y procedimientos',             5),
  ('11111111-0000-0000-0000-000000000002', 'Tema 12. El personal al servicio de las AAPP. TREBEP',                              6),
  -- Bloque III
  ('11111111-0000-0000-0000-000000000003', 'Tema 13. Los Presupuestos Generales del Estado. Estructura y ciclo presupuestario',  1),
  ('11111111-0000-0000-0000-000000000003', 'Tema 14. El sistema tributario español. IRPF, IVA e IS',                            2),
  ('11111111-0000-0000-0000-000000000003', 'Tema 15. La Ley General Tributaria. Obligados tributarios y deuda tributaria',      3),
  ('11111111-0000-0000-0000-000000000003', 'Tema 16. El control financiero. El Tribunal de Cuentas',                            4),
  -- Bloque IV
  ('11111111-0000-0000-0000-000000000004', 'Tema 17. La Administración Electrónica. Sede electrónica y registro',               1),
  ('11111111-0000-0000-0000-000000000004', 'Tema 18. Protección de datos. Reglamento (UE) 2016/679 y LOPDGDD',                  2),
  ('11111111-0000-0000-0000-000000000004', 'Tema 19. Ofimática: hojas de cálculo, procesadores de texto y BBDD',                3),
  ('11111111-0000-0000-0000-000000000004', 'Tema 20. Internet. Correo electrónico. Seguridad informática básica',               4),
  -- Bloque V
  ('11111111-0000-0000-0000-000000000005', 'Tema 21. Igualdad efectiva de mujeres y hombres. Ley Orgánica 3/2007',              1),
  ('11111111-0000-0000-0000-000000000005', 'Tema 22. Violencia de género. Ley Orgánica 1/2004',                                 2),
  ('11111111-0000-0000-0000-000000000005', 'Tema 23. Políticas de igualdad y diversidad en la Administración Pública',          3);
