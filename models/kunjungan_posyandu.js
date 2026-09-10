"use strict";

module.exports = (sequelize, DataTypes) => {
  const KunjunganPosyandu = sequelize.define(
    "KunjunganPosyandu",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sesi_posyandu_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      warga_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      nomor_antrean: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      status_langkah: {
        type: DataTypes.STRING(20),
        defaultValue: "langkah_1",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "kunjungan_posyandu",
      timestamps: false,
    },
  );

  KunjunganPosyandu.associate = function (models) {
    KunjunganPosyandu.belongsTo(models.SesiPosyandu, {
      foreignKey: "sesi_posyandu_id",
      as: "sesiPosyandu",
    });
    KunjunganPosyandu.belongsTo(models.Warga, {
      foreignKey: "warga_id",
      as: "warga",
    });
    KunjunganPosyandu.hasOne(models.Pemeriksaan, {
      foreignKey: "kunjungan_id",
      as: "pemeriksaan",
    });
  };

  return KunjunganPosyandu;
};
