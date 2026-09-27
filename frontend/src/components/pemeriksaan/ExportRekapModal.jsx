import React, { useEffect, useMemo, useState } from "react";
import { X, Download, FileSpreadsheet, CheckCircle2, Layers, Calendar, AlertCircle } from "lucide-react";
import { pemeriksaanService } from "../../services";

const CATEGORY_GROUPS = {
  bumil_nifas: {
    label: "Ibu Hamil / Nifas / Menyusui",
    categories: ["bumil", "busui"],
  },
  bayi_balita_apras: {
    label: "Bayi, Balita dan Apras",
    categories: ["bayi", "balita", "apras"],
  },
  remaja: {
    label: "Anak Usia Sekolah dan Remaja (6–18 Tahun)",
    categories: ["uskrem_6_14", "uskrem_15_18"],
  },
  dewasa_lansia: {
    label: "Usia Dewasa dan Lansia (≥ 19 Tahun)",
    categories: ["dewasa", "lansia"],
  },
  all: {
    label: "Semua Kategori",
    categories: [],
  },
};

export default function ExportRekapModal({ isOpen, onClose, currentCategory = "Semua Kategori", currentYear = "Semua", globalPemeriksaanData = {}, theme = "kader", themeColor = null }) {
  const isDinkes = theme === "dinkes";
  const isPuskesmas = theme === "puskesmas";
  const primaryColor = themeColor || (isDinkes ? "#1e3a8a" : isPuskesmas ? "#428A75" : "#2b2e4a");

  const normalizeCategory = (value) => String(value || "").toLowerCase();
  const categoryKey = normalizeCategory(currentCategory);

  const initialCategory = useMemo(() => {
    if (categoryKey.includes("bayi") || categoryKey.includes("balita") || categoryKey.includes("apras")) return "bayi_balita_apras";
    if (categoryKey.includes("remaja") || categoryKey.includes("sekolah") || categoryKey.includes("usekrem")) return "remaja";
    if (categoryKey.includes("dewasa") || categoryKey.includes("lansia")) return "dewasa_lansia";
    if (categoryKey.includes("bumil") || categoryKey.includes("nifas") || categoryKey.includes("menyusui")) return "bumil_nifas";
    return "all";
  }, [categoryKey]);

  const availableYears = useMemo(() => {
    const years = Object.values(globalPemeriksaanData || {})
      .map((item) => String(item?.tanggal || "").slice(0, 4))
      .filter((year) => /^\d{4}$/.test(year));
    return [...new Set(years)].sort((a, b) => Number(b) - Number(a));
  }, [globalPemeriksaanData]);

  const [selectedFormatCategory, setSelectedFormatCategory] = useState(initialCategory);
  const [exportYear, setExportYear] = useState(currentYear === "Semua" ? "" : currentYear);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedFormatCategory(initialCategory);
    setExportYear(currentYear === "Semua" ? "" : currentYear);
    setShowSuccess(false);
    setErrorMessage("");
  }, [isOpen, initialCategory, currentYear]);

  if (!isOpen) return null;

  const selectedGroup = CATEGORY_GROUPS[selectedFormatCategory] || CATEGORY_GROUPS.all;

  const handleDownload = async () => {
    setIsExporting(true);
    setErrorMessage("");

    try {
      const params = {};
      const year = String(exportYear || "").trim();

      if (year) {
        params.start_date = `${year}-01-01`;
        params.end_date = `${year}-12-31`;
      }

      // Backend export currently accepts one kategori_sasaran filter at a time.
      // For grouped formats, omit the category filter so the backend returns the
      // complete authorized workbook rather than silently returning an incomplete group.
      if (selectedGroup.categories.length === 1) {
        params.kategori_sasaran = selectedGroup.categories[0];
      }

      const blob = await pemeriksaanService.exportPemeriksaanExcel(params);
      if (!(blob instanceof Blob)) {
        throw new Error("Backend tidak mengembalikan file Excel.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rekap-pemeriksaan-${year || "semua-data"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error("Export rekap error:", error);
      setErrorMessage(error?.message || "Export rekapitulasi gagal.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-white shadow-xs border" style={{ color: primaryColor }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">Export Rekapitulasi Pemeriksaan</h5>
                <p className="text-muted small mb-0">Berkas dihasilkan langsung oleh backend dari data yang tersimpan.</p>
              </div>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose} aria-label="Tutup" />
          </div>

          <div className="modal-body px-4 py-4">
            {showSuccess ? (
              <div className="text-center py-5">
                <div className="mx-auto mb-3 text-success p-3 bg-success-subtle rounded-circle d-inline-flex">
                  <CheckCircle2 size={42} />
                </div>
                <h5 className="fw-bold text-dark">File Excel Berhasil Dibuat</h5>
                <p className="text-muted small mb-0">File hasil export berasal dari endpoint backend.</p>
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <label className="form-label fw-bold text-dark small d-flex align-items-center gap-2">
                    <Layers size={14} style={{ color: primaryColor }} /> Kategori Export
                  </label>
                  <select className="form-select border-2 fw-semibold py-2 text-dark" style={{ borderColor: primaryColor }} value={selectedFormatCategory} onChange={(e) => setSelectedFormatCategory(e.target.value)}>
                    {Object.entries(CATEGORY_GROUPS).map(([key, group]) => (
                      <option key={key} value={key}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-5">
                  <label className="form-label fw-bold text-dark small d-flex align-items-center gap-2">
                    <Calendar size={14} style={{ color: primaryColor }} /> Tahun
                  </label>
                  <select className="form-select border-2 fw-semibold py-2 text-dark" style={{ borderColor: primaryColor }} value={exportYear} onChange={(e) => setExportYear(e.target.value)}>
                    <option value="">Semua Tahun</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        Tahun {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <div className="alert alert-light border d-flex gap-2 align-items-start mb-0">
                    <AlertCircle size={17} className="flex-shrink-0 mt-1" style={{ color: primaryColor }} />
                    <div className="small text-secondary">
                      <div className="fw-semibold text-dark mb-1">Sumber data</div>
                      Export membaca data sesuai scope akun dari backend. Tidak ada data contoh, dummy row, atau identitas wilayah yang dibuat di frontend.
                    </div>
                  </div>
                </div>

                <div className="col-12 d-flex justify-content-end gap-2 pt-2">
                  <button type="button" className="btn btn-light border rounded-3 px-4" onClick={onClose} disabled={isExporting}>
                    Batal
                  </button>
                  <button type="button" className="btn text-white rounded-3 px-4 fw-semibold d-inline-flex align-items-center gap-2" style={{ backgroundColor: primaryColor }} onClick={handleDownload} disabled={isExporting}>
                    <Download size={16} />
                    {isExporting ? "Mengambil data..." : "Export Excel (.xlsx)"}
                  </button>
                </div>

                {errorMessage && (
                  <div className="col-12">
                    <div className="alert alert-danger small mb-0">{errorMessage}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
