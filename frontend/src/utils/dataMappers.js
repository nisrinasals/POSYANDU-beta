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

export function mapBackendWargaToFrontend(w) {
  if (!w) return null;

  const kategoriKey = (w.kategori_sasaran_saat_ini || w.kategori_sasaran_estimasi || w.kategori_sasaran || w.kategori || w.subKategori || "").toLowerCase();

  const matched = KATEGORI_MAPPINGS[kategoriKey];

  const gender = w.jenis_kelamin === "L" ? "Laki-laki" : w.jenis_kelamin === "P" ? "Perempuan" : w.gender || "";

  const status = w.status_domisili ? (w.status_domisili === "aktif" ? "Aktif" : "Non-Aktif") : w.status || "";

  const keteranganIbuSuami = w.nama_ibu ? `Ibu: ${w.nama_ibu}` : w.nama_suami ? `Suami: ${w.nama_suami}` : w.nama_ayah ? `Ayah: ${w.nama_ayah}` : w.keteranganIbuSuami || "";

  return {
    id: w.id,
    idSasaran: w.id_sasaran || "",
    nama: w.nama_lengkap || w.nama || "",
    nik: w.nik || "",
    tglLahir: w.tanggal_lahir ? String(w.tanggal_lahir).split("T")[0] : w.tglLahir || "",
    usia: w.umur_text || w.usia || "",
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
    statusPernikahan: w.status_perkawinan || w.status_pernikahan || w.statusPernikahan || "",
    pekerjaan: w.pekerjaan || "",
    bb: w.bb ?? "",
    tb: w.tb ?? "",
    posyandu_id: w.posyandu_id ?? w.posyandu?.id ?? null,
    _raw: w,
  };
}

export function mapBackendSesiToFrontend(s) {
  if (!s) return null;

  const rawDate = s.tanggal_pelaksanaan || s.tanggal ? String(s.tanggal_pelaksanaan || s.tanggal).split("T")[0] : "";

  let tanggalFormatted = rawDate;
  let hari = "";
  if (rawDate) {
    const d = new Date(rawDate);
    if (!Number.isNaN(d.getTime())) {
      tanggalFormatted = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
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
  };
}
