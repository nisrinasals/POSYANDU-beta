/**
 * Menghitung umur akurat (tahun dan bulan) berdasarkan tanggal lahir
 */
const hitungUmur = (tanggal_lahir, tanggal = new Date()) => {
  const birth = new Date(tanggal_lahir);
  const check = new Date(tanggal);

  let years = check.getFullYear() - birth.getFullYear();
  let months = check.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && check.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;
  return { years, totalMonths };
};

/**
 * Menentukan kategori pemeriksaan secara otomatis berdasarkan tgl_lahir
 * @param {string|Date} tanggal_lahir - Tanggal lahir warga
 * @param {string} [kategoriInput] - Kategori opsional dari request ('bumil'/'busui')
 * @param {string|Date} [tanggal] - Tanggal pemeriksaan
 * @returns {string} Kategori akhir
 */
const tentukanKategori = (tanggal_lahir, kategoriInput = null, tanggal = new Date()) => {
  // Priority 1: Status Khusus Manual (Bumil / Busui)
  if (kategoriInput === "bumil" || kategoriInput === "busui") {
    return kategoriInput;
  }

  if (!tanggal_lahir) {
    throw new Error("Tanggal lahir warga diperlukan untuk menentukan kategori.");
  }

  const { years, totalMonths } = hitungUmur(tanggal_lahir, tanggal);

  // Priority 2: Penentuan Otomatis Berdasarkan Umur
  if (totalMonths >= 0 && totalMonths <= 11) {
    return "bayi"; // 0 - 11 bulan
  }
  if (totalMonths >= 12 && totalMonths <= 59) {
    return "balita"; // 12 - 59 bulan (di bawah 5 tahun)
  }
  if (years >= 5 && years < 6) {
    return "apras"; // Anak Prasekolah (5 - 6 tahun)
  }
  if (years >= 6 && years <= 14) {
    return "uskrem_6_14"; // Usia Sekolah 6-14 tahun
  }
  if (years >= 15 && years <= 18) {
    return "uskrem_15_18"; // Usia Sekolah 15-18 tahun
  }
  if (years >= 19 && years <= 59) {
    return "dewasa"; // Dewasa 19-59 tahun
  }
  if (years >= 60) {
    return "lansia"; // Lansia 60+ tahun
  }

  return "dewasa"; // Fallback default
};

module.exports = {
  hitungUmur,
  tentukanKategori,
};
