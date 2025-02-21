import ModelBase from "./ModelBase";
import StoredProcedures from "../db/StoredProcedures";
import userMapper from "./mappers/user.mapper";
import { Certificate } from "../interfaces/Certificate";

export default class CertificateModel extends ModelBase {
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
