"use strict";

module.exports = (sequelize, DataTypes) => {
  const Posyandu = sequelize.define(
    "Posyandu",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      puskesmas_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kelurahan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nama_posyandu: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alamat: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "posyandu",
      timestamps: false,
    },
  );

  Posyandu.associate = function (models) {
    Posyandu.belongsTo(models.Puskesmas, {
      foreignKey: "puskesmas_id",
      as: "puskesmas",
    });
    Posyandu.belongsTo(models.Kelurahan, {
      foreignKey: "kelurahan_id",
      as: "kelurahan",
    });
    Posyandu.hasMany(models.Warga, {
      foreignKey: "posyandu_id",
      as: "warga",
    });
    Posyandu.hasMany(models.User, {
      foreignKey: "posyandu_id",
      as: "users",
    });
    Posyandu.hasMany(models.SesiPosyandu, {
      foreignKey: "posyandu_id",
      as: "sesiPosyandu",
    });
  };

  return Posyandu;
};
