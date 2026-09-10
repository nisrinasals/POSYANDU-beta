/**
 * UTILS PLOT HELPER POSYANDU ILP
 * File: utils/plotHelper.js
 */

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
// 4. EVALUATOR Z-SCORE BAYI / BALITA / APRAS / REMAJA
// ----------------------------------------------------------------------

/**
 * Evaluator BB/U (0 - 60 Bulan)
 */
const evaluasiBBU = (bb_kg, usiaBulan, jenisKelamin, tabelRefBBU) => {
  const ref = tabelRefBBU?.[jenisKelamin]?.[usiaBulan];
  if (!ref) return { error: `Data referensi BB/U tidak ditemukan untuk ${jenisKelamin} usia ${usiaBulan} bulan` };

  const zScore = parseFloat(hitungZScore(bb_kg, ref.median, ref.sdPos1, ref.sdNeg1).toFixed(2));

  let kategori = "";
  let kode = "";
  let is_merah = false;

  if (zScore < -3) {
    kategori = "Berat badan sangat kurang";
    kode = "BGM";
    is_merah = true;
  } else if (zScore >= -3 && zScore < -2) {
    kategori = "Berat badan kurang";
    kode = "BGM";
    is_merah = true;
  } else if (zScore >= -2 && zScore <= 1) {
    kategori = "Berat badan normal";
    kode = "N";
    is_merah = false;
  } else {
    kategori = "Risiko berat badan lebih";
    kode = "L";
    is_merah = true;
  }

  return {
    indikator: "BB/U",
    nilai_riil: bb_kg,
    z_score: zScore,
    kategori,
    kode,
    is_merah,
  };
};

/**
 * Evaluator TB/U (Tinggi/Panjang Badan menurut Umur)
 */
const evaluasiTBU = (tb_cm, usiaBulan, jenisKelamin, tabelRefTBU) => {
  const ref = tabelRefTBU?.[jenisKelamin]?.[usiaBulan];
  if (!ref) return { error: `Data referensi TB/U tidak ditemukan untuk ${jenisKelamin} usia ${usiaBulan} bulan` };

  const zScore = parseFloat(hitungZScore(tb_cm, ref.median, ref.sdPos1, ref.sdNeg1).toFixed(2));

  let kategori = "";
  let kode = "";
  let is_merah = false;

  if (zScore < -3) {
    kategori = "Sangat pendek";
    kode = "SP";
    is_merah = true;
  } else if (zScore >= -3 && zScore < -2) {
    kategori = "Pendek (Stunting)";
    kode = "P";
    is_merah = true;
  } else if (zScore >= -2 && zScore <= 3) {
    kategori = "Normal";
    kode = "N";
    is_merah = false;
  } else {
    kategori = "Tinggi";
    kode = "T";
    is_merah = false;
  }

  return {
    indikator: "TB/U",
    nilai_riil: tb_cm,
    z_score: zScore,
    kategori,
    kode,
    is_merah,
  };
};

/**
 * Evaluator IMT/U (60 - 216 Bulan / 5 - 18 Tahun)
 */
const evaluasiIMTU = (bb_kg, tb_cm, usiaBulan, jenisKelamin, tabelRefIMTU) => {
  if (!bb_kg || !tb_cm) return { error: "Berat badan dan tinggi badan harus diisi." };

  const tbMeter = tb_cm / 100;
  const imt = parseFloat((bb_kg / (tbMeter * tbMeter)).toFixed(2));

  const ref = tabelRefIMTU?.[jenisKelamin]?.[usiaBulan];
  if (!ref) return { error: `Data referensi IMT/U tidak ditemukan untuk ${jenisKelamin} usia ${usiaBulan} bulan` };

  const zScore = parseFloat(hitungZScore(imt, ref.median, ref.sdPos1, ref.sdNeg1).toFixed(2));

  let kategori = "";
  let kode = "";
  let is_merah = false;

  if (zScore < -3) {
    kategori = "Gizi sangat kurang";
    kode = "GiKur";
    is_merah = true;
  } else if (zScore >= -3 && zScore < -2) {
    kategori = "Gizi kurang";
    kode = "GiKur";
    is_merah = true;
  } else if (zScore >= -2 && zScore <= 1) {
    kategori = "Gizi baik (normal)";
    kode = "Baik";
    is_merah = false;
  } else if (zScore > 1 && zScore <= 2) {
    kategori = "Gizi lebih";
    kode = "GL";
    is_merah = true;
  } else {
    kategori = "Obesitas";
    kode = "Obes";
    is_merah = true;
  }

  return {
    indikator: "IMT/U",
    nilai_imt: imt,
    z_score: zScore,
    kategori,
    kode,
    is_merah,
  };
};

// ----------------------------------------------------------------------
// 5. FUNGSI UTAMA (FACADE FUNCTIONS)
// ----------------------------------------------------------------------

/**
 * Evaluasi Otomatis Khusus Bayi, Balita, Apras, Remaja
 */
const kalkulasiAntropometriAnak = ({ bb_kg, tb_cm, tanggal_lahir, jenis_kelamin, tabelRefBBU, tabelRefTBU, tabelRefIMTU }) => {
  const usiaBulan = hitungUsiaBulan(tanggal_lahir);

  const hasilBBU = evaluasiBBU(bb_kg, usiaBulan, jenis_kelamin, tabelRefBBU);
  const hasilTBU = evaluasiTBU(tb_cm, usiaBulan, jenis_kelamin, tabelRefTBU);
  const hasilIMTU = evaluasiIMTU(bb_kg, tb_cm, usiaBulan, jenis_kelamin, tabelRefIMTU);

  const isPerluRujukan = Boolean(hasilBBU.is_merah || hasilTBU.is_merah || hasilIMTU.is_merah);

  return {
    usia_bulan: usiaBulan,
    bbu: hasilBBU,
    tbu: hasilTBU,
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
