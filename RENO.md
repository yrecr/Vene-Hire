## 0. Alcance del Requerimiento (Scope)
* **IMPORTANTE:** Este sistema tendrá múltiples módulos a futuro (Candidatos globales, Entrevistas, Analytics, Configuración), pero **este prompt es EXCLUSIVAMENTE para construir la vista y la lógica del módulo "Vacantes"**.
* Ignora la navegación global o el enrutamiento general por ahora. Concéntrate únicamente en la estructura, base de datos y UI de la pantalla de Vacantes y el detalle/modal de sus postulantes con IA.

# PROMPT: Creación de Vista de Reclutamiento ATS con Integración de IA

## 1. Contexto del Proyecto
Estoy desarrollando un Sistema de Gestión de Candidatos (ATS) inteligente. El objetivo es que el sistema procese los CVs de los postulantes con un LLM (en este caso, `deepseek-chat`), extraiga su información, les asigne un score de coincidencia (0-100) respecto a la vacante, y permita a los reclutadores gestionar el flujo.

## 2. Stack Tecnológico Sugerido
* **Backend / API:** [Inserta tu backend, ej: Laravel / Node.js / Supabase]
* **Frontend:** [Inserta tu frontend, ej: React / Blade / Next.js] con Tailwind CSS (Tema Oscuro / Dark Mode).
* **Procesamiento IA:** Integración en segundo plano que guarda un JSON estructurado por cada candidato.

## 3. Estructura de Datos Relevante (Modelos/Tablas)
Necesito que consideres las siguientes entidades y relaciones:
* **Vacante (Vacancy):** `id`, `titulo`, `departamento`, `ubicacion`, `tipo_jornada`, `modalidad`, `estado` (Abierta/Cerrada), `fecha_publicacion`.
* **Candidato (Candidate):** `id`, `nombre`, `iniciales`, `vacante_id`, `score` (entero, 0-100), `estado_manual` (Oferta, Entrevista, Recibido), `estado_ia` (Avanzar, Hold, Rechazar), `fecha_aplicacion`.
* **PerfilIA (AI_Profile):** Relación 1:1 con Candidato (o campo JSON). Debe contener:
    * `resumen_perfil` (string)
    * `razonamiento_modelo` (string)
    * `fortalezas` (array de strings)
    * `areas_mejora` (array de strings)
    * `metadatos` (`modelo_usado`, `tiempo_respuesta`, `tokens_totales`).

## 4. Requerimientos de la Vista (Frontend)
Necesito crear un flujo de dos niveles (o vistas anidadas mediante modales/rutas):

### Nivel 1: Dashboard General de Vacantes
* **Kpi Cards (Métricas):** Tres tarjetas superiores:
    1. Total de Vacantes Activas (`COUNT` de vacantes abiertas).
    2. Total de Candidatos (`COUNT` global).
    3. Promedio de candidatos por vacante (Candidatos / Vacantes Activas).
* **Grid de Vacantes:** Renderizar tarjetas para cada vacante mostrando su título, badges de metadatos (Ubicación, Jornada, Modalidad), un contador de aplicantes específicos de esa vacante, y un botón "Ver candidatos →".

### Nivel 2: Lista de Candidatos & Perfil IA (Modal o Vista Filtrada)
Al hacer clic en "Ver candidatos", se debe desplegar la lista de postulantes para esa vacante con las siguientes reglas:
* **Ordenamiento:** Ordenados estrictamente de mayor a menor score (`ORDER BY score DESC`).
* **Gamificación:** Los top 3 candidatos deben mostrar un badge visual de medalla (Oro para el 1º, Plata para el 2º, Bronce para el 3º).
* **Fila del Candidato:** Mostrar iniciales, nombre, badge de `estado_ia`, un selector (`select/dropdown`) para cambiar el `estado_manual` en tiempo real, y un botón expandible llamado "Perfil IA v".
* **Componente Expandible (Sección IA):** Al expandirse, debe mostrar:
    * El bloque de "Resumen de Perfil" y "Razonamiento del modelo".
    * Dos columnas: una verde para "Fortalezas" y otra roja para "Áreas de mejora" iterando los arrays de strings.
    * Un footer interno con los metadatos de auditoría: modelo utilizado (`deepseek-chat`), tokens y tiempo de respuesta.

## 5. ¿Qué necesito que hagas?
Genera el código limpio y modular para:
1. El diseño de la base de datos / migraciones necesarias.
2. Los componentes del frontend utilizando Tailwind CSS para lograr una interfaz moderna en modo oscuro, asegurando que la sección "Perfil IA" maneje correctamente el estado de apertura/cierre de forma independiente para cada candidato.