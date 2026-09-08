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
      kelurahan_id: {
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
    Puskesmas.belongsTo(models.Kelurahan, {
      foreignKey: "kelurahan_id",
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
  };

  return Puskesmas;
};
