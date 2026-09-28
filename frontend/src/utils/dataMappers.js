<<<<<<< HEAD
// Data mapper: backend entities -> frontend view state.
// This file never invents business data; absent backend values remain empty/null.

export const KATEGORI_MAPPINGS = {
  bumil: { label: "Bumil", slug: "bumil" },
  busui: { label: "Nifas/Menyusui", slug: "nifas" },
  nifas: { label: "Nifas/Menyusui", slug: "nifas" },
  bayi: { label: "Bayi 0–11 Bln", slug: "bayi-0-11" },
  "bayi-0-11": { label: "Bayi 0–11 Bln", slug: "bayi-0-11" },
  balita: { label: "Balita 12–59 Bln", slug: "balita-12-59" },
  "balita-12-59": { label: "Balita 12–59 Bln", slug: "balita-12-59" },
  apras: { label: "Apras 60–72 Bln", slug: "apras" },
  "apras-60-72": { label: "Apras 60–72 Bln", slug: "apras" },
  uskrem_6_14: { label: "Usekrem 6–14 Thn", slug: "usekrem-6-14" },
  "usekrem-6-14": { label: "Usekrem 6–14 Thn", slug: "usekrem-6-14" },
  uskrem_15_18: { label: "Usekrem 15–18 Thn", slug: "usekrem-15-18" },
  "usekrem-15-18": { label: "Usekrem 15–18 Thn", slug: "usekrem-15-18" },
  dewasa: { label: "Dewasa", slug: "dewasa" },
  lansia: { label: "Lansia", slug: "lansia" },
};

