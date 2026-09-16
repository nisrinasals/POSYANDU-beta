"use strict";

const { AuditLog } = require("../models");

// Konsisten dengan konvensi naming action pada dokumentasi Audit Log
const AUDIT_ACTIONS = {
  AUTH_REGISTER: "AUTH_REGISTER",
  AUTH_VERIFY: "AUTH_VERIFY",
  AUTH_LOGIN: "AUTH_LOGIN",
  AUTH_LOGOUT: "AUTH_LOGOUT",
  AUTH_RESET_PASSWORD: "AUTH_RESET_PASSWORD",
  AUTH_RESEND_OTP: "AUTH_RESEND_OTP",

  USER_ROLE_UPDATE: "USER_ROLE_UPDATE",
  USER_STATUS_UPDATE: "USER_STATUS_UPDATE",

  WARGA_CREATE: "WARGA_CREATE",
  WARGA_UPDATE: "WARGA_UPDATE",
  WARGA_STATUS_UPDATE: "WARGA_STATUS_UPDATE",
  WARGA_MUTATION: "WARGA_MUTATION",

  KEHAMILAN_CREATE: "KEHAMILAN_CREATE",
  KEHAMILAN_UPDATE: "KEHAMILAN_UPDATE",
  KEHAMILAN_STATUS_UPDATE: "KEHAMILAN_STATUS_UPDATE",

  KUNJUNGAN_CREATE: "KUNJUNGAN_CREATE",
  KUNJUNGAN_UPDATE: "KUNJUNGAN_UPDATE",
  KUNJUNGAN_DELETE: "KUNJUNGAN_DELETE",

  PEMERIKSAAN_CREATE: "PEMERIKSAAN_CREATE",
  PEMERIKSAAN_UPDATE: "PEMERIKSAAN_UPDATE",
  PEMERIKSAAN_DELETE: "PEMERIKSAAN_DELETE",

  SESI_CREATE: "SESI_CREATE",
  SESI_UPDATE: "SESI_UPDATE",
  SESI_STATUS_UPDATE: "SESI_STATUS_UPDATE",

  IMUNISASI_CREATE: "IMUNISASI_CREATE",
  IMUNISASI_UPDATE: "IMUNISASI_UPDATE",
  IMUNISASI_DELETE: "IMUNISASI_DELETE",
};

// Kata kunci field yang tidak boleh pernah tersimpan di audit log
const SENSITIVE_KEY_PATTERNS = ["password", "otp", "token", "jwt", "secret", "credential"];

const isSensitiveKey = (key) => {
  const normalized = String(key).toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => normalized.includes(pattern));
};

/**
 * Menghapus field sensitif secara rekursif agar tidak pernah tersimpan di audit_log.
 */
const sanitizeValue = (value) => {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item));
  if (value instanceof Date) return value;
  if (typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, val]) => {
      if (isSensitiveKey(key)) return acc;
      acc[key] = sanitizeValue(val);
      return acc;
    }, {});
  }
  return value;
};

/**
 * Membuat satu entri audit log. Fail-safe: kegagalan logging tidak boleh menggagalkan business operation pemanggil.
 */
const createAuditLog = async ({ userId = null, action, tableName, recordId = null, oldValue = null, newValue = null }) => {
  try {
    await AuditLog.create({
      user_id: userId ?? null,
      action,
      table_name: tableName,
      record_id: recordId ?? null,
      old_value: sanitizeValue(oldValue),
      new_value: sanitizeValue(newValue),
    });
  } catch (error) {
    console.error(`[AuditLog] Gagal mencatat audit log untuk action [${action}] pada tabel [${tableName}]:`, error);
  }
};

module.exports = { createAuditLog, sanitizeValue, AUDIT_ACTIONS };
