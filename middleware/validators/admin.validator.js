const { body, validationResult } = require('express-validator');

// Validation rules for admin registration
const registerAdminRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[0-9]{10,15}$/).withMessage('Please enter a valid mobile number'),
    
  body('role')
    .optional()
    .isIn(['admin', 'superadmin']).withMessage('Invalid role'),
    
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
];

// Validation rules for admin login
const loginAdminRules = [
  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[0-9]{10,15}$/).withMessage('Please enter a valid mobile number'),
    
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
  
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: extractedErrors
  });
};

module.exports = {
  registerAdminRules,
  loginAdminRules,
  validate
};
