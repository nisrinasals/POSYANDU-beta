const jwt = require("jsonwebtoken");
const { User, Puskesmas, Posyandu } = require("../models");

/**
 * Middleware untuk memverifikasi JWT Token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <TOKEN>"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan.",
      });
    }

    // Verifikasi Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user di database beserta relasi wilayahnya
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password_hash"] },
      include: [
        { model: Puskesmas, as: "puskesmas", attributes: ["id", "nama_puskesmas"] },
        { model: Posyandu, as: "posyandu", attributes: ["id", "nama_posyandu"] },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid. User tidak ditemukan.",
      });
    }

    if (decoded.token_version !== user.token_version) {
      return res.status(401).json({
        success: false,
        message: "Token sudah tidak berlaku. Silakan login kembali.",
      });
    }

    // Cek status keaktifan user
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Akun tidak dapat digunakan. Status akun saat ini: ${user.status}`,
      });
    }

    if (user.email_verified === false) {
      if (["dinkes", "dinkesAdmin"].includes(user.role)) {
        return res.status(403).json({ success: false, message: "Role Dinkes hanya dapat mengakses data agregat setelah autentikasi akun selesai." });
      }
      return res.status(403).json({ success: false, message: "Email belum diverifikasi." });
    }

    // Attach data user ke objek request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token telah kedaluwarsa. Silakan login kembali.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Token tidak valid.",
    });
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan Role User.
 * @param  {...string} allowedRoles - Daftar role yang diizinkan mengakses endpoint
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Silakan autentikasi/login terlebih dahulu.",
      });
    }

    if (req.user.role === "sa") {
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Hak akses [${req.user.role}] tidak memiliki izin untuk melakukan aksi ini.`,
    });
  };
};

const denyDinkesPersonalData = (req, res, next) => {
  if (["dinkes", "dinkesAdmin"].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: "Role dinkes hanya dapat mengakses data agregat." });
  }
  return next();
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeRoles: authorize,
  denyDinkesPersonalData,
};
