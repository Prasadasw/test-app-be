'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      // define association here if needed
    }

    // Method to check if the password is valid
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  Student.init({
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^[0-9]{10,15}$/ // Basic phone number validation
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100] // Minimum 6 characters
      }
    },
    alternate_mobile: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[0-9]{10,15}$/ // Basic phone number validation
      }
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true // Set to true since we're not using OTP anymore
    }
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (student) => {
        if (student.password) {
          const salt = await bcrypt.genSalt(10);
          student.password = await bcrypt.hash(student.password, salt);
        }
      },
      beforeUpdate: async (student) => {
        if (student.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          student.password = await bcrypt.hash(student.password, salt);
        }
      }
    }
  });

  return Student;
};
