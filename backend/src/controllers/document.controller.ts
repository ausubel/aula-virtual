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
    this.onUploadPhoto();
    this.onGetAllCertificatesByStudentId();
    this.onGetCertificateByCourseId();
    this.onGetCVByStudentId();
    this.onGetPhotoByStudentId();
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