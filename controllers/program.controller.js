const { Program, sequelize } = require('../models');
const { Op } = require('sequelize');

const programController = {
  // Create a new program
  async createProgram(req, res) {
    try {
      const { name, description, status } = req.body;

      // Check if program with the same name already exists (case-insensitive)
      const existingProgram = await Program.findOne({
        where: {
          name: {
            [Op.like]: name
          }
        }
      });

      if (existingProgram) {
        return res.status(400).json({
          success: false,
          message: 'A program with this name already exists.'
        });
      }

      const program = await Program.create({
        name,
        description: description || null,
        status: status !== undefined ? status : true
      });

      return res.status(201).json({
        success: true,
        message: 'Program created successfully',
        data: program
      });
    } catch (error) {
      console.error('Error creating program:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create program',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all programs
  async getPrograms(req, res) {
    try {
      const programs = await Program.findAll({
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: programs.length,
        data: programs
      });
    } catch (error) {
      console.error('Error fetching programs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch programs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = programController;
