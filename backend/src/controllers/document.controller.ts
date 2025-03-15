import { Router } from "express";
import { Certificate } from "../interfaces/Certificate";
import DocumentService from "../services/document.service";
import { sendResponses } from "../utils/sendResponses";
import ControllerBase from "./ControllerBase";

export default class DocumentController implements ControllerBase {
  public root: string;
  public router: Router;
  private certificateService: DocumentService;

  constructor() {
    this.root = "/document";
    this.router = Router();
    this.certificateService = new DocumentService();
    this.onUploadCV();
    this.onUploadPhoto();
    this.onGetCVByStudentId();
    this.onGetPhotoByStudentId();
    this.onGetAllCertificatesByStudentId();
    this.onGetCertificateByCourseId();
    this.onGetCertificateByUUID();
  }

  private onGetAllCertificatesByStudentId() {
    this.router.get("/student/:studentId/certificates", async (req, res) => {
      try {
        const { studentId } = req.params;
        const certificates: Certificate[] = await this.certificateService.getAllCertificatesByStudentId(Number(studentId));
        return sendResponses(res, 200, "Success", { certificates });
      } catch (error) {
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onGetCertificateByCourseId() {
    this.router.get("/course/:courseId/certificate", async (req, res) => {
      try {
        const { courseId } = req.params;
        const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
        const certificate: Certificate = await this.certificateService.getCertificateByCourseId(Number(courseId), studentId);
        return sendResponses(res, 200, "Success", { certificate });
      } catch (error) {
        console.error("Error al obtener certificado por curso:", error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onGetCertificateByUUID() {
    this.router.get("/certificate/public/:uuid", async (req, res) => {
      try {
        const { uuid } = req.params;
        
        console.log('Solicitud de certificado por UUID:', uuid);
        
        if (!uuid) {
          console.error('UUID no proporcionado');
          return sendResponses(res, 400, "UUID no proporcionado", null);
        }
        
        const certificate: Certificate = await this.certificateService.getCertificateByUUID(uuid);
        
        if (!certificate) {
          console.error('Certificado no encontrado para UUID:', uuid);
          return sendResponses(res, 404, "Certificado no encontrado", null);
        }
        
        console.log('Certificado encontrado:', certificate);
        return sendResponses(res, 200, "Success", { certificate });
      } catch (error) {
        console.error("Error al obtener certificado por UUID:", error);
        return sendResponses(res, 500, "Error interno del servidor", null);
      }
    });
  }

  private onUploadCV() {
    this.router.post("/student/:studentId/cv", async (req, res) => {
      try {
        const { studentId } = req.params;
        const { file } = req.body;
        if (!file) {
          console.error("Error: No se proporcionó ningún archivo");
          return sendResponses(res, 400, "No file provided");
        }
        
        await this.certificateService.uploadCV(file, Number(studentId));
        
        return sendResponses(res, 200, "CV uploaded successfully");
      } catch (error) {
        console.error("Error uploading CV:", error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onUploadPhoto() {
    this.router.post("/student/:studentId/photo", async (req, res) => {
      try {
        const { studentId } = req.params;
        const { file } = req.body;
        if (!file) {
          console.error("Error: No se proporcionó ninguna foto");
          return sendResponses(res, 400, "No photo provided");
        }
        
        await this.certificateService.uploadPhoto(file, Number(studentId));
        
        return sendResponses(res, 200, "Photo uploaded successfully");
      } catch (error) {
        console.error("Error uploading photo:", error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onGetCVByStudentId() {
    this.router.get("/student/:studentId/cv", async (req, res) => {
      try {
        const { studentId } = req.params;
        const cv: string = await this.certificateService.getCVByStudentId(Number(studentId));
        return sendResponses(res, 200, "Success", { cv });
      } catch (error) {
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onGetPhotoByStudentId() {
    this.router.get("/student/:studentId/photo", async (req, res) => {
      try {
        const { studentId } = req.params;
        const photo = await this.certificateService.getPhotoByStudentId(Number(studentId));
        return sendResponses(res, 200, "Success", { photo });
      } catch (error) {
        console.error("Error getting photo:", error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }
}