import React, { useEffect, useMemo, useState } from "react";
import { pemeriksaanService } from "../../services";

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const EMPTY_COLUMNS = Object.freeze([]);
const EMPTY_ROWS = Object.freeze([]);

const TEMPLATE_TITLES = {
  bumil_nifas_menyusui: "Ibu Hamil, Nifas & Menyusui",
  bayi_balita_apras: "Bayi, Balita & Anak Pra-Sekolah",
  usia_sekolah_remaja: "Anak Usia Sekolah & Remaja (6-18 Tahun)",
  dewasa_lansia: "Usia Dewasa & Lansia",
};

const getYearMonth = (period) => {
  const value = String(period || "").toLowerCase();
  const numericPeriod = value.match(/(?:^|\D)(20\d{2})[-/](\d{1,2})(?:\D|$)/);
  if (numericPeriod) return { year: Number(numericPeriod[1]), month: Number(numericPeriod[2]) };
  const month = MONTH_NAMES.findIndex((name) => value.includes(name.toLowerCase())) + 1;
  const year = Number(value.match(/20\d{2}/)?.[0]);
  return month && year ? { year, month } : null;
};

const getColumnGroup = (key) => {
  if (key.startsWith("jumlah_")) return "Jumlah Sasaran";
  if (key.includes("datang")) return "Kehadiran";
  if (key.startsWith("dirujuk") || key === "dirujuk") return "Sasaran Dirujuk";
  if (key.includes("edukasi")) return "Edukasi";
  if (["ttd", "pmt", "kelas", "vitamin", "imunisasi", "asi", "mpasi", "obat_cacing"].some((term) => key.includes(term))) return "Intervensi";
  return "Hasil Pengukuran / Pemeriksaan";
};

export default function RekapWorksheetPreview({ templateRekap, year, theme = "puskesmas", roleTitle = "" }) {
  const [preview, setPreview] = useState(null);
  const title = TEMPLATE_TITLES[templateRekap] || TEMPLATE_TITLES.bumil_nifas_menyusui;

  useEffect(() => {
    let cancelled = false;
    pemeriksaanService
      .getRekapitulasi({ template_rekap: templateRekap, ...(year !== "Semua" ? { start_date: `${year}-01-01`, end_date: `${year}-12-31` } : {}) })
      .then((response) => {
        if (cancelled) return;
        setPreview({
          templateRekap,
          year,
          columns: Array.isArray(response?.data?.columns) ? response.data.columns : [],
          rows: Array.isArray(response?.data?.rows) ? response.data.rows : [],
          errorMessage: "",
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setPreview({ templateRekap, year, columns: [], rows: [], errorMessage: error?.message || "Pratinjau template gagal dimuat." });
      });

    return () => {
      cancelled = true;
    };
  }, [templateRekap, year]);

  const isLoading = preview?.templateRekap !== templateRekap || preview?.year !== year;
  const columns = isLoading ? EMPTY_COLUMNS : preview.columns;
  const rows = isLoading ? EMPTY_ROWS : preview.rows;
  const errorMessage = isLoading ? "" : preview.errorMessage;

  const worksheetRows = useMemo(() => {
    const availableYears = [...new Set(rows.map((row) => getYearMonth(row.bulan_tahun)?.year).filter(Boolean))].sort((left, right) => left - right);
    const years = year === "Semua" ? availableYears : [Number(year)];
    const displayedYears = years.length ? years : [new Date().getFullYear()];

    return displayedYears.flatMap((selectedYear) =>
      MONTH_NAMES.map((month, index) => {
        const backendRow = rows.find((row) => {
          const period = getYearMonth(row.bulan_tahun);
          return period?.year === selectedYear && period.month === index + 1;
        }) || {};
        const emptyRow = Object.fromEntries(columns.map((column) => [column.key, column.key === "bulan_tahun" ? `${month} ${selectedYear}` : 0]));
        return { ...emptyRow, ...backendRow, bulan_tahun: `${month} ${selectedYear}` };
      }),
    );
  }, [columns, rows, year]);

  const headerGroups = useMemo(() => {
    const groups = [];
    columns.slice(1).forEach((column) => {
      const label = getColumnGroup(column.key);
      const previousGroup = groups[groups.length - 1];
      if (previousGroup?.label === label) previousGroup.columns.push(column);
      else groups.push({ label, columns: [column] });
    });
    return groups;
  }, [columns]);

  return (
    <section className="border rounded-3 overflow-hidden" aria-live="polite">
      <div className="px-3 py-2 text-center border-bottom bg-white">
        <div className="fw-bold text-dark text-uppercase" style={{ fontSize: "0.8rem" }}>Rekapitulasi Hasil Pemeriksaan {title}</div>
        <div className="small fw-semibold text-dark">{theme === "dinkes" ? "DINAS KESEHATAN" : `PUSKESMAS ${roleTitle}`}</div>
      </div>

      {isLoading ? (
        <div className="p-3 text-muted small">Memuat template rekap...</div>
      ) : errorMessage ? (
        <div className="p-3 text-danger small" role="alert">{errorMessage}</div>
      ) : columns.length === 0 ? (
        <div className="p-3 text-muted small">Template rekap belum tersedia.</div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: "300px" }}>
          <table className="table table-sm table-bordered align-middle text-center mb-0" style={{ minWidth: "max-content", fontSize: "0.72rem" }}>
            <thead style={{ backgroundColor: "#e2e8f0", position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th rowSpan={2} className="text-dark px-2 py-2 text-nowrap" style={{ verticalAlign: "middle" }}>{columns[0]?.label}</th>
                {headerGroups.map((group, index) => (
                  <th key={`${group.label}-${index}`} colSpan={group.columns.length} className="text-dark px-2 py-2" style={{ verticalAlign: "middle" }}>{group.label}</th>
                ))}
              </tr>
              <tr>
                {columns.slice(1).map((column) => (
                  <th key={column.key} className="text-dark px-2 py-2" style={{ verticalAlign: "middle", minWidth: "100px", whiteSpace: "normal" }}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {worksheetRows.map((row) => (
                <tr key={row.bulan_tahun}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-2 py-1 text-nowrap">{row[column.key] || 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}