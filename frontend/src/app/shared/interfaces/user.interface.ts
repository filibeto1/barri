export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  __v?: number;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  msg?: string;
  error?: string; // Añade esta línea
   errors?: Array<{ msg: string }>;
  // Otras propiedades que pueda devolver tu backend
}