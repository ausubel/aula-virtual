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
}

interface CreateVideoData {
  lessonId: number;
  videoPath: string;
}

export class CoursesService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      const response = await fetch(`${this.BASE_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener los cursos');
      return await response.json();
    } catch (error) {
      console.error('Error en getAllCourses:', error);
      throw error;
    }
  }

  static async assignStudents(data: AssignStudentsData) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/${data.courseId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({ studentIds: data.studentIds })
      });

      if (!response.ok) throw new Error('Error al asignar estudiantes');
      return await response.json();
    } catch (error) {
      console.error('Error en assignStudents:', error);
      throw error;
    }
  }

  static async createLesson(data: CreateLessonData) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/${data.courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al crear la lección');
      return await response.json();
    } catch (error) {
      console.error('Error en createLesson:', error);
      throw error;
    }
  }

  static async addVideoToLesson(data: CreateVideoData) {
    try {
      const response = await fetch(`${this.BASE_URL}/lessons/${data.lessonId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al agregar el video');
      return await response.json();
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

  static async getStudentsByCourse(courseId: number) {
    try {
      const response = await fetch(`${this.BASE_URL}/courses/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener los estudiantes del curso');
      return await response.json();
    } catch (error) {
      console.error('Error en getStudentsByCourse:', error);
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

      if (!response.ok) throw new Error('Error al actualizar el curso');
      return await response.json();
    } catch (error) {
      console.error('Error en updateCourse:', error);
      throw error;
    }
  }

  static async updateLesson(lessonId: number, data: Partial<CreateLessonData>) {
    try {
      const response = await fetch(`${this.BASE_URL}/lessons/${lessonId}`, {
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
      const response = await fetch(`${this.BASE_URL}/lessons/${lessonId}`, {
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
      const response = await fetch(`${this.BASE_URL}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar el video');
      return await response.json();
    } catch (error) {
      console.error('Error en deleteVideo:', error);
      throw error;
    }
  }
}