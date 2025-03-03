import { ApiResponse, CertificateResponse } from '@/types/api';
import type { Certificate } from '@/types/certificate';

export class DocumentService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  static async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/document/student/${studentId}/certificates`);
      if (!response.ok) throw new Error('Error al obtener certificados');

      const data: ApiResponse<{certificates: Certificate[]}> = await response.json();
      return data.data.certificates || [];
    } catch (error) {
      console.error('Error obteniendo certificados:', error);
      throw error;
    }
  }

  static async getCertificateByCourseId(courseId: number): Promise<Certificate> {
    try {
      const response = await fetch(`${this.BASE_URL}/document/course/${courseId}`);
      if (!response.ok) throw new Error('Error al obtener certificado');

      const data: ApiResponse<CertificateResponse> = await response.json();
      return data.data.certificate;
    } catch (error) {
      console.error('Error obteniendo certificado:', error);
      throw error;
    }
  }
}
