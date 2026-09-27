/**
 * UTILS PLOT HELPER POSYANDU ILP (FRONTEND)
 * Exact calculation matching backend utils/plotHelper.js
 */

import { tables } from "./reference/referenceTableAdapter";

// ----------------------------------------------------------------------
// 1. DATA ACUAN STANDAR PLOT ILP POSYANDU PER KATEGORI SASARAN
// ----------------------------------------------------------------------
export const STANDAR_PLOT = {
  bayi: {
    plot: [
      {
        nama: "BB/U",
        items: [
          { kategori: "BB tidak naik", subkategori: "Berat badan naik tidak adekuat", kode: "TA", is_merah: true },
          { kategori: "BB tidak naik", subkategori: "Berat badan tetap", kode: "T", is_merah: true },
          { kategori: "BB tidak naik", subkategori: "Berat badan turun", kode: "Tr", is_merah: true },
          { kategori: "BB kurang", batas: "-3 SD s.d. < -2 SD", kode: "BGM", is_merah: true },
          { kategori: "BB normal", batas: "-2 SD s.d. +1 SD", kode: "N", is_merah: false },
          { kategori: "BB lebih", batas: "> +1 SD", kode: "L", is_merah: true },
        ],
      },
      {
        nama: "PB/U",
        items: [
          { kategori: "Pendek", batas: "< -2 SD", kode: "P", is_merah: true },
          { kategori: "Normal", batas: "-2 SD s.d. +3 SD", kode: "N", is_merah: false },
          { kategori: "Tinggi", batas: "> +3 SD", kode: "T", is_merah: false },
        ],
      },
      {
        nama: "BB/PB",
        items: [
          { kategori: "Gizi buruk", batas: "< -3 SD", kode: "GiBur", is_merah: true },
          { kategori: "Gizi kurang", batas: "-3 SD s.d. < -2 SD", kode: "GiKur", is_merah: true },
          { kategori: "Gizi baik", batas: "-2 SD s.d. +1 SD", kode: "Baik", is_merah: false },
          { kategori: "Risiko gizi lebih", batas: "> +1 SD s.d. +2 SD", kode: "RGL", is_merah: true },
          { kategori: "Gizi lebih", batas: "> +2 SD s.d. +3 SD", kode: "GL", is_merah: true },
          { kategori: "Obesitas", batas: "> +3 SD", kode: "Obes", is_merah: true },
        ],
      },
      {
        nama: "Lingkar Kepala",
        items: [
          { kategori: "Melebihi normal", batas: "> +2 SD", kode: "L", is_merah: true },
          { kategori: "Normal", batas: "-2 SD s.d. +2 SD", kode: "N", is_merah: false },
          { kategori: "Kurang dari normal", batas: "< -2 SD", kode: "K", is_merah: true },
        ],
      },
      {
        nama: "LILA",
        items: [
          { kategori: "Gizi Buruk", batas: "< 11 cm", kode: "GiBur", is_merah: true },
          { kategori: "Gizi Kurang", batas: "11.1 - 12.4 cm", kode: "GiKur", is_merah: true },
          { kategori: "Gizi normal", batas: ">= 12.5 cm", kode: "N", is_merah: false },
        ],
      },
    ],
  },
  busui: {
    plot: [
      {
        nama: "IMT",
        items: [
          { kategori: "Kurus", batas: "< 18.5", kode: "K", is_merah: true },
          { kategori: "Normal", batas: "18.5 - 24.9", kode: "N", is_merah: false },
          { kategori: "Gemuk", batas: "25 - 29.9", kode: "G", is_merah: true },
          { kategori: "Obesitas", batas: "≥ 30", kode: "O", is_merah: true },
        ],
      },
      {
        nama: "Tekanan Darah",
        items: [
          { kategori: "Normal", batas: "< 130/85", kode: "N", is_merah: false },
          { kategori: "Risiko", batas: "≥ 130/85", kode: "R", is_merah: true },
        ],
      },
    ],
  },
  bumil: {
    plot: [
      {
        nama: "IMT sebelum hamil",
        items: [
          { kategori: "Risiko KEK", batas: "< 18.5 kg/m²", kode: "KEK", is_merah: true },
          { kategori: "Normal", batas: "18.5 - 24.9 kg/m²", kode: "N", is_merah: false },
          { kategori: "Risiko gizi lebih", batas: "≥ 25 kg/m²", kode: "RGL", is_merah: true },
        ],
      },
      {
        nama: "LILA",
        items: [
          { kategori: "KEK", batas: "< 23.5 cm", kode: "KEK", is_merah: true },
          { kategori: "Normal", batas: "≥ 23.5 cm", kode: "N", is_merah: false },
        ],
      },
      {
        nama: "Tekanan Darah",
        items: [
          { kategori: "Normal", batas: "< 130/85", kode: "N", is_merah: false },
          { kategori: "Risiko", batas: "≥ 130/85", kode: "R", is_merah: true },
        ],
      },
    ],
  },
  balita: {
    plot: [
      {
        nama: "BB/U",
        items: [
          { kategori: "Berat badan naik tidak adekuat", kode: "TA", is_merah: true },
          { kategori: "Berat badan tetap", kode: "T", is_merah: true },
          { kategori: "Berat badan turun", kode: "Tr", is_merah: true },
          { kategori: "BB kurang", batas: "-3 SD s.d. < -2 SD", kode: "BGM", is_merah: true },
          { kategori: "BB normal", batas: "-2 SD s.d. +1 SD", kode: "N", is_merah: false },
          { kategori: "BB lebih", batas: "> +1 SD", kode: "O", is_merah: true },
        ],
      },
      {
        nama: "TB/U atau PB/U",
        items: [
          { kategori: "Pendek", batas: "< -2 SD", kode: "P", is_merah: true },
          { kategori: "Normal", batas: "-2 SD s.d. +3 SD", kode: "N", is_merah: false },
          { kategori: "Tinggi", batas: "> +3 SD", kode: "T", is_merah: false },
        ],
      },
      {
        nama: "BB/TB atau BB/PB",
        items: [
          { kategori: "Gizi buruk", batas: "< -3 SD", kode: "GiBur", is_merah: true },
          { kategori: "Gizi kurang", batas: "-3 SD s.d. < -2 SD", kode: "GiKur", is_merah: true },
          { kategori: "Gizi baik", batas: "-2 SD s.d. +1 SD", kode: "Baik", is_merah: false },
          { kategori: "Risiko gizi lebih", batas: "> +1 SD s.d. +2 SD", kode: "RGL", is_merah: true },
          { kategori: "Gizi lebih", batas: "> +2 SD s.d. +3 SD", kode: "GL", is_merah: true },
          { kategori: "Obesitas", batas: "> +3 SD", kode: "Obes", is_merah: true },
        ],
      },
      {
        nama: "Lingkar Kepala",
        items: [
          { kategori: "Melebihi normal", batas: "> +2 SD", kode: "L", is_merah: true },
          { kategori: "Normal", batas: "-2 SD s.d. +2 SD", kode: "N", is_merah: false },
          { kategori: "Kurang dari normal", batas: "< -2 SD", kode: "K", is_merah: true },
        ],
      },
      {
        nama: "LILA",
        items: [
          { kategori: "Gizi buruk", batas: "< 11.4 cm", kode: "GiBur", is_merah: true },
          { kategori: "Gizi kurang", batas: "11.5 - 12.5 cm", kode: "GiKur", is_merah: true },
          { kategori: "Gizi normal", batas: "≥ 12.5 cm", kode: "N", is_merah: false },
        ],
      },
    ],
  },
  apras: {
    plot: [
      {
        nama: "IMT/U",
        items: [
          { kategori: "Gizi kurang", batas: "-3 SD s.d. < -2 SD", kode: "GiKur", is_merah: true },
          { kategori: "Gizi baik", batas: "-2 SD s.d. + 1 SD", kode: "Baik", is_merah: false },
          { kategori: "Gizi lebih", batas: "+1 SD s.d. +2 SD", kode: "GL", is_merah: true },
          { kategori: "Obesitas", batas: "> +2 SD", kode: "Obes", is_merah: true },
        ],
      },
      {
        nama: "LILA",
        items: [
          { kategori: "Gizi buruk", batas: "< 12.8 cm", kode: "GiBur", is_merah: true },
          { kategori: "Gizi kurang", batas: "12.8 - 14 cm", kode: "GiKur", is_merah: true },
          { kategori: "Gizi normal", batas: "≥ 14 cm", kode: "N", is_merah: false },
        ],
      },
    ],
  },
  uskrem_6_14: {
    plot: [
      {
        nama: "IMT/U",
        items: [
          { kategori: "Gizi kurang", batas: "-3 SD s.d. < -2 SD", kode: "GK", is_merah: true },
          { kategori: "Gizi baik", batas: "-2 SD s.d. +1 SD", kode: "GB", is_merah: false },
          { kategori: "Gizi lebih", batas: "+1 SD s.d. +2 SD", kode: "GL", is_merah: true },
          { kategori: "Obesitas", batas: "> +2 SD", kode: "O", is_merah: true },
        ],
      },
    ],
  },
  uskrem_15_18: {
    plot: [
      {
        nama: "IMT/U",
        items: [
          { kategori: "Gizi kurang", batas: "-3 SD s.d. < -2 SD", kode: "GiKur", is_merah: true },
          { kategori: "Gizi baik", batas: "-2 SD s.d. + 1 SD", kode: "Baik", is_merah: false },
          { kategori: "Gizi lebih", batas: "+1 SD s.d. +2 SD", kode: "GL", is_merah: true },
          { kategori: "Obesitas", batas: "> +2 SD", kode: "Obes", is_merah: true },
        ],
      },
      {
        nama: "Tekanan Darah",
        items: [
          { kategori: "Normal", batas: "< 120-129/80-84", kode: "N", is_merah: false },
          { kategori: "Pra Hipertensi", batas: "130-139/85-89", kode: "Pra Ht", is_merah: true },
          { kategori: "Hipertensi tingkat 1", batas: "140-159/90-99", kode: "Ht 1", is_merah: true },
          { kategori: "Hipertensi tingkat 2", batas: "160-179/100-109", kode: "Ht 2", is_merah: true },
          { kategori: "Hipertensi tingkat 3", batas: ">180/110", kode: "Ht 3", is_merah: true },
          { kategori: "Hipertensi sistolik terisolasi", batas: ">140/<90", kode: "HST", is_merah: true },
        ],
      },
    ],
  },
  dewasa: {
    plot: [
      {
        nama: "IMT",
        items: [
          { kategori: "Sangat kurus", batas: "< 17", kode: "SK", is_merah: true },
          { kategori: "Kurus", batas: "17 - 18.4", kode: "K", is_merah: true },
          { kategori: "Normal", batas: "18.5 - 25", kode: "N", is_merah: false },
          { kategori: "Gemuk", batas: "25.1 - 27.0", kode: "G", is_merah: true },
          { kategori: "Obesitas", batas: "> 27", kode: "O", is_merah: true },
        ],
      },
      {
        nama: "Lingkar Perut",
        items: [
          { kategori: "Laki-laki", batas: "≤ 90 cm", kode: "N", is_merah: false },
          { kategori: "Perempuan", batas: "≤ 80 cm", kode: "N", is_merah: false },
        ],
      },
      {
        nama: "LILA",
        items: [
          { kategori: "Kurang", batas: "< 21.5 cm", kode: "K", is_merah: true },
          { kategori: "Normal", batas: "≥ 21.5 cm", kode: "N", is_merah: false },
        ],
      },
      {
        nama: "Tekanan Darah",
        items: [
          { kategori: "Normal", batas: "< 120-129/80-84", kode: "N", is_merah: false },
          { kategori: "Pra Hipertensi", batas: "130-139/85-89", kode: "Pra Ht", is_merah: true },
          { kategori: "Hipertensi tingkat 1", batas: "140-159/90-99", kode: "Ht 1", is_merah: true },
          { kategori: "Hipertensi tingkat 2", batas: "160-179/100-109", kode: "Ht 2", is_merah: true },
          { kategori: "Hipertensi tingkat 3", batas: ">180/110", kode: "Ht 3", is_merah: true },
          { kategori: "Hipertensi sistolik terisolasi", batas: ">140/<90", kode: "HST", is_merah: true },
        ],
      },
    ],
  },
  lansia: {
    plot: [
      {
        nama: "IMT",
        items: [
          { kategori: "Sangat kurus", batas: "< 17", kode: "SK", is_merah: true },
          { kategori: "Kurus", batas: "17 - 18.5", kode: "K", is_merah: true },
          { kategori: "Normal", batas: "18.5 - 25", kode: "N", is_merah: false },
          { kategori: "Gemuk", batas: "25.1 - 27", kode: "G", is_merah: true },
          { kategori: "Obesitas", batas: "> 27", kode: "O", is_merah: true },
        ],
      },
      {
        nama: "Lingkar Perut",
        items: [
          { kategori: "Laki-laki", batas: "≤ 90 cm", kode: "N", is_merah: false },
          { kategori: "Perempuan", batas: "≤ 80 cm", kode: "N", is_merah: false },
        ],
      },
      {
        nama: "LILA",
        items: [
          { kategori: "Kurang", batas: "< 21.5 cm", kode: "K", is_merah: true },
          { kategori: "Normal", batas: "≥ 21.5 cm", kode: "N", is_merah: false },
        ],
      },
      {
        nama: "Tekanan Darah",
        items: [
          { kategori: "Normal", batas: "< 120/80", kode: "N", is_merah: false },
          { kategori: "Pra Hipertensi", batas: "120-139/80-89", kode: "Pra Ht", is_merah: true },
          { kategori: "Hipertensi tingkat 1", batas: "140-159/90-99", kode: "Ht 1", is_merah: true },
          { kategori: "Hipertensi tingkat 2", batas: ">160/100", kode: "Ht 2", is_merah: true },
          { kategori: "Hipertensi sistolik terisolasi", batas: ">140/<90", kode: "HST", is_merah: true },
        ],
      },
    ],
  },
};

