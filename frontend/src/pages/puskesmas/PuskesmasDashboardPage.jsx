<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { Building2, Users, TrendingUp, Calendar, Download, ChevronRight, ArrowUpRight, Activity, CheckCircle2, FileSpreadsheet } from "lucide-react";

export default function PuskesmasDashboardPage({ onNavigate, globalSasaranList = [], globalPemeriksaanData = {}, globalJadwalList = [], globalStatistikSasaran = {}, globalPosyanduList = [], globalRujukanList = [] }) {
  // Filter Periode Grafik ('6bulan', '2026', '2025')
  const [periodeGrafik, setPeriodeGrafik] = useState("6bulan");
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Dynamic totals from Posyandu data
  // Gunakan agregasi backend agar dashboard tidak terpotong limit daftar warga (100/page).
  const totalSasaranCount = Number(globalStatistikSasaran?.total_warga ?? globalSasaranList?.length ?? 0);
  const examinationRecords = useMemo(() => {
    const recordsById = new Map();
    Object.values(globalPemeriksaanData || {}).forEach((record) => {
      if (record?.id && record?.tanggal) recordsById.set(String(record.id), record);
    });
    return [...recordsById.values()];
  }, [globalPemeriksaanData]);
  const examinedCount = useMemo(() => {
    if (!globalSasaranList || globalSasaranList.length === 0) return 0;
    return globalSasaranList.filter((s) => s.statusPemeriksaan === "Sudah" || s.status === "Sudah" || !!globalPemeriksaanData?.[s.id] || !!globalPemeriksaanData?.[String(s.id)]).length;
  }, [globalSasaranList, globalPemeriksaanData]);

  const rujukanCount = Array.isArray(globalRujukanList) ? globalRujukanList.length : 0;

  const totalPosyanduCount = Array.isArray(globalPosyanduList) ? globalPosyanduList.length : 0;

  const totalJadwalCount = globalJadwalList ? globalJadwalList.length : 0;

  // Aggregate the real examination records returned by the backend.
  const chartData = useMemo(() => {
    const now = new Date();
    const countForMonth = (year, month) =>
      examinationRecords.filter((item) => {
        const [recordYear, recordMonth] = String(item.tanggal).slice(0, 10).split("-").map(Number);
        return recordYear === year && recordMonth === month + 1;
      }).length;

    const points = [];
    if (periodeGrafik === "6bulan") {
      for (let offset = 5; offset >= 0; offset -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const count = countForMonth(d.getFullYear(), d.getMonth());
        points.push({
          periode: d.toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
        });
      }
    } else {
      const year = Number(periodeGrafik);
      for (let month = 0; month < 12; month += 1) {
        const count = countForMonth(year, month);
        points.push({
          periode: new Date(year, month, 1).toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
        });
      }
    }
    return points;
  }, [examinationRecords, periodeGrafik]);

  const availableYears = useMemo(
    () =>
      [
        ...new Set(
          examinationRecords
            .map((item) => String(item?.tanggal || "").slice(0, 4))
            .filter((year) => /^\d{4}$/.test(year)),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [examinationRecords],
  );

  // Scaler calculation for SVG Chart
  const maxPemeriksaan = Math.max(1, ...chartData.map((d) => d.pemeriksaan));
=======
import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Calendar, 
  Download, 
  ChevronRight, 
  ArrowUpRight,
  Activity,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  STANDAR_KATEGORI, 
  trenPemeriksaanDanKunjungan 
} from '../../data/mockData';

export default function PuskesmasDashboardPage({ 
  onNavigate,
  globalSasaranList = [],
  globalPemeriksaanData = {},
  globalJadwalList = []
}) {
  // Filter Periode Grafik ('6bulan', '2026', '2025')
  const [periodeGrafik, setPeriodeGrafik] = useState('6bulan');
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Dynamic totals from Posyandu data
  const totalSasaranCount = globalSasaranList ? globalSasaranList.length : 0;
  const examinedCount = useMemo(() => {
    if (!globalSasaranList || globalSasaranList.length === 0) return 0;
    return globalSasaranList.filter(s => 
      s.statusPemeriksaan === 'Sudah' || 
      s.status === 'Sudah' || 
      !!globalPemeriksaanData?.[s.id] || 
      !!globalPemeriksaanData?.[String(s.id)]
    ).length;
  }, [globalSasaranList, globalPemeriksaanData]);

  const rujukanCount = useMemo(() => {
    let count = 0;
    if (globalSasaranList && globalSasaranList.length > 0) {
      const dynamicRujuk = globalSasaranList.filter(s => {
        const exam = globalPemeriksaanData?.[s.id] || globalPemeriksaanData?.[String(s.id)];
        const l5 = exam?.langkah5;
        return (l5 && (l5.statusRujukan === 'Rujuk ke Puskesmas / Pustu' || (typeof l5.statusRujukan === 'string' && l5.statusRujukan.toLowerCase().includes('rujuk')))) ||
               (s.statusRujukan && s.statusRujukan.toLowerCase().includes('rujuk'));
      }).length;
      count += dynamicRujuk;
    }
    return count;
  }, [globalSasaranList, globalPemeriksaanData]);

  const totalPosyanduCount = useMemo(() => {
    const fromSasaran = (globalSasaranList || []).map(s => s.posyandu).filter(Boolean);
    const fromJadwal = (globalJadwalList || []).map(j => j.posyandu || j.namaPosyandu).filter(Boolean);
    const unique = new Set([...fromSasaran, ...fromJadwal]);
    return unique.size;
  }, [globalSasaranList, globalJadwalList]);

  const totalJadwalCount = globalJadwalList ? globalJadwalList.length : 0;

  // Active chart data
  const chartData = useMemo(() => {
    if (totalSasaranCount === 0 && examinedCount === 0) {
      const base = trenPemeriksaanDanKunjungan[periodeGrafik] || trenPemeriksaanDanKunjungan['6bulan'];
      return base.map(item => ({
        periode: item.periode,
        pemeriksaan: 0,
        kunjungan: 0
      }));
    }
    return trenPemeriksaanDanKunjungan[periodeGrafik] || trenPemeriksaanDanKunjungan['6bulan'];
  }, [periodeGrafik, totalSasaranCount, examinedCount]);

  // Scaler calculation for SVG Chart
  const maxPemeriksaan = 350;
  const maxKunjungan = 15;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const plotWidth = chartWidth - paddingX * 2;
  const stepX = chartData.length > 1 ? plotWidth / (chartData.length - 1) : plotWidth;

<<<<<<< HEAD
  // 9 Kategori Siklus Hidup Distribution Data dynamically calculated from Posyandu sasaran
  const kategoriDistribution = useMemo(() => {
    const total = Number(globalStatistikSasaran?.total_warga ?? globalSasaranList?.length ?? 0);
    const stats = globalStatistikSasaran || {};
    const rawCats = [
      { nama: "Bumil", key: "bumil", warna: "#e91e63" },
      { nama: "Nifas/Menyusui", key: "busui", warna: "#9c27b0" },
      { nama: "Bayi 0–11 Bln", key: "bayi", warna: "#00bcd4" },
      { nama: "Balita 12–59 Bln", key: "balita", warna: "#4caf50" },
      { nama: "Apras 60–72 Bln", key: "apras", warna: "#ff9800" },
      { nama: "Usekrem 6–14 Thn", key: "uskrem_6_14", warna: "#3f51b5" },
      { nama: "Usekrem 15–18 Thn", key: "uskrem_15_18", warna: "#009688" },
      { nama: "Dewasa", key: "dewasa", warna: "#607d8b" },
      { nama: "Lansia", key: "lansia", warna: "#795548" },
    ].map((c) => ({ ...c, count: Number(stats[c.key] || 0) }));

    return rawCats.map((c) => ({
      nama: c.nama,
      sasaran: c.count,
      persen: total > 0 ? `${((c.count / total) * 100).toFixed(1)}%` : "0%",
      warna: c.warna,
    }));
  }, [globalSasaranList, globalStatistikSasaran]);
=======
  // Generate line path coordinates for Kunjungan Posyandu
  const linePoints = chartData.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = chartHeight - (d.kunjungan / maxKunjungan) * (chartHeight - 30) - 15;
    return { x, y, ...d };
  });

  const linePathD = linePoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // 9 Kategori Siklus Hidup Distribution Data dynamically calculated from Posyandu sasaran
  const kategoriDistribution = useMemo(() => {
    const list = globalSasaranList || [];
    const total = list.length;
    const countBy = (patterns) => list.filter(s => {
      const kat = (s.kategori || '').toLowerCase();
      const sub = (s.subKategori || '').toLowerCase();
      return patterns.some(p => kat.includes(p) || sub.includes(p));
    }).length;

    const rawCats = [
      { nama: 'Bumil', count: countBy(['bumil']), warna: '#e91e63' },
      { nama: 'Nifas/Menyusui', count: countBy(['nifas']), warna: '#9c27b0' },
      { nama: 'Bayi 0–11 Bln', count: countBy(['bayi']), warna: '#00bcd4' },
      { nama: 'Balita 12–59 Bln', count: countBy(['balita']), warna: '#4caf50' },
      { nama: 'Apras 60–72 Bln', count: countBy(['apras']), warna: '#ff9800' },
      { nama: 'Usekrem 6–14 Thn', count: countBy(['6-14', '6–14']), warna: '#3f51b5' },
      { nama: 'Usekrem 15–18 Thn', count: countBy(['15-18', '15–18']), warna: '#009688' },
      { nama: 'Dewasa', count: countBy(['dewasa']), warna: '#607d8b' },
      { nama: 'Lansia', count: countBy(['lansia']), warna: '#795548' }
    ];

    return rawCats.map(c => ({
      nama: c.nama,
      sasaran: c.count,
      persen: total > 0 ? `${((c.count / total) * 100).toFixed(1)}%` : '0%',
      warna: c.warna
    }));
  }, [globalSasaranList]);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* ========================================================================= */}
      {/* 1. CARD BAGIAN ATAS (Ringkasan Data Utama Puskesmas)                      */}
      {/* ========================================================================= */}
      <div className="row g-3 g-xl-3.5">
        {/* Card 1: Total Posyandu */}
        <div className="col-12 col-sm-6 col-xl-3">
