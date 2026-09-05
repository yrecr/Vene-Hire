-- Fase 15 — Notificar a los admins de solicitudes de acceso nuevas
--
-- request-sign-up es un formulario público sin sesión: el cliente no puede
-- llamar a /api/notifications/create (exige requireSession) ni insertar en
-- notifications directo (la política de INSERT exige ser admin autenticado).
-- Un trigger AFTER INSERT con SECURITY DEFINER resuelve esto sin tocar el
-- código de la app — la propia base de datos avisa a todos los admins en
-- cuanto llega una fila nueva a access_requests.

CREATE OR REPLACE FUNCTION public.notify_admins_new_access_request()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
  SELECT gen_random_uuid(), p.id, 'New Access Request',
         NEW.full_name || ' requested access as ' || NEW.request_type || '.',
         'request', false, now()
  FROM profiles p
  WHERE p.role = 'admin';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_notify_admins_new_access_request ON access_requests;
CREATE TRIGGER trg_notify_admins_new_access_request
  AFTER INSERT ON access_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_access_request();
