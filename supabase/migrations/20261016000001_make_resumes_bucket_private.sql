/*
  # Make the resumes bucket private

  A resume carries the candidate's own phone and email, and companies must reach
  candidates only through VeneHire. With a public bucket anyone holding the URL
  (including anonymous visitors of /talent/[slug]) could open the file.

  Access now goes through signed URLs, gated by the existing storage.objects
  policies: the owner, admins, and employers (only for visible applicants).
*/

UPDATE storage.buckets SET public = false WHERE id = 'resumes';
