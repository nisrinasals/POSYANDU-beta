"use strict";

const { Imunisasi, Warga } = require("../models");
const { getPosyanduInclude } = require("../utils/posyanduAccessHelper");

const getScopedWarga = (req, wargaId) =>
  Warga.findOne({
    where: { id: wargaId },
    include: [getPosyanduInclude(req.user)],
  });

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

    const data = await Imunisasi.create({
      warga_id: warga.id,
      jenis_imunisasi: req.body.jenis_imunisasi,
      tanggal_imunisasi: req.body.tanggal_imunisasi,
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

    const payload = {};
    if (req.body.jenis_imunisasi !== undefined) payload.jenis_imunisasi = req.body.jenis_imunisasi;
    if (req.body.tanggal_imunisasi !== undefined) payload.tanggal_imunisasi = req.body.tanggal_imunisasi;
    await data.update(payload);
    return res.status(200).json({ success: true, message: "Data imunisasi berhasil diperbarui.", data });
  } catch (error) {
    next(error);
  }
};

module.exports = { createImunisasi, updateImunisasi, getImunisasiByWarga, getImunisasiById };
