import { Application } from "express";
import ControllerBase from "./ControllerBase";
import AuthController from "./auth.controler";
import RegisterController from "./register.controler";
import EmailController from "./email.controller";
import DocumentController from "./document.controller";

export default class ControllerInitializer {
    private app: Application;
    private controllers: ControllerBase[];
    
    constructor(app: Application) {
        this.app = app;
        this.controllers = [
            new AuthController(),
            new RegisterController(),
            new EmailController(),
            new DocumentController()
        ];
    }

    init() {
        this.controllers.forEach(({ root, router }) =>
            this.app.use(root, router)
        );
    }
}
