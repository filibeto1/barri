const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const auth = require('../middlewares/auth');
 
router.get('/', auth, classController.getAllClasses);
router.get('/:id', auth, classController.getClassById);
router.post('/', auth, classController.createClass);
router.put('/:id', auth, classController.updateClass);
router.delete('/:id', auth, classController.deleteClass);

// Añade estas nuevas rutas
router.get('/available', auth, classController.getAvailableClasses);
router.get('/upcoming', auth, classController.getUpcomingClasses);

module.exports = router;