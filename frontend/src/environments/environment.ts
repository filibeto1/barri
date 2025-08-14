export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001/api',  // Cambiado de 5000 a 5001
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
