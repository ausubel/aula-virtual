import { Router } from "express";
import { Certificate } from "../interfaces/Certificate";
import DocumentService from "../services/document.service";
import { sendResponses } from "../utils/sendResponses";
import ControllerBase from "./ControllerBase";

export default class DocumentController implements ControllerBase {
  public root: string;
  public router: Router;
  private documentService: DocumentService;

  constructor() {
    this.root = "/document";
    this.router = Router();
    this.documentService = new DocumentService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.onUploadCV();
    this.onGetAllCertificatesByStudentId();
    this.onGetCertificateByCourseId();
  }

  private onGetAllCertificatesByStudentId() {
    this.router.get("/student/:studentId/certificates", async (req, res) => {
      try {
        const { studentId } = req.params;
        console.log('Obteniendo certificados para el estudiante:', studentId);
        
        const certificates: Certificate[] = await this.documentService.getAllCertificatesByStudentId(Number(studentId));
        console.log('Certificados encontrados:', certificates);

        // Si no hay certificados, devolver array vacío
        if (!certificates || certificates.length === 0) {
          return sendResponses(res, 200, "Success", { certificates: [] });
        }

        return sendResponses(res, 200, "Success", { certificates });
      } catch (error) {
        console.error('Error en onGetAllCertificatesByStudentId:', error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onGetCertificateByCourseId() {
    this.router.get("/course/:courseId", async (req, res) => {
      try {
        const { courseId } = req.params;
        console.log('Obteniendo certificado para el curso:', courseId);
        
        const certificate = await this.documentService.getCertificateByCourseId(Number(courseId));
        console.log('Certificado encontrado:', certificate);

        if (!certificate) {
          return sendResponses(res, 404, "Certificate not found", null);
        }

        // Validar que el certificado tenga la estructura correcta
        if (!this.isValidCertificate(certificate)) {
          console.error('Certificado con estructura inválida:', certificate);
          return sendResponses(res, 500, "Invalid certificate data", null);
        }

        // Asegurar que la fecha esté en formato ISO
        const certificateWithValidDate = {
          ...certificate,
          date_emission: new Date(certificate.date_emission).toISOString()
        };

        return sendResponses(res, 200, "Success", { certificate: certificateWithValidDate });
      } catch (error) {
        console.error('Error en onGetCertificateByCourseId:', error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onUploadCV() {
    this.router.post("/student/:studentId/cv", async (req, res) => {
      try {
        const { studentId } = req.params;
        const { file } = req.body;
        
        console.log(`Recibida solicitud para subir CV del estudiante ID: ${studentId}`);
        
        if (!file) {
          console.error("Error: No se proporcionó ningún archivo");
          return sendResponses(res, 400, "No file provided");
        }
        
        // Validar que el archivo sea un PDF (verificando la cadena base64)
        if (!file.startsWith('data:application/pdf;base64,')) {
          console.error("Error: El archivo no es un PDF");
          return sendResponses(res, 400, "File must be a PDF");
        }
        
        console.log("Subiendo CV al modelo...");
        await this.documentService.uploadCV(file, Number(studentId));
        console.log("CV subido correctamente");
        
        return sendResponses(res, 200, "CV uploaded successfully");
      } catch (error) {
        console.error("Error uploading CV:", error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private isValidCertificate(certificate: Certificate): boolean {
    return !!(
      certificate &&
      typeof certificate.id === 'number' &&
      typeof certificate.name === 'string' &&
      typeof certificate.hours === 'number' &&
      certificate.date_emission
    );
  }
}
