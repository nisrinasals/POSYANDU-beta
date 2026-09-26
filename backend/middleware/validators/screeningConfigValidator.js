const { body } = require("express-validator");

const updateScreeningConfig = [
  body().isObject().withMessage("Format konfigurasi tidak valid"),
  body("asi_eksklusif_months").optional().isArray().withMessage("asi_eksklusif_months harus berupa array"),
  body("asi_eksklusif_months.*").optional().isInt({ min: 1, max: 12 }).withMessage("Bulan ASI eksklusif harus berupa angka 1-12"),
  body("mpasi_min_age_months").optional().isInt({ min: 0 }).withMessage("mpasi_min_age_months harus berupa angka"),
  body("mpasi_max_age_months").optional().isInt({ min: 0 }).withMessage("mpasi_max_age_months harus berupa angka"),
  body("vitamin_a_months").optional().isArray().withMessage("vitamin_a_months harus berupa array"),
  body("vitamin_a_months.*").optional().isInt({ min: 1, max: 12 }).withMessage("Bulan vitamin A harus berupa angka 1-12"),
  body("obat_cacing_months").optional().isArray().withMessage("obat_cacing_months harus berupa array"),
  body("obat_cacing_months.*").optional().isInt({ min: 1, max: 12 }).withMessage("Bulan obat cacing harus berupa angka 1-12"),
];

module.exports = {
  updateScreeningConfig,
};
