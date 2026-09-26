"use strict";

module.exports = (sequelize, DataTypes) => {
  const SesiPosyandu = sequelize.define(
    "SesiPosyandu",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      posyandu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal_pelaksanaan: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      lokasi: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rw: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "open",
        validate: {
          isIn: [["open", "closed"]],
        },
      },
    },
    {
      tableName: "sesi_posyandu",
      timestamps: false,
    },
  );

  SesiPosyandu.associate = function (models) {
    SesiPosyandu.belongsTo(models.Posyandu, {
      foreignKey: "posyandu_id",
      as: "posyandu",
    });
    SesiPosyandu.hasMany(models.KunjunganPosyandu, {
      foreignKey: "sesi_posyandu_id",
      as: "kunjunganPosyandu",
    });
  };

  return SesiPosyandu;
};
