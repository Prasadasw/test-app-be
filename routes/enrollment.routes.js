const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const { authenticateStudent, authenticateAdmin } = require('../middleware/auth.middleware');

// Student routes (protected)
router.post('/request', authenticateStudent, enrollmentController.requestEnrollment);
router.get('/my-requests', authenticateStudent, enrollmentController.getStudentEnrollments);
router.get('/check-access/:testId', authenticateStudent, enrollmentController.checkTestAccess);

// Test route without auth for debugging
router.post('/test-request', enrollmentController.requestEnrollment);

// Admin routes (protected)
router.get('/admin/requests', authenticateAdmin, enrollmentController.getAllEnrollmentRequests);
router.put('/admin/requests/:enrollmentId', authenticateAdmin, enrollmentController.updateEnrollmentStatus);

module.exports = router;
