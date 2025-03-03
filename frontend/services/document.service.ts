import { AuthService } from './auth.service';

interface Certificate {
  id: number;
  name: string;
  description?: string;
  hours: number;
  date_emission: Date;
  teacher_name?: string;
  teacher_degree?: string;
  teacher_profile?: string;
  file?: string;
}

interface ApiResponse<T> {
  message: string;
  data: T | null;
}

export class DocumentService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  static async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    try {
      console.log('Obteniendo certificados del estudiante:', studentId);
      const response = await fetch(`${this.BASE_URL}/document/student/${studentId}/certificates`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al obtener los certificados');
      }

      const result: ApiResponse<{certificates: Certificate[]}> = await response.json();
      console.log('Respuesta completa del backend:', result);
      
      // Si no hay datos o certificados, retornar array vacío
      if (!result.data || !result.data.certificates) {
        console.log('No se encontraron certificados');
        return [];
      }

      return result.data.certificates;
    } catch (error) {
      console.error('Error en getAllCertificatesByStudentId:', error);
      throw error;
    }
  }

  static async getCertificateByCourseId(courseId: number): Promise<Certificate> {
    try {
      console.log('Obteniendo certificado detallado del curso:', courseId);
      const response = await fetch(`${this.BASE_URL}/document/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al obtener el certificado');
      }

      const result: ApiResponse<{certificate: Certificate}> = await response.json();
      console.log('Respuesta completa del backend (detallada):', result);
      
      if (!result.data || !result.data.certificate) {
        throw new Error('No se encontró el certificado');
      }

      const certificate = result.data.certificate;
      console.log('Certificado con información detallada:', certificate);

      return certificate;
    } catch (error) {
      console.error('Error en getCertificateByCourseId:', error);
      throw error;
    }
  }

  static async uploadCV(file: string, studentId: number): Promise<void> {
    try {
      console.log('Subiendo CV del estudiante:', studentId);
      const response = await fetch(`${this.BASE_URL}/document/student/${studentId}/cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({ file })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al subir el CV');
      }

      const result: ApiResponse<null> = await response.json();
      console.log('Respuesta del backend:', result);
    } catch (error) {
      console.error('Error en uploadCV:', error);
      throw error;
    }
  }
}
