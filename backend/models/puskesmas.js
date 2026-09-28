"use strict";

module.exports = (sequelize, DataTypes) => {
  const Puskesmas = sequelize.define(
    "Puskesmas",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      kode_puskesmas: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      nama_puskesmas: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      kecamatan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      alamat: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "puskesmas",
      timestamps: false,
    },
  );

  Puskesmas.associate = function (models) {
    Puskesmas.belongsTo(models.Kecamatan, {
      foreignKey: "kecamatan_id",
      as: "kecamatan",
    });
    Puskesmas.hasMany(models.Kelurahan, {
      foreignKey: "puskesmas_id",
      as: "kelurahan",
    });
    Puskesmas.hasMany(models.Posyandu, {
      foreignKey: "puskesmas_id",
      as: "posyandu",
    });
    Puskesmas.hasMany(models.User, {
      foreignKey: "puskesmas_id",
      as: "users",
    });
    Puskesmas.hasMany(models.Rujukan, {
      foreignKey: "puskesmas_id",
      as: "rujukan",
    });
  };

  return Puskesmas;
};
