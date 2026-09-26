"use strict";

module.exports = (sequelize, DataTypes) => {
  const ProfilKesehatanWarga = sequelize.define(
    "ProfilKesehatanWarga",
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
        unique: true,
      },
      riwayat_keluarga: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      riwayat_diri: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      perilaku_berisiko: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "profil_kesehatan_warga",
      timestamps: false,
    },
  );

  ProfilKesehatanWarga.associate = function (models) {
    ProfilKesehatanWarga.belongsTo(models.Warga, {
      foreignKey: "warga_id",
      as: "warga",
    });
  };

  return ProfilKesehatanWarga;
};
