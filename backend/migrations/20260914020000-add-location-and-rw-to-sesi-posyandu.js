"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("sesi_posyandu", "lokasi", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "",
    });
    await queryInterface.addColumn("sesi_posyandu", "rw", {
      type: Sequelize.STRING(5),
      allowNull: false,
      defaultValue: "",
    });
    await queryInterface.changeColumn("sesi_posyandu", "lokasi", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
    await queryInterface.changeColumn("sesi_posyandu", "rw", {
      type: Sequelize.STRING(5),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("sesi_posyandu", "rw");
    await queryInterface.removeColumn("sesi_posyandu", "lokasi");
  },
};