<<<<<<< HEAD
          <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#428A75", cursor: "pointer" }} onClick={() => onNavigate("jadwal")}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                TOTAL POSYANDU
              </span>
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(66, 138, 117, 0.12)", color: "#428A75", width: "42px", height: "42px" }}>
=======
          <div 
            className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" 
            style={{ borderLeftColor: '#428A75', cursor: 'pointer' }}
            onClick={() => onNavigate('jadwal')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.725rem' }}>
                TOTAL POSYANDU
              </span>
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: 'rgba(66, 138, 117, 0.12)', color: '#428A75', width: '42px', height: '42px' }}
              >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                <Building2 size={20} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span className="fw-bolder text-dark fs-2 mb-0">{totalPosyanduCount}</span>
              <span className="text-muted fw-medium small">Posyandu</span>
            </div>
<<<<<<< HEAD
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
=======
            <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              Wilayah Binaan Puskesmas
            </div>
          </div>
        </div>

        {/* Card 2: Total Sasaran */}
        <div className="col-12 col-sm-6 col-xl-3">
<<<<<<< HEAD
          <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#2E4E52", cursor: "pointer" }} onClick={() => onNavigate("data-sasaran")}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                TOTAL SASARAN
              </span>
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(46, 78, 82, 0.12)", color: "#2E4E52", width: "42px", height: "42px" }}>
=======
          <div 
            className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" 
            style={{ borderLeftColor: '#2E4E52', cursor: 'pointer' }}
            onClick={() => onNavigate('data-sasaran')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.725rem' }}>
                TOTAL SASARAN
              </span>
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: 'rgba(46, 78, 82, 0.12)', color: '#2E4E52', width: '42px', height: '42px' }}
              >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                <Users size={20} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
