const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const upload = require('../middleware/upload');

// Multiple fields support (one file each)
const multiUpload = upload.fields([
  { name: 'question_image', maxCount: 1 },
  { name: 'option_a_image', maxCount: 1 },
  { name: 'option_b_image', maxCount: 1 },
  { name: 'option_c_image', maxCount: 1 },
  { name: 'option_d_image', maxCount: 1 }
]);

// Create a new question
router.post('/', multiUpload, questionController.createQuestion);

// Get all questions by test ID
router.get('/test/:testId', questionController.getQuestionsByTest);

module.exports = router;
