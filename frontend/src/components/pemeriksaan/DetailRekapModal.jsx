import React from "react";
import { User, Activity, BarChart2, Stethoscope, HeartHandshake, CheckCircle2, Edit3, X, ShieldCheck, Calendar, AlertCircle } from "lucide-react";

export const resolve5StepDetails = (citizen, examData = null) => {
  if (!citizen) return null;

  const exam = examData || citizen.exam || null;
  const source = citizen?._raw || citizen || {};
  const step2 = exam?.pengukuran_step_2 || exam?.langkah2 || {};
  const step4 = exam?.langkah4 || exam?.detail_skrining || {};
  const step5 = exam?.langkah5 || {};
  const zScores = exam?.z_scores || {};
  const plot = exam?.hasil_plot || {};

  const tglPeriksa = exam?.tanggal ? String(exam.tanggal).split("T")[0] : citizen.tglPeriksa || "";

  const isExamined = Boolean(citizen.statusPemeriksaan === "Sudah" || citizen.status === "Sudah" || exam?.kunjungan?.status_langkah === "langkah_5");

  const categoryMetaL1 = {};
  const l1 = {
    nik: citizen.nik || source.nik || "",
    nama: citizen.nama || source.nama_lengkap || "",
    tglLahir: citizen.tglLahir || source.tanggal_lahir || "",
    gender: citizen.gender || source.jenis_kelamin || "",
    keteranganKeluarga: citizen.keteranganIbuSuami || citizen.namaIbu || citizen.namaAyah || citizen.namaSuami || "",
    alamat: citizen.alamat || source.alamat || "",
  };

  if (exam?.langkah1 && typeof exam.langkah1 === "object") {
    Object.assign(l1, exam.langkah1);
  }

  const normalizeMeasurement = (value, unit) => {
    if (value === null || value === undefined || value === "") return "";
    const str = String(value);
    return /[a-zA-Z%]/.test(str) ? str : `${str} ${unit}`;
  };

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
    if (value !== null && value !== undefined && value !== "") l2[key] = normalizeMeasurement(value, unit);
  }
  if (step2.imt !== undefined && step2.imt !== null && step2.imt !== "") l2.IMT = normalizeMeasurement(step2.imt, "kg/m²");
  if (step2.tensi !== undefined && step2.tensi !== null && step2.tensi !== "") l2["Tekanan Darah"] = String(step2.tensi);

  let l3 = {};
  if (exam?.langkah3 && typeof exam.langkah3 === "object") {
    l3 = { ...exam.langkah3 };
  } else {
    if (Object.values(zScores).some((v) => v !== null && v !== undefined && v !== "")) l3.zScores = zScores;
    if (Object.keys(plot).length) l3.hasil_plot = plot;
    if (exam?.periode) l3.periode = exam.periode;
  }

  const l4 = step4 && typeof step4 === "object" ? step4 : {};
  const l5 = {
    penyuluhan: step5.penyuluhan || step5.topikPenyuluhan || exam?.topik_penyuluhan || "",
    rujukan: step5.rujukan || step5.statusRujukan || exam?.alasan_rujukan || "",
  };

  return {
    ...citizen,
    tglPeriksa,
    isExamined,
    langkah1: l1,
    categoryMetaL1,
    langkah2: l2,
    langkah3: l3,
    langkah4: l4,
    langkah5: l5,
  };
};

