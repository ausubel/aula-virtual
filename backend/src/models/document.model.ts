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
  async getCVByStudentId(studentId: number): Promise<string> {
    const [[resultset]] = (await this.database.query(
      StoredProcedures.GetCVByStudentId,
      [studentId]
    )) as [[string[]]];
    return resultset[0];
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
        date_emission: row.date_emission?.toISOString(),
        file: row.file
      }));

      console.log('Certificados procesados:', certificates);
      return certificates;
    } catch (error) {
      console.error('Error en getAllCertificatesByStudentId:', error);
      throw error;
    }
  }

  async getCertificateByCourseId(courseId: number, studentId?: number): Promise<Certificate | null> {
    try {
      console.log('Consultando certificado para curso:', courseId, 'y estudiante:', studentId || 'no especificado');
      
      const [resultRows] = await this.database.query(
        StoredProcedures.GetCertificateByCourseId,
        [courseId, studentId || null]
      );
      
      // Extraemos los resultados de la estructura anidada
      const [results] = resultRows;
      console.log('Resultados extraídos:', results);

      // Si no hay resultados o el array está vacío, retornar null
      if (!Array.isArray(results) || results.length === 0) {
        console.log('No se encontraron resultados');
        return null;
      }

      // Extraemos el primer registro
      const row = results[0];
      console.log('Datos del certificado encontrado:', row);

      // Verificamos que tengamos datos válidos
      if (!row || !row.id) {
        console.log('Datos del certificado inválidos');
        return null;
      }

      // Mapear los campos del certificado asegurando formato de fecha ISO
      const certificate: Certificate = {
        id: row.id,
        name: row.name,
        description: row.description,
        hours: row.hours,
        date_emission: row.date_emission?.toISOString() || new Date().toISOString(),
        teacher_name: row.teacher_name,
        teacher_degree: row.teacher_degree,
        teacher_profile: row.teacher_profile,
        student_name: row.student_name,
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
