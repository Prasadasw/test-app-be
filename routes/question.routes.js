const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const upload = require('../middleware/upload');

// Multiple fields support (one file each)
const multiUpload = (req, res, next) => {
  // Set testId from params for the upload middleware
  req.params.testId = req.params.testId;
  
  const uploadHandler = upload.fields([
    { name: 'question_image', maxCount: 1 },
    { name: 'option_a_image', maxCount: 1 },
    { name: 'option_b_image', maxCount: 1 },
    { name: 'option_c_image', maxCount: 1 },
    { name: 'option_d_image', maxCount: 1 }
  ]);

  uploadHandler(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    }
    next();
  });
};

// Create a new question for a specific test
router.post('/test/:testId/questions', multiUpload, questionController.createQuestion);

// Get all questions by test ID
router.get('/test/:testId/questions', questionController.getQuestionsByTest);

module.exports = router;
