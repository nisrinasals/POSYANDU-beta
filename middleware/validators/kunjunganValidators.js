"use strict";

const { body, query } = require("express-validator");
const { positiveId, pagination, optionalDate } = require("./common");

const listFilters = [
  ...pagination,
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search maksimal 100 karakter."),
  query("sesi_posyandu_id").optional().isInt({ min: 1 }).withMessage("sesi_posyandu_id harus berupa ID positif.").toInt(),
  query("status_langkah").optional().isIn(["langkah_1", "langkah_2", "langkah_3", "langkah_4", "langkah_5"]).withMessage("status_langkah tidak valid."),
  optionalDate("start_date"),
  optionalDate("end_date"),
];

const antreanHariIni = [
  query("sesi_posyandu_id").optional().isInt({ min: 1 }).withMessage("sesi_posyandu_id harus berupa ID positif.").toInt(),
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search maksimal 100 karakter."),
];

const createKunjungan = [body("warga_id").isInt({ min: 1 }).withMessage("warga_id harus berupa ID positif.").toInt(), body("sesi_posyandu_id").isInt({ min: 1 }).withMessage("sesi_posyandu_id harus berupa ID positif.").toInt()];
const updateStatusLangkah = [positiveId(), body("status_langkah").isIn(["langkah_1", "langkah_2", "langkah_3", "langkah_4", "langkah_5"]).withMessage("status_langkah tidak valid.")];
const idOnly = [positiveId()];

module.exports = { listFilters, antreanHariIni, createKunjungan, updateStatusLangkah, idOnly };
