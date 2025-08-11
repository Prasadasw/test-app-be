const { TestSubmission, StudentAnswer, Question, Test, TestEnrollment, Student, Program } = require('../models');
const { Op } = require('sequelize');

const testSubmissionController = {
  // Start a test (create submission)
  async startTest(req, res) {
    try {
      const { testId } = req.params;
      const student_id = req.user.id;

      // Check if student has approved enrollment for this test
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
          message: 'You do not have access to this test. Please request enrollment first.'
        });
      }

      // Check if test has already been started
      const existingSubmission = await TestSubmission.findOne({
        where: { student_id, test_id: testId }
      });

      if (existingSubmission) {
        if (existingSubmission.status === 'submitted' || existingSubmission.status === 'result_released') {
          return res.status(400).json({
            success: false,
            message: 'You have already completed this test'
          });
        }
        
        if (existingSubmission.status === 'in_progress') {
          return res.status(200).json({
            success: true,
            message: 'Test already in progress',
            data: {
              submission_id: existingSubmission.id,
              started_at: existingSubmission.started_at,
              status: existingSubmission.status
            }
          });
        }
      }

      // Get test details and questions
      const test = await Test.findByPk(testId, {
        include: [
          {
            model: Question,
            as: 'questions',
            attributes: ['id', 'question_text', 'question_image', 'option_a', 'option_b', 'option_c', 'option_d', 'option_a_image', 'option_b_image', 'option_c_image', 'option_d_image', 'marks']
          }
        ]
      });

      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
        });
      }

      // Create or get existing submission
      let submission;
      if (existingSubmission) {
        submission = existingSubmission;
      } else {
        submission = await TestSubmission.create({
          student_id,
          test_id: testId,
          enrollment_id: enrollment.id,
          max_score: test.total_marks,
          started_at: new Date()
        });
      }

      // Get questions without correct answers for student
      const questionsForStudent = test.questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_image: q.question_image,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        option_a_image: q.option_a_image,
        option_b_image: q.option_b_image,
        option_c_image: q.option_c_image,
        option_d_image: q.option_d_image,
        marks: q.marks
      }));

      return res.status(200).json({
        success: true,
        message: 'Test started successfully',
        data: {
          submission_id: submission.id,
          test: {
            id: test.id,
            title: test.title,
            description: test.description,
            duration: test.duration,
            total_marks: test.total_marks
          },
          questions: questionsForStudent,
          started_at: submission.started_at,
          status: submission.status
        }
      });
    } catch (error) {
      console.error('Error starting test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to start test',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Submit test answers
  async submitTest(req, res) {
    try {
      const { submissionId } = req.params;
      const { answers } = req.body;
      const student_id = req.user.id;

      // Validate submission belongs to student
      const submission = await TestSubmission.findOne({
        where: { id: submissionId, student_id },
        include: [
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'duration']
          }
        ]
      });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      if (submission.status !== 'in_progress') {
        return res.status(400).json({
          success: false,
          message: 'Test is not in progress'
        });
      }

      // Calculate time taken
      const timeTaken = Math.round((new Date() - new Date(submission.started_at)) / (1000 * 60)); // in minutes

      // Validate answers format
      if (!Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: 'Answers must be an array'
        });
      }

      // Get questions for this test
      const questions = await Question.findAll({
        where: { test_id: submission.test_id },
        attributes: ['id', 'marks']
      });

      // Create student answers
      const studentAnswers = [];
      for (const answer of answers) {
        if (!answer.question_id || !answer.selected_option) {
          continue; // Skip invalid answers
        }

        const question = questions.find(q => q.id === answer.question_id);
        if (question) {
          studentAnswers.push({
            submission_id: submissionId,
            question_id: answer.question_id,
            selected_option: answer.selected_option,
            max_marks: question.marks
          });
        }
      }

      // Save all answers
      await StudentAnswer.bulkCreate(studentAnswers);

      // Update submission status
      await submission.update({
        status: 'submitted',
        submitted_at: new Date(),
        time_taken: timeTaken
      });

      return res.status(200).json({
        success: true,
        message: 'Test submitted successfully',
        data: {
          submission_id: submissionId,
          submitted_at: submission.submitted_at,
          time_taken: timeTaken,
          status: 'submitted'
        }
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit test',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get student's test submission status
  async getSubmissionStatus(req, res) {
    try {
      const { testId } = req.params;
      const student_id = req.user.id;

      const submission = await TestSubmission.findOne({
        where: { student_id, test_id: testId },
        include: [
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'duration', 'total_marks']
          }
        ]
      });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'No submission found for this test'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          submission_id: submission.id,
          status: submission.status,
          started_at: submission.started_at,
          submitted_at: submission.submitted_at,
          time_taken: submission.time_taken,
          test: submission.test
        }
      });
    } catch (error) {
      console.error('Error getting submission status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get submission status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get student's submitted answers (for review)
  async getSubmittedAnswers(req, res) {
    try {
      const { submissionId } = req.params;
      const student_id = req.user.id;

      const submission = await TestSubmission.findOne({
        where: { id: submissionId, student_id },
        include: [
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'description']
          },
          {
            model: StudentAnswer,
            as: 'answers',
            include: [
              {
                model: Question,
                as: 'question',
                attributes: ['id', 'question_text', 'question_image', 'option_a', 'option_b', 'option_c', 'option_d', 'option_a_image', 'option_b_image', 'option_c_image', 'option_d_image', 'marks']
              }
            ]
          }
        ]
      });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      // Only show answers if result is released
      if (submission.status !== 'result_released') {
        return res.status(403).json({
          success: false,
          message: 'Results are not yet released for this test'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          submission_id: submission.id,
          test: submission.test,
          submitted_at: submission.submitted_at,
          time_taken: submission.time_taken,
          total_score: submission.total_score,
          max_score: submission.max_score,
          percentage: submission.percentage,
          answers: submission.answers.map(answer => ({
            question: answer.question,
            selected_option: answer.selected_option,
            is_correct: answer.is_correct,
            marks_obtained: answer.marks_obtained,
            max_marks: answer.max_marks
          }))
        }
      });
    } catch (error) {
      console.error('Error getting submitted answers:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get submitted answers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all test results for the authenticated student
  async getMyResults(req, res) {
    try {
      const student_id = req.user.id;

      const submissions = await TestSubmission.findAll({
        where: { 
          student_id,
          status: { [Op.in]: ['submitted', 'result_released'] }
        },
        include: [
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'description', 'total_marks']
          }
        ],
        order: [['submitted_at', 'DESC']]
      });

      const results = submissions.map(submission => ({
        id: submission.id,
        test_title: submission.test.title,
        score: submission.total_score || 0,
        total_marks: submission.max_score || submission.test.total_marks,
        percentage: submission.percentage || 0,
        status: submission.status === 'result_released' ? 'released' : 'completed',
        submitted_at: submission.submitted_at,
        reviewed_at: submission.reviewed_at
      }));

      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error getting test results:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get test results',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = testSubmissionController;
