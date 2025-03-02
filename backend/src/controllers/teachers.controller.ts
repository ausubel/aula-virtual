import { Request, Response } from "express";
import Database from "../db/Database";
import { Router } from "express";
import ControllerBase from "./ControllerBase";

export default class TeachersController implements ControllerBase {
    public router: Router;
    public root: string;
    private db: Database;

    constructor() {
        this.root = '/teachers';
        this.router = Router();
        this.db = Database.getInstance();
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this.router.get('/', this.getAllTeachers.bind(this));
    }

    private async getAllTeachers(_req: Request, res: Response) {
        try {
            const [rows] = await this.db.query(
                'SELECT t.id, u.name, u.surname FROM teacher t JOIN user u ON t.id = u.id'
            );
            res.json(rows);
        } catch (error) {
            console.error('Error en getAllTeachers:', error);
            res.status(500).json({ message: 'Error al obtener los profesores' });
        }
    }
} 