import ModelBase from "./ModelBase";
import StoredProcedures from "../db/StoredProcedures";
import { Certificate } from "../interfaces/Certificate";

export default class DocumentModel extends ModelBase {
  async uploadCV(file: string, studentId: number): Promise<void> {
    await this.database.query(
      StoredProcedures.UploadCV,
      [file, studentId]
    );
  }
  async getAllCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    const [[resultset]] = (await this.database.query(
      StoredProcedures.GetAllCertificatesByStudentId,
      [studentId]
    )) as [[Certificate[]]];
    return resultset;
  }

  async getCertificateByCourseId(courseId: number): Promise<Certificate> {
    const [[resultset]] = (await this.database.query(
      StoredProcedures.GetCertificateByCourseId,
      [courseId]
    )) as [[Certificate[]]];
    return resultset[0];
  }
}
