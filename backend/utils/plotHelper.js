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
          { kategori: "Normal", batas: "Sistol <130 dan diastol <85 mmHg", kode: "N", is_merah: false },
          { kategori: "Risiko", batas: "Sistol ≥130 atau diastol ≥85 mmHg", kode: "R", is_merah: true },
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
          { kategori: "Normal", batas: "Sistol <130 dan diastol <85 mmHg", kode: "N", is_merah: false },
          { kategori: "Risiko", batas: "Sistol ≥130 atau diastol ≥85 mmHg", kode: "R", is_merah: true },
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
      {
        nama: "Kadar Gula Darah",
        items: [
          { kategori: "Normal", batas: "< 140 mg/dl", kode: "N", is_merah: false },
          { kategori: "Prediabetisi", batas: "140 - 199 mg/dl", kode: "Pd", is_merah: true },
          { kategori: "Diabetisi", batas: "≥ 200 mg/dl", kode: "D", is_merah: true },
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
      {
        nama: "Kadar Gula Darah",
        items: [
          { kategori: "Normal", batas: "< 140 mg/dl", kode: "N", is_merah: false },
          { kategori: "Prediabetisi", batas: "140 - 199 mg/dl", kode: "Pd", is_merah: true },
          { kategori: "Diabetisi", batas: "≥ 200 mg/dl", kode: "D", is_merah: true },
        ],
      },
    ],
  },
};

("use strict");
const referenceTable = require("./reference/referenceTableAdapter");

const hitungUsiaBulan = (tanggalLahir, tanggalPemeriksaan = new Date()) => {
  const lahir = new Date(tanggalLahir);
  const periksa = new Date(tanggalPemeriksaan);
  let bulan = (periksa.getFullYear() - lahir.getFullYear()) * 12 + periksa.getMonth() - lahir.getMonth();
  if (periksa.getDate() < lahir.getDate()) bulan--;
  return Math.max(0, bulan);
};

const hitungZScore = (nilai, median, sdPos1, sdNeg1) => (nilai >= median ? (nilai - median) / (sdPos1 - median) : (nilai - median) / (median - sdNeg1));

const normalizeGender = (gender) => {
  const value = String(gender || "")
    .trim()
    .toLowerCase();
  if (["l", "laki-laki", "laki laki", "male"].includes(value)) return "laki-laki";
  if (["p", "perempuan", "female"].includes(value)) return "perempuan";
  return value;
};

const getReferenceTable = (index, gender) => referenceTable.tables.find((table) => table.index === index && table.gender === normalizeGender(gender));

const getReferenceRow = (index, gender, lookupKey, lookupValue) => {
  const table = getReferenceTable(index, gender);
  if (!table) return { error: `Tabel referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)}.` };
  const numericValue = Number(lookupValue);
  const rows = table.rows.filter((row) => Number.isFinite(Number(row[lookupKey])));
  if (!Number.isFinite(numericValue) || !rows.length) return { error: `Data referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)}.` };
  const exactRow = rows.find((row) => Number(row[lookupKey]) === numericValue);
  if (exactRow) return { table, row: exactRow };
  if (["BB/PB", "BB/TB"].includes(index)) {
    const min = Number(rows[0][lookupKey]);
    const max = Number(rows[rows.length - 1][lookupKey]);
    if (numericValue < min || numericValue > max) return { error: `Data referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)}.` };
    const row = rows.reduce((nearest, candidate) => (Math.abs(Number(candidate[lookupKey]) - numericValue) < Math.abs(Number(nearest[lookupKey]) - numericValue) ? candidate : nearest));
    return { table, row };
  }
  return { error: `Data referensi ${index} tidak ditemukan untuk ${normalizeGender(gender)} usia ${lookupValue} bulan.` };
};

