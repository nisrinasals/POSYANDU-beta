"use strict";

module.exports = (sequelize, DataTypes) => {
  const EmailOtp = sequelize.define(
    "EmailOtp",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      otp_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      purpose: {
        type: DataTypes.STRING(30),
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "email_otp",
      timestamps: false,
    },
  );

  return EmailOtp;
};
