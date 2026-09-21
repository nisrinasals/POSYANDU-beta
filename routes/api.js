const express = require("express");

const authController = require("../controllers/authController");
const kunjunganController = require("../controllers/kunjunganController");
const pemeriksaanController = require("../controllers/pemeriksaanController");
const sesiPosyanduController = require("../controllers/sesiPosyanduController");
const posyanduController = require("../controllers/posyanduController");
const wargaController = require("../controllers/wargaController");
const kehamilanController = require("../controllers/kehamilanController");
const userController = require("../controllers/userController");
const imunisasiController = require("../controllers/imunisasiController");
const rujukanController = require("../controllers/rujukanController");

const uploadProfilePicture = require("../middleware/uploadProfilePicture");
const { authenticateToken, authorize, denyDinkesPersonalData } = require("../middleware/authMiddleware");
const { validator, validateResult } = require("../middleware/validationReporter");

const api = express.Router();

const authenticated = [authenticateToken, authorize("kader", "puskesmas", "puskesmasAdmin", "dinkes", "dinkesAdmin", "sa")];
const personalAuthenticated = [...authenticated, denyDinkesPersonalData];

// ======================================================
// Authentication routes
// ======================================================

api.post("/auth/register", validator.auth.register, validateResult, authController.register);
api.post("/auth/verify-otp", validator.auth.verifyOtp, validateResult, authController.verifyOtp);
api.post("/auth/resend-otp", validator.auth.resendOtp, validateResult, authController.resendOtp);
api.post("/auth/login", validator.auth.login, validateResult, authController.login);
api.post("/auth/request-reset-password", validator.auth.requestResetPassword, validateResult, authController.requestResetPassword);
api.post("/auth/reset-password", validator.auth.resetPassword, validateResult, authController.resetPassword);
api.post("/auth/logout", authenticateToken, authController.logout);

// ======================================================
// Posyandu routes
// ======================================================

api.get("/posyandu", authenticated, validator.posyandu.listPosyandu, validateResult, posyanduController.getAllPosyandu);
api.get("/posyandu/:id", authenticated, validator.posyandu.getPosyanduById, validateResult, posyanduController.getPosyanduById);

// ======================================================
// Warga routes
// ======================================================

api.get("/warga", personalAuthenticated, validator.warga.listFilters, validateResult, wargaController.getAllWarga);
api.get("/warga/export", personalAuthenticated, validator.warga.listFilters, validateResult, wargaController.exportWargaExcel);
api.get("/warga/statistik-sasaran", authenticated, wargaController.getStatistikSasaran);
api.get("/warga/:id", personalAuthenticated, validator.warga.getWargaById, validateResult, wargaController.getWargaById);
api.post("/warga", personalAuthenticated, validator.warga.createWarga, validateResult, wargaController.createWarga);
api.put("/warga/:id", personalAuthenticated, validator.warga.getWargaById, validator.warga.updateWarga, validateResult, wargaController.updateWarga);
api.patch("/warga/:id/status-domisili", personalAuthenticated, validator.warga.getWargaById, validator.warga.updateStatusDomisili, validateResult, wargaController.updateStatusDomisili);
api.post("/warga/mutasi/verify", personalAuthenticated, validator.warga.verifyMutasi, validateResult, wargaController.verifyMutasiWarga);
api.patch("/warga/mutasi/confirm", personalAuthenticated, validator.warga.confirmMutasi, validateResult, wargaController.confirmMutasiWarga);

// ======================================================
// Imunisasi routes
// ======================================================

api.get("/imunisasi/warga/:warga_id", personalAuthenticated, validator.imunisasi.wargaParam, validateResult, imunisasiController.getImunisasiByWarga);
api.get("/imunisasi/:id", personalAuthenticated, validator.imunisasi.id, validateResult, imunisasiController.getImunisasiById);
api.post("/imunisasi", personalAuthenticated, validator.imunisasi.create, validateResult, imunisasiController.createImunisasi);
api.put("/imunisasi/:id", personalAuthenticated, validator.imunisasi.update, validateResult, imunisasiController.updateImunisasi);

// ======================================================
// Sesi Posyandu routes
// ======================================================

api.get("/sesi-posyandu", authenticated, validator.sesiPosyandu.list, validateResult, sesiPosyanduController.getSesiPosyandu);
api.get("/sesi-posyandu/:id", authenticated, validator.sesiPosyandu.id, validateResult, sesiPosyanduController.getSesiPosyanduById);
api.post("/sesi-posyandu", authenticated, validator.sesiPosyandu.create, validateResult, sesiPosyanduController.createSesiPosyandu);
api.put("/sesi-posyandu/:id", authenticated, validator.sesiPosyandu.update, validateResult, sesiPosyanduController.updateSesiPosyandu);
api.patch("/sesi-posyandu/:id/status", authenticated, validator.sesiPosyandu.updateStatus, validateResult, sesiPosyanduController.updateSesiPosyanduStatus);

// ======================================================
// User administration routes
// ======================================================

