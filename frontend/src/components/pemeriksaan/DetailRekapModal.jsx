<<<<<<< HEAD
import React from "react";
import { User, Activity, BarChart2, Stethoscope, HeartHandshake, CheckCircle2, Edit3, X, ShieldCheck, Loader2 } from "lucide-react";
import { formatDateId } from "../../utils/dataMappers";

const SCREENING_LABELS = {
  hpht: "HPHT",
  hpl: "Taksiran HPL",
  tbc: "Skrining TBC",
  pelayanan_kesehatan: "Pelayanan Kesehatan",
  pemeriksaan_6_bulanan: "Pemeriksaan 6 Bulanan",
  pemeriksaan_tahunan_remaja_putri: "Pemeriksaan Tahunan Remaja Putri",
  skrining_kesehatan_jiwa: "Skrining Kesehatan Jiwa",
  skrining_ppok_puma: "Skrining PPOK (PUMA)",
  aks_aktifitas_harian: "Aktivitas Kehidupan Sehari-hari (AKS)",
  skilas: "Skrining Lansia (SKILAS)",
  tes_penglihatan_hitung_jari: "Tes Penglihatan (Hitung Jari)",
  tes_pendengaran_berbisik: "Tes Pendengaran (Berbisik)",
  gejala_tambahan: "Gejala Tambahan",
  kognitif_dan_mobilisasi: "Kognitif dan Mobilisasi",
  malnutrisi: "Risiko Malnutrisi",
  gangguan_penglihatan: "Gangguan Penglihatan",
  gangguan_pendengaran: "Gangguan Pendengaran",
  gejala_depresi: "Gejala Depresi",
  jawaban_skor: "Jawaban Skrining Jiwa",
  has_batuk_menerus: "Batuk Terus-menerus",
  has_batuk_2_minggu: "Batuk 2 Minggu atau Lebih",
  has_batuk_lebih_2_minggu: "Batuk Lebih dari 2 Minggu",
  has_batuk_kurang_2_minggu: "Batuk Kurang dari 2 Minggu",
  has_demam_2_minggu: "Demam 2 Minggu atau Lebih",
  has_bb_tetap_atau_turun_2_bulan: "BB Tetap atau Turun 2 Bulan",
  has_kontak_pasien_tbc: "Kontak dengan Pasien TBC",
  has_lesu_malaise: "Lesu / Malaise",
  is_tbc_terindikasi: "Indikasi TBC",
  status_tbc: "Status TBC",
  has_nafsu_makan_menurun: "Nafsu Makan Menurun",
  has_bb_menurun: "Berat Badan Menurun",
  has_lemah_letih_lesu: "Lemah, Letih, Lesu",
  has_keringat_malam_tanpa_fisik: "Berkeringat Malam Tanpa Aktivitas Fisik",
  has_batuk_darah: "Batuk Berdarah",
  has_sesak_nafas: "Sesak Napas",
  is_mata_kanan_normal: "Mata Kanan Normal",
  is_mata_kiri_normal: "Mata Kiri Normal",
  is_telinga_kanan_normal: "Telinga Kanan Normal",
  is_telinga_kiri_normal: "Telinga Kiri Normal",
  is_skrining_jiwa: "Skrining Jiwa Dilakukan",
  is_periksa_hb: "Pemeriksaan Hb Dilakukan",
  is_asi_eksklusif: "ASI Eksklusif",
  is_mpasi: "Pemberian MP-ASI",
  is_mp_asi: "Pemberian MP-ASI",
  is_pmt_lokal_pemulihan: "PMT Lokal Pemulihan",
  is_konsumsi_pmt_habis: "PMT Dikonsumsi Habis",
  is_vit_a_given: "Vitamin A Diberikan",
  is_obat_cacing_given: "Obat Cacing Diberikan",
  is_ikut_kelas_balita: "Mengikuti Kelas Balita",
  is_rutin_vit_a: "Rutin Konsumsi Vitamin A",
  is_menyusui: "Masih Menyusui",
  is_kb_pasca_persalinan: "KB Pascapersalinan",
  jumlah_kapsul_vit_a: "Jumlah Kapsul Vitamin A",
  jumlah_ttd_given: "Jumlah TTD Diberikan",
  is_rutin_ttd: "Rutin Konsumsi TTD",
  is_mt_kek_given: "MT Bumil KEK Diberikan",
  komposisi_mt_kek: "Komposisi MT Bumil KEK",
  jumlah_m_kek: "Jumlah MT Bumil KEK",
  is_rutin_mt_kek: "Rutin Konsumsi MT Bumil KEK",
  kadar_gula_darah: "Kadar Gula Darah",
  ploting_gula_darah: "Hasil Gula Darah",
  kadar_kolesterol: "Kadar Kolesterol",
  ploting_kolesterol: "Hasil Kolesterol",
  is_menggunakan_kontrasepsi: "Menggunakan Kontrasepsi",
  jenis_kelamin_skor: "Skor Jenis Kelamin",
  usia_skor: "Skor Usia",
  merokok_skor: "Skor Merokok",
  napas_pendek_skor: "Skor Napas Pendek",
  dahak_paru_skor: "Skor Dahak",
  batuk_atau_spirometri_skor: "Skor Batuk / Spirometri",
  total_skor_puma: "Total Skor PUMA",
  status_risiko_puma: "Status Risiko PUMA",
  bulan_pemeriksaan: "Bulan Pemeriksaan",
  kurang_bersemangat: "Kurang Berminat atau Bersemangat",
  murung_tertekan_putus_asa: "Merasa Murung atau Putus Asa",
  gugup_cemas_gelisah: "Merasa Gugup atau Cemas",
  sulit_kendalikan_khawatir: "Sulit Mengendalikan Rasa Khawatir",
  total_skor_jiwa: "Total Skor Skrining Jiwa",
  group1_skor_jiwa: "Skor Kelompok 1",
  group2_skor_jiwa: "Skor Kelompok 2",
  is_rujukan_jiwa: "Perlu Rujukan Kesehatan Jiwa",
  bab_skor: "Skor BAB",
  bak_skor: "Skor BAK",
  membersihkan_diri_skor: "Skor Membersihkan Diri",
  penggunaan_wc_skor: "Skor Penggunaan WC",
  makan_minum_skor: "Skor Makan dan Minum",
  transfer_tempat_tidur_skor: "Skor Berpindah dari Tempat Tidur",
  berjalan_tempat_rata_skor: "Skor Berjalan di Tempat Rata",
  berpakaian_skor: "Skor Berpakaian",
  naik_turun_tangga_skor: "Skor Naik-Turun Tangga",
  mandi_skor: "Skor Mandi",
  total_skor_aks: "Total Skor AKS",
  status_aks: "Status AKS",
  kode_aks: "Kode AKS",
  is_rujukan_aks: "Perlu Rujukan AKS",
  has_kendala_orientasi_waktu_tempat: "Kendala Orientasi Waktu atau Tempat",
  has_kendala_ulang_3_kata: "Kendala Mengulang 3 Kata",
  has_keterbatasan_mobilisasi: "Keterbatasan Mobilisasi",
  has_kendala_tes_berdiri_kursi: "Kendala Tes Berdiri dari Kursi",
  has_bb_turun_3kg_3_bulan: "BB Turun 3 kg dalam 3 Bulan",
  has_hilang_nafsu_makan: "Kehilangan Nafsu Makan",
  is_lila_kurang_21cm: "LiLA Kurang dari 21 cm",
  has_masalah_mata: "Memiliki Masalah Mata",
  has_kendala_tes_melihat: "Kendala Tes Penglihatan",
  has_kendala_tes_berbisik: "Kendala Tes Berbisik",
  has_sedih_tertekan_putus_asa: "Merasa Sedih atau Putus Asa",
  has_kurang_minat_kesenangan: "Kurang Minat atau Kesenangan",
  is_imunisasi_covid19: "Imunisasi COVID-19",
};

const formatDisplayKey = (key) =>
  SCREENING_LABELS[key] ||
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isFilled = (value) => value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0);

