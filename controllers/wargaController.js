const { Warga, Posyandu, Puskesmas, KunjunganPosyandu, Pemeriksaan, ProfileKehamilan } = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const { tentukanKategori, tentukanKategoriAktif, hitungUmur, hitungRekapSasaran } = require("../utils/kategoriHelper");
const { canAccessPosyandu, getPosyanduInclude } = require("../utils/posyanduAccessHelper");

// 9 Kategori Sasaran Resmi ILP
const VALID_KATEGORI = ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"];

const VALID_STATUS_DOMISILI = ["aktif", "pindah", "meninggal"];
const VALID_JENIS_KELAMIN = ["L", "P"];
const VALID_STATUS_PERKAWINAN = ["menikah", "tidak_menikah"];
const isValidNik = (nik) => /^\d{16}$/.test(String(nik || ""));
const isUniqueConstraintError = (error) => error?.name === "SequelizeUniqueConstraintError";

const assertKaderMutationTarget = async (req, res) => {
  if (req.user?.role !== "kader" || !req.user.posyandu_id) {
    res.status(403).json({ success: false, message: "Hanya kader dengan Posyandu tujuan yang dapat melakukan mutasi warga." });
    return null;
  }

  const destination = await Posyandu.findByPk(req.user.posyandu_id);
  if (!destination || !canAccessPosyandu(req.user, destination)) {
    res.status(403).json({ success: false, message: "Posyandu tujuan tidak valid atau di luar scope Anda." });
    return null;
  }
  return destination;
};

const verifyMutasiWarga = async (req, res, next) => {
  try {
    const destination = await assertKaderMutationTarget(req, res);
    if (!destination) return;

    const { nik, nama_lengkap, nama_ibu } = req.body;
    const warga = await Warga.findOne({
      where: { nik, nama_lengkap: { [Op.iLike]: nama_lengkap }, nama_ibu: { [Op.iLike]: nama_ibu } },
      include: [{ model: Posyandu, as: "posyandu", attributes: ["id", "nama_posyandu", "puskesmas_id"] }],
    });

    if (!warga) return res.status(404).json({ success: false, message: "Data warga tidak cocok dengan NIK, nama lengkap, dan nama ibu." });
    return res.status(200).json({
      success: true,
      message: "Data warga ditemukan. Silakan konfirmasi mutasi.",
      data: {
        id: warga.id,
        nik: warga.nik,
        nama_lengkap: warga.nama_lengkap,
        nama_ibu: warga.nama_ibu,
        posyandu_saat_ini: warga.posyandu,
        posyandu_tujuan: { id: destination.id, nama_posyandu: destination.nama_posyandu, puskesmas_id: destination.puskesmas_id },
      },
    });
  } catch (error) {
    next(error);
  }
};

