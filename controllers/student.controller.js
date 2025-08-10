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
      const student = await Student.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }

      return res.status(200).json({
        success: true,
        data: student
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
