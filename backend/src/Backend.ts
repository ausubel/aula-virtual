import dotenv from "dotenv";
import express, { Application } from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import ControllerInitializer from "./controllers";
import Encripter from "./utils/encripter";
import Tokenizer from "./utils/tokenizer";

export default class Backend {
    private app: Application;

    constructor() {
        this.app = express();
        this.setup();
    }

    setup() {
        this.setupDotenv();
        Encripter.init();
        Tokenizer.init();
        this.setupRequestWithJson();
        this.setupCors();
        this.setupSession();
        this.setupPassport();
        this.setupControllers();
    }

    private setupSession() {
        this.app.use(
            session({
                secret: process.env.SESSION_SECRET || 'your-secret-key',
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: false,
                    maxAge: 24 * 60 * 60 * 1000 // 24 horas
                }
            })
        );
    }

    private setupPassport() {
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }

    private setupRequestWithJson() {
        this.app.use(
            express.json({
                limit: "5mb",
            })
        );
    }

    private setupCors() {
        this.app.use(cors({
            origin: [process.env.FRONTEND_URL || 'http://localhost:3001', 'https://accounts.google.com', '*'],
            credentials: true,
            methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
            allowedHeaders: ['Authorization', 'X-API-KEY', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Access-Control-Allow-Request-Method']
        }));
    }

    private setupControllers() {
        new ControllerInitializer(this.app).init();
    }

    private setupDotenv() {
        dotenv.config();
    }

    start() {
        const PORT = process.env.PORT || 3000;
        this.app.listen(PORT, () => {
            console.log(`Server listen on port ${PORT}`);
        });
    }
}
