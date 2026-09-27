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
      tanggal_imunisasi: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "imunisasi",
      timestamps: false,
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
