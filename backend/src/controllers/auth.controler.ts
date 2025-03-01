import { Router } from "express";
import ControllerBase from "./ControllerBase";
import AuthService from "../services/auth.service";
import Encrypter from "../utils/encripter";
import Tokenizer from "../utils/tokenizer";
import { sendResponses } from "../utils/sendResponses";
import passport from "passport";
import { setupGoogleStrategy } from "../auth/strategies/google.strategy";
import { z } from "zod";

// Schema de validación para el registro
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  surname: z.string().min(2, "El apellido debe tener al menos 2 caracteres")
});

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
    this.onRegister();
    this.setupGoogleAuth();
  }

  private setupGoogleAuth() {
    setupGoogleStrategy(this._router, passport);
  }

  private onRegister() {
    this.router.post("/register", async (req, res) => {
      try {
        // Validar datos de entrada
        const validatedData = registerSchema.parse(req.body);

        // Encriptar la contraseña
        const encryptedPassword = await Encrypter.encrypt(validatedData.password);

        // Usar el mismo flujo que Google Auth para crear un usuario
        const user = await this.authService.getOrCreateGoogleUser({
          email: validatedData.email,
          name: validatedData.name,
          surname: validatedData.surname,
          // Pasamos la contraseña encriptada como un campo adicional
          password: encryptedPassword
        });

        // Generar token para el usuario
        const token = await Tokenizer.create({
          userRoleId: user[0].roleId,
          userId: user[0].id
        });

        // Devolver respuesta exitosa
        sendResponses(res, 201, "Usuario registrado exitosamente", {
          user,
          token
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Errores de validación
          return sendResponses(res, 400, error.errors[0].message);
        }
        console.error("Error registrando usuario:", error);
        return sendResponses(res, 500, "Error interno del servidor");
      }
    });
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
