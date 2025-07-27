const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', studentController.register);
router.post('/login', studentController.login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, studentController.getProfile);

module.exports = router;
