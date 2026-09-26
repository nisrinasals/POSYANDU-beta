"use strict";

const { query } = require("express-validator");
const { positiveId, pagination, optionalDate } = require("./common");

const listFilters = [
  ...pagination,
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search maksimal 100 karakter."),
  query("puskesmas_id").optional().isInt({ min: 1 }).withMessage("puskesmas_id harus berupa ID positif.").toInt(),
  query("kader_id").optional().isInt({ min: 1 }).withMessage("kader_id harus berupa ID positif.").toInt(),
  optionalDate("start_date"),
  optionalDate("end_date"),
];

const idOnly = [positiveId()];

module.exports = { listFilters, idOnly };
