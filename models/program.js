'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Program extends Model {
    static associate(models) {
      Program.hasMany(models.Test, {
        foreignKey: 'program_id',
        as: 'tests'
      });
    }
  }
  
  Program.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Program',
    tableName: 'programs',
    timestamps: true,
    underscored: true
  });

  return Program;
};
