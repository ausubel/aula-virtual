import CertificateModel from "../models/certificate.model";
import { Certificate } from "../interfaces/Certificate";

export default class CertificateService {
  private certificateModel: CertificateModel;

  constructor() {
    this.certificateModel = new CertificateModel();
  }

  async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    return await this.certificateModel.getAllCertificatesByStudentId(studentId);
  }

  async getCertificateByCourseId(courseId: number): Promise<Certificate> {
    return await this.certificateModel.getCertificateByCourseId(courseId);
  }
}
