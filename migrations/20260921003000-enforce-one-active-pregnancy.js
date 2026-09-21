"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX "uq_profile_kehamilan_active_hamil" ON "profile_kehamilan" ("warga_id") WHERE "status_kehamilan" = \'hamil\'');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "uq_profile_kehamilan_active_hamil"');
  },
};
