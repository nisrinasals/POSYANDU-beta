import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Search, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Calendar, 
  Eye, 
  FileText, 
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DetailRekapModal, { resolve5StepDetails } from '../../components/pemeriksaan/DetailRekapModal';
import ExportRekapModal from '../../components/pemeriksaan/ExportRekapModal';

export default function PuskesmasRekapitulasiPage({ 
  globalSasaranList = [], 
  globalPemeriksaanData = {}, 
  onNavigate,
  user,
  userRole = 'puskesmas'
}) {
  const isDinkes = userRole === 'dinkes' || user?.roleType?.includes('dinkes');
  const themeColor = isDinkes ? '#1e3a8a' : '#428A75';
  const roleTitle = isDinkes ? 'Dinas Kesehatan Kota' : 'Puskesmas Pembina';

  // Month & Year Filter State (Default: September 2026)
  const [selectedMonthNum, setSelectedMonthNum] = useState('09'); // 'Semua', '01' s/d '12'
  const [selectedYear, setSelectedYear] = useState('2026'); // 'Semua', '2024', '2025', '2026', '2027'
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosyandu, setSelectedPosyandu] = useState('Semua Posyandu');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori (Semua Siklus)');

  // Modal State for Single-Page View
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  // Modal State for Export Excel
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Dynamic Unified Rekap Data derived from globalSasaranList and globalPemeriksaanData (Hanya yang sudah periksa - persis seperti Posyandu)
  const allRekapList = useMemo(() => {
    if (!globalSasaranList || globalSasaranList.length === 0) return [];

    return globalSasaranList
      .map(s => {
        if (!s) return null;
        const exam = (globalPemeriksaanData && (globalPemeriksaanData[s.id] || globalPemeriksaanData[String(s.id)] || globalPemeriksaanData[s.nik] || globalPemeriksaanData[`exam_${s.id}`])) || s.exam || null;
        const resolved = resolve5StepDetails(s, exam) || {};
        const isExamined = s.statusPemeriksaan === 'Sudah' || s.status === 'Sudah' || resolved.isExamined || !!exam;

        return {
          ...resolved,
          exam: exam || resolved.exam || null,
          id: s.id,
          idSasaran: s.idSasaran || `PSY-${String(s.id).padStart(3, '0')}`,
          nama: s.nama || 'Sasaran',
          nik: s.nik || '',
          kategori: s.kategori || 'Dewasa',
          subKategori: s.subKategori || 'dewasa',
          subText: s.usia || '',
          tglLahir: s.tglLahir || '',
          gender: s.gender || 'Perempuan',
          posyandu: s.posyandu || 'Posyandu Melati',
          rw: s.rw || 'RW 04',
          keteranganKeluarga: s.keteranganIbuSuami || s.namaIbu || s.namaAyah || '-',
          tglPeriksa: resolved.tglPeriksa || (isExamined ? (s.tglPeriksa && s.tglPeriksa !== '-' ? s.tglPeriksa : '24-09-2026') : '-'),
          status: isExamined ? 'Sudah' : 'Belum'
        };
      })
      .filter(Boolean)
      .filter(item => item.status === 'Sudah');
  }, [globalSasaranList, globalPemeriksaanData]);

  // Available Posyandu List for filter dropdown
  const availablePosyanduList = useMemo(() => {
    const list = [
      'Posyandu Melati',
      'Posyandu Flamboyan',
      'Posyandu Mawar',
      'Posyandu Dahlia',
      'Posyandu Teratai',
      'Posyandu Cempaka',
      'Posyandu Kenanga',
      'Posyandu Anggrek',
      'Posyandu Nusa Indah'
    ];
    allRekapList.forEach(item => {
      if (item.posyandu) {
        const rawName = item.posyandu.split('—')[0].split('RW')[0].trim();
        if (rawName && !list.includes(rawName)) {
          list.push(rawName);
        }
      }
    });
    return list;
  }, [allRekapList]);

  // Filtered List Logic (Search, Category, Posyandu, Month & Year)
  const filteredList = useMemo(() => {
    return allRekapList.filter((item) => {
      // 1. Search match
      const matchSearch = !searchTerm || 
                          (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.nik || '').includes(searchTerm) ||
                          (item.posyandu || '').toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Posyandu match
      const matchPosyandu = 
        selectedPosyandu === 'Semua Posyandu' || 
        selectedPosyandu === 'all' ||
        (item.posyandu && item.posyandu.toLowerCase().includes(selectedPosyandu.toLowerCase()));
      
      // 3. Category match
      let matchCat = true;
      if (selectedCategory !== 'Semua Kategori (Semua Siklus)') {
        const itemKat = (item.kategori || '').toLowerCase();
        const itemSubKat = (item.subKategori || '').toLowerCase();
        const targetCat = (selectedCategory || '').toLowerCase();
        matchCat = itemKat.includes(targetCat) || itemSubKat.includes(targetCat) || targetCat.includes(itemKat);
      }

      // 4. Month & Year Filter (Supports DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY)
      let matchMonthYear = true;
      if (selectedMonthNum !== 'Semua' || selectedYear !== 'Semua') {
        if (!item.tglPeriksa || item.tglPeriksa === '-') {
          matchMonthYear = false;
        } else {
          const cleanStr = String(item.tglPeriksa).trim().replace(/\//g, '-');
          const parts = cleanStr.split('-');
          let itemMonth = '';
          let itemYear = '';
          
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              // YYYY-MM-DD
              itemYear = parts[0];
              itemMonth = parts[1].padStart(2, '0');
            } else {
              // DD-MM-YYYY
              itemMonth = parts[1].padStart(2, '0');
              itemYear = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            }
          }

          if (selectedMonthNum !== 'Semua' && itemMonth && itemMonth !== selectedMonthNum) {
            matchMonthYear = false;
          }
          if (selectedYear !== 'Semua' && itemYear && itemYear !== selectedYear) {
            matchMonthYear = false;
          }
        }
      }

      return matchSearch && matchPosyandu && matchCat && matchMonthYear;
    });
  }, [allRekapList, searchTerm, selectedPosyandu, selectedCategory, selectedMonthNum, selectedYear]);

  // Dynamic Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPosyandu, selectedCategory, selectedMonthNum, selectedYear]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const handleOpenDetail = (citizen) => {
    setSelectedCitizen(citizen);
  };

  const handleCloseDetail = () => {
    setSelectedCitizen(null);
  };

  return (
    <div className="container-fluid p-0">
      {/* Export Action & Filter Bar */}
      <div className="d-flex justify-content-end mb-3">
        <button 
          className="btn btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2 rounded-3 shadow-xs text-white" 
          style={{ backgroundColor: themeColor }}
          onClick={() => setIsExportModalOpen(true)}
          title="Export Laporan Rekapitulasi ke Excel"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      {/* Filter Bar Section */}
      <div className="card card-custom p-3 mb-4 bg-white border-0 shadow-sm rounded-4">
        <div className="row g-2 align-items-center">
          
          {/* Dropdown Filter Bulan */}
          <div className="col-12 col-sm-6 col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted px-2">
                <Calendar size={14} />
              </span>
              <select 
                className="form-select bg-light border-start-0 text-dark fw-semibold small py-2"
                value={selectedMonthNum}
                onChange={(e) => setSelectedMonthNum(e.target.value)}
                title="Pilih Bulan Periksa"
              >
                <option value="Semua">Semua Bulan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
          </div>

          {/* Dropdown Filter Tahun */}
          <div className="col-12 col-sm-6 col-md-2">
            <select 
              className="form-select bg-light text-dark fw-semibold small py-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              title="Pilih Tahun Periksa"
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2024">Tahun 2024</option>
              <option value="2025">Tahun 2025</option>
              <option value="2026">Tahun 2026</option>
              <option value="2027">Tahun 2027</option>
            </select>
          </div>

          {/* Filter Posyandu */}
          <div className="col-12 col-sm-6 col-md-3">
            <select 
              className="form-select bg-light text-dark fw-semibold small py-2"
              value={selectedPosyandu}
              onChange={(e) => setSelectedPosyandu(e.target.value)}
              title="Pilih Posyandu"
            >
              <option value="Semua Posyandu">Semua Posyandu</option>
              {availablePosyanduList.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="col-12 col-sm-6 col-md-2">
            <select 
              className="form-select bg-light text-dark small py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Semua Kategori (Semua Siklus)">Semua Kategori</option>
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

          {/* Search Bar */}
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted px-2">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-start-0 text-dark small py-2" 
                placeholder="Cari Nama / NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Info Alert Banner */}
      <div className="alert bg-white border border-light-subtle rounded-3 p-3 mb-4 shadow-xs d-flex align-items-center gap-2">
        <span className="text-muted fs-5">ⓘ</span>
        <span className="text-secondary small mb-0">
          Seluruh data klinis spesifik langkah 1-5 dapat dilihat lengkap dalam <strong>satu halaman detail</strong> melalui tombol Lihat Detail.
        </span>
      </div>

      {/* Data Table Card (Persis Seperti Posyandu) */}
      <div className="card card-custom p-0 bg-white border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase fw-bold border-bottom">
                <th className="ps-4 py-3 text-center" style={{ width: '60px' }}>NO</th>
                <th className="py-3" style={{ minWidth: '180px' }}>NAMA LENGKAP / NIK</th>
                <th className="py-3" style={{ minWidth: '140px' }}>KATEGORI</th>
                <th className="py-3" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>USIA</th>
                <th className="py-3" style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>TANGGAL PEMERIKSAAN</th>
                <th className="pe-4 py-3 text-center" style={{ width: '130px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Tidak ada data pemeriksaan yang sesuai dengan filter bulan ({selectedMonthNum}) / tahun ({selectedYear}) yang dipilih.
                  </td>
                </tr>
              ) : (
                paginatedList.map((row, idx) => (
                  <tr key={row.id || idx} className="border-bottom">
                    <td className="ps-4 text-center fw-medium text-muted small">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{row.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{row.nik}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark mb-0">{row.kategori}</div>
                    </td>
                    <td className="text-dark fw-medium text-nowrap">{row.subText || row.usia || '-'}</td>
                    <td className="text-secondary small text-nowrap">{row.tglPeriksa}</td>
                    <td className="pe-4 text-center text-nowrap">
                      <div className="d-flex align-items-center justify-content-center gap-1.5">
                        <button 
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none"
                          onClick={() => handleOpenDetail(row)}
                          title="Lihat Detail Hasil 5 Langkah"
                        >
                          <Eye size={14} /> <span>Detail</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="p-3 bg-light-subtle d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 border-top">
          <span className="text-muted small">
            Menampilkan <span className="fw-semibold text-dark">{filteredList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> s/d <span className="fw-semibold text-dark">{Math.min(currentPage * itemsPerPage, filteredList.length)}</span> dari <span className="fw-semibold text-dark">{filteredList.length}</span> sasaran
          </span>
          <div className="d-flex align-items-center gap-1">
            <button 
              className="btn btn-sm btn-light border p-1 rounded-2" 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`btn btn-sm px-3 py-1 me-1 ${currentPage === page ? 'text-white border-0 fw-bold' : 'btn-light border'}`}
                style={currentPage === page ? { backgroundColor: themeColor } : {}}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="btn btn-sm btn-light border p-1 rounded-2"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              title="Halaman Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* SINGLE-PAGE DETAIL MODAL (Menampilkan Seluruh Langkah 1 s/d 5 Dalam Satu Halaman Utuh) */}
      {selectedCitizen && (
        <DetailRekapModal 
          citizen={selectedCitizen}
          examData={selectedCitizen?.exam || selectedCitizen}
          onClose={handleCloseDetail}
          theme={isDinkes ? 'dinkes' : 'puskesmas'}
          themeColor={themeColor}
          roleTitle={roleTitle}
        />
      )}

      {/* EXPORT REKAP MODAL */}
      <ExportRekapModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentCategory={selectedCategory}
        currentYear={selectedYear}
        globalSasaranList={globalSasaranList}
        globalPemeriksaanData={globalPemeriksaanData}
        filteredList={filteredList}
        theme={isDinkes ? 'dinkes' : 'puskesmas'}
        themeColor={themeColor}
        roleTitle={roleTitle}
      />

    </div>
  );
}
