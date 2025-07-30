const Class = require('../models/Class');
const Instructor = require('../models/Instructor');
const mongoose = require('mongoose');

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('trainer', 'nombre apellido');
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('trainer', 'nombre apellido');
    if (!cls) {
      return res.status(404).json({ success: false, error: 'Clase no encontrada' });
    }
    res.json({ success: true, data: cls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.body.trainer);
    if (!instructor) {
      return res.status(404).json({ success: false, error: 'Instructor no encontrado' });
    }

    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('trainer', 'nombre apellido');
    
    if (!updatedClass) {
      return res.status(404).json({ success: false, error: 'Clase no encontrada' });
    }
    res.json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
// controllers/classController.js - Versión corregida

exports.getUpcomingClasses = async (req, res) => {
  try {
    // Validación mejorada del usuario
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Validación del ID de usuario
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const currentDate = new Date();

    const classes = await Class.find({
      participants: userId,
      startDate: { $gte: currentDate },
      status: { $ne: 'cancelled' }
    })
    .populate('trainer', 'nombre apellido')
    .populate('participants', 'name email')
    .lean();

    res.json({ 
      success: true, 
      data: classes.map(cls => ({
        ...cls,
        id: cls._id.toString(),
        _id: cls._id.toString(),
        startDate: cls.startDate.toISOString()
      }))
    });

  } catch (error) {
    console.error('Error in getUpcomingClasses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
exports.getAvailableClasses = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Consulta mejorada con validación de fechas
    const classes = await Class.find({
      active: true,
      startDate: { $gte: currentDate },
      status: 'available',
      $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] }
    })
    .populate('trainer', 'nombre apellido')
    .lean();

    // Formatear respuesta consistentemente
    const response = classes.map(cls => ({
      _id: cls._id,
      id: cls._id.toString(),
      name: cls.name,
      instructor: cls.trainer ? `${cls.trainer.nombre} ${cls.trainer.apellido}` : 'Instructor no asignado',
      startDate: cls.startDate,
      date: cls.startDate,
      time: cls.startDate.toTimeString().substring(0, 5),
      duration: cls.duration,
      difficulty: cls.difficulty,
      maxParticipants: cls.maxParticipants,
      currentParticipants: cls.participants ? cls.participants.length : 0,
      status: cls.status,
      image: cls.image || ''
    }));

    res.json({ 
      success: true, 
      data: response 
    });

  } catch (error) {
    console.error('Error en getAvailableClasses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener clases disponibles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
exports.joinClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, error: 'Clase no encontrada' });
    }

    if (cls.participants.includes(userId)) {
      return res.status(400).json({ success: false, error: 'Ya estás inscrito en esta clase' });
    }

    if (cls.participants.length >= cls.maxParticipants) {
      return res.status(400).json({ success: false, error: 'La clase está llena' });
    }

    cls.participants.push(userId);
    if (cls.participants.length >= cls.maxParticipants) {
      cls.status = 'full';
    }

    await cls.save();
    res.json({ success: true, data: cls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ success: false, error: 'Clase no encontrada' });
    }
    res.json({ success: true, data: deletedClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};