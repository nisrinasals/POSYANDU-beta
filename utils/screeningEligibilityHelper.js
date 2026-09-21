"use strict";

const getAgeMonths = (tanggalLahir, tanggalPemeriksaan = new Date()) => {
  if (!tanggalLahir) return null;
  const birth = new Date(`${tanggalLahir}T00:00:00Z`);
  const reference = new Date(tanggalPemeriksaan instanceof Date ? tanggalPemeriksaan : `${String(tanggalPemeriksaan).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) return null;
  let months = (reference.getUTCFullYear() - birth.getUTCFullYear()) * 12 + reference.getUTCMonth() - birth.getUTCMonth();
  if (reference.getUTCDate() < birth.getUTCDate()) months -= 1;
  return months;
};

const getScreeningEligibility = (tanggalLahir, tanggalPemeriksaan = new Date()) => {
  const ageMonths = getAgeMonths(tanggalLahir, tanggalPemeriksaan);
  const month = new Date(tanggalPemeriksaan instanceof Date ? tanggalPemeriksaan : `${String(tanggalPemeriksaan).slice(0, 10)}T00:00:00Z`).getUTCMonth() + 1;
  return {
    age_months: ageMonths,
    is_asi_eksklusif_active: ageMonths !== null && ageMonths >= 0 && ageMonths <= 6,
    is_mpasi_active: ageMonths !== null && ageMonths >= 6 && ageMonths <= 11,
    is_vitamin_a_active: month === 2 || month === 8,
  };
};

const validateIrreversibleAsi = (existingValue, incomingValue) => {
  if (existingValue === false && incomingValue === true) return "is_asi_eksklusif tidak dapat diubah dari false menjadi true.";
  return null;
};

module.exports = { getAgeMonths, getScreeningEligibility, validateIrreversibleAsi };
