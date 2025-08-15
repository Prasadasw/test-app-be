const { Enquiry } = require('../models');
const { Op } = require('sequelize');

class EnquiryController {
  // POST /api/enquiries - Create new enquiry
  async createEnquiry(req, res) {
    try {
      const { full_name, mobile_number, email_address, message, program_name } = req.body;

      if (!full_name || !mobile_number || !program_name) {
        return res.status(400).json({
          success: false,
          message: 'Full name, mobile number, and program name are required'
        });
      }

      const enquiry = await Enquiry.create({
        full_name: full_name.trim(),
        mobile_number: mobile_number.trim(),
        email_address: email_address ? email_address.trim() : null,
        message: message ? message.trim() : null,
        program_name: program_name.trim(),
        source: 'mobile_app'
      });

      res.status(201).json({
        success: true,
        message: 'Enquiry submitted successfully',
        data: enquiry
      });

    } catch (error) {
      console.error('Error creating enquiry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit enquiry'
      });
    }
  }

  // GET /api/enquiries - Get all enquiries (Admin only)
  async getAllEnquiries(req, res) {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const offset = (page - 1) * limit;
      
      let whereClause = {};
      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { mobile_number: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: enquiries } = await Enquiry.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: enquiries,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count
        }
      });

    } catch (error) {
      console.error('Error fetching enquiries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enquiries'
      });
    }
  }

  // DELETE /api/enquiries/:id - Delete enquiry (Admin only)
  async deleteEnquiry(req, res) {
    try {
      const { id } = req.params;
      const enquiry = await Enquiry.findByPk(id);

      if (!enquiry) {
        return res.status(404).json({
          success: false,
          message: 'Enquiry not found'
        });
      }

      await enquiry.destroy();
      res.json({
        success: true,
        message: 'Enquiry deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting enquiry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete enquiry'
      });
    }
  }
}

module.exports = new EnquiryController();
