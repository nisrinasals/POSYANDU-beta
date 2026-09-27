"use strict";

const BACKEND_TO_EXPORT_CATEGORY = Object.freeze({
  bumil: { group: "bumil_nifas_menyusui", column: "bumil", label: "Ibu Hamil" },
  busui: { group: "bumil_nifas_menyusui", column: "menyusui", label: "Ibu Menyusui" },
  bayi: { group: "bayi_balita_apras", column: "bayi", label: "Bayi" },
  balita: { group: "bayi_balita_apras", column: "balita", label: "Balita" },
  apras: { group: "bayi_balita_apras", column: "apras", label: "Anak Prasekolah" },
  uskrem_6_14: { group: "usia_sekolah_remaja", column: "usia_sekolah", label: "Usia Sekolah" },
  uskrem_15_18: { group: "usia_sekolah_remaja", column: "remaja", label: "Remaja" },
  dewasa: { group: "dewasa_lansia", column: "dewasa", label: "Dewasa" },
  lansia: { group: "dewasa_lansia", column: "lansia", label: "Lansia" },
});

const EXPORT_AGE_RANGES = Object.freeze({
  bayi: { minMonths: 0, maxMonths: 11, label: "0-11 bulan" },
  balita: { minMonths: 12, maxMonths: 59, label: "12-59 bulan" },
  apras: { minMonths: 60, maxMonths: 72, label: "60-72 bulan" },
  usia_sekolah: { minYears: 6, maxYears: 14, label: "6-14 tahun" },
  remaja: { minYears: 15, maxYears: 18, label: "15-18 tahun" },
  dewasa: { minYears: 19, maxYears: 59, label: "19-59 tahun" },
  lansia: { minYears: 60, label: "60 tahun ke atas" },
});

const PREGNANCY_STATUS_TO_EXPORT_CATEGORY = Object.freeze({
  hamil: { group: "bumil_nifas_menyusui", column: "bumil", label: "Ibu Hamil" },
  nifas: { group: "bumil_nifas_menyusui", column: "nifas", label: "Ibu Nifas" },
  menyusui: { group: "bumil_nifas_menyusui", column: "menyusui", label: "Ibu Menyusui" },
});

const EMPTY_PREGNANCY_INDICATORS = Object.freeze({ bumil: false, nifas: false, menyusui: false });

const getExportCategory = (backendCategory) => BACKEND_TO_EXPORT_CATEGORY[backendCategory] || null;

const getPregnancyExportCategory = (profile = {}) => {
  profile = profile || {};
  if (profile.status_kehamilan === "hamil") return PREGNANCY_STATUS_TO_EXPORT_CATEGORY.hamil;
  if (profile.status_kehamilan === "nifas") return PREGNANCY_STATUS_TO_EXPORT_CATEGORY.nifas;
  if (profile.status_kehamilan === "menyusui") return PREGNANCY_STATUS_TO_EXPORT_CATEGORY.menyusui;
  return null;
};

const getPregnancyExportIndicators = (profile = {}) => {
  profile = profile || {};
  const status = profile.status_kehamilan;
  if (status === "selesai") return { ...EMPTY_PREGNANCY_INDICATORS };

  return {
    bumil: status === "hamil",
    nifas: status === "nifas",
    menyusui: status === "menyusui" || (["hamil", "nifas"].includes(status) && profile.is_menyusui === true),
  };
};

const calculateAge = (tanggalLahir, referenceDate = new Date()) => {
  if (!tanggalLahir) return { years: null, months: null };
  const birth = new Date(tanggalLahir);
  const reference = new Date(referenceDate);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) return { years: null, months: null };

  let months = (reference.getFullYear() - birth.getFullYear()) * 12 + reference.getMonth() - birth.getMonth();
  if (reference.getDate() < birth.getDate()) months -= 1;
  return { years: Math.floor(months / 12), months, totalMonths: months };
};

const getExportAgeCategory = (totalMonths) => {
  if (!Number.isInteger(totalMonths) || totalMonths < 0) return null;
  if (totalMonths <= 11) return "bayi";
  if (totalMonths <= 59) return "balita";
  if (totalMonths <= 72) return "apras";
  if (totalMonths <= 179) return "uskrem_6_14";
  if (totalMonths <= 227) return "uskrem_15_18";
  if (totalMonths <= 719) return "dewasa";
  return "lansia";
};

const getAgeRange = (exportColumn) => EXPORT_AGE_RANGES[exportColumn] || null;

module.exports = {
  BACKEND_TO_EXPORT_CATEGORY,
  EXPORT_AGE_RANGES,
  PREGNANCY_STATUS_TO_EXPORT_CATEGORY,
  calculateAge,
  getExportAgeCategory,
  getAgeRange,
  getExportCategory,
  getPregnancyExportCategory,
  getPregnancyExportIndicators,
};
