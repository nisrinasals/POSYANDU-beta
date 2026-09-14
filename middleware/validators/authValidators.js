"use strict";

const { body } = require("express-validator");

const email = body("email").trim().isEmail().withMessage("Email tidak valid.").normalizeEmail();
const otp = body("otp_code")
  .trim()
  .matches(/^\d{6}$/)
  .withMessage("OTP harus terdiri dari 6 digit angka.");
const password = body("password").isString().isLength({ min: 8, max: 72 }).withMessage("Password harus 8 sampai 72 karakter.");
const newPassword = body("new_password").isString().isLength({ min: 8, max: 72 }).withMessage("Password baru harus 8 sampai 72 karakter.");

const register = [
  body("role").trim().isIn(["kader", "puskesmas", "puskesmasAdmin", "dinkes", "dinkesAdmin", "sa"]).withMessage("Role tidak valid."),
  email,
  password,
  body("nama_lengkap").trim().isLength({ min: 2, max: 100 }).withMessage("Nama lengkap harus 2 sampai 100 karakter."),
  body("telepon").optional().trim().isLength({ max: 20 }).withMessage("Telepon maksimal 20 karakter."),
  body("nik")
    .optional()
    .trim()
    .matches(/^\d{16}$/)
    .withMessage("NIK harus terdiri dari 16 digit angka."),
  body("puskesmas_id").optional().isInt({ min: 1 }).withMessage("puskesmas_id harus berupa ID positif.").toInt(),
  body("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
];

const verifyOtp = [email, otp, body("purpose").trim().isIn(["register", "reset_password"]).withMessage("Purpose OTP tidak valid.")];
const resendOtp = [email, body("purpose").trim().isIn(["register", "reset_password"]).withMessage("Purpose OTP tidak valid.")];
const login = [email, body("password").isString().notEmpty().withMessage("Password wajib diisi.")];
const requestResetPassword = [email];
const resetPassword = [email, otp, newPassword];

module.exports = { register, verifyOtp, resendOtp, login, requestResetPassword, resetPassword };
