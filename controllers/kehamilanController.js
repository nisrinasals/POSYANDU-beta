"use strict";

const { ProfileKehamilan, Warga, Posyandu } = require("../models");
const { getPosyanduInclude } = require("../utils/posyanduAccessHelper");
const { createAuditLog, AUDIT_ACTIONS } = require("../utils/auditLogHelper");
const { validateHphtAgainstDate } = require("../utils/pregnancyHelper");

const VALID_STATUS = ["hamil", "nifas", "menyusui", "selesai"];

const validatePregnancyCombination = (payload, current = {}) => {
  const status = payload.status_kehamilan ?? current.status_kehamilan;
  const isMenyusui = payload.is_menyusui ?? current.is_menyusui ?? false;
  const hpht = payload.hpht ?? current.hpht;
  const hpl = payload.hpl ?? current.hpl;
  const tanggalPersalinan = payload.tanggal_persalinan ?? current.tanggal_persalinan;

  if (!VALID_STATUS.includes(status)) return "status_kehamilan tidak valid.";
  if (isMenyusui && status !== "menyusui") return "is_menyusui hanya dapat bernilai true saat status kehamilan menyusui.";
  if (status === "menyusui" && !isMenyusui) return "is_menyusui harus bernilai true saat status kehamilan menyusui.";
  if (["nifas", "menyusui"].includes(status) && !tanggalPersalinan) return "tanggal_persalinan wajib diisi untuk status nifas atau menyusui.";
  if (status === "hamil" && tanggalPersalinan) return "tanggal_persalinan harus kosong saat status kehamilan hamil.";
  const hphtError = validateHphtAgainstDate(hpht, payload.tanggal_pemeriksaan || new Date());
  if (hphtError) return hphtError;

  if (hpht && hpl && new Date(hpl) < new Date(hpht)) return "hpl tidak boleh lebih awal dari hpht.";
  if (hpht && tanggalPersalinan && new Date(tanggalPersalinan) < new Date(hpht)) return "tanggal_persalinan tidak boleh lebih awal dari hpht.";

  return null;
};

const getScopedWarga = (req, wargaId) => {
  return Warga.findOne({
    where: { id: wargaId },
    include: [getPosyanduInclude(req.user)],
  });
};

const getKehamilanByWarga = async (req, res, next) => {
  try {
    const warga = await getScopedWarga(req, req.params.warga_id);
    if (!warga) {
      return res.status(404).json({ success: false, message: "Data warga tidak ditemukan atau Anda tidak memiliki hak akses." });
    }

    const data = await ProfileKehamilan.findAll({
      where: { warga_id: warga.id },
      include: [{ model: Warga, as: "warga", attributes: ["id", "nik", "nama_lengkap"] }],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({ success: true, message: "Berhasil mengambil data kehamilan warga.", data });
  } catch (error) {
    next(error);
  }
};

const getKehamilanById = async (req, res, next) => {
  try {
    const data = await ProfileKehamilan.findByPk(req.params.id, {
      include: [
        {
          model: Warga,
          as: "warga",
          attributes: ["id", "nik", "nama_lengkap", "tanggal_lahir", "posyandu_id"],
          include: [{ model: Posyandu, as: "posyandu", attributes: ["id", "nama_posyandu", "puskesmas_id"] }],
        },
      ],
    });

    if (!data || !(await getScopedWarga(req, data.warga_id))) {
      return res.status(404).json({ success: false, message: "Data kehamilan tidak ditemukan atau Anda tidak memiliki hak akses." });
    }

    return res.status(200).json({ success: true, message: "Berhasil mengambil detail data kehamilan.", data });
  } catch (error) {
    next(error);
  }
};

const createKehamilan = async (req, res, next) => {
  try {
    const warga = await getScopedWarga(req, req.body.warga_id);
    if (!warga) {
      return res.status(404).json({ success: false, message: "Data warga tidak ditemukan atau Anda tidak memiliki hak akses." });
    }

    const { warga_id, ...payload } = req.body;
    const payloadWithDefault = { ...payload, status_kehamilan: payload.status_kehamilan || "hamil", is_menyusui: payload.is_menyusui ?? false };
    const combinationError = validatePregnancyCombination(payloadWithDefault);
    if (combinationError) return res.status(400).json({ success: false, message: combinationError });
    if (payloadWithDefault.status_kehamilan === "hamil") {
      const activePregnancy = await ProfileKehamilan.findOne({ where: { warga_id, status_kehamilan: "hamil" } });
      if (activePregnancy) return res.status(409).json({ success: false, message: "Warga sudah memiliki profil kehamilan aktif." });
    }
    const data = await ProfileKehamilan.create({ warga_id, ...payloadWithDefault });

    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.KEHAMILAN_CREATE,
      tableName: "profile_kehamilan",
      recordId: data.id,
      oldValue: null,
      newValue: typeof data.toJSON === "function" ? data.toJSON() : data,
    });

    return res.status(201).json({ success: true, message: "Data kehamilan berhasil ditambahkan.", data });
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") return res.status(409).json({ success: false, message: "Warga sudah memiliki profil kehamilan aktif." });
    next(error);
  }
};

