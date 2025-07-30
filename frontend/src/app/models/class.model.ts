export interface Class {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  instructor: string | { _id: string; nombre?: string; apellido?: string };
  trainer?: string | { _id: string; nombre?: string; apellido?: string };
  trainerId?: string | null; // Add this line
  startDate: Date | string;
  date?: Date | string;
  time?: string ;
  duration: number;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  maxParticipants: number;
  schedule?: string;
  currentParticipants: number;
  status: 'available' | 'full' | 'cancelled' | 'completed';
  image?: string;
  category?: string;
  location?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipo para la respuesta del API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string; // Ahora está definido como opcional
  count?: number;
}