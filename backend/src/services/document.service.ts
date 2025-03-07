import { Certificate } from "../interfaces/Certificate";
import { CV } from "../interfaces/CV";
import DocumentModel from "../models/document.model";

export default class DocumentService {
  private documentModel: DocumentModel;

  constructor() {
    this.documentModel = new DocumentModel();
  }

  async uploadCV(file: string, studentId: number): Promise<void> {
    await this.documentModel.uploadCV(file, studentId);
  }
  async getCVByStudentId(studentId: number): Promise<string> {
    return await this.documentModel.getCVByStudentId(studentId);
  }
  async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    try {
      const certificates = await this.documentModel.getAllCertificatesByStudentId(studentId);
      // Aseguramos que las fechas estén en formato ISO y que todos los campos requeridos existan
      return certificates.map(cert => ({
        ...cert,
        date_emission: this.ensureISODate(cert.date_emission),
        hours: Number(cert.hours) || 0
      }));
    } catch (error) {
      console.error('Error en getAllCertificatesByStudentId service:', error);
      throw error;
    }
  }

  async getCertificateByCourseId(courseId: number, studentId?: number): Promise<Certificate | null> {
    try {
      const certificate = await this.documentModel.getCertificateByCourseId(courseId, studentId);
      
      if (!certificate) {
        return null;
      }

      // Aseguramos que todos los campos tengan el formato correcto
      const formattedCertificate: Certificate = {
        id: Number(certificate.id),
        name: String(certificate.name),
        description: certificate.description || undefined,
        hours: Number(certificate.hours) || 0,
        date_emission: this.ensureISODate(certificate.date_emission),
        teacher_name: certificate.teacher_name || undefined,
        teacher_degree: certificate.teacher_degree || undefined,
        teacher_profile: certificate.teacher_profile || undefined,
        student_name: certificate.student_name || undefined,
        file: certificate.file || undefined
      };

      // Validamos que tenga los campos requeridos
      if (!this.isValidCertificate(formattedCertificate)) {
        console.error('Certificado inválido:', formattedCertificate);
        return null;
      }

      return formattedCertificate;
    } catch (error) {
      console.error('Error en getCertificateByCourseId service:', error);
      throw error;
    }
  }

  private isValidCertificate(cert: any): cert is Certificate {
    return !!(
      cert &&
      typeof cert.id === 'number' &&
      typeof cert.name === 'string' &&
      typeof cert.hours === 'number' &&
      cert.date_emission
    );
  }

  private ensureISODate(date: any): string {
    if (!date) {
      return new Date().toISOString();
    }
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return new Date().toISOString();
      }
      return dateObj.toISOString();
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return new Date().toISOString();
    }
  }
}
