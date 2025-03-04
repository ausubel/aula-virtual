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
        const certificates: Certificate[] = await this.certificateService.getAllCertificatesByStudentId(Number(studentId));
        return sendResponses(res, 200, "Success", { certificates });
      } catch (error) {
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }

  private onGetCertificateByCourseId() {
    this.router.get("/course/:courseId", async (req, res) => {
      try {
        const { courseId } = req.params;
        const certificate: Certificate = await this.certificateService.getCertificateByCourseId(Number(courseId));
        return sendResponses(res, 200, "Success", { certificate });
      } catch (error) {
        return sendResponses(res, 500, "Internal Server Error");
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
        
        // Validar que el archivo sea un PDF (verificando la cadena base64)
        if (!file.startsWith('data:application/pdf;base64,')) {
          console.error("Error: El archivo no es un PDF");
          return sendResponses(res, 400, "File must be a PDF");
        }
        
        await this.certificateService.uploadCV(file, Number(studentId));
        
        return sendResponses(res, 200, "CV uploaded successfully");
      } catch (error) {
        console.error("Error uploading CV:", error);
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }
}