<<<<<<< HEAD
              <span className="fw-bolder text-dark fs-2 mb-0">{totalSasaranCount.toLocaleString("id-ID")}</span>
              <span className="text-muted fw-medium small">Sasaran</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
=======
              <span className="fw-bolder text-dark fs-2 mb-0">{totalSasaranCount.toLocaleString('id-ID')}</span>
              <span className="text-muted fw-medium small">Sasaran</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              Terdata di 9 Siklus Hidup ILP
            </div>
          </div>
        </div>

        {/* Card 3: Jadwal Posyandu */}
        <div className="col-12 col-sm-6 col-xl-3">
<<<<<<< HEAD
          <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#428A75", cursor: "pointer" }} onClick={() => onNavigate("jadwal")}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                JADWAL POSYANDU
              </span>
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(66, 138, 117, 0.12)", color: "#428A75", width: "42px", height: "42px" }}>
=======
          <div 
            className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" 
            style={{ borderLeftColor: '#428A75', cursor: 'pointer' }}
            onClick={() => onNavigate('jadwal')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.725rem' }}>
                JADWAL POSYANDU
              </span>
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: 'rgba(66, 138, 117, 0.12)', color: '#428A75', width: '42px', height: '42px' }}
              >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                <Calendar size={20} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span className="fw-bolder text-dark fs-2 mb-0">{totalJadwalCount}</span>
              <span className="text-muted fw-medium small">Sesi Posyandu</span>
            </div>
