"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(20),
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nama_lengkap: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      telepon: {
        type: DataTypes.STRING(20),
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "pending_approval",
      },
      puskesmas_id: {
        type: DataTypes.INTEGER,
      },
      posyandu_id: {
        type: DataTypes.INTEGER,
      },
      verified_by: {
        type: DataTypes.INTEGER,
      },
      verified_at: {
        type: DataTypes.DATE,
      },
      nik: {
        type: DataTypes.STRING(16),
      },
      profile_picture: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      token_version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      tableName: "users",
      timestamps: false,
    },
  );

  User.associate = function (models) {
    User.belongsTo(models.Puskesmas, {
      foreignKey: "puskesmas_id",
      as: "puskesmas",
    });
    User.belongsTo(models.Posyandu, {
      foreignKey: "posyandu_id",
      as: "posyandu",
    });
    User.belongsTo(models.User, {
      foreignKey: "verified_by",
      as: "verifiedByUser",
    });
    User.hasMany(models.User, {
      foreignKey: "verified_by",
      as: "verifiedUsers",
    });
    User.hasMany(models.Rujukan, {
      foreignKey: "kader_id",
      as: "rujukan",
    });
    User.hasMany(models.AuditLog, {
      foreignKey: "user_id",
      as: "auditLogs",
    });
  };

  return User;
};
