import { Router } from "express";
import ControllerBase from "./ControllerBase";
import { sendResponses } from "../utils/sendResponses";
import UserService from "../services/user.service";
import UserDTO from "./dtos/UserDTO";

export default class UserController implements ControllerBase {
  private _root: string;
  private _router: Router;
  private userService: UserService;
  constructor() {
    this._root = "/user";
    this._router = Router();
    this.userService = new UserService();
    this.onEndpoints();
  }
  get root() {
    return this._root;
  }
  get router() {
    return this._router;
  }
  private onEndpoints() {
    this.onGetUserDataById();
    this.onUpdateUserDataById();
    this.onGetStudentProfileData();
    this.onUpdateStudentProfileInfo();
  }

  private onGetUserDataById() {
    this.router.get("/:id", async (req, res) => {
      const id: number = Number(req.params.id);
      const user = await this.userService.getUserDataById(id);
      sendResponses(res, 200, "Success", user);
    });
  }
  private onUpdateUserDataById() {
    this.router.put("/update", async (req, res) => {
      const user = await this.userService.updateUserDataById(req.body);
      sendResponses(res, 200, "Success", user);
    });
  }

  private onGetStudentProfileData() {
    this.router.get("/student/:id/profile", async (req, res) => {
      const studentId: number = Number(req.params.id);
      const profileData = await this.userService.getStudentProfileData(studentId);
      
      if (!profileData) {
        sendResponses(res, 404, "Student profile not found", null);
        return;
      }
      
      sendResponses(res, 200, "Success", profileData);
    });
  }

  private onUpdateStudentProfileInfo() {
    this.router.put("/student/:id/profile", async (req, res) => {
      try {
        const studentId: number = Number(req.params.id);
        const { name, surname, phone, location, bio } = req.body;
        
        // Validar que la biografía no exceda los 500 caracteres (validación adicional en el backend)
        if (bio && bio.length > 500) {
          sendResponses(res, 400, "La biografía no debe exceder los 500 caracteres", null);
          return;
        }
        
        const result = await this.userService.updateStudentProfileInfo(studentId, name, surname, phone, location, bio);
        sendResponses(res, 200, "Perfil actualizado correctamente", result);
      } catch (error) {
        console.error("Error updating student profile:", error);
        sendResponses(res, 500, "Error al actualizar el perfil", null);
      }
    });
  }
}
