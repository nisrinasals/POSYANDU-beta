"use strict";

const { Op } = require("sequelize");
const { SesiPosyandu, Posyandu } = require("../models");

const canAccessPosyandu = (user, posyandu) => {
  if (["dinkes", "dinkesAdmin", "sa"].includes(user.role)) return true;
  if (user.role === "kader") return Number(posyandu.id) === Number(user.posyandu_id);
  return ["puskesmas", "puskesmasAdmin"].includes(user.role) && Number(posyandu.puskesmas_id) === Number(user.puskesmas_id);
};

const assertSessionManager = (user) => {
  if (!["kader", "sa"].includes(user.role)) {
    const error = new Error("Hanya kader yang dapat mengisi atau mengubah sesi Posyandu.");
    error.statusCode = 403;
    throw error;
  }
};

const getSesiPosyandu = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, posyandu_id, status, tanggal } = req.query;
    const where = {};
    if (posyandu_id) where.posyandu_id = posyandu_id;
    if (status) where.status = status;
    if (tanggal) where.tanggal_pelaksanaan = tanggal;
    const posyanduWhere = ["puskesmas", "puskesmasAdmin"].includes(req.user.role) ? { puskesmas_id: req.user.puskesmas_id } : req.user.role === "kader" ? { id: req.user.posyandu_id } : undefined;
    const { count, rows } = await SesiPosyandu.findAndCountAll({
      where,
      include: [{ model: Posyandu, as: "posyandu", where: posyanduWhere }],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [
        ["tanggal_pelaksanaan", "DESC"],
        ["id", "DESC"],
      ],
    });
    return res
      .status(200)
      .json({ success: true, message: "Berhasil mengambil sesi Posyandu.", data: rows, pagination: { total_items: count, total_pages: Math.ceil(count / limit), current_page: Number(page), items_per_page: Number(limit) } });
  } catch (error) {
    next(error);
  }
};

const getSesiPosyanduById = async (req, res, next) => {
  try {
    const session = await SesiPosyandu.findByPk(req.params.id, { include: [{ model: Posyandu, as: "posyandu" }] });
    if (!session || !canAccessPosyandu(req.user, session.posyandu)) return res.status(404).json({ success: false, message: "Sesi Posyandu tidak ditemukan atau akses ditolak." });
    return res.status(200).json({ success: true, message: "Berhasil mengambil detail sesi Posyandu.", data: session });
  } catch (error) {
    next(error);
  }
};

const createSesiPosyandu = async (req, res, next) => {
  try {
    assertSessionManager(req.user);
    const posyandu = await Posyandu.findByPk(req.body.posyandu_id);
    if (!posyandu || !canAccessPosyandu(req.user, posyandu)) return res.status(403).json({ success: false, message: "Posyandu berada di luar scope Anda." });
    const existingOpen = await SesiPosyandu.findOne({ where: { posyandu_id: posyandu.id, tanggal_pelaksanaan: req.body.tanggal_pelaksanaan, status: "open" } });
    if (existingOpen) return res.status(409).json({ success: false, message: "Sudah ada sesi open pada Posyandu dan tanggal tersebut." });
    const session = await SesiPosyandu.create({ posyandu_id: posyandu.id, tanggal_pelaksanaan: req.body.tanggal_pelaksanaan, status: req.body.status || "open" });
    return res.status(201).json({ success: true, message: "Sesi Posyandu berhasil dibuat.", data: session });
  } catch (error) {
    next(error);
  }
};

const updateSesiPosyandu = async (req, res, next) => {
  try {
    assertSessionManager(req.user);
    const session = await SesiPosyandu.findByPk(req.params.id, { include: [{ model: Posyandu, as: "posyandu" }] });
    if (!session || !canAccessPosyandu(req.user, session.posyandu)) return res.status(404).json({ success: false, message: "Sesi Posyandu tidak ditemukan atau akses ditolak." });
    const nextPosyanduId = req.body.posyandu_id || session.posyandu_id;
    const nextDate = req.body.tanggal_pelaksanaan || session.tanggal_pelaksanaan;
    const nextStatus = req.body.status || session.status;
    const duplicate = await SesiPosyandu.findOne({ where: { id: { [Op.ne]: session.id }, posyandu_id: nextPosyanduId, tanggal_pelaksanaan: nextDate, status: "open" } });
    if (duplicate && nextStatus === "open") return res.status(409).json({ success: false, message: "Sudah ada sesi open pada Posyandu dan tanggal tersebut." });
    if (req.body.posyandu_id) {
      const nextPosyandu = await Posyandu.findByPk(req.body.posyandu_id);
      if (!nextPosyandu || !canAccessPosyandu(req.user, nextPosyandu)) return res.status(403).json({ success: false, message: "Posyandu berada di luar scope Anda." });
    }
    await session.update({ posyandu_id: nextPosyanduId, tanggal_pelaksanaan: nextDate, status: nextStatus });
    return res.status(200).json({ success: true, message: "Sesi Posyandu berhasil diperbarui.", data: session });
  } catch (error) {
    next(error);
  }
};

const updateSesiPosyanduStatus = async (req, res, next) => {
  try {
    assertSessionManager(req.user);
    const session = await SesiPosyandu.findByPk(req.params.id, { include: [{ model: Posyandu, as: "posyandu" }] });
    if (!session || !canAccessPosyandu(req.user, session.posyandu)) return res.status(404).json({ success: false, message: "Sesi Posyandu tidak ditemukan atau akses ditolak." });
    await session.update({ status: req.body.status });
    return res.status(200).json({ success: true, message: "Status sesi Posyandu berhasil diperbarui.", data: session });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSesiPosyandu, getSesiPosyanduById, createSesiPosyandu, updateSesiPosyandu, updateSesiPosyanduStatus };
