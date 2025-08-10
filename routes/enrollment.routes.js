const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Student routes (protected)
router.post('/request', authMiddleware, enrollmentController.requestEnrollment);
router.get('/my-requests', authMiddleware, enrollmentController.getStudentEnrollments);
router.get('/check-access/:testId', authMiddleware, enrollmentController.checkTestAccess);

// Test route without auth for debugging
router.post('/test-request', enrollmentController.requestEnrollment);

// Admin routes (protected) - these should have admin middleware in the future
router.get('/admin/requests', authMiddleware, enrollmentController.getAllEnrollmentRequests);
router.put('/admin/requests/:enrollmentId', authMiddleware, enrollmentController.updateEnrollmentStatus);

module.exports = router;