api.patch("/users/:id/verify", authenticateToken, authorize("puskesmasAdmin", "dinkesAdmin", "sa"), validator.user.verifyUser, validateResult, userController.verifyUser);
api.patch("/users/:id/deactivate", authenticateToken, authorize("puskesmasAdmin", "dinkesAdmin", "sa"), validator.user.deactivateUser, validateResult, userController.deactivateUser);
api.put("/users/:id/puskesmas-admin", authenticateToken, authorize("dinkesAdmin", "sa"), validator.user.replacePuskesmasAdmin, validateResult, userController.replacePuskesmasAdmin);
api.put("/users/:id/dinkes-admin", authenticateToken, authorize("dinkesAdmin", "sa"), validator.user.replaceDinkesAdmin, validateResult, userController.replaceDinkesAdmin);
api.get("/users/me", authenticateToken, userController.getMyProfile);
api.patch("/users/me", authenticateToken, validator.user.updateMyProfile, validateResult, userController.updateMyProfile);
api.post("/users/me/profile-picture", authenticateToken, uploadProfilePicture, userController.uploadProfilePicture);
api.get("/users", authenticateToken, authorize("puskesmasAdmin", "dinkesAdmin", "sa"), validator.user.getUsers, validateResult, userController.getUsers);
api.get("/users/:id", authenticateToken, authorize("puskesmasAdmin", "dinkesAdmin", "sa"), validator.user.getUserById, validateResult, userController.getUserById);
api.patch("/users/:id/role", authenticateToken, authorize("sa"), validator.user.changeUserRole, validateResult, userController.changeUserRole);
api.patch("/users/:id/status", authenticateToken, authorize("puskesmasAdmin", "dinkesAdmin", "sa"), validator.user.changeUserStatus, validateResult, userController.changeUserStatus);

// ======================================================
// Kehamilan routes
// ======================================================

api.get("/kehamilan/warga/:warga_id", personalAuthenticated, validator.kehamilan.getKehamilanByWarga, validateResult, kehamilanController.getKehamilanByWarga);
api.get("/kehamilan/:id", personalAuthenticated, validator.kehamilan.getKehamilanById, validateResult, kehamilanController.getKehamilanById);
api.post("/kehamilan", personalAuthenticated, validator.kehamilan.createKehamilan, validateResult, kehamilanController.createKehamilan);
api.put("/kehamilan/:id", personalAuthenticated, validator.kehamilan.updateKehamilan, validateResult, kehamilanController.updateKehamilan);
api.patch("/kehamilan/:id/status", personalAuthenticated, validator.kehamilan.updateStatusKehamilan, validateResult, kehamilanController.updateStatusKehamilan);

// ======================================================
// Kunjungan routes
// ======================================================

api.post("/kunjungan", personalAuthenticated, validator.kunjungan.createKunjungan, validateResult, kunjunganController.createKunjungan);
api.get("/kunjungan/antrean-hari-ini", personalAuthenticated, validator.kunjungan.antreanHariIni, validateResult, kunjunganController.getAntreanHariIni);
api.get("/kunjungan", personalAuthenticated, validator.kunjungan.listFilters, validateResult, kunjunganController.getAllKunjungan);
api.get("/kunjungan/:id", personalAuthenticated, validator.kunjungan.idOnly, validateResult, kunjunganController.getKunjunganById);
api.patch("/kunjungan/:id/status-langkah", personalAuthenticated, validator.kunjungan.updateStatusLangkah, validateResult, kunjunganController.updateStatusLangkah);
api.delete("/kunjungan/:id", personalAuthenticated, validator.kunjungan.idOnly, validateResult, kunjunganController.deleteKunjungan);

// ======================================================
// Pemeriksaan routes
// ======================================================

api.get("/pemeriksaan", personalAuthenticated, validator.pemeriksaan.listFilters, validateResult, pemeriksaanController.getAllPemeriksaan);
api.get("/pemeriksaan/export", personalAuthenticated, validator.pemeriksaan.listFilters, validateResult, pemeriksaanController.exportPemeriksaanExcel);
api.get("/pemeriksaan/:id/step-3", personalAuthenticated, validator.pemeriksaan.idOnly, validateResult, pemeriksaanController.getStep3Pemeriksaan);
api.get("/pemeriksaan/:id/screening-history", personalAuthenticated, validator.pemeriksaan.idOnly, validateResult, pemeriksaanController.getScreeningHistory);
api.get("/pemeriksaan/:id", personalAuthenticated, validator.pemeriksaan.idOnly, validateResult, pemeriksaanController.getPemeriksaanById);
api.post("/pemeriksaan", personalAuthenticated, validator.pemeriksaan.createPemeriksaan, validateResult, pemeriksaanController.createPemeriksaan);
api.post("/pemeriksaan/step-2", personalAuthenticated, validator.pemeriksaan.saveStep2, validateResult, pemeriksaanController.saveStep2);
api.post("/pemeriksaan/step-4", personalAuthenticated, validator.pemeriksaan.saveStep4, validateResult, pemeriksaanController.saveStep4);
api.post("/pemeriksaan/step-5", personalAuthenticated, validator.pemeriksaan.saveStep5, validateResult, pemeriksaanController.saveStep5);
api.put("/pemeriksaan/:id", personalAuthenticated, validator.pemeriksaan.updatePemeriksaan, validateResult, pemeriksaanController.updatePemeriksaan);
api.delete("/pemeriksaan/:id", personalAuthenticated, validator.pemeriksaan.idOnly, validateResult, pemeriksaanController.deletePemeriksaan);

// ======================================================
// Rujukan routes
// ======================================================

api.get("/rujukan", personalAuthenticated, validator.rujukan.listFilters, validateResult, rujukanController.getAllRujukan);
api.get("/rujukan/:id/export", personalAuthenticated, validator.rujukan.idOnly, validateResult, rujukanController.exportRujukanPdf);
api.get("/rujukan/:id", personalAuthenticated, validator.rujukan.idOnly, validateResult, rujukanController.getRujukanById);

module.exports = api;