export const formatDateId = (value) => {
  if (!value) return "";
  const formatParts = (day, month, year) => `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return formatParts(value.getDate(), value.getMonth() + 1, value.getFullYear());
  }

  const rawDate = String(value).trim();
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(rawDate);
  if (isoMatch) return formatParts(isoMatch[3], isoMatch[2], isoMatch[1]);

  const dayFirstMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(rawDate);
  if (dayFirstMatch) return formatParts(dayFirstMatch[1], dayFirstMatch[2], dayFirstMatch[3]);

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return formatParts(parsed.getDate(), parsed.getMonth() + 1, parsed.getFullYear());
};

export const formatAgeFromMonths = (ageMonths, category) => {
  if (ageMonths === null || ageMonths === undefined || ageMonths === "") return "";
  const months = Number(ageMonths);
  if (!Number.isFinite(months) || months < 0) return "";

  const normalizedCategory = String(category || "").toLowerCase().replace(/[_–—]/g, "-");
  const showMonths = ["bayi", "balita", "apras"].some((name) => normalizedCategory.includes(name));
  const years = Math.floor(months / 12);
  const remainingMonths = Math.floor(months % 12);

  if (!showMonths) return `${years} tahun`;
  if (years === 0) return `${Math.floor(months)} bulan`;
  return remainingMonths ? `${years} tahun ${remainingMonths} bulan` : `${years} tahun`;
};

const HEALTH_HISTORY_LABELS = {
  hipertensi: "Hipertensi",
  DM: "DM",
  stroke: "Stroke",
  jantung: "Jantung",
  asma: "Asma",
};

const mapHealthHistoryToLabels = (history = {}) => {
  const entries = Object.entries(history || {});
  const selected = entries.filter(([, hasHistory]) => hasHistory === true).map(([key]) => HEALTH_HISTORY_LABELS[key]).filter(Boolean);
  if (selected.length === 0 && Object.keys(HEALTH_HISTORY_LABELS).every((key) => Object.prototype.hasOwnProperty.call(history || {}, key))) return ["Tidak Ada"];
  return selected;
};

const mapRiskBehaviorToForm = (behavior = {}) => ({
  merokok: behavior.merokok === true ? "Ya" : behavior.merokok === false ? "Tidak" : "",
  tinggiGula: (behavior.konsumsi_tinggi_gula ?? behavior.gula) === true ? "Ya" : (behavior.konsumsi_tinggi_gula ?? behavior.gula) === false ? "Tidak" : "",
  tinggiGaram: (behavior.konsumsi_tinggi_garam ?? behavior.garam) === true ? "Ya" : (behavior.konsumsi_tinggi_garam ?? behavior.garam) === false ? "Tidak" : "",
  tinggiLemak: (behavior.konsumsi_tinggi_lemak ?? behavior.lemak) === true ? "Ya" : (behavior.konsumsi_tinggi_lemak ?? behavior.lemak) === false ? "Tidak" : "",
});

const mapJarakAnakToForm = (months) => {
  if (months === null || months === undefined || months === "") return "Anak Pertama";
  const value = Number(months);
  if (!Number.isFinite(value) || value <= 0) return "Anak Pertama";
  if (value < 24) return "< 2 Thn";
  if (value <= 60) return "2 - 5 Thn";
  return "> 5 Thn";
};

export function mapBackendWargaToFrontend(w) {
  if (!w) return null;

  const kategoriKey = (w.kategori_sasaran_saat_ini || w.kategori_sasaran_estimasi || w.kategori_sasaran || w.kategori || w.subKategori || "").toLowerCase();
  const matched = KATEGORI_MAPPINGS[kategoriKey];
  const birthDateRaw = w.tanggal_lahir || w.tglLahir;
  let calculatedAge = "";
  if (birthDateRaw) {
    const birth = new Date(birthDateRaw);
    const now = new Date();
    if (!Number.isNaN(birth.getTime()) && birth <= now) {
      let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      if (now.getDate() < birth.getDate()) months -= 1;
      months = Math.max(0, months);
      calculatedAge = formatAgeFromMonths(months, matched?.slug || kategoriKey);
    }
  }
  const pregnancyProfiles = Array.isArray(w.profileKehamilan) ? w.profileKehamilan : [];
  const latestPregnancyProfile = [...pregnancyProfiles].sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0];
  const healthProfile = w.profilKesehatan || w.profil_kesehatan || {};
  const riwayatKeluarga = mapHealthHistoryToLabels(healthProfile.riwayat_keluarga);
  const riwayatDiriSendiri = mapHealthHistoryToLabels(healthProfile.riwayat_diri);
  const perilakuBerisikoDewasa = mapRiskBehaviorToForm(healthProfile.perilaku_berisiko);
  const isAdultOrLansia = ["dewasa", "lansia"].includes(matched?.slug || w.subKategori);

  const gender = w.jenis_kelamin === "L" ? "Laki-laki" : w.jenis_kelamin === "P" ? "Perempuan" : w.gender || "";

  const status = w.status_domisili ? (w.status_domisili === "aktif" ? "Aktif" : "Non-Aktif") : w.status || "";

  const namaSuami = latestPregnancyProfile?.nama_suami || w.nama_suami || w.namaSuami || "";
  const keteranganIbuSuami = w.nama_ibu ? `Ibu: ${w.nama_ibu}` : namaSuami ? `Suami: ${namaSuami}` : w.nama_ayah ? `Ayah: ${w.nama_ayah}` : w.keteranganIbuSuami || "";
  const rawMaritalStatus = w.status_perkawinan || w.status_pernikahan || w.statusPernikahan || "";
  const maritalStatus = rawMaritalStatus === "menikah" ? "Menikah" : rawMaritalStatus === "tidak_menikah" ? "Tidak Menikah" : rawMaritalStatus;
  const birthWeight = w.bb_lahir_kg ?? w.bbl ?? "";
  const birthHeight = w.tb_lahir_cm ?? w.pbl ?? "";

  return {
    id: w.id,
    idSasaran: w.id_sasaran || "",
    nama: w.nama_lengkap || w.nama || "",
    nik: w.nik || "",
    tglLahir: w.tanggal_lahir ? String(w.tanggal_lahir).split("T")[0] : w.tglLahir || "",
    usia: calculatedAge || w.umur_text || w.usia || "",
    usiaBulan: w.usia_bulan ?? null,
    gender,
    kategori: matched?.label || w.kategori || "",
    subKategori: matched?.slug || w.subKategori || "",
    status,
    statusPemeriksaan: w.statusPemeriksaan || "",
    tglPeriksa: w.tglPeriksa || "",
    posyandu: w.posyandu?.nama_posyandu || w.posyandu || "",
    rw: w.rw || "",
    alamat: w.alamat || "",
    noHp: w.telepon || w.noHp || "",
    namaIbu: w.nama_ibu || w.namaIbu || "",
    namaAyah: w.nama_ayah || w.namaAyah || "",
    namaSuami: w.nama_suami || w.namaSuami || "",
    keteranganIbuSuami,
    statusPernikahan: maritalStatus,
    pekerjaan: w.pekerjaan || "",
    profileKehamilanId: latestPregnancyProfile?.id || null,
    statusKehamilan: latestPregnancyProfile?.status_kehamilan || "",
    isMenyusui: latestPregnancyProfile?.is_menyusui === true,
    hpht: latestPregnancyProfile?.hpht || "",
    hpl: latestPregnancyProfile?.hpl || "",
    anakKe: latestPregnancyProfile?.anak_ke || "",
    jarakAnak: mapJarakAnakToForm(latestPregnancyProfile?.jarak_anak_sebelum_bulan),
    tglPersalinan: latestPregnancyProfile?.tanggal_persalinan ? String(latestPregnancyProfile.tanggal_persalinan).split("T")[0] : "",
    caraPersalinan: latestPregnancyProfile?.cara_persalinan || "",
    statusMenyusui: latestPregnancyProfile?.is_menyusui === true ? "Masih Menyusui" : ["nifas", "menyusui"].includes(latestPregnancyProfile?.status_kehamilan) ? "Sudah Tidak Menyusui" : "",
    bb: w.bb ?? "",
    tb: w.tb ?? "",
    bbl: birthWeight,
    pbl: birthHeight,
    riwayatKeluarga,
    riwayatDiriSendiri,
    perilakuBerisikoUsekrem: riwayatDiriSendiri,
    perilakuBerisiko: isAdultOrLansia ? perilakuBerisikoDewasa : riwayatDiriSendiri,
    perilakuBerisikoDewasa,
    profilKesehatanId: healthProfile.id || null,
    posyandu_id: w.posyandu_id ?? w.posyandu?.id ?? null,
    _raw: w,
=======
// Data mapper utility to bridge backend entities and frontend UI state seamlessly

export const KATEGORI_MAPPINGS = {
  bumil: { label: 'Bumil', slug: 'bumil' },
  busui: { label: 'Nifas/Menyusui', slug: 'nifas' },
  nifas: { label: 'Nifas/Menyusui', slug: 'nifas' },
  bayi: { label: 'Bayi 0–11 Bln', slug: 'bayi-0-11' },
  'bayi-0-11': { label: 'Bayi 0–11 Bln', slug: 'bayi-0-11' },
  balita: { label: 'Balita 12–59 Bln', slug: 'balita-12-59' },
  'balita-12-59': { label: 'Balita 12–59 Bln', slug: 'balita-12-59' },
  apras: { label: 'Apras 60–72 Bln', slug: 'apras' },
  'apras-60-72': { label: 'Apras 60–72 Bln', slug: 'apras' },
  uskrem_6_14: { label: 'Usekrem 6–14 Thn', slug: 'usekrem-6-14' },
  'usekrem-6-14': { label: 'Usekrem 6–14 Thn', slug: 'usekrem-6-14' },
  uskrem_15_18: { label: 'Usekrem 15–18 Thn', slug: 'usekrem-15-18' },
  'usekrem-15-18': { label: 'Usekrem 15–18 Thn', slug: 'usekrem-15-18' },
  dewasa: { label: 'Dewasa', slug: 'dewasa' },
  lansia: { label: 'Lansia', slug: 'lansia' },
};

/**
 * Menghitung usia detail (tahun & bulan) berdasarkan tanggal lahir
 */
export function calculateAgeDetailed(birthDateInput) {
  if (!birthDateInput) return { years: 0, months: 0, totalMonths: 0 };
  try {
    const birthDate = new Date(birthDateInput);
    if (isNaN(birthDate.getTime())) return { years: 0, months: 0, totalMonths: 0 };
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalMonths = Math.max(0, years * 12 + months);
    return { years: Math.max(0, years), months: Math.max(0, months), totalMonths };
  } catch {
    return { years: 0, months: 0, totalMonths: 0 };
  }
}

/**
 * Format teks usia sesuai aturan kategori:
 * - Uskrem sampai Lansia (termasuk Bumil & Nifas) -> HANYA TAHUN SAJA (tanpa embel-embel bulan, misal: 15 Tahun, 30 Tahun)
 * - Bayi -> X Bulan
 * - Balita & Apras -> X Tahun Y Bulan (atau X Bulan)
 */
export function formatUsiaByCategory(birthDateInput, categorySlug = '') {
  if (!birthDateInput) return '-';
  const { years, months, totalMonths } = calculateAgeDetailed(birthDateInput);
  const cat = String(categorySlug || '').toLowerCase();
  
  if (cat.includes('bayi') || cat === 'bayi-0-11') {
    return `${totalMonths} Bulan`;
  }
  if (cat.includes('balita') || cat === 'balita-12-59' || cat.includes('apras') || cat === 'apras-60-72') {
    if (years === 0) return `${totalMonths} Bulan`;
    return months > 0 ? `${years} Tahun ${months} Bulan` : `${years} Tahun`;
  }
  
  // Kategori Usekrem (6-18 thn), Dewasa, Lansia, Bumil, Nifas/Menyusui -> HANYA TAHUN SAJA
  return `${years} Tahun`;
}

/**
 * Format tanggal Indonesia: Tanggal dan Bulan dulu (DD-MM-YYYY)
 */
export function formatIndoDate(dateStr) {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const clean = String(dateStr).split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      if (y.length === 4) {
        return `${d}-${m}-${y}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch {}
  return dateStr;
}

