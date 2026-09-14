"use strict";

const { body } = require("express-validator");
const { positiveId } = require("./common");

const statuses = ["hamil", "nifas", "menyusui", "selesai"];
const caraPersalinan = ["normal", "dengan_tindakan"];
const makePregnancyFields = () => {
  const dateFields = ["hpht", "hpl", "tanggal_persalinan"];
  const dateValidators = dateFields.map((field) => body(field).optional({ nullable: true }).isISO8601({ strict: true, strictSeparator: true }).withMessage(`${field} harus berupa tanggal ISO yang valid.`));

  return [
    body("nama_suami").optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage("nama_suami maksimal 100 karakter."),
    ...dateValidators,
    body("anak_ke").optional({ nullable: true }).isInt({ min: 1 }).withMessage("anak_ke harus berupa bilangan bulat positif.").toInt(),
    body("jarak_anak_sebelum_bulan").optional({ nullable: true }).isInt({ min: 0 }).withMessage("jarak_anak_sebelum_bulan harus berupa bilangan bulat nol atau lebih.").toInt(),
    body("cara_persalinan").optional({ nullable: true }).isIn(caraPersalinan).withMessage("cara_persalinan tidak valid."),
    body("status_kehamilan").optional().isIn(statuses).withMessage("status_kehamilan tidak valid."),
  ];
};

const getKehamilanByWarga = [positiveId("warga_id")];
const getKehamilanById = [positiveId()];
const createKehamilan = [body("warga_id").isInt({ min: 1 }).withMessage("warga_id harus berupa ID positif.").toInt(), ...makePregnancyFields()];
const updateKehamilan = [positiveId(), ...makePregnancyFields().map((validator) => validator.optional())];
const updateStatusKehamilan = [positiveId(), body("status_kehamilan").isIn(statuses).withMessage("status_kehamilan tidak valid.")];

module.exports = {
  getKehamilanByWarga,
  getKehamilanById,
  createKehamilan,
  updateKehamilan,
  updateStatusKehamilan,
};
