-- Fase 10 — Pulido de cara al cliente
--
-- El formulario público de Contacto solo hacía console.log del submit — el
-- mensaje se perdía por completo. Esta tabla le da un destino real, con el
-- mismo patrón de RLS que access_requests (insert público, lectura/gestión
-- solo admin).

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'new');

CREATE POLICY "Admins manage contact messages"
  ON contact_messages FOR ALL
  TO authenticated
  USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');
