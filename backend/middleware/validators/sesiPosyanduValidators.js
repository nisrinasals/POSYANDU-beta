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
const lokasi = body("lokasi").trim().notEmpty().withMessage("lokasi wajib diisi.").isLength({ max: 255 }).withMessage("lokasi maksimal 255 karakter.");
const rw = body("rw").trim().notEmpty().withMessage("rw wajib diisi.").isLength({ max: 5 }).withMessage("rw maksimal 5 karakter.");
const create = [body("posyandu_id").isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(), date("tanggal_pelaksanaan"), lokasi, rw, body("status").isIn(statuses).withMessage("Status sesi tidak valid.")];
const update = [
  positiveId(),
  body("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
  body("tanggal_pelaksanaan").optional().isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_pelaksanaan harus berupa tanggal ISO yang valid."),
  body("lokasi").optional().trim().notEmpty().withMessage("lokasi tidak boleh kosong.").isLength({ max: 255 }).withMessage("lokasi maksimal 255 karakter."),
  body("rw").optional().trim().notEmpty().withMessage("rw tidak boleh kosong.").isLength({ max: 5 }).withMessage("rw maksimal 5 karakter."),
  body("status").optional().isIn(statuses).withMessage("Status sesi tidak valid."),
];
const updateStatus = [positiveId(), body("status").isIn(statuses).withMessage("Status sesi tidak valid.")];

module.exports = { list, id, create, update, updateStatus };
