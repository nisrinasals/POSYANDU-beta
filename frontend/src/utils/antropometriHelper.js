import antropometriData from '../data/antropometriData.json';

/**
 * Helper untuk normalisasi gender:
 * 'L' / 'Laki-laki' -> 'M'
 * 'P' / 'Perempuan' -> 'F'
 */
export const normalizeGender = (gender) => {
  if (!gender) return 'M';
  const g = String(gender).toLowerCase();
  if (g.startsWith('p') || g.includes('wanita') || g.includes('perempuan') || g === 'f') {
    return 'F';
  }
  return 'M';
};

/**
 * Cari titik referensi Z-score dari data tabel berdasarkan nilai x terdekat / interpolasi linier
 */
export const lookupStandardRow = (datasetKey, xVal) => {
  const table = antropometriData[datasetKey];
  if (!table || table.length === 0) return null;

  const targetX = parseFloat(xVal);
  if (isNaN(targetX)) return null;

  // Jika di luar batas bawah / atas
  if (targetX <= table[0].x) return table[0];
  if (targetX >= table[table.length - 1].x) return table[table.length - 1];

  // Cari dua titik di sekitar targetX untuk interpolasi linier
  for (let i = 0; i < table.length - 1; i++) {
    const r1 = table[i];
    const r2 = table[i + 1];
    if (targetX >= r1.x && targetX <= r2.x) {
      if (r1.x === r2.x) return r1;
      const ratio = (targetX - r1.x) / (r2.x - r1.x);
      return {
        x: targetX,
        min3: r1.min3 + ratio * (r2.min3 - r1.min3),
        min2: r1.min2 + ratio * (r2.min2 - r1.min2),
        min1: r1.min1 + ratio * (r2.min1 - r1.min1),
        median: r1.median + ratio * (r2.median - r1.median),
        plus1: r1.plus1 + ratio * (r2.plus1 - r1.plus1),
        plus2: r1.plus2 + ratio * (r2.plus2 - r1.plus2),
        plus3: r1.plus3 + ratio * (r2.plus3 - r1.plus3)
      };
    }
  }

  return table[0];
};

/**
 * Lookup untuk IMT Usia 5-18 Tahun (berdasarkan totalBulan)
 */
export const lookupImt5to18Row = (gender, totalBulan) => {
  const g = normalizeGender(gender);
  const datasetKey = `${g}(5-18 tahun) IMTU`;
  const table = antropometriData[datasetKey];
  if (!table || table.length === 0) return null;

  const targetBl = parseInt(totalBulan, 10);
  if (isNaN(targetBl)) return null;

  if (targetBl <= table[0].totalBulan) return table[0];
  if (targetBl >= table[table.length - 1].totalBulan) return table[table.length - 1];

  const found = table.find(r => r.totalBulan === targetBl);
  if (found) return found;

  // Interpolasi jika tidak tepat
  for (let i = 0; i < table.length - 1; i++) {
    const r1 = table[i];
    const r2 = table[i + 1];
    if (targetBl >= r1.totalBulan && targetBl <= r2.totalBulan) {
      const ratio = (targetBl - r1.totalBulan) / (r2.totalBulan - r1.totalBulan);
      return {
        totalBulan: targetBl,
        min3: r1.min3 + ratio * (r2.min3 - r1.min3),
        min2: r1.min2 + ratio * (r2.min2 - r1.min2),
        min1: r1.min1 + ratio * (r2.min1 - r1.min1),
        median: r1.median + ratio * (r2.median - r1.median),
        plus1: r1.plus1 + ratio * (r2.plus1 - r1.plus1),
        plus2: r1.plus2 + ratio * (r2.plus2 - r1.plus2),
        plus3: r1.plus3 + ratio * (r2.plus3 - r1.plus3)
      };
    }
  }
  return table[0];
};

/**
 * 1. Evaluasi Status BB/U (Berat Badan menurut Umur) - Usia 0-60 Bulan
 * Permenkes No. 2 Tahun 2020:
 * < -3 SD                : Berat badan sangat kurang (severely underweight)
 * -3 SD s.d. < -2 SD     : Berat badan kurang (underweight)
 * -2 SD s.d. +1 SD       : Berat badan normal
 * > +1 SD                : Risiko Berat badan lebih
 */
