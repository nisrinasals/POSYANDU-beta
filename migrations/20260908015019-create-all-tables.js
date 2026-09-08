"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. TABEL PUSKESMAS
    await queryInterface.createTable("puskesmas", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      kode_puskesmas: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      nama_puskesmas: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      kelurahan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "kelurahan",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      alamat: {
        type: Sequelize.TEXT,
      },
    });

    // 4. TABEL POSYANDU
    await queryInterface.createTable("posyandu", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      puskesmas_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "puskesmas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      kelurahan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "kelurahan",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nama_posyandu: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      alamat: {
        type: Sequelize.TEXT,
      },
    });

    // 3. TABEL WARGA
    await queryInterface.createTable("warga", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      posyandu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "posyandu",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nik: {
        type: Sequelize.STRING(16),
        unique: true,
      },
      nama_lengkap: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      jenis_kelamin: {
        type: Sequelize.CHAR(1),
      },
      tanggal_lahir: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      alamat: {
        type: Sequelize.TEXT,
      },
      rt: {
        type: Sequelize.STRING(5),
      },
      rw: {
        type: Sequelize.STRING(5),
      },
      telepon: {
        type: Sequelize.STRING(20),
      },
      nama_ibu: {
        type: Sequelize.STRING(100),
      },
      nama_ayah: {
        type: Sequelize.STRING(100),
      },
      status_perkawinan: {
        type: Sequelize.STRING(20),
      },
      pekerjaan: {
        type: Sequelize.STRING(50),
      },
      pekerjaan_lainnya: {
        type: Sequelize.STRING(100),
      },
      bb_lahir_kg: {
        type: Sequelize.DECIMAL(4, 2),
      },
      tb_lahir_cm: {
        type: Sequelize.DECIMAL(4, 2),
      },
      status_domisili: {
        type: Sequelize.STRING(20),
        defaultValue: "aktif",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // CHECK Constraints Warga
    await queryInterface.addConstraint("warga", {
      fields: ["jenis_kelamin"],
      type: "check",
      name: "chk_warga_jenis_kelamin",
      where: { jenis_kelamin: ["L", "P"] },
    });

    await queryInterface.addConstraint("warga", {
      fields: ["status_perkawinan"],
      type: "check",
      name: "chk_warga_status_perkawinan",
      where: { status_perkawinan: ["menikah", "tidak_menikah"] },
    });

    await queryInterface.addConstraint("warga", {
      fields: ["status_domisili"],
      type: "check",
      name: "chk_warga_status_domisili",
      where: { status_domisili: ["aktif", "pindah", "meninggal"] },
    });

    // 4. TABEL USERS
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING(20),
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nama_lengkap: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      telepon: {
        type: Sequelize.STRING(20),
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: "pending_approval",
      },
      puskesmas_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "puskesmas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      posyandu_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "posyandu",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      verified_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      verified_at: {
        type: Sequelize.DATE,
      },
      nik: {
        type: Sequelize.STRING(16),
      },
      profile_picture: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
    });

    // CHECK Constraints Users
    await queryInterface.addConstraint("users", {
      fields: ["role"],
      type: "check",
      name: "chk_users_role",
      where: { role: ["kader", "puskesmas", "dinkes", "sa"] },
    });

    await queryInterface.addConstraint("users", {
      fields: ["status"],
      type: "check",
      name: "chk_users_status",
      where: { status: ["pending_approval", "rejected", "active", "inactive"] },
    });

    // 5. TABEL PROFILE KEHAMILAN
    await queryInterface.createTable("profile_kehamilan", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      warga_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "warga",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nama_suami: {
        type: Sequelize.STRING(100),
      },
      hpht: {
        type: Sequelize.DATEONLY,
      },
      hpl: {
        type: Sequelize.DATEONLY,
      },
      anak_ke: {
        type: Sequelize.INTEGER,
      },
      jarak_anak_sebelum_bulan: {
        type: Sequelize.INTEGER,
      },
      tanggal_persalinan: {
        type: Sequelize.DATEONLY,
      },
      cara_persalinan: {
        type: Sequelize.STRING(30),
      },
      status_kehamilan: {
        type: Sequelize.STRING(20),
      },
    });

    // CHECK Constraints Profile Kehamilan
    await queryInterface.addConstraint("profile_kehamilan", {
      fields: ["cara_persalinan"],
      type: "check",
      name: "chk_kehamilan_cara_persalinan",
      where: { cara_persalinan: ["normal", "dengan_tindakan"] },
    });

    await queryInterface.addConstraint("profile_kehamilan", {
      fields: ["status_kehamilan"],
      type: "check",
      name: "chk_kehamilan_status",
      where: { status_kehamilan: ["hamil", "nifas", "menyusui", "selesai"] },
    });

    // 6. TABEL SESI POSYANDU
    await queryInterface.createTable("sesi_posyandu", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      posyandu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "posyandu",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      tanggal_pelaksanaan: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(10),
        defaultValue: "open",
      },
    });

    await queryInterface.addConstraint("sesi_posyandu", {
      fields: ["status"],
      type: "check",
      name: "chk_sesi_status",
      where: { status: ["open", "closed"] },
    });

    await queryInterface.addConstraint("sesi_posyandu", {
      fields: ["posyandu_id", "tanggal_pelaksanaan"],
      type: "unique",
      name: "uq_sesi_posyandu_tanggal",
    });

    // 7. TABEL KUNJUNGAN POSYANDU
    await queryInterface.createTable("kunjungan_posyandu", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sesi_posyandu_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "sesi_posyandu",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      warga_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "warga",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nomor_antrean: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status_langkah: {
        type: Sequelize.STRING(20),
        defaultValue: "langkah_1",
      },
    });

    await queryInterface.addConstraint("kunjungan_posyandu", {
      fields: ["status_langkah"],
      type: "check",
      name: "chk_kunjungan_status_langkah",
      where: { status_langkah: ["langkah_1", "langkah_2", "langkah_3", "langkah_4", "langkah_5"] },
    });

    await queryInterface.addConstraint("kunjungan_posyandu", {
      fields: ["sesi_posyandu_id", "warga_id"],
      type: "unique",
      name: "uq_kunjungan_sesi_warga",
    });

    await queryInterface.addConstraint("kunjungan_posyandu", {
      fields: ["sesi_posyandu_id", "nomor_antrean"],
      type: "unique",
      name: "uq_kunjungan_sesi_antrean",
    });

    // 8. TABEL PEMERIKSAAN
    await queryInterface.createTable("pemeriksaan", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      kunjungan_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          model: "kunjungan_posyandu",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      profile_kehamilan_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "profile_kehamilan",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      tanggal: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_DATE"),
      },
      usia_bulan: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      kategori_sasaran: {
        type: Sequelize.STRING(20),
      },
      bb_kg: {
        type: Sequelize.DECIMAL(5, 2),
      },
      tb_cm: {
        type: Sequelize.DECIMAL(5, 2),
      },
      lingkar_kepala_cm: {
        type: Sequelize.DECIMAL(4, 2),
      },
      lila_cm: {
        type: Sequelize.DECIMAL(4, 2),
      },
      lingkar_perut_cm: {
        type: Sequelize.DECIMAL(5, 2),
      },
      td_sistole: {
        type: Sequelize.INTEGER,
      },
      td_diastole: {
        type: Sequelize.INTEGER,
      },
      kadar_gula: {
        type: Sequelize.INTEGER,
      },
      detail_skrining: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      topik_penyuluhan: {
        type: Sequelize.TEXT,
      },
      is_perlu_rujukan: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });

    await queryInterface.addConstraint("pemeriksaan", {
      fields: ["kategori_sasaran"],
      type: "check",
      name: "chk_pemeriksaan_kategori",
      where: {
        kategori_sasaran: ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"],
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE pemeriksaan 
        ADD CONSTRAINT chk_pemeriksaan_bb CHECK (bb_kg IS NULL OR bb_kg > 0),
        ADD CONSTRAINT chk_pemeriksaan_tb CHECK (tb_cm IS NULL OR tb_cm > 0),
        ADD CONSTRAINT chk_pemeriksaan_sistole CHECK (td_sistole IS NULL OR td_sistole > 0),
        ADD CONSTRAINT chk_pemeriksaan_diastole CHECK (td_diastole IS NULL OR td_diastole > 0);
    `);

    // 9. TABEL AUDIT LOG
    await queryInterface.createTable("audit_log", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      table_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      record_id: {
        type: Sequelize.BIGINT,
      },
      old_value: {
        type: Sequelize.JSONB,
      },
      new_value: {
        type: Sequelize.JSONB,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 10. TABEL EMAIL OTP
    await queryInterface.createTable("email_otp", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      otp_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      purpose: {
        type: Sequelize.STRING(30),
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("email_otp", {
      fields: ["purpose"],
      type: "check",
      name: "chk_otp_purpose",
      where: { purpose: ["register", "reset_password"] },
    });

    // ===================================================================
    // INDEXES
    // ===================================================================
    await queryInterface.addIndex("warga", ["posyandu_id", "status_domisili"], {
      name: "idx_warga_posyandu_domisili",
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_warga_mutasi_3faktor ON warga(nik, tanggal_lahir, LOWER(nama_ibu));
    `);

    await queryInterface.addIndex("sesi_posyandu", ["posyandu_id", "status", "tanggal_pelaksanaan"], {
      name: "idx_sesi_posyandu_status",
    });

    await queryInterface.addIndex("kunjungan_posyandu", ["sesi_posyandu_id", "nomor_antrean"], {
      name: "idx_kunjungan_antrean",
    });

    await queryInterface.addIndex("pemeriksaan", ["kategori_sasaran", "tanggal"], {
      name: "idx_pemeriksaan_kategori_tanggal",
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_pemeriksaan_detail_skrining_gin ON pemeriksaan USING GIN (detail_skrining);
    `);

    await queryInterface.addIndex("profile_kehamilan", ["warga_id", "status_kehamilan"], {
      name: "idx_profile_kehamilan_warga_status",
    });

    await queryInterface.addIndex("audit_log", ["table_name", "record_id"], {
      name: "idx_audit_log_record",
    });

    await queryInterface.addIndex("email_otp", ["email", "purpose", "is_used", "expires_at"], {
      name: "idx_email_otp_lookup",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("email_otp");
    await queryInterface.dropTable("audit_log");
    await queryInterface.dropTable("pemeriksaan");
    await queryInterface.dropTable("kunjungan_posyandu");
    await queryInterface.dropTable("sesi_posyandu");
    await queryInterface.dropTable("profile_kehamilan");
    await queryInterface.dropTable("users");
    await queryInterface.dropTable("warga");
    await queryInterface.dropTable("posyandu");
    await queryInterface.dropTable("puskesmas");
  },
};
