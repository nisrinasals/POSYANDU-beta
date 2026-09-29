"use strict";

module.exports = (sequelize, DataTypes) => {
  const Imunisasi = sequelize.define(
    "Imunisasi",
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
      jenis_imunisasi: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      is_diberikan: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tanggal_imunisasi: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tempat: {
        type: DataTypes.ENUM("puskesmas", "klinik", "rs"),
        allowNull: true,
      },
      no_batch: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "imunisasi",
      timestamps: false,

      indexes: [{ unique: true, fields: ["warga_id", "jenis_imunisasi"], name: "uq_imunisasi_warga_jenis" }],


    },
  );

  Imunisasi.associate = function (models) {
    Imunisasi.belongsTo(models.Warga, {
      foreignKey: "warga_id",
      as: "warga",
    });
  };

  return Imunisasi;
};
