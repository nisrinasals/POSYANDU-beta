"use strict";

const { Op } = require("sequelize");
const PDFDocument = require("pdfkit");
const { Rujukan, Warga, Posyandu, Pemeriksaan, Puskesmas, User } = require("../models");
const { getPosyanduInclude } = require("../utils/posyanduAccessHelper");

const getWargaInclude = (req, search) => ({
  model: Warga,
  as: "warga",
  required: true,
  where: search
    ? {
        [Op.or]: [{ nama_lengkap: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }],
      }
    : undefined,
  include: [getPosyanduInclude(req.user)],
});

const getIncludes = (req, search) => [
  getWargaInclude(req, search),
  { model: Pemeriksaan, as: "pemeriksaan", required: true, attributes: ["id", "tanggal", "kategori_sasaran", "detail_skrining", "is_perlu_rujukan"] },
  { model: Puskesmas, as: "puskesmas", attributes: ["id", "kode_puskesmas", "nama_puskesmas"] },
  { model: User, as: "kader", attributes: ["id", "nama_lengkap", "email", "posyandu_id"] },
];

const getAllRujukan = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, puskesmas_id, kader_id, start_date, end_date } = req.query;
    const where = {};
    if (puskesmas_id) where.puskesmas_id = puskesmas_id;
    if (kader_id) where.kader_id = kader_id;
    if (start_date && end_date) where.tanggal_rujukan = { [Op.between]: [new Date(start_date), new Date(end_date)] };

    const { count, rows } = await Rujukan.findAndCountAll({
      where,
      include: getIncludes(req, search),
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [
        ["tanggal_rujukan", "DESC"],
        ["id", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar rujukan.",
      data: rows,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / Number(limit)),
        current_page: Number(page),
        items_per_page: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRujukanById = async (req, res, next) => {
  try {
    const data = await Rujukan.findByPk(req.params.id, { include: getIncludes(req) });
    if (!data) return res.status(404).json({ success: false, message: "Data rujukan tidak ditemukan atau Anda tidak memiliki hak akses." });
    return res.status(200).json({ success: true, message: "Berhasil mengambil detail rujukan.", data });
  } catch (error) {
    next(error);
  }
};

const exportRujukanPdf = async (req, res, next) => {
  try {
    const data = await Rujukan.findByPk(req.params.id, { include: getIncludes(req) });
    if (!data) return res.status(404).json({ success: false, message: "Data rujukan tidak ditemukan atau Anda tidak memiliki hak akses." });

    const referral = data.get ? data.get({ plain: true }) : data;
    const document = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Rujukan_${referral.id}.pdf`);

    document.pipe(res);
    document.fontSize(18).text("SURAT RUJUKAN POSYANDU", { align: "center" });
    document.moveDown();
    document.fontSize(11);
    document.text(`Nomor Rujukan: ${referral.id}`);
    document.text(`Tanggal Rujukan: ${referral.tanggal_rujukan}`);
    document.moveDown();
    document.text(`Warga: ${referral.warga?.nama_lengkap || "-"}`);
    document.text(`NIK: ${referral.warga?.nik || "-"}`);
    document.text(`Puskesmas: ${referral.puskesmas?.nama_puskesmas || "-"}`);
    document.text(`Kader: ${referral.kader?.nama_lengkap || "-"}`);
    document.moveDown();
    document.text(`Alasan Rujukan: ${referral.alasan_rujukan}`);
    document.text(`Kehadiran Rujukan: ${referral.status_kehadiran_rujukan || "Belum diketahui"}`);
    document.moveDown();
    document.text("Pemeriksaan Terkait", { underline: true });
    document.text(`ID Pemeriksaan: ${referral.pemeriksaan?.id || "-"}`);
    document.text(`Tanggal Pemeriksaan: ${referral.pemeriksaan?.tanggal || "-"}`);
    document.text(`Kategori Sasaran: ${referral.pemeriksaan?.kategori_sasaran || "-"}`);
    document.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRujukan, getRujukanById, exportRujukanPdf };
