"use strict";

const PUMA_COMPONENTS = {
  merokok_skor: { min: 0, max: 2 },
  napas_pendek_skor: { min: 0, max: 1 },
  dahak_paru_skor: { min: 0, max: 1 },
  batuk_atau_spirometri_skor: { min: 0, max: 1 },
};

const AKS_COMPONENTS = {
  bab_skor: { min: 0, max: 2 },
  bak_skor: { min: 0, max: 2 },
  membersihkan_diri_skor: { min: 0, max: 1 },
  penggunaan_wc_skor: { min: 0, max: 2 },
  makan_minum_skor: { min: 0, max: 2 },
  transfer_tempat_tidur_skor: { min: 0, max: 3 },
  berjalan_tempat_rata_skor: { min: 0, max: 3 },
  berpakaian_skor: { min: 0, max: 2 },
  naik_turun_tangga_skor: { min: 0, max: 2 },
  mandi_skor: { min: 0, max: 1 },
};

const getPumaRisk = (total) => {
  if (total < 6) return "risiko_rendah";
  if (total > 6) return "risiko_tinggi";
  return "ambigu_skor_6";
};

const calculatePuma = (input, warga) => {
  const detail = input || {};
  const errors = [];
  const ageYears = warga?.tanggal_lahir ? calculateAgeYears(warga.tanggal_lahir) : null;
  const genderScore = warga?.jenis_kelamin === "L" ? 1 : warga?.jenis_kelamin === "P" ? 0 : null;
  const ageScore = ageYears === null ? null : ageYears >= 60 ? 2 : ageYears >= 50 ? 1 : ageYears >= 40 ? 0 : null;

  if (genderScore === null) errors.push("jenis_kelamin warga tidak dapat menentukan skor PUMA.");
  if (ageScore === null) errors.push("usia warga di bawah 40 tahun atau tidak tersedia untuk skor PUMA.");

  const scores = { jenis_kelamin_skor: genderScore, usia_skor: ageScore };
  let total = 0;
  for (const [field, range] of Object.entries(PUMA_COMPONENTS)) {
    const value = detail[field];
    if (!Number.isInteger(value) || value < range.min || value > range.max) {
      errors.push(`${field} harus berupa bilangan bulat ${range.min}-${range.max}.`);
    } else {
      scores[field] = value;
      total += value;
    }
  }

  if (errors.length || genderScore === null || ageScore === null) return { errors };
  total += genderScore + ageScore;
  return {
    scores,
    total_skor_puma: total,
    status_risiko_puma: getPumaRisk(total),
  };
};

const classifyAks = (total) => {
  if (total === 20) return { code: "M", result: "mandiri", referral: false };
  if (total >= 12) return { code: "R", result: "ketergantungan_ringan", referral: true };
  if (total >= 9) return { code: "S", result: "ketergantungan_sedang", referral: true };
  if (total >= 5) return { code: "B", result: "ketergantungan_berat", referral: true };
  return { code: "T", result: "ketergantungan_total", referral: true };
};

const calculateAks = (input) => {
  const detail = input || {};
  const errors = [];
  const scores = {};
  let total = 0;
  for (const [field, range] of Object.entries(AKS_COMPONENTS)) {
    const value = detail[field];
    if (!Number.isInteger(value) || value < range.min || value > range.max) errors.push(`${field} harus berupa bilangan bulat ${range.min}-${range.max}.`);
    else {
      scores[field] = value;
      total += value;
    }
  }
  if (errors.length) return { errors };
  const classification = classifyAks(total);
  return { scores, total_skor_aks: total, status_aks: classification.result, kode_aks: classification.code, is_rujukan_aks: classification.referral };
};

const calculateAgeYears = (birthDate, referenceDate = new Date()) => {
  const birth = new Date(birthDate);
  const current = new Date(referenceDate);
  let years = current.getFullYear() - birth.getFullYear();
  const birthdayPassed = current.getMonth() > birth.getMonth() || (current.getMonth() === birth.getMonth() && current.getDate() >= birth.getDate());
  if (!birthdayPassed) years -= 1;
  return years;
};

const finalizeScreeningScores = (category, detail, warga, options = {}) => {
  if (!detail || !["dewasa", "lansia"].includes(category)) return { detail, errors: [] };
  const result = { detail: { ...detail }, errors: [] };
  const puma = detail.skrining_ppok_puma;
  if (puma && options.pumaProvided !== false) {
    const calculated = calculatePuma(puma, warga);
    if (calculated.errors) result.errors.push(...calculated.errors);
    else {
      result.detail.skrining_ppok_puma = {
        ...puma,
        jenis_kelamin_skor: calculated.scores.jenis_kelamin_skor,
        usia_skor: calculated.scores.usia_skor,
        total_skor_puma: calculated.total_skor_puma,
        status_risiko_puma: calculated.status_risiko_puma,
      };
    }
  }
  const aks = detail.aks_aktifitas_harian;
  if (aks && options.aksProvided !== false) {
    const calculated = calculateAks(aks);
    if (calculated.errors) result.errors.push(...calculated.errors);
    else result.detail.aks_aktifitas_harian = { ...aks, ...calculated.scores, total_skor_aks: calculated.total_skor_aks, status_aks: calculated.status_aks, kode_aks: calculated.kode_aks, is_rujukan_aks: calculated.is_rujukan_aks };
  }
  const skilas = detail.skilas;
  if (skilas && options.skilasProvided !== false) result.detail.skilas = { ...skilas };
  return result;
};

module.exports = { PUMA_COMPONENTS, AKS_COMPONENTS, calculateAgeYears, calculatePuma, calculateAks, finalizeScreeningScores };
