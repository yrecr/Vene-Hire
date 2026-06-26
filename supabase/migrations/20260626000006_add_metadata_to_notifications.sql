/*
  # Add metadata column to notifications table

  Adds a JSONB `metadata` column to the `notifications` table to support
  structured data attached to notifications (e.g., join_url for Zoom meetings).

  The column is nullable and defaults to NULL so existing rows are unaffected.
*/

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT NULL;

-- Optional: index on metadata for future querying
CREATE INDEX IF NOT EXISTS notifications_metadata_idx ON notifications USING gin (metadata);
