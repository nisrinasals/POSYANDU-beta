"use strict";

module.exports = (sequelize, DataTypes) => {
  const Kelurahan = sequelize.define(
    "Kelurahan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      kecamatan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nama_kelurahan: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "kelurahan",
      timestamps: false,
    },
  );

  Kelurahan.associate = function (models) {
    Kelurahan.belongsTo(models.Kecamatan, {
      foreignKey: "kecamatan_id",
      as: "kecamatan",
    });
    Kelurahan.hasMany(models.Puskesmas, {
      foreignKey: "kelurahan_id",
      as: "puskesmas",
    });
    Kelurahan.hasMany(models.Posyandu, {
      foreignKey: "kelurahan_id",
      as: "posyandu",
    });
  };

  return Kelurahan;
};
