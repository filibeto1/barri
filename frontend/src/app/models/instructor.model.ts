export interface Instructor {
  _id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string | string[];  // Permitir array o string
  fechaContratacion: Date;
  horario: string | Schedule[];    // Permitir string o array de Schedule
  activo: boolean;
  experiencia?: number;
  certificaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Schedule {
  dias: string;
  horaInicio: string;
  horaFin: string;
}

export const ESPECIALIDADES = [
  'Yoga',
  'Pilates',

  'Crossfit',
  'Natación',
  'Spinning',
  'Zumba',
  'Funcional',
  'Musculación',
  'Boxeo',
  'Aeróbicos',
  'Stretching',
  'Cardio',
  'Entrenamiento Personal'
];

export const HORARIOS_DISPONIBLES = [
  'Mañana (6:00 AM - 12:00 PM)',
  'Tarde (12:00 PM - 6:00 PM)',
  'Noche (6:00 PM - 10:00 PM)',
  'Lunes a Viernes (6:00 AM - 6:00 PM)',
  'Fines de Semana (8:00 AM - 4:00 PM)',
  'Tiempo Completo (6:00 AM - 10:00 PM)',
  'Medio Tiempo Mañana (6:00 AM - 12:00 PM)',
  'Medio Tiempo Tarde (2:00 PM - 8:00 PM)',
  'Horario Personalizado'
];

// Interfaz para crear instructor (sin _id)
export interface CreateInstructorDto extends Omit<Instructor, '_id' | 'createdAt' | 'updatedAt'> {}

// Interfaz para actualizar instructor (campos opcionales)
export interface UpdateInstructorDto extends Partial<Omit<Instructor, '_id' | 'createdAt' | 'updatedAt'>> {}