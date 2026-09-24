import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Info, 
  MapPin, 
  Building2, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  exportRekapBumilNifasExcel, 
  exportRekapBayiBalitaAprasExcel, 
  exportRekapRemajaExcel,
  exportRekapDewasaLansiaExcel,
  exportRekapUmumExcel 
} from '../../utils/exportRekapExcel';

export default function ExportRekapModal({
  isOpen,
  onClose,
  currentCategory = 'Semua Kategori (Semua Siklus)',
  currentYear = '2026',
  globalSasaranList = [],
  globalPemeriksaanData = {},
  filteredList = [],
  theme = 'kader',
  themeColor = null,
  roleTitle = null
}) {
  const isDinkes = theme === 'dinkes' || (themeColor && themeColor.includes('1e3a8a')) || roleTitle?.toLowerCase().includes('dinas');
  const isPuskesmas = theme === 'puskesmas' || (themeColor && themeColor.includes('428A75')) || roleTitle?.toLowerCase().includes('puskesmas');
  const primaryColor = themeColor || (isDinkes ? '#1e3a8a' : isPuskesmas ? '#428A75' : '#2b2e4a');

  // Tentukan pilihan kategori default
  const isBumilOrNifas = currentCategory === 'Bumil' || 
                         currentCategory === 'Nifas/Menyusui' || 
                         currentCategory.toLowerCase().includes('bumil') || 
                         currentCategory.toLowerCase().includes('nifas');

  const isBayiBalitaApras = currentCategory.toLowerCase().includes('bayi') || 
                            currentCategory.toLowerCase().includes('balita') || 
                            currentCategory.toLowerCase().includes('apras');

  const isRemaja = currentCategory.toLowerCase().includes('remaja') || 
                   currentCategory.toLowerCase().includes('sekolah') || 
                   currentCategory.toLowerCase().includes('usekrem');

  const isDewasaLansia = currentCategory.toLowerCase().includes('dewasa') || 
                         currentCategory.toLowerCase().includes('lansia');

  const defaultCategory = isBayiBalitaApras 
    ? 'bayi_balita_apras' 
    : (isRemaja 
      ? 'remaja' 
      : (isDewasaLansia 
        ? 'dewasa_lansia' 
        : (isBumilOrNifas ? 'bumil_nifas' : 'bumil_nifas')));

  const [selectedFormatCategory, setSelectedFormatCategory] = useState(defaultCategory);
  const [exportYear, setExportYear] = useState(currentYear === 'Semua' ? '2026' : currentYear);

  // Data Identitas Wilayah (dapat disesuaikan kader/puskesmas/dinkes sebelum export)
  const [posyanduInfo, setPosyanduInfo] = useState({
    namaPosyandu: isDinkes ? 'Dinas Kesehatan Kota' : (isPuskesmas ? 'Puskesmas Sukamaju' : ''),
    dusunRw: isDinkes ? 'Seluruh Kota' : '',
    desaKelurahan: isDinkes ? 'Semua Kelurahan' : '',
    kecamatan: isDinkes ? 'Semua Kecamatan' : ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsExporting(true);

    setTimeout(() => {
      if (selectedFormatCategory === 'bumil_nifas') {
        exportRekapBumilNifasExcel({
          globalSasaranList,
          globalPemeriksaanData,
          selectedYear: exportYear,
          posyanduInfo
        });
      } else if (selectedFormatCategory === 'bayi_balita_apras') {
        exportRekapBayiBalitaAprasExcel({
          globalSasaranList,
          globalPemeriksaanData,
          selectedYear: exportYear,
          posyanduInfo
        });
      } else if (selectedFormatCategory === 'remaja') {
        exportRekapRemajaExcel({
          globalSasaranList,
          globalPemeriksaanData,
          selectedYear: exportYear,
          posyanduInfo
        });
      } else if (selectedFormatCategory === 'dewasa_lansia') {
        exportRekapDewasaLansiaExcel({
          globalSasaranList,
          globalPemeriksaanData,
          selectedYear: exportYear,
          posyanduInfo
        });
      } else {
        exportRekapUmumExcel({
          dataList: filteredList.length > 0 ? filteredList : globalSasaranList,
          categoryName: selectedFormatCategory,
          selectedYear: exportYear,
          posyanduInfo
        });
      }

      setIsExporting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
    >
      <style>{`
        .rekap-preview-container {
          max-height: 220px;
          overflow-x: auto;
          overflow-y: auto;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
        }
        .rekap-preview-container::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .rekap-preview-container::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .rekap-preview-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .rekap-preview-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .rekap-preview-table {
          border-collapse: collapse !important;
          font-size: 0.53rem !important;
          line-height: 1.15 !important;
          width: max-content !important;
          margin-bottom: 0 !important;
          color: #1e293b !important;
        }
        .rekap-preview-table th, 
        .rekap-preview-table td {
          padding: 2px 4px !important;
          vertical-align: middle !important;
          text-align: center !important;
          border: 1px solid #cbd5e1 !important;
          white-space: normal;
        }
        .rekap-preview-table thead th {
          background-color: #f8fafc !important;
          font-weight: 600 !important;
          font-size: 0.51rem !important;
          line-height: 1.1 !important;
          letter-spacing: -0.01em;
          color: #334155 !important;
        }
        .rekap-preview-table .col-num-row th {
          background-color: #f1f5f9 !important;
          color: #475569 !important;
          font-size: 0.48rem !important;
          font-weight: 700 !important;
          padding: 1px 2px !important;
          height: 16px !important;
        }
        .rekap-preview-table tbody td {
          font-size: 0.52rem !important;
          font-variant-numeric: tabular-nums;
        }
        .rekap-preview-table .cell-month {
          width: 75px !important;
          min-width: 75px !important;
          max-width: 75px !important;
          white-space: nowrap !important;
          text-align: left !important;
          padding-left: 6px !important;
          font-weight: 600 !important;
          font-size: 0.52rem !important;
        }
        .rekap-preview-table .cell-num {
          width: 20px !important;
          min-width: 20px !important;
          max-width: 24px !important;
          padding: 1px 2px !important;
        }
      `}</style>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          
          {/* MODAL HEADER */}
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 rounded-3 bg-white shadow-xs border" style={{ color: primaryColor }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">Export Rekapitulasi Pemeriksaan {isDinkes ? '(Dinkes)' : isPuskesmas ? '(Puskesmas)' : '(Posyandu)'}</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                  Unduh formulir register dan rekapitulasi standar Kemenkes ke format Excel (.xls)
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close shadow-none" 
              onClick={onClose} 
              aria-label="Close"
            ></button>
          </div>

          {/* MODAL BODY */}
          <div className="modal-body px-4 py-3.5">
            {showSuccess ? (
              <div className="text-center py-5">
                <div className="mx-auto mb-3 text-success p-3 bg-success-subtle rounded-circle d-inline-flex">
                  <CheckCircle2 size={42} />
                </div>
                <h5 className="fw-bold text-dark">File Excel Berhasil Dibuat!</h5>
                <p className="text-muted small">Laporan rekapitulasi otomatis terunduh ke perangkat Anda.</p>
              </div>
            ) : (
              <div className="row g-3">
                {/* 1. PILIH KATEGORI & FORMAT REGISTER */}
                <div className="col-12 col-md-7">
                  <label className="form-label fw-bold text-dark small mb-1.5 d-flex align-items-center gap-1.5">
                    <Layers size={14} style={{ color: primaryColor }} /> Kategori &amp; Format Register Excel
                  </label>
                  <select 
                    className="form-select border-2 fw-semibold py-2 text-dark"
                    style={{ borderColor: primaryColor }}
                    value={selectedFormatCategory}
                    onChange={(e) => setSelectedFormatCategory(e.target.value)}
                  >
                    <option value="bumil_nifas">
                      Ibu Hamil / Nifas / Menyusui
                    </option>
                    <option value="bayi_balita_apras">
                      Bayi, Balita dan Apras
                    </option>
                    <option value="remaja">
                      Anak Usia Sekolah dan Remaja ( 6 - 18 Tahun )
                    </option>
                    <option value="dewasa_lansia">
                      Usia Dewasa dan Lansia ( ≥ 19 Tahun )
                    </option>
                    <option value="Semua Kategori (Rekap Data)">
                      Semua Kategori (Format Daftar Rekap Terpadu)
                    </option>
                  </select>

                  {/* 2. PILIH TAHUN */}
                  <div className="mt-3">
                    <label className="form-label fw-bold text-dark small mb-1.5 d-flex align-items-center gap-1.5">
                      <Calendar size={14} style={{ color: primaryColor }} /> Tahun Rekapitulasi
                    </label>
                    <select 
                      className="form-select py-2 text-dark fw-medium"
                      value={exportYear}
                      onChange={(e) => setExportYear(e.target.value)}
                    >
                      <option value="2024">Tahun 2024</option>
                      <option value="2025">Tahun 2025</option>
                      <option value="2026">Tahun 2026</option>
                      <option value="2027">Tahun 2027</option>
                    </select>
                  </div>
                </div>

                {/* INFO IDENTITAS WILAYAH */}
                <div className="col-12 col-md-5">
                  <div className="card bg-light border-0 rounded-3 p-3">
                    <div className="d-flex align-items-center gap-1.5 mb-2 text-dark fw-bold small">
                      <Building2 size={14} className="text-secondary" /> Identitas Wilayah (Header Excel)
                    </div>
                    
                    <div className="mb-2">
                      <label className="form-label text-muted" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Nama Posyandu</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-white"
                        value={posyanduInfo.namaPosyandu}
                        onChange={(e) => setPosyanduInfo({ ...posyanduInfo, namaPosyandu: e.target.value })}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label text-muted" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Dusun / RT / RW</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-white"
                        value={posyanduInfo.dusunRw}
                        onChange={(e) => setPosyanduInfo({ ...posyanduInfo, dusunRw: e.target.value })}
                      />
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label text-muted" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Desa/Kelurahan</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm bg-white"
                          value={posyanduInfo.desaKelurahan}
                          onChange={(e) => setPosyanduInfo({ ...posyanduInfo, desaKelurahan: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Kecamatan</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm bg-white"
                          value={posyanduInfo.kecamatan}
                          onChange={(e) => setPosyanduInfo({ ...posyanduInfo, kecamatan: e.target.value })}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* PREVIEW STRUKTUR TEMPLATE BUMIL / NIFAS */}
                {selectedFormatCategory === 'bumil_nifas' && (
                  <div className="col-12 mt-2">
                    <div className="p-2.5 bg-white border border-secondary-subtle rounded-3 shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Preview Format Register Ibu Hamil, Nifas &amp; Menyusui
                        </span>
                      </div>
                      <div className="table-responsive rekap-preview-container">
                        <table className="table table-bordered table-sm text-center mb-0 align-middle rekap-preview-table">
                          <thead>
                            {/* Header Baris 1 */}
                            <tr>
                              <th rowSpan="3" className="align-middle cell-month">Bulan dan Tahun</th>
                              <th colSpan="6">Jumlah</th>
                              <th colSpan="7">Jumlah Ibu Hamil/ Nifas/ Menyusui dengan Hasil Penimbangan/ Pengukuran/ Pemeriksaan</th>
                              <th colSpan="3">TTD</th>
                              <th colSpan="3">PMT Bumil KEK</th>
                              <th colSpan="2">Jumlah Ibu Hamil mengikuti Kelas Ibu Hamil</th>
                              <th colSpan="2">Jumlah Ibu Nifas mendapatkan Vitamin A</th>
                              <th colSpan="2">Jumlah Ibu Nifas / Menyusui mengikuti KB Pasca Persalinan</th>
                              <th rowSpan="3" className="align-middle" style={{ width: '55px', minWidth: '55px' }}>Jumlah Ibu Hamil/Nifas/Menyusui mendapatkan Edukasi</th>
                              <th colSpan="2">Jumlah sasaran yang dirujuk</th>
                            </tr>
                            {/* Header Baris 2 */}
                            <tr>
                              <th rowSpan="2">Ibu Hamil</th>
                              <th rowSpan="2">Ibu Nifas/ Menyusui</th>
                              <th colSpan="2">Datang</th>
                              <th colSpan="2">Tidak Datang</th>
                              <th colSpan="2">Berat Badan</th>
                              <th colSpan="2">Lingkar Lengan Atas</th>
                              <th colSpan="2">Tekanan Darah</th>
                              <th rowSpan="2">Bergejala TBC (memenuhi 2 gejala)</th>
                              <th rowSpan="2">Jumlah Ibu Hamil Mendapatkan TTD</th>
                              <th colSpan="2">Ibu Hamil Konsumsi TTD</th>
                              <th rowSpan="2">Jumlah Ibu Hamil yang Mendapatkan PMT Bumil KEK</th>
                              <th colSpan="2">Ibu Hamil konsumsi PMT</th>
                              <th>Ya</th>
                              <th>Tidak</th>
                              <th>Ya</th>
                              <th>Tidak</th>
                              <th>Ya</th>
                              <th>Tidak</th>
                              <th rowSpan="2">Ibu Hamil</th>
                              <th rowSpan="2">Ibu Nifas/ Menyusui</th>
                            </tr>
                            {/* Header Baris 3 */}
                            <tr>
                              <th>Ibu Hamil</th>
                              <th>Ibu Nifas/ Menyusui</th>
                              <th>Ibu Hamil</th>
                              <th>Ibu Nifas/ Menyusui</th>
                              <th>Hijau</th>
                              <th>Merah</th>
                              <th>Hijau</th>
                              <th>Merah/ KEK</th>
                              <th>Hijau</th>
                              <th>Merah</th>
                              <th>Setiap hari</th>
                              <th>Tidak</th>
                              <th>Setiap hari</th>
                              <th>Tidak</th>
                            </tr>
                            {/* Header Baris 4: Nomor Kolom 1 s/d 29 */}
                            <tr className="col-num-row">
                              <th className="cell-month">1</th>
                              {Array.from({ length: 28 }, (_, i) => (
                                <th key={i} className="cell-num">
                                  {i + 2}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="cell-month">Januari {exportYear}</td>
                              <td className="cell-num">12</td><td className="cell-num">10</td><td className="cell-num">11</td><td className="cell-num">9</td><td className="cell-num">1</td><td className="cell-num">1</td>
                              <td className="cell-num">20</td><td className="cell-num">0</td><td className="cell-num">19</td><td className="cell-num">1</td><td className="cell-num">20</td><td className="cell-num">0</td><td className="cell-num">0</td>
                              <td className="cell-num">11</td><td className="cell-num">10</td><td className="cell-num">1</td><td className="cell-num">1</td><td className="cell-num">1</td><td className="cell-num">0</td>
                              <td className="cell-num">9</td><td className="cell-num">2</td><td className="cell-num">9</td><td className="cell-num">0</td><td className="cell-num">8</td><td className="cell-num">1</td>
                              <td className="cell-num">20</td><td className="cell-num">1</td><td className="cell-num">0</td>
                            </tr>
                            <tr>
                              <td className="cell-month">Februari {exportYear}</td>
                              <td className="cell-num">12</td><td className="cell-num">10</td><td className="cell-num">10</td><td className="cell-num">9</td><td className="cell-num">2</td><td className="cell-num">1</td>
                              <td className="cell-num">18</td><td className="cell-num">1</td><td className="cell-num">18</td><td className="cell-num">1</td><td className="cell-num">19</td><td className="cell-num">0</td><td className="cell-num">0</td>
                              <td className="cell-num">10</td><td className="cell-num">9</td><td className="cell-num">1</td><td className="cell-num">1</td><td className="cell-num">1</td><td className="cell-num">0</td>
                              <td className="cell-num">8</td><td className="cell-num">2</td><td className="cell-num">9</td><td className="cell-num">0</td><td className="cell-num">8</td><td className="cell-num">1</td>
                              <td className="cell-num">19</td><td className="cell-num">1</td><td className="cell-num">0</td>
                            </tr>
                            <tr>
                              <td className="cell-month text-muted fst-italic">... (s/d Des)</td>
                              <td colSpan="28" className="text-muted py-1 text-center">... baris bulanan berlanjut lengkap s/d Desember ...</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW STRUKTUR TEMPLATE BAYI / BALITA / APRAS */}
                {selectedFormatCategory === 'bayi_balita_apras' && (
                  <div className="col-12 mt-2">
                    <div className="p-2.5 bg-white border border-secondary-subtle rounded-3 shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Preview Format Register Bayi, Balita &amp; Apras
                        </span>
                      </div>
                      <div className="table-responsive rekap-preview-container">
                        <table className="table table-bordered table-sm text-center mb-0 align-middle rekap-preview-table">
                          <thead>
                            {/* Header Baris 1 */}
                            <tr>
                              <th rowSpan="3" className="align-middle cell-month">Bulan dan Tahun</th>
                              <th colSpan="9">Jumlah</th>
                              <th colSpan="15">Jumlah Bayi/ Balita/ Apras dengan Hasil Penimbangan dan Pengukuran/ Pemantauan/ Pemeriksaan</th>
                              <th colSpan="7">Jumlah Bayi/Balita mendapat</th>
                              <th rowSpan="3" className="align-middle" style={{ width: '50px', minWidth: '50px' }}>Jumlah Balita Sakit</th>
                              <th colSpan="3">Jumlah sasaran dirujuk</th>
                            </tr>
                            {/* Header Baris 2 */}
                            <tr>
                              <th rowSpan="2">Bayi (0-11 bln)</th>
                              <th rowSpan="2">Balita (12 - 59 bln)</th>
                              <th rowSpan="2">Apras (60 - 72 bln)</th>
                              <th colSpan="3">Datang</th>
                              <th colSpan="3">Tidak Datang</th>
                              <th colSpan="2">Balita dengan ceklis perkembangan</th>
                              <th colSpan="4">BB/U (0-5 tahun)</th>
                              <th colSpan="2">Hasil Pengukuran PB/TB/Umur 0-5 tahun</th>
                              <th colSpan="2">IMT APRAS</th>
                              <th colSpan="2">Hasil Pengukuran Lingkar Kepala</th>
                              <th colSpan="2">Lingkar lengan Atas</th>
                              <th rowSpan="2">Bergejala TBC (Memenuhi 2 gejala)</th>
                              <th rowSpan="2">ASI Eksklusif (0-6 bulan)</th>
                              <th rowSpan="2">MP ASI (&gt;6 bulan) (Sesuai)</th>
                              <th rowSpan="2">Imunisasi (Bayi/Balita)</th>
                              <th rowSpan="2">Vitamin A</th>
                              <th rowSpan="2">Obat Cacing</th>
                              <th rowSpan="2">MT Pangan Lokal</th>
                              <th rowSpan="2">Jumlah sasaran mendapatkan edukasi</th>
                              <th rowSpan="2">Bayi (0-11 bln)</th>
                              <th rowSpan="2">Balita (12 - 59 bln)</th>
                              <th rowSpan="2">Apras (60 - 72 bln)</th>
                            </tr>
                            {/* Header Baris 3 */}
                            <tr>
                              <th>Bayi (0-11 bln)</th>
                              <th>Balita (12 - 59 bln)</th>
                              <th>Apras (60 - 72 bln)</th>
                              <th>Bayi (0-11 bln)</th>
                              <th>Balita (12 - 59 bln)</th>
                              <th>Apras (60 - 72 bln)</th>
                              <th>Lengkap</th>
                              <th>Tidak Lengkap</th>
                              <th>Naik (N)</th>
                              <th>Tidak Naik/ BGM/ Oranye</th>
                              <th>Gizi Baik</th>
                              <th>Gizi Buruk/Kurang/Lebih</th>
                              <th>Normal</th>
                              <th>Pendek/Tinggi Melebihi</th>
                              <th>Gizi Baik</th>
                              <th>Gizi Buruk/Kurang/Lebih</th>
                              <th>Normal</th>
                              <th>Melebihi/Kurang</th>
                              <th>Hijau</th>
                              <th>Kuning/ Merah</th>
                            </tr>
                            {/* Header Baris 4: Nomor Kolom 1 s/d 36 */}
                            <tr className="col-num-row">
                              <th className="cell-month">1</th>
                              {Array.from({ length: 35 }, (_, i) => (
                                <th key={i} className="cell-num">
                                  {i + 2}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="cell-month">Januari {exportYear}</td>
                              <td className="cell-num">25</td><td className="cell-num">52</td><td className="cell-num">24</td>
                              <td className="cell-num">22</td><td className="cell-num">45</td><td className="cell-num">18</td>
                              <td className="cell-num">3</td><td className="cell-num">7</td><td className="cell-num">6</td>
                              <td className="cell-num">83</td><td className="cell-num">2</td>
                              <td className="cell-num">81</td><td className="cell-num">4</td><td className="cell-num">83</td><td className="cell-num">2</td>
                              <td className="cell-num">83</td><td className="cell-num">2</td>
                              <td className="cell-num">17</td><td className="cell-num">1</td>
                              <td className="cell-num">84</td><td className="cell-num">1</td>
                              <td className="cell-num">84</td><td className="cell-num">1</td>
                              <td className="cell-num">0</td>
                              <td className="cell-num">19</td><td className="cell-num">59</td><td className="cell-num">60</td><td className="cell-num">13</td><td className="cell-num">0</td><td className="cell-num">3</td><td className="cell-num">85</td>
                              <td className="cell-num">2</td>
                              <td className="cell-num">0</td><td className="cell-num">1</td><td className="cell-num">0</td>
                            </tr>
                            <tr>
                              <td className="cell-month">Februari {exportYear}</td>
                              <td className="cell-num">25</td><td className="cell-num">52</td><td className="cell-num">24</td>
                              <td className="cell-num">23</td><td className="cell-num">47</td><td className="cell-num">19</td>
                              <td className="cell-num">2</td><td className="cell-num">5</td><td className="cell-num">5</td>
                              <td className="cell-num">85</td><td className="cell-num">1</td>
                              <td className="cell-num">83</td><td className="cell-num">3</td><td className="cell-num">84</td><td className="cell-num">2</td>
                              <td className="cell-num">85</td><td className="cell-num">1</td>
                              <td className="cell-num">18</td><td className="cell-num">1</td>
                              <td className="cell-num">85</td><td className="cell-num">1</td>
                              <td className="cell-num">85</td><td className="cell-num">1</td>
                              <td className="cell-num">0</td>
                              <td className="cell-num">20</td><td className="cell-num">61</td><td className="cell-num">62</td><td className="cell-num">14</td><td className="cell-num">0</td><td className="cell-num">3</td><td className="cell-num">87</td>
                              <td className="cell-num">1</td>
                              <td className="cell-num">0</td><td className="cell-num">1</td><td className="cell-num">0</td>
                            </tr>
                            <tr>
                              <td className="cell-month text-muted fst-italic">... (s/d Des)</td>
                              <td colSpan="35" className="text-muted py-1 text-center">... baris bulanan berlanjut lengkap s/d Desember ...</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW STRUKTUR TEMPLATE ANAK USIA SEKOLAH & REMAJA */}
                {selectedFormatCategory === 'remaja' && (
                  <div className="col-12 mt-2">
                    <div className="p-2.5 bg-white border border-secondary-subtle rounded-3 shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Preview Format Register Anak Usia Sekolah dan Remaja
                        </span>
                      </div>
                      <div className="table-responsive rekap-preview-container">
                        <table className="table table-bordered table-sm text-center mb-0 align-middle rekap-preview-table">
                          <thead>
                            {/* Header Baris 1 */}
                            <tr>
                              <th rowSpan="4" className="align-middle cell-month">Bulan dan Tahun</th>
                              <th colSpan="6">Jumlah Usia Sekolah / Remaja</th>
                              <th colSpan="19">Jumlah Usia Sekolah/Remaja dengan Hasil Penimbangan/Pengukuran/Pemeriksaan</th>
                            </tr>
                            {/* Header Baris 2 */}
                            <tr>
                              <th rowSpan="3">6 - 14 Tahun</th>
                              <th rowSpan="3">15 - 18 Tahun</th>
                              <th colSpan="2">Datang</th>
                              <th colSpan="2">Tidak Datang</th>
                              <th colSpan="5">IMT</th>
                              <th colSpan="7">Remaja berusia &ge; 15 tahun</th>
                              <th colSpan="2">Remaja Putri</th>
                              <th rowSpan="3">Bergejala TBC (memenuhi 2 gejala)</th>
                              <th colSpan="2">Skrining Jiwa</th>
                              <th rowSpan="3">Jumlah Usia Sekolah/ Remaja mendapatkan edukasi</th>
                              <th rowSpan="3">Jumlah Usia Sekolah/ Remaja dirujuk</th>
                            </tr>
                            {/* Header Baris 3 */}
                            <tr>
                              <th rowSpan="2">6 - 14 Tahun</th>
                              <th rowSpan="2">15 - 18 Tahun</th>
                              <th rowSpan="2">6 - 14 Tahun</th>
                              <th rowSpan="2">15 - 18 Tahun</th>
                              <th rowSpan="2">Sangat Kurus</th>
                              <th rowSpan="2">Kurus</th>
                              <th rowSpan="2">Normal</th>
                              <th rowSpan="2">Gemuk</th>
                              <th rowSpan="2">Obesitas</th>
                              <th rowSpan="2">Lingkar Perut (cm)<br/>P : &gt; 80 cm, L : &gt; 90 cm</th>
                              <th colSpan="3">Tekanan Darah</th>
                              <th colSpan="3">Gula Darah</th>
                              <th rowSpan="2">Anemia</th>
                              <th rowSpan="2">Tidak Anemia</th>
                              <th rowSpan="2">Sudah</th>
                              <th rowSpan="2">Belum</th>
                            </tr>
                            {/* Header Baris 4 */}
                            <tr>
                              <th>Rendah</th>
                              <th>Normal</th>
                              <th>Tinggi</th>
                              <th>Rendah</th>
                              <th>Normal</th>
                              <th>Tinggi</th>
                            </tr>
                            {/* Header Baris 5: Nomor Kolom 1 s/d 26 */}
                            <tr className="col-num-row">
                              <th className="cell-month">1</th>
                              {Array.from({ length: 25 }, (_, i) => (
                                <th key={i} className="cell-num">
                                  {i + 2}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="cell-month">Januari {exportYear}</td>
                              <td className="cell-num">28</td><td className="cell-num">18</td><td className="cell-num">25</td><td className="cell-num">16</td><td className="cell-num">3</td><td className="cell-num">2</td>
                              <td className="cell-num">0</td><td className="cell-num">3</td><td className="cell-num">34</td><td className="cell-num">3</td><td className="cell-num">1</td>
                              <td className="cell-num">2</td><td className="cell-num">1</td><td className="cell-num">14</td><td className="cell-num">1</td><td className="cell-num">0</td><td className="cell-num">15</td><td className="cell-num">1</td>
                              <td className="cell-num">2</td><td className="cell-num">18</td><td className="cell-num">0</td><td className="cell-num">39</td><td className="cell-num">2</td><td className="cell-num">41</td><td className="cell-num">1</td>
                            </tr>
                            <tr>
                              <td className="cell-month">Februari {exportYear}</td>
                              <td className="cell-num">28</td><td className="cell-num">18</td><td className="cell-num">26</td><td className="cell-num">17</td><td className="cell-num">2</td><td className="cell-num">1</td>
                              <td className="cell-num">0</td><td className="cell-num">2</td><td className="cell-num">36</td><td className="cell-num">3</td><td className="cell-num">1</td>
                              <td className="cell-num">3</td><td className="cell-num">1</td><td className="cell-num">15</td><td className="cell-num">1</td><td className="cell-num">0</td><td className="cell-num">16</td><td className="cell-num">1</td>
                              <td className="cell-num">2</td><td className="cell-num">19</td><td className="cell-num">0</td><td className="cell-num">41</td><td className="cell-num">1</td><td className="cell-num">42</td><td className="cell-num">0</td>
                            </tr>
                            <tr>
                              <td className="cell-month text-muted fst-italic">... (s/d Des)</td>
                              <td colSpan="25" className="text-muted py-1 text-center">... baris bulanan berlanjut lengkap s/d Desember ...</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW STRUKTUR TEMPLATE USIA DEWASA DAN LANSIA */}
                {selectedFormatCategory === 'dewasa_lansia' && (
                  <div className="col-12 mt-2">
                    <div className="p-2.5 bg-white border border-secondary-subtle rounded-3 shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Preview Format Register Usia Dewasa dan Lansia
                        </span>
                      </div>
                      <div className="table-responsive rekap-preview-container">
                        <table className="table table-bordered table-sm text-center mb-0 align-middle rekap-preview-table">
                          <thead>
                            {/* Header Baris 1 */}
                            <tr>
                              <th rowSpan="4" className="align-middle cell-month">Bulan dan Tahun</th>
                              <th colSpan="6">Jumlah Usia Dewasa / Lansia</th>
                              <th colSpan="40">Hasil Penimbangan/ Pengukuran/ Pemeriksaan</th>
                            </tr>
                            {/* Header Baris 2 */}
                            <tr>
                              <th rowSpan="3">19-59 th</th>
                              <th rowSpan="3">&ge; 60 th</th>
                              <th colSpan="2">Datang</th>
                              <th colSpan="2">Tidak Datang</th>
                              <th colSpan="15">Usia Produktif dan Lansia</th>
                              <th colSpan="3">Skrining jiwa (&ge; 18 th)</th>
                              <th colSpan="2">Skrining PUMA (&ge; 40 th)</th>
                              <th colSpan="17">Lansia</th>
                              <th rowSpan="3">Imunisasi Covid 19</th>
                              <th rowSpan="3">Mendapatkan Edukasi</th>
                              <th rowSpan="3">Jumlah dirujuk</th>
                            </tr>
                            {/* Header Baris 3 */}
                            <tr>
                              <th rowSpan="2">19-59 Th</th>
                              <th rowSpan="2">&ge; 60 th</th>
                              <th rowSpan="2">19-59 Th</th>
                              <th rowSpan="2">&ge; 60 th</th>
                              <th colSpan="5">IMT</th>
                              <th colSpan="2">Lingkar Perut</th>
                              <th colSpan="3">Tekanan Darah</th>
                              <th colSpan="3">Gula Darah</th>
                              <th colSpan="2">Kolesterol</th>
                              <th colSpan="3">Kesehatan Jiwa</th>
                              <th rowSpan="2">Normal &lt; 6</th>
                              <th rowSpan="2">Tinggi &gt; 6</th>
                              <th colSpan="5">Tingkat Kemandirian (AKS)</th>
                              <th colSpan="12">Skrining Lansia (SKILAS)</th>
                            </tr>
                            {/* Header Baris 4 */}
                            <tr>
                              <th>Sgt Kurus</th><th>Kurus</th><th>Normal</th><th>Gemuk</th><th>Obesitas</th>
                              <th>L &gt; 90</th><th>P &gt; 80</th>
                              <th>Rendah</th><th>Normal</th><th>Tinggi</th>
                              <th>Rendah</th><th>Normal</th><th>Tinggi</th>
                              <th>Normal</th><th>Tinggi</th>
                              <th>&le; 5</th><th>&ge; 6</th><th>P17=Ya</th>
                              <th>A(M)</th><th>B(R)</th><th>B(S)</th><th>C(B)</th><th>C(T)</th>
                              <th>Kog Ya</th><th>Kog Tdk</th>
                              <th>Grk Ya</th><th>Grk Tdk</th>
                              <th>Nut Ya</th><th>Nut Tdk</th>
                              <th>Dgr Ya</th><th>Dgr Tdk</th>
                              <th>Lihat Ya</th><th>Lihat Tdk</th>
                              <th>Dep Ya</th><th>Dep Tdk</th>
                            </tr>
                            {/* Header Baris 5: Nomor Kolom 1 s/d 47 */}
                            <tr className="col-num-row">
                              <th className="cell-month">1</th>
                              {Array.from({ length: 46 }, (_, i) => (
                                <th key={i} className="cell-num">
                                  {i + 2}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="cell-month">Januari {exportYear}</td>
                              <td className="cell-num">75</td><td className="cell-num">38</td><td className="cell-num">68</td><td className="cell-num">34</td><td className="cell-num">7</td><td className="cell-num">4</td>
                              <td className="cell-num">0</td><td className="cell-num">4</td><td className="cell-num">76</td><td className="cell-num">14</td><td className="cell-num">6</td>
                              <td className="cell-num">9</td><td className="cell-num">15</td>
                              <td className="cell-num">4</td><td className="cell-num">78</td><td className="cell-num">20</td>
                              <td className="cell-num">2</td><td className="cell-num">88</td><td className="cell-num">12</td>
                              <td className="cell-num">79</td><td className="cell-num">23</td>
                              <td className="cell-num">98</td><td className="cell-num">4</td><td className="cell-num">0</td>
                              <td className="cell-num">54</td><td className="cell-num">4</td>
                              <td className="cell-num">28</td><td className="cell-num">4</td><td className="cell-num">2</td><td className="cell-num">0</td><td className="cell-num">0</td>
                              <td className="cell-num">3</td><td className="cell-num">31</td><td className="cell-num">4</td><td className="cell-num">30</td><td className="cell-num">2</td><td className="cell-num">32</td><td className="cell-num">5</td><td className="cell-num">29</td><td className="cell-num">7</td><td className="cell-num">27</td><td className="cell-num">1</td><td className="cell-num">33</td>
                              <td className="cell-num">32</td><td className="cell-num">102</td><td className="cell-num">6</td>
                            </tr>
                            <tr>
                              <td className="cell-month text-muted fst-italic">... (s/d Des)</td>
                              <td colSpan="46" className="text-muted py-1 text-center">... baris bulanan berlanjut lengkap s/d Desember ...</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW STRUKTUR TEMPLATE SEMUA KATEGORI */}
                {selectedFormatCategory === 'Semua Kategori (Rekap Data)' && (
                  <div className="col-12 mt-2">
                    <div className="p-2.5 bg-white border border-secondary-subtle rounded-3 shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Preview Format Daftar Rekap Data Terpadu
                        </span>
                      </div>
                      <div className="table-responsive rekap-preview-container">
                        <table className="table table-bordered table-sm text-center mb-0 align-middle rekap-preview-table">
                          <thead>
                            <tr>
                              <th style={{ width: '28px' }}>No</th>
                              <th style={{ width: '90px' }}>NIK</th>
                              <th style={{ width: '120px' }}>Nama Lengkap</th>
                              <th style={{ width: '40px' }}>JK</th>
                              <th style={{ width: '45px' }}>Usia</th>
                              <th style={{ width: '80px' }}>Kategori</th>
                              <th style={{ width: '75px' }}>Tgl Periksa</th>
                              <th style={{ width: '110px' }}>Hasil Utama</th>
                              <th style={{ width: '85px' }}>Status Rujukan</th>
                              <th style={{ width: '95px' }}>Kader Pemeriksa</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>3201015502980001</td>
                              <td className="text-start ps-2 fw-medium">Siti Rahmawati</td>
                              <td>P</td>
                              <td>28 th</td>
                              <td>Bumil</td>
                              <td>12/01/2026</td>
                              <td>BB: 54 kg, TD: 110/70</td>
                              <td><span className="badge bg-success-subtle text-success border px-1.5 py-0.5" style={{ fontSize: '0.50rem' }}>Tidak Dirujuk</span></td>
                              <td>Kader Posyandu</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>3201011203240002</td>
                              <td className="text-start ps-2 fw-medium">Ahmad Fauzi</td>
                              <td>L</td>
                              <td>18 bln</td>
                              <td>Balita</td>
                              <td>12/01/2026</td>
                              <td>BB: 10.2 kg, TB: 82 cm</td>
                              <td><span className="badge bg-warning-subtle text-warning-emphasis border px-1.5 py-0.5" style={{ fontSize: '0.50rem' }}>Perlu Pantau</span></td>
                              <td>Kader Posyandu</td>
                            </tr>
                            <tr>
                              <td colSpan="10" className="text-muted py-1 text-center">... baris data sasaran dan pemeriksaan berlanjut sesuai filter ...</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <div className="modal-footer border-top px-4 py-2.5 bg-light d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-light btn-sm px-3 fw-medium border" 
              onClick={onClose}
              disabled={isExporting}
            >
              Batal
            </button>
            <button 
              type="button" 
              className="btn btn-sm px-4 fw-bold d-flex align-items-center gap-2 shadow-sm text-white"
              style={{ backgroundColor: primaryColor, border: 'none' }}
              onClick={handleDownload}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Menyiapkan Excel...
                </>
              ) : (
                <>
                  <Download size={16} /> Unduh Format Excel (.xls)
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
