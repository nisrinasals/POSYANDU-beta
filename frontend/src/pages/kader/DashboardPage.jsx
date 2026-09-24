import React, { useMemo, useState } from 'react';
import { 
  Search, 
  FileText, 
  ChevronRight, 
  Heart, 
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Users
} from 'lucide-react';

export default function DashboardPage({ onNavigate, globalSasaranList = [], globalPemeriksaanData = {}, globalJadwalList = [], user }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Build dashboard statistics from backend-synced warga, pemeriksaan, and sesi data.
  const kategoriDistribution = useMemo(() => {
    const categories = [
      ['bumil', 'Bumil', 'Ibu Hamil'],
      ['nifas', 'Nifas/Menyusui', 'Ibu Nifas & Menyusui'],
      ['bayi-0-11', 'Bayi 0–11 Bln', '0 – 11 Bulan'],
      ['balita-12-59', 'Balita 12–59 Bln', '12 – 59 Bulan'],
      ['apras-60-72', 'Apras 60–72 Bln', 'Pra-Sekolah'],
      ['usekrem-6-14', 'Usekrem 6–14 Thn', 'Usia Sekolah'],
      ['usekrem-15-18', 'Usekrem 15–18 Thn', 'Remaja'],
      ['dewasa', 'Dewasa', '19 – 59 Thn'],
      ['lansia', 'Lansia', '60+ Thn']
    ];
    const colorPalette = ['#F25B8E', '#f43f5e', '#ec4899', '#d946ef', '#8b5cf6', '#6366f1', '#0ea5e9', '#10b981', '#64748b'];
    const list = globalSasaranList || [];
    return categories.map(([id, nama, sub], index) => {
      const members = list.filter((item) => item?.subKategori === id || String(item?.kategori || '').toLowerCase().includes(nama.toLowerCase().split(' ')[0]));
      const hadir = members.filter((item) =>
        item.statusPemeriksaan === 'Sudah' ||
        globalPemeriksaanData?.[item.id] ||
        globalPemeriksaanData?.[String(item.id)]
      ).length;
      return { id, nama, hadir, total: members.length, color: colorPalette[index], sub };
    });
  }, [globalSasaranList, globalPemeriksaanData]);

  const todaySchedule = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (globalJadwalList || []).find((item) => item?.tanggal === today || String(item?.tanggal_pelaksanaan || '').slice(0, 10) === today);
  }, [globalJadwalList]);

  // Aggregated Statistics
  const totalSasaranAll = kategoriDistribution.reduce((acc, cur) => acc + cur.total, 0);
  const totalHadirAll = kategoriDistribution.reduce((acc, cur) => acc + cur.hadir, 0);
  const overallPercentage = Math.round((totalHadirAll / totalSasaranAll) * 100);
  const highestCategory = [...kategoriDistribution].sort((a, b) => {
    const ar = a.total ? a.hadir / a.total : 0;
    const br = b.total ? b.hadir / b.total : 0;
    return br - ar;
  })[0] || { nama: '-', hadir: 0, total: 0 };
  const maxBarValue = Math.max(...kategoriDistribution.map(k => k.total), 60);

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Hero Banner - Jadwal Posyandu Hari Ini */}
      <div 
        className="card border-0 rounded-4 text-white overflow-hidden shadow-sm"
        style={{ 
          background: 'linear-gradient(135deg, #831843 0%, #9d174d 45%, #be185d 100%)',
          padding: '1.6rem 2rem'
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div 
              className="d-inline-flex align-items-center gap-1.5 fw-semibold px-3 py-1 rounded-pill mb-2" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.18)', 
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                fontSize: '0.8rem' 
              }}
            >
              <Calendar size={13} />
              <span>Jadwal Pelayanan Hari Ini</span>
            </div>
            <h3 className="fw-bold mb-1.5 text-white fs-4">
              {todaySchedule?.posyandu || user?.posyandu || 'Jadwal Posyandu'}
            </h3>
            <p className="mb-0 small" style={{ maxWidth: '640px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.92)' }}>
              Pelayanan Posyandu dan pemantauan kesehatan siklus hidup ILP berdasarkan jadwal yang tersimpan pada backend.
            </p>
          </div>

          <div>
            <button 
              className="btn bg-white fw-bold px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
              style={{ 
                color: '#9d174d', 
                fontSize: '0.88rem',
                whiteSpace: 'nowrap',
                border: 'none',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onNavigate('data-sasaran')}
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
                cursor: 'pointer', 
                minHeight: '125px',
                transition: 'all 0.2s ease',
                border: '1px solid #e2e8f0'
              }}
              onClick={() => onNavigate('data-sasaran')}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs" 
                style={{ 
                  backgroundColor: '#ecfdf5', 
                  color: '#059669', 
                  width: '42px', 
                  height: '42px' 
                }}
              >
                <UserPlus size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Input Sasaran</div>
              <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                Tambah data warga baru
              </div>
            </div>
          </div>

          {/* Card 2: Mulai Pemeriksaan */}
          <div className="col-6 col-lg-3">
            <div 
              className="p-3 border rounded-3 bg-white hover-shadow transition-all d-flex flex-column align-items-center text-center h-100 shadow-xs"
              style={{ 
                cursor: 'pointer', 
                minHeight: '125px',
                transition: 'all 0.2s ease',
                border: '1px solid #e2e8f0'
              }}
              onClick={() => onNavigate('pemeriksaan')}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs" 
                style={{ 
                  backgroundColor: '#eff6ff', 
                  color: '#2563eb', 
                  width: '42px', 
                  height: '42px' 
                }}
              >
                <Heart size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Mulai Pemeriksaan</div>
              <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                Catat layanan & penimbangan
              </div>
            </div>
          </div>

          {/* Card 3: Rekap Pemeriksaan */}
          <div className="col-6 col-lg-3">
            <div 
              className="p-3 border rounded-3 bg-white hover-shadow transition-all d-flex flex-column align-items-center text-center h-100 shadow-xs"
              style={{ 
                cursor: 'pointer', 
                minHeight: '125px',
                transition: 'all 0.2s ease',
                border: '1px solid #e2e8f0'
              }}
              onClick={() => onNavigate('rekap-pemeriksaan')}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs" 
                style={{ 
                  backgroundColor: '#f0fdfa', 
                  color: '#0d9488', 
                  width: '42px', 
                  height: '42px' 
                }}
              >
                <FileText size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Rekap Pemeriksaan</div>
              <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                Lihat data hasil pelayanan
              </div>
            </div>
          </div>

          {/* Card 4: Cari Data Sasaran */}
          <div className="col-6 col-lg-3">
            <div 
              className="p-3 border rounded-3 bg-white hover-shadow transition-all d-flex flex-column align-items-center text-center h-100 shadow-xs"
              style={{ 
                cursor: 'pointer', 
                minHeight: '125px',
                transition: 'all 0.2s ease',
                border: '1px solid #e2e8f0'
              }}
              onClick={() => onNavigate('data-sasaran')}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-xs" 
                style={{ 
                  backgroundColor: '#fffbeb', 
                  color: '#d97706', 
                  width: '42px', 
                  height: '42px' 
                }}
              >
                <Search size={20} />
              </div>
              <div className="fw-semibold text-dark small mb-1">Cari Data Sasaran</div>
              <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
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
            <h5 className="fw-bold text-dark mb-1">
              Jumlah Sasaran &amp; Kehadiran per Kategori
            </h5>
            <p className="text-muted small mb-0">
              Perbandingan sasaran terdaftar dan kehadiran pelayanan posyandu per kelompok usia.
            </p>
          </div>

          <div>
            <button 
              className="btn btn-sm btn-outline-secondary text-dark fw-medium px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5 shadow-xs"
              style={{ fontSize: '0.8rem' }}
              onClick={() => onNavigate('data-sasaran')}
            >
              <span>Lihat Semua Sasaran</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Summary Metric Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>Total Sasaran Terdaftar</div>
              <div className="fw-bold text-dark fs-5">{totalSasaranAll} <span className="small text-muted fw-normal" style={{ fontSize: '0.8rem' }}>Jiwa</span></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 border" style={{ backgroundColor: '#fdf2f8', borderColor: '#F25B8E' }}>
              <div className="small mb-1 fw-medium" style={{ color: '#be185d', fontSize: '0.75rem' }}>Total Sasaran Hadir</div>
              <div className="fw-bold fs-5" style={{ color: '#F25B8E' }}>{totalHadirAll} <span className="small fw-normal" style={{ fontSize: '0.8rem' }}>({overallPercentage}%)</span></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>Belum Hadir</div>
              <div className="fw-bold text-secondary fs-5">{totalSasaranAll - totalHadirAll} <span className="small text-muted fw-normal" style={{ fontSize: '0.8rem' }}>Jiwa</span></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>Partisipasi Tertinggi</div>
              <div className="fw-bold text-success fs-6 text-truncate">
                {highestCategory.nama} <span className="small fw-semibold" style={{ fontSize: '0.75rem' }}>({highestCategory.total ? Math.round((highestCategory.hadir / highestCategory.total) * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik Batang Komparasi */}
        <div className="p-3 p-md-4 rounded-4 bg-light border">
          {/* Chart Legend */}
          <div className="d-flex align-items-center gap-3 mb-3 small">
            <div className="d-flex align-items-center gap-1.5">
              <span className="d-inline-block rounded-pill border" style={{ width: '12px', height: '12px', backgroundColor: '#F25B8E', borderColor: '#d93c72' }} />
              <span className="fw-semibold text-dark">Sasaran Hadir</span>
            </div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="d-inline-block rounded-pill" style={{ width: '12px', height: '12px', backgroundColor: '#cbd5e1' }} />
              <span className="text-muted">Target Sasaran</span>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="position-relative" style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '650px', height: '280px' }} className="d-flex align-items-end justify-content-between pt-4 pb-2 px-2">
              {kategoriDistribution.map((cat) => {
                const persenHadir = cat.total ? Math.round((cat.hadir / cat.total) * 100) : 0;
                const totalHeightPct = Math.max(15, Math.round((cat.total / maxBarValue) * 210));
                const hadirHeightPct = Math.max(10, Math.round((cat.hadir / maxBarValue) * 210));
                const isHovered = hoveredCategory === cat.id;

                return (
                  <div 
                    key={cat.id} 
                    className="d-flex flex-column align-items-center h-100 justify-content-end position-relative"
                    style={{ 
                      flex: 1, 
                      cursor: 'pointer',
                      padding: '0 6px'
                    }}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => onNavigate('data-sasaran', null, { kategori: cat.nama })}
                  >
                    {/* Hover Info Tooltip */}
                    {isHovered && (
                      <div 
                        className="position-absolute bg-dark text-white rounded-3 p-2 shadow-lg text-center"
                        style={{
                          bottom: `${totalHeightPct + 50}px`,
                          zIndex: 20,
                          whiteSpace: 'nowrap',
                          fontSize: '0.75rem',
                          animation: 'fadeIn 0.15s ease'
                        }}
                      >
                        <div className="fw-bold">{cat.nama}</div>
                        <div>Hadir: <strong className="text-warning">{cat.hadir}</strong> dari <strong>{cat.total}</strong></div>
                        <div className="text-success fw-semibold">Kehadiran: {persenHadir}%</div>
                      </div>
                    )}

                    {/* Percentage Badge on Top of Bar */}
                    <span 
                      className={`badge rounded-pill mb-1.5 px-2 py-0.5 small ${
                        persenHadir >= 80 ? 'bg-success-subtle text-success' : persenHadir >= 65 ? 'text-dark border' : 'bg-warning-subtle text-warning-emphasis'
                      }`}
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        backgroundColor: persenHadir >= 65 && persenHadir < 80 ? '#fdf2f8' : undefined,
                        borderColor: persenHadir >= 65 && persenHadir < 80 ? '#F25B8E' : undefined,
                        color: persenHadir >= 65 && persenHadir < 80 ? '#be185d' : undefined
                      }}
                    >
                      {persenHadir}%
                    </span>

                    {/* Bars Container */}
                    <div 
                      className="d-flex align-items-end justify-content-center gap-1 w-100"
                      style={{ height: '210px' }}
                    >
                      {/* 1. Bar Sasaran Hadir */}
                      <div
                        className="rounded-top-3 transition-all"
                        style={{
                          width: '45%',
                          maxWidth: '28px',
                          height: `${hadirHeightPct}px`,
                          background: isHovered 
                            ? 'linear-gradient(180deg, #d93c72 0%, #F25B8E 100%)' 
                            : 'linear-gradient(180deg, #F25B8E 0%, #d93c72 100%)',
                          border: '1px solid #d93c72',
                          boxShadow: isHovered ? '0 4px 12px rgba(242, 91, 142, 0.5)' : 'none',
                          transform: isHovered ? 'scaleY(1.02)' : 'none',
                          transformOrigin: 'bottom',
                          transition: 'all 0.2s ease'
                        }}
                        title={`Hadir: ${cat.hadir}`}
                      />

                      {/* 2. Bar Total Sasaran */}
                      <div
                        className="rounded-top-3 transition-all"
                        style={{
                          width: '45%',
                          maxWidth: '28px',
                          height: `${totalHeightPct}px`,
                          backgroundColor: isHovered ? '#94a3b8' : '#cbd5e1',
                          transform: isHovered ? 'scaleY(1.02)' : 'none',
                          transformOrigin: 'bottom',
                          transition: 'all 0.2s ease'
                        }}
                        title={`Total: ${cat.total}`}
                      />
                    </div>

                    {/* Numbers label */}
                    <div className="mt-1 small text-muted text-center" style={{ fontSize: '0.72rem', fontWeight: 500 }}>
                      <span className="fw-bold" style={{ color: '#F25B8E' }}>{cat.hadir}</span>/{cat.total}
                    </div>

                    {/* X-Axis Category Name */}
                    <div 
                      className={`text-center mt-1 text-truncate w-100 small ${
                        isHovered ? 'fw-bold' : 'text-dark'
                      }`}
                      style={{ 
                        fontSize: '0.74rem', 
                        maxWidth: '80px',
                        color: isHovered ? '#F25B8E' : undefined
                      }}
                      title={cat.nama}
                    >
                      {cat.nama}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