// ----------------------------------------------------------------------
// 2. HELPER UMUM & MATEMATIS
// ----------------------------------------------------------------------

export const hitungUsiaBulan = (tanggalLahir, tanggalPemeriksaan = new Date()) => {
  if (!tanggalLahir) return 0;
  const lahir = new Date(tanggalLahir);
  const periksa = new Date(tanggalPemeriksaan);
  if (isNaN(lahir.getTime())) return 0;

  let bulan = (periksa.getFullYear() - lahir.getFullYear()) * 12;
  bulan += periksa.getMonth() - lahir.getMonth();

  if (periksa.getDate() < lahir.getDate()) {
    bulan--;
  }

  return Math.max(0, bulan);
};

export const hitungZScore = (nilai, median, sdPos1, sdNeg1) => {
  if (nilai >= median) {
    return (nilai - median) / (sdPos1 - median);
  }
  return (nilai - median) / (median - sdNeg1);
};

// ----------------------------------------------------------------------
// 3. EVALUATOR DEWASA / BUMIL / BUSUI / LANSIA
// ----------------------------------------------------------------------

export const evaluasiTekananDarah = (sistole, diastole, kelompokSasaran) => {
  const sis = parseInt(sistole);
  const dia = parseInt(diastole);
  if (isNaN(sis) || isNaN(dia) || sis <= 0 || dia <= 0) return null;

  if (["bumil", "busui", "nifas"].includes(kelompokSasaran)) {
    if (sis < 130 && dia < 85) {
      return { sistol: sis, diastol: dia, kategori: "Normal", kode: "N", is_merah: false, batas: "< 130/85" };
    }
    return { sistol: sis, diastol: dia, kategori: "Risiko", kode: "R", is_merah: true, batas: "≥ 130/85" };
  }

  if (["uskrem_15_18", "usekrem-15-18", "dewasa"].includes(kelompokSasaran)) {
    if (sis > 140 && dia < 90) return { sistol: sis, diastol: dia, kategori: "Hipertensi sistolik terisolasi", kode: "HST", is_merah: true, batas: ">140/<90" };
    if (sis >= 180 || dia >= 110) return { sistol: sis, diastol: dia, kategori: "Hipertensi tingkat 3", kode: "Ht 3", is_merah: true, batas: ">180/110" };
    if (sis >= 160 || dia >= 100) return { sistol: sis, diastol: dia, kategori: "Hipertensi tingkat 2", kode: "Ht 2", is_merah: true, batas: "160-179/100-109" };
    if (sis >= 140 || dia >= 90) return { sistol: sis, diastol: dia, kategori: "Hipertensi tingkat 1", kode: "Ht 1", is_merah: true, batas: "140-159/90-99" };
    if (sis >= 130 || dia >= 85) return { sistol: sis, diastol: dia, kategori: "Pra Hipertensi", kode: "Pra Ht", is_merah: true, batas: "130-139/85-89" };
    return { sistol: sis, diastol: dia, kategori: "Normal", kode: "N", is_merah: false, batas: "< 120-129/80-84" };
  }

  if (kelompokSasaran === "lansia") {
    if (sis > 140 && dia < 90) return { sistol: sis, diastol: dia, kategori: "Hipertensi sistolik terisolasi", kode: "HST", is_merah: true, batas: ">140/<90" };
    if (sis >= 160 || dia >= 100) return { sistol: sis, diastol: dia, kategori: "Hipertensi tingkat 2", kode: "Ht 2", is_merah: true, batas: ">160/100" };
    if (sis >= 140 || dia >= 90) return { sistol: sis, diastol: dia, kategori: "Hipertensi tingkat 1", kode: "Ht 1", is_merah: true, batas: "140-159/90-99" };
    if (sis >= 120 || dia >= 80) return { sistol: sis, diastol: dia, kategori: "Pra Hipertensi", kode: "Pra Ht", is_merah: true, batas: "120-139/80-89" };
    return { sistol: sis, diastol: dia, kategori: "Normal", kode: "N", is_merah: false, batas: "< 120/80" };
  }

  return null;
};