export function mapBackendWargaToFrontend(w) {
  if (!w) return null;
  const katKey = (w.kategori_sasaran_saat_ini || w.kategori_sasaran || w.kategori || w.subKategori || '').toLowerCase();
  const matched = KATEGORI_MAPPINGS[katKey] || {
    label: w.kategori || 'Dewasa',
    slug: w.subKategori || 'dewasa'
  };

  const gender = w.jenis_kelamin === 'L' || w.gender === 'Laki-laki' 
    ? 'Laki-laki' 
    : (w.jenis_kelamin === 'P' || w.gender === 'Perempuan' ? 'Perempuan' : (w.gender || 'Laki-laki'));

  const status = w.status_domisili 
    ? (w.status_domisili === 'aktif' ? 'Aktif' : 'Non-Aktif')
    : (w.status || 'Aktif');

  const ket = w.nama_ibu 
    ? `Ibu: ${w.nama_ibu}` 
    : (w.nama_suami 
        ? `Suami: ${w.nama_suami}` 
        : (w.nama_ayah ? `Ayah: ${w.nama_ayah}` : (w.keteranganIbuSuami || '')));

  const rawBirthDate = w.tanggal_lahir ? String(w.tanggal_lahir).split('T')[0] : (w.tglLahir || '');
  const calculatedUsia = rawBirthDate 
    ? formatUsiaByCategory(rawBirthDate, matched.slug)
    : (w.umur_text || w.usia || '1 Tahun');

  const { totalMonths } = calculateAgeDetailed(rawBirthDate);

  return {
    id: w.id,
    idSasaran: w.id_sasaran || `PSY-${String(w.id).padStart(3, '0')}`,
    nama: w.nama_lengkap || w.nama || 'Sasaran',
    nik: w.nik || '',
    tglLahir: rawBirthDate,
    usia: calculatedUsia,
    usiaBulan: w.usia_bulan || totalMonths || 12,
    gender: gender,
    kategori: matched.label,
    subKategori: matched.slug,
    status: status,
    statusPemeriksaan: w.statusPemeriksaan || 'Belum',
    tglPeriksa: w.tglPeriksa || '-',
    posyandu: w.posyandu?.nama_posyandu || w.posyandu || 'Posyandu Melati',
    rw: w.rw || (w.posyandu?.nama_posyandu?.includes('RW') ? w.posyandu.nama_posyandu : 'RW 04'),
    alamat: w.alamat || 'Wilayah Posyandu Melati',
    noHp: w.telepon || w.noHp || '',
    namaIbu: w.nama_ibu || w.namaIbu || '',
    namaAyah: w.nama_ayah || w.namaAyah || '',
    namaSuami: w.nama_suami || w.namaSuami || '',
    keteranganIbuSuami: ket,
    statusPernikahan: w.status_pernikahan || w.statusPernikahan || 'Menikah',
    pekerjaan: w.pekerjaan || '',
    golDarah: w.golongan_darah || w.golDarah || '',
    bb: w.bb || '',
    tb: w.tb || '',
    bbl: w.bbl || w.berat_lahir || '',
    pbl: w.pbl || w.panjang_lahir || '',
    hpht: w.hpht ? String(w.hpht).split('T')[0] : '',
    hpl: w.hpl ? String(w.hpl).split('T')[0] : '',
    tglPersalinan: w.tgl_persalinan || w.tglPersalinan ? String(w.tgl_persalinan || w.tglPersalinan).split('T')[0] : '',
    statusMenyusui: w.status_menyusui || w.statusMenyusui || '',
    riwayatKeluarga: w.riwayat_keluarga || w.riwayatKeluarga || [],
    riwayatDiriSendiri: w.riwayat_diri_sendiri || w.riwayatDiriSendiri || [],
    perilakuBerisiko: w.perilaku_berisiko || w.perilakuBerisiko || {},
    _raw: w
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };
}

