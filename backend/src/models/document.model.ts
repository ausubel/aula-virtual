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
    try {
      console.log('Consultando certificados para estudiante:', studentId);
      const [rows] = await this.database.query(
        StoredProcedures.GetAllCertificatesByStudentId,
        [studentId]
      );
      console.log('Resultado raw de la consulta:', rows);

      // Si no hay resultados, retornar array vacío
      if (!rows || !Array.isArray(rows[0])) {
        console.log('No se encontraron certificados');
        return [];
      }

      // Convertir los resultados a objetos Certificate
      const certificates = rows[0].map((row: any) => ({
        id: row.id,
        name: row.name,
        hours: row.hours,
        date_emission: row.date_emission,
        file: row.file
      }));

      console.log('Certificados procesados:', certificates);
      return certificates;
    } catch (error) {
      console.error('Error en getAllCertificatesByStudentId:', error);
      throw error;
    }
  }

  async getCertificateByCourseId(courseId: number): Promise<Certificate | null> {
    try {
      console.log('Consultando certificado para curso:', courseId);
      const [rows] = await this.database.query(
        StoredProcedures.GetCertificateByCourseId,
        [courseId]
      );
      console.log('Resultado raw de la consulta:', rows);

      // Si no hay resultados, retornar null
      if (!rows || !Array.isArray(rows[0]) || !rows[0][0]) {
        console.log('No se encontró el certificado');
        return null;
      }

      const row = rows[0][0];
      const certificate: Certificate = {
        id: row.id,
        name: row.name,
        hours: row.hours,
        date_emission: row.date_emission,
        file: row.file
      };

      console.log('Certificado procesado:', certificate);
      return certificate;
    } catch (error) {
      console.error('Error en getCertificateByCourseId:', error);
      throw error;
    }
  }
}
