// Data mapper utility to bridge backend entities and frontend UI state seamlessly

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

export function mapBackendWargaToFrontend(w) {
  if (!w) return null;
  const katKey = (w.kategori_sasaran_saat_ini || w.kategori_sasaran_estimasi || w.kategori_sasaran || w.kategori || w.subKategori || "").toLowerCase();
  const matched = KATEGORI_MAPPINGS[katKey] || {
    label: w.kategori || "-",
    slug: w.subKategori || "",
  };

  const gender = w.jenis_kelamin === "L" || w.gender === "Laki-laki" ? "Laki-laki" : w.jenis_kelamin === "P" || w.gender === "Perempuan" ? "Perempuan" : w.gender || "Laki-laki";

  const status = w.status_domisili ? (w.status_domisili === "aktif" ? "Aktif" : "Non-Aktif") : w.status || "Aktif";

  const ket = w.nama_ibu ? `Ibu: ${w.nama_ibu}` : w.nama_suami ? `Suami: ${w.nama_suami}` : w.nama_ayah ? `Ayah: ${w.nama_ayah}` : w.keteranganIbuSuami || "";

  let calculatedUsia = w.umur_text || w.usia || "";
  if (!calculatedUsia && w.tanggal_lahir) {
    try {
      const bDate = new Date(w.tanggal_lahir);
      const now = new Date();
      const diffMonths = (now.getFullYear() - bDate.getFullYear()) * 12 + (now.getMonth() - bDate.getMonth());
      const years = Math.floor(diffMonths / 12);
      if (years >= 1) {
        calculatedUsia = `${years} Thn (${diffMonths} Bln)`;
      } else {
        calculatedUsia = `${diffMonths} Bulan`;
      }
    } catch {}
  }

  return {
    id: w.id,
    idSasaran: w.id_sasaran || `PSY-${String(w.id).padStart(3, "0")}`,
    nama: w.nama_lengkap || w.nama || "Sasaran",
    nik: w.nik || "",
    tglLahir: w.tanggal_lahir ? String(w.tanggal_lahir).split("T")[0] : w.tglLahir || "",
    usia: calculatedUsia || "-",
    usiaBulan: w.usia_bulan || 12,
    gender: gender,
    kategori: matched.label,
    subKategori: matched.slug,
    status: status,
    statusPemeriksaan: w.statusPemeriksaan || "Belum",
    tglPeriksa: w.tglPeriksa || "-",
    posyandu: w.posyandu?.nama_posyandu || w.posyandu || "",
    rw: w.rw || (w.posyandu?.nama_posyandu?.includes("RW") ? w.posyandu.nama_posyandu : ""),
    alamat: w.alamat || "",
    noHp: w.telepon || w.noHp || "",
    namaIbu: w.nama_ibu || w.namaIbu || "",
    namaAyah: w.nama_ayah || w.namaAyah || "",
    namaSuami: w.nama_suami || w.namaSuami || "",
    keteranganIbuSuami: ket,
    statusPernikahan: w.status_pernikahan || w.statusPernikahan || "Menikah",
    pekerjaan: w.pekerjaan || "",
    bb: w.bb || "",
    tb: w.tb || "",
    _raw: w,
  };
}

export function mapBackendSesiToFrontend(s) {
  if (!s) return null;
  const rawDate = s.tanggal_pelaksanaan || s.tanggal ? String(s.tanggal_pelaksanaan || s.tanggal).split("T")[0] : "";
  let tglIndo = rawDate;
  let hariName = "Senin";

  if (rawDate) {
    try {
      const d = new Date(rawDate);
      tglIndo = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      hariName = tglIndo.split(",")[0];
    } catch {}
  }

  // Baca metadata tersimpan spesifik kader untuk sesi ini
  let localMeta = null;
  try {
    const metaMap = JSON.parse(localStorage.getItem("posyandu_sesi_metadata") || "{}");
    localMeta = metaMap[String(s.id)] || metaMap[rawDate] || null;
  } catch {}

  const waktuMulaiStr = localMeta?.waktuMulai || (s.waktu_mulai ? String(s.waktu_mulai).substring(0, 5).replace(":", ".") : s.waktuMulai || "08.00");
  const waktuSelesaiStr = localMeta?.waktuSelesai || (s.waktu_selesai ? String(s.waktu_selesai).substring(0, 5).replace(":", ".") : s.waktuSelesai || "11.30");

  const fokusLayanan =
    localMeta?.fokusLayanan && Array.isArray(localMeta.fokusLayanan) && localMeta.fokusLayanan.length > 0
      ? localMeta.fokusLayanan
      : Array.isArray(s.fokus_layanan) && s.fokus_layanan.length > 0
        ? s.fokus_layanan
        : s.fokusLayanan || ["Bayi & Balita", "Bumil"];

  const alamatDetail = localMeta?.alamatDetail || s.alamat_detail || s.alamatDetail || (s.rw ? `Wilayah RW ${s.rw}` : "Wilayah Posyandu Melati");

  return {
    id: s.id,
    posyandu: s.posyandu?.nama_posyandu || s.posyandu || "Posyandu Melati",
    rw: s.rw ? (String(s.rw).startsWith("RW") ? s.rw : `RW ${s.rw}`) : "RW 04",
    kelurahan: s.kelurahan || s.posyandu?.kelurahan?.nama_kelurahan || "Kelurahan Sukamaju",
    tanggal: rawDate || "2026-09-23",
    hari: hariName || "Rabu",
    tanggalFormatted: tglIndo || "Rabu, 23 September 2026",
    waktuMulai: waktuMulaiStr,
    waktuSelesai: waktuSelesaiStr,
    waktu: `${waktuMulaiStr} - ${waktuSelesaiStr} WIB`,
    lokasi: s.lokasi || localMeta?.lokasi || "Posyandu Melati",
    alamatDetail: alamatDetail,
    fokusLayanan: fokusLayanan,
    status: s.status === "open" ? "Terjadwal" : s.status === "closed" ? "Selesai" : s.status || "Terjadwal",
    targetSasaran: localMeta?.targetSasaran || s.target_sasaran || s.targetSasaran || "45 Sasaran",
    catatan: localMeta?.catatan || s.catatan || "",
    kontakKader: s.kontak_kader || s.kontakKader || "Kader Utama (088227683468)",
    _raw: s,
  };
}
