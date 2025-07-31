const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'authdb', // Asegúrate que coincide con tu BD
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log('✅ MongoDB conectado correctamente a la base:', mongoose.connection.name);
    console.log('Colecciones disponibles:', (await mongoose.connection.db.listCollections().toArray()).map(c => c.name));
    
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('error', err => {
  console.error('Error de conexión MongoDB:', err);
});

module.exports = connectDB;