const { Pemeriksaan, KunjunganPosyandu, Warga, Posyandu, SesiPosyandu, ProfileKehamilan, Rujukan } = require("../models");
const { Op } = require("sequelize");
const { tentukanKategoriAktif, tentukanPeriodePemeriksaan, getLatestPregnancyProfile, hitungUmur } = require("../utils/kategoriHelper");
const { formatDetailSkrining, validateDetailSkrining } = require("../utils/detailSkriningHelper");
const { checkSudahSkriningTahunan } = require("../utils/skriningChecker");
const { finalizeScreeningScores } = require("../utils/screeningScoringHelper");
const { assertKaderCanMutateSession } = require("../utils/sesiPosyanduHelper");
const { getPosyanduInclude } = require("../utils/posyanduAccessHelper");
const { STANDAR_PLOT, evaluasiPemeriksaan } = require("../utils/plotHelper");
const { createAuditLog, AUDIT_ACTIONS } = require("../utils/auditLogHelper");
const { getScreeningReferralReasons } = require("../utils/rujukanHelper");

// Daftar 9 Kategori Sasaran Resmi Posyandu ILP
const VALID_KATEGORI = ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"];
const MEASUREMENT_LIMITS = {
  bb_kg: 999.99,
  tb_cm: 999.99,
  lingkar_kepala_cm: 99.99,
  lila_cm: 99.99,
  lingkar_perut_cm: 999.99,
  td_sistole: 300,
  td_diastole: 300,
  kadar_gula: 9999,
};

const getMeasurementError = (payload) => {
  for (const [field, max] of Object.entries(MEASUREMENT_LIMITS)) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") continue;
    const value = Number(payload[field]);
    if (!Number.isFinite(value) || value <= 0 || value > max) return `${field} harus berupa angka lebih dari 0 dan maksimal ${max}.`;
  }
  return null;
};

const getScreeningError = (kategori, detailSkrining) => validateDetailSkrining(kategori, detailSkrining);

// Ringkasan field non-sensitif untuk audit log (detail_skrining sengaja dikecualikan karena besar)
const pemeriksaanAuditSnapshot = (p) => ({
  id: p.id,
  kunjungan_id: p.kunjungan_id,
  tanggal: p.tanggal,
  kategori_sasaran: p.kategori_sasaran,
  bb_kg: p.bb_kg,
  tb_cm: p.tb_cm,
  lingkar_kepala_cm: p.lingkar_kepala_cm,
  lila_cm: p.lila_cm,
  lingkar_perut_cm: p.lingkar_perut_cm,
  td_sistole: p.td_sistole,
  td_diastole: p.td_diastole,
  kadar_gula: p.kadar_gula,
  topik_penyuluhan: p.topik_penyuluhan,
  is_perlu_rujukan: p.is_perlu_rujukan,
});

const rujukanAuditSnapshot = (rujukan) =>
  rujukan
    ? {
        id: rujukan.id,
        warga_id: rujukan.warga_id,
        pemeriksaan_id: rujukan.pemeriksaan_id,
        puskesmas_id: rujukan.puskesmas_id,
        kader_id: rujukan.kader_id,
        tanggal_rujukan: rujukan.tanggal_rujukan,
        alasan_rujukan: rujukan.alasan_rujukan,
      }
    : null;

/**
 * HELPER INTERNAL: Get or Create Record Pemeriksaan
 * Memastikan Kunjungan & Sesi valid (status 'open'), serta menghitung usia_bulan & kategori.
 */
