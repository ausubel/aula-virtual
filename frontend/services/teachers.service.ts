import { AuthService } from './auth.service';

interface Teacher {
  id: number;
  name: string;
  surname: string;
}

export class TeachersService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  static async getAllTeachers(): Promise<Teacher[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/teachers`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener los profesores');
      return await response.json();
    } catch (error) {
      console.error('Error en getAllTeachers:', error);
      throw error;
    }
  }
} 