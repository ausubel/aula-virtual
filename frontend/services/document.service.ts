import { AuthService } from './auth.service';

interface Certificate {
  id: number;
  name: string;
  hours: number;
  date_emission: Date;
  file?: string;
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

      const data = await response.json();
      console.log('Certificados obtenidos:', data);
      return data.certificates;
    } catch (error) {
      console.error('Error en getAllCertificatesByStudentId:', error);
      throw error;
    }
  }

  static async getCertificateByCourseId(courseId: number): Promise<Certificate> {
    try {
      console.log('Obteniendo certificado del curso:', courseId);
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

      const data = await response.json();
      console.log('Certificado obtenido:', data);
      return data.certificate;
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

      const data = await response.json();
      console.log('CV subido exitosamente:', data);
    } catch (error) {
      console.error('Error en uploadCV:', error);
      throw error;
    }
  }
}
