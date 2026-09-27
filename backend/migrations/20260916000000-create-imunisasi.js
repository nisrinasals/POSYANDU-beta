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
      is_diberikan: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tanggal_imunisasi: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      tempat: {
        type: Sequelize.ENUM("puskesmas", "klinik", "rs"),
        allowNull: true,
      },
      no_batch: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("imunisasi", ["warga_id", "jenis_imunisasi"], {
      unique: true,
      name: "uq_imunisasi_warga_jenis",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("imunisasi");
  },
};
