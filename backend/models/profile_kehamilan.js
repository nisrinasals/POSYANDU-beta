"use strict";

module.exports = (sequelize, DataTypes) => {
  const ProfileKehamilan = sequelize.define(
    "ProfileKehamilan",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      warga_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      nama_suami: {
        type: DataTypes.STRING(100),
      },
      hpht: {
        type: DataTypes.DATEONLY,
      },
      hpl: {
        type: DataTypes.DATEONLY,
      },
      anak_ke: {
        type: DataTypes.INTEGER,
      },
      jarak_anak_sebelum_bulan: {
        type: DataTypes.INTEGER,
      },
      bb_sebelum_hamil_kg: {
        type: DataTypes.DECIMAL(5, 2),
        validate: {
          min: 0.01,
        },
      },
      tb_sebelum_hamil_cm: {
        type: DataTypes.DECIMAL(5, 2),
        validate: {
          min: 0.01,
        },
      },
      tanggal_persalinan: {
        type: DataTypes.DATEONLY,
      },
      cara_persalinan: {
        type: DataTypes.STRING(30),
      },
      status_kehamilan: {
        type: DataTypes.STRING(20),
        validate: {
          isIn: [["hamil", "nifas", "menyusui", "selesai"]],
        },
      },
      is_menyusui: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "profile_kehamilan",
      timestamps: false,
    },
  );

  ProfileKehamilan.associate = function (models) {
    ProfileKehamilan.belongsTo(models.Warga, {
      foreignKey: "warga_id",
      as: "warga",
    });
    ProfileKehamilan.hasMany(models.Pemeriksaan, {
      foreignKey: "profile_kehamilan_id",
      as: "pemeriksaan",
    });
  };

  return ProfileKehamilan;
};
