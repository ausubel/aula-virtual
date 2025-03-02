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
        this.router.put('/:id', this.updateCourse.bind(this));
        this.router.delete('/:id', this.deleteCourse.bind(this));
        this.router.post('/:id/students', this.assignStudents.bind(this));
        this.router.get('/:id/students', this.getStudentsByCourse.bind(this));
        this.router.delete('/:id/students/:studentId', this.removeStudentFromCourse.bind(this));
        this.router.get('/:id/lessons', this.getLessonsByCourse.bind(this));
        this.router.post('/:id/lessons', this.createLesson.bind(this));
        this.router.put('/lessons/:lessonId', this.updateLesson.bind(this));
        this.router.delete('/lessons/:lessonId', this.deleteLesson.bind(this));
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
            console.log('Ejecutando getAllCourses...');
            const [rows] = await this.db.query(StoredProcedures.GetAllCourses, []);
            console.log('Resultado de la consulta:', rows);
            
            // Asegurarse de que rows es un array y procesarlo
            if (Array.isArray(rows) && rows.length > 0) {
                console.log('Procesando filas:', rows[0]);
                const courses = rows[0].map((course: any) => ({
                    id: course.id,
                    name: course.name || '',
                    description: course.description || '',
                    hours: course.hours || 0,
                    teacherId: course.teacher_id || 0,
                    teacherName: course.teacher_name || 'No asignado',
                    studentCount: course.student_count || 0
                }));
                console.log('Cursos procesados:', courses);
                res.json(courses);
            } else {
                console.log('No se encontraron cursos');
                res.json([]);
            }
        } catch (error) {
            console.error('Error detallado en getAllCourses:', error);
            if (error instanceof Error) {
                console.error('Mensaje de error:', error.message);
                console.error('Stack trace:', error.stack);
            }
            res.status(500).json({ message: 'Error al obtener los cursos' });
        }
    }

    private async getCourseDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('Obteniendo detalles del curso:', id);
            
            const [rows] = await this.db.query(StoredProcedures.GetCourseDetailsById, [id]);
            console.log('Resultado de la consulta:', rows);
            
            if (Array.isArray(rows) && rows.length > 0) {
                const course = rows[0];
                console.log('Curso encontrado:', course);
                res.json({
                    id: course.id,
                    name: course.name,
                    description: course.description,
                    hours: course.hours,
                    teacherId: course.teacher_id,
                    teacherName: course.teacher_name,
                    studentCount: course.student_count
                });
            } else {
                console.log('Curso no encontrado');
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
            
            console.log('Asignando estudiantes al curso:', id);
            console.log('Lista de estudiantes:', studentIds);
            
            // Verificar que studentIds es un array
            if (!Array.isArray(studentIds) || studentIds.length === 0) {
                return res.status(400).json({ message: 'El formato de studentIds es incorrecto o está vacío, debe ser un array no vacío' });
            }
            
            // Verificar que todos los elementos son números
            const allNumbers = studentIds.every(id => typeof id === 'number');
            if (!allNumbers) {
                return res.status(400).json({ message: 'Todos los IDs de estudiantes deben ser números' });
            }
            
            const [result] = await this.db.query(StoredProcedures.AssignStudentsToCourse, [id, JSON.stringify(studentIds)]);
            console.log('Resultado de la asignación:', result);
            
            // Verificar el resultado
            if (Array.isArray(result) && result.length > 0) {
                const response = result[0];
                
                if (response.message === 'SUCCESS') {
                    return res.json({ 
                        message: 'Estudiantes asignados correctamente',
                        count: response.count
                    });
                } else if (response.message === 'COURSE_NOT_FOUND') {
                    return res.status(404).json({ message: 'Curso no encontrado' });
                } else if (response.message === 'NO_VALID_STUDENTS') {
                    return res.status(400).json({ message: 'No hay estudiantes válidos para asignar' });
                }
            }
            
            res.json({ message: 'Operación completada' });
        } catch (error) {
            console.error('Error en assignStudents:', error);
            res.status(500).json({ message: 'Error al asignar estudiantes' });
        }
    }

    private async getStudentsByCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('Obteniendo estudiantes del curso:', id);
            
            // Verificar que el ID del curso es un número
            const courseId = parseInt(id);
            if (isNaN(courseId)) {
                return res.status(400).json({ message: 'El ID del curso debe ser un número' });
            }
            
            const [rows] = await this.db.query(StoredProcedures.GetStudentsByCourseId, [courseId]);
            console.log('Resultado de la consulta:', JSON.stringify(rows, null, 2));
            
            // Manejar diferentes formatos de respuesta
            let students = [];
            
            if (Array.isArray(rows)) {
                if (rows.length > 0) {
                    // Caso 1: El procedimiento devuelve un array de arrays
                    if (Array.isArray(rows[0])) {
                        students = rows[0].map((student: any) => ({
                            id: student.id,
                            name: student.name || '',
                            email: student.email || '',
                            progress: student.progress || 0
                        }));
                    } 
                    // Caso 2: El procedimiento devuelve directamente un array de objetos
                    else if (typeof rows[0] === 'object' && rows[0] !== null) {
                        students = rows.map((student: any) => ({
                            id: student.id,
                            name: student.name || '',
                            email: student.email || '',
                            progress: student.progress || 0
                        }));
                    }
                }
            }
            
            console.log('Estudiantes procesados:', students);
            res.json(students);
        } catch (error) {
            console.error('Error en getStudentsByCourse:', error);
            res.status(500).json({ message: 'Error al obtener los estudiantes del curso' });
        }
    }

    private async getLessonsByCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('Obteniendo lecciones del curso:', id);
            
            const [rows] = await this.db.query(StoredProcedures.GetLessonsByCourseId, [id]);
            console.log('Resultado de la consulta:', rows);
            
            if (Array.isArray(rows) && rows.length > 0) {
                const lessons = rows[0].map((lesson: any) => {
                    let videos = [];
                    if (lesson.videos) {
                        try {
                            // Parse videos if it's a string
                            if (typeof lesson.videos === 'string') {
                                videos = JSON.parse(lesson.videos);
                            } else {
                                videos = lesson.videos;
                            }
                            // Filter out null values and ensure array
                            videos = Array.isArray(videos) ? videos.filter(v => v !== null) : [];
                            console.log('Videos procesados para lección', lesson.id, ':', videos);
                        } catch (e) {
                            console.error('Error parsing videos for lesson', lesson.id, ':', e);
                            videos = [];
                        }
                    }
                    
                    const processedLesson = {
                        id: lesson.id,
                        title: lesson.title,
                        description: lesson.description,
                        time: lesson.time,
                        videos: videos
                    };
                    console.log('Lección procesada:', processedLesson);
                    return processedLesson;
                });
                console.log('Todas las lecciones procesadas:', lessons);
                res.json(lessons);
            } else {
                console.log('No se encontraron lecciones');
                res.json([]);
            }
        } catch (error) {
            console.error('Error en getLessonsByCourse:', error);
            res.status(500).json({ message: 'Error al obtener las lecciones del curso' });
        }
    }

    private async createLesson(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, description, time, videoPath } = req.body;
            console.log('Creando lección:', { courseId: id, title, description, time });
            
            const [result] = await this.db.query(StoredProcedures.CreateLessonForCourse, [id, title, description, time]);
            console.log('Resultado:', result);

            // Si se proporcionó un video, lo agregamos
            if (videoPath && result[0] && result[0].id) {
                const [videoResult] = await this.db.query(StoredProcedures.CreateLessonVideo, [result[0].id, videoPath]);
                console.log('Resultado del video:', videoResult);
                if (Array.isArray(videoResult) && videoResult.length > 0) {
                    const video = videoResult[0];
                    res.json({
                        id: result[0].id,
                        title: result[0].title,
                        description: result[0].description,
                        time: result[0].time,
                        videoPath: video.video_path,
                        videoId: video.id
                    });
                    return;
                }
            }
            
            // Si no hay video o hubo error al agregarlo, devolvemos la lección sin video
            if (Array.isArray(result) && result.length > 0) {
                const lesson = result[0];
                res.json({
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    time: lesson.time,
                    videoPath: null,
                    videoId: null
                });
            } else {
                res.status(500).json({ message: 'Error al crear la lección' });
            }
        } catch (error) {
            console.error('Error en createLesson:', error);
            res.status(500).json({ message: 'Error al crear la lección' });
        }
    }

    private async updateLesson(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const { title, description, time } = req.body;
            console.log('Actualizando lección:', { lessonId, title, description, time });
            
            const result = await this.db.query(StoredProcedures.UpdateLesson, [lessonId, title, description, time]);
            console.log('Resultado:', result);
            
            res.json({ message: 'Lección actualizada exitosamente' });
        } catch (error) {
            console.error('Error en updateLesson:', error);
            res.status(500).json({ message: 'Error al actualizar la lección' });
        }
    }

    private async deleteLesson(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            console.log('Eliminando lección:', lessonId);
            
            const result = await this.db.query(StoredProcedures.DeleteLesson, [lessonId]);
            console.log('Resultado:', result);
            
            res.json({ message: 'Lección eliminada exitosamente' });
        } catch (error) {
            console.error('Error en deleteLesson:', error);
            res.status(500).json({ message: 'Error al eliminar la lección' });
        }
    }

    private async addVideoToLesson(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { videoPath } = req.body;
            console.log('Agregando video a la lección:', { lessonId: id, videoPath });
            
            const [result] = await this.db.query(StoredProcedures.CreateLessonVideo, [id, videoPath]);
            console.log('Resultado del procedimiento almacenado:', result);
            
            if (Array.isArray(result) && result.length > 0) {
                const videoData = result[0].video;
                console.log('Datos del video recibidos:', videoData);
                
                let video;
                try {
                    if (typeof videoData === 'string') {
                        video = JSON.parse(videoData);
                    } else {
                        video = videoData;
                    }
                    console.log('Video procesado:', video);
                    res.json(video || { id: null, videoPath: null });
                } catch (e) {
                    console.error('Error parsing video data:', e);
                    res.status(500).json({ 
                        message: 'Error al procesar los datos del video',
                        error: e.message,
                        videoData: videoData
                    });
                }
            } else {
                console.error('No se recibió respuesta del procedimiento almacenado');
                res.status(500).json({ 
                    message: 'Error al agregar el video',
                    result: result
                });
            }
        } catch (error) {
            console.error('Error en addVideoToLesson:', error);
            res.status(500).json({ 
                message: 'Error al agregar el video',
                error: error.message
            });
        }
    }

    private async deleteVideo(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('Eliminando video:', id);
            
            const [result] = await this.db.query(StoredProcedures.DeleteVideo, [id]);
            console.log('Resultado de eliminar video:', result);
            
            // Verificar la estructura de la respuesta
            console.log('Tipo de resultado:', typeof result);
            console.log('¿Es un array?', Array.isArray(result));
            if (Array.isArray(result)) {
                console.log('Longitud del array:', result.length);
                console.log('Primer elemento:', result[0]);
            }
            
            // Intentar extraer la respuesta del procedimiento almacenado
            let response = null;
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0]) && result[0].length > 0) {
                    response = result[0][0]; // Estructura: [[{message: 'SUCCESS', id: 17}]]
                } else {
                    response = result[0]; // Estructura: [{message: 'SUCCESS', id: 17}]
                }
            }
            
            console.log('Respuesta procesada:', response);
            
            if (response && response.message === 'SUCCESS') {
                res.json({ 
                    message: 'Video eliminado exitosamente',
                    id: response.id
                });
            } else if (response && response.message === 'NOT_FOUND') {
                res.status(404).json({ 
                    message: 'Video no encontrado',
                    id: response.id
                });
            } else {
                res.status(500).json({ 
                    message: 'Error al eliminar el video',
                    result: result
                });
            }
        } catch (error) {
            console.error('Error en deleteVideo:', error);
            res.status(500).json({ 
                message: 'Error al eliminar el video',
                error: error.message
            });
        }
    }

    private async getAllStudents(_req: Request, res: Response) {
        try {
            console.log('Obteniendo todos los estudiantes');
            
            const [rows] = await this.db.query(StoredProcedures.GetAllStudents, []);
            console.log('Resultado de la consulta:', JSON.stringify(rows, null, 2));
            
            // Manejar diferentes formatos de respuesta
            let students = [];
            
            if (Array.isArray(rows)) {
                if (rows.length > 0) {
                    // Caso 1: El procedimiento devuelve un array de arrays
                    if (Array.isArray(rows[0])) {
                        students = rows[0].map((student: any) => ({
                            id: student.id,
                            name: student.name || '',
                            email: student.email || '',
                            progress: student.progress || 0
                        }));
                    } 
                    // Caso 2: El procedimiento devuelve directamente un array de objetos
                    else if (typeof rows[0] === 'object' && rows[0] !== null) {
                        students = rows.map((student: any) => ({
                            id: student.id,
                            name: student.name || '',
                            email: student.email || '',
                            progress: student.progress || 0
                        }));
                    }
                }
            }
            
            console.log('Estudiantes procesados:', students);
            res.json(students);
        } catch (error) {
            console.error('Error en getAllStudents:', error);
            res.status(500).json({ message: 'Error al obtener todos los estudiantes' });
        }
    }

    private async updateCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, hours, teacherId } = req.body;
            console.log('Actualizando curso:', { id, name, description, hours, teacherId });
            
            // Primero verificamos si el profesor existe
            const [teacherRows] = await this.db.query('SELECT id FROM teacher WHERE id = ?', [teacherId]);
            if (!Array.isArray(teacherRows) || teacherRows.length === 0) {
                console.error('Profesor no encontrado:', teacherId);
                return res.status(400).json({ 
                    message: 'El profesor especificado no existe',
                    availableTeachers: await this.getAvailableTeachers()
                });
            }
            
            const result = await this.db.query(StoredProcedures.update_course, [id, name, description, hours, teacherId]);
            console.log('Resultado de la actualización:', result);
            
            res.json(result);
        } catch (error) {
            console.error('Error en updateCourse:', error);
            res.status(500).json({ message: 'Error al actualizar el curso' });
        }
    }

    private async getAvailableTeachers() {
        try {
            const [rows] = await this.db.query('SELECT t.id, u.name, u.surname FROM teacher t JOIN user u ON t.id = u.id');
            return rows;
        } catch (error) {
            console.error('Error al obtener profesores:', error);
            return [];
        }
    }

    private async deleteCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('Eliminando curso:', id);
            
            // Primero eliminar todas las lecciones y sus videos
            const [lessons] = await this.db.query(StoredProcedures.GetLessonsByCourseId, [id]);
            if (Array.isArray(lessons) && lessons.length > 0) {
                for (const lesson of lessons[0]) {
                    await this.db.query(StoredProcedures.DeleteLesson, [lesson.id]);
                }
            }
            
            // Luego eliminar el curso
            await this.db.query('DELETE FROM course WHERE id = ?', [id]);
            
            res.json({ message: 'Curso eliminado exitosamente' });
        } catch (error) {
            console.error('Error en deleteCourse:', error);
            res.status(500).json({ message: 'Error al eliminar el curso' });
        }
    }

    private async removeStudentFromCourse(req: Request, res: Response) {
        try {
            const { id, studentId } = req.params;
            console.log(`Eliminando estudiante ${studentId} del curso ${id}`);
            
            // Verificar que los IDs son números
            const courseId = parseInt(id);
            const studId = parseInt(studentId);
            
            if (isNaN(courseId) || isNaN(studId)) {
                return res.status(400).json({ message: 'Los IDs deben ser números' });
            }
            
            const [result] = await this.db.query(StoredProcedures.RemoveStudentFromCourse, [courseId, studId]);
            console.log('Resultado:', result);
            
            // Mejorar el manejo de la respuesta
            if (Array.isArray(result) && result.length > 0) {
                const response = result[0];
                
                if (response.message === 'SUCCESS') {
                    return res.json({ 
                        message: 'Estudiante eliminado correctamente', 
                        studentId: response.student_id 
                    });
                } else if (response.message === 'COURSE_NOT_FOUND') {
                    return res.status(404).json({ message: 'Curso no encontrado' });
                } else if (response.message === 'STUDENT_NOT_IN_COURSE') {
                    return res.status(404).json({ message: 'El estudiante no está en el curso' });
                }
            }
            
            // Si llegamos aquí, la respuesta no tiene el formato esperado pero la operación podría haber sido exitosa
            // Verificamos si hubo filas afectadas en la segunda parte del resultado
            if (Array.isArray(result) && result.length > 1 && result[1] && result[1].affectedRows > 0) {
                return res.json({ 
                    message: 'Estudiante eliminado correctamente', 
                    studentId: studId 
                });
            }
            
            // Si no podemos determinar si fue exitoso, asumimos que sí lo fue
            return res.json({ 
                message: 'Operación completada', 
                studentId: studId 
            });
            
        } catch (error) {
            console.error('Error en removeStudentFromCourse:', error);
            res.status(500).json({ message: 'Error al eliminar el estudiante del curso' });
        }
    }
}