const updateKehamilan = async (req, res, next) => {
  try {
    const data = await ProfileKehamilan.findByPk(req.params.id);
    if (!data || !(await getScopedWarga(req, data.warga_id))) {
      return res.status(404).json({ success: false, message: "Data kehamilan tidak ditemukan atau Anda tidak memiliki hak akses." });
    }

    const allowedFields = ["nama_suami", "hpht", "hpl", "anak_ke", "jarak_anak_sebelum_bulan", "tanggal_persalinan", "cara_persalinan", "status_kehamilan", "is_menyusui"];
    const payload = Object.fromEntries(Object.entries(req.body).filter(([field]) => allowedFields.includes(field)));
    const combinationError = validatePregnancyCombination(payload, data);
    if (combinationError) return res.status(400).json({ success: false, message: combinationError });
    if (["nifas", "menyusui", "selesai"].includes(data.status_kehamilan) && payload.status_kehamilan === "hamil") {
      return res.status(400).json({ success: false, message: "Kehamilan baru harus dibuat sebagai profile kehamilan baru; history kehamilan lama tidak boleh ditimpa." });
    }
    const oldValue = allowedFields.reduce((acc, field) => ({ ...acc, [field]: data[field] }), {});
    await data.update(payload);

    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.KEHAMILAN_UPDATE,
      tableName: "profile_kehamilan",
      recordId: data.id,
      oldValue,
      newValue: allowedFields.reduce((acc, field) => ({ ...acc, [field]: data[field] }), {}),
    });

    return res.status(200).json({ success: true, message: "Data kehamilan berhasil diperbarui.", data });
  } catch (error) {
    next(error);
  }
};

const updateStatusKehamilan = async (req, res, next) => {
  try {
    const data = await ProfileKehamilan.findByPk(req.params.id);
    if (!data || !(await getScopedWarga(req, data.warga_id))) {
      return res.status(404).json({ success: false, message: "Data kehamilan tidak ditemukan atau Anda tidak memiliki hak akses." });
    }

    const payload = { status_kehamilan: req.body.status_kehamilan };
    if (req.body.is_menyusui !== undefined) payload.is_menyusui = req.body.is_menyusui;
    if (req.body.tanggal_persalinan !== undefined) payload.tanggal_persalinan = req.body.tanggal_persalinan;
    const combinationError = validatePregnancyCombination(payload, data);
    if (combinationError) return res.status(400).json({ success: false, message: combinationError });
    if (["nifas", "menyusui", "selesai"].includes(data.status_kehamilan) && payload.status_kehamilan === "hamil") {
      return res.status(400).json({ success: false, message: "Kehamilan baru harus dibuat sebagai profile kehamilan baru; history kehamilan lama tidak boleh ditimpa." });
    }
    const oldValue = { status_kehamilan: data.status_kehamilan, is_menyusui: data.is_menyusui, tanggal_persalinan: data.tanggal_persalinan };
    await data.update(payload);

    await createAuditLog({
      userId: req.user?.id ?? null,
      action: AUDIT_ACTIONS.KEHAMILAN_STATUS_UPDATE,
      tableName: "profile_kehamilan",
      recordId: data.id,
      oldValue,
      newValue: { status_kehamilan: data.status_kehamilan, is_menyusui: data.is_menyusui, tanggal_persalinan: data.tanggal_persalinan },
    });

    return res.status(200).json({ success: true, message: "Status kehamilan berhasil diperbarui.", data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKehamilanByWarga,
  getKehamilanById,
  createKehamilan,
  updateKehamilan,
  updateStatusKehamilan,
};
