"use strict";

const { body, query } = require("express-validator");
const { positiveId, pagination, optionalDate } = require("./common");

const kategori = ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"];
const numericFields = [
  ["bb_kg", 0, 999.99],
  ["tb_cm", 0, 999.99],
  ["lingkar_kepala_cm", 0, 999.99],
  ["lila_cm", 0, 999.99],
  ["lingkar_perut_cm", 0, 999.99],
  ["td_sistole", 0, 999],
  ["td_diastole", 0, 999],
  ["kadar_gula", 0, 9999],
];

const measurements = numericFields.map(([field, min, max]) => body(field).optional().isFloat({ min, max }).withMessage(`${field} harus berupa angka valid.`).toFloat());
const commonBody = [body("kunjungan_id").isInt({ min: 1 }).withMessage("kunjungan_id harus berupa ID positif.").toInt()];
const screeningFields = [
  body("detail_skrining").optional().isObject().withMessage("detail_skrining harus berupa objek JSON."),
  body("is_skrining_tahunan").optional().isBoolean().withMessage("is_skrining_tahunan harus berupa boolean.").toBoolean(),
  body("profile_kehamilan_id").optional({ nullable: true }).isInt({ min: 1 }).withMessage("profile_kehamilan_id harus berupa ID positif.").toInt(),
];
const outputFields = [
  body("topik_penyuluhan").optional({ nullable: true }).isString().isLength({ max: 500 }).withMessage("topik_penyuluhan maksimal 500 karakter."),
  body("is_perlu_rujukan").optional().isBoolean().withMessage("is_perlu_rujukan harus berupa boolean.").toBoolean(),
];

const listFilters = [
  ...pagination,
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search maksimal 100 karakter."),
  query("kategori_sasaran").optional().isIn(kategori).withMessage("kategori_sasaran tidak valid."),
  query("sesi_posyandu_id").optional().isInt({ min: 1 }).withMessage("sesi_posyandu_id harus berupa ID positif.").toInt(),
  query("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
  query("warga_id").optional().isInt({ min: 1 }).withMessage("warga_id harus berupa ID positif.").toInt(),
  optionalDate("start_date"),
  optionalDate("end_date"),
];

const createPemeriksaan = [
  ...commonBody,
  body("kategori_sasaran").optional().isIn(kategori).withMessage("kategori_sasaran tidak valid."),
  body("tanggal").optional().isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal harus berupa tanggal ISO yang valid."),
  ...screeningFields,
  ...measurements,
  ...outputFields,
];
const saveStep2 = [...commonBody, ...measurements];
const saveStep4 = [...commonBody, ...screeningFields];
const saveStep5 = [...commonBody, ...outputFields];
const updatePemeriksaan = [
  positiveId(),
  body("kategori_sasaran").optional().isIn(kategori).withMessage("kategori_sasaran tidak valid."),
  body("tanggal").optional().isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal harus berupa tanggal ISO yang valid."),
  ...screeningFields.slice(1),
  ...measurements,
  ...screeningFields.slice(0, 1),
  ...outputFields,
];
const idOnly = [positiveId()];

module.exports = { listFilters, createPemeriksaan, saveStep2, saveStep4, saveStep5, updatePemeriksaan, idOnly };
