const { Pemeriksaan, KunjunganPosyandu } = require("../models");
const { Op } = require("sequelize");

/**
 * Mengecek apakah seorang warga sudah pernah melakukan skrining tahunan pada tahun berjalan
 *
 * @param {string} wargaId - ID warga
 * @param {number} targetYear - Tahun pemeriksaan (default: tahun berjalan)
 * @param {string|number|null} excludePemeriksaanId - ID pemeriksaan yang sedang dibuat/diubah, dikecualikan dari pengecekan agar tidak mencocokkan dirinya sendiri
 * @returns {Promise<boolean>} True jika sudah pernah, False jika belum
 */
const checkSudahSkriningTahunan = async (wargaId, targetYear = new Date().getFullYear(), excludePemeriksaanId = null) => {
  const startOfYear = new Date(`${targetYear}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${targetYear}-12-31T23:59:59.999Z`);

  const where = {
    tanggal: {
      [Op.between]: [startOfYear, endOfYear],
    },
    // Query khusus PostgreSQL JSONB menggunakan Op.contains
    detail_skrining: {
      [Op.contains]: { is_skrining_tahunan: true },
    },
  };

  if (excludePemeriksaanId) {
    where.id = { [Op.ne]: excludePemeriksaanId };
  }

  const pemeriksaanTahunan = await Pemeriksaan.findOne({
    where,
    include: [
      {
        model: KunjunganPosyandu,
        as: "kunjungan",
        where: { warga_id: wargaId },
        attributes: [],
      },
    ],
  });

  return Boolean(pemeriksaanTahunan);
};

module.exports = {
  checkSudahSkriningTahunan,
};
