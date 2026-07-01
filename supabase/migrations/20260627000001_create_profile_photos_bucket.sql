/*
  # Create profile-photos storage bucket

  1. Storage
    - Create `profile-photos` bucket (public)
    - Files stored at `{talent_profile_id}/photo.{ext}`
    - Accepts common image MIME types
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;
