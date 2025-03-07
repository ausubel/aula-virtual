import { Application } from "express";
import ControllerBase from "./ControllerBase";
import AuthController from "./auth.controler";
import RegisterController from "./register.controler";
import EmailController from "./email.controller";
import DocumentController from "./document.controller";
import CoursesController from "./courses.controller";
import TeachersController from "./teachers.controller";
import UserController from "./user.controller";
import AdminController from "./admin.controller";

export default class ControllerInitializer {
    private app: Application;
    private controllers: ControllerBase[];
    
    constructor(app: Application) {
        this.app = app;
        this.controllers = [
            new AuthController(),
            new RegisterController(),
            new EmailController(),
            new DocumentController(),
            new CoursesController(),
            new TeachersController(),
            new UserController(),
            new AdminController() // Agregamos el nuevo controlador
        ];
    }

    init() {
        this.controllers.forEach(({ root, router }) =>
            this.app.use(root, router)
        );
    }
}
