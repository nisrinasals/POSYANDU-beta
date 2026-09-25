"use strict";

module.exports = (sequelize, DataTypes) => {
  const ScreeningConfig = sequelize.define(
    "ScreeningConfig",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },

      value: {
        type: DataTypes.JSONB,
        allowNull: false,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "screening_config",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return ScreeningConfig;
};
