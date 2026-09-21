"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate("users", { email_verified: true, email_verified_at: Sequelize.literal("CURRENT_TIMESTAMP") }, { status: "active" });
  },

  async down() {},
};
