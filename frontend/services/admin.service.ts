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
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  private static async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }
    console.log(this.BASE_URL);
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
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
    return result.data;
  }

  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const data = await this.fetchWithAuth('/admin/metrics');
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
      throw error;
    }
  }

  static async getAllStudents(): Promise<Student[]> {
    try {
      const data = await this.fetchWithAuth('/admin/students');
      console.log("data", data)
      return data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  static async getStudentProfile(studentId: number): Promise<StudentProfile> {
    try {
      const data = await this.fetchWithAuth(`/admin/students/${studentId}`);
      return data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  static async getStudentCertificates(studentId: number): Promise<Certificate[]> {
    try {
      const data = await this.fetchWithAuth(`/admin/students/${studentId}/certificates`);
      return data || [];
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      throw error;
    }
  }
}