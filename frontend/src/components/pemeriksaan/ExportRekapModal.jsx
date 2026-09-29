import React, { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, CheckCircle2, Layers, Calendar } from "lucide-react";
import { pemeriksaanService } from "../../services";
import RekapWorksheetPreview from "./RekapWorksheetPreview";

const CATEGORY_GROUPS = {
  bumil_nifas_menyusui: {
    label: "Ibu Hamil / Nifas / Menyusui",
  },
  bayi_balita_apras: {
    label: "Bayi, Balita dan Apras",
  },
  usia_sekolah_remaja: {
    label: "Anak Usia Sekolah dan Remaja (6–18 Tahun)",
  },
  dewasa_lansia: {
    label: "Usia Dewasa dan Lansia (≥ 19 Tahun)",
  },
  all: {
    label: "Semua Template Rekap",
  },
};

export default function ExportRekapModal({ isOpen, onClose, currentCategory = "Semua Kategori", currentYear = "Semua", globalPemeriksaanData = {}, theme = "kader", themeColor = null, roleTitle = "" }) {
  const isDinkes = theme === "dinkes";
  const isPuskesmas = theme === "puskesmas";
  const primaryColor = themeColor || (isDinkes ? "#1e3a8a" : isPuskesmas ? "#428A75" : "#2b2e4a");

  const normalizeCategory = (value) => String(value || "").toLowerCase();
  const categoryKey = normalizeCategory(currentCategory);

  const initialCategory = useMemo(() => {
    if (categoryKey.includes("bayi") || categoryKey.includes("balita") || categoryKey.includes("apras")) return "bayi_balita_apras";
    if (categoryKey.includes("remaja") || categoryKey.includes("sekolah") || categoryKey.includes("usekrem")) return "usia_sekolah_remaja";
    if (categoryKey.includes("dewasa") || categoryKey.includes("lansia")) return "dewasa_lansia";
    if (categoryKey.includes("bumil") || categoryKey.includes("nifas") || categoryKey.includes("menyusui")) return "bumil_nifas_menyusui";
    return "all";
  }, [categoryKey]);

  const [selectedFormatCategory, setSelectedFormatCategory] = useState(initialCategory);
  const defaultYear = currentYear === "Semua" ? String(new Date().getFullYear()) : currentYear;
  const [exportYear, setExportYear] = useState(defaultYear);
  const [backendYears, setBackendYears] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedFormatCategory(initialCategory);
    setExportYear(currentYear === "Semua" ? String(new Date().getFullYear()) : currentYear);
    setShowSuccess(false);
    setErrorMessage("");
  }, [isOpen, initialCategory, currentYear]);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    pemeriksaanService
      .getMonthlyStatistics()
      .then((response) => {
        if (!cancelled) setBackendYears(Array.isArray(response?.data?.years) ? response.data.years : []);
      })
      .catch(() => {
        if (!cancelled) setBackendYears([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const availableYears = useMemo(() => {
    const yearsFromRecords = Object.values(globalPemeriksaanData || {})
      .map((item) => String(item?.tanggal || "").slice(0, 4))
      .filter((year) => /^\d{4}$/.test(year));
    return [...new Set([...yearsFromRecords, ...backendYears, String(new Date().getFullYear())])].sort((a, b) => Number(b) - Number(a));
  }, [backendYears, globalPemeriksaanData]);

  if (!isOpen) return null;

  const extractBlob = (response) => {
    if (response instanceof Blob) return response;
    if (response?.data instanceof Blob) return response.data;
    return null;
  };

  const readBlobError = async (error) => {
    const candidate = error?.data instanceof Blob ? error.data : error?.response?.data instanceof Blob ? error.response.data : null;
    if (!candidate) return null;
    try {
      const text = await candidate.text();
      const parsed = JSON.parse(text);
      return parsed?.message || parsed?.error || null;
    } catch {
      return null;
    }
  };

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

      if (selectedFormatCategory !== "all") params.template_rekap = selectedFormatCategory;

      const response = await pemeriksaanService.exportPemeriksaanExcel(params);
      const blob = extractBlob(response);

      if (!blob) {
        throw new Error("Backend tidak mengembalikan file Excel.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rekap-pemeriksaan-${selectedFormatCategory}-${year || "semua-data"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error("Export rekap error:", error);
      const backendMessage = await readBlobError(error);
      setErrorMessage(backendMessage || error?.message || "Export rekapitulasi gagal.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: "min(1250px, 96vw)" }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-white shadow-xs border" style={{ color: primaryColor }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">Export Rekapitulasi Pemeriksaan</h5>
                <p className="text-muted small mb-0">Pilih template dan tahun.</p>
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
                <p className="text-muted small mb-0">File rekap siap diunduh.</p>
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <label className="form-label fw-bold text-dark small d-flex align-items-center gap-2">
                    <Layers size={14} style={{ color: primaryColor }} /> Template Rekap
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

                <div className="col-12 d-flex justify-content-end gap-2 pt-2">
                  <button type="button" className="btn btn-light border rounded-3 px-4" onClick={onClose} disabled={isExporting}>
                    Batal
                  </button>
                  <button type="button" className="btn text-white rounded-3 px-4 fw-semibold d-inline-flex align-items-center gap-2" style={{ backgroundColor: primaryColor }} onClick={handleDownload} disabled={isExporting}>
                    <Download size={16} />
                    {isExporting ? "Mengambil data..." : "Export Excel (.xlsx)"}
                  </button>
                </div>

                <div className="col-12">
                  <div className="small text-muted mb-2">Pratinjau template rekap</div>
                  <RekapWorksheetPreview
                    templateRekap={selectedFormatCategory === "all" ? "bumil_nifas_menyusui" : selectedFormatCategory}
                    year={exportYear || "Semua"}
                    theme={theme}
                    roleTitle={roleTitle}
                  />
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
