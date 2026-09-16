"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rujukan", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      warga_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "warga", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      pemeriksaan_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: { model: "pemeriksaan", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      puskesmas_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "puskesmas", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      kader_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      tanggal_rujukan: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      alasan_rujukan: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addIndex("rujukan", ["warga_id"], { name: "idx_rujukan_warga_id" });
    await queryInterface.addIndex("rujukan", ["puskesmas_id", "tanggal_rujukan"], { name: "idx_rujukan_puskesmas_tanggal" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("rujukan");
  },
};
