'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.Test, {
        foreignKey: 'test_id',
        as: 'test'
      });
    }
  }

  Question.init({
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    option_a: DataTypes.STRING,
    option_b: DataTypes.STRING,
    option_c: DataTypes.STRING,
    option_d: DataTypes.STRING,
    option_a_image: DataTypes.STRING,
    option_b_image: DataTypes.STRING,
    option_c_image: DataTypes.STRING,
    option_d_image: DataTypes.STRING,
    correct_option: {
      type: DataTypes.STRING,
      allowNull: false
    },
    marks: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: true,
    underscored: true
  });

  return Question;
};
