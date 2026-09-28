/**
 * Menghitung umur akurat (tahun dan bulan) berdasarkan tanggal lahir
 */
const hitungUmur = (tanggal_lahir, tanggal = new Date()) => {
  const birth = new Date(tanggal_lahir);
  const check = new Date(tanggal);
  let totalMonths = (check.getFullYear() - birth.getFullYear()) * 12 + check.getMonth() - birth.getMonth();
  if (check.getDate() < birth.getDate()) totalMonths--;
  const years = Math.floor(totalMonths / 12);
  return { years, totalMonths };
};

const tentukanKategoriUmur = (tanggal_lahir, tanggal = new Date()) => {
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

const getLatestPregnancyProfile = (profiles = []) => {
  if (!Array.isArray(profiles) || profiles.length === 0) return null;
  return [...profiles].sort((a, b) => {
    const aId = Number(a.id || 0);
    const bId = Number(b.id || 0);
    if (aId !== bId) return bId - aId;
    const aDate = new Date(a.updated_at || a.tanggal_persalinan || a.hpht || 0).getTime();
    const bDate = new Date(b.updated_at || b.tanggal_persalinan || b.hpht || 0).getTime();
    return bDate - aDate;
  })[0];
};

/**
 * Menentukan satu sasaran aktif warga berdasarkan status kehamilan dan umur.
 * Profil hamil selalu mengalahkan kategori umur; menyusui berlaku maksimal 24
 * bulan sejak tanggal persalinan.
 */
const tentukanKategori = (tanggal_lahir, pregnancyProfile = null, tanggal = new Date()) => {
  if (typeof pregnancyProfile === "string") {
    pregnancyProfile = ["bumil", "busui"].includes(pregnancyProfile) ? { status_kehamilan: pregnancyProfile } : null;
  }

  if (pregnancyProfile?.status_kehamilan === "hamil") return "bumil";

  const tanggalPersalinan = pregnancyProfile?.tanggal_persalinan;
  const monthsSinceDelivery = tanggalPersalinan ? hitungUmur(tanggalPersalinan, tanggal).totalMonths : null;
  if (pregnancyProfile?.is_menyusui === true && monthsSinceDelivery !== null && monthsSinceDelivery >= 0 && monthsSinceDelivery <= 24) {
    return "busui";
  }

  return tentukanKategoriUmur(tanggal_lahir, tanggal);
};

const tentukanKategoriAktif = (tanggal_lahir, profiles = [], tanggal = new Date()) => {
  return tentukanKategori(tanggal_lahir, getLatestPregnancyProfile(profiles), tanggal);
};

const hitungSelisihHari = (tanggalAwal, tanggalAkhir) => {
  const awal = new Date(`${tanggalAwal}T00:00:00Z`);
  const akhir = new Date(`${tanggalAkhir}T00:00:00Z`);
  return Math.floor((akhir - awal) / 86400000);
};

const tentukanPeriodePemeriksaan = (kategoriSasaran, tanggalPemeriksaan, dataAcuan = {}) => {
  if (kategoriSasaran !== "busui" || !dataAcuan.tanggal_persalinan) return null;

  const usiaHari = hitungSelisihHari(dataAcuan.tanggal_persalinan, tanggalPemeriksaan);
  if (usiaHari < 0) return { usia_hari: usiaHari, periode: null };
  if (usiaHari < 7) return { usia_hari: usiaHari, periode: "0-7_hari" };
  if (usiaHari <= 28) return { usia_hari: usiaHari, periode: "7-28_hari" };
  if (usiaHari <= 42) return { usia_hari: usiaHari, periode: "28-42_hari" };

  const usiaBulan = hitungUmur(dataAcuan.tanggal_persalinan, tanggalPemeriksaan).totalMonths;
  if (usiaBulan >= 2 && usiaBulan <= 24) return { usia_hari: usiaHari, periode: `bulan_${usiaBulan}` };
  return { usia_hari: usiaHari, periode: null };
};

const hitungRekapSasaran = (wargaList = [], tanggal = new Date()) => {
  const categories = ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"];
  const stats = { total_warga: 0, ...Object.fromEntries(categories.map((category) => [category, 0])) };
  const uniqueWarga = new Map();

  for (const warga of wargaList) {
    const uniqueKey = warga.nik || warga.id;
    if (uniqueKey !== undefined && uniqueWarga.has(String(uniqueKey))) continue;
    if (uniqueKey !== undefined) uniqueWarga.set(String(uniqueKey), warga);
  }

  stats.total_warga = uniqueWarga.size;
  for (const warga of uniqueWarga.values()) {
    const category = tentukanKategoriAktif(warga.tanggal_lahir, warga.profileKehamilan, tanggal);
    if (stats[category] !== undefined) stats[category] += 1;
  }
  return stats;
};

module.exports = {
  hitungUmur,
  tentukanKategori,
  tentukanKategoriUmur,
  tentukanKategoriAktif,
  getLatestPregnancyProfile,
  hitungSelisihHari,
  tentukanPeriodePemeriksaan,
  hitungRekapSasaran,
};
