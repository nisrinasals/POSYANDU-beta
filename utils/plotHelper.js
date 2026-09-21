/**
 * UTILS PLOT HELPER POSYANDU ILP
 * File: utils/plotHelper.js
 */

const referenceTable = require("./referenceTable.json");

// ----------------------------------------------------------------------
// 1. DATA ACUAN STANDAR PLOT ILP POSYANDU PER KATEGORI SASARAN
// ----------------------------------------------------------------------
const STANDAR_PLOT = {
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

/**
 * Hitung Usia (Bulan) Otomatis dari Tanggal Lahir
 */
const hitungUsiaBulan = (tanggalLahir, tanggalPemeriksaan = new Date()) => {
  const lahir = new Date(tanggalLahir);
  const periksa = new Date(tanggalPemeriksaan);

  let bulan = (periksa.getFullYear() - lahir.getFullYear()) * 12;
  bulan += periksa.getMonth() - lahir.getMonth();

  if (periksa.getDate() < lahir.getDate()) {
    bulan--;
  }

  return Math.max(0, bulan);
};

/**
 * Perhitungan Z-Score WHO Standard
 */
const hitungZScore = (nilai, median, sdPos1, sdNeg1) => {
  if (nilai >= median) {
    return (nilai - median) / (sdPos1 - median);
  }
  return (nilai - median) / (median - sdNeg1);
};

// ----------------------------------------------------------------------
// 3. EVALUATOR DEWASA / BUMIL / BUSUI / LANSIA
// ----------------------------------------------------------------------

/**
 * Evaluasi Tekanan Darah
 */
const evaluasiTekananDarah = (sistole, diastole, kelompokSasaran) => {
  if (!sistole || !diastole) return null;

  if (["bumil", "busui"].includes(kelompokSasaran)) {
    if (sistole < 130 && diastole < 85) {
      return { kategori: "Normal", kode: "N", is_merah: false };
    }
    return { kategori: "Risiko", kode: "R", is_merah: true };
  }

  if (["uskrem_15_18", "dewasa"].includes(kelompokSasaran)) {
    if (sistole > 140 && diastole < 90) return { kategori: "Hipertensi sistolik terisolasi", kode: "HST", is_merah: true };
    if (sistole >= 180 || diastole >= 110) return { kategori: "Hipertensi tingkat 3", kode: "Ht 3", is_merah: true };
    if (sistole >= 160 || diastole >= 100) return { kategori: "Hipertensi tingkat 2", kode: "Ht 2", is_merah: true };
    if (sistole >= 140 || diastole >= 90) return { kategori: "Hipertensi tingkat 1", kode: "Ht 1", is_merah: true };
    if (sistole >= 130 || diastole >= 85) return { kategori: "Pra Hipertensi", kode: "Pra Ht", is_merah: true };
    return { kategori: "Normal", kode: "N", is_merah: false };
  }

  if (kelompokSasaran === "lansia") {
    if (sistole > 140 && diastole < 90) return { kategori: "Hipertensi sistolik terisolasi", kode: "HST", is_merah: true };
    if (sistole >= 160 || diastole >= 100) return { kategori: "Hipertensi tingkat 2", kode: "Ht 2", is_merah: true };
    if (sistole >= 140 || diastole >= 90) return { kategori: "Hipertensi tingkat 1", kode: "Ht 1", is_merah: true };
    if (sistole >= 120 || diastole >= 80) return { kategori: "Pra Hipertensi", kode: "Pra Ht", is_merah: true };
    return { kategori: "Normal", kode: "N", is_merah: false };
  }

  return null;
};

/**
 * Evaluasi IMT Dewasa / Bumil / Busui
 */
const evaluasiIMT = (bb_kg, tb_cm, kelompokSasaran) => {
  if (!bb_kg || !tb_cm) return null;
  const tb_m = tb_cm / 100;
  const imt = parseFloat((bb_kg / (tb_m * tb_m)).toFixed(2));

  if (["busui", "bumil"].includes(kelompokSasaran)) {
    if (imt < 18.5) return { imt, kategori: kelompokSasaran === "bumil" ? "Risiko KEK" : "Kurus", kode: kelompokSasaran === "bumil" ? "KEK" : "K", is_merah: true };
    if (imt <= 24.9) return { imt, kategori: "Normal", kode: "N", is_merah: false };
    return { imt, kategori: kelompokSasaran === "bumil" ? "Risiko gizi lebih" : imt <= 29.9 ? "Gemuk" : "Obesitas", kode: kelompokSasaran === "bumil" ? "RGL" : imt <= 29.9 ? "G" : "O", is_merah: true };
  }

  if (["dewasa", "lansia"].includes(kelompokSasaran)) {
    if (imt < 17.0) return { imt, kategori: "Sangat kurus", kode: "SK", is_merah: true };
    if (imt <= 18.4) return { imt, kategori: "Kurus", kode: "K", is_merah: true };
    if (imt <= 25.0) return { imt, kategori: "Normal", kode: "N", is_merah: false };
    if (imt <= 27.0) return { imt, kategori: "Gemuk", kode: "G", is_merah: true };
    return { imt, kategori: "Obesitas", kode: "O", is_merah: true };
  }

  return { imt, status: "Evaluasi via Z-score IMT/U" };
};

/**
 * Evaluasi Lingkar Perut
 */
const evaluasiLingkarPerut = (lingkar_perut_cm, jenis_kelamin) => {
  if (!lingkar_perut_cm || !jenis_kelamin) return null;
  const isLaki = jenis_kelamin.toUpperCase() === "L";
  const limit = isLaki ? 90 : 80;
  const isNormal = lingkar_perut_cm <= limit;

  return {
    nilai: lingkar_perut_cm,
    kategori: isLaki ? "Laki-laki" : "Perempuan",
    is_merah: !isNormal,
    kode: isNormal ? "N" : "O",
  };
};

/**
 * Evaluasi LiLA
 */
const evaluasiLila = (lila_cm, kelompokSasaran) => {
  if (!lila_cm) return null;

  if (kelompokSasaran === "bayi") {
    if (lila_cm < 11.0) return { nilai: lila_cm, kategori: "Gizi Buruk", kode: "GiBur", is_merah: true };
    if (lila_cm <= 12.4) return { nilai: lila_cm, kategori: "Gizi Kurang", kode: "GiKur", is_merah: true };
    return { nilai: lila_cm, kategori: "Gizi normal", kode: "N", is_merah: false };
  }

  if (kelompokSasaran === "balita") {
    if (lila_cm < 11.4) return { nilai: lila_cm, kategori: "Gizi buruk", kode: "GiBur", is_merah: true };
    if (lila_cm <= 12.5) return { nilai: lila_cm, kategori: "Gizi kurang", kode: "GiKur", is_merah: true };
    return { nilai: lila_cm, kategori: "Gizi normal", kode: "N", is_merah: false };
  }

  if (kelompokSasaran === "apras") {
    if (lila_cm < 12.8) return { nilai: lila_cm, kategori: "Gizi buruk", kode: "GiBur", is_merah: true };
    if (lila_cm <= 14.0) return { nilai: lila_cm, kategori: "Gizi kurang", kode: "GiKur", is_merah: true };
    return { nilai: lila_cm, kategori: "Gizi normal", kode: "N", is_merah: false };
  }

  if (kelompokSasaran === "bumil") {
    const isKek = lila_cm < 23.5;
    return { nilai: lila_cm, kategori: isKek ? "KEK" : "Normal", kode: isKek ? "KEK" : "N", is_merah: isKek };
  }

  if (["dewasa", "lansia"].includes(kelompokSasaran)) {
    const isKurang = lila_cm < 21.5;
    return { nilai: lila_cm, kategori: isKurang ? "Kurang" : "Normal", kode: isKurang ? "K" : "N", is_merah: isKurang };
  }

  return { nilai: lila_cm, status: "Normal" };
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
  const normalizedGender = normalizeGender(gender);
  return referenceTable.tables.find((table) => table.index === index && table.gender === normalizedGender);
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

  // Measurement-axis values are tabulated at fixed increments; nearest row is deterministic and preserves source values.
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

const evaluasiBBU = (bb_kg, usiaBulan, jenisKelamin) => {
  const result = getReferenceRow("BB/U", jenisKelamin, "age_months", usiaBulan);
  if (result.error) return { error: result.error };
  return { indikator: "BB/U", nilai_riil: bb_kg, ...classifyReferenceValue(Number(bb_kg), result.row, "weight") };
};

const evaluasiTBU = (tb_cm, usiaBulan, jenisKelamin) => {
  const index = usiaBulan < 24 ? "PB/U" : "TB/U";
  const result = getReferenceRow(index, jenisKelamin, "age_months", usiaBulan);
  if (result.error) return { error: result.error };
  return { indikator: index, nilai_riil: tb_cm, ...classifyReferenceValue(Number(tb_cm), result.row, "height") };
};

const evaluateWeightForSize = (weight, size, usiaBulan, jenisKelamin) => {
  const index = usiaBulan < 24 ? "BB/PB" : "BB/TB";
  const lookupKey = index === "BB/PB" ? "length_cm" : "height_cm";
  const result = getReferenceRow(index, jenisKelamin, lookupKey, size);
  if (result.error) return { error: result.error };
  return { indikator: index, nilai_riil: weight, nilai_acuan: size, ...classifyReferenceValue(Number(weight), result.row, "weight") };
};

const evaluasiIMTU = (bb_kg, tb_cm, usiaBulan, jenisKelamin) => {
  if (!bb_kg || !tb_cm) return { error: "Berat badan dan tinggi badan harus diisi." };
  const imt = parseFloat((bb_kg / (tb_cm / 100) ** 2).toFixed(2));
  const index = usiaBulan < 24 ? "IMT/U" : "IMT/U";
  const table = referenceTable.tables.find(
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

/**
 * Evaluasi Otomatis Khusus Bayi, Balita, Apras, Remaja
 */
const kalkulasiAntropometriAnak = ({ bb_kg, tb_cm, tanggal_lahir, jenis_kelamin, tanggal_pemeriksaan }) => {
  const usiaBulan = hitungUsiaBulan(tanggal_lahir, tanggal_pemeriksaan);

  const hasilBBU = usiaBulan <= 60 ? evaluasiBBU(bb_kg, usiaBulan, jenis_kelamin) : null;
  const hasilTBU = usiaBulan <= 60 ? evaluasiTBU(tb_cm, usiaBulan, jenis_kelamin) : null;
  const hasilUkuran = usiaBulan <= 60 ? evaluateWeightForSize(bb_kg, tb_cm, usiaBulan, jenis_kelamin) : null;
  const hasilIMTU = evaluasiIMTU(bb_kg, tb_cm, usiaBulan, jenis_kelamin);
  const hasil = [hasilBBU, hasilTBU, hasilUkuran, hasilIMTU].filter(Boolean);
  const isPerluRujukan = hasil.some((item) => item.is_merah === true);

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

/**
 * Evaluasi Umum Pemeriksaan Posyandu Dewasa / Lansia / Bumil / Busui
 */
const evaluasiPemeriksaan = (data) => {
  const { kategori_sasaran, bb_kg, tb_cm, td_sistole, td_diastole, lila_cm, lingkar_perut_cm, jenis_kelamin } = data;

  if (["bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18"].includes(kategori_sasaran) && data.tanggal_lahir) {
    return kalkulasiAntropometriAnak({ bb_kg, tb_cm, tanggal_lahir: data.tanggal_lahir, jenis_kelamin, tanggal_pemeriksaan: data.tanggal_pemeriksaan });
  }

  const hasil = {
    imt: evaluasiIMT(bb_kg, tb_cm, kategori_sasaran),
    tekanan_darah: evaluasiTekananDarah(td_sistole, td_diastole, kategori_sasaran),
    lila: evaluasiLila(lila_cm, kategori_sasaran),
    lingkar_perut: evaluasiLingkarPerut(lingkar_perut_cm, jenis_kelamin),
  };

  const statusMerah = Object.values(hasil)
    .filter((h) => h !== null)
    .some((h) => h.is_merah === true);

  return {
    is_perlu_rujukan: statusMerah,
    status_plot: statusMerah ? "merah" : "hijau",
    hasil_plot: hasil,
  };
};

// ----------------------------------------------------------------------
// 6. EXPORT MODULE
// ----------------------------------------------------------------------
module.exports = {
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
  kalkulasiAntropometriAnak,
  evaluasiPemeriksaan,
};
