import { AuthService } from './auth.service';

interface CreateCourseData {
  name: string;
  description: string;
  hours: number;
  teacherId: number;
}

interface AssignStudentsData {
  courseId: number;
  studentIds: number[];
}

interface CreateLessonData {
  courseId: number;
  title: string;
  description: string;
  time: number;
  videoPath?: string;
}

interface CreateVideoData {
  lessonId: number;
  videoPath: string;
}

interface UpdateLessonData {
  title: string;
  description: string;
  time: number;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  time: number;
  videos: Video[];
}

interface Video {
  id: number;
  videoPath: string;
  lessonId?: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  progress?: number;
}

export class CoursesService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  static async createCourse(data: CreateCourseData) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al crear el curso');
      return await response.json();
    } catch (error) {
      console.error('Error en createCourse:', error);
      throw error;
    }
  }

  static async getAllCourses() {
    try {
      console.log('Llamando al backend:', `${this.BASE_URL}/courses`)
      const token = AuthService.getToken()
      
      if (!token) {
        throw new Error('No hay token de autenticación')
      }
      
      console.log('Token disponible:', !!token)
      
      const response = await fetch(`${this.BASE_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del backend:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Error al obtener los cursos: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Datos recibidos (estructura completa):', JSON.stringify(data, null, 2))
      
      if (!Array.isArray(data)) {
        console.error('La respuesta no es un array:', data)
        return []
      }

      // Asegurarnos de que cada elemento tiene la estructura correcta
      const validCourses = data.map(course => {
        if (Array.isArray(course)) {
          // Si es un array, intentamos convertirlo a la estructura esperada
          const [id, name, description, hours, teacherId, teacherName, studentCount] = course
          return {
            id: Number(id),
            name: String(name || ''),
            description: String(description || ''),
            hours: Number(hours || 0),
            teacherId: Number(teacherId || 0),
            teacherName: teacherName ? String(teacherName) : undefined,
            studentCount: studentCount ? Number(studentCount) : 0
          }
        }
        return course
      })
      
      console.log('Cursos procesados:', validCourses)
      return validCourses
    } catch (error) {
      console.error('Error en getAllCourses:', error)
      throw error
    }
  }

  static async assignStudents(data: AssignStudentsData) {
    try {
      console.log('Asignando estudiantes al curso:', data.courseId);
      console.log('Lista de estudiantes:', data.studentIds);
      
      if (!Array.isArray(data.studentIds) || data.studentIds.length === 0) {
        throw new Error('No hay estudiantes seleccionados para asignar');
      }
      
      const response = await fetch(`${this.BASE_URL}/courses/${data.courseId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({ studentIds: data.studentIds })
      });

      console.log('Respuesta del servidor (status):', response.status);
      
      const responseData = await response.json();
      console.log('Respuesta del servidor (data):', responseData);
      
      if (!response.ok) {
        const errorMessage = responseData.message || 'Error al asignar estudiantes';
        console.error('Error en la respuesta:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error en assignStudents:', error);
      throw error;
    }
  }

  static async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    try {
      console.log('Obteniendo lecciones para el curso:', courseId);
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}/lessons`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al obtener las lecciones');
      }

      const data = await response.json();
      console.log('=== DATOS DEL BACKEND ===');
      console.log('Datos sin procesar:', data);
      console.log('Tipo de data:', typeof data);
      if (Array.isArray(data)) {
        console.log('Número de lecciones:', data.length);
        data.forEach((lesson, index) => {
          console.log(`\nLección ${index + 1}:`, lesson);
          console.log('Videos de la lección:', lesson.videos);
        });
      }
      console.log('========================');

      // Asegurarnos de que cada lección tiene la estructura correcta
      const lessons = data.map((lesson: any) => {
        console.log(`\nProcesando lección ${lesson.id}:`);
        
        let videos = [];
        
        // Procesar el array de videos
        if (lesson.videos) {
          try {
            // Si videos es un string, intentamos parsearlo
            if (typeof lesson.videos === 'string') {
              videos = JSON.parse(lesson.videos);
            } else {
              videos = lesson.videos;
            }
            
            // Asegurarnos de que videos es un array y filtrar valores nulos
            videos = Array.isArray(videos) ? videos.filter(v => v !== null) : [];
            console.log('Videos procesados:', videos);
          } catch (e) {
            console.error('Error al procesar videos:', e);
            videos = [];
          }
        }
        // Compatibilidad con el formato anterior (videoPath y videoId)
        else if (lesson.videoPath && lesson.videoId) {
          videos = [
            {
              id: lesson.videoId,
              videoPath: lesson.videoPath
            }
          ];
        }

        const processedLesson = {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          time: lesson.time,
          videos
        };
        console.log('Lección procesada:', processedLesson);
        return processedLesson;
      });

      console.log('\n=== RESULTADO FINAL ===');
      console.log('Lecciones procesadas:', lessons);
      return lessons;
    } catch (error) {
      console.error('Error en getLessonsByCourse:', error);
      throw error;
    }
  }

  static async createLesson(data: CreateLessonData) {
    try {
      const { courseId, ...lessonData } = data;
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(lessonData)
      });

      if (!response.ok) throw new Error('Error al crear la lección');
      return await response.json();
    } catch (error) {
      console.error('Error en createLesson:', error);
      throw error;
    }
  }

  static async addVideoToLesson(lessonId: number, data: { videoPath: string }): Promise<Video> {
    try {
      console.log('Agregando video a la lección:', lessonId, data);
      
      const response = await fetch(`${this.BASE_URL}/courses/lessons/${lessonId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoPath: data.videoPath })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al agregar el video');
      }

      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);

      return {
        id: responseData.id,
        videoPath: responseData.videoPath || responseData.video_path,
        lessonId: responseData.lessonId || responseData.lesson_id
      };
    } catch (error) {
      console.error('Error en addVideoToLesson:', error);
      throw error;
    }
  }

  static async getCourseDetails(courseId: number) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener los detalles del curso');
      return await response.json();
    } catch (error) {
      console.error('Error en getCourseDetails:', error);
      throw error;
    }
  }

  static async getStudentsByCourse(courseId: number): Promise<Student[]> {
    try {
      console.log('Obteniendo estudiantes del curso:', courseId);
      
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      
      console.log('Respuesta del servidor (status):', response.status);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No se pudo leer el mensaje de error');
        console.error('Error en la respuesta del servidor:', errorText);
        throw new Error(`Error al obtener los estudiantes del curso: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2));

      // Normalizar la respuesta para asegurar un formato consistente
      let students: Student[] = [];
      
      // Si la respuesta es null o undefined, devolver array vacío
      if (!data) {
        console.log('La respuesta es null o undefined, devolviendo array vacío');
        return [];
      }
      
      // Si la respuesta ya es un array de estudiantes
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('La respuesta es un array vacío');
          return [];
        }
        
        // Verificar si es un array de objetos con la estructura esperada
        if (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
          console.log('Formato de respuesta: array de objetos estudiante');
          students = data;
        }
        // Si es un array anidado (formato antiguo)
        else if (Array.isArray(data[0])) {
          console.log('Formato de respuesta: array anidado');
          
          // Si el primer elemento es un array de estudiantes
          if (Array.isArray(data[0][0])) {
            students = data[0][0];
          } 
          // Si el primer elemento ya contiene los estudiantes
          else if (Array.isArray(data[0]) && typeof data[0][0] === 'object') {
            students = data[0];
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        // Si la respuesta es un objeto, intentar extraer los estudiantes
        console.log('Formato de respuesta: objeto');
        if ('students' in data && Array.isArray(data.students)) {
          students = data.students;
        }
      }
      
      // Asegurarse de que todos los estudiantes tienen la estructura correcta
      return students.map(student => ({
        id: typeof student.id === 'number' ? student.id : parseInt(student.id) || 0,
        name: student.name || 'Sin nombre',
        email: student.email || 'Sin email',
        progress: typeof student.progress === 'number' ? student.progress : 0
      }));
    } catch (error) {
      console.error('Error en getStudentsByCourse:', error);
      throw error;
    }
  }

  static async getAllStudents(): Promise<Student[]> {
    try {
      console.log('Obteniendo todos los estudiantes');
      
      const response = await fetch(`${this.BASE_URL}/courses/students`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      console.log('Respuesta del servidor (status):', response.status);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No se pudo leer el mensaje de error');
        console.error('Error en la respuesta del servidor:', errorText);
        throw new Error(`Error al obtener todos los estudiantes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2));

      // Normalizar la respuesta para asegurar un formato consistente
      let students: Student[] = [];
      
      // Si la respuesta es null o undefined, devolver array vacío
      if (!data) {
        console.log('La respuesta es null o undefined, devolviendo array vacío');
        return [];
      }
      
      // Si la respuesta ya es un array de estudiantes
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('La respuesta es un array vacío');
          return [];
        }
        
        // Verificar si es un array de objetos con la estructura esperada
        if (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
          console.log('Formato de respuesta: array de objetos estudiante');
          students = data;
        }
        // Si es un array anidado (formato antiguo)
        else if (Array.isArray(data[0])) {
          console.log('Formato de respuesta: array anidado');
          
          // Si el primer elemento es un array de estudiantes
          if (Array.isArray(data[0][0])) {
            students = data[0][0];
          } 
          // Si el primer elemento ya contiene los estudiantes
          else if (Array.isArray(data[0]) && typeof data[0][0] === 'object') {
            students = data[0];
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        // Si la respuesta es un objeto, intentar extraer los estudiantes
        console.log('Formato de respuesta: objeto');
        if ('students' in data && Array.isArray(data.students)) {
          students = data.students;
        }
      }
      
      // Asegurarse de que todos los estudiantes tienen la estructura correcta
      return students.map(student => ({
        id: typeof student.id === 'number' ? student.id : parseInt(student.id) || 0,
        name: student.name || 'Sin nombre',
        email: student.email || 'Sin email',
        progress: typeof student.progress === 'number' ? student.progress : 0
      }));
    } catch (error) {
      console.error('Error en getAllStudents:', error);
      throw error;
    }
  }

  static async removeStudentFromCourse(courseId: number, studentId: number) {
    try {
      console.log(`Eliminando estudiante ${studentId} del curso ${courseId}`);
      
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      console.log('Respuesta del servidor (status):', response.status);
      
      // Intentar obtener la respuesta como JSON, pero manejar el caso en que no sea JSON válido
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // Si no es JSON válido, crear un objeto con un mensaje genérico
        responseData = { message: 'No se pudo procesar la respuesta del servidor' };
      }
      
      console.log('Respuesta del servidor (data):', responseData);
      
      if (!response.ok) {
        const errorMessage = responseData.message || 'Error al eliminar el estudiante del curso';
        console.error('Error en la respuesta:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error en removeStudentFromCourse:', error);
      throw error;
    }
  }

  static async updateCourse(courseId: number, data: Partial<CreateCourseData>) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error('Error al actualizar el curso');
        (error as any).response = { data: errorData };
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error en updateCourse:', error);
      throw error;
    }
  }

  static async updateLesson(lessonId: number, data: UpdateLessonData) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al actualizar la lección');
      return await response.json();
    } catch (error) {
      console.error('Error en updateLesson:', error);
      throw error;
    }
  }

  static async deleteLesson(lessonId: number) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar la lección');
      return await response.json();
    } catch (error) {
      console.error('Error en deleteLesson:', error);
      throw error;
    }
  }

  static async deleteVideo(videoId: number) {
    try {
      console.log('Eliminando video:', videoId);
      const response = await fetch(`${this.BASE_URL}/courses/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al eliminar el video: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Respuesta al eliminar video:', data);
      return data;
    } catch (error) {
      console.error('Error en deleteVideo:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId: number) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar el curso');
      return await response.json();
    } catch (error) {
      console.error('Error en deleteCourse:', error);
      throw error;
    }
  }

  static async getCoursesByStudentId(studentId: number) {
    try {
      console.log('Obteniendo cursos para el estudiante:', studentId);
      const response = await fetch(`${this.BASE_URL}/courses/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al obtener los cursos del estudiante');
      }

      const data = await response.json();
      console.log('Datos completos recibidos del backend:', data);
      
      // Procesar correctamente todos los campos que devuelve el backend
      return data.map((course: any) => {
        // Procesar los campos Buffer
        const hasCertificateBuffer = course.has_certificate?.data;
        const finishedBuffer = course.finished?.data;
        
        return {
          id: course.course_id || course.id,
          name: course.name || '',
          description: course.description || '',
          hours: course.hours || 0,
          teacherId: course.teacher_id,
          teacherName: course.teacher_name,
          // Convertir progress de string a número o usar 0
          progress: course.progress ? parseFloat(course.progress) : 0,
          // Convertir los buffers a booleanos
          hasCertificate: hasCertificateBuffer ? hasCertificateBuffer[0] === 1 : false,
          finished: finishedBuffer ? finishedBuffer[0] === 1 : false
        };
      });
    } catch (error) {
      console.error('Error en getCoursesByStudentId:', error);
      throw error;
    }
  }
}