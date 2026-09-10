const { KunjunganPosyandu, SesiPosyandu, Warga, Posyandu, Pemeriksaan } = require("../models");
const { Op } = require("sequelize");

/**
 * 1. STEP 1: PENDAFTARAN / PRESENSI WARGA DATANG
 * Endpoint: POST /api/kunjungan
 */
const createKunjungan = async (req, res, next) => {
  try {
    const { warga_id, sesi_posyandu_id } = req.body;

    // 1. Validasi Keberadaan Sesi Posyandu & Status Wajib 'open'
    const sesi = await SesiPosyandu.findByPk(sesi_posyandu_id);
    if (!sesi) {
      return res.status(404).json({
        success: false,
        message: "Sesi Posyandu tidak ditemukan.",
      });
    }

    if (sesi.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Pendaftaran gagal. Sesi Posyandu ini sudah ditutup (closed).",
      });
    }

    // 2. Validasi Keberadaan Warga
    const warga = await Warga.findByPk(warga_id);
    if (!warga) {
      return res.status(404).json({
        success: false,
        message: "Data Warga tidak ditemukan.",
      });
    }

    // 3. Cek Apakah Warga Sudah Terdaftar di Sesi Ini (Cegah Double Registration)
    const kunjunganEksis = await KunjunganPosyandu.findOne({
      where: {
        warga_id,
        sesi_posyandu_id,
      },
    });

    if (kunjunganEksis) {
      return res.status(400).json({
        success: false,
        message: `Warga [${warga.nama_lengkap}] sudah terdaftar pada sesi ini dengan Nomor Antrean: ${kunjunganEksis.nomor_antrean}`,
        data: kunjunganEksis,
      });
    }

    // 4. Hitung Auto-Increment Nomor Antrean per Sesi (Format: A-001, A-002, dst.)
    const totalKunjunganSesi = await KunjunganPosyandu.count({
      where: { sesi_posyandu_id },
    });

    const nextNumber = totalKunjunganSesi + 1;
    const nomorAntreanFormatted = `A-${String(nextNumber).padStart(3, "0")}`;

    // 5. Buat Record Kunjungan Baru (Default Status = langkah_1)
    const newKunjungan = await KunjunganPosyandu.create({
      warga_id,
      sesi_posyandu_id,
      nomor_antrean: nomorAntreanFormatted,
      status_langkah: "langkah_1",
    });

    return res.status(201).json({
      success: true,
      message: `Berhasil mendaftarkan [${warga.nama_lengkap}] ke Step 1 (Meja Pendaftaran).`,
      data: {
        kunjungan_id: newKunjungan.id,
        nomor_antrean: newKunjungan.nomor_antrean,
        status_langkah: newKunjungan.status_langkah,
        warga: {
          id: warga.id,
          nama_lengkap: warga.nama_lengkap,
          nik: warga.nik,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. GET ANTREAN HARI INI / SESI AKTIF
 * Khusus dipakai Frontend untuk Dropdown Pilihan Warga di Step 2, Step 4, & Step 5
 * Endpoint: GET /api/kunjungan/antrean-hari-ini
 */
const getAntreanHariIni = async (req, res, next) => {
  try {
    const { sesi_posyandu_id, search } = req.query;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const whereCondition = {
      created_at: {
        [Op.between]: [startOfDay, endOfDay],
      },
    };

    if (sesi_posyandu_id) {
      whereCondition.sesi_posyandu_id = sesi_posyandu_id;
    }

    const wargaWhere = {};
    if (search) {
      wargaWhere[Op.or] = [{ nama_lengkap: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
    }

    const antrean = await KunjunganPosyandu.findAll({
      where: whereCondition,
      attributes: ["id", "nomor_antrean", "status_langkah", "created_at"],
      include: [
        {
          model: Warga,
          as: "warga",
          where: Object.keys(wargaWhere).length > 0 ? wargaWhere : undefined,
          attributes: ["id", "nama_lengkap", "nik", "tanggal_lahir", "jenis_kelamin"],
        },
        {
          model: Pemeriksaan,
          as: "pemeriksaan",
          attributes: ["id", "kategori_sasaran", "bb_kg", "tb_cm"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Daftar antrean aktif berhasil dimuat.",
      data: antrean,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. GET ALL KUNJUNGAN
 * Menampilkan seluruh riwayat kunjungan dengan pagination & filter
 * Endpoint: GET /api/kunjungan
 */
const getAllKunjungan = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sesi_posyandu_id, status_langkah, start_date, end_date } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {};

    if (sesi_posyandu_id) whereCondition.sesi_posyandu_id = sesi_posyandu_id;
    if (status_langkah) whereCondition.status_langkah = status_langkah;

    if (start_date && end_date) {
      whereCondition.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    const wargaWhere = {};
    if (search) {
      wargaWhere[Op.or] = [{ nama_lengkap: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
    }

    const { count, rows } = await KunjunganPosyandu.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Warga,
          as: "warga",
          where: Object.keys(wargaWhere).length > 0 ? wargaWhere : undefined,
          attributes: ["id", "nik", "nama_lengkap", "tanggal_lahir", "jenis_kelamin"],
          include: [{ model: Posyandu, as: "posyandu", attributes: ["id", "nama_posyandu"] }],
        },
        {
          model: SesiPosyandu,
          as: "sesiPosyandu",
          attributes: ["id", "tanggal_pelaksanaan", "status"],
        },
        {
          model: Pemeriksaan,
          as: "pemeriksaan",
          attributes: ["id", "kategori_sasaran", "bb_kg", "tb_cm", "is_perlu_rujukan"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data riwayat kunjungan.",
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
 * 4. GET KUNJUNGAN BY ID
 * Endpoint: GET /api/kunjungan/:id
 */
const getKunjunganById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const kunjungan = await KunjunganPosyandu.findByPk(id, {
      include: [
        {
          model: Warga,
          as: "warga",
          attributes: ["id", "nik", "nama_lengkap", "tanggal_lahir", "jenis_kelamin"],
          include: [{ model: Posyandu, as: "posyandu", attributes: ["id", "nama_posyandu"] }],
        },
        {
          model: SesiPosyandu,
          as: "sesiPosyandu",
          attributes: ["id", "tanggal_pelaksanaan", "status"],
        },
        {
          model: Pemeriksaan,
          as: "pemeriksaan",
        },
      ],
    });

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: "Data kunjungan tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail kunjungan.",
      data: kunjungan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. UPDATE STATUS LANGKAH KUNJUNGAN
 * Digunakan jika kader ingin memindahkan posisi antrean secara manual
 * Endpoint: PATCH /api/kunjungan/:id/status-langkah
 */
const updateStatusLangkah = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status_langkah } = req.body;

    const validLangkah = ["langkah_1", "langkah_2", "langkah_3", "langkah_4", "langkah_5"];
    if (!validLangkah.includes(status_langkah)) {
      return res.status(400).json({
        success: false,
        message: `Status langkah tidak valid. Pilihan: ${validLangkah.join(", ")}`,
      });
    }

    const kunjungan = await KunjunganPosyandu.findByPk(id);
    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: "Data kunjungan tidak ditemukan.",
      });
    }

    await kunjungan.update({ status_langkah });

    return res.status(200).json({
      success: true,
      message: `Status langkah kunjungan diperbarui menjadi [${status_langkah}].`,
      data: kunjungan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. DELETE KUNJUNGAN (BATAL PENDAFTARAN)
 * Endpoint: DELETE /api/kunjungan/:id
 */
const deleteKunjungan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const kunjungan = await KunjunganPosyandu.findByPk(id, {
      include: [{ model: SesiPosyandu, as: "sesiPosyandu" }],
    });

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: "Data kunjungan tidak ditemukan.",
      });
    }

    // Kader tidak bisa menghapus jika sesi sudah closed
    if (kunjungan.sesiPosyandu?.status === "closed" && req.user?.role === "kader") {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat membatalkan kunjungan karena sesi Posyandu sudah ditutup.",
      });
    }

    await kunjungan.destroy();

    return res.status(200).json({
      success: true,
      message: "Data kunjungan / pendaftaran berhasil dibatalkan.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createKunjungan,
  getAntreanHariIni,
  getAllKunjungan,
  getKunjunganById,
  updateStatusLangkah,
  deleteKunjungan,
};
