const { Question, Test } = require('../models');

const questionController = {
  async createQuestion(req, res) {
    try {
      const {
        test_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        marks
      } = req.body;

      const question = await Question.create({
        test_id,
        question_text,
        correct_option,
        marks,
        option_a,
        option_b,
        option_c,
        option_d,
        question_image: req.files['question_image']?.[0]?.path,
        option_a_image: req.files['option_a_image']?.[0]?.path,
        option_b_image: req.files['option_b_image']?.[0]?.path,
        option_c_image: req.files['option_c_image']?.[0]?.path,
        option_d_image: req.files['option_d_image']?.[0]?.path
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
        message: 'Failed to create question'
      });
    }
  },

  async getQuestionsByTest(req, res) {
    try {
      const { testId } = req.params;
      const questions = await Question.findAll({
        where: { test_id: testId },
        order: [['createdAt', 'DESC']]
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
        message: 'Failed to fetch questions'
      });
    }
  }
};

module.exports = questionController;
