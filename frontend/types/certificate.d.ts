export interface Certificate {
  id: number;
  name: string;
  description?: string;
  hours: number;
  date_emission: string;  // Siempre como string en ISO format
  teacher_name?: string;
  teacher_degree?: string;
  teacher_profile?: string;
  file?: string;
}
