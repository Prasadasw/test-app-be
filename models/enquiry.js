const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Enquiry = sequelize.define('Enquiry', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    mobile_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 15]
      }
    },
    email_address: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    program_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Which program the enquiry is for (NDA Academy, Scholarship Program, etc.)'
    },
    status: {
      type: DataTypes.ENUM('pending', 'contacted', 'enrolled', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    source: {
      type: DataTypes.STRING(50),
      defaultValue: 'mobile_app',
      comment: 'Source of enquiry (mobile_app, website, phone, etc.)'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Admin notes for internal use'
    },
    contacted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    contacted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin ID who contacted the enquiry'
    }
  }, {
    tableName: 'enquiries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'enquiries_mobile_number_idx',
        fields: ['mobile_number']
      },
      {
        name: 'enquiries_email_address_idx',
        fields: ['email_address']
      },
      {
        name: 'enquiries_status_idx',
        fields: ['status']
      },
      {
        name: 'enquiries_program_name_idx',
        fields: ['program_name']
      },
      {
        name: 'enquiries_created_at_idx',
        fields: ['created_at']
      }
    ]
  });

  return Enquiry;
};
