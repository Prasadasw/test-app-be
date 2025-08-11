'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TestEnrollment extends Model {
    static associate(models) {
      TestEnrollment.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student'
      });
      TestEnrollment.belongsTo(models.Test, {
        foreignKey: 'test_id',
        as: 'test'
      });
      TestEnrollment.belongsTo(models.Admin, {
        foreignKey: 'approved_by',
        as: 'approver'
      });
      TestEnrollment.hasOne(models.TestSubmission, {
        foreignKey: 'enrollment_id',
        as: 'submission'
      });
    }
  }

  TestEnrollment.init({
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tests',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    request_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Student can provide reason for enrollment request'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Admin notes for approval/rejection'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Optional: When the enrollment access expires'
    }
  }, {
    sequelize,
    modelName: 'TestEnrollment',
    tableName: 'test_enrollments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'test_id'],
        name: 'unique_student_test_enrollment'
      },
      {
        fields: ['status'],
        name: 'enrollment_status_index'
      }
    ]
  });

  return TestEnrollment;
};
