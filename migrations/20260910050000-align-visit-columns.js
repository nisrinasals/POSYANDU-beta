"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("kunjungan_posyandu", "nomor_antrean", {
      type: Sequelize.STRING(10),
      allowNull: false,
    });

    await queryInterface.addColumn("kunjungan_posyandu", "created_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("kunjungan_posyandu", "created_at");
    await queryInterface.changeColumn("kunjungan_posyandu", "nomor_antrean", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
