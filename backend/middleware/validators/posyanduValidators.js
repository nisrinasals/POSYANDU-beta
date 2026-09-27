"use strict";

const { query } = require("express-validator");
const { positiveId, pagination } = require("./common");

const listPosyandu = [
  ...pagination,
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search maksimal 100 karakter."),
  query("puskesmas_id").optional().isInt({ min: 1 }).withMessage("puskesmas_id harus berupa ID positif.").toInt(),
  query("kecamatan_id").optional().isInt({ min: 1 }).withMessage("kecamatan_id harus berupa ID positif.").toInt(),
];

const getPosyanduById = [positiveId()];

module.exports = { listPosyandu, getPosyanduById };
