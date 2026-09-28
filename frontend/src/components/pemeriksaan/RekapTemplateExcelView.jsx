<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import ExportRekapModal from "./ExportRekapModal";
import { pemeriksaanService } from "../../services";

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const getMonthNumber = (period) => {
  const value = String(period || "").toLowerCase();
  const numericPeriod = value.match(/(?:^|\D)(20\d{2})[-/](\d{1,2})(?:\D|$)/);
  if (numericPeriod) return Number(numericPeriod[2]);
  return MONTH_NAMES.findIndex((month) => value.includes(month.toLowerCase())) + 1;
};

const getColumnGroup = (key) => {
  if (key.startsWith("jumlah_")) return "Jumlah Sasaran";
  if (key.includes("datang")) return "Kehadiran";
  if (key.startsWith("dirujuk") || key === "dirujuk") return "Sasaran Dirujuk";
  if (key.includes("edukasi")) return "Edukasi";
  if (["ttd", "pmt", "kelas", "vitamin", "imunisasi", "asi", "mpasi", "obat_cacing"].some((term) => key.includes(term))) return "Intervensi";
  return "Hasil Pengukuran / Pemeriksaan";
};
=======
import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Heart, 
  Baby, 
  GraduationCap, 
  Activity 
} from 'lucide-react';
import ExportRekapModal from './ExportRekapModal';
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