export const evaluateBbu = (gender, umurBulan, bbValue) => {
  const g = normalizeGender(gender);
  const bb = parseFloat(bbValue);
  const umur = parseFloat(umurBulan);

  if (isNaN(bb) || isNaN(umur) || umur < 0) {
    return { status: 'Belum Terisi', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };
  }

  const datasetKey = `${g}(0-60) BBU`;
  const ref = lookupStandardRow(datasetKey, Math.min(umur, 60));
  if (!ref) return { status: 'Data Tidak Tersedia', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };

  if (bb < ref.min3) {
    return {
      status: 'Berat Badan Sangat Kurang',
      short: 'BB Sangat Kurang',
      label: 'Berat Badan Sangat Kurang (Severely Underweight)',
      badgeClass: 'bg-danger text-white',
      color: '#dc3545',
      zRange: '< -3 SD',
      rekomendasi: 'Segera rujuk ke Puskesmas/Dokter untuk evaluasi medis dan tata laksana gizi buruk.'
    };
  } else if (bb < ref.min2) {
    return {
      status: 'Berat Badan Kurang',
      short: 'BB Kurang',
      label: 'Berat Badan Kurang (Underweight)',
      badgeClass: 'bg-warning text-dark',
      color: '#ffc107',
      zRange: '-3 SD s.d. < -2 SD',
      rekomendasi: 'Konseling pemberian MP-ASI / ASI eksklusif, edukasi gizi seimbang dan jadwalkan kontrol ulang 2 minggu.'
    };
  } else if (bb <= ref.plus1) {
    return {
      status: 'Berat Badan Normal',
      short: 'Normal (N)',
      label: 'Berat Badan Normal (Sesuai Kurva)',
      badgeClass: 'bg-success text-white',
      color: '#198754',
      zRange: '-2 SD s.d. +1 SD',
      rekomendasi: 'Pertahankan pola asuh dan asupan gizi sehat seimbang. Lanjutkan pemantauan rutin setiap bulan.'
    };
  } else {
    return {
      status: 'Risiko Berat Badan Lebih',
      short: 'Risiko BB Lebih',
      label: 'Risiko Berat Badan Lebih',
      badgeClass: 'bg-info text-dark',
      color: '#0dcaf0',
      zRange: '> +1 SD',
      rekomendasi: 'Konseling pola makan dan aktivitas fisik, hindari makanan/minuman manis berlebih.'
    };
  }
};

/**
 * 2. Evaluasi Status PB/U atau TB/U (Panjang / Tinggi Badan menurut Umur) - Usia 0-60 Bulan
 * Permenkes No. 2 Tahun 2020:
 * < -3 SD                : Sangat pendek (severely stunted)
 * -3 SD s.d. < -2 SD     : Pendek (stunted)
 * -2 SD s.d. +3 SD       : Normal
 * > +3 SD                : Tinggi
 */
export const evaluateTbu = (gender, umurBulan, tbValue) => {
  const g = normalizeGender(gender);
  const tb = parseFloat(tbValue);
  const umur = parseFloat(umurBulan);

  if (isNaN(tb) || isNaN(umur) || umur < 0) {
    return { status: 'Belum Terisi', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };
  }

  let datasetKey = '';
  if (umur <= 24) {
    datasetKey = `${g}(0-24) PBU`;
  } else {
    datasetKey = `${g}(24-60) TBU`;
  }

  const ref = lookupStandardRow(datasetKey, Math.min(umur, 60));
  if (!ref) return { status: 'Data Tidak Tersedia', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };

  if (tb < ref.min3) {
    return {
      status: 'Sangat Pendek (Severely Stunted)',
      short: 'Sangat Pendek',
      label: 'Sangat Pendek (Severely Stunted)',
      badgeClass: 'bg-danger text-white',
      color: '#dc3545',
      zRange: '< -3 SD',
      isStunted: true,
      rekomendasi: 'Perlu konfirmasi tenaga kesehatan & dirujuk ke Puskesmas untuk evaluasi stunting dan intervensi spesifik.'
    };
  } else if (tb < ref.min2) {
    return {
      status: 'Pendek (Stunted)',
      short: 'Pendek (Stunted)',
      label: 'Pendek (Stunted)',
      badgeClass: 'bg-warning text-dark',
      color: '#fd7e14',
      zRange: '-3 SD s.d. < -2 SD',
      isStunted: true,
      rekomendasi: 'Edukasi gizi kaya protein hewani (telur, ikan, daging), perbaiki sanitasi, dan stimulasi perkembangan.'
    };
  } else if (tb <= ref.plus3) {
    return {
      status: 'Normal',
      short: 'Normal (N)',
      label: 'Tinggi Badan Normal',
      badgeClass: 'bg-success text-white',
      color: '#198754',
      zRange: '-2 SD s.d. +3 SD',
      isStunted: false,
      rekomendasi: 'Tumbuh kembang optimal sesuai umur. Pertahankan stimulasi dan gizi seimbang.'
    };
  } else {
    return {
      status: 'Tinggi',
      short: 'Tinggi',
      label: 'Tinggi (Di atas rata-rata)',
      badgeClass: 'bg-primary text-white',
      color: '#0d6efd',
      zRange: '> +3 SD',
      isStunted: false,
      rekomendasi: 'Pertumbuhan linier sangat baik, pastikan proporsi berat badan tetap seimbang.'
    };
  }
};

