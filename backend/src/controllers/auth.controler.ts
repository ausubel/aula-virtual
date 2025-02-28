import { Router } from "express";
import ControllerBase from "./ControllerBase";
import AuthService from "../services/auth.service";
import Encrypter from "../utils/encripter";
import Tokenizer from "../utils/tokenizer";
import { sendResponses } from "../utils/sendResponses";
import passport from "passport";
import { setupGoogleStrategy } from "../auth/strategies/google.strategy";

export default class AuthController implements ControllerBase {
  private _root: string;
  private _router: Router;
  private authService: AuthService;
  constructor() {
    this._root = "/auth";
    this._router = Router();
    this.authService = new AuthService();
    this.onEndpoints();
  }
  get root() {
    return this._root;
  }
  get router() {
    return this._router;
  }
  private onEndpoints() {
    this.onSignIn();
    this.onSignOut();
    this.setupGoogleAuth();
  }

  private setupGoogleAuth() {
    setupGoogleStrategy(this._router, passport);
  }
  private onSignIn() {
    this.router.post("/sign-in", async (req, res) => {
      const username: string = req.body.username as string;
      const password: string = req.body.password as string;
      const partialUser = await this.authService.getPasswordByEmail(
        username
      );
      if (!partialUser.password) {
        sendResponses(res, 400, "User not found");
        return;
      }
      const isCorrect = await Encrypter.compare(password, partialUser.password);
      if (!isCorrect) {
        sendResponses(res, 400, "Wrong password");
        return;
      }
      const user = await this.authService.getUserDataById(partialUser.id);
      console.log("pepe",user);
      console.log(user[0].roleId);
      const token = await Tokenizer.create({
        userRoleId: user[0]["roleId"],
        userId: user[0]["id"]
      });
      const data = {
        user,
        token,
      };
      sendResponses(res, 200, "Success", data);
    });
  }
  private onSignOut() {
    this.router.post("/sign-out", async (req, res) => {
      // En un sistema con tokens JWT, el cierre de sesión se maneja principalmente en el cliente
      // El servidor puede implementar una lista negra de tokens si es necesario
      
      // Simplemente enviamos una respuesta exitosa
      sendResponses(res, 200, "Sesión cerrada exitosamente");
    });
  }
}
