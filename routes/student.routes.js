const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticateStudent } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', studentController.register);
router.post('/login', studentController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateStudent, studentController.getProfile);

//gET all students
router.get('/', studentController.getAllStudents);

module.exports = router;
