-- Fase 13 — Reglas de contratación única
--
-- Nada impedía crear un segundo selection_process 'hired' para el mismo
-- aplicante (con la misma empresa o con otra), lo que confundía el envío de
-- horas (¿a cuál contrato pertenecen?). Y nada impedía a un empleador tener
-- dos procesos 'active' en paralelo con el mismo candidato.
--
-- Antes de crear el índice: venehire-dev YA tiene un duplicado real (Sofia
-- Ramirez con dos procesos 'hired' distintos en ACME Corp, de pruebas de QA
-- anteriores) — CREATE UNIQUE INDEX fallaría directo contra datos existentes
-- que lo violan. Nos quedamos con el 'hired' más reciente por aplicante y
-- pasamos los demás a 'on_hold' (el único status "en pausa" del enum) para
-- que un admin los revise manualmente en vez de perder el historial.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY applicant_id ORDER BY created_at DESC) AS rn
  FROM selection_processes
  WHERE status = 'hired'
)
UPDATE selection_processes sp
SET status = 'on_hold',
    notes = trim(both ' ' from coalesce(sp.notes, '') || ' [Fase 13] Duplicate hire auto-resolved — another process for this applicant is the active hire.')
FROM ranked
WHERE sp.id = ranked.id AND ranked.rn > 1;

-- Un aplicante solo puede estar 'hired' en un proceso a la vez, globalmente.
CREATE UNIQUE INDEX IF NOT EXISTS one_hired_process_per_applicant
  ON selection_processes (applicant_id)
  WHERE status = 'hired';

-- Mismo problema de datos existentes: Sofia Ramirez tiene 3 procesos 'active'
-- distintos con ACME Corp. Nos quedamos con el más reciente por par
-- empleador+aplicante y pasamos los demás a 'on_hold'.
WITH ranked_active AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY employer_id, applicant_id ORDER BY created_at DESC) AS rn
  FROM selection_processes
  WHERE status = 'active'
)
UPDATE selection_processes sp
SET status = 'on_hold',
    notes = trim(both ' ' from coalesce(sp.notes, '') || ' [Fase 13] Duplicate active process auto-resolved — another process with this employer is the current one.')
FROM ranked_active
WHERE sp.id = ranked_active.id AND ranked_active.rn > 1;

-- Un empleador no puede tener dos procesos 'active' en paralelo con el mismo
-- candidato (sí puede tener uno 'active' con un candidato y otro
-- 'not_selected'/'hired' con el mismo — ese historial es válido).
CREATE UNIQUE INDEX IF NOT EXISTS one_active_process_per_employer_applicant
  ON selection_processes (employer_id, applicant_id)
  WHERE status = 'active';

-- Backfill: contrataciones reales de antes de esta fase nunca marcaron
-- availability_status = 'Hired' (esa lógica es nueva, ver contracts/verify).
-- Sin esto, alguien ya contratado seguiría apareciendo como disponible en
-- Browse Applicants hasta su próxima edición de perfil.
UPDATE talent_profiles tp
SET availability_status = 'Hired'
WHERE availability_status <> 'Hired'
  AND EXISTS (
    SELECT 1 FROM selection_processes sp
    WHERE sp.applicant_id = tp.id AND sp.status = 'hired'
  );
