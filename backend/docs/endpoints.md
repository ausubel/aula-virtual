### 1. *Autenticación y Registro*
- POST /api/auth/register: Registra un nuevo usuario (participante).
- POST /api/auth/login: Permite que los usuarios inicien sesión.
- GET /api/auth/profile: Devuelve la información del perfil del usuario autenticado.

### 2. *Gestión de Cursos*
- GET /api/courses: Lista todos los cursos disponibles.
- GET /api/courses/{courseId}: Obtiene información detallada de un curso específico.
- POST /api/courses/{courseId}/start: Marca como iniciado un curso.

### 3. *Dashboard del Participante*
- GET /api/dashboard: Muestra el progreso general de todos los estudiantes.
- GET /api/dashboard/{studentId}: Muestra el progreso individual de un estudiante.
- GET /api/dashboard/student/all: Muestra los detalles de todos los estudiantes.
- GET /api/dashboard/student/{studentId}: Muestra el detalle de un estudiante específico.
- GET /api/dashboard/student/cv/{studentId}: Muestra el CV del estudiante.

### 4. *Certificados*
- GET /api/certificate/all/{studentId}: Obtiene todos los certificados un estudiante.
- GET /api/certificate/{courseId}: Obtiene el certificado del curso al finalizarlo.

### 5. *Gestión de Archivos*
- POST /api/files/upload: Permite que los usuarios suban documentos como el CV.
- GET /api/files/{fileId}: Accede a un archivo específico.

### 6. *Notificaciones por Email*
- POST api/email/notification: Envía emails de notificación.
  - Body: { email: string, subject: string, message: string }
  - Respuesta: { success: boolean, message: string }
