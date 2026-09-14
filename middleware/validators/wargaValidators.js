"use strict";

const { body, query } = require("express-validator");
const { positiveId, pagination } = require("./common");

const kategori = ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"];
const statusDomisili = ["aktif", "pindah", "meninggal"];

const listFilters = [
  ...pagination,
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search maksimal 100 karakter."),
  query("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
  query("jenis_kelamin").optional().isIn(["L", "P"]).withMessage("jenis_kelamin harus L atau P."),
  query("kategori_sasaran").optional().isIn(kategori).withMessage("kategori_sasaran tidak valid."),
  query("status_domisili")
    .optional()
    .isIn(["all", ...statusDomisili])
    .withMessage("status_domisili tidak valid."),
  query("rt").optional().trim().isLength({ max: 5 }).withMessage("RT maksimal 5 karakter."),
  query("rw").optional().trim().isLength({ max: 5 }).withMessage("RW maksimal 5 karakter."),
];

const makeFields = () => [
  body("nik")
    .trim()
    .matches(/^\d{16}$/)
    .withMessage("NIK harus terdiri dari 16 digit angka."),
  body("nama_lengkap").trim().isLength({ min: 2, max: 100 }).withMessage("Nama lengkap harus 2 sampai 100 karakter."),
  body("jenis_kelamin").isIn(["L", "P"]).withMessage("jenis_kelamin harus L atau P."),
  body("tanggal_lahir").isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_lahir harus berupa tanggal ISO yang valid."),
  body("alamat").optional().isString().isLength({ max: 500 }).withMessage("Alamat maksimal 500 karakter."),
  body("rt").optional().trim().isLength({ max: 5 }).withMessage("RT maksimal 5 karakter."),
  body("rw").optional().trim().isLength({ max: 5 }).withMessage("RW maksimal 5 karakter."),
  body("telepon").optional().trim().isLength({ max: 20 }).withMessage("Telepon maksimal 20 karakter."),
  body("nama_ibu").optional().trim().isLength({ max: 100 }).withMessage("Nama ibu maksimal 100 karakter."),
  body("nama_ayah").optional().trim().isLength({ max: 100 }).withMessage("Nama ayah maksimal 100 karakter."),
  body("status_perkawinan").optional().isIn(["menikah", "tidak_menikah"]).withMessage("status_perkawinan tidak valid."),
  body("pekerjaan").optional().trim().isLength({ max: 50 }).withMessage("Pekerjaan maksimal 50 karakter."),
  body("pekerjaan_lainnya").optional().trim().isLength({ max: 100 }).withMessage("Pekerjaan lainnya maksimal 100 karakter."),
  body("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
  body("bb_lahir_kg").optional().isFloat({ min: 0, max: 99.99 }).withMessage("bb_lahir_kg harus berupa angka 0 sampai 99.99.").toFloat(),
  body("tb_lahir_cm").optional().isFloat({ min: 0, max: 999.99 }).withMessage("tb_lahir_cm harus berupa angka valid.").toFloat(),
  body("status_domisili").optional().isIn(statusDomisili).withMessage("status_domisili tidak valid."),
];

const createWarga = makeFields();
const updateWarga = makeFields().map((validator) => validator.optional());
const getWargaById = [positiveId()];
const updateStatusDomisili = [body("status_domisili").isIn(statusDomisili).withMessage("status_domisili tidak valid.")];

module.exports = { listFilters, getWargaById, createWarga, updateWarga, updateStatusDomisili };
