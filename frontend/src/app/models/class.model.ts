export interface Class {
  id: string;
  name: string;
  description: string;
  startDate: Date | string;
  duration: number;
  instructor?: string | { id: string };  // Hacerla opcional
  trainer?: string | { id: string; nombre?: string; apellido?: string };
  maxParticipants: number;
  currentParticipants: number;
  participants?: string[];  // Para el array de IDs de participantes
  status: 'available' | 'full' | 'cancelled' | 'completed' | 'almost_full';
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  active: boolean;
  time?: string;
  image?: string;
  // Eliminar propiedades no esenciales:
schedule?: string;
  // date?: Date | string;
}
export interface ClassApiResponse {
  success: boolean;
  data: Class | Class[];
  message?: string;
  count?: number;
}