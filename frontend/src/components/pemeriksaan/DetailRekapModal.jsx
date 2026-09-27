import React from "react";
import { User, Activity, BarChart2, Stethoscope, HeartHandshake, CheckCircle2, Edit3, X, ShieldCheck, Loader2 } from "lucide-react";

const isFilled = (value) => value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0);

const formatDisplayValue = (value) => {
  if (!isFilled(value)) return "-";
  if (Array.isArray(value)) return value.map((item) => formatDisplayValue(item)).join(", ");

  if (typeof value === "object") {
    return (
      Object.entries(value)
        .filter(([, child]) => isFilled(child))
        .map(([key, child]) => `${key}: ${formatDisplayValue(child)}`)
        .join(" • ") || "-"
    );
  }

  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
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

  const tglPeriksa = exam?.tanggal ? String(exam.tanggal).split("T")[0] : citizen.tglPeriksa || "";

  const isExamined = Boolean(citizen.statusPemeriksaan === "Sudah" || citizen.status === "Sudah" || exam?.kunjungan?.status_langkah === "langkah_5");

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

  const targetCitizen = citizen || selectedCitizen;
  if (!targetCitizen) return null;

  const data = resolve5StepDetails(targetCitizen, examData);
  if (!data) return null;

  const handleClose = onClose || onHide || (() => {});
  const isDinkes = theme === "dinkes" || (themeColor && themeColor.includes("1e3a8a")) || roleTitle?.toLowerCase().includes("dinas");
  const isPuskesmas = theme === "puskesmas" || roleTitle?.toLowerCase().includes("puskesmas");
  const primaryColor = themeColor || (isDinkes ? "#1e3a8a" : isPuskesmas ? "#428A75" : "#2b2e4a");
  const accentColor = isDinkes ? "#1e3a8a" : isPuskesmas ? "#428A75" : "#F25B8E";

  const renderObjectSection = (objectValue) => {
    const entries = Object.entries(objectValue || {}).filter(([, value]) => isFilled(value));
    if (!entries.length) {
      return <div className="text-muted small">Belum ada data tersimpan.</div>;
    }

    return (
      <div className="row g-3">
        {entries.map(([key, value]) => (
          <div className="col-12 col-md-6" key={key}>
            <div className="p-3 bg-light rounded-3 h-100">
              <div className="text-muted small mb-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                {key}
              </div>
              <div className="fw-bold text-dark" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {formatDisplayValue(value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
