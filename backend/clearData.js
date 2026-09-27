require("dotenv").config();
const {
  sequelize,
  Pemeriksaan,
  ProfileKehamilan,
  KunjunganPosyandu,
  Warga,
  SesiPosyandu,
  AuditLog,
  EmailOtp
} = require("./models");

async function clearData() {
  try {
    console.log("=== MENGOSONGKAN DATA TRANSAKSI POSYANDU ===");
    await sequelize.authenticate();
    console.log("Database terkoneksi.");

    // Hapus data secara berurutan sesuai relasi foreign key
    console.log("1. Menghapus data Pemeriksaan...");
    if (Pemeriksaan) await Pemeriksaan.destroy({ where: {}, truncate: { cascade: true }, restartIdentity: true }).catch(() => Pemeriksaan.destroy({ where: {} }));

    console.log("2. Menghapus data Profil Kehamilan...");
    if (ProfileKehamilan) await ProfileKehamilan.destroy({ where: {}, truncate: { cascade: true }, restartIdentity: true }).catch(() => ProfileKehamilan.destroy({ where: {} }));

    console.log("3. Menghapus data Kunjungan Posyandu...");
    if (KunjunganPosyandu) await KunjunganPosyandu.destroy({ where: {}, truncate: { cascade: true }, restartIdentity: true }).catch(() => KunjunganPosyandu.destroy({ where: {} }));

    console.log("4. Menghapus data Sasaran (Warga)...");
    if (Warga) await Warga.destroy({ where: {}, truncate: { cascade: true }, restartIdentity: true }).catch(() => Warga.destroy({ where: {} }));

    console.log("5. Menghapus data Sesi / Jadwal Posyandu...");
    if (SesiPosyandu) await SesiPosyandu.destroy({ where: {}, truncate: { cascade: true }, restartIdentity: true }).catch(() => SesiPosyandu.destroy({ where: {} }));

    console.log("6. Menghapus data Log & OTP...");
    if (AuditLog) await AuditLog.destroy({ where: {} }).catch(() => {});
    if (EmailOtp) await EmailOtp.destroy({ where: {} }).catch(() => {});

    console.log("✅ SUKSES: Seluruh data sasaran, pemeriksaan, dan jadwal posyandu berhasil dikosongkan!");
    console.log("ℹ️ Akun login (Users) & Data Wilayah (Posyandu/Puskesmas) tetap aman dan siap digunakan.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal mengosongkan data:", error.message);
    process.exit(1);
  }
}

clearData();
