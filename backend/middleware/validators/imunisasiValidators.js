"use strict";

const { body } = require("express-validator");
const { positiveId } = require("./common");

const jenisImunisasi = body("jenis_imunisasi").trim().notEmpty().withMessage("jenis_imunisasi wajib diisi.").isLength({ max: 100 }).withMessage("jenis_imunisasi maksimal 100 karakter.");
const tanggalImunisasi = body("tanggal_imunisasi").isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_imunisasi harus berupa tanggal ISO yang valid.");

const wargaId = body("warga_id").isInt({ min: 1 }).withMessage("warga_id harus berupa ID positif.").toInt();
const wargaParam = [positiveId("warga_id")];
const id = [positiveId()];
const create = [wargaId, jenisImunisasi, tanggalImunisasi];
const update = [
  id,
  body("jenis_imunisasi").optional().trim().notEmpty().withMessage("jenis_imunisasi tidak boleh kosong.").isLength({ max: 100 }).withMessage("jenis_imunisasi maksimal 100 karakter."),
  body("tanggal_imunisasi").optional().isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_imunisasi harus berupa tanggal ISO yang valid."),
];

module.exports = { wargaParam, id, create, update };
