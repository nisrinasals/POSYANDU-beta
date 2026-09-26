const { Posyandu, Puskesmas, Kelurahan, Kecamatan } = require("../models");
const { Op } = require("sequelize");
const { getPosyanduScope } = require("../utils/posyanduAccessHelper");

/**
 * 1. GET ALL POSYANDU (Support Search & Pagination)
 */
const getAllPosyandu = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, puskesmas_id, kecamatan_id } = req.query;
    const offset = (page - 1) * limit;

    // Condition filter untuk Posyandu
    const whereCondition = {};
    Object.assign(whereCondition, getPosyanduScope(req.user));
    if (search) {
      whereCondition.nama_posyandu = { [Op.iLike]: `%${search}%` };
    }
    if (puskesmas_id && !Object.prototype.hasOwnProperty.call(getPosyanduScope(req.user), "puskesmas_id")) {
      whereCondition.puskesmas_id = puskesmas_id;
    }

    // Condition filter untuk Kelurahan/Kecamatan
    const kelurahanWhere = {};
    if (kecamatan_id) {
      kelurahanWhere.kecamatan_id = kecamatan_id;
    }

    const { count, rows } = await Posyandu.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [["id", "DESC"]],
      include: [
        {
          model: Puskesmas,
          as: "puskesmas",
          attributes: ["id", "nama_puskesmas"],
        },
        {
          model: Kelurahan,
          as: "kelurahan",
          where: Object.keys(kelurahanWhere).length > 0 ? kelurahanWhere : undefined,
          attributes: ["id", "nama_kelurahan", "kecamatan_id"],
          include: [
            {
              model: Kecamatan,
              as: "kecamatan",
              attributes: ["id", "nama_kecamatan"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar Posyandu.",
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
 * 2. GET POSYANDU BY ID
 */
const getPosyanduById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const posyandu = await Posyandu.findOne({
      where: { id, ...getPosyanduScope(req.user) },
      include: [
        {
          model: Puskesmas,
          as: "puskesmas",
          attributes: ["id", "nama_puskesmas"],
        },
        {
          model: Kelurahan,
          as: "kelurahan",
          attributes: ["id", "nama_kelurahan", "kecamatan_id"],
          include: [
            {
              model: Kecamatan,
              as: "kecamatan",
              attributes: ["id", "nama_kecamatan"],
            },
          ],
        },
      ],
    });

    if (!posyandu) {
      return res.status(404).json({
        success: false,
        message: "Data Posyandu tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail Posyandu.",
      data: posyandu,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosyandu,
  getPosyanduById,
};