const formatDisplayValue = (value, fieldKey = "") => {
  if (!isFilled(value)) return "-";
  if (Array.isArray(value)) return value.map((item) => (typeof item === "object" && item !== null ? formatDisplayValue(item) : formatDisplayValue(item, fieldKey))).join(", ");

  if (typeof value === "object") {
    return (
      Object.entries(value)
        .filter(([key, child]) => isFilled(child) && !(key === "tempat_imunisasi" && String(child).includes(" || ")))
        .map(([key, child]) => `${formatDisplayKey(key)}: ${formatDisplayValue(child, key)}`)
        .join(" • ") || "-"
    );
  }

  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (fieldKey === "hpht" || fieldKey === "hpl" || fieldKey.startsWith("tanggal") || fieldKey === "tglLahir" || fieldKey === "tglPeriksa") return formatDateId(value);
  if (fieldKey === "status_tbc") return ({ risiko: "Risiko", rujukan: "Perlu Rujukan", tidak_terindikasi: "Tidak Terindikasi" })[value] || String(value);
  if (fieldKey === "status_risiko_puma") return ({ risiko_rendah: "Risiko Rendah", risiko_tinggi: "Risiko Tinggi", ambigu_skor_6: "Skor Perlu Evaluasi" })[value] || String(value);
  if (fieldKey === "status_aks") return String(value).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  if (fieldKey === "kode_aks") return ({ M: "Mandiri", R: "Ketergantungan Ringan", S: "Ketergantungan Sedang", B: "Ketergantungan Berat", T: "Ketergantungan Total" })[value] || String(value);
  if (fieldKey.startsWith("ploting_")) return String(value).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return String(value);
};

const formatMeasurement = (value, unit = "") => {
  if (!isFilled(value)) return "";
  const text = String(value);
  return /[a-zA-Z%]/.test(text) ? text : `${text}${unit ? ` ${unit}` : ""}`;
};

export const resolve5StepDetails = (citizen, examData = null) => {
  if (!citizen) return null;

  const exam = examData || citizen.exam || null;
  const source = citizen?._raw || citizen || {};
  const step2 = exam?.pengukuran_step_2 || exam?.langkah2 || {};
  const step4 = exam?.langkah4 || exam?.detail_skrining || {};
  const step5 = exam?.langkah5 || {};
  const zScores = exam?.z_scores || {};
  const plot = exam?.hasil_plot || {};

  const tglPeriksa = formatDateId(exam?.tanggal || citizen.tglPeriksa || "");

  const isExamined = Boolean(citizen.statusPemeriksaan === "Sudah" || citizen.status === "Sudah" || exam?.kunjungan?.status_langkah === "langkah_5");

  const l1 = {
    nik: citizen.nik || source.nik || "",
    nama: citizen.nama || source.nama_lengkap || "",
    tglLahir: formatDateId(citizen.tglLahir || source.tanggal_lahir || ""),
    gender: citizen.gender || source.jenis_kelamin || "",
    keteranganKeluarga: citizen.keteranganIbuSuami || citizen.namaIbu || citizen.namaAyah || citizen.namaSuami || "",
    alamat: citizen.alamat || source.alamat || "",
  };

  if (exam?.langkah1 && typeof exam.langkah1 === "object") {
    Object.assign(l1, exam.langkah1);
  }

  const l2 = {};
  const fields = [
    ["bb_kg", "Berat Badan", "kg"],
    ["tb_cm", "Tinggi/Panjang Badan", "cm"],
    ["lingkar_kepala_cm", "Lingkar Kepala", "cm"],
    ["lila_cm", "Lingkar Lengan Atas", "cm"],
    ["lingkar_perut_cm", "Lingkar Perut", "cm"],
    ["td_sistole", "Tekanan Darah Sistole", "mmHg"],
    ["td_diastole", "Tekanan Darah Diastole", "mmHg"],
    ["kadar_gula", "Kadar Gula", "mg/dL"],
  ];

  for (const [field, key, unit] of fields) {
    const value = step2[field] ?? exam?.[field] ?? source[field];
    if (isFilled(value)) l2[key] = formatMeasurement(value, unit);
  }

  if (step2.imt !== undefined && step2.imt !== null && step2.imt !== "") {
    l2.IMT = formatMeasurement(step2.imt, "kg/m²");
  }

  if (step2.tensi !== undefined && step2.tensi !== null && step2.tensi !== "") {
    l2["Tekanan Darah"] = String(step2.tensi);
  }

  let l3 = {};
  if (exam?.langkah3 && typeof exam.langkah3 === "object") {
    l3 = { ...exam.langkah3 };
  } else {
    if (Object.values(zScores).some((v) => isFilled(v))) l3.zScores = zScores;
    if (Object.keys(plot).length) l3.hasil_plot = plot;
    if (exam?.periode) l3.periode = exam.periode;

    if (!Object.keys(l3).length) {
      const zScoreFields = {
        zscore_bbu: exam?.zscore_bbu,
        zscore_pbu: exam?.zscore_pbu,
        zscore_tbu: exam?.zscore_tbu,
        zscore_bbpb: exam?.zscore_bbpb,
        zscore_bbtb: exam?.zscore_bbtb,
        zscore_imtu: exam?.zscore_imtu,
      };
      if (Object.values(zScoreFields).some((v) => isFilled(v))) {
        l3 = zScoreFields;
      }
    }
  }

  const l4 = step4 && typeof step4 === "object" ? step4 : {};
  const l5 = {
    penyuluhan: step5.penyuluhan || step5.topikPenyuluhan || exam?.topik_penyuluhan || "",
    rujukan: step5.rujukan || step5.statusRujukan || exam?.alasan_rujukan || (exam?.is_perlu_rujukan === true ? "Perlu rujukan" : ""),
    is_perlu_rujukan: exam?.is_perlu_rujukan,
    alasan_rujukan: exam?.alasan_rujukan || "",
  };

  return {
    ...citizen,
    tglPeriksa,
    isExamined,
    langkah1: l1,
    categoryMetaL1: {},
    langkah2: l2,
    langkah3: l3,
    langkah4: l4,
    langkah5: l5,
  };
};

