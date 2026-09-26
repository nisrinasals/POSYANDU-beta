"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("profil_kesehatan_warga", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      warga_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          model: "warga",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      riwayat_keluarga: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      riwayat_diri: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      perilaku_berisiko: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
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

    await queryInterface.addIndex("profil_kesehatan_warga", ["warga_id"], {
      name: "idx_profil_kesehatan_warga_warga_id",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("profil_kesehatan_warga");
  },
};
