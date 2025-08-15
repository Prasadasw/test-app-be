'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enquiries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      mobile_number: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      email_address: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      program_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'contacted', 'enrolled', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      source: {
        type: Sequelize.STRING(50),
        defaultValue: 'mobile_app'
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contacted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      contacted_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes with unique names to avoid conflicts
    await queryInterface.addIndex('enquiries', ['mobile_number'], {
      name: 'enquiries_mobile_number_idx'
    });
    await queryInterface.addIndex('enquiries', ['email_address'], {
      name: 'enquiries_email_address_idx'
    });
    await queryInterface.addIndex('enquiries', ['status'], {
      name: 'enquiries_status_idx'
    });
    await queryInterface.addIndex('enquiries', ['program_name'], {
      name: 'enquiries_program_name_idx'
    });
    await queryInterface.addIndex('enquiries', ['created_at'], {
      name: 'enquiries_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('enquiries', 'enquiries_mobile_number_idx');
    await queryInterface.removeIndex('enquiries', 'enquiries_email_address_idx');
    await queryInterface.removeIndex('enquiries', 'enquiries_status_idx');
    await queryInterface.removeIndex('enquiries', 'enquiries_program_name_idx');
    await queryInterface.removeIndex('enquiries', 'enquiries_created_at_idx');
    
    // Then drop the table
    await queryInterface.dropTable('enquiries');
  }
};
