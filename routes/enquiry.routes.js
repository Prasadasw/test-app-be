const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiry.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route - Create enquiry (no auth required)
router.post('/', enquiryController.createEnquiry);

// Admin routes - require authentication
router.get('/', enquiryController.getAllEnquiries);
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;
