"use strict";

const { Op } = require("sequelize");
const { SesiPosyandu, Posyandu } = require("../models");
const { canAccessPosyandu, getPosyanduInclude } = require("../utils/posyanduAccessHelper");
const { assertSessionManager } = require("../utils/sesiPosyanduHelper");

const getSesiPosyandu = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, posyandu_id, status, tanggal } = req.query;
    const where = {};
    if (posyandu_id) where.posyandu_id = posyandu_id;
    if (status) where.status = status;
    if (tanggal) where.tanggal_pelaksanaan = tanggal;
    const { count, rows } = await SesiPosyandu.findAndCountAll({
      where,
      include: [getPosyanduInclude(req.user)],
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
    const existing = await SesiPosyandu.findOne({ where: { posyandu_id: posyandu.id, tanggal_pelaksanaan: req.body.tanggal_pelaksanaan } });
    if (existing) return res.status(409).json({ success: false, message: "Sudah ada sesi pada Posyandu dan tanggal tersebut." });
    const session = await SesiPosyandu.create({
      posyandu_id: posyandu.id,
      tanggal_pelaksanaan: req.body.tanggal_pelaksanaan,
      lokasi: req.body.lokasi,
      rw: req.body.rw,
      status: req.body.status,
    });
    return res.status(201).json({ success: true, message: "Sesi Posyandu berhasil dibuat.", data: session });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).json({ success: false, message: "Sudah ada sesi pada Posyandu dan tanggal tersebut." });
    next(error);
  }
};

const updateSesiPosyandu = async (req, res, next) => {
  try {
    assertSessionManager(req.user);
    const session = await SesiPosyandu.findByPk(req.params.id, { include: [{ model: Posyandu, as: "posyandu" }] });
    if (!session || !canAccessPosyandu(req.user, session.posyandu)) return res.status(404).json({ success: false, message: "Sesi Posyandu tidak ditemukan atau akses ditolak." });
    if (session.status === "closed") return res.status(400).json({ success: false, message: "Sesi Posyandu yang sudah closed tidak dapat diedit." });
    const nextPosyanduId = req.body.posyandu_id ?? session.posyandu_id;
    const nextDate = req.body.tanggal_pelaksanaan ?? session.tanggal_pelaksanaan;
    const nextStatus = req.body.status ?? session.status;
    if (req.body.posyandu_id) {
      const nextPosyandu = await Posyandu.findByPk(req.body.posyandu_id);
      if (!nextPosyandu || !canAccessPosyandu(req.user, nextPosyandu)) return res.status(403).json({ success: false, message: "Posyandu berada di luar scope Anda." });
    }
    const duplicate = await SesiPosyandu.findOne({ where: { id: { [Op.ne]: session.id }, posyandu_id: nextPosyanduId, tanggal_pelaksanaan: nextDate } });
    if (duplicate) return res.status(409).json({ success: false, message: "Sudah ada sesi pada Posyandu dan tanggal tersebut." });
    await session.update({
      posyandu_id: nextPosyanduId,
      tanggal_pelaksanaan: nextDate,
      lokasi: req.body.lokasi ?? session.lokasi,
      rw: req.body.rw ?? session.rw,
      status: nextStatus,
    });
    return res.status(200).json({ success: true, message: "Sesi Posyandu berhasil diperbarui.", data: session });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).json({ success: false, message: "Sudah ada sesi pada Posyandu dan tanggal tersebut." });
    next(error);
  }
};

const updateSesiPosyanduStatus = async (req, res, next) => {
  try {
    assertSessionManager(req.user);
    const session = await SesiPosyandu.findByPk(req.params.id, { include: [{ model: Posyandu, as: "posyandu" }] });
    if (!session || !canAccessPosyandu(req.user, session.posyandu)) return res.status(404).json({ success: false, message: "Sesi Posyandu tidak ditemukan atau akses ditolak." });
    if (session.status === "closed") return res.status(400).json({ success: false, message: "Sesi Posyandu yang sudah closed tidak dapat diedit." });
    if (!["open", "closed"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Status sesi tidak valid." });
    await session.update({ status: req.body.status });
    return res.status(200).json({ success: true, message: "Status sesi Posyandu berhasil diperbarui.", data: session });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSesiPosyandu, getSesiPosyanduById, createSesiPosyandu, updateSesiPosyandu, updateSesiPosyanduStatus };
