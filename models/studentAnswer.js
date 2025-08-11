'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StudentAnswer extends Model {
    static associate(models) {
      StudentAnswer.belongsTo(models.TestSubmission, {
        foreignKey: 'submission_id',
        as: 'submission'
      });
      StudentAnswer.belongsTo(models.Question, {
        foreignKey: 'question_id',
        as: 'question'
      });
    }
  }

  StudentAnswer.init({
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_submissions',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    selected_option: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Student selected option (a, b, c, d)'
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Whether the answer is correct (null until reviewed)'
    },
    marks_obtained: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Marks given for this answer'
    },
    max_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Maximum marks for this question'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Admin notes for this specific answer'
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
    }
  }, {
    sequelize,
    modelName: 'StudentAnswer',
    tableName: 'student_answers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['submission_id', 'question_id'],
        name: 'unique_submission_question_answer'
      },
      {
        fields: ['submission_id'],
        name: 'submission_answers_index'
      }
    ]
  });

  return StudentAnswer;
};
