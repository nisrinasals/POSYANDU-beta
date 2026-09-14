"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "kunjungan_posyandu"
      ALTER COLUMN "nomor_antrean" TYPE VARCHAR(10)
      USING "nomor_antrean"::VARCHAR(10)
    `);

    await queryInterface.addColumn("kunjungan_posyandu", "created_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("kunjungan_posyandu", "created_at");
    await queryInterface.sequelize.query(`
      ALTER TABLE "kunjungan_posyandu"
      ALTER COLUMN "nomor_antrean" TYPE INTEGER
      USING NULLIF(REGEXP_REPLACE("nomor_antrean", '[^0-9]', '', 'g'), '')::INTEGER
    `);
  },
};
