const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name'
    },
    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: 'mobile_number',
      validate: {
        is: /^[0-9]{10,15}$/
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'superadmin'),
      defaultValue: 'admin'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(value, salt);
        this.setDataValue('password', hash);
      }
    }
  }, {
    tableName: 'admins',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['mobile_number'],
        name: 'unique_mobile_number'
      }
    ]
  });

  // Method to compare password
  Admin.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  return Admin;
};
