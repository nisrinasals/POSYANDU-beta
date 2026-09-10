const express = require("express");

const authController = require("./controllers/authController");
const kunjunganController = require("./controllers/kunjunganController");
const pemeriksaanController = require("./controllers/pemeriksaanController");
const posyanduController = require("./controllers/posyanduController");
const wargaController = require("./controllers/wargaController");
const { authenticateToken, authorize } = require("./middleware/authMiddleware");

const api = express.Router();
const authenticated = [authenticateToken, authorize("kader", "puskesmas", "dinkes")];

// Authentication routes
api.post("/auth/register", authController.register);
api.post("/auth/verify-otp", authController.verifyOtp);
api.post("/auth/resend-otp", authController.resendOtp);
api.post("/auth/login", authController.login);
api.post("/auth/request-reset-password", authController.requestResetPassword);
api.post("/auth/reset-password", authController.resetPassword);
api.post("/auth/logout", authenticateToken, authController.logout);

// Posyandu routes
api.get("/posyandu", authenticated, posyanduController.getAllPosyandu);
api.get("/posyandu/:id", authenticated, posyanduController.getPosyanduById);

// Warga routes
api.get("/warga", authenticated, wargaController.getAllWarga);
api.get("/warga/export", authenticated, wargaController.exportWargaExcel);
api.get("/warga/statistik-sasaran", authenticated, wargaController.getStatistikSasaran);
api.get("/warga/:id", authenticated, wargaController.getWargaById);
api.post("/warga", authenticated, wargaController.createWarga);
api.put("/warga/:id", authenticated, wargaController.updateWarga);
api.patch("/warga/:id/status-domisili", authenticated, wargaController.updateStatusDomisili);

// Kunjungan routes
api.post("/kunjungan", authenticated, kunjunganController.createKunjungan);
api.get("/kunjungan/antrean-hari-ini", authenticated, kunjunganController.getAntreanHariIni);
api.get("/kunjungan", authenticated, kunjunganController.getAllKunjungan);
api.get("/kunjungan/:id", authenticated, kunjunganController.getKunjunganById);
api.patch("/kunjungan/:id/status-langkah", authenticated, kunjunganController.updateStatusLangkah);
api.delete("/kunjungan/:id", authenticated, kunjunganController.deleteKunjungan);

// Pemeriksaan routes
api.get("/pemeriksaan", authenticated, pemeriksaanController.getAllPemeriksaan);
api.get("/pemeriksaan/:id", authenticated, pemeriksaanController.getPemeriksaanById);
api.post("/pemeriksaan", authenticated, pemeriksaanController.createPemeriksaan);
api.post("/pemeriksaan/step-2", authenticated, pemeriksaanController.saveStep2);
api.post("/pemeriksaan/step-4", authenticated, pemeriksaanController.saveStep4);
api.post("/pemeriksaan/step-5", authenticated, pemeriksaanController.saveStep5);
api.put("/pemeriksaan/:id", authenticated, pemeriksaanController.updatePemeriksaan);
api.delete("/pemeriksaan/:id", authenticated, pemeriksaanController.deletePemeriksaan);

module.exports = api;
