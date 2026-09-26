"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("screening_config", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },

      value: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("screening_config", ["key"], {
      unique: true,
      name: "screening_config_key_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("screening_config");
  },
};
