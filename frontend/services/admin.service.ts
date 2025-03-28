import apiClient from '../lib/api-client';

export interface DashboardMetrics {
  totalStudents: number;
  totalActiveCourses: number;
  certificatesIssued: number;
  completionRate: number;
  averageHours: number;
  activeStudents: number;
  passRate: number;
  graduatesThisYear: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
}

export interface StudentProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalProgress: number;
  currentCourses: Array<{
    id: number;
    title: string;
    progress: number;
    instructor: string;
  }>;
}

export interface Certificate {
  id: number;
  name: string;
  hours: number;
  date_emission: string;
  file: string | null;
}

export class AdminService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get('/admin/metrics');
      console.log('Respuesta de metrics:', response);
      
      // Verificar si la respuesta tiene la estructura esperada
      let data;
      if (response.data?.data) {
        // Si la respuesta tiene un objeto data anidado (formato antiguo)
        data = response.data.data;
      } else {
        // Si la respuesta ya tiene el formato esperado
        data = response.data;
      }
      
      console.log('Datos procesados:', data);
      
      // Asegurarse de que todos los valores sean números válidos
      const metrics: DashboardMetrics = {
        totalStudents: Number(data?.totalStudents) || 0,
        totalActiveCourses: Number(data?.totalActiveCourses) || 0,
        certificatesIssued: Number(data?.certificatesIssued) || 0,
        completionRate: Number(data?.completionRate) || 0,
        averageHours: Number(data?.averageHours) || 0,
        activeStudents: Number(data?.activeStudents) || 0,
        passRate: Number(data?.passRate) || 0,
        graduatesThisYear: Number(data?.graduatesThisYear) || 0
      };
      
      return metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  static async getAllStudents(): Promise<Student[]> {
    try {
      console.log("Llamando a AdminService.getAllStudents()");
      const response = await apiClient.get('/api/admin/students');
      console.log("Respuesta completa de students:", response);
      
      // Verificar la estructura de la respuesta y extraer los datos correctamente
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log("Formato estándar de API detectado, usando response.data.data");
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        console.log("Formato alternativo detectado, usando response.data directamente");
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Buscar cualquier propiedad que sea un array en la respuesta
        console.log("Buscando arrays en la estructura de respuesta");
        
        // Extraer todos los arrays de la respuesta
        const arrayProps = Object.entries(response.data)
          .filter(([_, val]) => Array.isArray(val))
          .map(([key, val]) => ({ key, length: (val as any[]).length, value: val }));
        
        console.log("Arrays encontrados:", arrayProps.map(a => `${a.key}[${a.length}]`).join(', '));
        
        if (arrayProps.length > 0) {
          // Ordenar por tamaño del array (mayor primero)
          arrayProps.sort((a, b) => b.length - a.length);
          console.log(`Usando el array más grande: ${arrayProps[0].key}[${arrayProps[0].length}]`);
          return arrayProps[0].value as Student[];
        }
      }
      
      console.log("Estructura de respuesta no reconocida:", response.data);
      return [];
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      throw error;
    }
  }

  static async getStudentProfile(studentId: number): Promise<StudentProfile> {
    try {
      console.log(`Solicitando perfil del estudiante ${studentId}`);
      
      // Probar con la ruta /api/user/student/ que parece estar funcionando según los logs
      const response = await apiClient.get(`/api/user/student/${studentId}/profile`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta de student profile:', response);
      
      // Verificar si la respuesta tiene la estructura esperada
      let data;
      if (response.data?.data) {
        // Si la respuesta tiene un objeto data anidado (formato antiguo)
        data = response.data.data;
      } else {
        // Si la respuesta ya tiene el formato esperado
        data = response.data;
      }
      
      console.log('Datos procesados:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener perfil del estudiante:', error);
      // Devolver un perfil vacío para evitar errores en la interfaz
      return {
        id: Number(studentId),
        name: 'Error al cargar',
        surname: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalProgress: 0,
        currentCourses: []
      };
    }
  }

  static async getStudentCertificates(studentId: number): Promise<Certificate[]> {
    try {
      console.log(`Solicitando certificados del estudiante ${studentId}`);
      
      // Usar la ruta /api/user/student/ que parece estar funcionando según los logs
      const response = await apiClient.get(`/api/user/student/${studentId}/certificates`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta de certificates:', response);
      
      // Verificar si la respuesta tiene la estructura esperada
      let certificates: Certificate[] = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Si la respuesta tiene un array en data.data (formato antiguo)
        certificates = response.data.data as Certificate[];
      } else if (Array.isArray(response.data)) {
        // Si la respuesta ya es un array
        certificates = response.data as Certificate[];
      } else if (response.data && typeof response.data === 'object') {
        // Buscar cualquier propiedad que sea un array en la respuesta
        const arrayProps = Object.entries(response.data)
          .filter(([_, val]) => Array.isArray(val))
          .map(([key, val]) => ({ key, value: val as any[] }));
        
        if (arrayProps.length > 0) {
          // Usar el primer array encontrado
          certificates = arrayProps[0].value as Certificate[];
        }
      }
      
      console.log('Certificados procesados:', certificates);
      return certificates;
    } catch (error) {
      console.error('Error al obtener certificados del estudiante:', error);
      return [];
    }
  }
}