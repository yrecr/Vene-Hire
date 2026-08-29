CREATE TABLE IF NOT EXISTS contract_approval_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id     UUID NOT NULL REFERENCES selection_processes(id),
  employer_id    UUID NOT NULL,
  applicant_id   UUID NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ
);
