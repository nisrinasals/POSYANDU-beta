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
<<<<<<< HEAD
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
=======
      tanggal_imunisasi: {
        type: DataTypes.DATEONLY,
        allowNull: false,
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      },
    },
    {
      tableName: "imunisasi",
      timestamps: false,
<<<<<<< HEAD
      indexes: [{ unique: true, fields: ["warga_id", "jenis_imunisasi"], name: "uq_imunisasi_warga_jenis" }],
=======
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
