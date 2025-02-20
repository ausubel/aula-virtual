import { Application } from "express";
import ControllerBase from "./ControllerBase";
import AuthController from "./auth.controler";
import RegisterController from "./register.controler";

export default class ControllerInitializer {
	private app: Application;
	private controllers: ControllerBase[];
	constructor(app: Application) {
		this.app = app;
		this.controllers = [
			new AuthController(),
			new RegisterController()
		];
	}
	init() {
		this.controllers.forEach(({ root, router }) =>
			this.app.use(root, router)
		);
	}
}
