const { TestSubmission, StudentAnswer, Question, Test, Student, Program, Admin } = require('../models');
const { Op } = require('sequelize');

const resultReviewController = {
  // Admin: Get all submitted tests for review
  async getSubmittedTestsForReview(req, res) {
    try {
      const { status, test_id, program_id, student_id } = req.query;
      
      let whereClause = {};
      let testIncludeWhere = {};

      // Filter by submission status
      if (status && ['submitted', 'under_review', 'result_released'].includes(status)) {
        whereClause.status = status;
      } else {
        // Default: show submitted and under review
        whereClause.status = {
          [Op.in]: ['submitted', 'under_review']
        };
      }

      // Filter by specific test
      if (test_id) {
        whereClause.test_id = test_id;
      }

      // Filter by program (through test relationship)
      if (program_id) {
        testIncludeWhere.program_id = program_id;
      }

      // Filter by specific student
      if (student_id) {
        whereClause.student_id = student_id;
      }

      const submissions = await TestSubmission.findAll({
        where: whereClause,
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'first_name', 'last_name', 'mobile', 'qualification']
          },
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'description', 'duration', 'total_marks'],
            where: Object.keys(testIncludeWhere).length > 0 ? testIncludeWhere : undefined,
            include: [
              {
                model: Program,
                as: 'program',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['submitted_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions
      });
    } catch (error) {
      console.error('Error fetching submitted tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch submitted tests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Get detailed submission for review
  async getSubmissionForReview(req, res) {
    try {
      const { submissionId } = req.params;

      const submission = await TestSubmission.findByPk(submissionId, {
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'first_name', 'last_name', 'mobile', 'qualification']
          },
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'description', 'duration', 'total_marks'],
            include: [
              {
                model: Program,
                as: 'program',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: StudentAnswer,
            as: 'answers',
            include: [
              {
                model: Question,
                as: 'question',
                attributes: ['id', 'question_text', 'question_image', 'option_a', 'option_b', 'option_c', 'option_d', 'option_a_image', 'option_b_image', 'option_c_image', 'option_d_image', 'correct_option', 'marks']
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

      // Prepare data for admin review
      const reviewData = {
        submission_id: submission.id,
        student: submission.student,
        test: submission.test,
        started_at: submission.started_at,
        submitted_at: submission.submitted_at,
        time_taken: submission.time_taken,
        status: submission.status,
        answers: submission.answers.map(answer => ({
          question_id: answer.question_id,
          question: answer.question,
          selected_option: answer.selected_option,
          correct_option: answer.question.correct_option,
          is_correct: answer.is_correct,
          marks_obtained: answer.marks_obtained,
          max_marks: answer.max_marks,
          admin_notes: answer.admin_notes
        }))
      };

      return res.status(200).json({
        success: true,
        data: reviewData
      });
    } catch (error) {
      console.error('Error fetching submission for review:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch submission for review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Review and score submission
  async reviewSubmission(req, res) {
    try {
      const { submissionId } = req.params;
      const { answers, admin_notes, total_score } = req.body;
      const admin_id = req.user.id;

      // Validate submission exists and is in reviewable state
      const submission = await TestSubmission.findOne({
        where: { 
          id: submissionId,
          status: {
            [Op.in]: ['submitted', 'under_review']
          }
        }
      });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or not available for review'
        });
      }

      // Validate answers format
      if (!Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: 'Answers must be an array'
        });
      }

      // Update submission status to under review
      await submission.update({
        status: 'under_review',
        admin_notes: admin_notes || null
      });

      // Update individual answers
      for (const answer of answers) {
        if (answer.question_id && answer.marks_obtained !== undefined) {
          await StudentAnswer.update(
            {
              marks_obtained: answer.marks_obtained,
              is_correct: answer.marks_obtained > 0,
              admin_notes: answer.admin_notes || null,
              reviewed_by: admin_id,
              reviewed_at: new Date()
            },
            {
              where: {
                submission_id: submissionId,
                question_id: answer.question_id
              }
            }
          );
        }
      }

      // Calculate total score if not provided
      let finalScore = total_score;
      if (!finalScore) {
        const studentAnswers = await StudentAnswer.findAll({
          where: { submission_id: submissionId },
          attributes: ['marks_obtained']
        });
        finalScore = studentAnswers.reduce((sum, answer) => sum + (answer.marks_obtained || 0), 0);
      }

      // Calculate percentage
      const percentage = (finalScore / submission.max_score) * 100;

      // Update submission with final scores
      await submission.update({
        total_score: finalScore,
        percentage: percentage,
        reviewed_by: admin_id,
        reviewed_at: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Submission reviewed successfully',
        data: {
          submission_id: submissionId,
          total_score: finalScore,
          max_score: submission.max_score,
          percentage: percentage,
          status: 'under_review'
        }
      });
    } catch (error) {
      console.error('Error reviewing submission:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to review submission',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Release result to student
  async releaseResult(req, res) {
    try {
      const { submissionId } = req.params;
      const { admin_notes } = req.body;
      const admin_id = req.user.id;

      // Validate submission exists and is reviewed
      const submission = await TestSubmission.findOne({
        where: { 
          id: submissionId,
          status: 'under_review'
        }
      });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or not ready for result release'
        });
      }

      // Update submission to release result
      await submission.update({
        status: 'result_released',
        admin_notes: admin_notes || submission.admin_notes,
        result_released_at: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Result released successfully to student',
        data: {
          submission_id: submissionId,
          status: 'result_released',
          total_score: submission.total_score,
          max_score: submission.max_score,
          percentage: submission.percentage,
          result_released_at: submission.result_released_at
        }
      });
    } catch (error) {
      console.error('Error releasing result:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to release result',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Get submission statistics
  async getSubmissionStats(req, res) {
    try {
      const { test_id, program_id } = req.query;
      
      let whereClause = {};
      let testIncludeWhere = {};

      if (test_id) {
        whereClause.test_id = test_id;
      }

      if (program_id) {
        testIncludeWhere.program_id = program_id;
      }

      const stats = await TestSubmission.findAll({
        where: whereClause,
        include: [
          {
            model: Test,
            as: 'test',
            where: Object.keys(testIncludeWhere).length > 0 ? testIncludeWhere : undefined,
            include: [
              {
                model: Program,
                as: 'program',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        attributes: [
          'status',
          'total_score',
          'max_score',
          'percentage',
          'time_taken'
        ]
      });

      // Calculate statistics
      const totalSubmissions = stats.length;
      const submittedCount = stats.filter(s => s.status === 'submitted').length;
      const underReviewCount = stats.filter(s => s.status === 'under_review').length;
      const releasedCount = stats.filter(s => s.status === 'result_released').length;
      
      const completedSubmissions = stats.filter(s => s.status === 'result_released');
      const avgScore = completedSubmissions.length > 0 
        ? completedSubmissions.reduce((sum, s) => sum + (s.total_score || 0), 0) / completedSubmissions.length 
        : 0;
      const avgPercentage = completedSubmissions.length > 0 
        ? completedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSubmissions.length 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          total_submissions: totalSubmissions,
          status_breakdown: {
            submitted: submittedCount,
            under_review: underReviewCount,
            result_released: releasedCount
          },
          performance_stats: {
            average_score: avgScore,
            average_percentage: avgPercentage,
            total_completed: completedSubmissions.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting submission stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get submission statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = resultReviewController;
