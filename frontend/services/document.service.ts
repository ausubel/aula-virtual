import { ApiResponse, CertificateResponse } from '@/types/api';
import type { Certificate } from '@/types/certificate';
import apiClient from '../lib/api-client';

export class DocumentService {
  static async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    try {
      const response = await apiClient.get(`/document/student/${studentId}/certificates`);
      
      if (!response.data) throw new Error('Error al obtener certificados');
      
      const data = response.data;
      return data.data.certificates || [];
    } catch (error) {
      console.error('Error en getAllCertificatesByStudentId:', error);
      return [];
    }
  }

  static async getCertificateByCourseId(courseId: number, studentId?: number): Promise<Certificate> {
    try {
      let url = `/document/course/${courseId}/certificate`;
      
      if (studentId) {
        url += `?studentId=${studentId}`;
      }
      
      const response = await apiClient.get(url);
      
      if (!response.data) throw new Error('Error al obtener certificado');
      
      const data = response.data;
      return data.data.certificate;
    } catch (error) {
      console.error('Error en getCertificateByCourseId:', error);
      throw error;
    }
  }

  static async getCertificateByUUID(uuid: string): Promise<Certificate> {
    try {
      console.log('Solicitando certificado con UUID:', uuid);
      
      // Usar la ruta relativa
      const response = await apiClient.get(`/document/certificate/public/${uuid}`);
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.data) {
        throw new Error(`Error al obtener certificado`);
      }
      
      const data = response.data;
      console.log('Datos del certificado recibidos:', data);
      return data.data.certificate;
    } catch (error) {
      console.error('Error en getCertificateByUUID:', error);
      throw error;
    }
  }

  static async uploadProfilePhoto(file: string, studentId: number): Promise<void> {
    try {
      const response = await apiClient.post(`/document/student/${studentId}/photo`, { file });
      
      if (!response.data) {
        throw new Error('Error al subir la foto de perfil');
      }
    } catch (error) {
      console.error('Error subiendo foto de perfil:', error);
      throw error;
    }
  }

  static async getProfilePhoto(studentId: number): Promise<string> {
    try {
      const response = await apiClient.get(`/document/student/${studentId}/photo`);
      
      if (!response.data) {
        throw new Error('Error al obtener la foto de perfil');
      }
      
      const data = response.data;
      return data.data?.photo || '';
    } catch (error) {
      console.error('Error obteniendo foto de perfil:', error);
      return '';
    }
  }
}
