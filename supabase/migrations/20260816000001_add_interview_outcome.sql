-- Fase 0: agendamiento manual reemplaza a Zoom/n8n. interview_requests.meeting_url
-- ya existía y sigue sirviendo (se llena a mano ahora); solo falta dónde registrar
-- el resultado de la entrevista.
alter table public.interview_requests
  add column outcome text check (outcome is null or outcome in ('passed', 'failed')),
  add column outcome_notes text not null default '';
