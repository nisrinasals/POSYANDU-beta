"use strict";

const { QueryTypes } = require("sequelize");
const { SesiPosyandu } = require("../models");

const getDatabaseDate = async () => {
  const [row] = await SesiPosyandu.sequelize.query("SELECT CURRENT_DATE AS tanggal", { type: QueryTypes.SELECT });
  return row.tanggal;
};

const dateDifferenceInDays = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.floor((end - start) / 86400000);
};

const assertSessionManager = (user) => {
  if (!user || !["kader", "sa"].includes(user.role)) {
    const error = new Error("Hanya kader yang dapat mengisi atau mengubah sesi Posyandu.");
    error.statusCode = 403;
    throw error;
  }
};

const assertKaderCanMutateSessionOnDate = (session, today) => {
  if (!session) {
    const error = new Error("Sesi Posyandu tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }
  const dayOffset = dateDifferenceInDays(session.tanggal_pelaksanaan, today);
  if (dayOffset < 0) {
    const error = new Error("Kader belum dapat mengisi atau mengubah pemeriksaan sebelum tanggal pelaksanaan.");
    error.statusCode = 400;
    throw error;
  }
  if (dayOffset > 6) {
    const error = new Error("Batas waktu pengisian pemeriksaan oleh kader telah berakhir (maksimal seminggu).");
    error.statusCode = 403;
    throw error;
  }
  if (session.status === "closed") {
    const error = new Error("Sesi Posyandu sudah ditutup. Data pemeriksaan tidak dapat diubah oleh kader.");
    error.statusCode = 400;
    throw error;
  }
};

const assertKaderCanMutateSession = async (session) => {
  assertKaderCanMutateSessionOnDate(session, await getDatabaseDate());
};

module.exports = { getDatabaseDate, dateDifferenceInDays, assertSessionManager, assertKaderCanMutateSessionOnDate, assertKaderCanMutateSession };
