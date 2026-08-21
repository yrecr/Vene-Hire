/*
  # Fase 4: shortlists (real bug fix — toggleShortlist never persisted)

  1. New Table
    - `shortlists` — which talent_profiles an employer has starred.
      Never existed as a table; the whole feature lived only in React
      state and was lost every session.

  2. Security
    - RLS enabled. Employers can only read their own shortlist rows.
    - No direct INSERT/DELETE policies: writes go through
      /api/shortlist/toggle (service-role), same pattern as the rest of
      the app's employer-owned write paths.
*/

CREATE TABLE IF NOT EXISTS shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employer_profiles(id) ON DELETE CASCADE NOT NULL,
  talent_profile_id uuid REFERENCES talent_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employer_id, talent_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlists_employer_id ON shortlists(employer_id);

ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can read own shortlist"
  ON shortlists FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all shortlists"
  ON shortlists FOR SELECT
  TO authenticated
  USING (public.user_role() = 'admin');
