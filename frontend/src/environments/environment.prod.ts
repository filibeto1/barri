export const environment = {
  production: true,
apiUrl: 'http://localhost:5000/api', // URL de tu backend en producción
  enableDebug: false, // Deshabilitar logs en producción
  version: '1.0.0', // Versión de producción
  defaultLanguage: 'es',
  auth: {
    tokenKey: 'auth_token_prod',
    userKey: 'current_user_prod'
  }
};