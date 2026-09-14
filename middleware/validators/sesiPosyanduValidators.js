"use strict";

const { body, query } = require("express-validator");
const { positiveId, pagination } = require("./common");

const statuses = ["open", "closed"];
const date = (field) => body(field).isISO8601({ strict: true, strictSeparator: true }).withMessage(`${field} harus berupa tanggal ISO yang valid.`);

const list = [
  ...pagination,
  query("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
  query("status").optional().isIn(statuses).withMessage("Status sesi tidak valid."),
  query("tanggal").optional().isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal harus berupa tanggal ISO yang valid."),
];
const id = [positiveId()];
const create = [body("posyandu_id").isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(), date("tanggal_pelaksanaan"), body("status").optional().isIn(statuses).withMessage("Status sesi tidak valid.")];
const update = [
  positiveId(),
  body("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
  body("tanggal_pelaksanaan").optional().isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_pelaksanaan harus berupa tanggal ISO yang valid."),
  body("status").optional().isIn(statuses).withMessage("Status sesi tidak valid."),
];
const updateStatus = [positiveId(), body("status").isIn(statuses).withMessage("Status sesi tidak valid.")];

module.exports = { list, id, create, update, updateStatus };
