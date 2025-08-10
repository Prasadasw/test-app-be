const { Test, Program, TestEnrollment } = require('../models');
const { Op } = require('sequelize');

const testController = {
  // Create a new test
  async createTest(req, res) {
    try {
      const { title, description, program_id, duration, total_marks, status } = req.body;

      // Check if Program exists
      const program = await Program.findByPk(program_id);
      if (!program) {
        return res.status(404).json({ success: false, message: 'Program not found' });
      }

      const test = await Test.create({
        title,
        description,
        program_id,
        duration,
        total_marks,
        status: status !== undefined ? status : true
      });

      return res.status(201).json({
        success: true,
        message: 'Test created successfully',
        data: test
      });
    } catch (error) {
      console.error('Error creating test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create test',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  //get all test

  async getTests(req, res) {
    try {
      const tests = await Test.findAll({
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: tests.length,
        data: tests
      });
    } catch (error) {
      console.error('Error fetching tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all tests by Program ID
  async getTestsByProgram(req, res) {
    try {
      const { programId } = req.params;

      const tests = await Test.findAll({
        where: { program_id: programId },
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: tests.length,
        data: tests
      });
    } catch (error) {
      console.error('Error fetching tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get a single test by ID
  async getTestById(req, res) {
    try {
      const { id } = req.params;

      const test = await Test.findByPk(id, {
        include: [
          {
            model: Program,
            as: 'program',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: test
      });
    } catch (error) {
      console.error('Error fetching test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch test',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get available tests for student enrollment (excludes already enrolled tests)
  async getAvailableTestsForStudent(req, res) {
    try {
      const student_id = req.user.id;

      // Get all test IDs that the student has already enrolled in
      const enrolledTests = await TestEnrollment.findAll({
        where: { student_id },
        attributes: ['test_id']
      });

      const enrolledTestIds = enrolledTests.map(enrollment => enrollment.test_id);

      // Get all active tests that the student hasn't enrolled in
      const whereClause = {
        status: true // Only active tests
      };

      if (enrolledTestIds.length > 0) {
        whereClause.id = {
          [Op.notIn]: enrolledTestIds
        };
      }

      const availableTests = await Test.findAll({
        where: whereClause,
        include: [
          {
            model: Program,
            as: 'program',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: availableTests.length,
        data: availableTests,
        message: availableTests.length === 0 ? 'No available tests for enrollment' : undefined
      });
    } catch (error) {
      console.error('Error fetching available tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch available tests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = testController;