<<<<<<< HEAD
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
=======
            <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              Wilayah Kerja: {totalPosyanduCount} Posyandu
            </div>
          </div>
        </div>

        {/* Card 4: Pemantauan Rujukan */}
        <div className="col-12 col-sm-6 col-xl-3">
<<<<<<< HEAD
          <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#e11d48", cursor: "pointer" }} onClick={() => onNavigate("pemantauan-rujukan")}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.725rem" }}>
                RUJUKAN AKTIF
              </span>
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(225, 29, 72, 0.12)", color: "#e11d48", width: "42px", height: "42px" }}>
=======
          <div 
            className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" 
            style={{ borderLeftColor: '#e11d48', cursor: 'pointer' }}
            onClick={() => onNavigate('pemantauan-rujukan')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.725rem' }}>
                RUJUKAN AKTIF
              </span>
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: 'rgba(225, 29, 72, 0.12)', color: '#e11d48', width: '42px', height: '42px' }}
              >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                <ChevronRight size={20} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span className="fw-bolder text-danger fs-2 mb-0">{rujukanCount}</span>
              <span className="text-muted fw-medium small">Kasus</span>
            </div>
<<<<<<< HEAD
            <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
=======
            <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              Memerlukan respon medis faskes
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
<<<<<<< HEAD
      {/* 2. GRAFIK TREN PEMERIKSAAN POSYANDU                                    */}
=======
      {/* 2. GRAFIK TREN PEMERIKSAAN & KUNJUNGAN POSYANDU (Bar + Line)              */}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      {/* ========================================================================= */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-4">
        {/* Header Grafik */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
<<<<<<< HEAD
              <TrendingUp size={20} style={{ color: "#428A75" }} />
              <span>Grafik Tren Pemeriksaan</span>
            </h5>
            <p className="text-muted small mb-0" style={{ fontSize: "0.825rem" }}>
              Jumlah rekaman pemeriksaan per bulan pada wilayah kerja Puskesmas.
=======
              <TrendingUp size={20} style={{ color: '#428A75' }} />
              <span>Grafik Tren Pemeriksaan &amp; Kunjungan</span>
            </h5>
            <p className="text-muted small mb-0" style={{ fontSize: '0.825rem' }}>
              Tren jumlah sasaran diperiksa dan frekuensi kunjungan Posyandu per bulan.
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3">
            {/* Legend Keterangan */}
<<<<<<< HEAD
              <div className="d-flex align-items-center gap-3 small">
              <div className="d-flex align-items-center gap-1.5">
                <span className="d-inline-block rounded-1" style={{ width: "14px", height: "14px", backgroundColor: "#428A75" }} />
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Rekaman Pemeriksaan
                </span>
=======
            <div className="d-flex align-items-center gap-3 small">
              <div className="d-flex align-items-center gap-1.5">
                <span 
                  className="d-inline-block rounded-1" 
                  style={{ width: '14px', height: '14px', backgroundColor: '#428A75' }} 
                />
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Pemeriksaan Sasaran</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <span 
                  className="d-inline-block rounded-circle" 
                  style={{ width: '12px', height: '12px', backgroundColor: '#FE6D01' }} 
                />
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Kunjungan Posyandu</span>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              </div>
            </div>

            {/* Filter Periode Dropdown */}
            <div className="d-flex align-items-center gap-2">
              <Calendar size={16} className="text-muted" />
<<<<<<< HEAD
              <select className="form-select form-select-sm bg-light text-dark fw-semibold rounded-3 border" value={periodeGrafik} onChange={(e) => setPeriodeGrafik(e.target.value)} style={{ fontSize: "0.825rem", minWidth: "150px" }}>
                <option value="6bulan">6 Bulan Terakhir</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    Tahun {year}
                  </option>
                ))}
