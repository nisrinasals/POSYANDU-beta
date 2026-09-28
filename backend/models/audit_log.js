"use strict";

module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      table_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      record_id: {
        type: DataTypes.BIGINT,
      },
      old_value: {
        type: DataTypes.JSONB,
      },
      new_value: {
        type: DataTypes.JSONB,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "audit_log",
      timestamps: false,
    },
  );

  AuditLog.associate = function (models) {
    AuditLog.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return AuditLog;
};
