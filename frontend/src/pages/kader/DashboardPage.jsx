import React, { useMemo, useState } from "react";
import { Search, FileText, ChevronRight, Heart, UserPlus, Calendar, Clock, MapPin, Users } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Filler, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Filler, Legend, BarElement);

export default function DashboardPage({ onNavigate, globalSasaranList = [], globalPemeriksaanData = {}, globalJadwalList = [], user }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Build dashboard statistics from backend-synced warga, pemeriksaan, and sesi data.
  const kategoriDistribution = useMemo(() => {
    const categories = [
      ["bumil", "Bumil", "Ibu Hamil"],
      ["nifas", "Nifas/Menyusui", "Ibu Nifas & Menyusui"],
      ["bayi-0-11", "Bayi 0–11 Bln", "0 – 11 Bulan"],
      ["balita-12-59", "Balita 12–59 Bln", "12 – 59 Bulan"],
      ["apras-60-72", "Apras 60–72 Bln", "Pra-Sekolah"],
      ["usekrem-6-14", "Usekrem 6–14 Thn", "Usia Sekolah"],
      ["usekrem-15-18", "Usekrem 15–18 Thn", "Remaja"],
      ["dewasa", "Dewasa", "19 – 59 Thn"],
      ["lansia", "Lansia", "60+ Thn"],
    ];
    const colorPalette = ["#F25B8E", "#f43f5e", "#ec4899", "#d946ef", "#8b5cf6", "#6366f1", "#0ea5e9", "#10b981", "#64748b"];
    const list = globalSasaranList || [];
    return categories.map(([id, nama, sub], index) => {
      const members = list.filter(
        (item) =>
          item?.subKategori === id ||
          String(item?.kategori || "")
            .toLowerCase()
            .includes(nama.toLowerCase().split(" ")[0]),
      );
      const hadir = members.filter((item) => item.statusPemeriksaan === "Sudah" || globalPemeriksaanData?.[item.id] || globalPemeriksaanData?.[String(item.id)]).length;
      return { id, nama, hadir, total: members.length, color: colorPalette[index], sub };
    });
  }, [globalSasaranList, globalPemeriksaanData]);

  const todaySchedule = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (globalJadwalList || []).find((item) => item?.tanggal === today || String(item?.tanggal_pelaksanaan || "").slice(0, 10) === today);
  }, [globalJadwalList]);

  // Aggregated Statistics
  const totalSasaranAll = kategoriDistribution.reduce((acc, cur) => acc + cur.total, 0);
  const totalHadirAll = kategoriDistribution.reduce((acc, cur) => acc + cur.hadir, 0);
  const overallPercentage = Math.round((totalHadirAll / totalSasaranAll) * 100);
  const highestCategory = [...kategoriDistribution].sort((a, b) => {
    const ar = a.total ? a.hadir / a.total : 0;
    const br = b.total ? b.hadir / b.total : 0;
    return br - ar;
  })[0] || { nama: "-", hadir: 0, total: 0 };
  const maxBarValue = Math.max(1, ...kategoriDistribution.map((k) => k.total));

  const chartDataConfig = useMemo(() => {
    return {
      labels: kategoriDistribution.map(cat => cat.nama),
      datasets: [
        {
          label: 'Sasaran Hadir',
          data: kategoriDistribution.map(cat => cat.hadir),
          backgroundColor: '#F25B8E',
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.4,
        },
        {
          label: 'Target Sasaran',
          data: kategoriDistribution.map(cat => cat.total),
          backgroundColor: '#cbd5e1',
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.4,
        }
      ]
    };
  }, [kategoriDistribution]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y} Orang`
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
    <div className="d-flex flex-column gap-4">
      {/* 1. Hero Banner - Jadwal Posyandu Hari Ini */}
      <div
        className="card border-0 rounded-4 text-white overflow-hidden shadow-sm"
        style={{
          background: "linear-gradient(135deg, #831843 0%, #9d174d 45%, #be185d 100%)",
          padding: "1.6rem 2rem",
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div
              className="d-inline-flex align-items-center gap-1.5 fw-semibold px-3 py-1 rounded-pill mb-2"
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                color: "#ffffff",
                fontSize: "0.8rem",
              }}
            >
              <Calendar size={13} />
              <span>Jadwal Pelayanan Hari Ini</span>
            </div>
            <h3 className="fw-bold mb-1.5 text-white fs-4">{todaySchedule?.posyandu || user?.posyandu || "Jadwal Posyandu"}</h3>
            <p className="mb-0 small" style={{ maxWidth: "640px", fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.92)" }}>
              Pelayanan Posyandu dan pemantauan kesehatan siklus hidup ILP.
            </p>
          </div>

          <div>
            <button
              className="btn bg-white fw-bold px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
              style={{
                color: "#9d174d",
                fontSize: "0.88rem",
                whiteSpace: "nowrap",
                border: "none",
                transition: "all 0.2s ease",
              }}
              onClick={() => onNavigate("data-sasaran")}
            >
              <span>Input Sasaran Baru</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Aksi Cepat */}
      <div className="card card-custom p-4 bg-white border-0 shadow-sm rounded-4">
        <div className="mb-3">
          <h5 className="fw-bold text-dark mb-1">Aksi Cepat</h5>
          <p className="text-muted small mb-0">Akses langsung ke menu pelayanan dan pencatatan posyandu.</p>
        </div>

        <div className="row g-3">
          {/* Card 1: Input Sasaran */}
          <div className="col-6 col-lg-3">
            <div
              className="p-3 border rounded-3 bg-white hover-shadow transition-all d-flex flex-column align-items-center text-center h-100 shadow-xs"
              style={{
                cursor: "pointer",
                minHeight: "125px",
                transition: "all 0.2s ease",
                border: "1px solid #e2e8f0",
              }}
              onClick={() => onNavigate("data-sasaran")}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs"
                style={{
                  backgroundColor: "#ecfdf5",
                  color: "#059669",
                  width: "42px",
                  height: "42px",
                }}
              >
                <UserPlus size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Input Sasaran</div>
              <div className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                Tambah data warga baru
              </div>
            </div>
          </div>

          {/* Card 2: Mulai Pemeriksaan */}
          <div className="col-6 col-lg-3">
            <div
              className="p-3 border rounded-3 bg-white hover-shadow transition-all d-flex flex-column align-items-center text-center h-100 shadow-xs"
              style={{
                cursor: "pointer",
                minHeight: "125px",
                transition: "all 0.2s ease",
                border: "1px solid #e2e8f0",
              }}
              onClick={() => onNavigate("pemeriksaan")}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs"
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  width: "42px",
                  height: "42px",
                }}
              >
                <Heart size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Mulai Pemeriksaan</div>
              <div className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                Catat layanan & penimbangan
              </div>
            </div>
          </div>

          {/* Card 3: Rekap Pemeriksaan */}
          <div className="col-6 col-lg-3">
            <div
              className="p-3 border rounded-3 bg-white hover-shadow transition-all d-flex flex-column align-items-center text-center h-100 shadow-xs"
              style={{
                cursor: "pointer",
                minHeight: "125px",
                transition: "all 0.2s ease",
                border: "1px solid #e2e8f0",
              }}
              onClick={() => onNavigate("rekap-pemeriksaan")}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs"
                style={{
                  backgroundColor: "#f0fdfa",
                  color: "#0d9488",
                  width: "42px",
                  height: "42px",
                }}
              >
                <FileText size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Rekap Pemeriksaan</div>
              <div className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                Lihat data hasil pelayanan
              </div>
            </div>
          </div>

          {/* Card 4: Cari Data Sasaran */}
          <div className="col-6 col-lg-3">
            <div
              className="p-3 border rounded-3 bg-white hover-shadow transition-all d-flex flex-column align-items-center text-center h-100 shadow-xs"
              style={{
                cursor: "pointer",
                minHeight: "125px",
                transition: "all 0.2s ease",
                border: "1px solid #e2e8f0",
              }}
              onClick={() => onNavigate("data-sasaran")}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs"
                style={{
                  backgroundColor: "#fffbeb",
                  color: "#d97706",
                  width: "42px",
                  height: "42px",
                }}
              >
                <Search size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Cari Data Sasaran</div>
              <div className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                Cek NIK dan riwayat warga
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Jumlah Sasaran & Kehadiran per Kategori */}
      <div className="card card-custom p-4 bg-white border-0 shadow-sm rounded-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4 pb-3 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-1">Jumlah Sasaran &amp; Kehadiran per Kategori</h5>
            <p className="text-muted small mb-0">Perbandingan sasaran terdaftar dan kehadiran pelayanan posyandu per kelompok usia.</p>
          </div>

          <div>
            <button className="btn btn-sm btn-outline-secondary text-dark fw-medium px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5 shadow-xs" style={{ fontSize: "0.8rem" }} onClick={() => onNavigate("data-sasaran")}>
              <span>Lihat Semua Sasaran</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Summary Metric Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
                Total Sasaran Terdaftar
              </div>
              <div className="fw-bold text-dark fs-5">
                {totalSasaranAll}{" "}
                <span className="small text-muted fw-normal" style={{ fontSize: "0.8rem" }}>
                  Jiwa
                </span>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 border" style={{ backgroundColor: "#fdf2f8", borderColor: "#F25B8E" }}>
              <div className="small mb-1 fw-medium" style={{ color: "#be185d", fontSize: "0.75rem" }}>
                Total Sasaran Hadir
              </div>
              <div className="fw-bold fs-5" style={{ color: "#F25B8E" }}>
                {totalHadirAll}{" "}
                <span className="small fw-normal" style={{ fontSize: "0.8rem" }}>
                  ({overallPercentage}%)
                </span>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
                Belum Hadir
              </div>
              <div className="fw-bold text-secondary fs-5">
                {totalSasaranAll - totalHadirAll}{" "}
                <span className="small text-muted fw-normal" style={{ fontSize: "0.8rem" }}>
                  Jiwa
                </span>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
                Partisipasi Tertinggi
              </div>
              <div className="fw-bold text-success fs-6 text-truncate">
                {highestCategory.nama}{" "}
                <span className="small fw-semibold" style={{ fontSize: "0.75rem" }}>
                  ({highestCategory.total ? Math.round((highestCategory.hadir / highestCategory.total) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik Batang Komparasi */}
        <div className="p-3 p-md-4 rounded-4 bg-light border">
          {/* Visual Bar Chart */}
          <div className="position-relative w-100 overflow-hidden" style={{ height: "300px" }}>
            {kategoriDistribution.length > 0 ? (
              <Bar data={chartDataConfig} options={chartOptions} />
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                Tidak ada data sasaran
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