/**
 * 3. Evaluasi Status BB/PB atau BB/TB (Berat Badan menurut Panjang/Tinggi Badan) - Usia 0-60 Bulan
 * Permenkes No. 2 Tahun 2020:
 * < -3 SD                : Gizi buruk (severely wasted)
 * -3 SD s.d. < -2 SD     : Gizi kurang (wasted)
 * -2 SD s.d. +1 SD       : Gizi baik (normal)
 * > +1 SD s.d. +2 SD     : Berisiko gizi lebih (possible risk of overweight)
 * > +2 SD s.d. +3 SD     : Gizi lebih (overweight)
 * > +3 SD                : Obesitas (obese)
 */
export const evaluateBbpb = (gender, umurBulan, tbValue, bbValue) => {
  const g = normalizeGender(gender);
  const tb = parseFloat(tbValue);
  const bb = parseFloat(bbValue);
  const umur = parseFloat(umurBulan);

  if (isNaN(tb) || isNaN(bb)) {
    return { status: 'Belum Terisi', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };
  }

  let datasetKey = '';
  if (umur <= 24 || tb <= 85) {
    datasetKey = `${g}(0-24) BBPB`;
  } else {
    datasetKey = `${g}(24-60) BBPB`;
  }

  const ref = lookupStandardRow(datasetKey, tb);
  if (!ref) return { status: 'Data Tidak Tersedia', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };

  if (bb < ref.min3) {
    return {
      status: 'Gizi Buruk (Severely Wasted)',
      short: 'Gizi Buruk',
      label: 'Gizi Buruk (Severely Wasted)',
      badgeClass: 'bg-danger text-white',
      color: '#dc3545',
      zRange: '< -3 SD',
      rekomendasi: 'Kondisi gawat gizi! Segera rujuk ke Puskesmas/RS untuk tatalaksana gizi buruk (F75/F100).'
    };
  } else if (bb < ref.min2) {
    return {
      status: 'Gizi Kurang (Wasted)',
      short: 'Gizi Kurang',
      label: 'Gizi Kurang (Wasted)',
      badgeClass: 'bg-warning text-dark',
      color: '#ffc107',
      zRange: '-3 SD s.d. < -2 SD',
      rekomendasi: 'Pemberian Makanan Tambahan (PMT) pemulihan berbahan pangan lokal kaya protein hewani.'
    };
  } else if (bb <= ref.plus1) {
    return {
      status: 'Gizi Baik (Normal)',
      short: 'Gizi Baik',
      label: 'Gizi Baik (Normal)',
      badgeClass: 'bg-success text-white',
      color: '#198754',
      zRange: '-2 SD s.d. +1 SD',
      rekomendasi: 'Status gizi proporsional dan sehat. Pertahankan pola makan keluarga bergizi seimbang.'
    };
  } else if (bb <= ref.plus2) {
    return {
      status: 'Berisiko Gizi Lebih',
      short: 'Risiko Lebih',
      label: 'Berisiko Gizi Lebih',
      badgeClass: 'bg-info text-dark',
      color: '#0dcaf0',
      zRange: '> +1 SD s.d. +2 SD',
      rekomendasi: 'Edukasi pembatasan konsumsi gula, garam, lemak, dan perbanyak aktivitas bermain aktif.'
    };
  } else if (bb <= ref.plus3) {
    return {
      status: 'Gizi Lebih (Overweight)',
      short: 'Gizi Lebih',
      label: 'Gizi Lebih (Overweight)',
      badgeClass: 'bg-warning text-dark',
      color: '#fd7e14',
      zRange: '> +2 SD s.d. +3 SD',
      rekomendasi: 'Pengaturan porsi makan seimbang dan peningkatan aktivitas fisik harian teratur.'
    };
  } else {
    return {
      status: 'Obesitas (Obese)',
      short: 'Obesitas',
      label: 'Obesitas (Obese)',
      badgeClass: 'bg-danger text-white',
      color: '#d63384',
      zRange: '> +3 SD',
      rekomendasi: 'Konsultasi ke dokter / ahli gizi Puskesmas untuk evaluasi komorbiditas dan rencana diet khusus.'
    };
  }
};

