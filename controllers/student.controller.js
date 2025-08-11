const { Student } = require('../models');
const jwt = require('jsonwebtoken');

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
  }
};
 


module.exports = studentController;
