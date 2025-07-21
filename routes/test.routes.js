const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');

// Create new test
router.post('/', testController.createTest);

// Get all tests
router.get('/', testController.getTests);

// Get a single test by ID
router.get('/:id', testController.getTestById);

// Get all tests for a given program
router.get('/program/:programId', testController.getTestsByProgram);

module.exports = router;