export default function DetailRekapModal({
  citizen,
  selectedCitizen,
  onClose,
  onHide,
  show = true,
  examData = null,
  theme = "kader", // 'kader' | 'puskesmas' | 'dinkes'
  themeColor = null,
  roleTitle = null,
  onEdit = null,
}) {
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

  // Label dictionaries
  const l2LabelMap = {
    bb: "Berat Badan (BB)",
    tb: "Tinggi Badan (TB)",
    pb: "Panjang Badan (PB)",
    lingkarKepala: "Lingkar Kepala (LK)",
    lila: "Lingkar Lengan Atas (LiLA)",
    lingkarPerut: "Lingkar Perut (LP)",
    tensi: "Tekanan Darah",
    usiaKehamilan: "Usia Kehamilan",
    tfu: "Tinggi Fundus Uteri (TFU)",
    djj: "Denyut Jantung Janin (DJJ)",
    hariNifas: "Hari Nifas",
    suhu: "Suhu Tubuh",
  };

  const l3LabelMap = {
    imtStatus: "Status IMT / Kategori IMT",
    bbU: "Plotting Berat Badan Menurut Usia (BB/U)",
    tbU: "Plotting Tinggi / Panjang Badan Menurut Usia (TB/U)",
    bbTb: "Plotting BB Menurut TB (BB/TB)",
    lingkarKepala: "Plotting Lingkar Kepala",
    stuntingStatus: "Evaluasi Status Stunting",
    lilaStatus: "Plotting LiLA (KEK/Normal)",
    tensiStatus: "Plotting Tekanan Darah",
    lpStatus: "Plotting Lingkar Perut",
    kenaikanBB: "Evaluasi Kenaikan Berat Badan",
    perkembangan: "Status Tumbuh Kembang",
    imtU: "Plotting IMT / U",
    statusGizi: "Status Gizi Klinis",
  };

  const l4LabelMap = {
    hb: "Kadar Hemoglobin (Hb)",
    ttd: "Tablet Tambah Darah (TTD)",
    mataKanan: "Tes Penglihatan (Mata Kanan)",
    mataKiri: "Tes Penglihatan (Mata Kiri)",
    telingaKanan: "Tes Pendengaran (Telinga Kanan)",
    telingaKiri: "Tes Pendengaran (Telinga Kiri)",
    skriningJiwa: "Melakukan Skrining Jiwa",
    periksaHb: "Periksa Kadar Hemoglobin (Hb)",
    pemberianTtd: "Pemberian Tablet Tambah Darah (TTD) / MMS oleh Nakes",
    rutinTtd: "Konsumsi Tablet Tambah Darah (TTD) / MMS Rutin",
    komposisiMtBumil: "Pemberian Makanan Tambahan (MT) Bumil KEK (Komposisi & Porsi)",
    rutinMtBumil: "Rutin Konsumsi Makanan Tambahan (MT) Bumil KEK",
    bukuKia: "Kepemilikan Buku KIA",
    tempatImunisasi: "Tempat Pelaksanaan Imunisasi",
    jenisImunisasi: "Jenis Imunisasi",
    asiEksklusif: "Pemberian ASI Eksklusif",
    mpAsi: "Pemberian Makanan Pendamping ASI (MP ASI)",
    tbc: "Skrining Gejala Tuberkulosis (TBC)",
    pmtPemulihan: "Pemberian Makanan Tambahan (PMT) Pemulihan",
    pmtHabis: "Konsumsi PMT Dihabiskan",
    vitA: "Pemberian Kapsul Vitamin A",
    ikutKelasBalita: "Mengikuti Kelas Ibu Balita",
    obatCacing: "Pemberian Obat Pencegahan Cacingan",
    imunisasi: "Status Imunisasi Dasar Lengkap",
    gulaDarah: "Kadar Gula Darah Sewaktu (GDS)",
    kolesterol: "Kadar Kolesterol Total",
    penglihatan: "Tes Penglihatan (Hitung Jari)",
    pendengaran: "Tes Pendengaran (Tes Berbisik)",
    puma: "Skrining PPOK (Kuesioner PUMA)",
    asi: "Konseling & Edukasi ASI Eksklusif",
    sdidtk: "Stimulasi, Deteksi & Intervensi Dini Tumbuh Kembang (SDIDTK / KPSP)",
    mataTelinga: "Pemeriksaan Kesehatan Mata & Telinga",
    gigi: "Pemeriksaan Kesehatan Gigi & Mulut",
    perilaku: "Skrining Perilaku Hidup Bersih & Sehat (PHBS)",
    kontrasepsi: "Penggunaan Alat Kontrasepsi / Pelayanan KB",
    jumlahVitA: "Pemberian Kapsul Vitamin A oleh Nakes",
    rutinVitA: "Rutin Konsumsi Vitamin A",
    menyusui: "Praktik Menyusui",
    kbPascaPersalinan: "Pelayanan KB Pasca Persalinan",
    vitANifas: "Pemberian Vitamin A Ibu Nifas",
    ttdNifas: "Pemberian Tablet Tambah Darah (TTD) Ibu Nifas",
    tandaBahaya: "Skrining Tanda Bahaya Masa Nifas",
    aksScore: "Total Skor Aktivitas Kehidupan Sehari-hari (AKS Barthel)",
    aksKategori: "Tingkat Kemandirian AKS",
    skilasStatus: "Hasil Skrining Skrining Lansia Sederhana (SKILAS Geriatri)",
    faktorRisiko: "Skrining Faktor Risiko Kehamilan",
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header text-white p-3 px-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: primaryColor }}>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-white text-dark fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: "0.74rem" }}>
                  {data.kategori} {data.subText ? `(${data.subText})` : ""}
                </span>
                <span className="badge bg-white bg-opacity-25 text-white px-2.5 py-1 rounded-pill" style={{ fontSize: "0.74rem" }}>
                  Tanggal Pemeriksaan: {data.tglPeriksa}
                </span>
              </div>
              <h5 className="modal-title fw-bold text-white mb-0">Detail Rekap Pemeriksaan</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose} aria-label="Tutup"></button>
          </div>

          {/* Single-Page Scrollable Modal Body (All 5 Steps) */}
          <div className="modal-body p-4 bg-light">
            {/* SECTION 1: LANGKAH 1 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <User size={18} style={{ color: accentColor }} />
                <span>Langkah 1: Identitas Sasaran ({data.kategori})</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      NIK (16 Digit)
                    </div>
                    <div className="fw-bold font-monospace text-dark fs-6">{data.langkah1.nik}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      Nama Lengkap
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.nama}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      Tanggal Lahir
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.tglLahir}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      Jenis Kelamin
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.gender}</div>
                  </div>
                </div>
                {/* Parent / Spouse Card (Hidden for Dewasa and Lansia) */}
                {!["dewasa", "lansia", "usia produktif"].some((k) => (data.kategori || "").toLowerCase().includes(k)) && (
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      {(() => {
                        const raw = data.langkah1.ibu || data.langkah1.suami || data.langkah1.keteranganKeluarga || data.keteranganKeluarga || targetCitizen.keteranganIbuSuami || "";
                        let label = "Nama Orang Tua";
                        let val = raw;

                        const isBumilOrNifas = (data.kategori || "").toLowerCase().includes("bumil") || (data.kategori || "").toLowerCase().includes("nifas");
                        if (isBumilOrNifas) {
                          label = "Nama Suami";
                          val = targetCitizen.namaSuami || targetCitizen.namaAyah || (raw ? raw.replace(/^(suami|ayah):\s*/i, "").trim() : "-");
                        } else if (targetCitizen.namaIbu || raw.toLowerCase().startsWith("ibu:")) {
                          label = "Nama Ibu";
                          val = targetCitizen.namaIbu || raw.replace(/^ibu:\s*/i, "").trim();
                        } else if (targetCitizen.namaAyah || raw.toLowerCase().startsWith("ayah:")) {
                          label = "Nama Ayah";
                          val = targetCitizen.namaAyah || raw.replace(/^ayah:\s*/i, "").trim();
                        } else if (targetCitizen.namaSuami || raw.toLowerCase().startsWith("suami:")) {
                          label = "Nama Suami";
                          val = targetCitizen.namaSuami || raw.replace(/^suami:\s*/i, "").trim();
                        }

                        return (
                          <>
                            <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                              {label}
                            </div>
                            <div className="fw-bold text-dark fs-6">{val && typeof val === "object" ? JSON.stringify(val) : val || ""}</div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      Alamat Domisili
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.alamat}</div>
                  </div>
                </div>

                {/* Additional Category Metadata in Langkah 1 */}
                {data.categoryMetaL1 &&
                  Object.entries(data.categoryMetaL1).map(([k, v]) => (
                    <div className="col-12 col-md-6" key={k}>
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                          {k}
                        </div>
                        <div className="fw-bold text-dark fs-6">{v}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* SECTION 2: LANGKAH 2 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Activity size={18} style={{ color: accentColor }} />
                <span>Langkah 2: Skrining Penimbangan &amp; Pengukuran Antropometri</span>
              </h6>
              <div className="row g-3">
                {Object.entries(data.langkah2).map(([key, val]) => (
                  <div className="col-12 col-sm-6 col-md-4" key={key}>
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                        {l2LabelMap[key] || key}
                      </div>
                      <div className="fs-5 fw-bold text-dark">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: LANGKAH 3 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <BarChart2 size={18} style={{ color: accentColor }} />
                <span>Langkah 3: Plotting Evaluasi Otomatis &amp; Status Gizi</span>
              </h6>
              <div className="row g-3">
                {Object.entries(data.langkah3).map(([key, val]) => (
                  <div className="col-12" key={key}>
                    <div className="p-3 bg-light rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                      <div>
                        <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                          {l3LabelMap[key] || key}
                        </div>
                        <div className="fw-bold text-dark fs-6">{val}</div>
                      </div>
                      {data.isExamined && (
                        <div>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 small fw-semibold">
                            <CheckCircle2 size={13} /> Data Tersimpan
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: LANGKAH 4 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Stethoscope size={18} style={{ color: accentColor }} />
                <span>Langkah 4: Skrining PTM, Gejala TBC &amp; Pelayanan Spesifik ({data.kategori})</span>
              </h6>
              <div className="row g-3">
                {Object.entries(data.langkah4).map(([key, val]) => (
                  <div className="col-12 col-md-6" key={key}>
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                        {l4LabelMap[key] || key}
                      </div>
                      <div className="fw-bold text-dark fs-6">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: LANGKAH 5 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <HeartHandshake size={18} style={{ color: accentColor }} />
                <span>Langkah 5: Penyuluhan &amp; Tindak Lanjut Rujukan</span>
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3">
                    <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      Topik Penyuluhan &amp; Edukasi Kesehatan
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah5.penyuluhan}</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3">
                    <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      Status Rujukan &amp; Rekomendasi Petugas
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah5.rujukan}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-between align-items-center">
            {!isPuskesmas && onEdit ? (
              <button type="button" className="btn btn-dark-custom btn-sm px-3 rounded-3 d-inline-flex align-items-center gap-1.5 text-white fw-semibold" style={{ backgroundColor: "#2b2e4a" }} onClick={() => onEdit(data)}>
                <Edit3 size={14} /> Edit Data
              </button>
            ) : (
              <div className="text-muted small d-flex align-items-center gap-1.5">
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
