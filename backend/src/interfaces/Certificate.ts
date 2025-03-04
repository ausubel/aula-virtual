export interface Certificate {
  id: number;
  name: string;
  description?: string;
  hours: number;
  date_emission: string;  // Siempre en formato ISO8601
  teacher_name?: string;
  teacher_degree?: string;
  teacher_profile?: string;
  student_name?: string;
  file?: string;
}
