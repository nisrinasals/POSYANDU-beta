"use strict";

module.exports = (sequelize, DataTypes) => {
  const Kecamatan = sequelize.define(
    "Kecamatan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nama_kecamatan: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "kecamatan",
      timestamps: false,
    },
  );

  Kecamatan.associate = function (models) {
    Kecamatan.hasMany(models.Kelurahan, {
      foreignKey: "kecamatan_id",
      as: "kelurahan",
    });
  };

  return Kecamatan;
};