export const evaluasiIMT = (bb_kg, tb_cm, kelompokSasaran) => {
  const bb = parseFloat(bb_kg);
  const tb = parseFloat(tb_cm);
  if (isNaN(bb) || isNaN(tb) || bb <= 0 || tb <= 0) return null;
  const tb_m = tb / 100;
  const imt = parseFloat((bb / (tb_m * tb_m)).toFixed(2));

  if (kelompokSasaran === "bumil") {
    if (imt < 18.5) return { imt, kategori: "Risiko KEK", kode: "KEK", is_merah: true, batas: "< 18.5 kg/m²" };
    if (imt <= 24.9) return { imt, kategori: "Normal", kode: "N", is_merah: false, batas: "18.5 - 24.9 kg/m²" };
    return { imt, kategori: "Risiko gizi lebih", kode: "RGL", is_merah: true, batas: "≥ 25 kg/m²" };
  }

  if (["busui", "nifas"].includes(kelompokSasaran)) {
    if (imt < 18.5) return { imt, kategori: "Kurus", kode: "K", is_merah: true, batas: "< 18.5" };
    if (imt <= 24.9) return { imt, kategori: "Normal", kode: "N", is_merah: false, batas: "18.5 - 24.9" };
    if (imt <= 29.9) return { imt, kategori: "Gemuk", kode: "G", is_merah: true, batas: "25 - 29.9" };
    return { imt, kategori: "Obesitas", kode: "O", is_merah: true, batas: "≥ 30" };
  }

  if (["dewasa", "lansia"].includes(kelompokSasaran)) {
    if (imt < 17.0) return { imt, kategori: "Sangat kurus", kode: "SK", is_merah: true, batas: "< 17" };
    if (imt <= (kelompokSasaran === "lansia" ? 18.5 : 18.4)) return { imt, kategori: "Kurus", kode: "K", is_merah: true, batas: kelompokSasaran === "lansia" ? "17 - 18.5" : "17 - 18.4" };
    if (imt <= 25.0) return { imt, kategori: "Normal", kode: "N", is_merah: false, batas: "18.5 - 25" };
    if (imt <= 27.0) return { imt, kategori: "Gemuk", kode: "G", is_merah: true, batas: "25.1 - 27.0" };
    return { imt, kategori: "Obesitas", kode: "O", is_merah: true, batas: "> 27" };
  }

  return { imt, status: "Evaluasi via Z-score IMT/U" };
};

