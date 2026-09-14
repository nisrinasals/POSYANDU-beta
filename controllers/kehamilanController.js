"use strict";

const { ProfileKehamilan, Warga, Posyandu } = require("../models");

const getScopedWarga = (req, wargaId) => {
  const role = req.user?.role;
  const posyanduWhere = {};

  if (role === "kader") {
    posyanduWhere.id = req.user.posyandu_id;
  } else if (role === "puskesmas") {
    posyanduWhere.puskesmas_id = req.user.puskesmas_id;
  }

  return Warga.findOne({
    where: { id: wargaId },
    include: [{ model: Posyandu, as: "posyandu", where: Object.keys(posyanduWhere).length ? posyanduWhere : undefined }],
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
    const data = await ProfileKehamilan.create({ warga_id, ...payload, status_kehamilan: payload.status_kehamilan || "hamil" });

    return res.status(201).json({ success: true, message: "Data kehamilan berhasil ditambahkan.", data });
  } catch (error) {
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
    await data.update(payload);

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
    await data.update(payload);
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
