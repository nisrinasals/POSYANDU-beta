import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye,
  FileText, 
  RotateCcw,
  AlertTriangle,
  User
} from 'lucide-react';

const initialKaderReferrals = [
  {
    id: 'RUJ-POS-001',
    nama: 'Nurul Azizah',
    nik: '3201014811950003',
    kategori: 'Bumil',
    kategoriKey: 'bumil',
    usia: '28 Thn',
    posyandu: 'Posyandu Melati (RW 04)',
    kaderPerujuk: 'Kader Endang Prihati',
    masalahBadge: 'Risiko KEK (LiLA < 23.5 cm) & Anemia',
    masalahSub: 'LiLA 21.0 cm (< 23.5 cm), Hb 10.2 g/dL (< 11.0 g/dL), kenaikan BB tidak adekuat.',
    tglDirujuk: '15-09-2026'
  },
  {
    id: 'RUJ-POS-002',
    nama: 'Siti Rahayu',
    nik: '3201014201990001',
    kategori: 'Nifas/Menyusui',
    kategoriKey: 'nifas',
    usia: '25 Thn',
    posyandu: 'Posyandu Melati (RW 04)',
    kaderPerujuk: 'Kader Siti Rahma',
    masalahBadge: 'Mastitis Akut & Demam Nifas',
    masalahSub: 'Suhu 38.4°C (≥ 38.0°C), nyeri payudara unilateral kemerahan, pengeluaran ASI tersumbat.',
    tglDirujuk: '16-09-2026'
  },
  {
    id: 'RUJ-POS-003',
    nama: 'Rafa Pratama',
    nik: '3201014908250001',
    kategori: 'Bayi 0–11 Bln',
    kategoriKey: 'bayi-0-11',
    usia: '6 Bulan',
    posyandu: 'Posyandu Melati (RW 04)',
    kaderPerujuk: 'Kader Endang Prihati',
    masalahBadge: 'Berat Badan Tidak Naik (T) 2x & Z-Score BB/U < -2 SD',
    masalahSub: 'Grafik KMS: Tren pertumbuhan mendatar/tidak naik (T) 2 bulan berturut-turut, risiko faltering growth.',
    tglDirujuk: '18-09-2026'
  },
  {
    id: 'RUJ-POS-004',
    nama: 'Kenzo Alvaro',
    nik: '3201015609010001',
    kategori: 'Balita 12–59 Bln',
    kategoriKey: 'balita-12-59',
    usia: '24 Bulan',
    posyandu: 'Posyandu Melati (RW 04)',
    kaderPerujuk: 'Kader Siti Rahma',
    masalahBadge: 'Gizi Kurang (BB/TB < -2 SD) & Terindikasi Stunting',
    masalahSub: 'Plotting Z-score BB/PB < -2 SD dan TB/U < -2 SD, perlu rujukan evaluasi PMT Pemulihan di Puskesmas.',
    tglDirujuk: '19-09-2026'
  },
  {
    id: 'RUJ-POS-005',
    nama: 'Bpk. Soepardi',
    nik: '32010101010005',
    kategori: 'Lansia',
    kategoriKey: 'lansia',
    usia: '67 Thn',
    posyandu: 'Posyandu Melati (RW 04)',
    kaderPerujuk: 'Kader Dzakiyah Al Zahrani',
    masalahBadge: 'Hipertensi Derajat 2 & Penurunan Kapasitas Intrinsik (SKILAS)',
    masalahSub: 'Tekanan darah 175/105 mmHg (TD ≥ 160/100 mmHg), skrining SKILAS menunjukkan penurunan domain kognitif & gerak.',
    tglDirujuk: '20-09-2026'
  }
];

