"use strict";
const { validationResult } = require("express-validator");

const authValidators = require("./validators/authValidators");
const commonValidators = require("./validators/common");
const kehamilanValidator = require("./validators/kehamilanValidator");
const kunjunganValidators = require("./validators/kunjunganValidators");
const pemeriksaanValidators = require("./validators/pemeriksaanValidators");
const posyanduValidators = require("./validators/posyanduValidators");
const sesiPosyanduValidators = require("./validators/sesiPosyanduValidators");
const userValidators = require("./validators/userValidators");
const wargaValidators = require("./validators/wargaValidators");
const imunisasiValidators = require("./validators/imunisasiValidators");

const validator = {
  auth: authValidators,
  common: commonValidators,
  kehamilan: kehamilanValidator,
  kunjungan: kunjunganValidators,
  pemeriksaan: pemeriksaanValidators,
  posyandu: posyanduValidators,
  sesiPosyandu: sesiPosyanduValidators,
  user: userValidators,
  warga: wargaValidators,
  imunisasi: imunisasiValidators,
};

const validateResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validasi data gagal",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = {
  validator,
  validateResult,
};
