/*
  # Add request_type column to access_requests

  1. Modified Tables
    - `access_requests`
      - Added `request_type` (text) - applicant or employer, defaults to employer

  2. Notes
    - Supports two types of incoming requests: applicant/bootcamp and employer/company
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'request_type'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN request_type text NOT NULL DEFAULT 'employer' CHECK (request_type IN ('applicant', 'employer'));
  END IF;
END $$;
