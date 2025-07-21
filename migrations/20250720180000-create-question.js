'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      question_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      option_a: {
        type: Sequelize.STRING,
        allowNull: false
      },
      option_b: {
        type: Sequelize.STRING,
        allowNull: false
      },
      option_c: {
        type: Sequelize.STRING,
        allowNull: false
      },
      option_d: {
        type: Sequelize.STRING,
        allowNull: false
      },
      option_a_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      option_b_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      option_c_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      option_d_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      correct_option: {
        type: Sequelize.ENUM('a', 'b', 'c', 'd'),
        allowNull: false
      },
      marks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questions');
  }
};
