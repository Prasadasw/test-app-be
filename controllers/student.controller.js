const { Student, TestSubmission, Test, Program } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Generate JWT token
const generateToken = (student) => {
  return jwt.sign(
    { id: student.id, mobile: student.mobile },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const studentController = {
  async register(req, res) {
    try {
      const { first_name, last_name, dob, mobile, password, alternate_mobile, qualification } = req.body;

      // Check if mobile already exists
      const existingStudent = await Student.findOne({ where: { mobile } });
      if (existingStudent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mobile number already registered' 
        });
      }

      // Create new student
      const student = await Student.create({
        first_name,
        last_name,
        dob,
        mobile,
        password,
        alternate_mobile,
        qualification,
        is_verified: true // Auto-verify since we're using password
      });

      // Generate JWT token
      const token = generateToken(student);

      // Remove password from response
      const studentData = student.get();
      delete studentData.password;

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          student: studentData,
          token
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Registration failed', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
  },

  async login(req, res) {
    try {
      const { mobile, password } = req.body;

      // Find student by mobile
      const student = await Student.findOne({ where: { mobile } });
      if (!student) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid mobile or password' 
        });
      }

      // Check password
      const isPasswordValid = await student.validPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid mobile or password' 
        });
      }

      // Generate JWT token
      const token = generateToken(student);

      // Remove password from response
      const studentData = student.get();
      delete studentData.password;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          student: studentData,
          token
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Login failed', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
  },

  async getProfile(req, res) {
    try {
      // Get basic student data first
      const student = await Student.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }

      // Initialize profile data with basic student info
      const profileData = {
        student: {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          dob: student.dob,
          mobile: student.mobile,
          alternate_mobile: student.alternate_mobile,
          qualification: student.qualification,
          is_verified: student.is_verified,
          created_at: student.createdAt
        },
        enrollments: [],
        test_results: []
      };

      // Try to get enrollments if the model is available
      try {
        const { TestEnrollment, Test, Program } = require('../models');
        
        const enrollments = await TestEnrollment.findAll({
          where: { student_id: student.id },
          include: [
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
            }
          ]
        });

        profileData.enrollments = enrollments.map(enrollment => ({
          id: enrollment.id,
          status: enrollment.status,
          request_message: enrollment.request_message,
          admin_notes: enrollment.admin_notes,
          approved_at: enrollment.approved_at,
          expires_at: enrollment.expires_at,
          test: enrollment.test
        }));
      } catch (enrollmentError) {
        console.warn('Could not fetch enrollments:', enrollmentError.message);
        // Continue without enrollments
      }

      // Try to get test submissions if the model is available
      try {
        const { TestSubmission } = require('../models');
        
        const submissions = await TestSubmission.findAll({
          where: { student_id: student.id },
          include: [
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
            }
          ]
        });

        profileData.test_results = submissions.map(submission => ({
          id: submission.id,
          status: submission.status,
          started_at: submission.started_at,
          submitted_at: submission.submitted_at,
          time_taken: submission.time_taken,
          total_score: submission.total_score,
          max_score: submission.max_score,
          percentage: submission.percentage,
          test: submission.test
        }));
      } catch (submissionError) {
        console.warn('Could not fetch test submissions:', submissionError.message);
        // Continue without test submissions
      }

      return res.status(200).json({
        success: true,
        data: profileData
      });
    } catch (err) {
      console.error('Profile error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch profile', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
  },

  async getAllStudents(req, res) {
    try {
      const students = await Student.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: students,
        count: students.length
      });
    } catch (err) {
      console.error('Get all students error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch students', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
  },

  // Get students who have completed tests
  async getStudentsWithCompletedTests(req, res) {
    try {
      const { test_id, program_id, status } = req.query;
      
      let whereClause = {};
      let testIncludeWhere = {};

      // Filter by specific test
      if (test_id) {
        whereClause.test_id = test_id;
      }

      // Filter by program (through test relationship)
      if (program_id) {
        testIncludeWhere.program_id = program_id;
      }

      // Filter by submission status
      if (status && ['submitted', 'under_review', 'result_released'].includes(status)) {
        whereClause.status = status;
      } else {
        // Default: show all completed tests (submitted and result_released)
        whereClause.status = {
          [Op.in]: ['submitted', 'under_review', 'result_released']
        };
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

      // Group by student to avoid duplicates
      const studentMap = new Map();
      
      submissions.forEach(submission => {
        const studentId = submission.student.id;
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student: submission.student,
            completed_tests: []
          });
        }
        
        studentMap.get(studentId).completed_tests.push({
          test_id: submission.test.id,
          test_title: submission.test.title,
          program_name: submission.test.program?.name,
          submission_id: submission.id,
          status: submission.status,
          submitted_at: submission.submitted_at,
          total_score: submission.total_score,
          max_score: submission.max_score,
          percentage: submission.percentage,
          time_taken: submission.time_taken
        });
      });

      const studentsWithCompletedTests = Array.from(studentMap.values());

      return res.status(200).json({
        success: true,
        count: studentsWithCompletedTests.length,
        data: studentsWithCompletedTests
      });
    } catch (error) {
      console.error('Error fetching students with completed tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch students with completed tests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get student's test completion summary
  async getStudentTestSummary(req, res) {
    try {
      const { studentId } = req.params;

      const submissions = await TestSubmission.findAll({
        where: { 
          student_id: studentId,
          status: {
            [Op.in]: ['submitted', 'under_review', 'result_released']
          }
        },
        include: [
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'description', 'total_marks'],
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

      const summary = {
        total_completed_tests: submissions.length,
        tests_by_status: {
          submitted: submissions.filter(s => s.status === 'submitted').length,
          under_review: submissions.filter(s => s.status === 'under_review').length,
          result_released: submissions.filter(s => s.status === 'result_released').length
        },
        average_score: 0,
        average_percentage: 0,
        completed_tests: submissions.map(submission => ({
          test_id: submission.test.id,
          test_title: submission.test.title,
          program_name: submission.test.program?.name,
          submission_id: submission.id,
          status: submission.status,
          submitted_at: submission.submitted_at,
          total_score: submission.total_score,
          max_score: submission.max_score,
          percentage: submission.percentage,
          time_taken: submission.time_taken
        }))
      };

      // Calculate averages for released results
      const releasedResults = submissions.filter(s => s.status === 'result_released');
      if (releasedResults.length > 0) {
        summary.average_score = releasedResults.reduce((sum, s) => sum + (s.total_score || 0), 0) / releasedResults.length;
        summary.average_percentage = releasedResults.reduce((sum, s) => sum + (s.percentage || 0), 0) / releasedResults.length;
      }

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching student test summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student test summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
 


module.exports = studentController;
