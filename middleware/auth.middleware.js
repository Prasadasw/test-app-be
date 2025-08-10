const jwt = require('jsonwebtoken');
const { Student } = require('../models');

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
      
      // Add user from payload
      const user = await Student.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
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

module.exports = authMiddleware;
