'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. TABEL KECAMATAN
    await queryInterface.createTable('kecamatan', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nama_kecamatan: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    });

    // 2. TABEL KELURAHAN
    await queryInterface.createTable('kelurahan', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      kecamatan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'kecamatan',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      nama_kelurahan: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    });

    // Index untuk pencarian wilayah
    await queryInterface.addIndex('kelurahan', ['kecamatan_id'], {
      name: 'idx_kelurahan_kecamatan'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kelurahan');
    await queryInterface.dropTable('kecamatan');
  }
};