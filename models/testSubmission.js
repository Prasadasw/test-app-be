'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TestSubmission extends Model {
    static associate(models) {
      TestSubmission.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student'
      });
      TestSubmission.belongsTo(models.Test, {
        foreignKey: 'test_id',
        as: 'test'
      });
      TestSubmission.belongsTo(models.TestEnrollment, {
        foreignKey: 'enrollment_id',
        as: 'enrollment'
      });
      TestSubmission.hasMany(models.StudentAnswer, {
        foreignKey: 'submission_id',
        as: 'answers'
      });
    }
  }

  TestSubmission.init({
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
    enrollment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_enrollments',
        key: 'id'
      }
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    time_taken: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'submitted', 'under_review', 'result_released'),
      defaultValue: 'in_progress',
      allowNull: false
    },
    total_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    max_score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id'
      }
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    result_released_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TestSubmission',
    tableName: 'test_submissions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'test_id'],
        name: 'unique_student_test_submission'
      },
      {
        fields: ['status'],
        name: 'submission_status_index'
      },
      {
        fields: ['enrollment_id'],
        name: 'enrollment_submission_index'
      }
    ]
  });

  return TestSubmission;
};