=======
              <select 
                className="form-select form-select-sm bg-light text-dark fw-semibold rounded-3 border"
                value={periodeGrafik}
                onChange={(e) => setPeriodeGrafik(e.target.value)}
                style={{ fontSize: '0.825rem', minWidth: '150px' }}
              >
                <option value="6bulan">6 Bulan Terakhir</option>
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              </select>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Body Grafik */}
        <div className="position-relative w-100 overflow-hidden" style={{ minHeight: "260px" }}>
          {/* Y-Axis Gridlines & Reference Values */}
          <div className="position-absolute start-0 end-0 top-0 bottom-0 d-flex flex-column justify-content-between pe-2" style={{ pointerEvents: "none", height: `${chartHeight}px` }}>
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
              const val = Math.round(maxPemeriksaan * ratio);
              return (
                <div key={val} className="d-flex align-items-center w-100">
                  <span className="text-muted text-end pe-2" style={{ width: "40px", fontSize: "0.725rem" }}>
                    {val}
                  </span>
                  <div className="flex-grow-1 border-top border-light-subtle" style={{ borderStyle: "dashed" }} />
                </div>
              );
            })}
          </div>

          {/* SVG bar chart */}
          <div className="position-relative" style={{ height: `${chartHeight + 35}px`, marginLeft: "45px", marginRight: "20px" }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} className="w-100 h-100" style={{ overflow: "visible" }}>
=======
        {/* Body Grafik (Kombinasi SVG Bar + Curved Line Responsive) */}
        <div className="position-relative w-100 overflow-hidden" style={{ minHeight: '260px' }}>
          {/* Y-Axis Gridlines & Reference Values */}
          <div className="position-absolute start-0 end-0 top-0 bottom-0 d-flex flex-column justify-content-between pe-2" style={{ pointerEvents: 'none', height: `${chartHeight}px` }}>
            {[300, 225, 150, 75, 0].map((val) => (
              <div key={val} className="d-flex align-items-center w-100">
                <span className="text-muted text-end pe-2" style={{ width: '40px', fontSize: '0.725rem' }}>{val}</span>
                <div className="flex-grow-1 border-top border-light-subtle" style={{ borderStyle: 'dashed' }} />
              </div>
            ))}
          </div>

          {/* SVG Canvas overlaying Bars and Line */}
          <div className="position-relative" style={{ height: `${chartHeight + 35}px`, marginLeft: '45px', marginRight: '20px' }}>
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} 
              className="w-100 h-100" 
              style={{ overflow: 'visible' }}
            >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              <defs>
                <linearGradient id="barGradientPuskesmas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#428A75" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#428A75" stopOpacity="0.65" />
                </linearGradient>