export const evaluasiLingkarPerut = (lingkar_perut_cm, jenis_kelamin) => {
  const lp = parseFloat(lingkar_perut_cm);
  if (isNaN(lp) || lp <= 0 || !jenis_kelamin) return null;
  const isLaki = String(jenis_kelamin).trim().toUpperCase().startsWith("L");
  const limit = isLaki ? 90 : 80;
  const isNormal = lp <= limit;

  return {
    nilai: lp,
    kategori: isLaki ? "Laki-laki" : "Perempuan",
    is_merah: !isNormal,
    kode: isNormal ? "N" : "O",
    batas: isLaki ? "≤ 90 cm" : "≤ 80 cm",
  };
};

export const evaluasiLila = (lila_cm, kelompokSasaran) => {
  const lila = parseFloat(lila_cm);
  if (isNaN(lila) || lila <= 0) return null;

  if (["bayi", "bayi-0-11"].includes(kelompokSasaran)) {
    if (lila < 11.0) return { nilai: lila, kategori: "Gizi Buruk", kode: "GiBur", is_merah: true, batas: "< 11 cm" };
    if (lila <= 12.4) return { nilai: lila, kategori: "Gizi Kurang", kode: "GiKur", is_merah: true, batas: "11.1 - 12.4 cm" };
    return { nilai: lila, kategori: "Gizi normal", kode: "N", is_merah: false, batas: ">= 12.5 cm" };
  }

  if (["balita", "balita-12-59"].includes(kelompokSasaran)) {
    if (lila < 11.4) return { nilai: lila, kategori: "Gizi buruk", kode: "GiBur", is_merah: true, batas: "< 11.4 cm" };
    if (lila <= 12.5) return { nilai: lila, kategori: "Gizi kurang", kode: "GiKur", is_merah: true, batas: "11.5 - 12.5 cm" };
    return { nilai: lila, kategori: "Gizi normal", kode: "N", is_merah: false, batas: "≥ 12.5 cm" };
  }

  if (kelompokSasaran === "apras") {
    if (lila < 12.8) return { nilai: lila, kategori: "Gizi buruk", kode: "GiBur", is_merah: true, batas: "< 12.8 cm" };
    if (lila <= 14.0) return { nilai: lila, kategori: "Gizi kurang", kode: "GiKur", is_merah: true, batas: "12.8 - 14 cm" };
    return { nilai: lila, kategori: "Gizi normal", kode: "N", is_merah: false, batas: "≥ 14 cm" };
  }

  if (kelompokSasaran === "bumil") {
    const isKek = lila < 23.5;
    return { nilai: lila, kategori: isKek ? "KEK" : "Normal", kode: isKek ? "KEK" : "N", is_merah: isKek, batas: isKek ? "< 23.5 cm" : "≥ 23.5 cm" };
  }

  if (["dewasa", "lansia"].includes(kelompokSasaran)) {
    const isKurang = lila < 21.5;
    return { nilai: lila, kategori: isKurang ? "Kurang" : "Normal", kode: isKurang ? "K" : "N", is_merah: isKurang, batas: isKurang ? "< 21.5 cm" : "≥ 21.5 cm" };
  }

  return { nilai: lila, status: "Normal" };
};

