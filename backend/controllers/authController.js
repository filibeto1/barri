const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    // Validaciones mejoradas
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Todos los campos son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        msg: 'El usuario ya existe' 
      });
    }

    // QUITAR ESTO - NO hashees manualmente
    // const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear usuario SIN hashear - el middleware lo hará automáticamente
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password, // Pasar la contraseña sin hashear
      role
    });

    // Generar token JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// @desc    Refrescar token JWT
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        msg: 'Token no proporcionado' 
      });
    }

    // Verificar el token actual
    jwt.verify(token, process.env.JWT_SECRET.trim(), (err, user) => {
      if (err) {
        console.error('Error al verificar token:', err);
        return res.status(403).json({ 
          success: false, 
          msg: 'Token inválido o expirado' 
        });
      }

      // Eliminar la firma anterior y la expiración
      delete user.iat;
      delete user.exp;

      // Generar nuevo token
      const newToken = jwt.sign(
        user,
        process.env.JWT_SECRET.trim(),
        { expiresIn: '5h' }
      );

      // Configurar cookie segura
      setAuthCookie(res, newToken);

      res.json({
        success: true,
        token: newToken
      });
    });
  } catch (err) {
    console.error('Error en refreshToken:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// @desc    Autenticar usuario
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('=== DEBUG LOGIN ===');
    console.log('Email recibido:', email);
    console.log('Password recibido:', password);
    console.log('Email procesado:', email.toLowerCase().trim());

    // Validaciones mejoradas
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Email y contraseña son requeridos' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log('Usuario encontrado:', !!user);
    
    if (!user) {
      console.log('Usuario NO encontrado en DB');
      return res.status(401).json({ 
        success: false, 
        msg: 'Credenciales inválidas' 
      });
    }

    console.log('Datos del usuario:', {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });
    
    // NUEVA VALIDACIÓN: Verificar que el usuario tenga contraseña
    if (!user.password) {
      console.error('Usuario sin contraseña hasheada:', user.email);
      return res.status(500).json({ 
        success: false, 
        msg: 'Error de configuración de cuenta' 
      });
    }
    
    console.log('Comparando contraseñas...');
    // CORRECCIÓN: Primero hacer la comparación, DESPUÉS el console.log
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Contraseñas coinciden:', isMatch);

    if (!isMatch) {
      console.log('Contraseña incorrecta'); // Agregar este log también
      return res.status(401).json({ 
        success: false, 
        msg: 'Credenciales inválidas' 
      });
    }

    console.log('Login exitoso, generando token...'); // Log adicional

    // Generar token JWT
    const token = generateToken(user);

    // Configurar cookie segura
    setAuthCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
exports.refreshToken = async (req, res) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        msg: 'Token no proporcionado',
        code: 'MISSING_TOKEN'
      });
    }

    // Verificar el token actual (permitiendo tokens expirados)
    jwt.verify(token, process.env.JWT_SECRET.trim(), { ignoreExpiration: true }, (err, user) => {
      if (err) {
        console.error('Error al verificar token:', err);
        return res.status(403).json({ 
          success: false, 
          msg: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      }

      // Eliminar metadatos del token
      delete user.iat;
      delete user.exp;
      delete user.nbf;
      delete user.jti;

      // Generar nuevo token
      const newToken = jwt.sign(
        user,
        process.env.JWT_SECRET.trim(),
        { expiresIn: '1h' } // Nueva expiración
      );

      res.json({
        success: true,
        token: newToken,
        expiresIn: 3600 // 1 hora en segundos
      });
    });
  } catch (err) {
    console.error('Error en refreshToken:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error en el servidor',
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// @desc    Obtener datos de usuario
// @route   GET /api/auth/user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper para generar token JWT
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.sign(
    { 
      id: user._id, 
      role: user.role 
    },
    process.env.JWT_SECRET.trim(),
    { expiresIn: '5h' }
  );
}

// Helper para configurar cookie de autenticación
function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 5 * 60 * 60 * 1000, // 5 horas
    path: '/'
  });
}