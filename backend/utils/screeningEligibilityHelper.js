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

const getExaminationMonth = (tanggalPemeriksaan = new Date()) => {
  const reference = new Date(tanggalPemeriksaan instanceof Date ? tanggalPemeriksaan : `${String(tanggalPemeriksaan).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(reference.getTime())) return null;
  return reference.getUTCMonth() + 1;
};

const getScreeningEligibility = (tanggalLahir, tanggalPemeriksaan = new Date(), config = null) => {
  const activeConfig = {
    asi_eksklusif_months: config?.asi_eksklusif_months ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    mpasi_min_age_months: config?.mpasi_min_age_months ?? 6,
    mpasi_max_age_months: config?.mpasi_max_age_months ?? 11,
    vitamin_a_months: config?.vitamin_a_months ?? [2, 8],
    obat_cacing_months: config?.obat_cacing_months ?? [2, 8],
  };

  const ageMonths = getAgeMonths(tanggalLahir, tanggalPemeriksaan);
  const month = getExaminationMonth(tanggalPemeriksaan);

  if (ageMonths === null || month === null) {
    return {
      age_months: ageMonths,
      is_asi_eksklusif_active: false,
      is_mpasi_active: false,
      is_vitamin_a_active: false,
      is_obat_cacing_active: false,
    };
  }
  return {
    age_months: ageMonths,
    is_asi_eksklusif_active: ageMonths >= 0 && ageMonths <= 6 && activeConfig.asi_eksklusif_months.includes(month),
    is_mpasi_active: ageMonths >= activeConfig.mpasi_min_age_months && ageMonths <= activeConfig.mpasi_max_age_months,
    is_vitamin_a_active: activeConfig.vitamin_a_months.includes(month),
    is_obat_cacing_active: activeConfig.obat_cacing_months.includes(month),
  };
};

const validateIrreversibleAsi = (existingValue, incomingValue) => {
  if (existingValue === false && incomingValue === true) return "is_asi_eksklusif tidak dapat diubah dari false menjadi true.";
  return null;
};

module.exports = { getAgeMonths, getExaminationMonth, getScreeningEligibility, validateIrreversibleAsi };
