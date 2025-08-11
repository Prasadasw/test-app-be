const express = require('express');
const router = express.Router();
const resultReviewController = require('../controllers/resultReview.controller');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(authenticateAdmin);

// Get all submitted tests for review
router.get('/submissions', resultReviewController.getSubmittedTestsForReview);

// Get detailed submission for review
router.get('/submission/:submissionId', resultReviewController.getSubmissionForReview);

// Review and score submission
router.put('/review/:submissionId', resultReviewController.reviewSubmission);

// Release result to student
router.put('/release/:submissionId', resultReviewController.releaseResult);

// Get submission statistics
router.get('/stats', resultReviewController.getSubmissionStats);

module.exports = router;
