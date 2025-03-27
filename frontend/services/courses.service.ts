import { AuthService } from './auth.service';
import apiClient from '../lib/api-client';

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
  finished?: boolean; 
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
  hasCertificate?: boolean | { data: number[] };
}

interface Course {
  id: number;
  name: string;
  description: string;
  hours: number;
  teacherId: number;
  teacherName: string;
  progress: number;
  finished: boolean;
}

export class CoursesService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  static async createCourse(data: CreateCourseData) {
    try {
      const response = await apiClient.post('/courses', data);

      if (!response.data) throw new Error('Error al crear el curso');
      return response.data;
    } catch (error) {
      console.error('Error en createCourse:', error);
      throw error;
    }
  }

  static async getAllCourses() {
    try {
      console.log('Llamando al backend: /courses')
      
      const response = await apiClient.get('/courses');

      console.log('Respuesta del backend:', response.status)
      
      if (!response.data) {
        throw new Error(`Error al obtener los cursos: ${response.status}`)
      }
      
      const data = response.data
      console.log('Datos recibidos (estructura completa):', JSON.stringify(data, null, 2))
      
      if (!Array.isArray(data)) {
        console.error('La respuesta no es un array:', data)
        return []
      }

      const validCourses = data.map(course => {
        if (Array.isArray(course)) {
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
      
      const response = await apiClient.post(`/courses/${data.courseId}/students`, { studentIds: data.studentIds });

      console.log('Respuesta del servidor (status):', response.status);
      
      const responseData = response.data;
      console.log('Respuesta del servidor (data):', responseData);
      
      if (!responseData) {
        const errorMessage = 'Error al asignar estudiantes';
        console.error('Error en la respuesta:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error en assignStudents:', error);
      throw error;
    }
  }

  static async getLessonsByCourse(courseId: number, studentId?: number): Promise<Lesson[]> {
    try {
      console.log('Obteniendo lecciones para el curso:', courseId, 'para el estudiante:', studentId);
      
      let url = `/courses/${courseId}/lessons`;
      if (studentId) {
        url += `?studentId=${studentId}`;
      }
      
      const response = await apiClient.get(url);

      if (!response.data) {
        throw new Error('Error al obtener las lecciones');
      }

      const data = response.data;
      console.log('=== DATOS DEL BACKEND ===');
      console.log('Datos sin procesar:', data);
      console.log('Tipo de data:', typeof data);
      if (Array.isArray(data)) {
        console.log('Número de lecciones:', data.length);
        data.forEach((lesson, index) => {
          console.log(`\nLección ${index + 1}:`, lesson);
          console.log('Videos de la lección:', lesson.videos);
          console.log('Estado finished (valor real):', lesson.finished, 'tipo:', typeof lesson.finished);
        });
      }
      console.log('========================');

      const lessons = data.map((lesson: any) => {
        console.log(`\nProcesando lección ${lesson.id}:`);
        
        let videos = [];
        
        if (lesson.videos) {
          try {
            if (typeof lesson.videos === 'string') {
              videos = JSON.parse(lesson.videos);
            } else {
              videos = lesson.videos;
            }
            
            videos = Array.isArray(videos) ? videos.filter(v => v !== null) : [];
            console.log('Videos procesados:', videos);
          } catch (e) {
            console.error('Error al procesar videos:', e);
            videos = [];
          }
        }
        else if (lesson.videoPath && lesson.videoId) {
          videos = [
            {
              id: lesson.videoId,
              videoPath: lesson.videoPath
            }
          ];
        }

        let finishedValue = false;
        if (lesson.finished !== undefined && lesson.finished !== null) {
          if (typeof lesson.finished === 'string') {
            finishedValue = lesson.finished === '1' || lesson.finished.toLowerCase() === 'true';
          } 
          else if (typeof lesson.finished === 'number') {
            finishedValue = lesson.finished !== 0;
          }
          else if (typeof lesson.finished === 'object' && lesson.finished !== null) {
            if (Buffer.isBuffer(lesson.finished) || 
                (lesson.finished.type === 'Buffer' && Array.isArray(lesson.finished.data))) {
              const bufferValue = Buffer.isBuffer(lesson.finished) 
                ? lesson.finished[0] 
                : lesson.finished.data[0];
              finishedValue = bufferValue !== 0;
            } 
            else if (lesson.finished.data !== undefined) {
              finishedValue = !!lesson.finished.data;
            }
            else {
              finishedValue = !!lesson.finished;
            }
          }
          else if (typeof lesson.finished === 'boolean') {
            finishedValue = lesson.finished;
          }
        }

        console.log('Valor finished procesado:', finishedValue);
        
        const processedLesson = {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          time: lesson.time,
          videos,
          finished: finishedValue
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
      const response = await apiClient.post(`/courses/${courseId}/lessons`, lessonData);

      if (!response.data) throw new Error('Error al crear la lección');
      return response.data;
    } catch (error) {
      console.error('Error en createLesson:', error);
      throw error;
    }
  }

  static async addVideoToLesson(lessonId: number, data: { videoPath: string }): Promise<Video> {
    try {
      console.log('Agregando video a la lección:', lessonId, data);
      
      const response = await apiClient.post(`/courses/lessons/${lessonId}/videos`, { videoPath: data.videoPath });

      if (!response.data) {
        throw new Error('Error al agregar el video');
      }

      const videoData = response.data;
      console.log('Video agregado:', videoData);
      
      return {
        id: videoData.id,
        videoPath: videoData.videoPath,
        lessonId: videoData.lessonId
      };
    } catch (error) {
      console.error('Error en addVideoToLesson:', error);
      throw error;
    }
  }

  static async getCourseDetails(courseId: number) {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);

      if (!response.data) throw new Error('Error al obtener los detalles del curso');
      return response.data;
    } catch (error) {
      console.error('Error en getCourseDetails:', error);
      throw error;
    }
  }

  static async getStudentsByCourse(courseId: number): Promise<Student[]> {
    try {
      console.log('Obteniendo estudiantes para el curso:', courseId);
      
      const response = await apiClient.get(`/courses/${courseId}/students`);

      console.log('Respuesta del servidor (status):', response.status);
      
      if (!response.data) {
        console.error('Error en la respuesta del servidor');
        throw new Error(`Error al obtener los estudiantes del curso: ${response.status}`);
      }
      
      const data = response.data;
      console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2));

      let students: Student[] = [];
      
      if (!data) {
        console.log('La respuesta es null o undefined, devolviendo array vacío');
        return [];
      }
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('La respuesta es un array vacío');
          return [];
        }
        
        if (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
          console.log('Formato de respuesta: array de objetos estudiante');
          students = data;
        }
        else if (Array.isArray(data[0])) {
          console.log('Formato de respuesta: array anidado');
          
          if (Array.isArray(data[0][0])) {
            students = data[0][0];
          } 
          else if (Array.isArray(data[0]) && typeof data[0][0] === 'object') {
            students = data[0];
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        console.log('Formato de respuesta: objeto');
        if ('students' in data && Array.isArray(data.students)) {
          students = data.students;
        }
      }
      
      return students.map(student => {
        const mappedStudent: Student = {
          id: typeof student.id === 'number' ? student.id : parseInt(student.id) || 0,
          name: student.name || 'Sin nombre',
          email: student.email || 'Sin email',
          progress: typeof student.progress === 'number' ? student.progress : 0,
          hasCertificate: false
        };
        
        if ('has_certificate' in student) {
          if (typeof student.has_certificate === 'boolean') {
            mappedStudent.hasCertificate = student.has_certificate;
          } else if (student.has_certificate && typeof student.has_certificate === 'object') {
            if ('data' in student.has_certificate) {
              mappedStudent.hasCertificate = student.has_certificate as { data: number[] };
            }
          }
        } else if ('hasCertificate' in student && student.hasCertificate !== undefined) {
          mappedStudent.hasCertificate = student.hasCertificate;
        }
        
        console.log('Estudiante mapeado:', mappedStudent);
        return mappedStudent;
      });
    } catch (error) {
      console.error('Error en getStudentsByCourse:', error);
      throw error;
    }
  }

  static async getAllStudents(): Promise<Student[]> {
    try {
      console.log('Obteniendo todos los estudiantes');
      
      const response = await apiClient.get('/courses/students');

      console.log('Respuesta del servidor (status):', response.status);
      
      if (!response.data) {
        console.error('Error en la respuesta del servidor');
        throw new Error(`Error al obtener todos los estudiantes: ${response.status}`);
      }
      
      const data = response.data;
      console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2));

      let students: Student[] = [];
      
      if (!data) {
        console.log('La respuesta es null o undefined, devolviendo array vacío');
        return [];
      }
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('La respuesta es un array vacío');
          return [];
        }
        
        if (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
          console.log('Formato de respuesta: array de objetos estudiante');
          students = data;
        }
        else if (Array.isArray(data[0])) {
          console.log('Formato de respuesta: array anidado');
          
          if (Array.isArray(data[0][0])) {
            students = data[0][0];
          } 
          else if (Array.isArray(data[0]) && typeof data[0][0] === 'object') {
            students = data[0];
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        console.log('Formato de respuesta: objeto');
        if ('students' in data && Array.isArray(data.students)) {
          students = data.students;
        }
      }
      
      return students.map(student => {
        const mappedStudent: Student = {
          id: typeof student.id === 'number' ? student.id : parseInt(student.id) || 0,
          name: student.name || 'Sin nombre',
          email: student.email || 'Sin email',
          progress: typeof student.progress === 'number' ? student.progress : 0,
          hasCertificate: false
        };
        
        if ('has_certificate' in student) {
          if (typeof student.has_certificate === 'boolean') {
            mappedStudent.hasCertificate = student.has_certificate;
          } else if (student.has_certificate && typeof student.has_certificate === 'object') {
            if ('data' in student.has_certificate) {
              mappedStudent.hasCertificate = student.has_certificate as { data: number[] };
            }
          }
        } else if ('hasCertificate' in student && student.hasCertificate !== undefined) {
          mappedStudent.hasCertificate = student.hasCertificate;
        }
        
        console.log('Estudiante mapeado:', mappedStudent);
        return mappedStudent;
      });
    } catch (error) {
      console.error('Error en getAllStudents:', error);
      throw error;
    }
  }

  static async removeStudentFromCourse(courseId: number, studentId: number) {
    try {
      console.log(`Eliminando estudiante ${studentId} del curso ${courseId}`);
      
      const response = await apiClient.delete(`/courses/${courseId}/students/${studentId}`);

      console.log('Respuesta del servidor (status):', response.status);
      
      let responseData = response.data;
      
      console.log('Respuesta del servidor (data):', responseData);
      
      if (!responseData) {
        const errorMessage = 'Error al eliminar el estudiante del curso';
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
      const response = await apiClient.put(`/courses/${courseId}`, data);

      if (!response.data) {
        throw new Error('Error al actualizar el curso');
      }
      return response.data;
    } catch (error) {
      console.error('Error en updateCourse:', error);
      throw error;
    }
  }

  static async updateLesson(lessonId: number, data: UpdateLessonData) {
    try {
      const response = await apiClient.put(`/courses/lessons/${lessonId}`, data);

      if (!response.data) throw new Error('Error al actualizar la lección');
      return response.data;
    } catch (error) {
      console.error('Error en updateLesson:', error);
      throw error;
    }
  }

  static async deleteLesson(lessonId: number) {
    try {
      const response = await apiClient.delete(`/courses/lessons/${lessonId}`);

      if (!response.data) throw new Error('Error al eliminar la lección');
      return response.data;
    } catch (error) {
      console.error('Error en deleteLesson:', error);
      throw error;
    }
  }

  static async deleteVideo(videoId: number) {
    try {
      console.log('Eliminando video:', videoId);
      const response = await apiClient.delete(`/courses/videos/${videoId}`);

      if (!response.data) {
        throw new Error(`Error al eliminar el video: ${response.status}`);
      }

      console.log('Respuesta al eliminar video:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en deleteVideo:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId: number) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);

      if (!response.data) throw new Error('Error al eliminar el curso');
      return response.data;
    } catch (error) {
      console.error('Error en deleteCourse:', error);
      throw error;
    }
  }

  static async getCoursesByStudentId(studentId: number): Promise<Course[]> {
    try {
      console.log('Obteniendo cursos del estudiante:', studentId);
      
      const response = await apiClient.get(`/courses/student/${studentId}`);

      console.log('Respuesta del servidor (status):', response.status);
      
      if (!response.data) {
        console.error('Error en la respuesta del servidor');
        throw new Error(`Error al obtener los cursos del estudiante: ${response.status}`);
      }
      
      const data = response.data;
      console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2));

      let courses: Course[] = [];
      
      if (!data) {
        console.log('La respuesta es null o undefined, devolviendo array vacío');
        return [];
      }
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('La respuesta es un array vacío');
          return [];
        }
        
        courses = data.map(course => {
          return {
            id: typeof course.id === 'number' ? course.id : parseInt(course.id) || 0,
            name: course.name || 'Sin nombre',
            description: course.description || 'Sin descripción',
            hours: typeof course.hours === 'number' ? course.hours : parseInt(course.hours) || 0,
            progress: typeof course.progress === 'number' ? course.progress : 0,
            teacherId: typeof course.teacherId === 'number' ? course.teacherId : parseInt(course.teacherId) || 0,
            teacherName: course.teacherName || 'Sin profesor',
            finished: course.finished || false
          };
        });
      }
      
      console.log('Cursos procesados:', courses);
      return courses;
    } catch (error) {
      console.error('Error en getCoursesByStudentId:', error);
      throw error;
    }
  }

  static async getLessonsByCourseId(courseId: number): Promise<Lesson[]> {
    try {
      console.log('Obteniendo lecciones del curso:', courseId);
      
      const response = await apiClient.get(`/courses/${courseId}/lessons`);

      console.log('Respuesta del servidor (status):', response.status);
      
      if (!response.data) {
        console.error('Error en la respuesta del servidor');
        throw new Error(`Error al obtener las lecciones del curso: ${response.status}`);
      }
      
      const data = response.data;
      console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2));

      let lessons: Lesson[] = [];
      
      if (!data) {
        console.log('La respuesta es null o undefined, devolviendo array vacío');
        return [];
      }
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('La respuesta es un array vacío');
          return [];
        }
        
        lessons = data.map(lesson => {
          return {
            id: typeof lesson.id === 'number' ? lesson.id : parseInt(lesson.id) || 0,
            title: lesson.title || 'Sin título',
            description: lesson.description || 'Sin contenido',
            time: lesson.time || 0,
            courseId: typeof lesson.courseId === 'number' ? lesson.courseId : parseInt(lesson.courseId) || 0,
            videos: Array.isArray(lesson.videos) ? lesson.videos.map((video: any) => ({
              id: typeof video.id === 'number' ? video.id : parseInt(video.id) || 0,
              videoPath: video.videoPath || video.video_path || '',
              lessonId: typeof video.lessonId === 'number' ? video.lessonId : parseInt(video.lessonId) || 0
            })) : []
          };
        });
      }
      
      console.log('Lecciones procesadas:', lessons);
      return lessons;
    } catch (error) {
      console.error('Error en getLessonsByCourseId:', error);
      throw error;
    }
  }

  static async toggleLessonCompletion(lessonId: number, studentId: number, finished: boolean): Promise<void> {
    try {
      console.log(`${finished ? 'Marcando' : 'Desmarcando'} lección ${lessonId} como completada para el estudiante ${studentId}`);
      
      const response = await apiClient.put(`/courses/lessons/${lessonId}/progress`, {
        studentId,
        finished: finished ? 1 : 0  
      });

      if (!response.data) {
        throw new Error(`Error al ${finished ? 'marcar' : 'desmarcar'} la lección como completada`);
      }

      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en toggleLessonCompletion:', error);
      throw error;
    }
  }

  static async finishCourseById(id: number): Promise<void> {
    try {
      const response = await apiClient.put(`/courses/${id}/finish`);

      if (!response.data) {
        throw new Error('Error al finalizar el curso');
      }

      return response.data;
    } catch (error) {
      console.error('Error en finishCourseById:', error);
      throw error;
    }
  }

  static async assignCertificates(courseId: number, studentIds: number[]): Promise<void> {
    try {
      const response = await apiClient.post(`/courses/${courseId}/certificates`, { studentIds });

      if (!response.data) {
        throw new Error('Error al asignar certificados');
      }

      return response.data;
    } catch (error) {
      console.error('Error en assignCertificates:', error);
      throw error;
    }
  }
}