const confirmMutasiWarga = async (req, res, next) => {
  const transaction = await Warga.sequelize.transaction();
  try {
    const destination = await assertKaderMutationTarget(req, res);
    if (!destination) {
      await transaction.rollback();
      return;
    }

    const { warga_id, nik, nama_lengkap, nama_ibu } = req.body;
    const warga = await Warga.findOne({
      where: {
        id: warga_id,
        nik,
        nama_lengkap: { [Op.iLike]: nama_lengkap },
        nama_ibu: { [Op.iLike]: nama_ibu },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!warga) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Data warga tidak cocok dengan NIK, nama lengkap, dan nama ibu." });
    }

    const previousPosyanduId = warga.posyandu_id;
    if (Number(previousPosyanduId) !== Number(destination.id)) await warga.update({ posyandu_id: destination.id }, { transaction });
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: Number(previousPosyanduId) === Number(destination.id) ? "Warga sudah berada di Posyandu ini." : "Warga berhasil dimutasi ke Posyandu tujuan.",
      data: { id: warga.id, nik: warga.nik, nama_lengkap: warga.nama_lengkap, posyandu_id: warga.posyandu_id },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * HELPER INTERNAL: Scoping Hak Akses Berdasarkan Role (Kader, Puskesmas, Dinkes, SA)
 */
const getRoleScope = (req) => {
  const user = req.user || {};
  const role = user.role;
  const wargaWhere = {};
  const posyanduWhere = {};

  if (role === "kader") {
    wargaWhere.posyandu_id = user.posyandu_id;
  } else if (role === "puskesmas" || role === "puskesmasAdmin") {
    posyanduWhere.puskesmas_id = user.puskesmas_id;
  } else if (role === "dinkes" || role === "sa") {
  }

  return { wargaWhere, posyanduWhere, role, user };
};

/**
 * 1. GET ALL WARGA / SASARAN
 */
const getAllWarga = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, posyandu_id, jenis_kelamin, kategori_sasaran, category, status_domisili = "aktif", rt, rw } = req.query;
    const activeCategoryFilter = category || kategori_sasaran;

    const offset = (page - 1) * limit;
    const { wargaWhere, posyanduWhere, role } = getRoleScope(req);

    // Filter status domisili (default: 'aktif')
    if (status_domisili && status_domisili !== "all") {
      wargaWhere.status_domisili = status_domisili;
    }

    // Filter posyandu_id khusus role selain kader
    if (posyandu_id && role !== "kader") {
      wargaWhere.posyandu_id = posyandu_id;
    }

    if (jenis_kelamin) wargaWhere.jenis_kelamin = jenis_kelamin;
    if (rt) wargaWhere.rt = rt;
    if (rw) wargaWhere.rw = rw;

    if (search) {
      wargaWhere[Op.or] = [{ nama_lengkap: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
    }

    const { count, rows } = await Warga.findAndCountAll({
      where: wargaWhere,
      limit: activeCategoryFilter ? undefined : parseInt(limit, 10),
      offset: activeCategoryFilter ? undefined : parseInt(offset, 10),
      order: [["nama_lengkap", "ASC"]],
      include: [
        {
          model: Posyandu,
          as: "posyandu",
          where: Object.keys(posyanduWhere).length > 0 ? posyanduWhere : undefined,
          attributes: ["id", "nama_posyandu", "alamat", "puskesmas_id"],
        },
        {
          model: ProfileKehamilan,
          as: "profileKehamilan",
          required: false,
          separate: true,
          order: [["id", "DESC"]],
        },
      ],
    });

    // Kalkulasi umur & kategori ILP dinamis
    const formattedRows = rows.map((w) => {
      const plainWarga = w.get({ plain: true });
      const { umurText, totalMonths, totalYears } = hitungUmur(plainWarga.tanggal_lahir);
      const kategoriDinamis = tentukanKategoriAktif(plainWarga.tanggal_lahir, plainWarga.profileKehamilan);

      return {
        ...plainWarga,
        umur_text: umurText,
        usia_bulan: totalMonths,
        usia_tahun: totalYears,
        kategori_sasaran_saat_ini: kategoriDinamis,
      };
    });

    // Saring filter kategori_sasaran jika dikirim dari frontend
    let filteredResult = formattedRows;
    if (activeCategoryFilter) {
      if (!VALID_KATEGORI.includes(activeCategoryFilter)) {
        return res.status(400).json({
          success: false,
          message: `Kategori sasaran tidak valid. Pilihan: ${VALID_KATEGORI.join(", ")}`,
        });
      }
      filteredResult = formattedRows.filter((item) => item.kategori_sasaran_saat_ini === activeCategoryFilter);
    }

    const paginatedResult = activeCategoryFilter ? filteredResult.slice(offset, offset + parseInt(limit, 10)) : filteredResult;

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data warga / sasaran.",
      data: paginatedResult,
      pagination: {
        total_items: activeCategoryFilter ? filteredResult.length : count,
        total_pages: Math.ceil((activeCategoryFilter ? filteredResult.length : count) / limit),
        current_page: parseInt(page, 10),
        items_per_page: parseInt(limit, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. GET WARGA BY ID
 */
const getWargaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { wargaWhere, posyanduWhere } = getRoleScope(req);

    const warga = await Warga.findOne({
      where: { id, ...wargaWhere },
      include: [
        {
          model: Posyandu,
          as: "posyandu",
          where: Object.keys(posyanduWhere).length > 0 ? posyanduWhere : undefined,
          attributes: ["id", "nama_posyandu", "alamat", "puskesmas_id"],
        },
        {
          model: ProfileKehamilan,
          as: "profileKehamilan",
          required: false,
        },
        {
          model: KunjunganPosyandu,
          as: "kunjunganPosyandu",
          limit: 10,
          order: [["created_at", "DESC"]],
          include: [{ model: Pemeriksaan, as: "pemeriksaan" }],
        },
      ],
    });

    if (!warga) {
      return res.status(404).json({
        success: false,
        message: "Data warga tidak ditemukan atau Anda tidak memiliki hak akses.",
      });
    }

    const plainWarga = warga.get({ plain: true });
    const { umurText, totalMonths, totalYears } = hitungUmur(plainWarga.tanggal_lahir);
    const kategoriDinamis = tentukanKategoriAktif(plainWarga.tanggal_lahir, plainWarga.profileKehamilan);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail data warga.",
      data: {
        ...plainWarga,
        umur_text: umurText,
        usia_bulan: totalMonths,
        usia_tahun: totalYears,
        kategori_sasaran_saat_ini: kategoriDinamis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. CREATE WARGA (Kader / SA)
 */
const createWarga = async (req, res, next) => {
  try {
    const { role, user } = getRoleScope(req);

    if (role === "puskesmas" || role === "dinkes") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Role Puskesmas dan Dinkes hanya memiliki akses Read-Only.",
      });
    }

    const {
      nik,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      rt,
      rw,
      telepon,
      nama_ibu,
      nama_ayah,
      status_perkawinan,
      pekerjaan,
      pekerjaan_lainnya,
      posyandu_id: inputPosyanduId,
      bb_lahir_kg,
      tb_lahir_cm,
      status_domisili = "aktif",
    } = req.body;

    const posyanduTarget = role === "kader" ? user.posyandu_id : inputPosyanduId;

    if (!nik || !nama_lengkap || !tanggal_lahir || !jenis_kelamin || !posyanduTarget) {
      return res.status(400).json({
        success: false,
        message: "NIK, Nama Lengkap, Tanggal Lahir, Jenis Kelamin, dan Posyandu wajib diisi.",
      });
    }

    if (!isValidNik(nik)) {
      return res.status(400).json({ success: false, message: "NIK harus terdiri dari 16 digit angka." });
    }

    if (!VALID_JENIS_KELAMIN.includes(jenis_kelamin) || !VALID_STATUS_PERKAWINAN.includes(status_perkawinan || "tidak_menikah") || !VALID_STATUS_DOMISILI.includes(status_domisili)) {
      return res.status(400).json({
        success: false,
        message: "Nilai jenis kelamin, status perkawinan, atau status domisili tidak valid.",
      });
    }

    const posyanduEksis = await Posyandu.findByPk(posyanduTarget);
    if (!posyanduEksis || !canAccessPosyandu(req.user, posyanduEksis)) {
      return res.status(404).json({
        success: false,
        message: "Data Posyandu tidak ditemukan atau di luar scope Anda.",
      });
    }

    const nikEksis = await Warga.findOne({ where: { nik } });
    if (nikEksis) {
      return res.status(409).json({
        success: false,
        message: `NIK [${nik}] sudah terdaftar atas nama ${nikEksis.nama_lengkap}.`,
      });
    }

    const newWarga = await Warga.create({
      nik,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      alamat: alamat || null,
      rt: rt || null,
      rw: rw || null,
      telepon: telepon || null,
      nama_ibu: nama_ibu || null,
      nama_ayah: nama_ayah || null,
      status_perkawinan: status_perkawinan || "tidak_menikah",
      pekerjaan: pekerjaan || null,
      pekerjaan_lainnya: pekerjaan_lainnya || null,
      posyandu_id: posyanduTarget,
      bb_lahir_kg: bb_lahir_kg || null,
      tb_lahir_cm: tb_lahir_cm || null,
      status_domisili,
    });

    const { umurText } = hitungUmur(tanggal_lahir);

    return res.status(201).json({
      success: true,
      message: `Berhasil menambahkan data warga [${nama_lengkap}].`,
      data: {
        ...newWarga.toJSON(),
        umur_text: umurText,
        kategori_sasaran_estimasi: tentukanKategori(tanggal_lahir),
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return res.status(409).json({ success: false, message: "NIK sudah terdaftar." });
    next(error);
  }
};

/**
 * 4. UPDATE WARGA (Kader / SA)
 */
const updateWarga = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, user } = getRoleScope(req);

    if (role === "puskesmas" || role === "dinkes") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Role Puskesmas dan Dinkes hanya memiliki akses Read-Only.",
      });
    }

    const warga = await Warga.findOne({ where: { id }, include: [getPosyanduInclude(req.user)] });
    if (!warga) {
      return res.status(404).json({
        success: false,
        message: "Data warga tidak ditemukan.",
      });
    }

    if (role === "kader" && warga.posyandu_id !== user.posyandu_id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak mengubah data warga dari Posyandu lain.",
      });
    }

    const { nik, nama_lengkap, jenis_kelamin, tanggal_lahir, alamat, rt, rw, telepon, nama_ibu, nama_ayah, status_perkawinan, pekerjaan, pekerjaan_lainnya, bb_lahir_kg, tb_lahir_cm, status_domisili } = req.body;

    if (nik !== undefined && !isValidNik(nik)) {
      return res.status(400).json({ success: false, message: "NIK harus terdiri dari 16 digit angka." });
    }

    if (nik && nik !== warga.nik) {
      const nikEksis = await Warga.findOne({ where: { nik } });
      if (nikEksis) {
        return res.status(409).json({
          success: false,
          message: `NIK [${nik}] sudah digunakan oleh warga lain.`,
        });
      }
    }

    if (
      (jenis_kelamin !== undefined && !VALID_JENIS_KELAMIN.includes(jenis_kelamin)) ||
      (status_perkawinan !== undefined && !VALID_STATUS_PERKAWINAN.includes(status_perkawinan)) ||
      (status_domisili !== undefined && !VALID_STATUS_DOMISILI.includes(status_domisili))
    ) {
      return res.status(400).json({
        success: false,
        message: "Nilai jenis kelamin, status perkawinan, atau status domisili tidak valid.",
      });
    }

    await warga.update({
      nik: nik ?? warga.nik,
      nama_lengkap: nama_lengkap ?? warga.nama_lengkap,
      jenis_kelamin: jenis_kelamin ?? warga.jenis_kelamin,
      tanggal_lahir: tanggal_lahir ?? warga.tanggal_lahir,
      alamat: alamat ?? warga.alamat,
      rt: rt ?? warga.rt,
      rw: rw ?? warga.rw,
      telepon: telepon ?? warga.telepon,
      nama_ibu: nama_ibu ?? warga.nama_ibu,
      nama_ayah: nama_ayah ?? warga.nama_ayah,
      status_perkawinan: status_perkawinan ?? warga.status_perkawinan,
      pekerjaan: pekerjaan ?? warga.pekerjaan,
      pekerjaan_lainnya: pekerjaan_lainnya ?? warga.pekerjaan_lainnya,
      bb_lahir_kg: bb_lahir_kg ?? warga.bb_lahir_kg,
      tb_lahir_cm: tb_lahir_cm ?? warga.tb_lahir_cm,
      status_domisili: status_domisili ?? warga.status_domisili,
    });

    return res.status(200).json({
      success: true,
      message: "Data warga berhasil diperbarui.",
      data: warga,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return res.status(409).json({ success: false, message: "NIK sudah digunakan oleh warga lain." });
    next(error);
  }
};

/**
 * 5. UBAH STATUS DOMISILI (SOFT DELETE / NONAKTIFKAN WARGA)
 * Mengubah status_domisili ke ('aktif', 'pindah', 'meninggal')
 * Endpoint: PATCH /api/warga/:id/status-domisili
 */
const updateStatusDomisili = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status_domisili } = req.body;
    const { role, user } = getRoleScope(req);

    if (role === "puskesmas" || role === "dinkes") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Puskesmas dan Dinkes tidak dapat mengubah status warga.",
      });
    }

    if (!VALID_STATUS_DOMISILI.includes(status_domisili)) {
      return res.status(400).json({
        success: false,
        message: `Status domisili tidak valid. Pilihan: ${VALID_STATUS_DOMISILI.join(", ")}`,
      });
    }

    const warga = await Warga.findOne({ where: { id }, include: [getPosyanduInclude(req.user)] });
    if (!warga) {
      return res.status(404).json({
        success: false,
        message: "Data warga tidak ditemukan.",
      });
    }

    if (role === "kader" && warga.posyandu_id !== user.posyandu_id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah status warga ini.",
      });
    }

    await warga.update({ status_domisili });

    return res.status(200).json({
      success: true,
      message: `Status domisili warga [${warga.nama_lengkap}] berhasil diubah menjadi [${status_domisili}].`,
      data: {
        id: warga.id,
        nama_lengkap: warga.nama_lengkap,
        status_domisili: warga.status_domisili,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. EXPORT WARGA TO EXCEL
 */
const exportWargaExcel = async (req, res, next) => {
  try {
    const { posyandu_id, kategori_sasaran, category, status_domisili = "aktif", search } = req.query;
    const activeCategoryFilter = category || kategori_sasaran;
    const { wargaWhere, posyanduWhere, role } = getRoleScope(req);

    if (status_domisili && status_domisili !== "all") {
      wargaWhere.status_domisili = status_domisili;
    }

    if (posyandu_id && role !== "kader") {
      wargaWhere.posyandu_id = posyandu_id;
    }

    if (search) {
      wargaWhere[Op.or] = [{ nama_lengkap: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
    }

    const rows = await Warga.findAll({
      where: wargaWhere,
      order: [["nama_lengkap", "ASC"]],
      include: [
        {
          model: Posyandu,
          as: "posyandu",
          where: Object.keys(posyanduWhere).length > 0 ? posyanduWhere : undefined,
          attributes: ["id", "nama_posyandu", "alamat"],
        },
        {
          model: ProfileKehamilan,
          as: "profileKehamilan",
          required: false,
          separate: true,
          order: [["id", "DESC"]],
        },
      ],
    });

    let formattedData = rows.map((w) => {
      const plain = w.get({ plain: true });
      const { umurText } = hitungUmur(plain.tanggal_lahir);
      const kategori = tentukanKategoriAktif(plain.tanggal_lahir, plain.profileKehamilan);

      return {
        ...plain,
        umur_text: umurText,
        kategori_sasaran: kategori,
      };
    });

    if (activeCategoryFilter) {
      formattedData = formattedData.filter((item) => item.kategori_sasaran === activeCategoryFilter);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Sasaran Warga");

    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "NIK", key: "nik", width: 20 },
      { header: "Nama Lengkap", key: "nama_lengkap", width: 25 },
      { header: "JK", key: "jenis_kelamin", width: 8 },
      { header: "Tanggal Lahir", key: "tanggal_lahir", width: 15 },
      { header: "Usia", key: "umur_text", width: 18 },
      { header: "Kategori ILP", key: "kategori_sasaran", width: 18 },
      { header: "Telepon", key: "telepon", width: 15 },
      { header: "Pekerjaan", key: "pekerjaan", width: 15 },
      { header: "Status Perkawinan", key: "status_perkawinan", width: 18 },
      { header: "Posyandu", key: "nama_posyandu", width: 20 },
      { header: "RT / RW", key: "rtrw", width: 12 },
      { header: "Status Domisili", key: "status_domisili", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E40AF" },
    };

    formattedData.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        nik: item.nik,
        nama_lengkap: item.nama_lengkap,
        jenis_kelamin: item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
        tanggal_lahir: new Date(item.tanggal_lahir).toLocaleDateString("id-ID"),
        umur_text: item.umur_text,
        kategori_sasaran: item.kategori_sasaran.toUpperCase(),
        telepon: item.telepon || "-",
        pekerjaan: item.pekerjaan === "lainnya" ? item.pekerjaan_lainnya : item.pekerjaan || "-",
        status_perkawinan: item.status_perkawinan || "-",
        nama_posyandu: item.posyandu?.nama_posyandu || "-",
        rtrw: `${item.rt || "-"}/${item.rw || "-"}`,
        status_domisili: item.status_domisili.toUpperCase(),
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Data_Warga_ILP_${new Date().toISOString().split("T")[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * 7. STATISTIK SASARAN PER KATEGORI ILP
 */
const getStatistikSasaran = async (req, res, next) => {
  try {
    const { wargaWhere, posyanduWhere } = getRoleScope(req);
    wargaWhere.status_domisili = "aktif"; // Hanya hitung warga aktif

    const allWarga = await Warga.findAll({
      where: wargaWhere,
      attributes: ["id", "tanggal_lahir"],
      include: [
        {
          model: Posyandu,
          as: "posyandu",
          where: Object.keys(posyanduWhere).length > 0 ? posyanduWhere : undefined,
          attributes: ["id"],
        },
        {
          model: ProfileKehamilan,
          as: "profileKehamilan",
          required: false,
          separate: true,
          order: [["id", "DESC"]],
        },
      ],
    });

    const stats = hitungRekapSasaran(allWarga, new Date());

    return res.status(200).json({
      success: true,
      message: "Berhasil merekap statistik sasaran ILP.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyMutasiWarga,
  confirmMutasiWarga,
  getAllWarga,
  getWargaById,
  createWarga,
  updateWarga,
  updateStatusDomisili,
  exportWargaExcel,
  getStatistikSasaran,
};
