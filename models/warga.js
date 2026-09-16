"use strict";

module.exports = (sequelize, DataTypes) => {
  const Warga = sequelize.define(
    "Warga",
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
      nik: {
        type: DataTypes.STRING(16),
        unique: true,
      },
      nama_lengkap: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      jenis_kelamin: {
        type: DataTypes.CHAR(1),
      },
      tanggal_lahir: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      alamat: {
        type: DataTypes.TEXT,
      },
      rt: {
        type: DataTypes.STRING(5),
      },
      rw: {
        type: DataTypes.STRING(5),
      },
      telepon: {
        type: DataTypes.STRING(20),
      },
      nama_ibu: {
        type: DataTypes.STRING(100),
      },
      nama_ayah: {
        type: DataTypes.STRING(100),
      },
      status_perkawinan: {
        type: DataTypes.STRING(20),
      },
      pekerjaan: {
        type: DataTypes.STRING(50),
      },
      pekerjaan_lainnya: {
        type: DataTypes.STRING(100),
      },
      bb_lahir_kg: {
        type: DataTypes.DECIMAL(4, 2),
      },
      tb_lahir_cm: {
        type: DataTypes.DECIMAL(4, 2),
      },
      status_domisili: {
        type: DataTypes.STRING(20),
        defaultValue: "aktif",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "warga",
      timestamps: false,
    },
  );

  Warga.associate = function (models) {
    Warga.belongsTo(models.Posyandu, {
      foreignKey: "posyandu_id",
      as: "posyandu",
    });
    Warga.hasMany(models.ProfileKehamilan, {
      foreignKey: "warga_id",
      as: "profileKehamilan",
    });
    Warga.hasMany(models.KunjunganPosyandu, {
      foreignKey: "warga_id",
      as: "kunjunganPosyandu",
    });
    Warga.hasMany(models.Imunisasi, {
      foreignKey: "warga_id",
      as: "imunisasi",
    });
    Warga.hasMany(models.Rujukan, {
      foreignKey: "warga_id",
      as: "rujukan",
    });
  };

  return Warga;
};
