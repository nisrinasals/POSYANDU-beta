"use strict";

const calculatePregnancyAge = (hpht, referenceDate = new Date()) => {
  if (!hpht || !referenceDate) return null;
  const start = new Date(`${hpht}T00:00:00Z`);
  const reference = new Date(referenceDate instanceof Date ? referenceDate : `${String(referenceDate).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(reference.getTime()) || start > reference) return null;

  const totalDays = Math.floor((reference.getTime() - start.getTime()) / 86400000);
  return { minggu: Math.floor(totalDays / 7), hari: totalDays % 7 };
};

const validateHphtAgainstDate = (hpht, referenceDate = new Date()) => {
  if (!hpht) return null;
  const start = new Date(`${hpht}T00:00:00Z`);
  const reference = new Date(referenceDate instanceof Date ? referenceDate : `${String(referenceDate).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(reference.getTime())) return "HPHT atau tanggal pemeriksaan tidak valid.";
  if (start > reference) return "HPHT tidak boleh lebih besar dari tanggal pemeriksaan.";
  return null;
};

module.exports = { calculatePregnancyAge, validateHphtAgainstDate };
