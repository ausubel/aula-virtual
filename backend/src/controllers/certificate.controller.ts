import { Router } from "express";
import ControllerBase from "./ControllerBase";
import CertificateService from "../services/certificate.service";
import { checkAuthToken } from "../utils/checkAuthToken";
import { sendResponses } from "../utils/sendResponses";
import { Certificate } from "../interfaces/Certificate";

export default class CertificateController implements ControllerBase {
  private _root: string;
  private _router: Router;
  private certificateService: CertificateService;

  constructor() {
    this._root = "/certificates";
    this._router = Router();
    this.certificateService = new CertificateService();
    this.onEndpoints();
  }

  get root() {
    return this._root;
  }

  get router() {
    return this._router;
  }

  private onEndpoints() {
    this.onGetAllCertificatesByStudentId();
    this.onGetCertificateByCourseId();
  }

  private onGetAllCertificatesByStudentId() {
    this.router.get("/student/:studentId", async (req, res) => {
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
    this.router.get("/:courseId", async (req, res) => {
      try {
        const { courseId } = req.params;
        const certificate: Certificate = await this.certificateService.getCertificateByCourseId(Number(courseId));
        return sendResponses(res, 200, "Success", { certificate });
      } catch (error) {
        return sendResponses(res, 500, "Internal Server Error");
      }
    });
  }
}
