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
  pemeriksaan_tahunan: "Pemeriksaan Tahunan",
  skrining_jiwa: "Skrining Kesehatan Jiwa",
  skrining_kesehatan_jiwa: "Skrining Kesehatan Jiwa",
  skrining_ppok_puma: "Skrining PPOK (PUMA)",
  aks_aktifitas_harian: "Aktivitas Kehidupan Sehari-hari (AKS)",
  jenis_kelamin: "Jenis Kelamin",
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
  nama_suami: "Nama Suami",
  nama_istri: "Nama Istri",
  nama_ibu: "Nama Ibu",
  nama_ayah: "Nama Ayah",
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
  zscore_bbu: "Z-Score BB/U",
  zscore_pbu: "Z-Score PB/U",
  zscore_tbu: "Z-Score TB/U",
  zscore_bbpb: "Z-Score BB/PB",
  zscore_bbtb: "Z-Score BB/TB",
  zscore_imtu: "Z-Score IMT/U",
  status_gizi_bbu: "Status Gizi BB/U",
  status_gizi_pbu: "Status Gizi PB/U",
  status_gizi_tbu: "Status Gizi TB/U",
  status_gizi_bbpb: "Status Gizi BB/PB",
  status_gizi_bbtb: "Status Gizi BB/TB",
  status_gizi_imtu: "Status Gizi IMT/U",
  penyuluhan: "Penyuluhan",
  topik_penyuluhan: "Topik Penyuluhan",
  tindakan_edukasi: "Edukasi & Tindakan Diberikan",
  rujukan: "Status Rujukan",
  is_perlu_rujukan: "Perlu Rujukan",
  alasan_rujukan: "Alasan Rujukan",
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
  
  let formattedValue = String(value);
  if (fieldKey.startsWith("ploting_")) {
    formattedValue = formattedValue.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }

  if (fieldKey.toLowerCase().includes("status") || fieldKey.toLowerCase().includes("hasil") || fieldKey.startsWith("ploting_")) {
    const valLower = String(value).toLowerCase();
    if (valLower.includes("normal") || valLower.includes("baik") || valLower.includes("aman") || valLower.includes("tidak_terindikasi") || valLower === "n") {
      return <span className="text-success fw-bold">{formattedValue}</span>;
    } else if (valLower.includes("waspada") || valLower.includes("prediab") || valLower.includes("risiko_rendah") || valLower.includes("kuning")) {
      return <span className="text-warning fw-bold">{formattedValue}</span>;
    } else if (valLower.includes("tinggi") || valLower.includes("bahaya") || valLower.includes("diabetisi") || valLower.includes("risiko") || valLower.includes("merah") || valLower.includes("rujukan")) {
      return <span className="text-danger fw-bold">{formattedValue}</span>;
    }
  }
  return formattedValue;
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

  const tglPeriksa = formatDateId(exam?.tanggal || exam?.created_at || citizen.tglPeriksa || source.tanggal || source.created_at || new Date());

  const isExamined = Boolean(citizen.statusPemeriksaan === "Sudah" || citizen.status === "Sudah" || exam?.kunjungan?.status_langkah === "langkah_5" || !!exam);

  const l1 = {
    nik: citizen.nik || source.nik || "",
    nama_lengkap: citizen.nama || source.nama_lengkap || "",
    tglLahir: formatDateId(citizen.tglLahir || source.tanggal_lahir || ""),
    jenis_kelamin: citizen.gender || source.jenis_kelamin || "",
    alamat: citizen.alamat || source.alamat || "",
    rw: citizen.rw || source.rw || "",
  };

  const nameHusband = citizen.namaSuami || source.nama_suami;
  const nameWife = citizen.namaIstri || source.nama_istri;
  const nameMother = citizen.namaIbu || source.nama_ibu;
  const nameFather = citizen.namaAyah || source.nama_ayah;

  if (nameHusband) l1.nama_suami = nameHusband;
  if (nameWife) l1.nama_istri = nameWife;
  if (nameMother) l1.nama_ibu = nameMother;
  if (nameFather) l1.nama_ayah = nameFather;

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

  const imtVal = step2.imt ?? exam?.imt ?? source.imt;
  if (isFilled(imtVal)) {
    l2.IMT = formatMeasurement(imtVal, "kg/m²");
  }

  const tensiVal = step2.tensi ?? exam?.tensi ?? source.tensi;
  if (isFilled(tensiVal)) {
    l2["Tekanan Darah"] = String(tensiVal);
  } else if (isFilled(l2["Tekanan Darah Sistole"]) && isFilled(l2["Tekanan Darah Diastole"])) {
    l2["Tekanan Darah"] = `${exam?.td_sistole || step2.td_sistole}/${exam?.td_diastole || step2.td_diastole} mmHg`;
  }

  let l3 = {};
  if (exam?.langkah3 && typeof exam.langkah3 === "object") {
    l3 = { ...exam.langkah3 };
  } else {
    const zScoreMap = {
      "Z-Score BB/U": exam?.zscore_bbu,
      "Z-Score PB/U": exam?.zscore_pbu,
      "Z-Score TB/U": exam?.zscore_tbu,
      "Z-Score BB/PB": exam?.zscore_bbpb,
      "Z-Score BB/TB": exam?.zscore_bbtb,
      "Z-Score IMT/U": exam?.zscore_imtu,
      "Status Gizi BB/U": exam?.status_gizi_bbu,
      "Status Gizi PB/U": exam?.status_gizi_pbu,
      "Status Gizi TB/U": exam?.status_gizi_tbu,
      "Status Gizi BB/PB": exam?.status_gizi_bbpb,
      "Status Gizi BB/TB": exam?.status_gizi_bbtb,
      "Status Gizi IMT/U": exam?.status_gizi_imtu,
    };
    for (const [k, v] of Object.entries(zScoreMap)) {
      if (isFilled(v)) l3[k] = v;
    }
    if (Object.values(zScores).some((v) => isFilled(v))) {
      for (const [zk, zv] of Object.entries(zScores)) {
        if (isFilled(zv)) l3[zk] = zv;
      }
    }
    if (Object.keys(plot).length) {
      for (const [pk, pv] of Object.entries(plot)) {
        if (isFilled(pv)) l3[pk] = pv;
      }
    }
    if (exam?.periode) l3.periode = exam.periode;
  }

  const l4 = (step4 && typeof step4 === "object" ? { ...step4 } : {}) || {};
  if (exam?.detail_skrining && typeof exam.detail_skrining === "object") {
    Object.assign(l4, exam.detail_skrining);
  }

  if (l4.pemeriksaan_6_bulanan && !l4.is_skrining_6_bulanan) {
    l4.pemeriksaan_6_bulanan = "-";
  }
  if (l4.pemeriksaan_tahunan && !l4.is_skrining_tahunan) {
    l4.pemeriksaan_tahunan = "-";
  }
  if (l4.pemeriksaan_tahunan_remaja_putri && !l4.is_skrining_tahunan) {
    l4.pemeriksaan_tahunan_remaja_putri = "-";
  }

  // Bersihkan key boolean raw dari backend agar tidak muncul dobel di UI
  delete l4.is_skrining_6_bulanan;
  delete l4.is_skrining_tahunan;
  delete l4.isSkriningTahunan;
  delete l4.isSkrining6Bulanan;
  delete l4.is_skrining_jiwa;
  delete l4.is_periksa_hb;

  const l5 = {};
  if (isFilled(step5.penyuluhan) || isFilled(step5.topikPenyuluhan) || isFilled(exam?.topik_penyuluhan)) {
    l5.topik_penyuluhan = step5.penyuluhan || step5.topikPenyuluhan || exam?.topik_penyuluhan || "-";
  }
  if (isFilled(step5.tindakan_edukasi) || isFilled(exam?.tindakan_edukasi)) {
    l5.tindakan_edukasi = step5.tindakan_edukasi || exam?.tindakan_edukasi || "-";
  }

  const isRujuk = exam?.is_perlu_rujukan ?? step5.is_perlu_rujukan ?? false;
  l5.is_perlu_rujukan = isRujuk ? "Ya" : "Tidak";

  if (isRujuk || isFilled(step5.alasanRujukan) || isFilled(step5.statusRujukan) || isFilled(step5.alasan_rujukan) || isFilled(exam?.alasan_rujukan) || isFilled(exam?.rujukan?.alasan_rujukan)) {
    l5.alasan_rujukan = step5.alasanRujukan || step5.statusRujukan || step5.alasan_rujukan || exam?.rujukan?.alasan_rujukan || exam?.alasan_rujukan || "-";
  }

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

  const targetCitizen = citizen || selectedCitizen;
  if (!targetCitizen) return null;

  const data = resolve5StepDetails(targetCitizen, examData);
  if (!data) return null;

  const handleClose = onClose || onHide || (() => {});
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
                <ShieldCheck size={16} style={{ color: primaryColor }} />
                <span>Data tersinkronisasi realtime dengan Sistem Posyandu &amp; Puskesmas</span>
              </div>
            )}
            <button type="button" className="btn btn-outline-secondary btn-sm px-4 rounded-3" onClick={handleClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