/**
 * 4. Evaluasi Status IMT/U (Indeks Massa Tubuh menurut Umur)
 * Mendukung balita (0-60 bln) & Usia Sekolah / Remaja (5-18 tahun / 60-216 bln)
 */
export const evaluateImtu = (gender, umurBulan, imtValue) => {
  const g = normalizeGender(gender);
  const imt = parseFloat(imtValue);
  const umur = parseFloat(umurBulan);

  if (isNaN(imt) || isNaN(umur)) {
    return { status: 'Belum Terisi', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };
  }

  let ref = null;
  const isTeen = umur >= 60; // 5 tahun ke atas

  if (!isTeen) {
    const datasetKey = umur <= 24 ? `${g}(0-24) IMTU` : `${g}(24-60) IMTU`;
    ref = lookupStandardRow(datasetKey, Math.min(umur, 60));
  } else {
    ref = lookupImt5to18Row(g, umur);
  }

  if (!ref) return { status: 'Data Tidak Tersedia', label: '-', badgeClass: 'bg-secondary', color: '#6c757d', zRange: '-' };

  if (isTeen) {
    // Standar 5-18 tahun
    if (imt < ref.min3) {
      return {
        status: 'Gizi Buruk (Severely Thinness)',
        short: 'Sangat Kurus',
        label: 'Gizi Buruk / Sangat Kurus',
        badgeClass: 'bg-danger text-white',
        color: '#dc3545',
        zRange: '< -3 SD',
        rekomendasi: 'Rujuk Puskesmas untuk pemeriksaan klinis dan intervensi gizi intensif.'
      };
    } else if (imt < ref.min2) {
      return {
        status: 'Gizi Kurang (Thinness)',
        short: 'Kurus',
        label: 'Gizi Kurang / Kurus',
        badgeClass: 'bg-warning text-dark',
        color: '#ffc107',
        zRange: '-3 SD s.d. < -2 SD',
        rekomendasi: 'Tingkatkan asupan kalori dan protein, edukasi gizi remaja Isi Piringku.'
      };
    } else if (imt <= ref.plus1) {
      return {
        status: 'Gizi Baik (Normal)',
        short: 'Normal',
        label: 'Gizi Baik / Normal',
        badgeClass: 'bg-success text-white',
        color: '#198754',
        zRange: '-2 SD s.d. +1 SD',
        rekomendasi: 'Pertahankan pola makan bergizi seimbang dan olahraga minimal 30 menit sehari.'
      };
    } else if (imt <= ref.plus2) {
      return {
        status: 'Gizi Lebih (Overweight)',
        short: 'Gizi Lebih',
        label: 'Gizi Lebih (Overweight)',
        badgeClass: 'bg-warning text-dark',
        color: '#fd7e14',
        zRange: '> +1 SD s.d. +2 SD',
        rekomendasi: 'Kurangi konsumsi junk food/gula dan tingkatkan aktivitas fisik harian.'
      };
    } else {
      return {
        status: 'Obesitas (Obese)',
        short: 'Obesitas',
        label: 'Obesitas (Obese)',
        badgeClass: 'bg-danger text-white',
        color: '#d63384',
        zRange: '> +2 SD',
        rekomendasi: 'Konsultasikan ke poli gizi Puskesmas untuk tata laksana obesitas remaja.'
      };
    }
  } else {
    // Balita 0-60 bln
    return evaluateBbpb(gender, umurBulan, null, null); // atau gunakan kurva balita
  }
};