const getGrowthReferenceTable = (index, gender, usiaBulan) => {
  const normalizedGender = normalizeGender(gender);
  const age = Number(usiaBulan);

  const tables = referenceTable.tables.filter((table) => table.index === index && table.gender === normalizedGender);

  if (!tables.length) return null;

  let ageRange = null;

  if (index === "BB/U") {
    ageRange = "0-60 bulan";
  } else if (index === "PB/U") {
    ageRange = "0-24 bulan";
  } else if (index === "TB/U") {
    ageRange = "24-60 bulan";
  } else if (index === "BB/PB") {
    ageRange = "0-24 bulan";
  } else if (index === "BB/TB") {
    ageRange = "24-60 bulan";
  } else if (index === "IMT/U") {
    if (age <= 24) {
      ageRange = "0-24 bulan";
    } else if (age <= 60) {
      ageRange = "24-60 bulan";
    } else {
      ageRange = "5-18 tahun";
    }
  }

  return tables.find((table) => table.age_range === ageRange) || tables[0];
};

const buildGrowthChartData = ({ index, gender, usiaBulan, currentX, currentY }) => {
  const table = getGrowthReferenceTable(index, gender, usiaBulan);

  if (!table || !Array.isArray(table.rows)) {
    return null;
  }

  let xKey = "age_months";
  let xLabel = "Umur (Bulan Penuh)";
  let yLabel = "Nilai";
  let xUnit = "bulan";

  if (index === "BB/PB") {
    xKey = "length_cm";
    xLabel = "Panjang Badan (cm)";
    yLabel = "Berat Badan (kg)";
    xUnit = "cm";
  } else if (index === "BB/TB") {
    xKey = "height_cm";
    xLabel = "Tinggi Badan (cm)";
    yLabel = "Berat Badan (kg)";
    xUnit = "cm";
  } else if (index === "BB/U") {
    yLabel = "Berat Badan (kg)";
  } else if (index === "PB/U") {
    yLabel = "Panjang Badan (cm)";
  } else if (index === "TB/U") {
    yLabel = "Tinggi Badan (cm)";
  } else if (index === "IMT/U") {
    yLabel = "IMT (kg/m²)";

    if (Number(usiaBulan) > 60) {
      xLabel = "Umur (Tahun)";
      xUnit = "tahun";
    }
  }

  const points = table.rows
    .map((row) => ({
      x: Number(row[xKey]),
      sd_minus_3: Number(row.sd_minus_3),
      sd_minus_2: Number(row.sd_minus_2),
      sd_minus_1: Number(row.sd_minus_1),
      median: Number(row.median),
      sd_plus_1: Number(row.sd_plus_1),
      sd_plus_2: Number(row.sd_plus_2),
      sd_plus_3: Number(row.sd_plus_3),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.x) &&
        Number.isFinite(row.sd_minus_3) &&
        Number.isFinite(row.sd_minus_2) &&
        Number.isFinite(row.sd_minus_1) &&
        Number.isFinite(row.median) &&
        Number.isFinite(row.sd_plus_1) &&
        Number.isFinite(row.sd_plus_2) &&
        Number.isFinite(row.sd_plus_3),
    )
    .sort((a, b) => a.x - b.x);

  if (!points.length) return null;

  const currentReference = points.reduce((closest, point) => {
    if (!closest) return point;
    return Math.abs(point.x - currentX) < Math.abs(closest.x - currentX) ? point : closest;
  }, null);

  return {
    tipe: "growth_standard",
    index,
    x_label: xLabel,
    y_label: yLabel,
    x_unit: xUnit,

    current: {
      x: Number(currentX),
      y: Number(currentY),
    },
    current_reference: currentReference,
    points,
  };
};

const classifyReferenceValue = (value, row, kind) => {
  const isFiveToEighteenBmi = kind === "bmi_5_18";
  let kategori, kode, is_merah, sd_position;
  if (value < row.sd_minus_3) {
    kategori = kind === "height" ? "Sangat pendek" : "Gizi buruk (severely wasted)";
    kode = kind === "height" ? "SP" : "GiBur";
    is_merah = true;
    sd_position = "<-3 SD";
  } else if (value < row.sd_minus_2) {
    kategori = kind === "weight" ? "Berat badan kurang" : kind === "height" ? "Pendek (stunted)" : "Gizi kurang (wasted)";
    kode = kind === "weight" ? "BGM" : kind === "height" ? "P" : "GiKur";
    is_merah = true;
    sd_position = "-3 SD s.d. <-2 SD";
  } else if (value <= row.sd_plus_1) {
    kategori = kind === "weight" ? "Berat badan normal" : kind === "height" ? "Normal" : "Gizi baik (normal)";
    kode = kind === "weight" ? "N" : kind === "height" ? "N" : "Baik";
    is_merah = false;
    sd_position = "-2 SD s.d. +1 SD";
  } else if (value <= row.sd_plus_2) {
    kategori = kind === "weight" ? "Risiko berat badan lebih" : "Berisiko gizi lebih (possible risk of overweight)";
    kode = kind === "weight" ? "L" : "RGL";
    is_merah = true;
    sd_position = ">+1 SD s.d. +2 SD";
  } else if (value <= row.sd_plus_3) {
    kategori = kind === "height" ? "Tinggi" : isFiveToEighteenBmi ? "Obesitas (obese)" : "Gizi lebih (overweight)";
    kode = kind === "height" ? "T" : isFiveToEighteenBmi ? "Obes" : "GL";
    is_merah = kind !== "height";
    sd_position = ">+2 SD s.d. +3 SD";
  } else {
    kategori = kind === "height" ? "Tinggi" : "Obesitas (obese)";
    kode = kind === "height" ? "T" : "Obes";
    is_merah = kind !== "height";
    sd_position = ">+3 SD";
  }
  return { kategori, kode, is_merah, sd_position, reference: row };
};

const evaluasiTekananDarah = (sistole, diastole, kelompokSasaran) => {
  if (!sistole || !diastole) return null;
  if (["bumil", "busui"].includes(kelompokSasaran))
    return sistole < 130 && diastole < 85
      ? { indikator: "Tekanan Darah", kategori: "Normal", kode: "N", batas: "Sistol <130 dan diastol <85 mmHg", is_merah: false }
      : { indikator: "Tekanan Darah", kategori: "Risiko", kode: "R", batas: "Sistol ≥130 atau diastol ≥85 mmHg", is_merah: true };
  if (["uskrem_15_18", "dewasa"].includes(kelompokSasaran)) {
    if (sistole > 140 && diastole < 90) return { indikator: "Tekanan Darah", kategori: "Hipertensi sistolik terisolasi", kode: "HST", batas: ">140/<90", is_merah: true };
    if (sistole >= 180 || diastole >= 110) return { indikator: "Tekanan Darah", kategori: "Hipertensi tingkat 3", kode: "Ht 3", batas: ">180/110", is_merah: true };
    if (sistole >= 160 || diastole >= 100) return { indikator: "Tekanan Darah", kategori: "Hipertensi tingkat 2", kode: "Ht 2", batas: "160-179/100-109", is_merah: true };
    if (sistole >= 140 || diastole >= 90) return { indikator: "Tekanan Darah", kategori: "Hipertensi tingkat 1", kode: "Ht 1", batas: "140-159/90-99", is_merah: true };
    if (sistole >= 130 || diastole >= 85) return { indikator: "Tekanan Darah", kategori: "Pra Hipertensi", kode: "Pra Ht", batas: "130-139/85-89", is_merah: true };
    return { indikator: "Tekanan Darah", kategori: "Normal", kode: "N", batas: "<120-129/80-84", is_merah: false };
  }
  if (kelompokSasaran === "lansia") {
    if (sistole > 140 && diastole < 90) return { indikator: "Tekanan Darah", kategori: "Hipertensi sistolik terisolasi", kode: "HST", batas: ">140/<90", is_merah: true };
    if (sistole >= 160 || diastole >= 100) return { indikator: "Tekanan Darah", kategori: "Hipertensi tingkat 2", kode: "Ht 2", batas: ">160/100", is_merah: true };
    if (sistole >= 140 || diastole >= 90) return { indikator: "Tekanan Darah", kategori: "Hipertensi tingkat 1", kode: "Ht 1", batas: "140-159/90-99", is_merah: true };
    if (sistole >= 120 || diastole >= 80) return { indikator: "Tekanan Darah", kategori: "Pra Hipertensi", kode: "Pra Ht", batas: "120-139/80-89", is_merah: true };
    return { indikator: "Tekanan Darah", kategori: "Normal", kode: "N", batas: "<120/80", is_merah: false };
  }
  return null;
};

const evaluasiIMT = (bb_kg, tb_cm, kelompokSasaran) => {
  if (!bb_kg || !tb_cm) return null;
  const tb_m = tb_cm / 100;
  const imt = parseFloat((bb_kg / (tb_m * tb_m)).toFixed(2));
  if (["busui", "bumil"].includes(kelompokSasaran)) {
    if (imt < 18.5) return { indikator: "IMT", imt, kategori: kelompokSasaran === "bumil" ? "Risiko KEK" : "Kurus", kode: kelompokSasaran === "bumil" ? "KEK" : "K", batas: "<18.5", is_merah: true };
    if (imt <= 24.9) return { indikator: "IMT", imt, kategori: "Normal", kode: "N", batas: "18.5-24.9", is_merah: false };
    return { indikator: "IMT", imt, kategori: kelompokSasaran === "bumil" ? "Risiko gizi lebih" : imt <= 29.9 ? "Gemuk" : "Obesitas", kode: kelompokSasaran === "bumil" ? "RGL" : imt <= 29.9 ? "G" : "O", batas: "≥25", is_merah: true };
  }
  if (["dewasa", "lansia"].includes(kelompokSasaran)) {
    if (imt < 17) return { indikator: "IMT", imt, kategori: "Sangat kurus", kode: "SK", batas: "<17", is_merah: true };
    if (imt <= 18.4) return { indikator: "IMT", imt, kategori: "Kurus", kode: "K", batas: "17-18.4", is_merah: true };
    if (imt <= 25) return { indikator: "IMT", imt, kategori: "Normal", kode: "N", batas: "18.5-25", is_merah: false };
    if (imt <= 27) return { indikator: "IMT", imt, kategori: "Gemuk", kode: "G", batas: "25.1-27", is_merah: true };
    return { indikator: "IMT", imt, kategori: "Obesitas", kode: "O", batas: ">27", is_merah: true };
  }
  return { indikator: "IMT", imt, status: "Evaluasi via Z-score IMT/U" };
};

const evaluasiLingkarPerut = (lingkar_perut_cm, jenis_kelamin) => {
  if (!lingkar_perut_cm || !jenis_kelamin) return null;
  const isLaki = String(jenis_kelamin).toUpperCase() === "L";
  const limit = isLaki ? 90 : 80;
  return { indikator: "Lingkar Perut", nilai: lingkar_perut_cm, kategori: isLaki ? "Laki-laki" : "Perempuan", batas: `≤ ${limit} cm`, is_merah: lingkar_perut_cm > limit, kode: lingkar_perut_cm <= limit ? "N" : "O" };
};

const evaluasiLila = (lila_cm, kelompokSasaran) => {
  if (!lila_cm) return null;
  if (kelompokSasaran === "bayi") {
    if (lila_cm < 11) return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi Buruk", kode: "GiBur", batas: "<11 cm", is_merah: true };
    if (lila_cm <= 12.4) return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi Kurang", kode: "GiKur", batas: "11.1-12.4 cm", is_merah: true };
    return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi normal", kode: "N", batas: ">=12.5 cm", is_merah: false };
  }
  if (kelompokSasaran === "balita") {
    if (lila_cm < 11.4) return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi buruk", kode: "GiBur", batas: "<11.4 cm", is_merah: true };
    if (lila_cm <= 12.5) return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi kurang", kode: "GiKur", batas: "11.5-12.5 cm", is_merah: true };
    return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi normal", kode: "N", batas: "≥12.5 cm", is_merah: false };
  }
  if (kelompokSasaran === "apras") {
    if (lila_cm < 12.8) return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi buruk", kode: "GiBur", batas: "<12.8 cm", is_merah: true };
    if (lila_cm <= 14) return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi kurang", kode: "GiKur", batas: "12.8-14 cm", is_merah: true };
    return { indikator: "LILA", nilai: lila_cm, kategori: "Gizi normal", kode: "N", batas: "≥14 cm", is_merah: false };
  }
  if (kelompokSasaran === "bumil") return { indikator: "LILA", nilai: lila_cm, kategori: lila_cm < 23.5 ? "KEK" : "Normal", kode: lila_cm < 23.5 ? "KEK" : "N", batas: lila_cm < 23.5 ? "<23.5 cm" : "≥23.5 cm", is_merah: lila_cm < 23.5 };
  if (["dewasa", "lansia"].includes(kelompokSasaran))
    return { indikator: "LILA", nilai: lila_cm, kategori: lila_cm < 21.5 ? "Kurang" : "Normal", kode: lila_cm < 21.5 ? "K" : "N", batas: lila_cm < 21.5 ? "<21.5 cm" : "≥21.5 cm", is_merah: lila_cm < 21.5 };
  return { indikator: "LILA", nilai: lila_cm, status: "Normal" };
};

const evaluasiGulaDarah = (kadar_gula) => {
  if (kadar_gula === undefined || kadar_gula === null || kadar_gula === "") return null;
  const nilai = Number(kadar_gula);
  if (!Number.isFinite(nilai) || nilai <= 0) return null;
  if (nilai >= 200) return { indikator: "Kadar Gula Darah", nilai_riil: nilai, kategori: "Diabetisi", kode: "D", batas: "≥ 200 mg/dl", is_merah: true };
  if (nilai >= 140) return { indikator: "Kadar Gula Darah", nilai_riil: nilai, kategori: "Prediabetisi", kode: "Pd", batas: "140 - 199 mg/dl", is_merah: true };
  return { indikator: "Kadar Gula Darah", nilai_riil: nilai, kategori: "Normal", kode: "N", batas: "< 140 mg/dl", is_merah: false };
};

const evaluasiBBU = (bb_kg, usiaBulan, jenisKelamin) => {
  const result = getReferenceRow("BB/U", jenisKelamin, "age_months", usiaBulan);

  if (result.error) {
    return { error: result.error };
  }

  return {
    indikator: "BB/U",
    nilai_riil: bb_kg,

    ...classifyReferenceValue(Number(bb_kg), result.row, "weight"),

    grafik_sd: buildGrowthChartData({
      index: "BB/U",
      gender: jenisKelamin,
      usiaBulan,
      currentX: Number(usiaBulan),
      currentY: Number(bb_kg),
    }),
  };
};

const evaluasiTBU = (tb_cm, usiaBulan, jenisKelamin) => {
  const index = Number(usiaBulan) < 24 ? "PB/U" : "TB/U";

  const result = getReferenceRow(index, jenisKelamin, "age_months", usiaBulan);

  if (result.error) {
    return { error: result.error };
  }

  return {
    indikator: index,
    nilai_riil: tb_cm,

    ...classifyReferenceValue(Number(tb_cm), result.row, "height"),

    grafik_sd: buildGrowthChartData({
      index,
      gender: jenisKelamin,
      usiaBulan,
      currentX: Number(usiaBulan),
      currentY: Number(tb_cm),
    }),
  };
};

const evaluateWeightForSize = (weight, size, usiaBulan, jenisKelamin) => {
  const index = Number(usiaBulan) < 24 ? "BB/PB" : "BB/TB";

  const lookupKey = index === "BB/PB" ? "length_cm" : "height_cm";

  const result = getReferenceRow(index, jenisKelamin, lookupKey, size);

  if (result.error) {
    return { error: result.error };
  }

  return {
    indikator: index,
    nilai_riil: weight,
    nilai_acuan: size,

    ...classifyReferenceValue(Number(weight), result.row, "weight"),

    grafik_sd: buildGrowthChartData({
      index,
      gender: jenisKelamin,
      usiaBulan,
      currentX: Number(size),
      currentY: Number(weight),
    }),
  };
};

const evaluasiIMTU = (bb_kg, tb_cm, usiaBulan, jenisKelamin) => {
  if (!bb_kg || !tb_cm) {
    return {
      error: "Berat badan dan tinggi badan harus diisi.",
    };
  }

  const imt = parseFloat((Number(bb_kg) / (Number(tb_cm) / 100) ** 2).toFixed(2));

  const gender = normalizeGender(jenisKelamin);

  const table = getGrowthReferenceTable("IMT/U", jenisKelamin, usiaBulan);

  if (!table) {
    return {
      error: `Data referensi IMT/U tidak ditemukan untuk ${gender} usia ${usiaBulan} bulan.`,
    };
  }

  const row = table.rows.find((candidate) => Number(candidate.age_months) === Number(usiaBulan));

  if (!row) {
    return {
      error: `Data referensi IMT/U tidak ditemukan untuk ${gender} usia ${usiaBulan} bulan.`,
    };
  }

  return {
    indikator: "IMT/U",
    nilai_imt: imt,

    ...classifyReferenceValue(imt, row, usiaBulan > 60 ? "bmi_5_18" : "bmi"),

    grafik_sd: buildGrowthChartData({
      index: "IMT/U",
      gender: jenisKelamin,
      usiaBulan,
      currentX: Number(usiaBulan),
      currentY: Number(imt),
    }),
  };
};

const applyZScore = (result, zscore, mode = "weight") => {
  if (!result || result.error || zscore === undefined || zscore === null) return result;
  const z = Number(zscore);
  if (!Number.isFinite(z)) return result;
  return { ...result, zscore: z, is_merah: mode === "height" ? z < -2 : z < -2 || z > 1 };
};

const kalkulasiAntropometriAnak = ({ bb_kg, tb_cm, lila_cm, tanggal_lahir, jenis_kelamin, tanggal_pemeriksaan, zscores }) => {
  const usiaBulan = hitungUsiaBulan(tanggal_lahir, tanggal_pemeriksaan);
  const bbu = applyZScore(evaluasiBBU(bb_kg, usiaBulan, jenis_kelamin), zscores?.zscore_bbu);
  const tbu = applyZScore(evaluasiTBU(tb_cm, usiaBulan, jenis_kelamin), zscores?.zscore_pbu ?? zscores?.zscore_tbu, "height");
  const size = applyZScore(evaluateWeightForSize(bb_kg, tb_cm, usiaBulan, jenis_kelamin), zscores?.zscore_bbpb ?? zscores?.zscore_bbtb);
  const lila = evaluasiLila(lila_cm, usiaBulan < 12 ? "bayi" : "balita");
  const hasil = [bbu, tbu, size, lila].filter((item) => item && !item.error);
  const isPerluRujukan = hasil.some((item) => item.is_merah === true);
  return { usia_bulan: usiaBulan, bbu, tbu, bb_panjang_tinggi: size, lila, status_rujukan: isPerluRujukan ? "merah" : "hijau", is_perlu_rujukan: isPerluRujukan };
};

const evaluasiPemeriksaan = (data) => {
  const { kategori_sasaran, bb_kg, tb_cm, td_sistole, td_diastole, lila_cm, lingkar_perut_cm, kadar_gula, jenis_kelamin, zscores, tanggal_lahir, tanggal_pemeriksaan } = data;
  if (["bayi", "balita"].includes(kategori_sasaran) && tanggal_lahir) return kalkulasiAntropometriAnak({ bb_kg, tb_cm, lila_cm, tanggal_lahir, jenis_kelamin, tanggal_pemeriksaan, zscores });
  if (kategori_sasaran === "apras" && tanggal_lahir) {
    const usia_bulan = hitungUsiaBulan(tanggal_lahir, tanggal_pemeriksaan);
    const hasil_plot = { imtu: evaluasiIMTU(bb_kg, tb_cm, usia_bulan, jenis_kelamin), lila: evaluasiLila(lila_cm, "apras") };
    Object.keys(hasil_plot).forEach((key) => {
      if (!hasil_plot[key] || hasil_plot[key].error) delete hasil_plot[key];
    });
    const isPerluRujukan = Object.values(hasil_plot).some((item) => item?.is_merah === true);
    return { usia_bulan, hasil_plot, status_plot: isPerluRujukan ? "merah" : "hijau", is_perlu_rujukan: isPerluRujukan };
  }
  if (kategori_sasaran === "uskrem_6_14" && tanggal_lahir) {
    const usia_bulan = hitungUsiaBulan(tanggal_lahir, tanggal_pemeriksaan);
    const hasil_plot = { imtu: evaluasiIMTU(bb_kg, tb_cm, usia_bulan, jenis_kelamin) };
    Object.keys(hasil_plot).forEach((key) => {
      if (!hasil_plot[key] || hasil_plot[key].error) delete hasil_plot[key];
    });
    const isPerluRujukan = Object.values(hasil_plot).some((item) => item?.is_merah === true);
    return { usia_bulan, hasil_plot, status_plot: isPerluRujukan ? "merah" : "hijau", is_perlu_rujukan: isPerluRujukan };
  }
  if (kategori_sasaran === "uskrem_15_18" && tanggal_lahir) {
    const usia_bulan = hitungUsiaBulan(tanggal_lahir, tanggal_pemeriksaan);
    const hasil_plot = { imtu: evaluasiIMTU(bb_kg, tb_cm, usia_bulan, jenis_kelamin), tekanan_darah: evaluasiTekananDarah(td_sistole, td_diastole, kategori_sasaran) };
    Object.keys(hasil_plot).forEach((key) => {
      if (!hasil_plot[key] || hasil_plot[key].error) delete hasil_plot[key];
    });
    const isPerluRujukan = Object.values(hasil_plot).some((item) => item?.is_merah === true);
    return { usia_bulan, hasil_plot, status_plot: isPerluRujukan ? "merah" : "hijau", is_perlu_rujukan: isPerluRujukan };
  }
  const hasil_plot = {
    imt: evaluasiIMT(bb_kg, tb_cm, kategori_sasaran),
    tekanan_darah: evaluasiTekananDarah(td_sistole, td_diastole, kategori_sasaran),
    lila: evaluasiLila(lila_cm, kategori_sasaran),
    lingkar_perut: evaluasiLingkarPerut(lingkar_perut_cm, jenis_kelamin),
  };
  if (["dewasa", "lansia"].includes(kategori_sasaran)) hasil_plot.kadar_gula_darah = evaluasiGulaDarah(kadar_gula);
  Object.keys(hasil_plot).forEach((key) => {
    if (!hasil_plot[key] || hasil_plot[key].error) delete hasil_plot[key];
  });
  const isPerluRujukan = Object.values(hasil_plot).some((item) => item?.is_merah === true);
  return { hasil_plot, status_plot: isPerluRujukan ? "merah" : "hijau", is_perlu_rujukan: isPerluRujukan };
};

module.exports = {
  STANDAR_PLOT,
  hitungUsiaBulan,
  hitungZScore,
  evaluasiTekananDarah,
  evaluasiIMT,
  evaluasiLingkarPerut,
  evaluasiLila,
  evaluasiGulaDarah,
  evaluasiBBU,
  evaluasiTBU,
  evaluasiIMTU,
  kalkulasiAntropometriAnak,
  evaluasiPemeriksaan,
};
