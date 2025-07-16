const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const db = require('../models');
const Admin = db.Admin;

// Register a new admin
const registerAdmin = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullName, mobileNumber, role, password } = req.body;
    
    // Check if admin with mobile number already exists
    const existingAdmin = await Admin.findOne({ where: { mobileNumber } });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin with this mobile number already exists' 
      });
    }

    // Create new admin
    const admin = await Admin.create({
      fullName,
      mobileNumber,
      role: role || 'admin',
      password
    });

    // Remove password from response
    const adminData = admin.get({ plain: true });
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: adminData
    });
  } catch (error) {
    console.error('Error in admin registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering admin',
      error: error.message
    });
  }
};

// Get all admins (for admin management)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    // Find admin by mobile number
    const admin = await Admin.findOne({ where: { mobileNumber } });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    // Check password
    const isMatch = await admin.validPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const adminData = admin.get({ plain: true });
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: adminData
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

module.exports = {
  registerAdmin,
  getAllAdmins,
  loginAdmin
};
