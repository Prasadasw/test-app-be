const jwt = require('jsonwebtoken');
const { Student, Admin } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Received token:', token.substring(0, 50) + '...');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 JWT Decoded payload:', decoded);
      
      // Try to find user in Student table first
      let user = await Student.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      // If not found in Student, try Admin table
      if (!user) {
        user = await Admin.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
      }
      
      console.log('👤 Found user in DB:', user?.dataValues || 'No user found');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid'
        });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Specific middleware for student authentication
const authenticateStudent = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Student auth - Received token:', token.substring(0, 50) + '...');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 Student auth - JWT Decoded payload:', decoded);
      
      // Try to find student by ID
      const student = await Student.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      console.log('👤 Student auth - Found student in DB:', student?.dataValues || 'No student found');

      if (!student) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid for student'
        });
      }

      // Check if user is a student by checking student-specific fields
      if (student.first_name !== undefined || student.mobile !== undefined) {
        req.user = student;
        console.log('✅ Student authentication successful for:', student.first_name);
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Student authentication required.'
        });
      }
    } catch (err) {
      console.error('Student token verification error:', err);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    console.error('Student authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Specific middleware for admin authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Admin auth - Received token:', token.substring(0, 50) + '...');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 Admin auth - JWT Decoded payload:', decoded);
      
      // Try to find admin by ID
      const admin = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      console.log('👤 Admin auth - Found admin in DB:', admin?.dataValues || 'No admin found');

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid for admin'
        });
      }

      // Check if user is an admin by checking admin-specific fields
      if (admin.fullName !== undefined || admin.role !== undefined) {
        req.user = admin;
        console.log('✅ Admin authentication successful for:', admin.fullName);
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin authentication required.'
        });
      }
    } catch (err) {
      console.error('Admin token verification error:', err);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = {
  authMiddleware,
  authenticateStudent,
  authenticateAdmin
};
