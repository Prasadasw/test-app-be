'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'mobile'
    });

    // Update existing users with a default password (they'll need to reset it)
    await queryInterface.sequelize.query(
      "UPDATE students SET password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE password IS NULL"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'password');
  }
};
