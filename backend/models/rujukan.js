"use strict";

module.exports = (sequelize, DataTypes) => {
  const Rujukan = sequelize.define(
    "Rujukan",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      warga_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      pemeriksaan_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      puskesmas_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kader_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal_rujukan: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      alasan_rujukan: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status_kehadiran_rujukan: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: { isIn: [["hadir", "tidak_hadir"]] },
      },
    },
    {
      tableName: "rujukan",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  Rujukan.associate = function (models) {
    Rujukan.belongsTo(models.Warga, { foreignKey: "warga_id", as: "warga" });
    Rujukan.belongsTo(models.Pemeriksaan, { foreignKey: "pemeriksaan_id", as: "pemeriksaan" });
    Rujukan.belongsTo(models.Puskesmas, { foreignKey: "puskesmas_id", as: "puskesmas" });
    Rujukan.belongsTo(models.User, { foreignKey: "kader_id", as: "kader" });
  };

  return Rujukan;
};
