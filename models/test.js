'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Test extends Model {
    static associate(models) {
      Test.belongsTo(models.Program, {
        foreignKey: 'program_id',
        as: 'program'
      });
      Test.hasMany(models.TestEnrollment, {
        foreignKey: 'test_id',
        as: 'enrollments'
      });
    }
  }

  Test.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Test',
    tableName: 'tests',
    timestamps: true,
    underscored: true
  });

  return Test;
};
