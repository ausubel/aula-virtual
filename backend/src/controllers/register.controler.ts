import { Router } from "express";
import ControllerBase from "../controllers/ControllerBase";
import RegisterService from "../services/register.service";
import { checkAuthToken } from "../utils/checkAuthToken";
import Encrypter from "../utils/encripter";
import UserDTO from "./dtos/UserDTO";
import { USER_ROLE_IDS } from "../config/constants";
import { sendResponses } from "../utils/sendResponses";
import { z } from "zod";

// Schema de validación para el registro
const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    surname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")
});

export default class RegisterController implements ControllerBase {
    private _root: string;
    private _router: Router;
    private registerService: RegisterService;
    constructor(){
        this._root = "/register";
        this._router = Router();
        this.registerService = new RegisterService();
        this.onEndpoints();
    }
    get root(){
        return this._root;
    }
    get router(){
        return this._router;
    }
    private onEndpoints(){
        this.onRegisterUserGuest();
        this.onPublicRegisterStudent();
    }

    // Endpoint existente para registro por admin
    private onRegisterUserGuest() {
        this.router.post("/student/admin", checkAuthToken(USER_ROLE_IDS.ADMIN), async (req, res) => {
            const guest = {
                ...req.body,
                password: await Encrypter.encrypt(req.body.password)
            };
    
            if (!UserDTO.isValid(guest)) {
                return sendResponses(res, 422, "Invalid body");
            }
    
            const user: UserDTO = new UserDTO(guest);
            const message: string = await this.registerService.registerUserGuest(user);
    
            if (message !== "SUCCESS") {
                return sendResponses(res, 409, message);
            }
    
            return sendResponses(res, 201);
        });
    }

    // Nuevo endpoint para registro público de estudiantes
    private onPublicRegisterStudent() {
        this.router.post("/student", async (req, res) => {
            try {
                // Validar datos de entrada
                const validatedData = registerSchema.parse(req.body);

                // Preparar datos del usuario
                const studentData = {
                    ...validatedData,
                    password: await Encrypter.encrypt(validatedData.password),
                    id_role: USER_ROLE_IDS.STUDENT, // Asignar rol de estudiante
                    active: true
                };

                // Validar estructura con DTO
                if (!UserDTO.isValid(studentData)) {
                    return sendResponses(res, 422, "Invalid body structure");
                }

                // Crear usuario
                const user: UserDTO = new UserDTO(studentData);
                const message: string = await this.registerService.registerUserGuest(user);

                if (message !== "SUCCESS") {
                    return sendResponses(res, 409, message);
                }

                // Enviar respuesta exitosa
                return sendResponses(res, 201, "Student registered successfully");

            } catch (error) {
                if (error instanceof z.ZodError) {
                    // Errores de validación
                    return sendResponses(res, 400, error.errors[0].message);
                }
                console.error("Error registering student:", error);
                return sendResponses(res, 500, "Internal server error");
            }
        });
    }
}