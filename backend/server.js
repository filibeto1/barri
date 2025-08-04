require('dotenv').config({ path: '.env' });
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Añadir al inicio del servidor
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception:', error);
  process.exit(1);
});

// Verificación crítica de variables de entorno
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR FATAL: JWT_SECRET no está definido en .env');
  process.exit(1);
}

connectDB();

const app = express();

// Configuración CORS segura (mejorada)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Importar rutas
const authRoutes = require('./routes/auth');
const instructorRoutes = require('./routes/instructor');
const classRoutes = require('./routes/class');
const userRoutes = require('./routes/user'); // Asegúrate de crear este archivo

// Configuración de rutas (orden importante)
app.use('/api/auth', authRoutes);  // Asegúrate que esta línea esté antes de otras rutas
app.use('/api/users', userRoutes); // Rutas de usuario
app.use('/api/instructores', instructorRoutes);
app.use('/api/classes', classRoutes);

// Después de las otras rutas
const youtubeRoutes = require('./routes/youtube');
app.use('/api/youtube', youtubeRoutes);

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    msg: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(`🔥 Error [${new Date().toISOString()}]:`, err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Error interno del servidor';
  
  res.status(statusCode).json({ 
    success: false,
    msg: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en ejecución en puerto ${PORT}`);
  console.log(`🌎 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});