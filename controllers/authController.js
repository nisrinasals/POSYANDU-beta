const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, EmailOtp, Puskesmas, Posyandu } = require("../models");
const sendEmail = require("../utils/mailer");

/**
 * Helper untuk membuat 6 digit angka OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 1. REGISTER USER BARU
 */
const register = async (req, res, next) => {
  try {
    const { role, email, password, nama_lengkap, telepon, nik, puskesmas_id, posyandu_id } = req.body;

    // Cek apakah email atau NIK sudah terdaftar
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, ...(nik ? [{ nik }] : [])],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email atau NIK sudah terdaftar dalam sistem.",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Buat User Baru (Default Status: pending_approval, token_version: 1)
    const newUser = await User.create({
      role,
      email,
      password_hash,
      nama_lengkap,
      telepon,
      nik: nik || null,
      puskesmas_id: puskesmas_id || null,
      posyandu_id: posyandu_id || null,
      status: "pending_approval",
      token_version: 1,
    });

    // Generate OTP untuk Verifikasi Email
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Berlaku 10 menit

    await EmailOtp.create({
      email,
      otp_code: otpCode,
      purpose: "register",
      expires_at: expiresAt,
    });

    // Kirim Email OTP Pendaftaran
    await sendEmail({
      to: email,
      subject: "Kode OTP Verifikasi Pendaftaran Posyandu",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Halo ${nama_lengkap},</h2>
          <p>Terima kasih telah mendaftar di Sistem Informasi Posyandu.</p>
          <p>Kode OTP verifikasi email kamu adalah:</p>
          <h1 style="color: #2b6cb0; letter-spacing: 4px;">${otpCode}</h1>
          <p>Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.</p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil. Silakan cek email kamu untuk verifikasi kode OTP.",
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. VERIFIKASI OTP (Register / Umum)
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp_code, purpose } = req.body;

    const otpRecord = await EmailOtp.findOne({
      where: {
        email,
        otp_code,
        purpose,
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [["id", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Kode OTP tidak valid atau sudah kedaluwarsa.",
      });
    }

    // Tandai OTP telah digunakan
    await otpRecord.update({ is_used: true });

    if (purpose === "register") {
      return res.status(200).json({
        success: true,
        message: "Verifikasi email berhasil. Akun kamu saat ini menunggu persetujuan (approval) dari admin.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verifikasi OTP berhasil.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. RESEND OTP
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    // Mencegah spam kirim OTP (minimal jeda 1 menit)
    const lastOtp = await EmailOtp.findOne({
      where: { email, purpose, is_used: false },
      order: [["id", "DESC"]],
    });

    if (lastOtp && new Date() < new Date(lastOtp.expires_at.getTime() - 9 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: "Silakan tunggu 1 menit sebelum meminta kode OTP baru.",
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailOtp.create({
      email,
      otp_code: otpCode,
      purpose,
      expires_at: expiresAt,
    });

    await sendEmail({
      to: email,
      subject: "Kode OTP Baru Anda",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Kode OTP baru kamu adalah:</p>
          <h1 style="color: #2b6cb0; letter-spacing: 4px;">${otpCode}</h1>
          <p>Berlaku selama 10 menit.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Kode OTP baru telah dikirimkan ke email kamu.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. LOGIN USER (Single Device Enforcement via token_version)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Puskesmas, as: "puskesmas", attributes: ["id", "nama_puskesmas"] },
        { model: Posyandu, as: "posyandu", attributes: ["id", "nama_posyandu"] },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    if (user.status === "pending_approval") {
      return res.status(403).json({
        success: false,
        message: "Akun kamu masih menunggu persetujuan (approval) dari admin.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Akun tidak dapat digunakan. Status saat ini: ${user.status}`,
      });
    }

    // 1. Naikkan versi token_version di DB agar login di device/sesi lain otomatis gugur
    await user.increment("token_version");
    await user.reload();

    // 2. Masukkan token_version terbaru ke dalam payload JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      puskesmas_id: user.puskesmas_id,
      posyandu_id: user.posyandu_id,
      token_version: user.token_version,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      data: {
        token,
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          email: user.email,
          role: user.role,
          status: user.status,
          puskesmas: user.puskesmas,
          posyandu: user.posyandu,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5a. REQUEST RESET PASSWORD (Minta Kode OTP via Email)
 */
const requestResetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Keamanan: Jika user tidak ditemukan, tetap beri respon sukses generik agar email tidak bisa di-enumerate
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Jika email terdaftar dalam sistem, kode OTP untuk reset password telah dikirimkan.",
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    await EmailOtp.create({
      email,
      otp_code: otpCode,
      purpose: "reset_password",
      expires_at: expiresAt,
    });

    // Kirim Email OTP Reset Password
    await sendEmail({
      to: email,
      subject: "Kode OTP Reset Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>Permintaan Reset Password</h3>
          <p>Kami menerima permintaan untuk mereset password akun kamu. Kode OTP kamu adalah:</p>
          <h1 style="color: #e53e3e; letter-spacing: 4px;">${otpCode}</h1>
          <p>Kode ini berlaku selama 10 menit. Jika kamu tidak merasa melakukan permintaan ini, abaikan email ini.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Jika email terdaftar dalam sistem, kode OTP untuk reset password telah dikirimkan.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5b. EXECUTE RESET PASSWORD (Verifikasi OTP + Set Password Baru)
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp_code, new_password } = req.body;

    const otpRecord = await EmailOtp.findOne({
      where: {
        email,
        otp_code,
        purpose: "reset_password",
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [["id", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Kode OTP tidak valid atau telah kedaluwarsa.",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const new_password_hash = await bcrypt.hash(new_password, salt);

    // Update password sekaligus naikkan token_version agar semua sesi login lama otomatis tertendang
    await user.update({
      password_hash: new_password_hash,
      token_version: user.token_version + 1,
    });

    // Tandai OTP telah digunakan
    await otpRecord.update({ is_used: true });

    return res.status(200).json({
      success: true,
      message: "Password berhasil diperbarui. Silakan login kembali dengan password baru.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. LOGOUT USER
 */
const logout = async (req, res, next) => {
  try {
    // Increment token_version milik user yang sedang terautentikasi
    await User.increment("token_version", { where: { id: req.user.id } });

    return res.status(200).json({
      success: true,
      message: "Berhasil logout.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  requestResetPassword,
  resetPassword,
  logout,
};
