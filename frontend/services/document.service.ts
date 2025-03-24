import { ApiResponse, CertificateResponse } from '@/types/api';
import type { Certificate } from '@/types/certificate';

export class DocumentService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  static async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/document/student/${studentId}/certificates`);
      
      if (!response.ok) throw new Error('Error al obtener certificados');
      
      const data: ApiResponse<{certificates: Certificate[]}> = await response.json();
      return data.data.certificates || [];
    } catch (error) {
      console.error('Error en getAllCertificatesByStudentId:', error);
      return [];
    }
  }

  static async getCertificateByCourseId(courseId: number, studentId?: number): Promise<Certificate> {
    try {
      let url = `${this.BASE_URL}/document/course/${courseId}/certificate`;
      
      if (studentId) {
        url += `?studentId=${studentId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error al obtener certificado');
      
      const data: ApiResponse<CertificateResponse> = await response.json();
      return data.data.certificate;
    } catch (error) {
      console.error('Error en getCertificateByCourseId:', error);
      throw error;
    }
  }

  static async getCertificateByUUID(uuid: string): Promise<Certificate> {
    try {
      console.log('Solicitando certificado con UUID:', uuid);
      
      // Usar directamente la URL del backend
      const response = await fetch(`${this.BASE_URL}/document/certificate/public/${uuid}`);
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Certificado no encontrado');
        }
        throw new Error(`Error al obtener certificado: ${response.status} ${response.statusText}`);
      }
      
      const data: ApiResponse<CertificateResponse> = await response.json();
      console.log('Datos del certificado recibidos:', data);
      return data.data.certificate;
    } catch (error) {
      console.error('Error en getCertificateByUUID:', error);
      throw error;
    }
  }

  static async uploadProfilePhoto(file: string, studentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/document/student/${studentId}/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la foto de perfil');
      }
    } catch (error) {
      console.error('Error subiendo foto de perfil:', error);
      throw error;
    }
  }

  static async getProfilePhoto(studentId: number): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/document/student/${studentId}/photo`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la foto de perfil');
      }
      
      const data = await response.json();
      return data.data?.photo || '';
    } catch (error) {
      console.error('Error obteniendo foto de perfil:', error);
      return '';
    }
  }
}