export default function RekapTemplateExcelView({
  globalSasaranList = [],
  globalPemeriksaanData = {},
<<<<<<< HEAD
  userRole = "puskesmas-staf", // 'puskesmas-staf' | 'dinkes-staf'
  user = {},
}) {
  const isDinkes = userRole?.includes("dinkes") || user?.roleType?.includes("dinkes");
  const themeColor = isDinkes ? "#1e3a8a" : "#428A75";
  const roleTitle = isDinkes ? user?.instansi || user?.nama_instansi || user?.role || "" : user?.puskesmas || user?.instansi || user?.role || "";

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState("Semua Kategori (Semua Siklus)");

  const categoryFormats = [
    {
      id: "bumil_nifas_menyusui",
      categoryParam: "Bumil",
      title: "Ibu Hamil, Nifas & Menyusui",
    },
    {
      id: "bayi_balita_apras",
      categoryParam: "Bayi 0–11 Bln",
      title: "Bayi, Balita & Anak Pra-Sekolah",
    },
    {
      id: "usia_sekolah_remaja",
      categoryParam: "Usekrem 6–14 Thn",
      title: "Anak Usia Sekolah & Remaja (6–18 Tahun)",
    },
    {
      id: "dewasa_lansia",
      categoryParam: "Dewasa",
      title: "Usia Dewasa & Lansia (≥ 19 Tahun)",
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState(categoryFormats[0].id);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsPreviewLoading(true);
    setPreviewError("");

    pemeriksaanService
      .getRekapitulasi({ template_rekap: selectedTemplate, start_date: `${selectedYear}-01-01`, end_date: `${selectedYear}-12-31` })
      .then((response) => {
        if (cancelled) return;
        setPreviewColumns(Array.isArray(response?.data?.columns) ? response.data.columns : []);
        setPreviewRows(Array.isArray(response?.data?.rows) ? response.data.rows : []);
      })
      .catch((error) => {
        if (cancelled) return;
        setPreviewColumns([]);
        setPreviewRows([]);
        setPreviewError(error?.message || "Pratinjau template gagal dimuat dari backend.");
      })
      .finally(() => {
        if (!cancelled) setIsPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTemplate, selectedYear]);

  const selectedTemplateFormat = categoryFormats.find((format) => format.id === selectedTemplate) || categoryFormats[0];
  const worksheetRows = MONTH_NAMES.map((month, index) => {
    const backendRow = previewRows.find((row) => getMonthNumber(row.bulan_tahun) === index + 1) || {};
    const emptyRow = Object.fromEntries(previewColumns.map((column) => [column.key, column.key === "bulan_tahun" ? `${month} ${selectedYear}` : 0]));
    return { ...emptyRow, ...backendRow, bulan_tahun: `${month} ${selectedYear}` };
  });
  const headerGroups = [];
  previewColumns.slice(1).forEach((column) => {
    const label = getColumnGroup(column.key);
    const previousGroup = headerGroups[headerGroups.length - 1];
    if (previousGroup?.label === label) previousGroup.columns.push(column);
    else headerGroups.push({ label, columns: [column] });
  });

  const handleOpenExportModal = () => {
    setSelectedCategoryForModal(selectedTemplateFormat.categoryParam);
    setIsExportModalOpen(true);
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-3">
        <div className="row g-2 flex-grow-1">
          <div className="col-12 col-md-7">
            <label className="form-label small fw-semibold text-dark mb-1">Template Rekap</label>
            <select className="form-select bg-white" value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value)}>
              {categoryFormats.map((format) => (
                <option key={format.id} value={format.id}>{format.title}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-dark mb-1">Tahun</label>
            <select className="form-select bg-white" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
              {Array.from({ length: new Date().getFullYear() - 2019 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                <option key={year} value={String(year)}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-sm px-3 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 text-white" style={{ backgroundColor: themeColor }} onClick={handleOpenExportModal}>
          <Download size={16} /> Export Excel (.xlsx)
        </button>
      </div>

      <section className="bg-white border border-secondary-subtle overflow-hidden" aria-live="polite" style={{ borderRadius: "4px" }}>
        <div className="p-3 text-center border-bottom">
          <h5 className="fw-bold text-dark text-uppercase mb-1">Rekapitulasi Hasil Pemeriksaan {selectedTemplateFormat.title}</h5>
          <div className="small fw-bold text-dark">{isDinkes ? "DINAS KESEHATAN" : `PUSKESMAS ${roleTitle || ""}`}</div>
        </div>
        <div className="d-flex flex-wrap gap-3 px-3 py-2 border-bottom small text-dark">
          <span>Dusun / RT / RW: {user?.dusun || "-"}</span>
          <span>Desa / Kelurahan: {user?.kelurahan || "-"}</span>
          <span>Kecamatan: {user?.kecamatan || "-"}</span>
        </div>

        {isPreviewLoading ? (
          <div className="p-4 text-muted small">Memuat data rekap...</div>
        ) : previewError ? (
          <div className="p-4 text-danger small" role="alert">{previewError}</div>
        ) : previewColumns.length === 0 ? (
          <div className="p-4 text-muted small">Template belum tersedia dari backend.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle text-center mb-0" style={{ minWidth: "max-content", fontSize: "0.78rem" }}>
              <thead style={{ backgroundColor: "#e2e8f0" }}>
                <tr>
                  <th rowSpan={2} className="text-dark px-3 py-2 text-nowrap" style={{ verticalAlign: "middle" }}>{previewColumns[0]?.label}</th>
                  {headerGroups.map((group) => (
                    <th key={group.label} colSpan={group.columns.length} className="text-dark px-3 py-2" style={{ verticalAlign: "middle", minWidth: "110px" }}>{group.label}</th>
                  ))}
                </tr>
                <tr>
                  {previewColumns.slice(1).map((column) => (
                    <th key={column.key} className="text-dark px-2 py-2" style={{ verticalAlign: "middle", minWidth: "110px", whiteSpace: "normal" }}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {worksheetRows.map((row) => (
                  <tr key={row.bulan_tahun}>
                    {previewColumns.map((column) => (
                      <td key={column.key} className="px-2 py-2 text-nowrap">{row[column.key] ?? 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL POPUP EXPORT REKAPITULASI */}
      <ExportRekapModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentCategory={selectedCategoryForModal}
        currentYear={selectedYear}
        globalSasaranList={globalSasaranList}
        globalPemeriksaanData={globalPemeriksaanData}
        theme={isDinkes ? "dinkes" : "puskesmas"}
        themeColor={themeColor}
        roleTitle={roleTitle}
      />
=======
  userRole = 'puskesmas-staf', // 'puskesmas-staf' | 'dinkes-staf'
  user = {}
}) {
  const isDinkes = userRole?.includes('dinkes') || user?.roleType?.includes('dinkes');
  const themeColor = isDinkes ? '#1e3a8a' : '#428A75';
  const roleTitle = isDinkes ? 'Dinas Kesehatan Kota' : 'Puskesmas Pembina';

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState('Semua Kategori (Semua Siklus)');

  const handleOpenExportModal = (categoryName = 'Semua Kategori (Semua Siklus)') => {
    setSelectedCategoryForModal(categoryName);
    setIsExportModalOpen(true);
  };

  const categoryFormats = [
    {
      id: 'bumil_nifas',
      categoryParam: 'Bumil',
      title: 'Ibu Hamil, Nifas & Menyusui',
      description: 'Rekapitulasi pemeriksaan masa kehamilan (ANC), masa nifas (PNC), laktasi, dan pemantauan gizi ibu.',
      icon: Heart,
      accentColor: '#e11d48',
      lightBg: '#fff1f2'
    },
    {
      id: 'bayi_balita_apras',
      categoryParam: 'Bayi 0–11 Bln',
      title: 'Bayi, Balita & Anak Pra-Sekolah',
      description: 'Rekapitulasi pemantauan tumbuh kembang (KMS/Z-score), imunisasi dasar lengkap, dan instrumen KPSP.',
      icon: Baby,
      accentColor: '#0284c7',
      lightBg: '#f0f9ff'
    },
    {
      id: 'remaja',
      categoryParam: 'Usekrem 6–14 Thn',
      title: 'Anak Usia Sekolah & Remaja (6–18 Thn)',
      description: 'Rekapitulasi skrining kesehatan anak usia sekolah dan remaja termasuk pencegahan anemia rematri.',
      icon: GraduationCap,
      accentColor: '#7c3aed',
      lightBg: '#faf5ff'
    },
    {
      id: 'dewasa_lansia',
      categoryParam: 'Dewasa',
      title: 'Usia Dewasa & Lansia (≥ 19 Tahun)',
      description: 'Rekapitulasi deteksi dini faktor risiko Penyakit Tidak Menular (PTM), skrining kanker, dan SKILAS lansia.',
      icon: Activity,
      accentColor: '#059669',
      lightBg: '#ecfdf5'
    }
  ];

  return (
    <div className="container-fluid p-0">
      
      {/* Top Header Card */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-4 p-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: `${themeColor}12`, color: themeColor }}
            >
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold text-dark mb-0">Format Rekapitulasi Pemeriksaan</h5>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-0.5 rounded-pill fw-semibold small">
                  Standar Resmi Kemenkes
                </span>
              </div>
              <p className="text-muted small mb-0">
                Pilih formulir kategori siklus hidup di bawah atau unduh berkas rekapitulasi seluruh siklus sekaligus.
              </p>
            </div>
          </div>
          <button 
            className="btn btn-sm px-4 py-2.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 rounded-3 shadow-xs text-white" 
            style={{ backgroundColor: themeColor }}
            onClick={() => handleOpenExportModal('Semua Kategori (Semua Siklus)')}
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
                  borderColor: '#e2e8f0',
                  borderTop: `4px solid ${fmt.accentColor}`
                }}
              >
                <div>
                  {/* Top row: Icon + Format Tag */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div 
                      className="rounded-3 p-2.5 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: fmt.lightBg, color: fmt.accentColor }}
                    >
                      <IconComponent size={22} />
                    </div>
                    <span 
                      className="badge bg-light text-secondary border px-2.5 py-1 rounded-pill fw-medium"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Formulir Standar ILP
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h6 className="fw-bold text-dark mb-1.5 fs-6">{fmt.title}</h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.825rem', lineHeight: '1.5' }}>
                    {fmt.description}
                  </p>
                </div>

                {/* Footer Row */}
                <div className="pt-3 border-top mt-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '0.785rem' }}>
                    <FileSpreadsheet size={15} style={{ color: fmt.accentColor }} />
                    <span>Microsoft Excel (.xlsx)</span>
                  </div>

                  <button 
                    type="button"
                    className="btn btn-sm text-white rounded-3 px-3.5 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-xs"
                    style={{ backgroundColor: themeColor, fontSize: '0.825rem' }}
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
        currentYear="2026"
        globalSasaranList={globalSasaranList}
        globalPemeriksaanData={globalPemeriksaanData}
        theme={isDinkes ? 'dinkes' : 'puskesmas'}
        themeColor={themeColor}
        roleTitle={roleTitle}
      />

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    </div>
  );
}
