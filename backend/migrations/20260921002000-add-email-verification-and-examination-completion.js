"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_verified", { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn("users", "email_verified_at", { type: Sequelize.DATE, allowNull: true });
    await queryInterface.bulkUpdate("users", { email_verified: true, email_verified_at: Sequelize.literal("CURRENT_TIMESTAMP") }, { status: "active" });
    await queryInterface.addColumn("pemeriksaan", "step2_completed_at", { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn("pemeriksaan", "step4_completed_at", { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn("pemeriksaan", "step5_completed_at", { type: Sequelize.DATE, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("pemeriksaan", "step5_completed_at");
    await queryInterface.removeColumn("pemeriksaan", "step4_completed_at");
    await queryInterface.removeColumn("pemeriksaan", "step2_completed_at");
    await queryInterface.removeColumn("users", "email_verified_at");
    await queryInterface.removeColumn("users", "email_verified");
  },
};
