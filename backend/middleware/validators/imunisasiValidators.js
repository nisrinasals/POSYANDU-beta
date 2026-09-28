"use strict";

const { body } = require("express-validator");
const { positiveId } = require("./common");

<<<<<<< HEAD
const IMUNISASI_MASTER = [
  "Hepatitis",
  "BCG",
  "Polio Tetes 1",
  "DPT-HB-Hib 1",
  "Polio Tetes 2",
  "Rotavirus (RV)1",
  "PCV 1",
  "DPT-HB-Hib 2",
  "Polio Tetes 3",
  "Rotavirus (RV)2",
  "PCV 2",
  "DPT-HB-Hib 3",
  "Polio Tetes 4",
  "Polio Suntik (IPV)1",
  "Rotavirus (RV)3",
  "Campak-Rubella (MR)",
  "Polio Suntik (IPV)2",
  "Japanese Enchepalatis (JE)",
  "PCV 3",
  "DPT-HB-Hib Lanjutan",
  "Campak-Rubella (MR) Lanjutan",
];

const TEMPAT_IMUNISASI = ["puskesmas", "klinik", "rs"];

const validateRecord = (record) => {
  if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error("Setiap imunisasi harus berupa object.");
  if (!IMUNISASI_MASTER.includes(record.jenis_imunisasi)) throw new Error("jenis_imunisasi tidak termasuk master imunisasi.");
  if (typeof record.is_diberikan !== "boolean") throw new Error("is_diberikan harus berupa boolean.");
  if (record.is_diberikan && (!record.tanggal_imunisasi || !TEMPAT_IMUNISASI.includes(record.tempat))) {
    throw new Error("Imunisasi yang diberikan wajib memiliki tanggal_imunisasi dan tempat yang valid.");
  }
  if (!record.is_diberikan && (record.tanggal_imunisasi || record.tempat)) {
    throw new Error("Imunisasi yang belum diberikan tidak boleh memiliki tanggal_imunisasi atau tempat.");
  }
  return true;
};
=======
const jenisImunisasi = body("jenis_imunisasi").trim().notEmpty().withMessage("jenis_imunisasi wajib diisi.").isLength({ max: 100 }).withMessage("jenis_imunisasi maksimal 100 karakter.");
const tanggalImunisasi = body("tanggal_imunisasi").isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_imunisasi harus berupa tanggal ISO yang valid.");
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

const wargaId = body("warga_id").isInt({ min: 1 }).withMessage("warga_id harus berupa ID positif.").toInt();
const wargaParam = [positiveId("warga_id")];
const id = [positiveId()];
<<<<<<< HEAD
const create = [
  wargaId,
  body("jenis_imunisasi").isIn(IMUNISASI_MASTER).withMessage("jenis_imunisasi tidak termasuk master imunisasi."),
  body("is_diberikan").optional().isBoolean().withMessage("is_diberikan harus berupa boolean.").toBoolean(),
  body("tanggal_imunisasi").optional({ nullable: true }).isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_imunisasi harus berupa tanggal ISO yang valid."),
  body("tempat").optional({ nullable: true }).isIn(TEMPAT_IMUNISASI).withMessage("tempat imunisasi tidak valid."),
  body("no_batch").optional({ nullable: true }).isString().isLength({ max: 100 }).withMessage("no_batch maksimal 100 karakter."),
  body().custom((value) => validateRecord({ is_diberikan: value.is_diberikan ?? true, ...value })),
];
const update = [
  id,
  body("jenis_imunisasi").optional().isIn(IMUNISASI_MASTER).withMessage("jenis_imunisasi tidak termasuk master imunisasi."),
  body("is_diberikan").optional().isBoolean().withMessage("is_diberikan harus berupa boolean.").toBoolean(),
  body("tanggal_imunisasi").optional({ nullable: true }).isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_imunisasi harus berupa tanggal ISO yang valid."),
  body("tempat").optional({ nullable: true }).isIn(TEMPAT_IMUNISASI).withMessage("tempat imunisasi tidak valid."),
  body("no_batch").optional({ nullable: true }).isString().isLength({ max: 100 }).withMessage("no_batch maksimal 100 karakter."),
];
const bulk = [
  wargaId,
  body("imunisasi").isArray({ min: IMUNISASI_MASTER.length, max: IMUNISASI_MASTER.length }).withMessage(`imunisasi harus berisi tepat ${IMUNISASI_MASTER.length} jenis.`),
  body("imunisasi").custom((records) => {
    const names = records.map((record) => record?.jenis_imunisasi);
    if (new Set(names).size !== IMUNISASI_MASTER.length || names.some((name) => !IMUNISASI_MASTER.includes(name))) {
      throw new Error("imunisasi harus berisi tepat satu row untuk setiap master imunisasi.");
    }
    records.forEach(validateRecord);
    return true;
  }),
];

module.exports = { IMUNISASI_MASTER, TEMPAT_IMUNISASI, wargaParam, id, create, update, bulk, validateRecord };
=======
const create = [wargaId, jenisImunisasi, tanggalImunisasi];
const update = [
  id,
  body("jenis_imunisasi").optional().trim().notEmpty().withMessage("jenis_imunisasi tidak boleh kosong.").isLength({ max: 100 }).withMessage("jenis_imunisasi maksimal 100 karakter."),
  body("tanggal_imunisasi").optional().isISO8601({ strict: true, strictSeparator: true }).withMessage("tanggal_imunisasi harus berupa tanggal ISO yang valid."),
];

module.exports = { wargaParam, id, create, update };
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
