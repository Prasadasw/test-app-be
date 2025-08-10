const db = require('../models');
const { TestEnrollment, Test, Student, Admin, Program } = db;
const { Op } = require('sequelize');

const enrollmentController = {
  // Student requests enrollment to a test
  async requestEnrollment(req, res) {
    try {
      console.log('🎯 Enrollment request started');
      console.log('📝 Request body:', req.body);
      console.log('👤 User from auth:', req.user?.dataValues || req.user);
      
      const { test_id, request_message, student_id: body_student_id } = req.body;
      const student_id = req.user?.id || body_student_id; // From auth middleware or body for testing
      
      console.log('📊 Extracted data:', { test_id, request_message, student_id });

      if (!student_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      // Check if test exists
      const test = await Test.findByPk(test_id, {
        include: [{ model: Program, as: 'program', attributes: ['name'] }]
      });
      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
        });
      }

      // Check if student already has an enrollment request for this test
      console.log('🔍 Checking for existing enrollment...');
      const existingEnrollment = await TestEnrollment.findOne({
        where: { student_id, test_id }
      });
      console.log('📋 Existing enrollment:', existingEnrollment);

      if (existingEnrollment) {
        let message = '';
        switch (existingEnrollment.status) {
          case 'pending':
            message = 'You already have a pending enrollment request for this test';
            break;
          case 'approved':
            message = 'You are already enrolled in this test';
            break;
          case 'rejected':
            message = 'Your previous enrollment request was rejected. Please contact admin for more information';
            break;
        }
        return res.status(400).json({
          success: false,
          message,
          enrollment_status: existingEnrollment.status
        });
      }

      // Create new enrollment request
      console.log('✨ Creating new enrollment...');
      console.log('📝 Enrollment data:', {
        student_id,
        test_id,
        request_message: request_message || null,
        status: 'pending'
      });
      
      const enrollment = await TestEnrollment.create({
        student_id,
        test_id,
        request_message: request_message || null,
        status: 'pending'
      });
      
      console.log('✅ Enrollment created:', enrollment);

      return res.status(201).json({
        success: true,
        message: 'Enrollment request submitted successfully. Please wait for admin approval.',
        data: {
          enrollment_id: enrollment.id,
          test_title: test.title,
          program_name: test.program?.name,
          status: enrollment.status,
          requested_at: enrollment.createdAt
        }
      });
    } catch (error) {
      console.error('Error requesting enrollment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit enrollment request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get student's enrollment requests
  async getStudentEnrollments(req, res) {
    try {
      const student_id = req.user.id;

      const enrollments = await TestEnrollment.findAll({
        where: { student_id },
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
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments
      });
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollment requests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Get all enrollment requests (with filters)
  async getAllEnrollmentRequests(req, res) {
    try {
      const { status, test_id, program_id } = req.query;
      
      let whereClause = {};
      let testIncludeWhere = {};

      // Filter by status
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        whereClause.status = status;
      }

      // Filter by specific test
      if (test_id) {
        whereClause.test_id = test_id;
      }

      // Filter by program (through test relationship)
      if (program_id) {
        testIncludeWhere.program_id = program_id;
      }

      const enrollments = await TestEnrollment.findAll({
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
          },
          {
            model: Admin,
            as: 'approver',
            attributes: ['id', 'fullName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments
      });
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollment requests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Admin: Approve/Reject enrollment request
  async updateEnrollmentStatus(req, res) {
    try {
      const { enrollmentId } = req.params;
      const { status, admin_notes, expires_at } = req.body;
      const admin_id = req.user.id; // From auth middleware

      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "approved" or "rejected"'
        });
      }

      // Find enrollment request
      const enrollment = await TestEnrollment.findByPk(enrollmentId, {
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['first_name', 'last_name', 'mobile']
          },
          {
            model: Test,
            as: 'test',
            attributes: ['title']
          }
        ]
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment request not found'
        });
      }

      if (enrollment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Enrollment request is already ${enrollment.status}`
        });
      }

      // Update enrollment status
      const updateData = {
        status,
        admin_notes: admin_notes || null,
        approved_by: admin_id,
        approved_at: new Date()
      };

      // Add expiration date if provided and status is approved
      if (status === 'approved' && expires_at) {
        updateData.expires_at = new Date(expires_at);
      }

      await enrollment.update(updateData);

      return res.status(200).json({
        success: true,
        message: `Enrollment request ${status} successfully`,
        data: {
          enrollment_id: enrollment.id,
          student_name: `${enrollment.student.first_name} ${enrollment.student.last_name}`,
          test_title: enrollment.test.title,
          status: status,
          admin_notes: admin_notes,
          approved_at: updateData.approved_at,
          expires_at: updateData.expires_at
        }
      });
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update enrollment status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Check if student has access to a specific test
  async checkTestAccess(req, res) {
    try {
      const { testId } = req.params;
      const student_id = req.user.id;

      const enrollment = await TestEnrollment.findOne({
        where: { 
          student_id, 
          test_id: testId,
          status: 'approved'
        },
        include: [
          {
            model: Test,
            as: 'test',
            attributes: ['id', 'title', 'duration', 'total_marks']
          }
        ]
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this test. Please request enrollment first.',
          has_access: false
        });
      }

      // Check if enrollment has expired
      if (enrollment.expires_at && new Date() > enrollment.expires_at) {
        return res.status(403).json({
          success: false,
          message: 'Your access to this test has expired',
          has_access: false,
          expired_at: enrollment.expires_at
        });
      }

      return res.status(200).json({
        success: true,
        message: 'You have access to this test',
        has_access: true,
        data: {
          test: enrollment.test,
          enrollment_id: enrollment.id,
          approved_at: enrollment.approved_at,
          expires_at: enrollment.expires_at
        }
      });
    } catch (error) {
      console.error('Error checking test access:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check test access',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = enrollmentController;
