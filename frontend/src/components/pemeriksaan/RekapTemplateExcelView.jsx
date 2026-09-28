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
    </div>
  );
}
