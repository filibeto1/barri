export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  __v?: number;
  phone?: string;  // Propiedad opcional
  profileImage?: string; // Propiedad opcional
  createdAt: Date;
  startDate: Date | string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  msg?: string;
  error?: string; // Añade esta línea
   errors?: Array<{ msg: string }>;
     code?: string; 
  // Otras propiedades que pueda devolver tu backend
}