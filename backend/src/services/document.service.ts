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

  async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    return await this.documentModel.getAllCertificatesByStudentId(studentId);
  }

  async getCertificateByCourseId(courseId: number): Promise<Certificate> {
    return await this.documentModel.getCertificateByCourseId(courseId);
  }
}
