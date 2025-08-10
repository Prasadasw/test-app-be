'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_enrollments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      request_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Student can provide reason for enrollment request'
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin notes for approval/rejection'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Optional: When the enrollment access expires'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint for student-test combination
    await queryInterface.addIndex('test_enrollments', {
      fields: ['student_id', 'test_id'],
      unique: true,
      name: 'unique_student_test_enrollment'
    });

    // Add index for status filtering
    await queryInterface.addIndex('test_enrollments', {
      fields: ['status'],
      name: 'enrollment_status_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('test_enrollments');
  }
};