export function mapBackendSesiToFrontend(s) {
  if (!s) return null;
<<<<<<< HEAD

  const rawDate = s.tanggal_pelaksanaan || s.tanggal ? String(s.tanggal_pelaksanaan || s.tanggal).split("T")[0] : "";

  let tanggalFormatted = formatDateId(rawDate);
  let hari = "";
  if (rawDate) {
    const d = new Date(`${rawDate}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      hari = d.toLocaleDateString("id-ID", { weekday: "long" });
    }
  }

  const waktuMulai = s.waktu_mulai ? String(s.waktu_mulai).substring(0, 5).replace(":", ".") : "";
  const waktuSelesai = s.waktu_selesai ? String(s.waktu_selesai).substring(0, 5).replace(":", ".") : "";
  const fokusLayanan = Array.isArray(s.fokus_layanan) ? s.fokus_layanan : [];

  return {
    id: s.id,
    posyandu: s.posyandu?.nama_posyandu || s.posyandu || "",
    posyandu_id: s.posyandu_id ?? s.posyandu?.id ?? null,
    puskesmas: s.posyandu?.puskesmas?.nama_puskesmas || s.puskesmas?.nama_puskesmas || "",
    rw: s.rw || "",
    kelurahan: s.kelurahan?.nama_kelurahan || s.kelurahan || s.posyandu?.kelurahan?.nama_kelurahan || "",
    tanggal: rawDate,
    hari,
    tanggalFormatted,
    waktuMulai,
    waktuSelesai,
    waktu: waktuMulai && waktuSelesai ? `${waktuMulai} - ${waktuSelesai} WIB` : "",
    lokasi: s.lokasi || "",
    alamatDetail: s.alamat_detail || "",
    fokusLayanan,
    status: s.status === "open" ? "Terjadwal" : s.status === "closed" ? "Selesai" : s.status || "",
    targetSasaran: s.target_sasaran || "",
    catatan: s.catatan || "",
    kontakKader: s.kontak_kader || "",
    _raw: s,
=======
  const rawDate = s.tanggal_pelaksanaan || s.tanggal ? String(s.tanggal_pelaksanaan || s.tanggal).split('T')[0] : '';
  let tglIndo = rawDate;
  let hariName = 'Senin';

  if (rawDate) {
    try {
      const d = new Date(rawDate);
      tglIndo = d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      hariName = tglIndo.split(',')[0];
    } catch {}
  }

  // Baca metadata tersimpan spesifik kader untuk sesi ini
  let localMeta = null;
  try {
    const metaMap = JSON.parse(localStorage.getItem('posyandu_sesi_metadata') || '{}');
    localMeta = metaMap[String(s.id)] || metaMap[rawDate] || null;
  } catch {}

  const waktuMulaiStr = localMeta?.waktuMulai || (s.waktu_mulai ? String(s.waktu_mulai).substring(0, 5).replace(':', '.') : (s.waktuMulai || '08.00'));
  const waktuSelesaiStr = localMeta?.waktuSelesai || (s.waktu_selesai ? String(s.waktu_selesai).substring(0, 5).replace(':', '.') : (s.waktuSelesai || '11.30'));

  const fokusLayanan = (localMeta?.fokusLayanan && Array.isArray(localMeta.fokusLayanan) && localMeta.fokusLayanan.length > 0)
    ? localMeta.fokusLayanan
    : (Array.isArray(s.fokus_layanan) && s.fokus_layanan.length > 0 ? s.fokus_layanan : (s.fokusLayanan || ['Bayi & Balita', 'Bumil']));

  const alamatDetail = localMeta?.alamatDetail || s.alamat_detail || s.alamatDetail || (s.rw ? `Wilayah RW ${s.rw}` : 'Wilayah Posyandu Melati');

  return {
    id: s.id,
    posyandu: s.posyandu?.nama_posyandu || s.posyandu || 'Posyandu Melati',
    rw: s.rw ? (String(s.rw).startsWith('RW') ? s.rw : `RW ${s.rw}`) : 'RW 04',
    kelurahan: s.kelurahan || s.posyandu?.kelurahan?.nama_kelurahan || 'Kelurahan Sukamaju',
    tanggal: rawDate || '2026-09-23',
    hari: hariName || 'Rabu',
    tanggalFormatted: tglIndo || 'Rabu, 23 September 2026',
    waktuMulai: waktuMulaiStr,
    waktuSelesai: waktuSelesaiStr,
    waktu: `${waktuMulaiStr} - ${waktuSelesaiStr} WIB`,
    lokasi: s.lokasi || localMeta?.lokasi || 'Posyandu Melati',
    alamatDetail: alamatDetail,
    fokusLayanan: fokusLayanan,
    status: s.status === 'open' ? 'Terjadwal' : (s.status === 'closed' ? 'Selesai' : (s.status || 'Terjadwal')),
    targetSasaran: localMeta?.targetSasaran || s.target_sasaran || s.targetSasaran || '45 Sasaran',
    catatan: localMeta?.catatan || s.catatan || '',
    kontakKader: s.kontak_kader || s.kontakKader || 'Kader Utama (088227683468)',
    _raw: s
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };
}
