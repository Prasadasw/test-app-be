const { Question, Test, TestEnrollment } = require('../models');
const path = require('path');

const questionController = {
  async createQuestion(req, res) {
    try {
      const { testId } = req.params;
      const {
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        marks
      } = req.body;

      // Verify test exists
      const test = await Test.findByPk(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
        });
      }

      // Helper function to process file paths
      const processFilePath = (file) => {
        if (!file) return null;
        // Convert backslashes to forward slashes for consistent URLs
        return file.path.replace(/\\/g, '/').replace('public', '');
      };

      const question = await Question.create({
        test_id: testId,
        question_text,
        correct_option,
        marks: parseInt(marks, 10) || 1,
        option_a,
        option_b,
        option_c,
        option_d,
        question_image: processFilePath(req.files['question_image']?.[0]),
        option_a_image: processFilePath(req.files['option_a_image']?.[0]),
        option_b_image: processFilePath(req.files['option_b_image']?.[0]),
        option_c_image: processFilePath(req.files['option_c_image']?.[0]),
        option_d_image: processFilePath(req.files['option_d_image']?.[0])
      });

      return res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: question
      });
    } catch (error) {
      console.error('Error creating question:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create question',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  },

  async getQuestionsByTest(req, res) {
    try {
      const { testId } = req.params;
      const student_id = req.user?.id; // From auth middleware
      
      // Verify test exists
      const test = await Test.findByPk(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
        });
      }

      // Check if student has approved enrollment for this test
      if (student_id) {
        const enrollment = await TestEnrollment.findOne({
          where: { 
            student_id, 
            test_id: testId,
            status: 'approved'
          }
        });

        if (!enrollment) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this test. Please request enrollment first.',
            code: 'ENROLLMENT_REQUIRED'
          });
        }

        // Check if enrollment has expired
        if (enrollment.expires_at && new Date() > enrollment.expires_at) {
          return res.status(403).json({
            success: false,
            message: 'Your access to this test has expired',
            code: 'ENROLLMENT_EXPIRED',
            expired_at: enrollment.expires_at
          });
        }
      }

      const questions = await Question.findAll({
        where: { test_id: testId },
        order: [['createdAt', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        count: questions.length,
        data: questions
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch questions',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
};

module.exports = questionController;
