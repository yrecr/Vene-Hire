-- Fase 9 — Seguridad
--
-- La Fase 7 se implementó originalmente con el empleador aprobando las horas.
-- Luego se cambió a "Opción B": solo el admin aprueba (app/api/timesheets/review).
-- La política de UPDATE del empleador quedó viva, así que un empleador todavía
-- puede escribir directo en `timesheets` desde el cliente: marcar sus propias
-- horas como 'approved' y hasta apuntar `invoice_url` a un archivo suyo,
-- saltándose por completo la ruta de admin y la generación real de la factura.
--
-- El empleador conserva su política de SELECT ("Employers read own process
-- timesheets"), que es justo lo que la UI necesita (banner de solo lectura).

DROP POLICY IF EXISTS "Employers review own process timesheets" ON timesheets;
