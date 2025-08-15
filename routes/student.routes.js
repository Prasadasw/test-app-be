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

// Get students who have completed tests (admin access)
router.get('/completed-tests', studentController.getStudentsWithCompletedTests);

// Get student's test completion summary
router.get('/:studentId/test-summary', studentController.getStudentTestSummary);

module.exports = router;
