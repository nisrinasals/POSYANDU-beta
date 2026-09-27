import React, { useState } from "react";
import { Download, FileSpreadsheet, Heart, Baby, GraduationCap, Activity } from "lucide-react";
import ExportRekapModal from "./ExportRekapModal";

export default function RekapTemplateExcelView({
  globalSasaranList = [],
  globalPemeriksaanData = {},
  userRole = "puskesmas-staf", // 'puskesmas-staf' | 'dinkes-staf'
  user = {},
}) {
  const isDinkes = userRole?.includes("dinkes") || user?.roleType?.includes("dinkes");
  const themeColor = isDinkes ? "#1e3a8a" : "#428A75";
  const roleTitle = isDinkes ? user?.instansi || user?.nama_instansi || user?.role || "" : user?.puskesmas || user?.instansi || user?.role || "";

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState("Semua Kategori (Semua Siklus)");

  const handleOpenExportModal = (categoryName = "Semua Kategori (Semua Siklus)") => {
    setSelectedCategoryForModal(categoryName);
    setIsExportModalOpen(true);
  };

  const categoryFormats = [
    {
      id: "bumil_nifas",
      categoryParam: "Bumil",
      title: "Ibu Hamil, Nifas & Menyusui",
      description: "Rekapitulasi pemeriksaan masa kehamilan (ANC), masa nifas (PNC), laktasi, dan pemantauan gizi ibu.",
      icon: Heart,
      accentColor: "#e11d48",
      lightBg: "#fff1f2",
    },
    {
      id: "bayi_balita_apras",
      categoryParam: "Bayi 0–11 Bln",
      title: "Bayi, Balita & Anak Pra-Sekolah",
      description: "Rekapitulasi pemantauan tumbuh kembang (KMS/Z-score), imunisasi dasar lengkap, dan instrumen KPSP.",
      icon: Baby,
      accentColor: "#0284c7",
      lightBg: "#f0f9ff",
    },
    {
      id: "remaja",
      categoryParam: "Usekrem 6–14 Thn",
      title: "Anak Usia Sekolah & Remaja (6–18 Thn)",
      description: "Rekapitulasi skrining kesehatan anak usia sekolah dan remaja termasuk pencegahan anemia rematri.",
      icon: GraduationCap,
      accentColor: "#7c3aed",
      lightBg: "#faf5ff",
    },
    {
      id: "dewasa_lansia",
      categoryParam: "Dewasa",
      title: "Usia Dewasa & Lansia (≥ 19 Tahun)",
      description: "Rekapitulasi deteksi dini faktor risiko Penyakit Tidak Menular (PTM), skrining kanker, dan SKILAS lansia.",
      icon: Activity,
      accentColor: "#059669",
      lightBg: "#ecfdf5",
    },
  ];

  return (
    <div className="container-fluid p-0">
      {/* Top Header Card */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-4 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold text-dark mb-0">Format Rekapitulasi Pemeriksaan</h5>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-0.5 rounded-pill fw-semibold small">Standar Resmi Kemenkes</span>
              </div>
              <p className="text-muted small mb-0">Pilih formulir kategori siklus hidup di bawah atau unduh berkas rekapitulasi seluruh siklus sekaligus.</p>
            </div>
          </div>
          <button
            className="btn btn-sm px-4 py-2.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 rounded-3 shadow-xs text-white"
            style={{ backgroundColor: themeColor }}
            onClick={() => handleOpenExportModal("Semua Kategori (Semua Siklus)")}
            title="Export Rekapitulasi Semua Kategori"
          >
            <Download size={16} />
            <span>Export Semua Kategori (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Grid 4 Kartu Modern, Clean & Berisi */}
      <div className="row g-3.5 mb-4">
        {categoryFormats.map((fmt) => {
          const IconComponent = fmt.icon;
          return (
            <div className="col-12 col-md-6" key={fmt.id}>
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 d-flex flex-column justify-content-between transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  borderTop: `4px solid ${fmt.accentColor}`,
                }}
              >
                <div>
                  {/* Top row: Icon + Format Tag */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: fmt.lightBg, color: fmt.accentColor }}>
                      <IconComponent size={22} />
                    </div>
                    <span className="badge bg-light text-secondary border px-2.5 py-1 rounded-pill fw-medium" style={{ fontSize: "0.75rem" }}>
                      Formulir Standar ILP
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h6 className="fw-bold text-dark mb-1.5 fs-6">{fmt.title}</h6>
                  <p className="text-muted small mb-0" style={{ fontSize: "0.825rem", lineHeight: "1.5" }}>
                    {fmt.description}
                  </p>
                </div>

                {/* Footer Row */}
                <div className="pt-3 border-top mt-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: "0.785rem" }}>
                    <FileSpreadsheet size={15} style={{ color: fmt.accentColor }} />
                    <span>Microsoft Excel (.xlsx)</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm text-white rounded-3 px-3.5 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-xs"
                    style={{ backgroundColor: themeColor, fontSize: "0.825rem" }}
                    onClick={() => handleOpenExportModal(fmt.categoryParam)}
                  >
                    <Download size={14} />
                    <span>Export Format Excel</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL POPUP EXPORT REKAPITULASI */}
      <ExportRekapModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentCategory={selectedCategoryForModal}
        currentYear="Semua"
        globalSasaranList={globalSasaranList}
        globalPemeriksaanData={globalPemeriksaanData}
        theme={isDinkes ? "dinkes" : "puskesmas"}
        themeColor={themeColor}
        roleTitle={roleTitle}
      />
    </div>
  );
}
