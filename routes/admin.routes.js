const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const { registerAdmin, getAllAdmins, loginAdmin } = require('../controllers/admin.controller');
const { registerAdminRules, loginAdminRules } = require('../middleware/validators/admin.validator');

router.post('/register', [
  ...registerAdminRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: extractedErrors
      });
    }
    next();
  },
  registerAdmin
]);

router.get('/', getAllAdmins);

router.post('/login', [
  ...loginAdminRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: extractedErrors
      });
    }
    next();
  },
  loginAdmin
]);

module.exports = router;
