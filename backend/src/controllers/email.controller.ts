import { Router, Request, Response } from "express";
import ControllerBase from "./ControllerBase";
import { sendEmail } from "../services/email.service";
import { sendResponses } from "../utils/sendResponses";

export default class EmailController implements ControllerBase {
    private _root: string;
    private _router: Router;

    constructor() {
        this._root = "/email";
        this._router = Router();
        this.onEndpoints();
    }

    get root() {
        return this._root;
    }

    get router() {
        return this._router;
    }

    private onEndpoints() {
        this.onSendNotificationEmail();
    }

    private onSendNotificationEmail() {
        this.router.post("/notification", async (req: Request, res: Response) => {
            const { email, subject, message } = req.body;

            if (!email || !subject || !message) {
                return sendResponses(res, 400, "Todos los campos son obligatorios");
            }

            try {
                const response = await sendEmail(email, subject, message);
                if (response.success) {
                    return sendResponses(res, 200, "Email enviado exitosamente", response);
                } else {
                    return sendResponses(res, 500, "Error al enviar el email", response);
                }
            } catch (error) {
                return sendResponses(res, 500, "Error interno del servidor", { error: error.message });
            }
        });
    }
}
