"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("imunisasi", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      warga_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "warga",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      jenis_imunisasi: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tanggal_imunisasi: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("imunisasi", ["warga_id", "tanggal_imunisasi"], {
      name: "idx_imunisasi_warga_tanggal",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("imunisasi");
  },
};
