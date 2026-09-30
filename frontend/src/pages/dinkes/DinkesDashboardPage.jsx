import React, { useEffect, useState, useMemo } from "react";
import { userService, posyanduService, pemeriksaanService } from "../../services";
import { Building2, Users, Layers, Calendar, FileSpreadsheet, UserCheck, ChevronRight, TrendingUp, Download, Activity } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Filler, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Filler, Legend, BarElement);

export default function DinkesDashboardPage({ onNavigate, user, globalStatistikSasaran = {}, isGlobalStatistikLoading = false }) {
  const themeColor = user?.roleType === "sa" ? "#6b4e31" : "#1e3a8a";
  const [periodeGrafik, setPeriodeGrafik] = useState("6bulan");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [pendingAccountCount, setPendingAccountCount] = useState(0);
  const [registryStats, setRegistryStats] = useState({ posyandu: 0, puskesmas: 0 });
  const [monthlyExaminations, setMonthlyExaminations] = useState([]);
  const [monthlyStatsLoading, setMonthlyStatsLoading] = useState(true);
  const [monthlyStatsError, setMonthlyStatsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const pendingUsersRequest = user?.roleType === "dinkes-admin" ? userService.getAllUsers({ status: "pending_approval" }) : Promise.resolve({ data: [] });
    Promise.all([pendingUsersRequest, posyanduService.getAllPosyandu()])
      .then(([usersRes, posyanduRes]) => {
        if (cancelled) return;

        setPendingAccountCount(Array.isArray(usersRes?.data) ? usersRes.data.length : 0);

        const posyanduRows = Array.isArray(posyanduRes?.data) ? posyanduRes.data : [];
        const puskesmasIds = posyanduRows
          .map((row) => row?.puskesmas_id || row?.puskesmas?.id)
          .filter(Boolean)
          .map(String);

        setRegistryStats({
          posyandu: Number(posyanduRes?.pagination?.total_items ?? posyanduRows.length),
          puskesmas: new Set(puskesmasIds).size,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setPendingAccountCount(0);
        setRegistryStats({ posyandu: 0, puskesmas: 0 });
      });

    return () => {
      cancelled = true;
    };
  }, [user?.roleType]);

  useEffect(() => {
    let cancelled = false;
    pemeriksaanService
      .getMonthlyStatistics()
      .then((response) => {
        if (cancelled) return;
        const rows = response?.data?.monthly;
        setMonthlyExaminations(Array.isArray(rows) ? rows : []);
        setMonthlyStatsError(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil statistik pemeriksaan agregat dari backend:", error);
        if (cancelled) return;
        setMonthlyExaminations([]);
        setMonthlyStatsError(true);
      })
      .finally(() => {
        if (!cancelled) setMonthlyStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamic calculations based only on backend data.
  const totalSasaranKota = Number(globalStatistikSasaran?.total_warga || 0);
  const totalPosyanduKota = registryStats.posyandu;
  const totalPuskesmasKota = registryStats.puskesmas;

  // Aggregate the real examination records returned by the backend.
  const cityChartData = useMemo(() => {
    const now = new Date();
    const points = [];
    const monthlyCounts = new Map(monthlyExaminations.map((item) => [item.month, Number(item.count) || 0]));
    const countForMonth = (date) => {
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthlyCounts.get(month) || 0;
    };

    if (periodeGrafik === "6bulan") {
      for (let offset = 5; offset >= 0; offset -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const count = countForMonth(d);
        points.push({
          periode: d.toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
        });
      }
    } else {
      const year = Number(periodeGrafik);
      for (let month = 0; month < 12; month += 1) {
        const count = countForMonth(new Date(year, month, 1));
        points.push({
          periode: new Date(year, month, 1).toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
        });
      }
    }
    return points;
  }, [periodeGrafik, monthlyExaminations]);

  const availableYears = useMemo(() => [...new Set(monthlyExaminations.map((item) => item.month.slice(0, 4)))].sort((a, b) => Number(b) - Number(a)), [monthlyExaminations]);

  const chartDataConfig = useMemo(() => {
    return {
      labels: cityChartData.map(d => d.periode),
      datasets: [
        {
          fill: true,
          label: 'Pemeriksaan',
          data: cityChartData.map(d => d.pemeriksaan),
          borderColor: themeColor,
          backgroundColor: `${themeColor}33`,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: themeColor,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  }, [cityChartData, themeColor]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Pemeriksaan: ${context.parsed.y.toLocaleString("id-ID")}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
      x: { grid: { display: false } }
    },
    interaction: { mode: 'index', intersect: false }
  };

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* ========================================================================= */}
      {/* 1. RINGKASAN EKSEKUTIF UTAMA KOTA (4 Top Metric Cards)                    */}
      {/* ========================================================================= */}
      <div className="row g-3 g-xl-3.5">
        {/* Card 1: Puskesmas dengan data sasaran */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: themeColor, cursor: "pointer" }} onClick={() => onNavigate("verifikasi-akun", "puskesmas")}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                PUSKESMAS PADA DIREKTORI POSYANDU
              </span>
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(30, 58, 138, 0.1)", color: themeColor, width: "42px", height: "42px" }}>
                <Building2 size={20} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span className="fw-bolder text-dark fs-3 mb-0">{totalPuskesmasKota}</span>
              <span className="text-muted fw-medium small">Puskesmas</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
              Puskesmas dengan Data Sasaran
            </div>
          </div>
        </div>

        {/* Card 2: Jumlah Posyandu Se-Kota */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#0284c7", cursor: "pointer" }} onClick={() => onNavigate("jadwal-monitoring")}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                TOTAL POSYANDU
              </span>
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(2, 132, 199, 0.1)", color: "#0284c7", width: "42px", height: "42px" }}>
                <Layers size={20} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span className="fw-bolder text-dark fs-3 mb-0">{totalPosyanduKota}</span>
              <span className="text-muted fw-medium small">Posyandu</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
              Posyandu Terdaftar
            </div>
          </div>
        </div>

        {/* Card 3: Verifikasi Manajemen Akun (Hanya Admin & SA) atau Rekapitulasi Pelaporan (Untuk Staf) */}
        {user?.roleType === "dinkes-admin" || user?.roleType === "sa" ? (
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#f59e0b", cursor: "pointer" }} onClick={() => onNavigate("verifikasi-akun", "puskesmas")}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                  VERIFIKASI MANAJEMEN AKUN
                </span>
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", width: "42px", height: "42px" }}>
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <span className="fw-bolder text-warning-emphasis fs-3 mb-0">{pendingAccountCount}</span>
                <span className="text-muted fw-medium small">Pengajuan Baru</span>
              </div>
              <div className="text-muted small mt-1 d-flex align-items-center gap-1.5" style={{ fontSize: "0.78rem" }}>
                <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-0.5 fw-semibold">Perlu Otorisasi</span>
                <span>Dari pengajuan pendaftaran terbaru</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#8b5cf6", cursor: "pointer" }} onClick={() => onNavigate("laporan-ekspor")}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                  REKAPITULASI PELAPORAN
                </span>
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6", width: "42px", height: "42px" }}>
                  <FileSpreadsheet size={20} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <span className="fw-bolder text-dark fs-3 mb-0">Unduh</span>
                <span className="text-muted fw-medium small">Data</span>
              </div>
              <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
                Format agregat bulanan Excel
              </div>
            </div>
          </div>
        )}

        {/* Card 4: Total Sasaran Se-Kota */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#10b981", cursor: "pointer" }} onClick={() => onNavigate("data-sasaran")}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                TOTAL SASARAN KOTA
              </span>
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", width: "42px", height: "42px" }}>
                <Users size={20} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span className="fw-bolder text-dark fs-3 mb-0">{isGlobalStatistikLoading ? "..." : totalSasaranKota.toLocaleString("id-ID")}</span>
              <span className="text-muted fw-medium small">Jiwa</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
              9 Kategori Siklus Hidup ILP
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL-WIDTH MODERN CURVED SPLINE AREA CHART                             */}
      {/* ========================================================================= */}
      <div className="card border-0 bg-white shadow-sm rounded-4 p-4">
        {/* Header Grafik */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <TrendingUp size={20} style={{ color: themeColor }} />
              <span>Grafik Pemantauan &amp; Perkembangan Layanan Kesehatan Se-Kota</span>
            </h5>
            <p className="text-muted small mb-0" style={{ fontSize: "0.825rem" }}>
              Grafik menampilkan jumlah rekaman pemeriksaan per bulan dari seluruh wilayah.
            </p>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            {/* Legend */}
            <div className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
              <span className="d-inline-block rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: themeColor }}></span>
              <span className="text-dark fw-semibold small" style={{ fontSize: "0.78rem" }}>
                Rekaman Pemeriksaan
              </span>
            </div>

            {/* Filter Periode */}
            <div className="d-flex align-items-center gap-2">
              <Calendar size={16} className="text-muted" />
              <select
                className="form-select form-select-sm bg-light text-dark fw-semibold rounded-3 border-0 shadow-none"
                value={periodeGrafik}
                onChange={(e) => setPeriodeGrafik(e.target.value)}
                style={{ fontSize: "0.825rem", minWidth: "150px", height: "36px" }}
              >
                <option value="6bulan">6 Bulan Terakhir</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    Tahun {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="position-relative w-100 overflow-hidden" style={{ height: "300px", marginTop: "1rem" }}>
          {cityChartData.length > 0 ? (
            <Line data={chartDataConfig} options={chartOptions} />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Tidak ada data pemeriksaan
            </div>
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 pt-3 border-top mt-2">
          <div className="text-muted small" style={{ fontSize: "0.825rem" }}>
            <span>
              {monthlyStatsLoading
                ? "Memuat grafik data pemeriksaan..."
                : monthlyStatsError
                  ? "Statistik agregat tidak dapat dimuat. Silakan muat ulang halaman."
                  : monthlyExaminations.length === 0
                    ? "Belum ada data pemeriksaan yang tercatat pada sistem."
                    : "Sumber data: rekapitulasi data pemeriksaan layanan terpadu."}
            </span>
          </div>
          <button
            className="btn btn-sm btn-light border text-dark fw-bold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 align-self-start align-self-sm-auto shadow-none"
            onClick={() => onNavigate("laporan-ekspor")}
            style={{ fontSize: "0.785rem" }}
          >
            <Download size={14} />
            <span>Unduh Rekapitulasi (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
