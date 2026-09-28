"use strict";

module.exports = (sequelize, DataTypes) => {
  const Pemeriksaan = sequelize.define(
    "Pemeriksaan",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      kunjungan_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      profile_kehamilan_id: {
        type: DataTypes.BIGINT,
      },
      tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_DATE"),
      },
      usia_bulan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kategori_sasaran: {
        type: DataTypes.STRING(20),
      },
      bb_kg: {
        type: DataTypes.DECIMAL(5, 2),
      },
      tb_cm: {
        type: DataTypes.DECIMAL(5, 2),
      },
      lingkar_kepala_cm: {
        type: DataTypes.DECIMAL(4, 2),
      },
      lila_cm: {
        type: DataTypes.DECIMAL(4, 2),
      },
      lingkar_perut_cm: {
        type: DataTypes.DECIMAL(5, 2),
      },
      td_sistole: {
        type: DataTypes.INTEGER,
      },
      td_diastole: {
        type: DataTypes.INTEGER,
      },
      kadar_gula: {
        type: DataTypes.INTEGER,
      },
      zscore_bbu: { type: DataTypes.DECIMAL(8, 4) },
      zscore_pbu: { type: DataTypes.DECIMAL(8, 4) },
      zscore_tbu: { type: DataTypes.DECIMAL(8, 4) },
      zscore_bbpb: { type: DataTypes.DECIMAL(8, 4) },
      zscore_bbtb: { type: DataTypes.DECIMAL(8, 4) },
      zscore_imtu: { type: DataTypes.DECIMAL(8, 4) },
      detail_skrining: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      screening_history: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      step2_completed_at: { type: DataTypes.DATE, allowNull: true },
      step4_completed_at: { type: DataTypes.DATE, allowNull: true },
      step5_completed_at: { type: DataTypes.DATE, allowNull: true },
      topik_penyuluhan: {
        type: DataTypes.TEXT,
      },
      is_perlu_rujukan: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "pemeriksaan",
      timestamps: false,
    },
  );

  Pemeriksaan.associate = function (models) {
    Pemeriksaan.belongsTo(models.KunjunganPosyandu, {
      foreignKey: "kunjungan_id",
      as: "kunjungan",
    });
    Pemeriksaan.belongsTo(models.ProfileKehamilan, {
      foreignKey: "profile_kehamilan_id",
      as: "profileKehamilan",
    });
    Pemeriksaan.hasOne(models.Rujukan, {
      foreignKey: "pemeriksaan_id",
      as: "rujukan",
    });
  };

  return Pemeriksaan;
};
