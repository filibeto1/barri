export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api', // URL de tu backend en desarrollo
  enableDebug: true, // Habilitar logs de depuración
  version: '1.0.0-dev', // Versión de la aplicación
  defaultLanguage: 'es', // Idioma por defecto

  youtubeApiKey: 'TU_API_KEY_DE_YOUTUBE',

  // Configuración de autenticación
  auth: {
    tokenKey: 'auth_token', // Key para almacenar el token en localStorage
    userKey: 'current_user' // Key para almacenar el usuario en localStorage
  }
};
