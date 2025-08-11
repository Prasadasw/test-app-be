const express = require('express');
const router = express.Router();
const testSubmissionController = require('../controllers/testSubmission.controller');
const { authenticateStudent } = require('../middleware/auth.middleware');

// All routes require student authentication
router.use(authenticateStudent);

// Start a test (create submission)
router.post('/start/:testId', testSubmissionController.startTest);

// Submit test answers
router.post('/submit/:submissionId', testSubmissionController.submitTest);

// Get submission status for a test
router.get('/status/:testId', testSubmissionController.getSubmissionStatus);

// Get submitted answers (only after result is released)
router.get('/answers/:submissionId', testSubmissionController.getSubmittedAnswers);

// Get all test results for the authenticated student
router.get('/my-results', testSubmissionController.getMyResults);

module.exports = router;
