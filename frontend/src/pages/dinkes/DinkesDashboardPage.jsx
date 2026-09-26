import React, { useEffect, useState, useMemo } from "react";
import { userService, posyanduService } from "../../services";
import { Building2, Users, Layers, Calendar, FileSpreadsheet, UserCheck, ChevronRight, TrendingUp, Download, Activity } from "lucide-react";

export default function DinkesDashboardPage({ onNavigate, user, globalSasaranList = [], globalPemeriksaanData = {} }) {
  const themeColor = "#1e3a8a";
  const [periodeGrafik, setPeriodeGrafik] = useState("6bulan");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [pendingAccountCount, setPendingAccountCount] = useState(0);
  const [registryStats, setRegistryStats] = useState({ posyandu: 0, puskesmas: 0 });

  useEffect(() => {
    let cancelled = false;
    Promise.all([userService.getAllUsers({ status: "pending_approval" }), posyanduService.getAllPosyandu()])
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
  }, []);

  // Dynamic calculations based only on backend data.
  const totalSasaranKota = globalSasaranList ? globalSasaranList.length : 0;
  const totalPosyanduKota = registryStats.posyandu;
  const totalPuskesmasKota = registryStats.puskesmas;

  // Real-time calculation of examined citizens
  const totalExaminedKota = useMemo(() => {
    const examined = (globalSasaranList || []).filter((s) => s.statusPemeriksaan === "Sudah" || s.status === "Sudah" || !!globalPemeriksaanData?.[s.id] || !!globalPemeriksaanData?.[String(s.id)]).length;
    return examined;
  }, [globalSasaranList, globalPemeriksaanData]);

  // Aggregate the real examination records returned by the backend.
  const cityChartData = useMemo(() => {
    const rawRecords = Object.values(globalPemeriksaanData || {}).filter((item) => item && typeof item === "object" && item.tanggal);
    const records = Array.from(new Map(rawRecords.map((item) => [String(item.id ?? `${item.tanggal}-${item.kunjungan?.warga_id ?? ""}`), item])).values());
    const now = new Date();
    const points = [];
    const countForMonth = (year, month) =>
      records.filter((item) => {
        const d = new Date(item.tanggal);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;

    if (periodeGrafik === "6bulan") {
      for (let offset = 5; offset >= 0; offset -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const count = countForMonth(d.getFullYear(), d.getMonth());
        points.push({
          periode: d.toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
          kunjungan: count,
        });
      }
    } else {
      const year = Number(periodeGrafik);
      for (let month = 0; month < 12; month += 1) {
        const count = countForMonth(year, month);
        points.push({
          periode: new Date(year, month, 1).toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
          kunjungan: count,
        });
      }
    }
    return points;
  }, [globalPemeriksaanData, periodeGrafik]);

  const availableYears = useMemo(
    () =>
      [
        ...new Set(
          Object.values(globalPemeriksaanData || {})
            .map((item) => String(item?.tanggal || "").slice(0, 4))
            .filter((year) => /^\d{4}$/.test(year)),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [globalPemeriksaanData],
  );

  // SVG Scaler calculations for full-width curved spline area chart
  const maxVal = Math.max(1, ...cityChartData.map((d) => d.pemeriksaan));
  const chartHeight = 220;
  const chartWidth = 980;
  const paddingX = 50;
  const plotWidth = chartWidth - paddingX * 2;
  const stepX = cityChartData.length > 1 ? plotWidth / (cityChartData.length - 1) : plotWidth;

  // Calculate coordinates
  const points = useMemo(() => {
    return cityChartData.map((d, i) => {
      const x = paddingX + i * stepX;
      const y = chartHeight - (d.pemeriksaan / maxVal) * (chartHeight - 40) - 20;
      return { x, y, ...d };
    });
  }, [cityChartData, stepX]);

  // Smooth Catmull-Rom / Cubic Bezier curve algorithm
  const { linePathD, areaPathD } = useMemo(() => {
    if (points.length === 0) return { linePathD: "", areaPathD: "" };
    if (points.length === 1) {
      return {
        linePathD: `M ${points[0].x} ${points[0].y}`,
        areaPathD: `M ${points[0].x} ${points[0].y} L ${points[0].x} ${chartHeight} Z`,
      };
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const area = `${d} L ${last.x} ${chartHeight} L ${first.x} ${chartHeight} Z`;

    return { linePathD: d, areaPathD: area };
  }, [points]);

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
              <span className="fw-bolder text-dark fs-2 mb-0">{totalPuskesmasKota}</span>
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
              <span className="fw-bolder text-dark fs-2 mb-0">{totalPosyanduKota}</span>
              <span className="text-muted fw-medium small">Posyandu</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
              Posyandu Terdaftar
            </div>
          </div>
        </div>

        {/* Card 3: Verifikasi Manajemen Akun */}
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
              <span className="fw-bolder text-warning-emphasis fs-2 mb-0">{pendingAccountCount}</span>
              <span className="text-muted fw-medium small">Pengajuan Baru</span>
            </div>
            <div className="text-muted small mt-1 d-flex align-items-center gap-1.5" style={{ fontSize: "0.78rem" }}>
              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-0.5 fw-semibold">Perlu Otorisasi</span>
              <span>Data berasal dari akun pending di backend</span>
            </div>
          </div>
        </div>

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
              <span className="fw-bolder text-dark fs-2 mb-0">{totalSasaranKota.toLocaleString("id-ID")}</span>
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
              Statistik agregat pemeriksaan berkala dan tren pelayanan berdasarkan data yang tersedia pada backend.
            </p>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            {/* Legend */}
            <div className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
              <span className="d-inline-block rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: themeColor }}></span>
              <span className="text-dark fw-semibold small" style={{ fontSize: "0.78rem" }}>
                Skrining Warga (Spline Area)
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
        <div className="position-relative w-100 overflow-hidden" style={{ minHeight: "260px" }}>
          {/* Y-Axis Gridlines */}
          <div className="position-absolute start-0 end-0 top-0 bottom-0 d-flex flex-column justify-content-between pe-2" style={{ pointerEvents: "none", height: `${chartHeight}px` }}>
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
              const val = Math.round(maxVal * ratio);
              return (
                <div key={val} className="d-flex align-items-center w-100">
                  <span className="text-muted text-end pe-3 font-monospace" style={{ width: "55px", fontSize: "0.75rem" }}>
                    {val.toLocaleString("id-ID")}
                  </span>
                  <div className="flex-grow-1 border-top border-light-subtle" style={{ borderStyle: "dashed" }} />
                </div>
              );
            })}
          </div>

          {/* SVG Canvas */}
          <div className="position-relative" style={{ height: `${chartHeight + 35}px`, marginLeft: "60px", marginRight: "20px" }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} className="w-100 h-100" style={{ overflow: "visible" }}>
              <defs>
                {/* Modern Deep Gradient Area Fill */}
                <linearGradient id="dinkesWaveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                </linearGradient>
                {/* Glow Stroke Gradient */}
                <linearGradient id="dinkesStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {/* 1. Curved Area Wave */}
              <path d={areaPathD} fill="url(#dinkesWaveGradient)" />

              {/* 2. Smooth Spline Stroke */}
              <path d={linePathD} fill="none" stroke="url(#dinkesStrokeGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* 3. Interactive Data Points and Hover Pillars */}
              {points.map((pt, i) => {
                const isHovered = activeTooltip?.index === i;
                return (
                  <g key={`point-${i}`} onMouseEnter={() => setActiveTooltip({ index: i, ...pt })} onMouseLeave={() => setActiveTooltip(null)} style={{ cursor: "pointer" }}>
                    {/* Hover vertical dotted line */}
                    {isHovered && <line x1={pt.x} y1={pt.y} x2={pt.x} y2={chartHeight} stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="4 4" />}

                    {/* Transparent touch area */}
                    <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                    {/* Outer pulse halo */}
                    <circle cx={pt.x} cy={pt.y} r={isHovered ? "10" : "6"} fill="rgba(30, 58, 138, 0.15)" style={{ transition: "all 0.2s ease" }} />

                    {/* Inner core circle */}
                    <circle cx={pt.x} cy={pt.y} r={isHovered ? "6" : "4"} fill="#ffffff" stroke="#1e3a8a" strokeWidth="3" style={{ transition: "all 0.2s ease" }} />

                    {/* X-Axis Month Label */}
                    <text x={pt.x} y={chartHeight + 20} textAnchor="middle" fill={isHovered ? "#1e3a8a" : "#64748b"} fontSize="12" fontWeight={isHovered ? "bold" : "normal"}>
                      {pt.periode}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Popup */}
            {activeTooltip && (
              <div
                className="position-absolute bg-white border rounded-3 p-2.5 shadow text-dark"
                style={{
                  left: `${(activeTooltip.index / (cityChartData.length - 1)) * 80 + 8}%`,
                  top: "10px",
                  fontSize: "0.8rem",
                  zIndex: 10,
                  pointerEvents: "none",
                  minWidth: "170px",
                }}
              >
                <div className="fw-bold border-bottom pb-1 mb-1.5 text-dark">Periode: {activeTooltip.periode}</div>
                <div className="d-flex align-items-center justify-content-between gap-2 text-muted mb-0.5">
                  <span>Skrining:</span>
                  <strong className="text-dark" style={{ color: themeColor }}>
                    {activeTooltip.pemeriksaan.toLocaleString("id-ID")} Jiwa
                  </strong>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2 text-muted">
                  <span>Sesi Posyandu:</span>
                  <strong style={{ color: "#0284c7" }}>{activeTooltip.kunjungan} Sesi Aktif</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Summary Bar */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 pt-3 border-top mt-2">
          <div className="text-muted small" style={{ fontSize: "0.825rem" }}>
            💡 Total akumulasi skrining warga terverifikasi se-Kota mencapai <strong>{totalExaminedKota.toLocaleString("id-ID")} Jiwa</strong> (Capaian ILP Aktual).
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