export default function DetailRekapModal({ citizen, selectedCitizen, onClose, onHide, show = true, examData = null, isLoading = false, theme = "kader", themeColor = null, roleTitle = null, onEdit = null }) {
  if (show === false) return null;

=======
import React from 'react';
import { 
  User, 
  Activity, 
  BarChart2, 
  Stethoscope, 
  HeartHandshake, 
  CheckCircle2, 
  Edit3,
  X,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatIndoDate } from '../../utils/dataMappers';
import { evaluasiPemeriksaan } from '../../utils/plotHelper';
import GrowthChartPlotter from './GrowthChartPlotter';

/**
 * Normalizes and extracts structured 5-step Posyandu examination details
 * strictly aligned with backend models (Pemeriksaan, detail_skrining, plotHelper).
 */
export const resolve5StepDetails = (citizen, examData = null) => {
  if (!citizen) return null;

  let exam = examData || citizen.exam || citizen.pemeriksaan || null;
  if (!exam && (citizen.rawDetail || citizen.langkah4 || citizen.detail_skrining || citizen.bb_kg || citizen.bb)) {
    exam = citizen;
  }
  const isExamined = citizen.statusPemeriksaan === 'Sudah' || citizen.status === 'Sudah' || !!exam;
  
  const rawTglPeriksa = (exam && (exam.tanggal || exam.tglPemeriksaan || exam.tglPeriksa)) 
    ? (exam.tanggal || exam.tglPemeriksaan || exam.tglPeriksa) 
    : (citizen.tglPeriksa && citizen.tglPeriksa !== '-' ? citizen.tglPeriksa : (citizen.tanggalPemeriksaan || citizen.tanggal));
  const tglPeriksa = rawTglPeriksa ? formatIndoDate(rawTglPeriksa) : (isExamined ? formatIndoDate(new Date()) : '-');

  const rawKat = (citizen.kategori || citizen.kategori_sasaran || exam?.kategori_sasaran || '').toLowerCase();
  const subKat = (citizen.subKategori || citizen.sub_kategori || '').toLowerCase();

  // Normalize Category string
  let normalizedCat = 'dewasa';
  if (rawKat.includes('bumil') || subKat.includes('bumil')) normalizedCat = 'bumil';
  else if (rawKat.includes('nifas') || rawKat.includes('busui') || subKat.includes('nifas') || subKat.includes('busui')) normalizedCat = 'nifas';
  else if (rawKat.includes('bayi') || subKat.includes('bayi')) normalizedCat = 'bayi-0-11';
  else if (rawKat.includes('balita') || subKat.includes('balita')) normalizedCat = 'balita-12-59';
  else if (rawKat.includes('apras') || subKat.includes('apras')) normalizedCat = 'apras';
  else if (rawKat.includes('6-14') || subKat.includes('6-14') || rawKat.includes('6_14')) normalizedCat = 'usekrem-6-14';
  else if (rawKat.includes('15-18') || subKat.includes('15-18') || rawKat.includes('15_18') || rawKat.includes('remaja') || subKat.includes('remaja')) normalizedCat = 'usekrem-15-18';
  else if (rawKat.includes('lansia') || subKat.includes('lansia')) normalizedCat = 'lansia';
  else normalizedCat = 'dewasa';

  // 1. LANGKAH 1: Identitas Sasaran
  const nik = exam?.langkah1?.nik || exam?.nik || citizen.nik || '-';
  const nama = exam?.langkah1?.nama || exam?.nama || citizen.nama || '-';
  const rawBirth = exam?.langkah1?.tglLahir || exam?.tglLahir || citizen.tglLahir || citizen.tanggal_lahir;
  const tglLahir = rawBirth ? formatIndoDate(rawBirth) : '-';
  
  const rawGender = ['bumil', 'nifas'].includes(normalizedCat) 
    ? 'Perempuan' 
    : (exam?.langkah1?.gender || exam?.gender || citizen.gender || (citizen.jenis_kelamin === 'P' ? 'Perempuan' : citizen.jenis_kelamin === 'L' ? 'Laki-laki' : citizen.jenis_kelamin) || '-');
  const gender = rawGender.toLowerCase().startsWith('p') ? 'Perempuan' : (rawGender.toLowerCase().startsWith('l') ? 'Laki-laki' : rawGender);

  const isPutri = gender === 'Perempuan';

  const l1 = {
    nik,
    nama,
    tglLahir,
    gender,
    pekerjaan: citizen.pekerjaan || exam?.pekerjaan || exam?.langkah1?.pekerjaan || '-',
    statusPernikahan: citizen.statusPernikahan || exam?.statusPernikahan || exam?.langkah1?.statusPernikahan || '-',
    sekolah: citizen.sekolah || exam?.sekolah || exam?.langkah1?.sekolah || '-',
    kelas: citizen.kelas || exam?.kelas || exam?.langkah1?.kelas || '-',
    usiaKehamilan: citizen.usiaKehamilan || exam?.usiaKehamilan || exam?.langkah1?.usiaKehamilan || (citizen.ibuHamilDetail?.obstetri?.usiaKehamilan ? `${citizen.ibuHamilDetail.obstetri.usiaKehamilan} Minggu` : '-'),
    waktuKunjunganNifas: citizen.waktuKunjunganNifas || exam?.waktuKunjunganNifas || exam?.langkah1?.waktuKunjunganNifas || '-',
    umurAnak: citizen.usia || citizen.umur || citizen.subText || (normalizedCat === 'bayi-0-11' ? (exam?.usiaBayi || citizen.usiaBayi) : normalizedCat === 'balita-12-59' ? (exam?.usiaBalita || citizen.usiaBalita) : (exam?.usiaApras || citizen.usiaApras)) || '-'
  };

  // 2. LANGKAH 2: Pengukuran Fisik
  const rawL2 = exam?.langkah2 || exam || citizen?.langkah2 || citizen || {};
  const bb = rawL2.bb_kg !== undefined ? rawL2.bb_kg : (rawL2.bb !== undefined ? rawL2.bb : (citizen.bb_kg || citizen.bb || null));
  const tb = rawL2.tb_cm !== undefined ? rawL2.tb_cm : (rawL2.tb !== undefined ? rawL2.tb : (rawL2.pb !== undefined ? rawL2.pb : (citizen.tb_cm || citizen.tb || citizen.pb || null)));
  const lila = rawL2.lila_cm !== undefined ? rawL2.lila_cm : (rawL2.lila !== undefined ? rawL2.lila : (citizen.lila_cm || citizen.lila || null));
  const lp = rawL2.lingkar_perut_cm !== undefined ? rawL2.lingkar_perut_cm : (rawL2.lp !== undefined ? rawL2.lp : (rawL2.lingkarPerut !== undefined ? rawL2.lingkarPerut : (citizen.lingkar_perut_cm || citizen.lingkarPerut || citizen.lp || null)));
  const lk = rawL2.lingkar_kepala_cm !== undefined ? rawL2.lingkar_kepala_cm : (rawL2.lk !== undefined ? rawL2.lk : (rawL2.lingkarKepala !== undefined ? rawL2.lingkarKepala : (citizen.lingkar_kepala_cm || citizen.lingkarKepala || citizen.lk || null)));
  
  let tensiSistol = rawL2.td_sistole !== undefined ? rawL2.td_sistole : (rawL2.tensiSistol !== undefined ? rawL2.tensiSistol : null);
  let tensiDiastol = rawL2.td_diastole !== undefined ? rawL2.td_diastole : (rawL2.tensiDiastol !== undefined ? rawL2.tensiDiastol : null);
  if ((!tensiSistol || !tensiDiastol) && (rawL2.tensi || citizen.tensi)) {
    const tensiStr = String(rawL2.tensi || citizen.tensi).replace('mmHg', '').trim();
    const parts = tensiStr.split('/');
    if (parts.length === 2) {
      tensiSistol = parseInt(parts[0], 10);
      tensiDiastol = parseInt(parts[1], 10);
    }
  }

  const l2 = {
    bb: bb ? `${bb}` : null,
    tb: tb ? `${tb}` : null,
    lila: lila ? `${lila}` : null,
    lp: lp ? `${lp}` : null,
    lk: lk ? `${lk}` : null,
    tensiSistol,
    tensiDiastol,
    tensi: tensiSistol && tensiDiastol ? `${tensiSistol}/${tensiDiastol}` : (rawL2.tensi || citizen.tensi || null)
  };

  // 3. LANGKAH 3: Plotting Evaluasi Otomatis
  const hasBbTb = Boolean(bb && tb);
  const hasLila = Boolean(lila);
  const hasTensi = Boolean(tensiSistol && tensiDiastol);
  const hasLp = Boolean(lp);
  const hasLk = Boolean(lk);

  let plottingResult = {};
  try {
    plottingResult = evaluasiPemeriksaan({
      kategori_sasaran: normalizedCat,
      bb_kg: bb ? parseFloat(bb) : null,
      tb_cm: tb ? parseFloat(tb) : null,
      td_sistole: tensiSistol ? parseInt(tensiSistol, 10) : null,
      td_diastole: tensiDiastol ? parseInt(tensiDiastol, 10) : null,
      lila_cm: lila ? parseFloat(lila) : null,
      lingkar_perut_cm: lp ? parseFloat(lp) : null,
      jenis_kelamin: gender === 'Perempuan' ? 'P' : 'L',
      tanggal_lahir: citizen.tanggal_lahir || citizen.tglLahir,
      tanggal_pemeriksaan: exam?.tanggal || citizen.tanggal || new Date()
    }) || {};
  } catch {
    plottingResult = {};
  }

  // Calculate IMT
  const numBb = parseFloat(bb);
  const numTb = parseFloat(tb);
  let imtValue = null;
  if (numBb > 0 && numTb > 0) {
    const tbMeter = numTb / 100;
    imtValue = (numBb / (tbMeter * tbMeter)).toFixed(1);
  }

  // 4. LANGKAH 4: Skrining & Pelayanan Kesehatan
  let rawDetail = exam?.detail_skrining || exam?.langkah4 || citizen?.rawDetail || citizen?.detail_skrining || citizen?.langkah4 || (exam && typeof exam === 'object' ? exam : {}) || {};
  if (typeof rawDetail === 'string') {
    try {
      rawDetail = JSON.parse(rawDetail);
    } catch {
      rawDetail = {};
    }
  }

  let pelKes = rawDetail.pelayanan_kesehatan || exam?.pelayanan_kesehatan || citizen?.pelayanan_kesehatan || {};
  if (typeof pelKes === 'string') {
    try {
      pelKes = JSON.parse(pelKes);
    } catch {
      pelKes = {};
    }
  }

  let pem6Bulan = rawDetail.pemeriksaan_6_bulanan || exam?.pemeriksaan_6_bulanan || citizen?.pemeriksaan_6_bulanan || {};
  if (typeof pem6Bulan === 'string') {
    try {
      pem6Bulan = JSON.parse(pem6Bulan);
    } catch {
      pem6Bulan = {};
    }
  }

  let tbcDetail = rawDetail.tbc || exam?.tbc || citizen?.tbc || {};
  if (typeof tbcDetail === 'string') {
    try {
      tbcDetail = JSON.parse(tbcDetail);
    } catch {
      tbcDetail = {};
    }
  }
  const tbcGejalaTambahan = tbcDetail.gejala_tambahan || {};

  const ppokDetail = rawDetail.skrining_ppok_puma || exam?.skrining_ppok_puma || citizen?.skrining_ppok_puma || {};
  const aksDetail = rawDetail.skrining_aks_barthel || exam?.skrining_aks_barthel || citizen?.skrining_aks_barthel || {};
  const skilasDetail = rawDetail.skrining_lansia_skilas || exam?.skrining_lansia_skilas || citizen?.skrining_lansia_skilas || {};
  const jiwaDetail = rawDetail.skrining_kesehatan_jiwa || exam?.skrining_kesehatan_jiwa || citizen?.skrining_kesehatan_jiwa || {};
  const pemTahunan = rawDetail.pemeriksaan_tahunan_remaja_putri || exam?.pemeriksaan_tahunan_remaja_putri || citizen?.pemeriksaan_tahunan_remaja_putri || {};

  // TBC Evaluator
  const evalTbc = (() => {
    const isBatuk = tbcDetail.has_batuk_lebih_2_minggu || tbcDetail.has_batuk_2_minggu || rawDetail.batukTbc === 'Ya' || rawDetail.batukBesarTbc === 'Ya';
    const isDemam = tbcDetail.has_demam_2_minggu || rawDetail.demamTbc === 'Ya';
    const isBbTurun = tbcDetail.has_bb_tetap_atau_turun_2_bulan || tbcGejalaTambahan.has_bb_menurun || rawDetail.bbTurunTbc === 'Ya' || rawDetail.bbMenurunTbc === 'Ya';
    const isKontak = tbcDetail.has_kontak_pasien_tbc || rawDetail.kontakTbc === 'Ya';
    const isLesu = tbcDetail.has_lesu_malaise || tbcGejalaTambahan.has_lemah_letih_lesu || rawDetail.lesuTbc === 'Ya' || rawDetail.lemahLesuTbc === 'Ya';
    const isMakanTurun = tbcGejalaTambahan.has_nafsu_makan_menurun || rawDetail.nafsuMakanTbc === 'Ya';
    const isKeringat = tbcGejalaTambahan.has_keringat_malam_tanpa_fisik || rawDetail.berkeringatMalamTbc === 'Ya';
    const isBatukDarah = tbcGejalaTambahan.has_batuk_darah || rawDetail.batukDarahTbc === 'Ya';
    const isSesak = tbcGejalaTambahan.has_sesak_nafas || rawDetail.sesakNafasTbc === 'Ya';

    const flags = [
      isBatuk ? 'Batuk ≥ 2 Minggu' : null,
      isDemam ? 'Demam > 2 Minggu' : null,
      isBbTurun ? 'BB Turun / Tidak Naik' : null,
      isKontak ? 'Kontak Pasien TBC' : null,
      isLesu ? 'Lemah / Lesu' : null,
      isMakanTurun ? 'Nafsu Makan Turun' : null,
      isKeringat ? 'Keringat Malam' : null,
      isBatukDarah ? 'Batuk Berdarah' : null,
      isSesak ? 'Sesak Nafas' : null
    ].filter(Boolean);

    if (flags.length > 0 || tbcDetail.is_tbc_terindikasi) {
      return { text: `Berisiko TBC (${flags.length > 0 ? flags.join(', ') : 'Ada Gejala Terindikasi'})`, isRisiko: true };
    }
    return { text: 'Tidak Ada Gejala TBC (Normal)', isRisiko: false };
  })();

  // Gula Darah & Kolesterol
  const gulaDarahVal = exam?.kadar_gula !== undefined ? exam.kadar_gula : (rawDetail.kadar_gula_darah !== undefined ? rawDetail.kadar_gula_darah : (rawDetail.gulaDarah || rawL2.gulaDarah || citizen.gulaDarah || null));
  const kolesterolVal = exam?.kadar_kolesterol !== undefined ? exam.kadar_kolesterol : (rawDetail.kadar_kolesterol !== undefined ? rawDetail.kadar_kolesterol : (rawDetail.kolesterol || rawL2.kolesterol || citizen.kolesterol || null));

  // Imunisasi
  let imunisasiList = [];
  if (Array.isArray(exam?.imunisasiList) && exam.imunisasiList.length > 0) {
    imunisasiList = exam.imunisasiList;
  } else if (Array.isArray(rawDetail.imunisasiList) && rawDetail.imunisasiList.length > 0) {
    imunisasiList = rawDetail.imunisasiList;
  } else if (pelKes.jenis_imunisasi) {
    imunisasiList = Array.isArray(pelKes.jenis_imunisasi) ? pelKes.jenis_imunisasi : [pelKes.jenis_imunisasi];
  } else if (rawDetail.jenisImunisasi) {
    imunisasiList = [rawDetail.jenisImunisasi === 'Lainnya' ? (rawDetail.jenisImunisasiLainnya || 'Lainnya') : rawDetail.jenisImunisasi];
  } else if (rawDetail.imunisasi) {
    imunisasiList = [rawDetail.imunisasi];
  }

  // Mata & Telinga
  const mataKanan = pem6Bulan.tes_penglihatan_hitung_jari?.is_mata_kanan_normal !== undefined 
    ? (pem6Bulan.tes_penglihatan_hitung_jari.is_mata_kanan_normal ? 'Normal' : 'Gangguan') 
    : (rawDetail.mataKanan || null);
  const mataKiri = pem6Bulan.tes_penglihatan_hitung_jari?.is_mata_kiri_normal !== undefined 
    ? (pem6Bulan.tes_penglihatan_hitung_jari.is_mata_kiri_normal ? 'Normal' : 'Gangguan') 
    : (rawDetail.mataKiri || null);
  const telingaKanan = pem6Bulan.tes_pendengaran_berbisik?.is_telinga_kanan_normal !== undefined 
    ? (pem6Bulan.tes_pendengaran_berbisik.is_telinga_kanan_normal ? 'Normal' : 'Gangguan') 
    : (rawDetail.telingaKanan || null);
  const telingaKiri = pem6Bulan.tes_pendengaran_berbisik?.is_telinga_kiri_normal !== undefined 
    ? (pem6Bulan.tes_pendengaran_berbisik.is_telinga_kiri_normal ? 'Normal' : 'Gangguan') 
    : (rawDetail.telingaKiri || null);

  // PUMA
  const pumaScore = ppokDetail.total_skor_puma !== undefined ? ppokDetail.total_skor_puma : (rawDetail.pumaScore !== undefined ? rawDetail.pumaScore : null);
  const pumaRisiko = ppokDetail.status_risiko_puma ? ppokDetail.status_risiko_puma.includes('tinggi') : (rawDetail.pumaRisiko !== undefined ? rawDetail.pumaRisiko : (pumaScore >= 6));

  // 5. LANGKAH 5: Penyuluhan & Rujukan
  const topikPenyuluhan = exam?.topik_penyuluhan || exam?.langkah5?.topikPenyuluhan || exam?.langkah5?.penyuluhan || exam?.topikPenyuluhan || rawDetail.topikPenyuluhan || citizen.topikPenyuluhan || null;
  const isPerluRujukan = exam?.is_perlu_rujukan !== undefined 
    ? exam.is_perlu_rujukan 
    : (exam?.statusRujukan && exam.statusRujukan !== 'Tidak Perlu Rujukan') || (rawDetail.statusRujukan && rawDetail.statusRujukan !== 'Tidak Perlu Rujukan');
  const statusRujukan = exam?.statusRujukan || rawDetail.statusRujukan || (isPerluRujukan ? 'Perlu Rujukan ke Puskesmas' : 'Tidak Perlu Rujukan');

  return {
    ...citizen,
    kategori: citizen.kategori || rawKat || 'Dewasa',
    subText: citizen.usia || citizen.subText || '',
    normalizedCat,
    tglPeriksa,
    isExamined,
    isPutri,
    hasBbTb,
    hasLila,
    hasTensi,
    hasLp,
    hasLk,
    imtValue,
    plottingResult,
    evalTbc,
    gulaDarahVal,
    kolesterolVal,
    imunisasiList,
    mataKanan,
    mataKiri,
    telingaKanan,
    telingaKiri,
    pumaScore,
    pumaRisiko,
    topikPenyuluhan,
    statusRujukan,
    isPerluRujukan,
    langkah1: l1,
    langkah2: l2,
    rawDetail,
    pelKes
  };
};

export default function DetailRekapModal({ 
  citizen, 
  selectedCitizen,
  onClose, 
  onHide,
  show = true,
  examData = null,
  theme = 'kader', // 'kader' | 'puskesmas' | 'dinkes'
  themeColor = null,
  roleTitle = null,
  onEdit = null 
}) {
  if (show === false) return null;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const targetCitizen = citizen || selectedCitizen;
  if (!targetCitizen) return null;

  const data = resolve5StepDetails(targetCitizen, examData);
  if (!data) return null;

  const handleClose = onClose || onHide || (() => {});
<<<<<<< HEAD
  const isDinkes = theme === "dinkes" || (themeColor && themeColor.includes("1e3a8a")) || roleTitle?.toLowerCase().includes("dinas");
  const isPuskesmas = theme === "puskesmas" || roleTitle?.toLowerCase().includes("puskesmas");
  const primaryColor = themeColor || (isDinkes ? "#1e3a8a" : isPuskesmas ? "#428A75" : "#2b2e4a");
  const accentColor = isDinkes ? "#1e3a8a" : isPuskesmas ? "#428A75" : "#F25B8E";

  const renderDataFields = (objectValue, nested = false) => {
    const entries = Object.entries(objectValue || {}).filter(([key, value]) => isFilled(value) && !(key === "tempat_imunisasi" && String(value).includes(" || ")));
    if (!entries.length) return <div className="small text-muted">Belum ada data tersimpan.</div>;

    return (
      <div className="row g-3">
        {entries.map(([key, value]) => (
          <div className={typeof value === "object" && value !== null && !Array.isArray(value) ? "col-12" : "col-12 col-md-6"} key={key}>
            {typeof value === "object" && value !== null && !Array.isArray(value) ? (
              <div className="rounded-3 bg-light-subtle p-3">
                <div className="small fw-bold text-dark mb-2">{formatDisplayKey(key)}</div>
                {renderDataFields(value, true)}
              </div>
            ) : (
              <div className="rounded-3 bg-light p-3 h-100">
                <div className="small text-muted mb-1" style={{ lineHeight: 1.35 }}>
                  {formatDisplayKey(key)}
                </div>
                <div className="small fw-semibold text-dark" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.45 }}>
                  {formatDisplayValue(value, key)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderObjectSection = (objectValue) => renderDataFields(objectValue);

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header text-white p-3 px-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: primaryColor }}>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className="badge bg-white text-dark fw-bold px-2 py-1 rounded-pill" style={{ fontSize: "0.74rem" }}>
                  {formatDisplayValue(data.kategori)}
                  {data.subText ? ` (${data.subText})` : ""}
                </span>
                <span className="badge bg-white bg-opacity-25 text-white px-2 py-1 rounded-pill" style={{ fontSize: "0.74rem" }}>
                  Tanggal Pemeriksaan: {formatDisplayValue(data.tglPeriksa)}
                </span>
              </div>
              <h5 className="modal-title fw-bold text-white mb-0">Detail Rekap Pemeriksaan</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose} aria-label="Tutup" />
          </div>

          <div className="modal-body p-4 bg-light">
            {isLoading && (
              <div className="alert alert-light border d-flex align-items-center gap-2 mb-3">
                <Loader2 size={16} className="spin" />
                <span className="small text-secondary">Mengambil data pemeriksaan lengkap...</span>
              </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <User size={18} style={{ color: accentColor }} />
                <span>Langkah 1: Identitas Sasaran</span>
              </h6>
              {renderObjectSection(data.langkah1)}
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Activity size={18} style={{ color: accentColor }} />
                <span>Langkah 2: Penimbangan & Pengukuran</span>
              </h6>
              {renderObjectSection(data.langkah2)}
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <BarChart2 size={18} style={{ color: accentColor }} />
                <span>Langkah 3: Plotting & Evaluasi</span>
              </h6>
              {renderObjectSection(data.langkah3)}
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Stethoscope size={18} style={{ color: accentColor }} />
                <span>Langkah 4: Skrining & Pelayanan</span>
              </h6>
              {renderObjectSection(data.langkah4)}
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <HeartHandshake size={18} style={{ color: accentColor }} />
                <span>Langkah 5: Penyuluhan & Tindak Lanjut</span>
              </h6>
              {renderObjectSection(data.langkah5)}
            </div>
          </div>

          <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-between align-items-center">
            {!isPuskesmas && onEdit ? (
              <button type="button" className="btn btn-dark-custom btn-sm px-3 rounded-3 d-inline-flex align-items-center gap-2 text-white fw-semibold" style={{ backgroundColor: "#2b2e4a" }} onClick={() => onEdit(data)}>
                <Edit3 size={14} /> Edit Data
              </button>
            ) : (
              <div className="text-muted small d-flex align-items-center gap-2">
=======
  const isDinkes = theme === 'dinkes' || (themeColor && themeColor.includes('1e3a8a')) || roleTitle?.toLowerCase().includes('dinas');
  const isPuskesmas = theme === 'puskesmas' || roleTitle?.toLowerCase().includes('puskesmas');
  const primaryColor = themeColor || (isDinkes ? '#1e3a8a' : isPuskesmas ? '#428A75' : '#1e293b');
  const accentColor = isDinkes ? '#1e3a8a' : isPuskesmas ? '#428A75' : '#3b82f6';

  const { normalizedCat, langkah1: l1, langkah2: l2, rawDetail, pelKes, evalTbc, plottingResult } = data;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050, backdropFilter: 'blur(4px)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
          
          {/* Modal Header */}
          <div 
            className="modal-header text-white p-3.5 px-4 d-flex align-items-center justify-content-between"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3 bg-white bg-opacity-10 d-flex align-items-center justify-content-center">
                <CheckCircle2 size={22} className="text-warning" />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-0.5">
                  <span className="badge bg-warning text-dark fw-bold px-2 py-0.5 rounded-pill" style={{ fontSize: '0.7rem' }}>
                    DETAIL REKAP
                  </span>
                  <span className="badge bg-white bg-opacity-20 text-white px-2 py-0.5 rounded-pill" style={{ fontSize: '0.7rem' }}>
                    Tgl Periksa: {data.tglPeriksa}
                  </span>
                </div>
                <h6 className="modal-title fw-bold text-white mb-0">Detail Rekap Pemeriksaan ({data.kategori})</h6>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label="Tutup"
            ></button>
          </div>

          {/* Modal Body with Clean Spacious 5-Langkah Layout */}
          <div className="modal-body p-3.5 p-md-4 bg-light" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div className="d-flex flex-column gap-3">
              
              {/* LANGKAH 1: IDENTITAS SASARAN */}
              <div className="card border-0 shadow-sm rounded-4 bg-white p-3.5 p-md-4">
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>1</span>
                    <h6 className="fw-bold text-dark mb-0">Identitas &amp; Pendaftaran Sasaran</h6>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                    Langkah 1
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                      <div className="text-muted small mb-1 fw-medium">NIK</div>
                      <div className="fw-bold text-dark text-break">{l1.nik}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                      <div className="text-muted small mb-1 fw-medium">Nama Lengkap</div>
                      <div className="fw-bold text-dark text-break">{l1.nama}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                      <div className="text-muted small mb-1 fw-medium">Tanggal Lahir</div>
                      <div className="fw-bold text-dark">{l1.tglLahir}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                      <div className="text-muted small mb-1 fw-medium">Jenis Kelamin</div>
                      <div className="fw-bold text-dark">{l1.gender}</div>
                    </div>
                  </div>

                  {['dewasa', 'lansia'].includes(normalizedCat) && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Pekerjaan</div>
                          <div className="fw-bold text-dark">{l1.pekerjaan}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Status Pernikahan</div>
                          <div className="fw-bold text-dark">{l1.statusPernikahan}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {['usekrem-6-14', 'usekrem-15-18'].includes(normalizedCat) && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Nama Sekolah</div>
                          <div className="fw-bold text-dark">{l1.sekolah}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Kelas</div>
                          <div className="fw-bold text-dark">{l1.kelas}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'bumil' && (
                    <div className="col-12">
                      <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-center justify-content-between">
                        <span className="text-dark fw-medium">Usia Kehamilan</span>
                        <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill fs-6 fw-bold">
                          {l1.usiaKehamilan}
                        </span>
                      </div>
                    </div>
                  )}

                  {normalizedCat === 'nifas' && (
                    <div className="col-12">
                      <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-center justify-content-between">
                        <span className="text-dark fw-medium">Waktu Kunjungan Nifas</span>
                        <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill fs-6 fw-bold">
                          {l1.waktuKunjunganNifas}
                        </span>
                      </div>
                    </div>
                  )}

                  {['bayi-0-11', 'balita-12-59', 'apras'].includes(normalizedCat) && (
                    <div className="col-12">
                      <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-center justify-content-between">
                        <span className="text-dark fw-medium">
                          {normalizedCat === 'bayi-0-11' ? 'Umur Bayi' : normalizedCat === 'balita-12-59' ? 'Umur Balita' : 'Umur Apras'}
                        </span>
                        <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill fs-6 fw-bold">
                          {l1.umurAnak}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LANGKAH 2: PENGUKURAN FISIK */}
              <div className="card border-0 shadow-sm rounded-4 bg-white p-3.5 p-md-4">
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-info text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>2</span>
                    <h6 className="fw-bold text-dark mb-0">Skrining Penimbangan &amp; Pengukuran Fisik</h6>
                  </div>
                  <span className="badge bg-info-subtle text-info-emphasis rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                    Langkah 2
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-6 col-md-4 col-lg-3">
                    <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                      <div className="text-muted small mb-1 fw-medium">Berat Badan (BB)</div>
                      <div className="fs-5 fw-bold text-dark">
                        {l2.bb ? `${l2.bb}` : '-'} <span className="fs-6 fw-normal text-muted">{l2.bb ? 'kg' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {normalizedCat !== 'nifas' && (
                    <div className="col-6 col-md-4 col-lg-3">
                      <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                        <div className="text-muted small mb-1 fw-medium">
                          {['bayi-0-11', 'balita-12-59'].includes(normalizedCat) ? 'Panjang / TB' : 'Tinggi Badan (TB)'}
                        </div>
                        <div className="fs-5 fw-bold text-dark">
                          {l2.tb ? `${l2.tb}` : '-'} <span className="fs-6 fw-normal text-muted">{l2.tb ? 'cm' : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {['bumil', 'bayi-0-11', 'balita-12-59', 'apras', 'dewasa', 'lansia'].includes(normalizedCat) && (
                    <div className="col-6 col-md-4 col-lg-3">
                      <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                        <div className="text-muted small mb-1 fw-medium">Lingkar Lengan (LiLA)</div>
                        <div className="fs-5 fw-bold text-dark">
                          {l2.lila ? `${l2.lila}` : '-'} <span className="fs-6 fw-normal text-muted">{l2.lila ? 'cm' : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {['usekrem-15-18', 'dewasa', 'lansia'].includes(normalizedCat) && (
                    <div className="col-6 col-md-4 col-lg-3">
                      <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                        <div className="text-muted small mb-1 fw-medium">Lingkar Perut (LP)</div>
                        <div className="fs-5 fw-bold text-dark">
                          {l2.lp ? `${l2.lp}` : '-'} <span className="fs-6 fw-normal text-muted">{l2.lp ? 'cm' : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {['bayi-0-11', 'balita-12-59'].includes(normalizedCat) && (
                    <div className="col-6 col-md-4 col-lg-3">
                      <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                        <div className="text-muted small mb-1 fw-medium">Lingkar Kepala (LK)</div>
                        <div className="fs-5 fw-bold text-dark">
                          {l2.lk ? `${l2.lk}` : '-'} <span className="fs-6 fw-normal text-muted">{l2.lk ? 'cm' : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {['bumil', 'nifas', 'usekrem-15-18', 'dewasa', 'lansia'].includes(normalizedCat) && (
                    <div className="col-12 col-md-4 col-lg-3">
                      <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                        <div className="text-muted small mb-1 fw-medium">Tekanan Darah (Tensi)</div>
                        <div className="fs-5 fw-bold text-dark">
                          {l2.tensi ? `${l2.tensi}` : '-'} <span className="fs-6 fw-normal text-muted">{l2.tensi ? 'mmHg' : ''}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LANGKAH 3: HASIL PLOTTING & EVALUASI OTOMATIS */}
              <div className="card border-0 shadow-sm rounded-4 bg-white p-3.5 p-md-4">
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>3</span>
                    <h6 className="fw-bold text-dark mb-0">Hasil Plotting &amp; Evaluasi Otomatis</h6>
                  </div>
                  <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                    Langkah 3
                  </span>
                </div>

                <div className="row g-3">
                  {['dewasa', 'lansia'].includes(normalizedCat) && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                          <div className="text-muted small mb-1 fw-medium">Plotting IMT (Status Berat Badan)</div>
                          <div className="mt-1">
                            {data.hasBbTb ? (
                              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                  {plottingResult?.hasil_plot?.imt?.kategori || 'Normal (N)'}
                                </span>
                                <span className="text-muted small fw-medium">{data.imtValue || '-'} kg/m²</span>
                              </div>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                          <div className="text-muted small mb-1 fw-medium">Plotting LiLA (Lingkar Lengan Atas)</div>
                          <div className="mt-1">
                            {data.hasLila ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.lila?.kategori || (normalizedCat === 'lansia' ? 'Normal (≥ 21.5 cm)' : 'Normal (≥ 23.5 cm)')}
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Tekanan Darah</div>
                          <div className="mt-1">
                            {data.hasTensi ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.tekanan_darah?.kategori || 'Normal (< 130/85 mmHg)'}
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Lingkar Perut</div>
                          <div className="mt-1">
                            {data.hasLp ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.lingkar_perut?.kategori || 'Normal (≤ 90 cm)'}
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'usekrem-15-18' && (
                    <>
                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting IMT</div>
                          <div className="mt-1">
                            {data.hasBbTb ? (
                              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                  {plottingResult?.hasil_plot?.imt?.kategori || 'Gizi Baik (GB)'}
                                </span>
                                <span className="text-muted small fw-medium">{data.imtValue || '-'} kg/m²</span>
                              </div>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Tekanan Darah</div>
                          <div className="mt-1">
                            {data.hasTensi ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.tekanan_darah?.kategori || 'Normal (N)'}
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Lingkar Perut</div>
                          <div className="mt-1">
                            {data.hasLp ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.lingkar_perut?.kategori || 'Normal'}
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'usekrem-6-14' && (
                    <div className="col-12">
                      <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                        <div className="text-muted small mb-1 fw-medium">Plotting IMT/U</div>
                        <div className="mt-1">
                          {data.hasBbTb ? (
                            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.imt?.kategori || 'Gizi Baik (GB)'}
                              </span>
                              <span className="text-muted small fw-medium">{data.imtValue || '-'} kg/m²</span>
                            </div>
                          ) : <span className="text-muted">-</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {normalizedCat === 'apras' && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting IMT/U</div>
                          <div className="mt-1">
                            {data.hasBbTb ? (
                              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                  {plottingResult?.hasil_plot?.imt?.kategori || 'Gizi Baik (-2 SD s.d +1 SD)'}
                                </span>
                                <span className="text-muted small fw-medium">{data.imtValue || '-'} kg/m²</span>
                              </div>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting LiLA</div>
                          <div className="mt-1">
                            {data.hasLila ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.lila?.kategori || 'Gizi Normal (≥ 14 cm)'}
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {['bayi-0-11', 'balita-12-59'].includes(normalizedCat) && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting Penimbangan (BB/U)</div>
                          <div className="fw-bold text-dark mt-1">
                            {l2.bb ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.evalBBU?.kategori || 'BB Normal (-2 SD s.d +1 SD)'}
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting {normalizedCat === 'bayi-0-11' ? 'Panjang Badan (PB/U)' : 'Tinggi Badan (TB/U)'}</div>
                          <div className="fw-bold text-dark mt-1">
                            {l2.tb ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.evalTBU?.kategori || 'Normal (-2 SD s.d +3 SD)'}
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting {normalizedCat === 'bayi-0-11' ? 'BB/PB' : 'BB/TB'}</div>
                          <div className="fw-bold text-dark mt-1">
                            {data.hasBbTb ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.evalBBTB?.kategori || 'Gizi Baik (-2 SD s.d +1 SD)'}
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting Lingkar Kepala</div>
                          <div className="fw-bold text-dark mt-1">
                            {data.hasLk ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                Normal (-2 SD s.d +2 SD)
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting LiLA</div>
                          <div className="fw-bold text-dark mt-1">
                            {data.hasLila ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                Gizi Normal (≥ 12.5 cm)
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'bumil' && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting IMT Sebelum Hamil</div>
                          <div className="mt-1">
                            {data.hasBbTb ? (
                              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                  {plottingResult?.hasil_plot?.imt?.kategori || 'Normal (18.5 - 24.9 kg/m²)'}
                                </span>
                                <span className="text-muted small fw-medium">{data.imtValue || '-'} kg/m²</span>
                              </div>
                            ) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting LiLA</div>
                          <div className="mt-1">
                            {data.hasLila ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.lila?.kategori === 'kek' ? 'Kurang Energi Kronis / KEK' : 'Normal (≥ 23.5 cm)'}
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting Tekanan Darah</div>
                          <div className="mt-1">
                            {data.hasTensi ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.tekanan_darah?.kategori || 'Normal (< 130/85 mmHg)'}
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'nifas' && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting IMT</div>
                          <div className="mt-1">
                            {data.hasBbTb ? (
                              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                  {plottingResult?.hasil_plot?.imt?.kategori || 'Normal (18.5 - 24.9)'}
                                </span>
                                <span className="text-muted small fw-medium">{data.imtValue || '-'} kg/m²</span>
                              </div>
                            ) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Plotting Tekanan Darah</div>
                          <div className="mt-1">
                            {data.hasTensi ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                {plottingResult?.hasil_plot?.tekanan_darah?.kategori || 'Normal (< 130/85 mmHg)'}
                              </span>
                            ) : '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Kurva Pertumbuhan Standar KMS Buku KIA / WHO untuk Sasaran Anak */}
                {['bayi-0-11', 'balita-12-59', 'apras', 'usekrem-6-14', 'usekrem-15-18'].includes(normalizedCat) && (data.hasBbTb || data.hasBb || data.hasTb) && (
                  <div className="mt-4 pt-3 border-top">
                    <GrowthChartPlotter
                      gender={data.langkah1?.gender || data.gender}
                      umurBulan={(() => {
                        if (targetCitizen.tglLahir || targetCitizen.tanggal_lahir) {
                          const dob = new Date(targetCitizen.tglLahir || targetCitizen.tanggal_lahir);
                          if (!isNaN(dob.getTime())) {
                            const now = new Date();
                            const diff = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
                            if (diff >= 0 && diff <= 216) return diff;
                          }
                        }
                        const str = String(targetCitizen.usia || targetCitizen.umur || '').toLowerCase();
                        if (str.includes('bln') || str.includes('bulan')) return parseInt(str) || 12;
                        if (str.includes('thn') || str.includes('tahun')) return (parseInt(str) || 1) * 12;
                        return 12;
                      })()}
                      bb={l2.bb}
                      tb={l2.tb}
                      activeCategory={normalizedCat}
                      category={normalizedCat}
                      namaAnak={data.langkah1?.nama || targetCitizen.nama || 'Anak'}
                      riwayatPemeriksaan={targetCitizen.riwayat || targetCitizen.growth_history || targetCitizen.historis || []}
                    />
                  </div>
                )}
              </div>

              {/* LANGKAH 4: SKRINING & PELAYANAN KESEHATAN */}
              <div className="card border-0 shadow-sm rounded-4 bg-white p-3.5 p-md-4">
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning text-dark rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>4</span>
                    <h6 className="fw-bold text-dark mb-0">Skrining PTM, TBC &amp; Pelayanan Kesehatan</h6>
                  </div>
                  <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                    Langkah 4
                  </span>
                </div>

                <div className="row g-3">
                  {normalizedCat === 'lansia' && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Kadar Gula Darah</div>
                          <div className="fw-bold text-dark">
                            {data.gulaDarahVal ? `${data.gulaDarahVal} mg/dL` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Kadar Kolesterol</div>
                          <div className="fw-bold text-dark">
                            {data.kolesterolVal ? `${data.kolesterolVal} mg/dL` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Tes Penglihatan (Hitung Jari)</div>
                          <div className="fw-bold text-dark">
                            {data.mataKanan || data.mataKiri ? `Kanan: ${data.mataKanan || '-'} • Kiri: ${data.mataKiri || '-'}` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Tes Pendengaran (Berbisik)</div>
                          <div className="fw-bold text-dark">
                            {data.telingaKanan || data.telingaKiri ? `Kanan: ${data.telingaKanan || '-'} • Kiri: ${data.telingaKiri || '-'}` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">C.1 Skrining PPOK (PUMA)</div>
                          <div className="mt-1">
                            {data.pumaScore !== null ? (
                              <span className={`badge ${data.pumaRisiko ? 'bg-danger text-white' : 'bg-success-subtle text-success border border-success-subtle'} px-2.5 py-1.5 rounded-3 fw-bold`}>
                                {data.pumaScore} ({data.pumaRisiko ? 'Risiko Tinggi' : 'Risiko Rendah'})
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">C.2 Skor AKS (Barthel)</div>
                          <div className="fw-bold text-dark mt-1">
                            {rawDetail.aksScore || rawDetail.aksKategori ? `${rawDetail.aksScore || '-'}/20 (${rawDetail.aksKategori || 'Mandiri'})` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">C.3 Status SKILAS</div>
                          <div className="fw-bold text-dark mt-1">
                            {rawDetail.skilasStatus || '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'dewasa' && (
                    <>
                      <div className="col-12 col-md-6 col-lg-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Kadar Gula Darah</div>
                          <div className="fw-bold text-dark">{data.gulaDarahVal ? `${data.gulaDarahVal} mg/dL` : '-'}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Kadar Kolesterol</div>
                          <div className="fw-bold text-dark">{data.kolesterolVal ? `${data.kolesterolVal} mg/dL` : '-'}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-4">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Alat Kontrasepsi</div>
                          <div className="fw-bold text-dark">{rawDetail.alatKontrasepsi || rawDetail.is_menggunakan_kontrasepsi ? (rawDetail.alatKontrasepsi || 'Menggunakan KB') : '-'}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Tes Penglihatan (Hitung Jari)</div>
                          <div className="fw-bold text-dark">
                            {data.mataKanan || data.mataKiri ? `Kanan: ${data.mataKanan || '-'} • Kiri: ${data.mataKiri || '-'}` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Tes Pendengaran (Berbisik)</div>
                          <div className="fw-bold text-dark">
                            {data.telingaKanan || data.telingaKiri ? `Kanan: ${data.telingaKanan || '-'} • Kiri: ${data.telingaKiri || '-'}` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">C.1 Skrining PPOK (PUMA)</div>
                          <div className="mt-1">
                            {data.pumaScore !== null ? (
                              <span className={`badge ${data.pumaRisiko ? 'bg-danger text-white' : 'bg-success-subtle text-success border border-success-subtle'} px-2.5 py-1.5 rounded-3 fw-bold`}>
                                {data.pumaScore} ({data.pumaRisiko ? 'Risiko Tinggi' : 'Risiko Rendah'})
                              </span>
                            ) : <span className="text-muted">-</span>}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">C.2 Skrining Kesehatan Jiwa</div>
                          <div className="fw-bold text-dark mt-1">
                            {rawDetail.skriningJiwa || rawDetail.skrining_kesehatan_jiwa?.is_rujukan_jiwa !== undefined ? (rawDetail.skrining_kesehatan_jiwa?.is_rujukan_jiwa ? 'Perlu Rujukan Jiwa' : 'Normal / Sehat Jiwa') : '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {['usekrem-6-14', 'usekrem-15-18'].includes(normalizedCat) && (
                    <>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Skrining Penglihatan</div>
                          <div className="fw-bold text-dark">
                            {data.mataKanan || data.mataKiri ? `Kanan: ${data.mataKanan || '-'} • Kiri: ${data.mataKiri || '-'}` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Skrining Pendengaran</div>
                          <div className="fw-bold text-dark">
                            {data.telingaKanan || data.telingaKiri ? `Kanan: ${data.telingaKanan || '-'} • Kiri: ${data.telingaKiri || '-'}` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className={data.isPutri ? "col-12 col-md-6" : "col-12"}>
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Skrining Kesehatan Jiwa</div>
                          <div className="fw-bold text-dark">{rawDetail.skriningJiwa || '-'}</div>
                        </div>
                      </div>
                      {data.isPutri && (
                        <div className="col-12 col-md-6">
                          <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                            <div className="text-muted small mb-1 fw-medium">Skrining Anemia (Kadar Hb)</div>
                            <div className="fw-bold text-dark">{rawDetail.periksaHb ? `${rawDetail.periksaHb} g/dL` : '-'}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {normalizedCat === 'apras' && (
                    <>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Pemberian Obat Cacing</div>
                          <div className="fw-bold text-dark">{rawDetail.obatCacing || (pelKes.is_obat_cacing_given ? 'Sudah Diberikan' : '-')}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'balita-12-59' && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Tempat Imunisasi</div>
                          <div className="fw-bold text-dark">
                            {rawDetail.tempatImunisasi || pelKes.tempat_imunisasi || '-'}
                            {rawDetail.namaRsImunisasi ? ` (${rawDetail.namaRsImunisasi})` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Jenis Imunisasi</div>
                          <div className="fw-bold text-primary">{data.imunisasiList.length > 0 ? data.imunisasiList.join(', ') : '-'}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Pemberian MP-ASI</div>
                          <div className="fw-bold text-dark">{rawDetail.mpAsi || (pelKes.is_mp_asi ? 'Sudah' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">PMT Pemulihan</div>
                          <div className="fw-bold text-dark">
                            {rawDetail.pmtPemulihan || (pelKes.is_pmt_lokal_pemulihan ? 'Diberikan' : '-')}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Kapsul Vitamin A</div>
                          <div className="fw-bold text-dark">{rawDetail.vitA || (pelKes.is_vit_a_given ? 'Sudah' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Obat Cacing</div>
                          <div className="fw-bold text-dark">{rawDetail.obatCacing || (pelKes.is_obat_cacing_given ? 'Sudah' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Mengikuti Kelas Ibu Balita</div>
                          <div className="fw-bold text-dark">{rawDetail.ikutKelasBalita || (pelKes.is_ikut_kelas_balita ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'bayi-0-11' && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Tempat Imunisasi</div>
                          <div className="fw-bold text-dark">
                            {rawDetail.tempatImunisasi || pelKes.tempat_imunisasi || '-'}
                            {rawDetail.namaRsImunisasi ? ` (${rawDetail.namaRsImunisasi})` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Jenis Imunisasi</div>
                          <div className="fw-bold text-primary">{data.imunisasiList.length > 0 ? data.imunisasiList.join(', ') : '-'}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">ASI Eksklusif</div>
                          <div className="fw-bold text-dark">{rawDetail.asiEksklusif || (pelKes.is_asi_eksklusif ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Pemberian MP-ASI</div>
                          <div className="fw-bold text-dark">{rawDetail.mpAsi || (pelKes.is_mpasi ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">PMT Pemulihan</div>
                          <div className="fw-bold text-dark">
                            {rawDetail.pmtPemulihan || (pelKes.is_pmt_lokal_pemulihan ? 'Diberikan' : '-')}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Kapsul Vitamin A</div>
                          <div className="fw-bold text-dark">{rawDetail.vitA || (pelKes.is_vit_a_given ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Mengikuti Kelas Ibu Balita</div>
                          <div className="fw-bold text-dark">{rawDetail.ikutKelasBalita || (pelKes.is_ikut_kelas_balita ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'bumil' && (
                    <>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Pemberian TTD</div>
                          <div className="fw-bold text-dark">{rawDetail.pemberianTtd || rawDetail.jumlahTtd || (pelKes.jumlah_ttd_given ? `${pelKes.jumlah_ttd_given} Butir` : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Rutin Minum TTD</div>
                          <div className="fw-bold text-dark">{rawDetail.rutinTtd || (pelKes.is_rutin_ttd ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Komposisi MT Bumil</div>
                          <div className="fw-bold text-dark">{rawDetail.komposisiMtBumil || pelKes.komposisi_mt_kek || '-'}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Rutin Konsumsi MT</div>
                          <div className="fw-bold text-dark">{rawDetail.rutinMtBumil || (pelKes.is_rutin_mt_kek ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedCat === 'nifas' && (
                    <>
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                          <div className={evalTbc.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                            {evalTbc.text}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Pemberian Vitamin A</div>
                          <div className="fw-bold text-dark">{rawDetail.jumlahVitA || rawDetail.pemberianVitA || (pelKes.is_vit_a_given ? 'Diberikan' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Rutin Minum Vitamin A</div>
                          <div className="fw-bold text-dark">{rawDetail.rutinVitA || (pelKes.is_rutin_vit_a ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Pelayanan KB Pasca Persalinan</div>
                          <div className="fw-bold text-dark">{rawDetail.kbPascaPersalinan || (pelKes.is_kb_pasca_persalinan ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                          <div className="text-muted small mb-1 fw-medium">Menjaga Kondisi ASI / Menyusui</div>
                          <div className="fw-bold text-dark">{rawDetail.menyusui || (pelKes.is_menyusui ? 'Ya' : '-')}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* LANGKAH 5: PENYULUHAN & RUJUKAN */}
              <div className="card border-0 shadow-sm rounded-4 bg-white p-3.5 p-md-4">
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>5</span>
                    <h6 className="fw-bold text-dark mb-0">Penyuluhan &amp; Rujukan</h6>
                  </div>
                  <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                    Langkah 5
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-lg-8">
                    <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                      <div className="text-muted small mb-1 fw-medium">Topik Penyuluhan &amp; Edukasi</div>
                      <div className="fw-semibold text-dark">
                        {data.topikPenyuluhan ? (
                          <span>{data.topikPenyuluhan}</span>
                        ) : (
                          <span className="text-muted font-monospace">Tidak ada catatan penyuluhan</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-4">
                    <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                      <div className="text-muted small mb-1 fw-medium">Status Rujukan</div>
                      <div className="mt-2">
                        <span className={`badge ${data.isPerluRujukan ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-3 py-2 rounded-pill fw-bold fs-6`}>
                          {data.statusRujukan}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-between align-items-center border-top">
            {!isPuskesmas && onEdit ? (
              <button 
                type="button" 
                className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 text-white fw-semibold"
                style={{ backgroundColor: '#2b2e4a' }}
                onClick={() => onEdit(data)}
              >
                <Edit3 size={14} /> Edit Data
              </button>
            ) : (
              <div className="text-muted small d-flex align-items-center gap-1.5">
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                <ShieldCheck size={16} style={{ color: primaryColor }} />
                <span>Data tersinkronisasi realtime dengan Sistem Posyandu &amp; Puskesmas</span>
              </div>
            )}
<<<<<<< HEAD
            <button type="button" className="btn btn-outline-secondary btn-sm px-4 rounded-3" onClick={handleClose}>
              Tutup
            </button>
          </div>
=======
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm px-4 py-2 rounded-3 fw-medium" 
              onClick={handleClose}
            >
              Tutup
            </button>
          </div>

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
        </div>
      </div>
    </div>
  );
}
