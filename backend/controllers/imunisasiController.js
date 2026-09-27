"use strict";

const { Imunisasi, Warga } = require("../models");
const { getPosyanduInclude } = require("../utils/posyanduAccessHelper");
const { createAuditLog, AUDIT_ACTIONS } = require("../utils/auditLogHelper");
const { IMUNISASI_MASTER, TEMPAT_IMUNISASI } = require("../middleware/validators/imunisasiValidators");

const getScopedWarga = (req, wargaId) =>
  Warga.findOne({
    where: { id: wargaId },
    include: [getPosyanduInclude(req.user)],
  });

const normalizeRecord = (record, fallbackGiven = true) => {
  const isDiberikan = record.is_diberikan === undefined ? fallbackGiven : Boolean(record.is_diberikan);
  if (!IMUNISASI_MASTER.includes(record.jenis_imunisasi)) throw Object.assign(new Error("jenis_imunisasi tidak termasuk master imunisasi."), { statusCode: 400 });
  if (isDiberikan && (!record.tanggal_imunisasi || !TEMPAT_IMUNISASI.includes(record.tempat))) {
    throw Object.assign(new Error("Imunisasi yang diberikan wajib memiliki tanggal dan tempat yang valid."), { statusCode: 400 });
  }
  if (!isDiberikan && (record.tanggal_imunisasi || record.tempat)) {
    throw Object.assign(new Error("Imunisasi yang belum diberikan tidak boleh memiliki tanggal atau tempat."), { statusCode: 400 });
  }
  return {
    jenis_imunisasi: record.jenis_imunisasi,
    is_diberikan: isDiberikan,
    tanggal_imunisasi: isDiberikan ? record.tanggal_imunisasi : null,
    tempat: isDiberikan ? record.tempat : null,
    no_batch: record.no_batch || null,
  };
};

const getImunisasiByWarga = async (req, res, next) => {
  try {
    const warga = await getScopedWarga(req, req.params.warga_id);
    if (!warga) return res.status(404).json({ success: false, message: "Data warga tidak ditemukan atau Anda tidak memiliki hak akses." });

    const data = await Imunisasi.findAll({
      where: { warga_id: warga.id },
      order: [
        ["tanggal_imunisasi", "DESC"],
        ["id", "DESC"],
      ],
    });
    return res.status(200).json({ success: true, message: "Berhasil mengambil data imunisasi warga.", data });
  } catch (error) {
    next(error);
  }
};

const getImunisasiById = async (req, res, next) => {
  try {
    const data = await Imunisasi.findByPk(req.params.id, {
      include: [{ model: Warga, as: "warga", include: [getPosyanduInclude(req.user)] }],
    });
    if (!data) return res.status(404).json({ success: false, message: "Data imunisasi tidak ditemukan atau Anda tidak memiliki hak akses." });
    return res.status(200).json({ success: true, message: "Berhasil mengambil detail imunisasi.", data });
  } catch (error) {
    next(error);
  }
};

const createImunisasi = async (req, res, next) => {
  try {
    const warga = await getScopedWarga(req, req.body.warga_id);
    if (!warga) return res.status(404).json({ success: false, message: "Data warga tidak ditemukan atau Anda tidak memiliki hak akses." });

    const data = await Imunisasi.create({ warga_id: warga.id, ...normalizeRecord(req.body) });
    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.IMUNISASI_CREATE,
      tableName: "imunisasi",
      recordId: data.id,
      oldValue: null,
      newValue: { id: data.id, warga_id: data.warga_id, jenis_imunisasi: data.jenis_imunisasi, is_diberikan: data.is_diberikan, tanggal_imunisasi: data.tanggal_imunisasi, tempat: data.tempat },
    });
    return res.status(201).json({ success: true, message: "Data imunisasi berhasil ditambahkan.", data });
  } catch (error) {
    next(error);
  }
};

const updateImunisasi = async (req, res, next) => {
  try {
    const data = await Imunisasi.findByPk(req.params.id, {
      include: [{ model: Warga, as: "warga", include: [getPosyanduInclude(req.user)] }],
    });
    if (!data) return res.status(404).json({ success: false, message: "Data imunisasi tidak ditemukan atau Anda tidak memiliki hak akses." });

    const payload = normalizeRecord(
      {
        jenis_imunisasi: req.body.jenis_imunisasi ?? data.jenis_imunisasi,
        is_diberikan: req.body.is_diberikan ?? data.is_diberikan,
        tanggal_imunisasi: req.body.tanggal_imunisasi ?? data.tanggal_imunisasi,
        tempat: req.body.tempat ?? data.tempat,
        no_batch: req.body.no_batch ?? data.no_batch,
      },
      Boolean(data.is_diberikan),
    );
    const oldValue = { jenis_imunisasi: data.jenis_imunisasi, is_diberikan: data.is_diberikan, tanggal_imunisasi: data.tanggal_imunisasi, tempat: data.tempat };
    await data.update(payload);
    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.IMUNISASI_UPDATE,
      tableName: "imunisasi",
      recordId: data.id,
      oldValue,
      newValue: { jenis_imunisasi: data.jenis_imunisasi, is_diberikan: data.is_diberikan, tanggal_imunisasi: data.tanggal_imunisasi, tempat: data.tempat },
    });
    return res.status(200).json({ success: true, message: "Data imunisasi berhasil diperbarui.", data });
  } catch (error) {
    next(error);
  }
};

const bulkUpsertImunisasi = async (req, res, next) => {
  let transaction;
  try {
    const warga = await getScopedWarga(req, req.body.warga_id);
    if (!warga) return res.status(404).json({ success: false, message: "Data warga tidak ditemukan atau Anda tidak memiliki hak akses." });

    transaction = await Imunisasi.sequelize.transaction();
    for (const row of req.body.imunisasi) {
      const payload = normalizeRecord(row, false);
      const existing = await Imunisasi.findOne({ where: { warga_id: warga.id, jenis_imunisasi: payload.jenis_imunisasi }, transaction });
      if (existing) {
        await existing.update(payload, { transaction });
      } else {
        await Imunisasi.create({ warga_id: warga.id, ...payload }, { transaction });
      }
    }
    await transaction.commit();

    const data = await Imunisasi.findAll({ where: { warga_id: warga.id }, order: [["id", "ASC"]], attributes: ["id", "warga_id", "jenis_imunisasi", "is_diberikan", "tanggal_imunisasi", "tempat", "no_batch", "created_at", "updated_at"] });
    return res.status(200).json({ success: true, message: "Data imunisasi Step 4 berhasil disimpan.", data });
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {});
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

module.exports = { createImunisasi, updateImunisasi, bulkUpsertImunisasi, getImunisasiByWarga, getImunisasiById };