// ----------------------------------------------------------------------
// 4. EVALUATOR ANTROPOMETRI ANAK BERBASIS TABEL PERMENKES
// ----------------------------------------------------------------------

const normalizeGender = (gender) => {
  const value = String(gender || "")
    .trim()
    .toLowerCase();
  if (["l", "laki-laki", "laki laki", "male"].includes(value)) return "laki-laki";
  if (["p", "perempuan", "female"].includes(value)) return "perempuan";
  return value;
};

const getReferenceTable = (index, gender) => {
  const normGender = normalizeGender(gender);
  return tables.find((table) => table.index === index && table.gender === normGender);
};

const getReferenceRow = (index, gender, lookupKey, lookupValue) => {
  const table = getReferenceTable(index, gender);
  if (!table) return { error: `Tabel referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)}.` };

  const numericValue = Number(lookupValue);
  const rows = table.rows.filter((row) => Number.isFinite(Number(row[lookupKey])));
  if (!Number.isFinite(numericValue) || rows.length === 0) {
    return { error: `Data referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)} ${lookupKey} ${lookupValue}.` };
  }

  const exactRow = rows.find((row) => Number(row[lookupKey]) === numericValue);
  if (exactRow) return { table, row: exactRow };

  const isMeasurementAxis = ["BB/PB", "BB/TB"].includes(index);
  if (isMeasurementAxis) {
    const min = Number(rows[0][lookupKey]);
    const max = Number(rows[rows.length - 1][lookupKey]);
    if (numericValue < min || numericValue > max) {
      return { error: `Data referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)} ${lookupKey} ${lookupValue}.` };
    }
    const row = rows.reduce((nearest, candidate) => (Math.abs(Number(candidate[lookupKey]) - numericValue) < Math.abs(Number(nearest[lookupKey]) - numericValue) ? candidate : nearest));
    return { table, row };
  }

  return { error: `Data referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)} usia ${lookupValue} bulan.` };
};

