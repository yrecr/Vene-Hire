-- Fase 11 — Detalles menores de seguridad
--
-- 1) talent_profiles: applicants self-update their own row (see
--    upsertTalentProfile in lib/supabase-service.ts, which UPDATEs under the
--    applicant's own RLS session — this is intentional, it's how Fase 8's
--    auto-publish-on-complete-profile works). But nothing stops the same
--    request from also flipping `featured`, which is a pure admin curation
--    flag with no legitimate self-service write path. A BEFORE UPDATE trigger
--    resets it for any authenticated caller who isn't an admin; service-role
--    writes (admin routes) have no auth.uid() and are unaffected.
--    `public_visible` is deliberately NOT touched here — the applicant
--    genuinely needs to set that themselves once their profile is complete.

CREATE OR REPLACE FUNCTION public.protect_talent_profile_admin_fields()
RETURNS trigger AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND public.user_role() <> 'admin' THEN
    NEW.featured := OLD.featured;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_talent_profile_admin_fields_trigger ON talent_profiles;
CREATE TRIGGER protect_talent_profile_admin_fields_trigger
  BEFORE UPDATE ON talent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_talent_profile_admin_fields();

-- 2) access_requests: the public submission form only ever needs to insert a
--    brand-new pending, unreviewed request. `WITH CHECK (true)` let a caller
--    spoof status='approved' or set reviewed_by directly in the same request.
DROP POLICY IF EXISTS "Anyone can submit access requests" ON access_requests;
CREATE POLICY "Anyone can submit access requests"
  ON access_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_by IS NULL);
