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
      console.log('Iniciando petición a /admin/students');
      
      // Intentar con fetch primero para ver si obtenemos una respuesta diferente
      try {
        const fetchResponse = await fetch('/api/admin/students', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const fetchData = await fetchResponse.json();
        console.log('Respuesta con fetch a /api/admin/students:', fetchData);
        
        if (fetchData && (Array.isArray(fetchData.data) || Array.isArray(fetchData))) {
          const students = Array.isArray(fetchData.data) ? fetchData.data : 
                         Array.isArray(fetchData) ? fetchData : [];
          
          console.log('Estudiantes obtenidos con fetch:', students);
          return students as Student[];
        }
      } catch (fetchError) {
        console.error('Error con fetch a /api/admin/students:', fetchError);
      }
      
      // Si fetch falla, intentar con axios a través de apiClient
      const response = await apiClient.get('/api/admin/students', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Respuesta completa de students:', response);
      console.log('URL usada:', response.config?.url);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      
      // Verificar si la respuesta es HTML (lo que indicaría un error)
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('text/html')) {
        console.error('La respuesta es HTML en lugar de JSON. Posible redirección a login o error.');
        return [];
      }
      
      console.log('Datos crudos:', JSON.stringify(response.data));
      
      // Verificar si la respuesta tiene la estructura esperada
      let data;
      
      // La estructura de respuesta del backend es { message: string, data: any }
      if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && response.data.data !== null) {
          // Formato estándar de la API: { message: string, data: any }
          data = response.data.data;
          console.log('Formato estándar de API detectado, usando response.data.data');
        } else {
          // Si no tiene una propiedad data, usar el objeto completo
          data = response.data;
          console.log('Formato no estándar detectado, usando response.data directamente');
        }
      } else {
        // Si no es un objeto, usar la respuesta directamente
        data = response.data;
        console.log('La respuesta no es un objeto, usando response.data directamente');
      }
      
      console.log('Datos procesados:', data);
      
      // Asegurarse de que devolvemos un array de Student
      let studentsArray: Student[] = [];
      
      if (Array.isArray(data)) {
        console.log('Los datos son un array directamente con', data.length, 'elementos');
        // Devolver directamente el array de datos sin mapear
        return data as Student[];
      } else if (data && typeof data === 'object') {
        console.log('Los datos son un objeto, buscando array de estudiantes');
        
        // Buscar cualquier propiedad que sea un array
        const arrayProps = Object.entries(data)
          .filter(([_, val]) => Array.isArray(val))
          .sort((a, b) => (b[1] as any[]).length - (a[1] as any[]).length); // Ordenar por tamaño del array (mayor primero)
        
        if (arrayProps.length > 0) {
          console.log('Encontrados', arrayProps.length, 'arrays. Usando el más grande:', arrayProps[0][0]);
          // Devolver directamente el array encontrado sin mapear
          return arrayProps[0][1] as Student[];
        } else {
          console.log('No se encontraron arrays, intentando usar valores del objeto');
          // Intentar usar los valores del objeto si parecen ser estudiantes (tienen id)
          const potentialStudents = Object.values(data)
            .filter(val => val && typeof val === 'object' && 'id' in val);
          
          if (potentialStudents.length > 0) {
            console.log('Encontrados', potentialStudents.length, 'objetos que parecen estudiantes');
            // Devolver directamente los estudiantes encontrados sin mapear
            return potentialStudents as Student[];
          } else {
            console.log('No se encontraron objetos que parezcan estudiantes');
          }
        }
      }
      
      console.log('Array final de estudiantes procesado:', studentsArray);
      return studentsArray;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }


  static async getStudentProfile(studentId: number): Promise<StudentProfile> {
    try {
      const response = await apiClient.get(`/admin/students/${studentId}`);
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
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  static async getStudentCertificates(studentId: number): Promise<Certificate[]> {
    try {
      const response = await apiClient.get(`/admin/students/${studentId}/certificates`);
      console.log('Respuesta de certificates:', response);
      
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
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      throw error;
    }
  }
}