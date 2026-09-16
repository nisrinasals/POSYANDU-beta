"use strict";

const productionRequiredEnv = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "DB_DIALECT", "JWT_SECRET", "CORS_ORIGIN", "SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"];

const getCorsOptions = () => {
  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production" && configuredOrigins.length === 0) {
    throw new Error("CORS_ORIGIN wajib diisi pada environment production.");
  }

  if (configuredOrigins.length === 0) return { origin: true };

  return {
    origin: (origin, callback) => {
      if (!origin || configuredOrigins.includes("*") || configuredOrigins.includes(origin)) return callback(null, true);
      const error = new Error("Origin tidak diizinkan oleh kebijakan CORS.");
      error.statusCode = 403;
      return callback(error);
    },
  };
};

const validateProductionEnvironment = () => {
  if (process.env.NODE_ENV !== "production") return;

  const missing = productionRequiredEnv.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length > 0) throw new Error(`Environment production belum lengkap: ${missing.join(", ")}.`);
  if (process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET production harus memiliki minimal 32 karakter.");
  if (process.env.CORS_ORIGIN.trim() === "*") throw new Error("CORS_ORIGIN production tidak boleh menggunakan wildcard.");
};

const getOtpDurationMs = () => {
  const minutes = Number(process.env.OTP_EXPIRES_MINUTES || 10);
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 * 1000 : 10 * 60 * 1000;
};

const getOtpCooldownMs = () => {
  const minutes = Number(process.env.OTP_RESEND_COOLDOWN_MINUTES || 1);
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 * 1000 : 60 * 1000;
};

module.exports = { getCorsOptions, validateProductionEnvironment, getOtpDurationMs, getOtpCooldownMs };
