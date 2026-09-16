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

// Kategori dengan tbc="true" (>=1 gejala) diklasifikasikan RISIKO, sisanya RUJUKAN
const TBC_RISIKO_CATEGORIES = ["bumil", "busui", "dewasa", "lansia"];
const TBC_RUJUKAN_CATEGORIES = ["bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18"];
const TBC_COMPUTED_KEYS = ["is_tbc_terindikasi", "status_tbc"];

const JIWA_QUESTIONS = ["kurang_bersemangat", "murung_tertekan_putus_asa", "gugup_cemas_gelisah", "sulit_kendalikan_khawatir"];

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

// Kumpulkan seluruh nilai boolean di dalam node TBC (termasuk gejala_tambahan bersarang), abaikan field hasil komputasi sebelumnya
const flattenTbcBooleans = (node) => {
  if (typeof node === "boolean") return [node];
  if (node && typeof node === "object") {
    return Object.entries(node)
      .filter(([key]) => !TBC_COMPUTED_KEYS.includes(key))
      .flatMap(([, value]) => flattenTbcBooleans(value));
  }
  return [];
};

/**
 * TBC terindikasi jika minimal 1 pertanyaan boolean bernilai true.
 * Outcome per kategori: bumil/busui/dewasa/lansia -> risiko, sisanya -> rujukan.
 */
const calculateTbc = (category, tbcInput) => {
  if (!tbcInput || typeof tbcInput !== "object") return null;
  let outcome = null;
  if (TBC_RISIKO_CATEGORIES.includes(category)) outcome = "risiko";
  else if (TBC_RUJUKAN_CATEGORIES.includes(category)) outcome = "rujukan";
  if (!outcome) return null;

  const isTerindikasi = flattenTbcBooleans(tbcInput).some(Boolean);
  return {
    is_tbc_terindikasi: isTerindikasi,
    status_tbc: isTerindikasi ? outcome : "tidak_terindikasi",
  };
};

// Skrining jiwa hanya berlaku untuk dewasa (semua gender) dan uskrem_6_14/uskrem_15_18 perempuan
const isJiwaEligible = (category, warga) => {
  if (category === "dewasa") return true;
  if (["uskrem_6_14", "uskrem_15_18"].includes(category)) return warga?.jenis_kelamin === "P";
  return false;
};

/**
 * Skor per pertanyaan 0-3. Group1=Q1+Q2, Group2=Q3+Q4. Rujukan jika salah satu group >= 3.
 * Total 4 pertanyaan TIDAK dipakai sebagai threshold rujukan, hanya sebagai informasi total.
 */
const calculateJiwa = (input) => {
  const jawaban = input?.jawaban_skor || {};
  const errors = [];
  const scores = {};
  for (const question of JIWA_QUESTIONS) {
    const value = jawaban[question];
    if (!Number.isInteger(value) || value < 0 || value > 3) errors.push(`jawaban_skor.${question} harus berupa bilangan bulat 0-3.`);
    else scores[question] = value;
  }
  if (errors.length) return { errors };

  const group1 = scores.kurang_bersemangat + scores.murung_tertekan_putus_asa;
  const group2 = scores.gugup_cemas_gelisah + scores.sulit_kendalikan_khawatir;
  return {
    scores,
    total_skor_jiwa: group1 + group2,
    group1_skor_jiwa: group1,
    group2_skor_jiwa: group2,
    is_rujukan_jiwa: group1 >= 3 || group2 >= 3,
  };
};

const finalizeScreeningScores = (category, detail, warga, options = {}) => {
  if (!detail) return { detail, errors: [] };
  const result = { detail: { ...detail }, errors: [] };

  if (detail.tbc) {
    const tbcResult = calculateTbc(category, detail.tbc);
    if (tbcResult) {
      result.detail.tbc = { ...detail.tbc, is_tbc_terindikasi: tbcResult.is_tbc_terindikasi, status_tbc: tbcResult.status_tbc };
    }
  }

  if (["dewasa", "lansia"].includes(category)) {
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
  }

  const jiwa = detail.skrining_kesehatan_jiwa;
  if (jiwa && options.jiwaProvided !== false) {
    if (!isJiwaEligible(category, warga)) {
      result.errors.push("Skrining kesehatan jiwa hanya berlaku untuk kategori dewasa, atau uskrem_6_14/uskrem_15_18 dengan jenis kelamin perempuan.");
    } else {
      const calculated = calculateJiwa(jiwa);
      if (calculated.errors) result.errors.push(...calculated.errors);
      else {
        result.detail.skrining_kesehatan_jiwa = {
          ...jiwa,
          jawaban_skor: { ...jiwa.jawaban_skor, ...calculated.scores },
          total_skor_jiwa: calculated.total_skor_jiwa,
          group1_skor_jiwa: calculated.group1_skor_jiwa,
          group2_skor_jiwa: calculated.group2_skor_jiwa,
          is_rujukan_jiwa: calculated.is_rujukan_jiwa,
        };
      }
    }
  }

  return result;
};

module.exports = { PUMA_COMPONENTS, AKS_COMPONENTS, calculateAgeYears, calculatePuma, calculateAks, calculateTbc, calculateJiwa, isJiwaEligible, finalizeScreeningScores };
