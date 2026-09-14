const { Pemeriksaan, KunjunganPosyandu, Warga, Posyandu, SesiPosyandu, ProfileKehamilan } = require("../models");
const { Op } = require("sequelize");
const { tentukanKategoriAktif, hitungUmur } = require("../utils/kategoriHelper");
const { formatDetailSkrining } = require("../utils/detailSkriningHelper");
const { checkSudahSkriningTahunan } = require("../utils/skriningChecker");
const { assertKaderCanMutateSession } = require("../utils/sesiPosyanduHelper");
const { getPosyanduInclude } = require("../utils/posyanduAccessHelper");
const { STANDAR_PLOT, evaluasiPemeriksaan } = require("../utils/plotHelper");

// Daftar 9 Kategori Sasaran Resmi Posyandu ILP
const VALID_KATEGORI = ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"];

/**
 * HELPER INTERNAL: Get or Create Record Pemeriksaan
 * Memastikan Kunjungan & Sesi valid (status 'open'), serta menghitung usia_bulan & kategori.
 */
const preparePemeriksaanContext = async (kunjungan_id, reqUser, targetTanggal = null) => {
  const kunjungan = await KunjunganPosyandu.findByPk(kunjungan_id, {
    include: [
      { model: SesiPosyandu, as: "sesiPosyandu", required: true, include: [getPosyanduInclude(reqUser)] },
      {
        model: Warga,
        as: "warga",
        include: [{ model: ProfileKehamilan, as: "profileKehamilan", required: false }],
      },
    ],
  });

  if (!kunjungan) {
    const error = new Error("Data kunjungan Posyandu tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  if (reqUser?.role === "kader") await assertKaderCanMutateSession(kunjungan.sesiPosyandu);

  const tglPemeriksaan = targetTanggal || kunjungan.sesiPosyandu?.tanggal_pelaksanaan || new Date();
  const { totalMonths } = hitungUmur(kunjungan.warga.tanggal_lahir, tglPemeriksaan);
  const kategoriFix = tentukanKategoriAktif(kunjungan.warga.tanggal_lahir, kunjungan.warga.profileKehamilan, tglPemeriksaan);

  // Cari atau Buat Record Pemeriksaan
  let [pemeriksaan] = await Pemeriksaan.findOrCreate({
    where: { kunjungan_id },
    defaults: {
      kunjungan_id,
      tanggal: tglPemeriksaan,
      usia_bulan: totalMonths,
      kategori_sasaran: kategoriFix,
      detail_skrining: {},
      is_perlu_rujukan: false,
    },
  });

  return { kunjungan, pemeriksaan, tglPemeriksaan, totalMonths, kategoriFix };
};

/**
 * 1. GET ALL PEMERIKSAAN
 * Filter berdasarkan kategori, sesi, posyandu, warga, rentang tanggal, & pencarian nama/NIK
 */
const getAllPemeriksaan = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, kategori_sasaran, sesi_posyandu_id, posyandu_id, warga_id, start_date, end_date } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {};

    if (kategori_sasaran) {
      if (!VALID_KATEGORI.includes(kategori_sasaran)) {
        return res.status(400).json({
          success: false,
          message: `Kategori tidak valid. Pilih salah satu: ${VALID_KATEGORI.join(", ")}`,
        });
      }
      whereCondition.kategori_sasaran = kategori_sasaran;
    }

    if (start_date && end_date) {
      whereCondition.tanggal = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    // Filter Relasi Kunjungan
    const kunjunganWhere = {};
    if (sesi_posyandu_id) kunjunganWhere.sesi_posyandu_id = sesi_posyandu_id;
    if (warga_id) kunjunganWhere.warga_id = warga_id;

    // Filter Relasi Warga
    const wargaWhere = {};
    if (search) {
      wargaWhere[Op.or] = [{ nama_lengkap: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
    }
    if (posyandu_id) wargaWhere.posyandu_id = posyandu_id;

    const { count, rows } = await Pemeriksaan.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [
        ["tanggal", "DESC"],
        ["created_at", "DESC"],
      ],
      include: [
        {
          model: KunjunganPosyandu,
          as: "kunjungan",
          required: true,
          where: Object.keys(kunjunganWhere).length > 0 ? kunjunganWhere : undefined,
          attributes: ["id", "sesi_posyandu_id", "warga_id", "nomor_antrean", "status_langkah"],
          include: [
            {
              model: Warga,
              as: "warga",
              where: Object.keys(wargaWhere).length > 0 ? wargaWhere : undefined,
              attributes: ["id", "nik", "nama_lengkap", "tanggal_lahir", "jenis_kelamin", "posyandu_id"],
              include: [
                {
                  model: Posyandu,
                  as: "posyandu",
                  attributes: ["id", "nama_posyandu"],
                },
              ],
            },
            {
              model: SesiPosyandu,
              as: "sesiPosyandu",
              required: true,
              include: [getPosyanduInclude(req.user)],
              attributes: ["id", "tanggal_pelaksanaan", "status"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar data pemeriksaan.",
      data: rows,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / limit),
        current_page: parseInt(page, 10),
        items_per_page: parseInt(limit, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. GET PEMERIKSAAN BY ID
 */
const getPemeriksaanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pemeriksaan = await Pemeriksaan.findByPk(id, {
      include: [
        {
          model: KunjunganPosyandu,
          as: "kunjungan",
          required: true,
          attributes: ["id", "sesi_posyandu_id", "warga_id", "nomor_antrean", "status_langkah"],
          include: [
            {
              model: Warga,
              as: "warga",
              attributes: ["id", "nik", "nama_lengkap", "tanggal_lahir", "jenis_kelamin"],
              include: [
                {
                  model: Posyandu,
                  as: "posyandu",
                  attributes: ["id", "nama_posyandu"],
                },
              ],
            },
            {
              model: SesiPosyandu,
              as: "sesiPosyandu",
              required: true,
              include: [getPosyanduInclude(req.user)],
              attributes: ["id", "tanggal_pelaksanaan", "status"],
            },
          ],
        },
        {
          model: ProfileKehamilan,
          as: "profileKehamilan",
          required: false,
        },
      ],
    });

    if (!pemeriksaan) {
      return res.status(404).json({
        success: false,
        message: "Data pemeriksaan tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail data pemeriksaan.",
      data: pemeriksaan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET PEMERIKSAAN STEP 3 / DATA PLOTTING
 * Read-only: seluruh nilai berasal dari pemeriksaan Step 2 yang tersimpan.
 */
const getStep3Pemeriksaan = async (req, res, next) => {
  try {
    const pemeriksaan = await Pemeriksaan.findByPk(req.params.id, {
      attributes: ["id", "tanggal", "usia_bulan", "kategori_sasaran", "bb_kg", "tb_cm", "lingkar_kepala_cm", "lila_cm", "lingkar_perut_cm", "td_sistole", "td_diastole", "kadar_gula"],
      include: [
        {
          model: KunjunganPosyandu,
          as: "kunjungan",
          required: true,
          attributes: ["id", "warga_id", "sesi_posyandu_id"],
          include: [
            { model: Warga, as: "warga", required: true, attributes: ["id", "nik", "nama_lengkap", "tanggal_lahir", "jenis_kelamin"] },
            {
              model: SesiPosyandu,
              as: "sesiPosyandu",
              required: true,
              attributes: ["id", "posyandu_id", "tanggal_pelaksanaan", "status"],
              include: [getPosyanduInclude(req.user)],
            },
          ],
        },
      ],
    });

    if (!pemeriksaan) return res.status(404).json({ success: false, message: "Data pemeriksaan tidak ditemukan." });

    const current = pemeriksaan.get({ plain: true });
    const measurements = {
      bb_kg: current.bb_kg,
      tb_cm: current.tb_cm,
      lingkar_kepala_cm: current.lingkar_kepala_cm,
      lila_cm: current.lila_cm,
      lingkar_perut_cm: current.lingkar_perut_cm,
      td_sistole: current.td_sistole,
      td_diastole: current.td_diastole,
      kadar_gula: current.kadar_gula,
    };

    const history = await Pemeriksaan.findAll({
      where: { "$kunjungan.warga_id$": current.kunjungan.warga_id },
      attributes: ["id", "tanggal", "usia_bulan", "kategori_sasaran", "bb_kg", "tb_cm", "lingkar_kepala_cm", "lila_cm", "lingkar_perut_cm", "td_sistole", "td_diastole", "kadar_gula"],
      include: [
        {
          model: KunjunganPosyandu,
          as: "kunjungan",
          required: true,
          attributes: [],
          include: [{ model: SesiPosyandu, as: "sesiPosyandu", required: true, attributes: [], include: [getPosyanduInclude(req.user)] }],
        },
      ],
      order: [["tanggal", "ASC"], ["id", "ASC"]],
    });

    const plotData = ["bumil", "busui", "dewasa", "lansia"].includes(current.kategori_sasaran)
      ? evaluasiPemeriksaan({ ...measurements, kategori_sasaran: current.kategori_sasaran, jenis_kelamin: current.kunjungan.warga.jenis_kelamin })
      : null;

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data plotting pemeriksaan Step 3.",
      data: {
        pemeriksaan_id: current.id,
        kategori_sasaran: current.kategori_sasaran,
        usia_bulan: current.usia_bulan,
        tanggal: current.tanggal,
        warga: current.kunjungan.warga,
        pengukuran_step_2: measurements,
        standar_plot: STANDAR_PLOT[current.kategori_sasaran] || null,
        hasil_plot: plotData,
        historis: history,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. CREATE / DIRECT ALL-IN-ONE PEMERIKSAAN
 * Menyimpan seluruh isi Step 2 s/d Step 5 sekaligus dalam 1 request
 */
const createPemeriksaan = async (req, res, next) => {
  try {
    const {
      kunjungan_id,
      profile_kehamilan_id,
      kategori_sasaran: kategoriInput,
      tanggal,
      is_skrining_tahunan,
      // Measurement Fields
      bb_kg,
      tb_cm,
      lingkar_kepala_cm,
      lila_cm,
      lingkar_perut_cm,
      td_sistole,
      td_diastole,
      kadar_gula,
      // JSONB & Skrining Extra
      detail_skrining,
      topik_penyuluhan,
      is_perlu_rujukan,
    } = req.body;

    const { kunjungan, pemeriksaan, tglPemeriksaan, totalMonths, kategoriFix } = await preparePemeriksaanContext(kunjungan_id, req.user, tanggal);

    const kategoriAkhir = kategoriFix;

    // Pengecekan Skrining Tahunan (Khusus Dewasa & Lansia)
    let isTahunanFix = false;
    if (["dewasa", "lansia"].includes(kategoriAkhir)) {
      const targetYear = new Date(tglPemeriksaan).getFullYear();
      const sudahSkriningTahunIni = await checkSudahSkriningTahunan(kunjungan.warga_id, targetYear);

      if (is_skrining_tahunan && !sudahSkriningTahunIni) {
        isTahunanFix = true;
      }
    }

    // Format & Sanitasi Payload JSONB detail_skrining
    const formattedSkrining = formatDetailSkrining(kategoriAkhir, detail_skrining, isTahunanFix);

    // Update Data Pemeriksaan ke DB (Upsert Safe)
    await pemeriksaan.update({
      profile_kehamilan_id: profile_kehamilan_id || null,
      tanggal: tglPemeriksaan,
      usia_bulan: totalMonths,
      kategori_sasaran: kategoriAkhir,
      bb_kg: bb_kg ?? null,
      tb_cm: tb_cm ?? null,
      lingkar_kepala_cm: lingkar_kepala_cm ?? null,
      lila_cm: lila_cm ?? null,
      lingkar_perut_cm: lingkar_perut_cm ?? null,
      td_sistole: td_sistole ?? null,
      td_diastole: td_diastole ?? null,
      kadar_gula: kadar_gula ?? null,
      detail_skrining: formattedSkrining,
      topik_penyuluhan: topik_penyuluhan || null,
      is_perlu_rujukan: is_perlu_rujukan ?? false,
    });

    // Update status kunjungan ke langkah 5 (Selesai)
    await kunjungan.update({ status_langkah: "langkah_5" });

    return res.status(200).json({
      success: true,
      message: `Seluruh data pemeriksaan kategori [${kategoriAkhir}] berhasil disimpan.`,
      data: pemeriksaan,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * 4. SAVE STEP 2: PENGUKURAN FISIK
 */
const saveStep2 = async (req, res, next) => {
  try {
    const { kunjungan_id, bb_kg, tb_cm, lingkar_kepala_cm, lila_cm, lingkar_perut_cm, td_sistole, td_diastole, kadar_gula } = req.body;

    const { kunjungan, pemeriksaan } = await preparePemeriksaanContext(kunjungan_id, req.user);

    await pemeriksaan.update({
      bb_kg: bb_kg !== undefined ? bb_kg : pemeriksaan.bb_kg,
      tb_cm: tb_cm !== undefined ? tb_cm : pemeriksaan.tb_cm,
      lingkar_kepala_cm: lingkar_kepala_cm !== undefined ? lingkar_kepala_cm : pemeriksaan.lingkar_kepala_cm,
      lila_cm: lila_cm !== undefined ? lila_cm : pemeriksaan.lila_cm,
      lingkar_perut_cm: lingkar_perut_cm !== undefined ? lingkar_perut_cm : pemeriksaan.lingkar_perut_cm,
      td_sistole: td_sistole !== undefined ? td_sistole : pemeriksaan.td_sistole,
      td_diastole: td_diastole !== undefined ? td_diastole : pemeriksaan.td_diastole,
      kadar_gula: kadar_gula !== undefined ? kadar_gula : pemeriksaan.kadar_gula,
    });

    // Update status ke langkah 2 jika belum melebihi langkah 2
    if (["langkah_1"].includes(kunjungan.status_langkah)) {
      await kunjungan.update({ status_langkah: "langkah_2" });
    }

    return res.status(200).json({
      success: true,
      message: "Data pengukuran fisik (Step 2) berhasil disimpan.",
      data: pemeriksaan,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * 5. SAVE STEP 4: SKRINING SPESIFIK
 */
const saveStep4 = async (req, res, next) => {
  try {
    const { kunjungan_id, detail_skrining, is_skrining_tahunan, profile_kehamilan_id } = req.body;

    const { kunjungan, pemeriksaan, tglPemeriksaan, kategoriFix } = await preparePemeriksaanContext(kunjungan_id, req.user);

    // Pengecekan Skrining Tahunan
    let isTahunanFix = false;
    if (["dewasa", "lansia"].includes(kategoriFix)) {
      const targetYear = new Date(tglPemeriksaan).getFullYear();
      const sudahSkriningTahunIni = await checkSudahSkriningTahunan(kunjungan.warga_id, targetYear);

      if (is_skrining_tahunan && !sudahSkriningTahunIni) {
        isTahunanFix = true;
      }
    }

    const formattedSkrining = formatDetailSkrining(kategoriFix, detail_skrining, isTahunanFix);

    await pemeriksaan.update({
      profile_kehamilan_id: profile_kehamilan_id !== undefined ? profile_kehamilan_id : pemeriksaan.profile_kehamilan_id,
      detail_skrining: {
        ...(pemeriksaan.detail_skrining || {}),
        ...formattedSkrining,
      },
    });

    // Update status ke langkah 4 jika belum mencapai langkah 5
    if (["langkah_1", "langkah_2", "langkah_3"].includes(kunjungan.status_langkah)) {
      await kunjungan.update({ status_langkah: "langkah_4" });
    }

    return res.status(200).json({
      success: true,
      message: "Data skrining (Step 4) berhasil disimpan.",
      data: pemeriksaan,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * 6. SAVE STEP 5: EDUKASI DAN RUJUKAN (SELESAI)
 */
const saveStep5 = async (req, res, next) => {
  try {
    const { kunjungan_id, topik_penyuluhan, is_perlu_rujukan } = req.body;

    const { kunjungan, pemeriksaan } = await preparePemeriksaanContext(kunjungan_id, req.user);

    await pemeriksaan.update({
      topik_penyuluhan: topik_penyuluhan !== undefined ? topik_penyuluhan : pemeriksaan.topik_penyuluhan,
      is_perlu_rujukan: is_perlu_rujukan !== undefined ? is_perlu_rujukan : pemeriksaan.is_perlu_rujukan,
    });

    // Tandai status pemeriksaan kunjungan selesai
    await kunjungan.update({ status_langkah: "langkah_5" });

    return res.status(200).json({
      success: true,
      message: "Data edukasi & rujukan (Step 5) berhasil disimpan. Pemeriksaan Selesai.",
      data: pemeriksaan,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * 7. UPDATE PEMERIKSAAN
 */
const updatePemeriksaan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { kategori_sasaran, tanggal, is_skrining_tahunan, bb_kg, tb_cm, lingkar_kepala_cm, lila_cm, lingkar_perut_cm, td_sistole, td_diastole, kadar_gula, detail_skrining, topik_penyuluhan, is_perlu_rujukan, profile_kehamilan_id } =
      req.body;

    const pemeriksaan = await Pemeriksaan.findByPk(id, {
      include: [
        {
          model: KunjunganPosyandu,
          as: "kunjungan",
          required: true,
          include: [
            { model: SesiPosyandu, as: "sesiPosyandu", required: true, include: [getPosyanduInclude(req.user)] },
            {
              model: Warga,
              as: "warga",
              include: [{ model: ProfileKehamilan, as: "profileKehamilan", required: false }],
            },
          ],
        },
      ],
    });

    if (!pemeriksaan) {
      return res.status(404).json({
        success: false,
        message: "Data pemeriksaan tidak ditemukan.",
      });
    }

    // Cek Batasan Sesi Closed untuk Role Kader
    if (req.user.role === "kader") await assertKaderCanMutateSession(pemeriksaan.kunjungan?.sesiPosyandu);

    if (kategori_sasaran && !VALID_KATEGORI.includes(kategori_sasaran)) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak valid. Harus salah satu dari: ${VALID_KATEGORI.join(", ")}`,
      });
    }

    // Recalculate usia_bulan jika tanggal pemeriksaan diubah
    let updatedUsiaBulan = pemeriksaan.usia_bulan;
    const targetTanggal = tanggal || pemeriksaan.tanggal;
    if (tanggal && pemeriksaan.kunjungan?.warga?.tanggal_lahir) {
      const { totalMonths } = hitungUmur(pemeriksaan.kunjungan.warga.tanggal_lahir, targetTanggal);
      updatedUsiaBulan = totalMonths;
    }

    const kategoriAktif = tentukanKategoriAktif(pemeriksaan.kunjungan.warga.tanggal_lahir, pemeriksaan.kunjungan.warga.profileKehamilan, targetTanggal);

    // Format ulang detail_skrining jika ada update payload JSONB
    let updatedDetailSkrining = pemeriksaan.detail_skrining;
    if (detail_skrining !== undefined) {
      const isTahunan = is_skrining_tahunan !== undefined ? is_skrining_tahunan : pemeriksaan.detail_skrining?.is_skrining_tahunan || false;

      updatedDetailSkrining = formatDetailSkrining(kategoriAktif, detail_skrining, isTahunan);
    }

    await pemeriksaan.update({
      kategori_sasaran: kategoriAktif,
      tanggal: targetTanggal,
      usia_bulan: updatedUsiaBulan,
      profile_kehamilan_id: profile_kehamilan_id !== undefined ? profile_kehamilan_id : pemeriksaan.profile_kehamilan_id,
      bb_kg: bb_kg !== undefined ? bb_kg : pemeriksaan.bb_kg,
      tb_cm: tb_cm !== undefined ? tb_cm : pemeriksaan.tb_cm,
      lingkar_kepala_cm: lingkar_kepala_cm !== undefined ? lingkar_kepala_cm : pemeriksaan.lingkar_kepala_cm,
      lila_cm: lila_cm !== undefined ? lila_cm : pemeriksaan.lila_cm,
      lingkar_perut_cm: lingkar_perut_cm !== undefined ? lingkar_perut_cm : pemeriksaan.lingkar_perut_cm,
      td_sistole: td_sistole !== undefined ? td_sistole : pemeriksaan.td_sistole,
      td_diastole: td_diastole !== undefined ? td_diastole : pemeriksaan.td_diastole,
      kadar_gula: kadar_gula !== undefined ? kadar_gula : pemeriksaan.kadar_gula,
      detail_skrining: updatedDetailSkrining,
      topik_penyuluhan: topik_penyuluhan !== undefined ? topik_penyuluhan : pemeriksaan.topik_penyuluhan,
      is_perlu_rujukan: is_perlu_rujukan !== undefined ? is_perlu_rujukan : pemeriksaan.is_perlu_rujukan,
    });

    return res.status(200).json({
      success: true,
      message: "Data pemeriksaan berhasil diperbarui.",
      data: pemeriksaan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. DELETE PEMERIKSAAN
 */
const deletePemeriksaan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pemeriksaan = await Pemeriksaan.findByPk(id, {
      include: [{ model: KunjunganPosyandu, as: "kunjungan", required: true, include: [{ model: SesiPosyandu, as: "sesiPosyandu", required: true, include: [getPosyanduInclude(req.user)] }] }],
    });

    if (!pemeriksaan) {
      return res.status(404).json({
        success: false,
        message: "Data pemeriksaan tidak ditemukan.",
      });
    }

    if (req.user.role === "kader") await assertKaderCanMutateSession(pemeriksaan.kunjungan?.sesiPosyandu);

    await pemeriksaan.destroy();

    return res.status(200).json({
      success: true,
      message: "Data pemeriksaan berhasil dihapus.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPemeriksaan,
  getPemeriksaanById,
  getStep3Pemeriksaan,
  createPemeriksaan,
  saveStep2,
  saveStep4,
  saveStep5,
  updatePemeriksaan,
  deletePemeriksaan,
};
