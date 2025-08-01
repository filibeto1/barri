export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  youtubeApiKey: 'AIzaSyDxNS3RPLBT2uMFD-0Lpt7RQvmJCwTR-00',

  enableDebug: true, // Habilitar logs de depuración
  version: '1.0.0-dev', // Versión de la aplicación
  defaultLanguage: 'es', // Idioma por defecto



  // Configuración de autenticación
  auth: {
    tokenKey: 'auth_token', // Key para almacenar el token en localStorage
    userKey: 'current_user' // Key para almacenar el usuario en localStorage
  }
};