<<<<<<< HEAD
=======
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FE6D01" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              </defs>

              {/* 1. Bar Columns (Pemeriksaan Sasaran) */}
              {chartData.map((d, i) => {
                const xCenter = paddingX + i * stepX;
                const barWidth = Math.min(36, Math.max(18, plotWidth / (chartData.length * 2)));
                const barH = (d.pemeriksaan / maxPemeriksaan) * (chartHeight - 30);
                const barY = chartHeight - barH - 10;
                const isHovered = activeTooltip?.index === i;

                return (
<<<<<<< HEAD
                  <g key={`bar-${i}`} onMouseEnter={() => setActiveTooltip({ index: i, ...d })} onMouseLeave={() => setActiveTooltip(null)} style={{ cursor: "pointer" }}>
                    {/* Hover highlight background pillar */}
                    <rect x={xCenter - barWidth} y={5} width={barWidth * 2} height={chartHeight - 10} fill={isHovered ? "rgba(66, 138, 117, 0.1)" : "transparent"} rx="6" />

                    {/* Actual Bar */}
                    <rect x={xCenter - barWidth / 2} y={barY} width={barWidth} height={barH} fill="url(#barGradientPuskesmas)" rx="5" opacity={isHovered ? 1 : 0.88} style={{ transition: "all 0.2s ease" }} />

                    {/* X-Axis Label */}
                    <text x={xCenter} y={chartHeight + 18} textAnchor="middle" fill="#64748b" fontSize="11.5" fontWeight={isHovered ? "bold" : "normal"}>
=======
                  <g 
                    key={`bar-${i}`} 
                    onMouseEnter={() => setActiveTooltip({ index: i, ...d })}
                    onMouseLeave={() => setActiveTooltip(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover highlight background pillar */}
                    <rect 
                      x={xCenter - barWidth} 
                      y={5} 
                      width={barWidth * 2} 
                      height={chartHeight - 10} 
                      fill={isHovered ? 'rgba(66, 138, 117, 0.1)' : 'transparent'} 
                      rx="6"
                    />

                    {/* Actual Bar */}
                    <rect 
                      x={xCenter - barWidth / 2} 
                      y={barY} 
                      width={barWidth} 
                      height={barH} 
                      fill="url(#barGradientPuskesmas)" 
                      rx="5"
                      opacity={isHovered ? 1 : 0.88}
                      style={{ transition: 'all 0.2s ease' }}
                    />

                    {/* X-Axis Label */}
                    <text 
                      x={xCenter} 
                      y={chartHeight + 18} 
                      textAnchor="middle" 
                      fill="#64748b" 
                      fontSize="11.5" 
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      {d.periode}
                    </text>
                  </g>
                );
              })}

<<<<<<< HEAD
=======
              {/* 2. Line Chart (Kunjungan Posyandu) */}
              <path 
                d={linePathD} 
                fill="none" 
                stroke="url(#lineGlow)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* 3. Line Points & Data Circles */}
              {linePoints.map((pt, i) => {
                const isHovered = activeTooltip?.index === i;
                return (
                  <g key={`pt-${i}`} style={{ pointerEvents: 'none' }}>
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={isHovered ? "7" : "5"} 
                      fill="#ffffff" 
                      stroke="#FE6D01" 
                      strokeWidth="3" 
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  </g>
                );
              })}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            </svg>

            {/* Interactive Tooltip Card */}
            {activeTooltip && (
<<<<<<< HEAD
              <div
                className="position-absolute bg-white border rounded-3 p-2.5 shadow-sm text-dark"
                style={{
                  left: `${(activeTooltip.index / (chartData.length - 1)) * 80 + 10}%`,
                  top: "15px",
                  fontSize: "0.785rem",
                  zIndex: 10,
                  pointerEvents: "none",
                  minWidth: "160px",
                }}
              >
                <div className="fw-bold border-bottom pb-1 mb-1 text-dark">Periode: {activeTooltip.periode}</div>
                <div className="d-flex align-items-center justify-content-between gap-2 text-muted">
                  <span>Pemeriksaan:</span>
                  <strong className="text-dark" style={{ color: "#428A75" }}>
                    {activeTooltip.pemeriksaan} Sasaran
                  </strong>
=======
              <div 
                className="position-absolute bg-white border rounded-3 p-2.5 shadow-sm text-dark"
                style={{ 
                  left: `${(activeTooltip.index / (chartData.length - 1)) * 80 + 10}%`, 
                  top: '15px', 
                  fontSize: '0.785rem',
                  zIndex: 10,
                  pointerEvents: 'none',
                  minWidth: '160px'
                }}
              >
                <div className="fw-bold border-bottom pb-1 mb-1 text-dark">
                  Periode: {activeTooltip.periode}
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2 text-muted">
                  <span>Pemeriksaan:</span>
                  <strong className="text-dark" style={{ color: '#428A75' }}>{activeTooltip.pemeriksaan} Sasaran</strong>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2 text-muted">
                  <span>Kunjungan:</span>
                  <strong style={{ color: '#FE6D01' }}>{activeTooltip.kunjungan} Posyandu</strong>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Summary Insight */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 pt-3 border-top mt-2">
<<<<<<< HEAD
          <div className="text-muted small" style={{ fontSize: "0.8rem" }}>
            Tren dihitung dari rekaman pemeriksaan yang tersimpan pada backend.
          </div>
          <button
            className="btn btn-sm btn-light border text-dark fw-bold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 align-self-start align-self-sm-auto"
            onClick={() => onNavigate("laporan-ekspor")}
            style={{ fontSize: "0.785rem" }}
=======
          <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
            💡 Tren pemeriksaan sasaran dan kunjungan posyandu dipantau secara berkala setiap bulan.
          </div>
          <button 
            className="btn btn-sm btn-light border text-dark fw-bold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 align-self-start align-self-sm-auto"
            onClick={() => onNavigate('laporan-ekspor')}
            style={{ fontSize: '0.785rem' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          >
            <Download size={14} />
            <span>Unduh Rekapitulasi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
