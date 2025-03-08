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

export class AdminService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${this.BASE_URL}/admin/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado - Por favor, inicie sesión de nuevo');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data;
      
      console.log("Datos recibidos del backend:", data);
      
      return data || {
        totalStudents: 0,
        totalActiveCourses: 0,
        certificatesIssued: 0,
        completionRate: 0,
        averageHours: 0,
        activeStudents: 0,
        passRate: 0,
        graduatesThisYear: 0
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error; // Re-lanzamos el error para manejarlo en el componente
    }
  }
}