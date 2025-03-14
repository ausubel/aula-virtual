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

  async uploadPhoto(file: string, studentId: number): Promise<void> {
    await this.database.query(
      StoredProcedures.UploadPhoto,
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

  async getPhotoByStudentId(studentId: number): Promise<string> {
    const [rows] = await this.database.query(
      'SELECT photo_file FROM student WHERE id = ?',
      [studentId]
    );
    
    // Check if we have results and return the photo_file
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0].photo_file || '';
    }
    
    return '';
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
        file: row.file,
        uuid: row.uuid
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
        file: row.file,
        uuid: row.uuid
      };

      console.log('Certificado procesado:', certificate);
      return certificate;
    } catch (error) {
      console.error('Error en getCertificateByCourseId:', error);
      throw error;
    }
  }

  async getCertificateByUUID(uuid: string): Promise<Certificate | null> {
    try {
      console.log('Consultando certificado con UUID:', uuid);
      
      // Asegurarse de que el UUID sea válido
      if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
        console.error('UUID inválido:', uuid);
        return null;
      }
      
      const [resultRows] = await this.database.query(
        StoredProcedures.GetCertificateByUUID,
        [uuid]
      );
      
      console.log('Resultado raw de la consulta:', resultRows);
      
      // Extraemos los resultados
      const results = Array.isArray(resultRows) && resultRows.length > 0 ? resultRows[0] : resultRows;
      console.log('Resultados extraídos:', results);

      // Si no hay resultados o el array está vacío, retornar null
      if (!Array.isArray(results) || results.length === 0) {
        console.log('No se encontraron resultados para UUID:', uuid);
        return null;
      }

      // Extraemos el primer registro
      const row = results[0];
      console.log('Datos del certificado encontrado:', row);

      // Verificamos que tengamos datos válidos
      if (!row || !row.id) {
        console.log('Datos del certificado inválidos para UUID:', uuid);
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
        file: row.file,
        uuid: row.uuid
      };

      console.log('Certificado procesado:', certificate);
      return certificate;
    } catch (error) {
      console.error('Error en getCertificateByUUID:', error);
      throw error;
    }
  }
}
