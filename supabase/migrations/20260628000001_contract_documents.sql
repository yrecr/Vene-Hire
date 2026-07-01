ALTER TABLE selection_processes
  ADD COLUMN IF NOT EXISTS contract_url TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT;
