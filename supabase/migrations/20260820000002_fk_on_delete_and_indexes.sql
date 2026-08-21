/*
  # Fase 4: ON DELETE + missing RLS-join indexes

  1. Problem
    - No FK in the schema has an ON DELETE clause, so deleting a profile
      (or any parent row) with dependent rows fails with a bare FK
      violation instead of cleaning up or being explicitly blocked.
    - Only one index exists in the whole schema. RLS policies on
      selection_processes/interview_requests/notifications/candidates all
      join through applicant_id/employer_id/user_id/vacancy_id with no
      index backing those lookups.

  2. Strategy
    - CASCADE for rows that only make sense in the context of their parent
      (skills, availability slots, notifications, enrollments, interview
      requests, selection processes, contract approvals, vacancies,
      candidates) — deleting the parent (e.g. a test profile) should
      clean up its whole graph instead of failing.
    - SET NULL for rows that should survive their parent going away
      (a resource outliving its bootcamp, an access_request surviving
      the admin who reviewed it).
    - Postgres auto-names single-column FKs as `<table>_<column>_fkey`,
      which is what every FK in this schema uses (verified: none were
      created with an explicit CONSTRAINT name) — safe to reference here.
*/

-- profiles.auth_user_id -> auth.users(id): deleting the Supabase auth
-- user should remove the app profile too.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_auth_user_id_fkey
  FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- talent_profiles.user_id -> profiles(id)
ALTER TABLE talent_profiles DROP CONSTRAINT IF EXISTS talent_profiles_user_id_fkey;
ALTER TABLE talent_profiles ADD CONSTRAINT talent_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- talent_skills.talent_profile_id -> talent_profiles(id)
ALTER TABLE talent_skills DROP CONSTRAINT IF EXISTS talent_skills_talent_profile_id_fkey;
ALTER TABLE talent_skills ADD CONSTRAINT talent_skills_talent_profile_id_fkey
  FOREIGN KEY (talent_profile_id) REFERENCES talent_profiles(id) ON DELETE CASCADE;

-- employer_profiles.user_id -> profiles(id)
ALTER TABLE employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_user_id_fkey;
ALTER TABLE employer_profiles ADD CONSTRAINT employer_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- availability_slots.applicant_id -> talent_profiles(id)
ALTER TABLE availability_slots DROP CONSTRAINT IF EXISTS availability_slots_applicant_id_fkey;
ALTER TABLE availability_slots ADD CONSTRAINT availability_slots_applicant_id_fkey
  FOREIGN KEY (applicant_id) REFERENCES talent_profiles(id) ON DELETE CASCADE;

-- selection_processes.applicant_id / employer_id
ALTER TABLE selection_processes DROP CONSTRAINT IF EXISTS selection_processes_applicant_id_fkey;
ALTER TABLE selection_processes ADD CONSTRAINT selection_processes_applicant_id_fkey
  FOREIGN KEY (applicant_id) REFERENCES talent_profiles(id) ON DELETE CASCADE;
ALTER TABLE selection_processes DROP CONSTRAINT IF EXISTS selection_processes_employer_id_fkey;
ALTER TABLE selection_processes ADD CONSTRAINT selection_processes_employer_id_fkey
  FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_selection_processes_applicant_id ON selection_processes(applicant_id);
CREATE INDEX IF NOT EXISTS idx_selection_processes_employer_id ON selection_processes(employer_id);

-- interview_requests.applicant_id / employer_id
ALTER TABLE interview_requests DROP CONSTRAINT IF EXISTS interview_requests_applicant_id_fkey;
ALTER TABLE interview_requests ADD CONSTRAINT interview_requests_applicant_id_fkey
  FOREIGN KEY (applicant_id) REFERENCES talent_profiles(id) ON DELETE CASCADE;
ALTER TABLE interview_requests DROP CONSTRAINT IF EXISTS interview_requests_employer_id_fkey;
ALTER TABLE interview_requests ADD CONSTRAINT interview_requests_employer_id_fkey
  FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_interview_requests_applicant_id ON interview_requests(applicant_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_employer_id ON interview_requests(employer_id);

-- notifications.user_id -> profiles(id)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- contract_approval_requests.process_id -> selection_processes(id)
ALTER TABLE contract_approval_requests DROP CONSTRAINT IF EXISTS contract_approval_requests_process_id_fkey;
ALTER TABLE contract_approval_requests ADD CONSTRAINT contract_approval_requests_process_id_fkey
  FOREIGN KEY (process_id) REFERENCES selection_processes(id) ON DELETE CASCADE;

-- vacancies.employer_id / candidates.vacancy_id
ALTER TABLE vacancies DROP CONSTRAINT IF EXISTS vacancies_employer_id_fkey;
ALTER TABLE vacancies ADD CONSTRAINT vacancies_employer_id_fkey
  FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_vacancy_id_fkey;
ALTER TABLE candidates ADD CONSTRAINT candidates_vacancy_id_fkey
  FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE;

-- enrollments: both sides CASCADE (an enrollment record is meaningless
-- without either the student or the bootcamp it belongs to)
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_student_profile_id_fkey;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_student_profile_id_fkey
  FOREIGN KEY (student_profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_bootcamp_id_fkey;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_bootcamp_id_fkey
  FOREIGN KEY (bootcamp_id) REFERENCES bootcamps(id) ON DELETE CASCADE;

-- resources.bootcamp_id: nullable, a resource should survive its
-- bootcamp being deleted rather than disappear.
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_bootcamp_id_fkey;
ALTER TABLE resources ADD CONSTRAINT resources_bootcamp_id_fkey
  FOREIGN KEY (bootcamp_id) REFERENCES bootcamps(id) ON DELETE SET NULL;

-- access_requests.reviewed_by: nullable, keep the request record even
-- if the reviewing admin's profile is later deleted.
ALTER TABLE access_requests DROP CONSTRAINT IF EXISTS access_requests_reviewed_by_fkey;
ALTER TABLE access_requests ADD CONSTRAINT access_requests_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
