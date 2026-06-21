### 1. Flujo y Lógica de las Entrevistas

- **Proceso en Dos Fases:** El sistema de selección debe estructurarse obligatoriamente en dos etapas consecutivas:
    1. **Entrevista Introductoria:** Primer filtro, enfocado en el perfil general.
    2. **Entrevista Técnica:** Evaluación profunda de habilidades.
- **Gestión de Estados:** Es necesario asegurar que el flujo refleje claramente en qué fase se encuentra el candidato y qué acciones tiene habilitadas cada rol según ese estado.
### 2. Integraciones Técnicas Clave

- **Integración con la API de Zoom:** Automatizar la creación de salas de reuniones. Cuando un empleador o administrador programe una entrevista, el sistema debe generar el enlace de Zoom de forma dinámica y notificar/actualizar las agendas de las partes involucradas.

- **Módulo de Contratación y Firma Digital:** Desarrollar o refinar el flujo para la firma de contratos. Mencionó el uso de **plantillas PDF** que se deben rellenar automáticamente con los datos del candidato y de la empresa para proceder a su validación o firma digital dentro de la plataforma.
    

### 3. Ajustes y Lógica por Roles (Dashboards)

- **Panel de Administrador (Admin Dashboard):**
    
    - **Control de Accesos:** Gestión estricta de quién entra a la plataforma. Validar y aprobar las solicitudes de "demos" por parte de nuevas empresas.
        
    - **Semillero de Talentos:** Controlar el flujo de registro y admisión de nuevos perfiles al programa de talentos.
        
    - **Sección de Bootcamps:** Administrar, crear y actualizar los bootcamps disponibles, así como la carga de recursos descargables o material de apoyo.
        
- **Panel de Empleador (Employer Dashboard):**
    
    - **Agilidad en Selección:** Optimizar la interfaz para que la revisión de perfiles sea rápida.
        
    - **Solicitud Directa:** Permitir al empleador solicitar entrevistas de manera fluida basándose en la disponibilidad del candidato.
        
- **Panel de Candidato (Applicant Dashboard):**
    
    - **Multimedia y Perfil:** Asegurar la correcta carga y visualización de currículums y, fundamentalmente, de los **videos de presentación**.
        
    - **Agenda:** Mantener un control claro sobre la disponibilidad horaria del postulante para evitar cruces en las asignaciones de Zoom.