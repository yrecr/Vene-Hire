-- Fase 14 — Timesheet atado a fechas reales de contrato
--
-- El calendario de horas usaba siempre "el mes calendario actual del reloj
-- del sistema" porque no había ningún dato de cuándo empezó o termina el
-- contrato. Estas dos columnas nuevas son la base para que el timesheet
-- viva dentro del rango real del contrato en vez de un mes fijo.

ALTER TABLE selection_processes
  ADD COLUMN IF NOT EXISTS contract_start_date date,
  ADD COLUMN IF NOT EXISTS contract_end_date date;

-- Backfill: procesos ya 'hired' hoy no tienen contract_start_date porque esa
-- lógica es nueva (ver contracts/verify) — usamos su created_at como mejor
-- aproximación disponible en vez de dejarlo NULL.
UPDATE selection_processes
SET contract_start_date = created_at::date
WHERE status = 'hired' AND contract_start_date IS NULL;
