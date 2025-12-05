'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cek dulu apakah kolom sudah ada agar tidak error
    const tableInfo = await queryInterface.describeTable('Presensis');
    if (!tableInfo.buktiFoto) {
      await queryInterface.addColumn('Presensis', 'buktiFoto', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Presensis', 'buktiFoto');
  }
};