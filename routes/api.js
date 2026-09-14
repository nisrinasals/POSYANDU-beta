const express = require("express");

const authController = require("../controllers/authController");
const kunjunganController = require("../controllers/kunjunganController");
const pemeriksaanController = require("../controllers/pemeriksaanController");
const posyanduController = require("../controllers/posyanduController");
const wargaController = require("../controllers/wargaController");
const { authenticateToken, authorize } = require("../middleware/authMiddleware");
const validateResult = require("../middleware/validationReporter");
const authValidators = require("../middleware/validators/authValidators");
const posyanduValidators = require("../middleware/validators/posyanduValidators");
const wargaValidators = require("../middleware/validators/wargaValidators");
const kunjunganValidators = require("../middleware/validators/kunjunganValidators");
const pemeriksaanValidators = require("../middleware/validators/pemeriksaanValidators");

const api = express.Router();
const authenticated = [authenticateToken, authorize("kader", "puskesmas", "dinkes")];

// Authentication routes
api.post("/auth/register", authValidators.register, validateResult, authController.register);
api.post("/auth/verify-otp", authValidators.verifyOtp, validateResult, authController.verifyOtp);
api.post("/auth/resend-otp", authValidators.resendOtp, validateResult, authController.resendOtp);
api.post("/auth/login", authValidators.login, validateResult, authController.login);
api.post("/auth/request-reset-password", authValidators.requestResetPassword, validateResult, authController.requestResetPassword);
api.post("/auth/reset-password", authValidators.resetPassword, validateResult, authController.resetPassword);
api.post("/auth/logout", authenticateToken, authController.logout);

// Posyandu routes
api.get("/posyandu", authenticated, posyanduValidators.listPosyandu, validateResult, posyanduController.getAllPosyandu);
api.get("/posyandu/:id", authenticated, posyanduValidators.getPosyanduById, validateResult, posyanduController.getPosyanduById);

// Warga routes
api.get("/warga", authenticated, wargaValidators.listFilters, validateResult, wargaController.getAllWarga);
api.get("/warga/export", authenticated, wargaValidators.listFilters, validateResult, wargaController.exportWargaExcel);
api.get("/warga/statistik-sasaran", authenticated, wargaController.getStatistikSasaran);
api.get("/warga/:id", authenticated, wargaValidators.getWargaById, validateResult, wargaController.getWargaById);
api.post("/warga", authenticated, wargaValidators.createWarga, validateResult, wargaController.createWarga);
api.put("/warga/:id", authenticated, wargaValidators.getWargaById, wargaValidators.updateWarga, validateResult, wargaController.updateWarga);
api.patch("/warga/:id/status-domisili", authenticated, wargaValidators.getWargaById, wargaValidators.updateStatusDomisili, validateResult, wargaController.updateStatusDomisili);

// Kunjungan routes
api.post("/kunjungan", authenticated, kunjunganValidators.createKunjungan, validateResult, kunjunganController.createKunjungan);
api.get("/kunjungan/antrean-hari-ini", authenticated, kunjunganValidators.antreanHariIni, validateResult, kunjunganController.getAntreanHariIni);
api.get("/kunjungan", authenticated, kunjunganValidators.listFilters, validateResult, kunjunganController.getAllKunjungan);
api.get("/kunjungan/:id", authenticated, kunjunganValidators.idOnly, validateResult, kunjunganController.getKunjunganById);
api.patch("/kunjungan/:id/status-langkah", authenticated, kunjunganValidators.updateStatusLangkah, validateResult, kunjunganController.updateStatusLangkah);
api.delete("/kunjungan/:id", authenticated, kunjunganValidators.idOnly, validateResult, kunjunganController.deleteKunjungan);

// Pemeriksaan routes
api.get("/pemeriksaan", authenticated, pemeriksaanValidators.listFilters, validateResult, pemeriksaanController.getAllPemeriksaan);
api.get("/pemeriksaan/:id", authenticated, pemeriksaanValidators.idOnly, validateResult, pemeriksaanController.getPemeriksaanById);
api.post("/pemeriksaan", authenticated, pemeriksaanValidators.createPemeriksaan, validateResult, pemeriksaanController.createPemeriksaan);
api.post("/pemeriksaan/step-2", authenticated, pemeriksaanValidators.saveStep2, validateResult, pemeriksaanController.saveStep2);
api.post("/pemeriksaan/step-4", authenticated, pemeriksaanValidators.saveStep4, validateResult, pemeriksaanController.saveStep4);
api.post("/pemeriksaan/step-5", authenticated, pemeriksaanValidators.saveStep5, validateResult, pemeriksaanController.saveStep5);
api.put("/pemeriksaan/:id", authenticated, pemeriksaanValidators.updatePemeriksaan, validateResult, pemeriksaanController.updatePemeriksaan);
api.delete("/pemeriksaan/:id", authenticated, pemeriksaanValidators.idOnly, validateResult, pemeriksaanController.deletePemeriksaan);

module.exports = api;
