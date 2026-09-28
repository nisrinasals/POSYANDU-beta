"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("imunisasi");

    if (!table.is_diberikan) {
      await queryInterface.addColumn("imunisasi", "is_diberikan", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
    if (!table.tanggal_imunisasi) {
      await queryInterface.addColumn("imunisasi", "tanggal_imunisasi", { type: Sequelize.DATEONLY, allowNull: true });
    } else {
      await queryInterface.changeColumn("imunisasi", "tanggal_imunisasi", { type: Sequelize.DATEONLY, allowNull: true });
    }
    if (!table.tempat) {
      await queryInterface.addColumn("imunisasi", "tempat", { type: Sequelize.ENUM("puskesmas", "klinik", "rs"), allowNull: true });
    }
    if (!table.no_batch) {
      await queryInterface.addColumn("imunisasi", "no_batch", { type: Sequelize.STRING(100), allowNull: true });
    }
    if (!table.created_at) {
      await queryInterface.addColumn("imunisasi", "created_at", { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") });
    }
    if (!table.updated_at) {
      await queryInterface.addColumn("imunisasi", "updated_at", { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") });
    }

    await queryInterface.removeIndex("imunisasi", "idx_imunisasi_warga_tanggal").catch(() => {});
    await queryInterface.sequelize.query(`
      DELETE FROM "imunisasi" older
      USING "imunisasi" newer
      WHERE older."warga_id" = newer."warga_id"
        AND older."jenis_imunisasi" = newer."jenis_imunisasi"
        AND older."id" > newer."id"
    `);
    await queryInterface.addIndex("imunisasi", ["warga_id", "jenis_imunisasi"], { unique: true, name: "uq_imunisasi_warga_jenis" }).catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("imunisasi", "uq_imunisasi_warga_jenis").catch(() => {});
    for (const column of ["updated_at", "created_at", "no_batch", "tempat", "is_diberikan"]) {
      await queryInterface.removeColumn("imunisasi", column).catch(() => {});
    }
  },
};
