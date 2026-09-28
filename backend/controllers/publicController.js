"use strict";

const { Posyandu, Puskesmas, Kelurahan, Kecamatan } = require("../models");
const { Op } = require("sequelize");

const getPublicPosyandu = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const where = search.trim() ? { nama_posyandu: { [Op.iLike]: `%${search.trim()}%` } } : {};

    const rows = await Posyandu.findAll({
      where,
      attributes: ["id", "nama_posyandu", "puskesmas_id", "kelurahan_id"],
      include: [
        { model: Puskesmas, as: "puskesmas", attributes: ["id", "nama_puskesmas", "kecamatan_id"] },
        { model: Kelurahan, as: "kelurahan", attributes: ["id", "nama_kelurahan", "kecamatan_id", "puskesmas_id"] },
      ],
      order: [["nama_posyandu", "ASC"]],
    });

    return res.status(200).json({ success: true, message: "Berhasil mengambil daftar Posyandu.", data: rows });
  } catch (error) {
    next(error);
  }
};

const getPublicPuskesmas = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const where = search.trim() ? { nama_puskesmas: { [Op.iLike]: `%${search.trim()}%` } } : {};

    const rows = await Puskesmas.findAll({
      where,
      attributes: ["id", "kode_puskesmas", "nama_puskesmas", "kecamatan_id"],
      include: [
        {
          model: Kecamatan,
          as: "kecamatan",
          attributes: ["id", "nama_kecamatan"],
        },
        {
          model: Kelurahan,
          as: "kelurahan",
          attributes: ["id", "nama_kelurahan", "kecamatan_id", "puskesmas_id"],
          required: false,
          separate: true,
          order: [["nama_kelurahan", "ASC"]],
        },
      ],
      order: [["nama_puskesmas", "ASC"]],
    });

    return res.status(200).json({ success: true, message: "Berhasil mengambil daftar Puskesmas.", data: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicPosyandu, getPublicPuskesmas };
