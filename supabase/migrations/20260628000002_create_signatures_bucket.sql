INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;
