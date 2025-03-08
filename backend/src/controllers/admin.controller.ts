import { Request, Response } from "express";
import Database from "../db/Database";
import { Router } from "express";
import ControllerBase from "./ControllerBase";
import { checkAuthToken } from "../utils/checkAuthToken";
import { USER_ROLE_IDS } from "../config/constants";
import { sendResponses } from "../utils/sendResponses";
import { StoredProcedures } from "../db/StoredProcedures";

export default class AdminController implements ControllerBase {
    public router: Router;
    public root: string;
    private db: Database;

    constructor() {
        this.root = '/admin';
        this.router = Router();
        this.db = Database.getInstance();
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        // Aseguramos que solo los administradores pueden acceder a estas rutas
        this.router.get('/metrics', checkAuthToken(USER_ROLE_IDS.ADMIN), this.getDashboardMetrics.bind(this));
    }

    /**
     * Obtiene las métricas para el dashboard de administrador
     * Utiliza el procedimiento almacenado GetDashboardMetrics que devuelve múltiples conjuntos de resultados
     */
    private async getDashboardMetrics(_req: Request, res: Response) {
        try {
            // Ejecutar el procedimiento almacenado principal que devuelve múltiples resultados
            const [results] = await this.db.query(StoredProcedures.GetDashboardMetrics, []);
            
            // En MySQL, cuando un procedimiento devuelve múltiples sets de resultados,
            // estos se almacenan en orden en el array de resultados
            if (!Array.isArray(results) || results.length < 8) {
                throw new Error('El procedimiento no devolvió todos los resultados esperados');
            }

            // Extraer cada resultado
            const totalStudents = results[0][0]?.total_students || 0;
            const totalActiveCourses = results[1][0]?.total_active_courses || 0;
            const certificatesIssued = results[2][0]?.certificates_issued || 0;
            const completionRate = results[3][0]?.completion_rate || 0;
            const averageHours = Math.round(results[4][0]?.average_hours || 0);
            const activeStudents = results[5][0]?.active_students || 0;
            const passRate = results[6][0]?.pass_rate || 0;
            const graduatesThisYear = results[7][0]?.graduates_this_year || 0;

            // Enviar respuesta con todas las métricas
            return sendResponses(res, 200, "Métricas obtenidas correctamente", {
                totalStudents,
                totalActiveCourses,
                certificatesIssued,
                completionRate,
                averageHours,
                activeStudents,
                passRate,
                graduatesThisYear
            });
        } catch (error) {
            console.error('Error en getDashboardMetrics:', error);
            
            // En caso de error, intentar obtener los datos usando procedimientos individuales
            try {
                console.log('Intentando recuperar métricas con procedimientos individuales...');
                const metrics = await this.getMetricsIndividually();
                return sendResponses(res, 200, "Métricas obtenidas usando procedimientos individuales", metrics);
            } catch (innerError) {
                console.error('Error al recuperar métricas individuales:', innerError);
                return sendResponses(res, 500, "Error al obtener métricas del dashboard");
            }
        }
    }

    /**
     * Método alternativo que obtiene las métricas utilizando procedimientos individuales
     * en caso de que el procedimiento principal falle
     */
    private async getMetricsIndividually() {
        // Obtener total de estudiantes
        const [totalStudentsResult] = await this.db.query(StoredProcedures.GetTotalStudents, []);
        const totalStudents = totalStudentsResult[0]?.total || 0;

        // Obtener total de cursos activos
        const [activeCoursesResult] = await this.db.query(StoredProcedures.GetActiveCourses, []);
        const totalActiveCourses = activeCoursesResult[0]?.total || 0;

        // Obtener certificados emitidos
        const [certificatesResult] = await this.db.query(StoredProcedures.GetCertificatesIssued, []);
        const certificatesIssued = certificatesResult[0]?.total || 0;

        // Calcular tasa de finalización
        const [completionRateResult] = await this.db.query(StoredProcedures.GetCompletionRate, []);
        const completionRate = completionRateResult[0]?.completion_rate || 0;

        // Calcular promedio de horas por curso
        const [averageHoursResult] = await this.db.query(StoredProcedures.GetAverageHours, []);
        const averageHours = Math.round(averageHoursResult[0]?.average_hours || 0);

        // Estudiantes activos en la última semana
        const [activeStudentsResult] = await this.db.query(StoredProcedures.GetActiveStudents, []);
        const activeStudents = activeStudentsResult[0]?.active_students || 0;

        // Tasa de aprobación en evaluaciones
        const [passRateResult] = await this.db.query(StoredProcedures.GetPassRate, []);
        const passRate = passRateResult[0]?.pass_rate || 0;

        // Graduados este año
        const [graduatesResult] = await this.db.query(StoredProcedures.GetGraduatesThisYear, []);
        const graduatesThisYear = graduatesResult[0]?.total || 0;

        return {
            totalStudents,
            totalActiveCourses,
            certificatesIssued,
            completionRate,
            averageHours,
            activeStudents,
            passRate,
            graduatesThisYear
        };
    }
}