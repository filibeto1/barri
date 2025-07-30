const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    // Termina el proceso con fallo (opcional, depende de tu caso de uso)
    process.exit(1);
  }
};

module.exports = connectDB;