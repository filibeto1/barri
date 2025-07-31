export interface Class {
  id: string;
  name: string;
  description: string;
  startDate: Date | string;
  duration: number;
  instructor: string;
  trainer?: {
    id: string;
    nombre?: string;
    apellido?: string;
  } | string;
  trainerId?: string | null;
  maxParticipants: number;
  currentParticipants: number;
  status: 'available' | 'full' | 'cancelled' | 'completed' | 'almost_full';
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  active: boolean;
  // Propiedades opcionales
  schedule?: string;
  date?: Date | string;
  time?: string;
  image?: string;
}
export interface ClassApiResponse {
  success: boolean;
  data: Class | Class[];
  message?: string;
  count?: number;
}