const preparePemeriksaanContext = async (kunjungan_id, reqUser, targetTanggal = null, transaction = null) => {
  const kunjungan = await KunjunganPosyandu.findByPk(kunjungan_id, {
    ...(transaction ? { transaction } : {}),
    include: [
      { model: SesiPosyandu, as: "sesiPosyandu", required: true, include: [getPosyanduInclude(reqUser)] },
      {
        model: Warga,
        as: "warga",
        required: true,
        include: [
          { model: ProfileKehamilan, as: "profileKehamilan", required: false },
          { model: Posyandu, as: "posyandu", required: true, attributes: ["id", "puskesmas_id"] },
        ],
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
  let [pemeriksaan, created] = await Pemeriksaan.findOrCreate({
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

  return { kunjungan, pemeriksaan, created, tglPemeriksaan, totalMonths, kategoriFix };
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
      attributes: ["id", "tanggal", "usia_bulan", "kategori_sasaran", "profile_kehamilan_id", "bb_kg", "tb_cm", "lingkar_kepala_cm", "lila_cm", "lingkar_perut_cm", "td_sistole", "td_diastole", "kadar_gula"],
      include: [
        {
          model: KunjunganPosyandu,
          as: "kunjungan",
          required: true,
          attributes: ["id", "warga_id", "sesi_posyandu_id"],
          include: [
            {
              model: Warga,
              as: "warga",
              required: true,
              attributes: ["id", "nik", "nama_lengkap", "tanggal_lahir", "jenis_kelamin"],
              include: [{ model: ProfileKehamilan, as: "profileKehamilan", required: false, attributes: ["id", "tanggal_persalinan", "status_kehamilan", "is_menyusui"] }],
            },
            {
              model: SesiPosyandu,
              as: "sesiPosyandu",
              required: true,
              attributes: ["id", "posyandu_id", "tanggal_pelaksanaan", "status"],
              include: [getPosyanduInclude(req.user)],
            },
          ],
        },
        { model: ProfileKehamilan, as: "profileKehamilan", required: false, attributes: ["id", "tanggal_persalinan", "status_kehamilan", "is_menyusui"] },
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
      order: [
        ["tanggal", "ASC"],
        ["id", "ASC"],
      ],
    });

    const plotData = ["bumil", "busui", "dewasa", "lansia"].includes(current.kategori_sasaran)
      ? evaluasiPemeriksaan({ ...measurements, kategori_sasaran: current.kategori_sasaran, jenis_kelamin: current.kunjungan.warga.jenis_kelamin, tanggal_lahir: current.kunjungan.warga.tanggal_lahir })
      : null;
    const periodeAcuan = current.profileKehamilan || getLatestPregnancyProfile(current.kunjungan.warga.profileKehamilan || []);
    const periode = tentukanPeriodePemeriksaan(current.kategori_sasaran, current.tanggal, periodeAcuan);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data plotting pemeriksaan Step 3.",
      data: {
        pemeriksaan_id: current.id,
        kategori_sasaran: current.kategori_sasaran,
        usia_bulan: current.usia_bulan,
        tanggal: current.tanggal,
        periode,
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

    if (kategoriInput !== undefined && !VALID_KATEGORI.includes(kategoriInput)) {
      return res.status(400).json({ success: false, message: `Kategori tidak valid. Harus salah satu dari: ${VALID_KATEGORI.join(", ")}` });
    }

    const measurementError = getMeasurementError(req.body);
    if (measurementError) return res.status(400).json({ success: false, message: measurementError });

    const { kunjungan, pemeriksaan, created, tglPemeriksaan, totalMonths, kategoriFix } = await preparePemeriksaanContext(kunjungan_id, req.user, tanggal);

    const kategoriAkhir = kategoriFix;

    // Pengecekan Skrining Tahunan (Khusus Dewasa & Lansia)
    let isTahunanFix = false;
    if (["dewasa", "lansia"].includes(kategoriAkhir)) {
      const targetYear = new Date(tglPemeriksaan).getFullYear();
      const sudahSkriningTahunIni = await checkSudahSkriningTahunan(kunjungan.warga_id, targetYear, pemeriksaan.id);

      if (is_skrining_tahunan && !sudahSkriningTahunIni) {
        isTahunanFix = true;
      }
    }

    // Format & Sanitasi Payload JSONB detail_skrining
    const screeningError = getScreeningError(kategoriAkhir, detail_skrining);
    if (screeningError) return res.status(400).json({ success: false, message: screeningError });
    const formattedSkrining = formatDetailSkrining(kategoriAkhir, detail_skrining, isTahunanFix, pemeriksaan.detail_skrining);
    const scoredSkrining = finalizeScreeningScores(kategoriAkhir, formattedSkrining, kunjungan.warga, {
      pumaProvided: Boolean(detail_skrining?.skrining_ppok_puma),
      aksProvided: Boolean(detail_skrining?.aks_aktifitas_harian),
      skilasProvided: Boolean(detail_skrining?.skilas),
      jiwaProvided: Boolean(detail_skrining?.skrining_kesehatan_jiwa),
    });
    if (scoredSkrining.errors.length) return res.status(400).json({ success: false, message: scoredSkrining.errors.join(" ") });

    // Update Data Pemeriksaan ke DB (Upsert Safe)
    const oldValue = created ? null : pemeriksaanAuditSnapshot(pemeriksaan);
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
      detail_skrining: scoredSkrining.detail,
      topik_penyuluhan: topik_penyuluhan || null,
      is_perlu_rujukan: is_perlu_rujukan ?? false,
    });

    // Update status kunjungan ke langkah 5 (Selesai)
    await kunjungan.update({ status_langkah: "langkah_5" });

    await createAuditLog({
      userId: req.user?.id ?? null,
      action: created ? AUDIT_ACTIONS.PEMERIKSAAN_CREATE : AUDIT_ACTIONS.PEMERIKSAAN_UPDATE,
      tableName: "pemeriksaan",
      recordId: pemeriksaan.id,
      oldValue,
      newValue: pemeriksaanAuditSnapshot(pemeriksaan),
    });

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

    const measurementError = getMeasurementError(req.body);
    if (measurementError) return res.status(400).json({ success: false, message: measurementError });

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

    const screeningError = getScreeningError(kategoriFix, detail_skrining);
    if (screeningError) return res.status(400).json({ success: false, message: screeningError });

    // Pengecekan Skrining Tahunan
    let isTahunanFix = false;
    if (["dewasa", "lansia"].includes(kategoriFix)) {
      const targetYear = new Date(tglPemeriksaan).getFullYear();
      const sudahSkriningTahunIni = await checkSudahSkriningTahunan(kunjungan.warga_id, targetYear, pemeriksaan.id);

      if (is_skrining_tahunan && !sudahSkriningTahunIni) {
        isTahunanFix = true;
      }
    }

    const formattedSkrining = formatDetailSkrining(kategoriFix, detail_skrining, isTahunanFix, pemeriksaan.detail_skrining);
    const scoredSkrining = finalizeScreeningScores(kategoriFix, formattedSkrining, kunjungan.warga, {
      pumaProvided: Boolean(detail_skrining?.skrining_ppok_puma),
      aksProvided: Boolean(detail_skrining?.aks_aktifitas_harian),
      skilasProvided: Boolean(detail_skrining?.skilas),
      jiwaProvided: Boolean(detail_skrining?.skrining_kesehatan_jiwa),
    });
    if (scoredSkrining.errors.length) return res.status(400).json({ success: false, message: scoredSkrining.errors.join(" ") });

    await pemeriksaan.update({
      profile_kehamilan_id: profile_kehamilan_id !== undefined ? profile_kehamilan_id : pemeriksaan.profile_kehamilan_id,
      detail_skrining: scoredSkrining.detail,
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
  let transaction = null;
  try {
    const { kunjungan_id, topik_penyuluhan, is_perlu_rujukan, alasan_rujukan } = req.body;

    transaction = await Pemeriksaan.sequelize.transaction();

    const { kunjungan, pemeriksaan } = await preparePemeriksaanContext(kunjungan_id, req.user, null, transaction);
    const screeningReasons = getScreeningReferralReasons(pemeriksaan.detail_skrining);
    const keputusanRujukan = is_perlu_rujukan !== undefined ? is_perlu_rujukan : screeningReasons.length > 0;
    const oldReferral = await Rujukan.findOne({ where: { pemeriksaan_id: pemeriksaan.id }, transaction });
    let referral = null;

    if (keputusanRujukan) {
      const alasan = screeningReasons.length > 0 ? screeningReasons.join("; ") : String(alasan_rujukan || "").trim();
      if (!alasan) {
        await transaction.rollback();
        transaction = null;
        return res.status(400).json({ success: false, message: "alasan_rujukan wajib diisi jika rujukan dipilih tanpa trigger screening." });
      }

      const puskesmasId = kunjungan.warga?.posyandu?.puskesmas_id;
      if (!puskesmasId) {
        await transaction.rollback();
        transaction = null;
        return res.status(400).json({ success: false, message: "Puskesmas warga tidak ditemukan." });
      }

      referral = oldReferral;
      const referralPayload = {
        warga_id: kunjungan.warga_id,
        pemeriksaan_id: pemeriksaan.id,
        puskesmas_id: puskesmasId,
        kader_id: req.user?.id,
        tanggal_rujukan: new Date(),
        alasan_rujukan: alasan,
      };
      if (referral) await referral.update(referralPayload, { transaction });
      else referral = await Rujukan.create(referralPayload, { transaction });
    } else {
      referral = oldReferral;
      if (referral) {
        await referral.destroy({ transaction });
        referral = null;
      }
    }

    await pemeriksaan.update(
      {
        topik_penyuluhan: topik_penyuluhan !== undefined ? topik_penyuluhan : pemeriksaan.topik_penyuluhan,
        is_perlu_rujukan: keputusanRujukan,
      },
      { transaction },
    );

    // Tandai status pemeriksaan kunjungan selesai
    await kunjungan.update({ status_langkah: "langkah_5" }, { transaction });

    await transaction.commit();
    transaction = null;

    if (!oldReferral && referral) {
      await createAuditLog({ userId: req.user?.id ?? null, action: AUDIT_ACTIONS.RUJUKAN_CREATE, tableName: "rujukan", recordId: referral.id, oldValue: null, newValue: rujukanAuditSnapshot(referral) });
    } else if (oldReferral && referral) {
      await createAuditLog({ userId: req.user?.id ?? null, action: AUDIT_ACTIONS.RUJUKAN_UPDATE, tableName: "rujukan", recordId: referral.id, oldValue: rujukanAuditSnapshot(oldReferral), newValue: rujukanAuditSnapshot(referral) });
    } else if (oldReferral && !referral) {
      await createAuditLog({ userId: req.user?.id ?? null, action: AUDIT_ACTIONS.RUJUKAN_DELETE, tableName: "rujukan", recordId: oldReferral.id, oldValue: rujukanAuditSnapshot(oldReferral), newValue: null });
    }

    return res.status(200).json({
      success: true,
      message: "Data edukasi & rujukan (Step 5) berhasil disimpan. Pemeriksaan Selesai.",
      data: pemeriksaan,
      rujukan: referral,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
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
  let transaction = null;
  try {
    const { id } = req.params;
    const {
      kategori_sasaran,
      tanggal,
      is_skrining_tahunan,
      bb_kg,
      tb_cm,
      lingkar_kepala_cm,
      lila_cm,
      lingkar_perut_cm,
      td_sistole,
      td_diastole,
      kadar_gula,
      detail_skrining,
      topik_penyuluhan,
      is_perlu_rujukan,
      alasan_rujukan,
      profile_kehamilan_id,
    } = req.body;

    transaction = await Pemeriksaan.sequelize.transaction();
    const pemeriksaan = await Pemeriksaan.findByPk(id, {
      transaction,
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
              include: [
                { model: ProfileKehamilan, as: "profileKehamilan", required: false },
                { model: Posyandu, as: "posyandu", required: true, attributes: ["id", "puskesmas_id"] },
              ],
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
    const measurementError = getMeasurementError(req.body);
    if (measurementError) return res.status(400).json({ success: false, message: measurementError });
    if (tanggal && pemeriksaan.kunjungan?.warga?.tanggal_lahir) {
      const { totalMonths } = hitungUmur(pemeriksaan.kunjungan.warga.tanggal_lahir, targetTanggal);
      updatedUsiaBulan = totalMonths;
    }

    const kategoriAktif = tentukanKategoriAktif(pemeriksaan.kunjungan.warga.tanggal_lahir, pemeriksaan.kunjungan.warga.profileKehamilan, targetTanggal);

    // Format ulang detail_skrining jika ada update payload JSONB
    let updatedDetailSkrining = pemeriksaan.detail_skrining;
    if (detail_skrining !== undefined || is_skrining_tahunan !== undefined) {
      const screeningInput = detail_skrining !== undefined ? detail_skrining : pemeriksaan.detail_skrining || {};
      const screeningError = getScreeningError(kategoriAktif, screeningInput);
      if (screeningError) return res.status(400).json({ success: false, message: screeningError });
      let isTahunan = false;
      if (["dewasa", "lansia"].includes(kategoriAktif) && (is_skrining_tahunan ?? pemeriksaan.detail_skrining?.is_skrining_tahunan)) {
        const targetYear = new Date(targetTanggal).getFullYear();
        const sudahSkriningTahunIni = await checkSudahSkriningTahunan(pemeriksaan.kunjungan.warga_id, targetYear, pemeriksaan.id);
        isTahunan = !sudahSkriningTahunIni;
      }

      updatedDetailSkrining = formatDetailSkrining(kategoriAktif, screeningInput, isTahunan, pemeriksaan.detail_skrining);
      const scoredSkrining = finalizeScreeningScores(kategoriAktif, updatedDetailSkrining, pemeriksaan.kunjungan.warga, {
        pumaProvided: Boolean(screeningInput?.skrining_ppok_puma),
        aksProvided: Boolean(screeningInput?.aks_aktifitas_harian),
        skilasProvided: Boolean(screeningInput?.skilas),
        jiwaProvided: Boolean(screeningInput?.skrining_kesehatan_jiwa),
      });
      if (scoredSkrining.errors.length) return res.status(400).json({ success: false, message: scoredSkrining.errors.join(" ") });
      updatedDetailSkrining = scoredSkrining.detail;
    }

    const oldValue = pemeriksaanAuditSnapshot(pemeriksaan);
    const oldReferral = await Rujukan.findOne({ where: { pemeriksaan_id: pemeriksaan.id }, transaction });
    const referralDecision = is_perlu_rujukan !== undefined ? is_perlu_rujukan : pemeriksaan.is_perlu_rujukan;
    let referral = oldReferral;

    await pemeriksaan.update(
      {
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
        is_perlu_rujukan: referralDecision,
      },
      { transaction },
    );

    if (referralDecision) {
      const screeningReasons = getScreeningReferralReasons(updatedDetailSkrining);
      const referralReason = screeningReasons.length > 0 ? screeningReasons.join("; ") : String(alasan_rujukan || oldReferral?.alasan_rujukan || "").trim();
      if (!referralReason) {
        const error = new Error("alasan_rujukan wajib diisi jika rujukan dipilih tanpa trigger screening.");
        error.statusCode = 400;
        throw error;
      }

      const puskesmasId = pemeriksaan.kunjungan?.warga?.posyandu?.puskesmas_id;
      if (!puskesmasId) {
        const error = new Error("Puskesmas warga tidak ditemukan.");
        error.statusCode = 400;
        throw error;
      }

      const referralPayload = {
        warga_id: pemeriksaan.kunjungan.warga_id,
        pemeriksaan_id: pemeriksaan.id,
        puskesmas_id: puskesmasId,
        kader_id: req.user?.id,
        tanggal_rujukan: oldReferral?.tanggal_rujukan || new Date(),
        alasan_rujukan: referralReason,
      };
      if (referral) await referral.update(referralPayload, { transaction });
      else referral = await Rujukan.create(referralPayload, { transaction });
    } else if (referral) {
      await referral.destroy({ transaction });
      referral = null;
    }

    await transaction.commit();
    transaction = null;

    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.PEMERIKSAAN_UPDATE,
      tableName: "pemeriksaan",
      recordId: pemeriksaan.id,
      oldValue,
      newValue: pemeriksaanAuditSnapshot(pemeriksaan),
    });

    if (!oldReferral && referral) {
      await createAuditLog({ userId: req.user?.id ?? null, action: AUDIT_ACTIONS.RUJUKAN_CREATE, tableName: "rujukan", recordId: referral.id, oldValue: null, newValue: rujukanAuditSnapshot(referral) });
    } else if (oldReferral && referral) {
      await createAuditLog({ userId: req.user?.id ?? null, action: AUDIT_ACTIONS.RUJUKAN_UPDATE, tableName: "rujukan", recordId: referral.id, oldValue: rujukanAuditSnapshot(oldReferral), newValue: rujukanAuditSnapshot(referral) });
    } else if (oldReferral && !referral) {
      await createAuditLog({ userId: req.user?.id ?? null, action: AUDIT_ACTIONS.RUJUKAN_DELETE, tableName: "rujukan", recordId: oldReferral.id, oldValue: rujukanAuditSnapshot(oldReferral), newValue: null });
    }

    return res.status(200).json({
      success: true,
      message: "Data pemeriksaan berhasil diperbarui.",
      data: pemeriksaan,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
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

    const oldValue = pemeriksaanAuditSnapshot(pemeriksaan);
    await pemeriksaan.destroy();

    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.PEMERIKSAAN_DELETE,
      tableName: "pemeriksaan",
      recordId: id,
      oldValue,
      newValue: null,
    });

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