const classifyReferenceValue = (value, row, kind) => {
  const isFiveToEighteenBmi = kind === "bmi_5_18";
  let category;
  let kode;
  let is_merah;
  let sd_position;

  if (value < row.sd_minus_3) {
    category = kind === "height" ? "Sangat pendek" : "Gizi buruk (severely wasted)";
    kode = kind === "height" ? "SP" : "GiBur";
    is_merah = true;
    sd_position = "<-3 SD";
  } else if (value < row.sd_minus_2) {
    category = kind === "weight" ? "Berat badan kurang" : kind === "height" ? "Pendek (stunted)" : "Gizi kurang (wasted)";
    kode = kind === "weight" ? "BGM" : kind === "height" ? "P" : "GiKur";
    is_merah = true;
    sd_position = "-3 SD s.d. <-2 SD";
  } else if (value <= row.sd_plus_1) {
    category = kind === "weight" ? "Berat badan normal" : kind === "height" ? "Normal" : "Gizi baik (normal)";
    kode = kind === "weight" ? "N" : kind === "height" ? "N" : "Baik";
    is_merah = false;
    sd_position = "-2 SD s.d. +1 SD";
  } else if (value <= row.sd_plus_2) {
    category = kind === "weight" ? "Risiko berat badan lebih" : "Berisiko gizi lebih (possible risk of overweight)";
    kode = kind === "weight" ? "L" : "RGL";
    is_merah = true;
    sd_position = ">+1 SD s.d. +2 SD";
  } else if (value <= row.sd_plus_3) {
    category = kind === "height" ? "Tinggi" : isFiveToEighteenBmi ? "Obesitas (obese)" : "Gizi lebih (overweight)";
    kode = kind === "height" ? "T" : isFiveToEighteenBmi ? "Obes" : "GL";
    is_merah = kind !== "height";
    sd_position = ">+2 SD s.d. +3 SD";
  } else {
    category = kind === "height" ? "Tinggi" : "Obesitas (obese)";
    kode = kind === "height" ? "T" : "Obes";
    is_merah = kind !== "height";
    sd_position = ">+3 SD";
  }

  return { kategori: category, kode, is_merah, sd_position, reference: row };
};

