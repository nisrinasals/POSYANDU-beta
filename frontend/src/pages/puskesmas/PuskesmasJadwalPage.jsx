import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  UserPlus, 
  X, 
  Check, 
  Info, 
  Building2, 
  CalendarCheck, 
  Users,
  FileText 
} from 'lucide-react';
import { daftarNakesPuskesmas } from '../../data/mockData';
import { sesiService } from '../../services';

export default function PuskesmasJadwalPage({ 
  globalJadwalList = [], 
  setGlobalJadwalList,
  onRefreshData
}) {
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [posyanduFilter, setPosyanduFilter] = useState('Semua');
  const [bulanFilter, setBulanFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [alertNotification, setAlertNotification] = useState(null);

  // Assign Form state
  const [assignForm, setAssignForm] = useState({
    nakesNama: '',
    nakesRole: '',
    statusKesiapan: '',
    catatanFaskes: ''
  });

  const showToast = (message) => {
    setAlertNotification(message);
    setTimeout(() => {
      setAlertNotification(null);
    }, 3500);
  };

  // Filtered List se-wilayah
  const filteredList = useMemo(() => {
    return (globalJadwalList || [])
      .filter((item) => {
        // Posyandu filter
        const matchPosyandu = posyanduFilter === 'Semua' || 
          (item.posyandu && item.posyandu.toLowerCase().includes(posyanduFilter.toLowerCase()));

        // Bulan filter
        const matchMonth = bulanFilter === 'Semua' || (item.tanggal && item.tanggal.startsWith(bulanFilter));

        // Search query filter (posyandu or RW or lokasi or nakes)
        const matchSearch = searchQuery === '' ||
          (item.posyandu && item.posyandu.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.rw && item.rw.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.lokasi && item.lokasi.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.nakesPendamping && item.nakesPendamping.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status filter
        const matchStatus = statusFilter === 'Semua' || 
          (statusFilter === 'Siap' && (item.statusKesiapan === 'Siap' || item.status === 'Siap')) ||
          (statusFilter === 'Menunggu' && (item.statusKesiapan === 'Menunggu' || item.status === 'Terjadwal')) ||
          (statusFilter === 'Selesai' && item.status === 'Selesai');

        return matchPosyandu && matchMonth && matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
  }, [globalJadwalList, posyanduFilter, bulanFilter, searchQuery, statusFilter]);

  // Statistics calculation for the current items
  const stats = useMemo(() => {
    const currentItems = (globalJadwalList || []).filter(
      item => bulanFilter === 'Semua' || (item.tanggal && item.tanggal.startsWith(bulanFilter))
    );
    const total = currentItems.length;
    const selesai = currentItems.filter(j => j.status === 'Selesai').length;
    const mendatang = currentItems.filter(j => j.status !== 'Selesai').length;

    return {
      total,
      selesai,
      mendatang
    };
  }, [globalJadwalList, bulanFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleOpenAssign = (jadwal) => {
    setSelectedJadwal(jadwal);
    setAssignForm({
      nakesNama: (jadwal.nakesPendamping && jadwal.nakesPendamping !== 'Belum Ditugaskan') ? jadwal.nakesPendamping : '',
      nakesRole: (jadwal.nakesRole && jadwal.nakesRole !== 'Belum Ditentukan') ? jadwal.nakesRole : '',
      statusKesiapan: (jadwal.statusKesiapan && jadwal.statusKesiapan !== 'Menunggu') ? jadwal.statusKesiapan : '',
      catatanFaskes: jadwal.catatan || ''
    });
    setIsAssignModalOpen(true);
  };

  const handleNakesSelect = (nama) => {
    const found = daftarNakesPuskesmas.find(n => n.nama === nama);
    setAssignForm(prev => ({
      ...prev,
      nakesNama: nama,
      nakesRole: found ? found.jabatan : 'Tenaga Kesehatan Puskesmas'
    }));
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!selectedJadwal) return;

    if (selectedJadwal.id) {
      try {
        await sesiService.updateSesi(selectedJadwal.id, {
          catatan: assignForm.catatanFaskes || selectedJadwal.catatan
        });
      } catch (err) {
        console.info('Backend update sesi note:', err);
      }
    }

    setGlobalJadwalList(prev =>
      prev.map(item => {
        if (item.id === selectedJadwal.id) {
          return {
            ...item,
            nakesPendamping: assignForm.nakesNama,
            nakesRole: assignForm.nakesRole,
            statusKesiapan: assignForm.statusKesiapan,
            catatan: assignForm.catatanFaskes || item.catatan
          };
        }
        return item;
      })
    );

    showToast(`Nakes ${assignForm.nakesNama} berhasil ditugaskan ke ${selectedJadwal.posyandu}!`);
    setIsAssignModalOpen(false);
    onRefreshData?.();
  };

  const handleOpenDetail = (jadwal) => {
    setSelectedJadwal(jadwal);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="d-flex flex-column gap-4 pb-5">
      {/* Toast Notification */}
      {alertNotification && (
        <div 
          className="alert alert-success border-0 shadow-sm rounded-3 position-fixed bottom-0 end-0 m-4 z-3 d-flex align-items-center gap-3 text-white" 
          style={{ backgroundColor: '#428A75' }}
        >
          <CheckCircle2 size={20} />
          <span className="fw-medium">{alertNotification}</span>
        </div>
      )}

      {/* Filter & Action Bar */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-3.5">
        <div className="row g-3 align-items-center">
          {/* Search bar */}
          <div className="col-12 col-lg-5">
            <div className="position-relative">
              <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input 
                type="text" 
                className="form-control ps-5 pe-4 bg-light border-0 rounded-3 shadow-none"
                placeholder="Cari nama posyandu, RW, lokasi, atau nakes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ fontSize: '0.875rem', height: '44px' }}
              />
              {searchQuery && (
                <button 
                  className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 p-1 shadow-none"
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Posyandu Filter Dropdown */}
          <div className="col-12 col-sm-6 col-lg-4">
            <select 
              className="form-select bg-light border-0 rounded-3 text-dark fw-semibold shadow-none px-3"
              style={{ fontSize: '0.875rem', height: '44px', cursor: 'pointer' }}
              value={posyanduFilter}
              onChange={(e) => {
                setPosyanduFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Semua">Semua Posyandu</option>
              <option value="Melati">Posyandu Melati</option>
              <option value="Mawar">Posyandu Mawar</option>
              <option value="Anggrek">Posyandu Anggrek</option>
              <option value="Dahlia">Posyandu Dahlia</option>
              <option value="Kenanga">Posyandu Kenanga</option>
              <option value="Cempaka">Posyandu Cempaka</option>
              <option value="Teratai">Posyandu Teratai</option>
              <option value="Flamboyan">Posyandu Flamboyan</option>
              <option value="Kamboja">Posyandu Kamboja</option>
              <option value="Sakura">Posyandu Sakura</option>
              <option value="Bougenville">Posyandu Bougenville</option>
              <option value="Nusa Indah">Posyandu Nusa Indah</option>
            </select>
          </div>

          {/* Month Selector Dropdown */}
          <div className="col-12 col-sm-6 col-lg-3">
            <select 
              className="form-select bg-light border-0 rounded-3 text-dark fw-semibold shadow-none px-3"
              style={{ fontSize: '0.875rem', height: '44px', cursor: 'pointer' }}
              value={bulanFilter}
              onChange={(e) => {
                setBulanFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Semua">Semua Jadwal</option>
              <option value="2026">Tahun 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2025-06">Juni 2025</option>
              <option value="2025-05">Mei 2025</option>
              <option value="2025-07">Juli 2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card: Daftar Jadwal Posyandu Se-Wilayah Kerja */}
      <div className="card border-0 bg-white rounded-4 shadow-xs p-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <CalendarCheck size={20} style={{ color: '#428A75' }} />
              <span>Daftar Jadwal Posyandu Se-Wilayah Kerja</span>
            </h5>
            <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
              Menampilkan {paginatedList.length} dari {filteredList.length} total jadwal operasional posyandu
            </p>
          </div>
          <div className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill small fw-semibold align-self-start align-self-sm-center">
            Periode: {bulanFilter === 'Semua' ? 'Semua Jadwal' : bulanFilter}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr className="text-secondary small fw-bold bg-light" style={{ borderBottom: '2px solid #edf2f7', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                <th className="py-3 px-3 text-center" style={{ width: '55px' }}>NO</th>
                <th className="py-3 px-3">NAMA POSYANDU &amp; RW</th>
                <th className="py-3 px-3">TANGGAL &amp; WAKTU</th>
                <th className="py-3 px-3">LOKASI</th>
                <th className="py-3 px-3">FOKUS LAYANAN</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-end">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <Info size={32} className="opacity-40 mb-2" />
                    <div>Tidak ada jadwal posyandu yang cocok untuk wilayah dan filter yang dipilih.</div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isSiap = item.statusKesiapan === 'Siap';
                  const isFinished = item.status === 'Selesai';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* NO */}
                      <td className="py-3 px-3 text-center text-muted fw-semibold" style={{ fontSize: '0.875rem' }}>
                        {rowNumber}
                      </td>

                      {/* NAMA POSYANDU & RW */}
                      <td className="py-3 px-3">
                        <div className="fw-bold text-dark" style={{ fontSize: '0.925rem' }}>
                          {item.posyandu}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.825rem' }}>
                          {item.rw}
                        </div>
                      </td>

                      {/* TANGGAL & WAKTU */}
                      <td className="py-3 px-3">
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                          {item.tanggalFormatted}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.825rem' }}>
                          {item.waktu}
                        </div>
                      </td>

                      {/* LOKASI */}
                      <td className="py-3 px-3">
                        <div className="text-dark fw-medium" style={{ fontSize: '0.875rem' }}>
                          {item.lokasi}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          {item.alamatDetail}
                        </div>
                      </td>

                      {/* FOKUS LAYANAN */}
                      <td className="py-3 px-3">
                        <div className="d-flex flex-wrap gap-1.5">
                          {item.fokusLayanan?.map((layanan, fIdx) => (
                            <span 
                              key={fIdx} 
                              className="badge bg-light text-dark border px-2.5 py-1 rounded-2"
                              style={{ fontSize: '0.78rem', fontWeight: 500 }}
                            >
                              {layanan}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-3 text-center">
                        {isFinished ? (
                          <span className="badge px-3 py-1.5 rounded-pill fw-semibold bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.78rem' }}>
                            Selesai
                          </span>
                        ) : isSiap ? (
                          <span className="badge px-3 py-1.5 rounded-pill fw-semibold text-white" style={{ backgroundColor: '#428A75', fontSize: '0.78rem' }}>
                            Siap
                          </span>
                        ) : (
                          <span className="badge px-3 py-1.5 rounded-pill fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '0.78rem' }}>
                            Menunggu
                          </span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="py-3 px-3 text-end text-nowrap">
                        <button 
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none"
                          onClick={() => handleOpenDetail(item)}
                          title="Lihat Detail Jadwal"
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

        {/* Table Footer: Pagination */}
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 pt-3 mt-2 border-top">
          <div className="text-muted small" style={{ fontSize: '0.825rem' }}>
            Menampilkan <span className="fw-semibold text-dark">{paginatedList.length}</span> dari <span className="fw-semibold text-dark">{filteredList.length}</span> jadwal posyandu
          </div>

          <div className="d-flex align-items-center gap-1">
            <button 
              className="btn btn-sm btn-light border p-1.5 rounded-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, pIdx) => (
              <button 
                key={pIdx + 1}
                className={`btn btn-sm px-2.5 py-1 rounded-2 fw-semibold ${currentPage === pIdx + 1 ? 'text-white' : 'btn-light border text-secondary'}`}
                style={{ 
                  fontSize: '0.8rem', 
                  minWidth: '32px',
                  backgroundColor: currentPage === pIdx + 1 ? '#428A75' : undefined,
                  borderColor: currentPage === pIdx + 1 ? '#428A75' : undefined
                }}
                onClick={() => setCurrentPage(pIdx + 1)}
              >
                {pIdx + 1}
              </button>
            ))}
            <button 
              className="btn btn-sm btn-light border p-1.5 rounded-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Tugaskan Nakes Pendamping */}
      {isAssignModalOpen && selectedJadwal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3 bg-white">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Tugaskan Nakes Pendamping</h5>
                  <p className="text-muted small mb-0">
                    Alokasikan tenaga kesehatan Puskesmas untuk mendampingi kegiatan posyandu.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setIsAssignModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveAssignment}>
                <div className="modal-body p-4 bg-white">
                  {/* Posyandu Info Banner */}
                  <div className="p-3 bg-light rounded-3 border mb-3 small">
                    <div className="fw-bold text-dark fs-6 mb-1">{selectedJadwal.posyandu} ({selectedJadwal.rw})</div>
                    <div className="text-muted">
                      <strong>Waktu:</strong> {selectedJadwal.tanggalFormatted} • {selectedJadwal.waktu}
                    </div>
                    <div className="text-muted">
                      <strong>Lokasi:</strong> {selectedJadwal.lokasi} ({selectedJadwal.alamatDetail})
                    </div>
                    <div className="mt-1">
                      <strong>Fokus Layanan:</strong> {selectedJadwal.fokusLayanan?.join(', ')}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Pilih Tenaga Kesehatan Puskesmas</label>
                    <select 
                      className="form-select form-select-sm"
                      value={assignForm.nakesNama}
                      onChange={(e) => handleNakesSelect(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Nakes --</option>
                      {daftarNakesPuskesmas.map((nakes) => (
                        <option key={nakes.id} value={nakes.nama}>
                          {nakes.nama} — {nakes.jabatan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Peran / Jabatan Penugasan</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      value={assignForm.nakesRole}
                      onChange={(e) => setAssignForm({ ...assignForm, nakesRole: e.target.value })}
                      placeholder="Contoh: Bidan Wilayah / Pendamping Utama"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Status Kesiapan</label>
                    <select 
                      className="form-select form-select-sm"
                      value={assignForm.statusKesiapan}
                      onChange={(e) => setAssignForm({ ...assignForm, statusKesiapan: e.target.value })}
                    >
                      <option value="Siap">Siap (Petugas Terkonfirmasi Hadir)</option>
                      <option value="Menunggu">Menunggu (Belum Terkonfirmasi)</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-dark">Catatan / Arahan Puskesmas untuk Kader</label>
                    <textarea 
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="Instruksi tambahan, kesiapan logistik seperti strip tes gula, vial vaksin, dsb..."
                      value={assignForm.catatanFaskes}
                      onChange={(e) => setAssignForm({ ...assignForm, catatanFaskes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-3"
                    onClick={() => setIsAssignModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-sm text-white px-4 py-1.5 rounded-3 fw-semibold"
                    style={{ backgroundColor: '#428A75', borderColor: '#428A75' }}
                  >
                    Simpan Penugasan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detail Jadwal Posyandu (Standard Posyandu-Aligned Structure) */}
      {isDetailModalOpen && selectedJadwal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: '#428A75' }}>
                <div className="d-flex align-items-center gap-2">
                  <FileText size={19} color="#ffffff" style={{ stroke: '#ffffff' }} />
                  <h5 className="modal-title fw-bold mb-0" style={{ color: '#ffffff', fontSize: '1.05rem' }}>
                    Detail Jadwal Posyandu
                  </h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setIsDetailModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="row g-3">
                  {/* Card 1: Informasi Pelaksanaan */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-xs rounded-3 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom text-dark">
                        <Calendar size={16} style={{ color: '#428A75' }} />
                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>Waktu Pelaksanaan</h6>
                      </div>
                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: '0.82rem' }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: '125px' }}>Hari / Tanggal</td>
                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.tanggalFormatted || selectedJadwal.tanggal}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Waktu Pelaksanaan</td>
                            <td className="py-1 text-dark">: {selectedJadwal.waktu || '08.00 - 11.30 WIB'}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Status Jadwal</td>
                            <td className="py-1">
                              : <span className={`badge ${selectedJadwal.status === 'Selesai' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'} px-2 py-0.5 rounded-pill`}>
                                {selectedJadwal.status || 'Terjadwal'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 2: Lokasi & Wilayah */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-xs rounded-3 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom text-dark">
                        <MapPin size={16} className="text-danger" />
                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>Lokasi & Wilayah</h6>
                      </div>
                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: '0.82rem' }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: '125px' }}>Lokasi / Tempat</td>
                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.lokasi}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Alamat Detail / RT</td>
                            <td className="py-1 text-dark">: {selectedJadwal.alamatDetail || selectedJadwal.rw || '-'}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Posyandu</td>
                            <td className="py-1 text-dark">: {selectedJadwal.posyandu}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 3: Fokus Layanan & Catatan */}
                  <div className="col-12">
                    <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
                      <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Fokus Layanan Hari Ini</h6>
                      <div className="d-flex flex-wrap gap-1.5 mb-3">
                        {(selectedJadwal.fokusLayanan && selectedJadwal.fokusLayanan.length > 0 ? selectedJadwal.fokusLayanan : ['Bumil', 'Bayi & Balita', 'Dewasa', 'Lansia']).map((layanan, i) => (
                          <span key={i} className="badge bg-light text-secondary border px-2.5 py-1 rounded-2" style={{ fontSize: '0.78rem' }}>
                            {layanan}
                          </span>
                        ))}
                      </div>

                      <div className="p-3 bg-light rounded-2 border">
                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.74rem' }}>Catatan Persiapan:</span>
                        <p className="mb-0 text-dark fw-medium" style={{ fontSize: '0.84rem' }}>
                          {selectedJadwal.catatan || 'Harap siapkan alat antropometri kit terstandar, buku KIA, dan form skrining PTM dewasa.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top py-2.5 px-4 d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-secondary px-4 fw-semibold rounded-3" 
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setIsDetailModalOpen(false)}
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
