"use strict";

const { param, query } = require("express-validator");

const positiveId = (field = "id") => param(field).isInt({ min: 1 }).withMessage(`${field} harus berupa ID positif.`).toInt();

const pagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("page harus berupa bilangan bulat positif.").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit harus berupa bilangan 1 sampai 100.").toInt(),
];

const optionalDate = (field) => query(field).optional().isISO8601({ strict: true, strictSeparator: true }).withMessage(`${field} harus berupa tanggal ISO yang valid.`);

module.exports = { positiveId, pagination, optionalDate };
