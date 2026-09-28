"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const describe = async (table) => queryInterface.describeTable(table);

    let kelurahan = await describe("kelurahan");
    let puskesmas = await describe("puskesmas");
    let profileKehamilan = await describe("profile_kehamilan");

    // 1) Tambahkan hubungan Kelurahan -> Puskesmas.
    if (!kelurahan.puskesmas_id) {
      await queryInterface.addColumn("kelurahan", "puskesmas_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // 2) Tambahkan hubungan Puskesmas -> Kecamatan.
    if (!puskesmas.kecamatan_id) {
      await queryInterface.addColumn("puskesmas", "kecamatan_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // Backfill kecamatan_id dari relasi lama puskesmas -> kelurahan.
    if (puskesmas.kelurahan_id) {
      await queryInterface.sequelize.query(`
        UPDATE "puskesmas" p
        SET "kecamatan_id" = k."kecamatan_id"
        FROM "kelurahan" k
        WHERE p."kelurahan_id" = k."id"
          AND p."kecamatan_id" IS NULL;
      `);

      await queryInterface.changeColumn("puskesmas", "kecamatan_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
      });

      // Relasi lama adalah Puskesmas -> satu Kelurahan.
      // Untuk data lama yang satu Kelurahan hanya dirujuk satu Puskesmas,
      // pindahkan relasi tersebut menjadi Kelurahan -> Puskesmas.
      await queryInterface.sequelize.query(`
        UPDATE "kelurahan" k
        SET "puskesmas_id" = p."id"
        FROM "puskesmas" p
        WHERE p."kelurahan_id" = k."id"
          AND NOT EXISTS (
            SELECT 1
            FROM "puskesmas" p2
            WHERE p2."kelurahan_id" = k."id"
              AND p2."id" <> p."id"
          )
          AND k."puskesmas_id" IS NULL;
      `);

      await queryInterface.removeConstraint("puskesmas", "puskesmas_kelurahan_id_fkey").catch(() => {});

      await queryInterface.removeColumn("puskesmas", "kelurahan_id");
    }

    // FK/index untuk relasi baru.
    const fkNames = {
      kecamatan: "puskesmas_kecamatan_id_fkey",
      puskesmas: "kelurahan_puskesmas_id_fkey",
    };

    await queryInterface
      .addConstraint("puskesmas", {
        fields: ["kecamatan_id"],
        type: "foreign key",
        name: fkNames.kecamatan,
        references: { table: "kecamatan", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      })
      .catch(() => {});

    await queryInterface
      .addConstraint("kelurahan", {
        fields: ["puskesmas_id"],
        type: "foreign key",
        name: fkNames.puskesmas,
        references: { table: "puskesmas", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      })
      .catch(() => {});

    await queryInterface
      .addIndex("puskesmas", ["kecamatan_id"], {
        name: "idx_puskesmas_kecamatan",
      })
      .catch(() => {});

    await queryInterface
      .addIndex("kelurahan", ["puskesmas_id"], {
        name: "idx_kelurahan_puskesmas",
      })
      .catch(() => {});

    // 3) Tambahkan BB/TB sebelum hamil.
    if (!profileKehamilan.bb_sebelum_hamil_kg) {
      await queryInterface.addColumn("profile_kehamilan", "bb_sebelum_hamil_kg", {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      });
    }

    if (!profileKehamilan.tb_sebelum_hamil_cm) {
      await queryInterface.addColumn("profile_kehamilan", "tb_sebelum_hamil_cm", {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_profile_kehamilan_bb_sebelum_hamil'
        ) THEN
          ALTER TABLE "profile_kehamilan"
            ADD CONSTRAINT "chk_profile_kehamilan_bb_sebelum_hamil"
            CHECK ("bb_sebelum_hamil_kg" IS NULL OR "bb_sebelum_hamil_kg" > 0);
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_profile_kehamilan_tb_sebelum_hamil'
        ) THEN
          ALTER TABLE "profile_kehamilan"
            ADD CONSTRAINT "chk_profile_kehamilan_tb_sebelum_hamil"
            CHECK ("tb_sebelum_hamil_cm" IS NULL OR "tb_sebelum_hamil_cm" > 0);
        END IF;
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    const hasColumn = async (table, column) => {
      try {
        const tableInfo = await queryInterface.describeTable(table);
        return Boolean(tableInfo[column]);
      } catch {
        return false;
      }
    };

    await queryInterface.removeConstraint("profile_kehamilan", "chk_profile_kehamilan_tb_sebelum_hamil").catch(() => {});
    await queryInterface.removeConstraint("profile_kehamilan", "chk_profile_kehamilan_bb_sebelum_hamil").catch(() => {});
    if (await hasColumn("profile_kehamilan", "tb_sebelum_hamil_cm")) await queryInterface.removeColumn("profile_kehamilan", "tb_sebelum_hamil_cm");
    if (await hasColumn("profile_kehamilan", "bb_sebelum_hamil_kg")) await queryInterface.removeColumn("profile_kehamilan", "bb_sebelum_hamil_kg");

    await queryInterface.removeIndex("kelurahan", "idx_kelurahan_puskesmas").catch(() => {});
    await queryInterface.removeIndex("puskesmas", "idx_puskesmas_kecamatan").catch(() => {});
    await queryInterface.removeConstraint("kelurahan", "kelurahan_puskesmas_id_fkey").catch(() => {});
    await queryInterface.removeConstraint("puskesmas", "puskesmas_kecamatan_id_fkey").catch(() => {});

    // Kembalikan kolom lama secara nullable karena tidak semua Kelurahan
    // dapat direkonstruksi secara unik dari relasi baru.
    if ((await hasColumn("puskesmas", "kelurahan_id")) === false) {
      await queryInterface.addColumn("puskesmas", "kelurahan_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (await hasColumn("puskesmas", "kecamatan_id")) await queryInterface.removeColumn("puskesmas", "kecamatan_id");
    if (await hasColumn("kelurahan", "puskesmas_id")) await queryInterface.removeColumn("kelurahan", "puskesmas_id");
  },
};
