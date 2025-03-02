import { Request, Response } from "express";
import Database from "../db/Database";
import { StoredProcedures } from "../db/StoredProcedures";
import { Router } from "express";
import ControllerBase from "./ControllerBase";

export default class CoursesController implements ControllerBase {
    public router: Router;
    public root: string;
    private db: Database;

    constructor() {
        this.root = '/courses';
        this.router = Router();
        this.db = Database.getInstance();
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this.router.post('/', this.createCourse.bind(this));
        this.router.get('/', this.getAllCourses.bind(this));
        this.router.get('/students', this.getAllStudents.bind(this));
        this.router.get('/:id', this.getCourseDetails.bind(this));
        this.router.post('/:id/students', this.assignStudents.bind(this));
        this.router.get('/:id/students', this.getStudentsByCourse.bind(this));
        this.router.post('/:id/lessons', this.createLesson.bind(this));
        this.router.put('/:id/lessons/:lessonId', this.updateLesson.bind(this));
        this.router.delete('/:id/lessons/:lessonId', this.deleteLesson.bind(this));
        this.router.post('/lessons/:id/videos', this.addVideoToLesson.bind(this));
        this.router.delete('/videos/:id', this.deleteVideo.bind(this));
    }

    private async createCourse(req: Request, res: Response) {
        try {
            const { name, description, hours, teacherId } = req.body;
            const result = await this.db.query(StoredProcedures.CreateCourse, [name, description, hours, teacherId]);
            res.json(result);
        } catch (error) {
            console.error('Error en createCourse:', error);
            res.status(500).json({ message: 'Error al crear el curso' });
        }
    }

    private async getAllCourses(_req: Request, res: Response) {
        try {
            const result = await this.db.query(StoredProcedures.GetAllCourses, []);
            res.json(result);
        } catch (error) {
            console.error('Error en getAllCourses:', error);
            res.status(500).json({ message: 'Error al obtener los cursos' });
        }
    }

    private async getCourseDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            let [rows]: any[] = await this.db.query(StoredProcedures.GetCourseDetailsById, [id]);
            
            // El procedimiento devuelve el resultado en una variable @result
            if (rows && rows.length > 0 && rows[0]['@result']) {
                const result = JSON.parse(rows[0]['@result']);
                res.json(result);
            } else {
                res.status(404).json({ message: 'Curso no encontrado' });
            }
        } catch (error) {
            console.error('Error en getCourseDetails:', error);
            res.status(500).json({ message: 'Error al obtener los detalles del curso' });
        }
    }

    private async assignStudents(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { studentIds } = req.body;
            const result = await this.db.query(StoredProcedures.AssignStudentsToCourse, [id, JSON.stringify(studentIds)]);
            res.json(result);
        } catch (error) {
            console.error('Error en assignStudents:', error);
            res.status(500).json({ message: 'Error al asignar estudiantes' });
        }
    }

    private async getStudentsByCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.db.query(StoredProcedures.GetStudentsByCourseId, [id]);
            res.json(result);
        } catch (error) {
            console.error('Error en getStudentsByCourse:', error);
            res.status(500).json({ message: 'Error al obtener los estudiantes del curso' });
        }
    }

    private async createLesson(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, description, time } = req.body;
            const result = await this.db.query(StoredProcedures.CreateLessonForCourse, [id, title, description, time]);
            res.json(result);
        } catch (error) {
            console.error('Error en createLesson:', error);
            res.status(500).json({ message: 'Error al crear la lección' });
        }
    }

    private async updateLesson(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const { title, description, time } = req.body;
            const result = await this.db.query(StoredProcedures.UpdateLesson, [lessonId, title, description, time]);
            res.json(result);
        } catch (error) {
            console.error('Error en updateLesson:', error);
            res.status(500).json({ message: 'Error al actualizar la lección' });
        }
    }

    private async deleteLesson(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const result = await this.db.query(StoredProcedures.DeleteLesson, [lessonId]);
            res.json(result);
        } catch (error) {
            console.error('Error en deleteLesson:', error);
            res.status(500).json({ message: 'Error al eliminar la lección' });
        }
    }

    private async addVideoToLesson(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { videoPath } = req.body;
            const result = await this.db.query(StoredProcedures.CreateLessonVideo, [id, videoPath]);
            res.json(result);
        } catch (error) {
            console.error('Error en addVideoToLesson:', error);
            res.status(500).json({ message: 'Error al agregar el video' });
        }
    }

    private async deleteVideo(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.db.query(StoredProcedures.DeleteVideo, [id]);
            res.json(result);
        } catch (error) {
            console.error('Error en deleteVideo:', error);
            res.status(500).json({ message: 'Error al eliminar el video' });
        }
    }

    private async getAllStudents(_req: Request, res: Response) {
        try {
            const [result] = await this.db.query(StoredProcedures.GetAllStudents, []);
            res.json(result);
        } catch (error) {
            console.error('Error en getAllStudents:', error);
            res.status(500).json({ message: 'Error al obtener los estudiantes' });
        }
    }
}