export default function KaderRiwayatRujukanPage({ 
  globalSasaranList = [], 
  globalPemeriksaanData = {},
  onNavigate 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('Semua Kategori');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dynamic referrals gathered from current Posyandu examinations
  const dynamicReferrals = useMemo(() => {
    const list = [];
    if (globalSasaranList && globalSasaranList.length > 0) {
      globalSasaranList.forEach(s => {
        const exam = globalPemeriksaanData?.[s.id] || globalPemeriksaanData?.[String(s.id)];
        const l5 = exam?.langkah5;
        const isReferred = (l5 && (l5.statusRujukan === 'Rujuk ke Puskesmas / Pustu' || (typeof l5.statusRujukan === 'string' && l5.statusRujukan.toLowerCase().includes('rujuk')))) ||
                           (s.statusRujukan && s.statusRujukan.toLowerCase().includes('rujuk'));
        
        if (isReferred) {
          let formattedAge = s.usia || '-';
          if (!s.usia && s.tglLahir) {
            formattedAge = `${new Date().getFullYear() - new Date(s.tglLahir).getFullYear()} Thn`;
          }

          list.push({
            id: `RUJ-POS-${String(s.id).padStart(3, '0')}`,
            nama: s.nama || 'Warga Sasaran',
            nik: s.nik || '-',
            kategori: s.kategori || 'Sasaran Posyandu',
            kategoriKey: (s.subKategori || s.kategori || '').toLowerCase().replace(/\s+/g, '-'),
            usia: formattedAge,
            posyandu: s.posyandu || 'Posyandu Melati (RW 04)',
            kaderPerujuk: s.kader || exam?.petugasPemeriksa || 'Kader Dzakiyah Al Zahrani',
            masalahBadge: l5?.topikPenyuluhan ? `Indikasi: ${l5.topikPenyuluhan}` : 'Hasil Skrining Memerlukan Rujukan',
            masalahSub: l5?.topikPenyuluhan || 'Ditemukan indikasi medis/risiko dari hasil pemeriksaan posyandu yang memerlukan penanganan puskesmas.',
            tglDirujuk: exam?.tglPemeriksaan || '20-09-2026'
          });
        }
      });
    }
    return list;
  }, [globalSasaranList, globalPemeriksaanData]);

  const allReferrals = useMemo(() => {
    return dynamicReferrals;
  }, [dynamicReferrals]);

  // Filter referrals by search and category
  const filteredReferrals = useMemo(() => {
    return allReferrals.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery.trim() || 
        item.nama.toLowerCase().includes(q) || 
        item.nik.includes(q) ||
        (item.kaderPerujuk && item.kaderPerujuk.toLowerCase().includes(q)) ||
        item.masalahBadge.toLowerCase().includes(q) ||
        item.masalahSub.toLowerCase().includes(q);
      
      const matchKategori = kategoriFilter === 'Semua Kategori' || 
        item.kategori === kategoriFilter ||
        item.kategoriKey.includes(kategoriFilter.toLowerCase().replace(/\s+/g, '-'));

      return matchSearch && matchKategori;
    });
  }, [allReferrals, searchQuery, kategoriFilter]);

  // Category color mapper for sleek visual badges
  const getCategoryBadgeStyle = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('bumil')) return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
    if (c.includes('nifas')) return { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' };
    if (c.includes('bayi')) return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    if (c.includes('balita')) return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
    if (c.includes('apras')) return { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' };
    if (c.includes('usekrem') || c.includes('sekolah') || c.includes('remaja')) return { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' };
    if (c.includes('dewasa')) return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    if (c.includes('lansia')) return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  const handleOpenDetail = (item) => {
    setSelectedReferral(item);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedReferral(null);
    setShowDetailModal(false);
  };

  return (
    <div>
      {/* Counter Badge */}
      <div className="d-flex justify-content-end mb-3">
        <span className="badge px-3 py-2 rounded-pill fw-bold text-white shadow-xs" style={{ backgroundColor: '#2b2e4a' }}>
          {allReferrals.length} Total Dirujuk
        </span>
      </div>

      {/* Main Table Container Card */}
      <div className="card card-custom p-4">
        {/* Search & Filter Bar */}
        <div className="row g-3 mb-4 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
              <input 
                type="text" 
                className="form-control form-control-custom ps-5 bg-light" 
                placeholder="Cari Nama Lengkap, NIK, Kader, atau Indikasi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-8 col-md-5">
            <select 
              className="form-select form-select-custom bg-light"
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
            >
              <option value="Semua Kategori">Semua Kategori</option>
              <option value="Bumil">Bumil</option>
              <option value="Nifas/Menyusui">Nifas/Menyusui</option>
              <option value="Bayi 0–11 Bln">Bayi 0–11 Bln</option>
              <option value="Balita 12–59 Bln">Balita 12–59 Bln</option>
              <option value="Apras 60–72 Bln">Apras 60–72 Bln</option>
              <option value="Usekrem 6–14 Thn">Usekrem 6–14 Thn</option>
              <option value="Usekrem 15–18 Thn">Usekrem 15–18 Thn</option>
              <option value="Dewasa">Dewasa</option>
              <option value="Lansia">Lansia</option>
            </select>
          </div>

          <div className="col-4 col-md-2">
            <button 
              type="button"
              className="btn btn-outline-dark text-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-1.5 py-2 rounded-3 bg-white border"
              onClick={() => { setSearchQuery(''); setKategoriFilter('Semua Kategori'); }}
              title="Reset Filter"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Data Rujukan Table */}
        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr className="text-muted small text-uppercase fw-bold border-bottom">
                <th className="ps-4 py-3 text-center" style={{ width: '50px' }}>NO</th>
                <th className="py-3" style={{ minWidth: '180px' }}>NAMA LENGKAP / NIK</th>
                <th className="py-3" style={{ minWidth: '140px' }}>KATEGORI</th>
                <th className="py-3" style={{ minWidth: '160px' }}>KADER PERUJUK</th>
                <th className="py-3 text-center" style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>TANGGAL DIRUJUK</th>
                <th className="py-3" style={{ minWidth: '240px' }}>INDIKASI / MASALAH RUJUKAN</th>
                <th className="pe-4 py-3 text-center" style={{ width: '90px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <AlertTriangle size={32} className="text-warning mb-2 d-block mx-auto" />
                    Tidak ada riwayat rujukan yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((item, idx) => {
                  return (
                    <tr key={item.id}>
                      <td className="ps-4 text-center fw-semibold text-muted">{idx + 1}</td>
                      <td>
                        <div className="fw-bold text-dark mb-0">{item.nama}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{item.nik}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark mb-0">{item.kategori}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark mb-0">{item.kaderPerujuk}</div>
                      </td>
                      <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                        <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded font-monospace" style={{ fontSize: '0.78rem' }}>
                          {item.tglDirujuk}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-danger mb-0.5">{item.masalahBadge}</div>
                        <div className="text-muted small" style={{ fontSize: '0.78rem', lineHeight: '1.35' }}>
                          {item.masalahSub}
                        </div>
                      </td>
                      <td className="text-center text-nowrap">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none"
                          onClick={() => handleOpenDetail(item)}
                          title="Lihat Detail Rujukan"
                        >
                          <Eye size={14} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4 pt-3 border-top text-muted small">
          <div>
            Menampilkan <strong>{filteredReferrals.length}</strong> dari <strong>{allReferrals.length}</strong> data sasaran yang dirujuk
          </div>
          <div>
            Fasilitas Rujukan: <strong className="text-dark">Puskesmas / Pustu</strong>
          </div>
        </div>
      </div>

      {/* 3. Modal Detail Rujukan */}
      {showDetailModal && selectedReferral && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              
              {/* Modal Header */}
              <div 
                className="modal-header text-white p-3 px-4 d-flex align-items-center justify-content-between" 
                style={{ backgroundColor: '#2b2e4a' }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-white text-dark fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                      {selectedReferral.kategori}
                    </span>
                    <span className="badge bg-danger text-white px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                      Perlu Penanganan Faskes
                    </span>
                  </div>
                  <h5 className="modal-title fw-bold text-white mb-0">Detail Informasi Rujukan</h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseDetail}
                  aria-label="Tutup"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4 bg-light">
                
                {/* Card 1: Identitas Sasaran */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                  <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                    <User size={18} style={{ color: '#F25B8E' }} />
                    <span>Identitas Sasaran</span>
                  </h6>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Nomor Induk Kependudukan (NIK)
                        </div>
                        <div className="fw-bold font-monospace text-dark fs-6">
                          {selectedReferral.nik}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Nama Lengkap
                        </div>
                        <div className="fw-bold text-dark fs-6">
                          {selectedReferral.nama}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Kategori Sasaran
                        </div>
                        <div className="fw-bold text-dark fs-6">
                          {selectedReferral.kategori}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Indikasi Klinis & Informasi Rujukan */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                  <h6 className="fw-bold text-danger mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                    <AlertTriangle size={18} className="text-danger" />
                    <span>Indikasi Masalah &amp; Informasi Rujukan</span>
                  </h6>
                  
                  <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 mb-3">
                    <div className="fw-bold text-danger fs-6 mb-1">{selectedReferral.masalahBadge}</div>
                    <div className="text-dark small" style={{ lineHeight: '1.5' }}>{selectedReferral.masalahSub}</div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Kader yang Merujuk
                        </div>
                        <div className="fw-bold text-dark fs-6">
                          {selectedReferral.kaderPerujuk || 'Kader Posyandu'}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Tanggal Dirujuk
                        </div>
                        <div className="fw-bold text-dark fs-6 font-monospace">
                          {selectedReferral.tglDirujuk}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-between align-items-center">
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1.5 rounded-pill">
                  Status: Memerlukan Penanganan Puskesmas / Pustu
                </span>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-4 rounded-3"
                  onClick={handleCloseDetail}
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
