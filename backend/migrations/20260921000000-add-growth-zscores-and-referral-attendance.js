"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const column of ["zscore_bbu", "zscore_pbu", "zscore_tbu", "zscore_bbpb", "zscore_bbtb", "zscore_imtu"]) {
      await queryInterface.addColumn("pemeriksaan", column, { type: Sequelize.DECIMAL(8, 4), allowNull: true });
    }

    await queryInterface.addColumn("rujukan", "status_kehadiran_rujukan", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addConstraint("rujukan", {
      fields: ["status_kehadiran_rujukan"],
      type: "check",
      name: "chk_rujukan_status_kehadiran",
      where: { status_kehadiran_rujukan: ["hadir", "tidak_hadir"] },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("rujukan", "chk_rujukan_status_kehadiran");
    await queryInterface.removeColumn("rujukan", "status_kehadiran_rujukan");
    for (const column of ["zscore_bbu", "zscore_pbu", "zscore_tbu", "zscore_bbpb", "zscore_bbtb", "zscore_imtu"]) {
      await queryInterface.removeColumn("pemeriksaan", column);
    }
  },
};
