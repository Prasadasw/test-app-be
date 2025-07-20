const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');

// Create a new program
router.post('/', programController.createProgram);

// Get all programs
router.get('/', programController.getPrograms);

module.exports = router;