export const evaluasiBBU = (bb_kg, usiaBulan, jenisKelamin) => {
  const result = getReferenceRow("BB/U", jenisKelamin, "age_months", usiaBulan);
  if (result.error) return { error: result.error, kategori: "Tidak terdefinisi", kode: "-", is_merah: false };
  return { indikator: "BB/U", nilai_riil: bb_kg, ...classifyReferenceValue(Number(bb_kg), result.row, "weight") };
};

export const evaluasiTBU = (tb_cm, usiaBulan, jenisKelamin) => {
  const index = usiaBulan < 24 ? "PB/U" : "TB/U";
  const result = getReferenceRow(index, jenisKelamin, "age_months", usiaBulan);
  if (result.error) return { error: result.error, kategori: "Tidak terdefinisi", kode: "-", is_merah: false };
  return { indikator: index, nilai_riil: tb_cm, ...classifyReferenceValue(Number(tb_cm), result.row, "height") };
};

export const evaluateWeightForSize = (weight, size, usiaBulan, jenisKelamin) => {
  const index = usiaBulan < 24 ? "BB/PB" : "BB/TB";
  const lookupKey = index === "BB/PB" ? "length_cm" : "height_cm";
  const result = getReferenceRow(index, jenisKelamin, lookupKey, size);
  if (result.error) return { error: result.error, kategori: "Tidak terdefinisi", kode: "-", is_merah: false };
  return { indikator: index, nilai_riil: weight, nilai_acuan: size, ...classifyReferenceValue(Number(weight), result.row, "weight") };
};

export const evaluasiIMTU = (bb_kg, tb_cm, usiaBulan, jenisKelamin) => {
  if (!bb_kg || !tb_cm) return { error: "Berat badan dan tinggi badan harus diisi." };
  const imt = parseFloat((bb_kg / (tb_cm / 100) ** 2).toFixed(2));
  const index = "IMT/U";
  const table = tables.find(
    (candidate) =>
      candidate.index === index &&
      candidate.gender === normalizeGender(jenisKelamin) &&
      ((usiaBulan < 24 && candidate.age_range === "0-24 bulan") || (usiaBulan >= 24 && usiaBulan <= 60 && candidate.age_range === "24-60 bulan") || (usiaBulan > 60 && candidate.age_range === "5-18 tahun")),
  );
  if (!table) return { error: `Data referensi IMT/U tidak ditemukan untuk ${normalizeGender(jenisKelamin)} usia ${usiaBulan} bulan.` };
  const row = table.rows.find((candidate) => Number(candidate.age_months) === Number(usiaBulan));
  if (!row) return { error: `Data referensi IMT/U tidak ditemukan untuk ${normalizeGender(jenisKelamin)} usia ${usiaBulan} bulan.` };
  return { indikator: "IMT/U", nilai_imt: imt, ...classifyReferenceValue(imt, row, usiaBulan > 60 ? "bmi_5_18" : "bmi") };
};

// ----------------------------------------------------------------------
// 5. FUNGSI UTAMA (FACADE FUNCTIONS)
// ----------------------------------------------------------------------

export const kalkulasiAntropometriAnak = ({ bb_kg, tb_cm, tanggal_lahir, jenis_kelamin, tanggal_pemeriksaan, zscores }) => {
  const usiaBulan = hitungUsiaBulan(tanggal_lahir, tanggal_pemeriksaan);

  const hasilBBU = usiaBulan <= 60 && bb_kg ? evaluasiBBU(bb_kg, usiaBulan, jenis_kelamin) : null;
  const hasilTBU = usiaBulan <= 60 && tb_cm ? evaluasiTBU(tb_cm, usiaBulan, jenis_kelamin) : null;
  const hasilUkuran = usiaBulan <= 60 && bb_kg && tb_cm ? evaluateWeightForSize(bb_kg, tb_cm, usiaBulan, jenis_kelamin) : null;
  const hasilIMTU = bb_kg && tb_cm ? evaluasiIMTU(bb_kg, tb_cm, usiaBulan, jenis_kelamin) : null;

  const hasil = [hasilBBU, hasilTBU, hasilUkuran, hasilIMTU].filter(Boolean);
  const isPerluRujukan = hasil.some((item) => item && item.is_merah === true);

  return {
    usia_bulan: usiaBulan,
    bbu: hasilBBU,
    tbu: hasilTBU,
    bb_panjang_tinggi: hasilUkuran,
    imtu: hasilIMTU,
    status_rujukan: isPerluRujukan ? "merah" : "hijau",
    is_perlu_rujukan: isPerluRujukan,
  };
};

export const evaluasiPemeriksaan = (data) => {
  const { kategori_sasaran, bb_kg, tb_cm, td_sistole, td_diastole, lila_cm, lingkar_perut_cm, jenis_kelamin, zscores } = data;

  const normalizedKat = String(kategori_sasaran || "").toLowerCase().replace(/-/g, "_");

  if (["bayi", "bayi_0_11", "balita", "balita_12_59", "apras", "apras_60_72", "uskrem_6_14", "usekrem_6_14", "uskrem_15_18", "usekrem_15_18"].includes(normalizedKat) && data.tanggal_lahir) {
    return kalkulasiAntropometriAnak({ bb_kg, tb_cm, tanggal_lahir: data.tanggal_lahir, jenis_kelamin, tanggal_pemeriksaan: data.tanggal_pemeriksaan, zscores });
  }

  const standardKat = ["bumil", "busui", "nifas", "dewasa", "lansia"].includes(normalizedKat) 
    ? (normalizedKat === "nifas" ? "busui" : normalizedKat) 
    : "dewasa";

  const hasil = {
    imt: evaluasiIMT(bb_kg, tb_cm, standardKat),
    tekanan_darah: evaluasiTekananDarah(td_sistole, td_diastole, standardKat),
    lila: evaluasiLila(lila_cm, standardKat),
    lingkar_perut: evaluasiLingkarPerut(lingkar_perut_cm, jenis_kelamin),
  };

  const statusMerah = Object.values(hasil)
    .filter((h) => h !== null)
    .some((h) => h && h.is_merah === true);

  return {
    is_perlu_rujukan: statusMerah,
    status_plot: statusMerah ? "merah" : "hijau",
    hasil_plot: hasil,
  };
};

export default {
  STANDAR_PLOT,
  hitungUsiaBulan,
  hitungZScore,
  evaluasiTekananDarah,
  evaluasiIMT,
  evaluasiLingkarPerut,
  evaluasiLila,
  evaluasiBBU,
  evaluasiTBU,
  evaluasiIMTU,
  evaluateWeightForSize,
  kalkulasiAntropometriAnak,
  evaluasiPemeriksaan,
};
