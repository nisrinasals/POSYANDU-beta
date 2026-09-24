import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye,
  Filter, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  X 
} from 'lucide-react';
import DetailSasaranModal from '../../components/sasaran/DetailSasaranModal';

export default function DinkesDataSasaranPage({ 
  globalSasaranList = [], 
  globalPemeriksaanData = {}, 
  onNavigate, 
  initialCategoryFilter, 
  setCategoryFilterParam 
}) {
  const themeColor = '#1e3a8a';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryFilter && initialCategoryFilter !== 'Semua Kategori' ? initialCategoryFilter : 'all'
  );
  const [selectedPuskesmas, setSelectedPuskesmas] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected sasaran for detailed modal
  const [selectedSasaran, setSelectedSasaran] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dataset directly reflecting database state
  const dataset = globalSasaranList || [];

  const totalSasaran = dataset.length;

  const filteredData = useMemo(() => {
    return dataset.filter(item => {
      // 1. Search Query
      const matchesSearch = 
        (item.nama && item.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.nik && item.nik.includes(searchQuery)) ||
        (item.noKk && item.noKk.includes(searchQuery)) ||
        (item.posyandu && item.posyandu.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category Filter
      let matchesCategory = true;
      if (selectedCategory !== 'all' && selectedCategory !== 'Semua Kategori') {
        const itemCat = (item.kategori || '').toLowerCase().replace(/[–—]/g, '-').trim();
        const selCat = selectedCategory.toLowerCase().replace(/[–—]/g, '-').trim();
        matchesCategory = itemCat.includes(selCat) || selCat.includes(itemCat);
      }

      // 3. Puskesmas / Faskes Filter
      let matchesPuskesmas = true;
      if (selectedPuskesmas !== 'all') {
        const itemPusk = (item.puskesmas || item.posyandu || '').toLowerCase();
        matchesPuskesmas = itemPusk.includes(selectedPuskesmas.toLowerCase());
      }

      return matchesSearch && matchesCategory && matchesPuskesmas;
    });
  }, [dataset, searchQuery, selectedCategory, selectedPuskesmas]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleOpenDetailModal = (item) => {
    setSelectedSasaran(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSasaran(null);
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setStatusFilter('Semua Status');
    setSelectedCategory('all');
    setSelectedPuskesmas('all');
    setCurrentPage(1);
  };

  return (
    <div className="d-flex flex-column gap-3.5 pb-4">
      
      {/* Main Container Card */}
      <div 
        className="card border bg-white rounded-4 p-4 shadow-sm"
        style={{ borderRadius: '20px', borderColor: '#e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
      >
        {/* Search & Filter Bar */}
        <div className="row g-3 mb-4 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
              <input 
                type="text" 
                className="form-control ps-5 bg-white text-dark shadow-none"
                placeholder="Cari Nama / NIK / No. KK"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ 
                  height: '42px', 
                  fontSize: '0.875rem', 
                  borderRadius: '10px', 
                  borderColor: '#dbe5ee' 
                }}
              />
              {searchQuery && (
                <button 
                  className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 p-1" 
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Status */}
          <div className="col-6 col-md-3">
            <select 
              className="form-select bg-white text-dark fw-medium shadow-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ 
                height: '42px', 
                fontSize: '0.875rem', 
                borderRadius: '10px', 
                borderColor: '#dbe5ee' 
              }}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>

          {/* Filter Kategori Siklus */}
          <div className="col-6 col-md-3">
            <select 
              className="form-select bg-white text-dark fw-medium shadow-none"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              style={{ 
                height: '42px', 
                fontSize: '0.875rem', 
                borderRadius: '10px', 
                borderColor: '#dbe5ee' 
              }}
            >
              <option value="all">Semua Kategori</option>
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

          {/* Filter Action Button */}
          <div className="col-12 col-md-1">
            <button 
              className="btn btn-outline-dark text-dark fw-semibold w-100 d-flex align-items-center justify-content-center gap-1.5 shadow-none"
              style={{ 
                height: '42px', 
                borderRadius: '10px', 
                borderColor: '#dbe5ee',
                fontSize: '0.875rem' 
              }}
              onClick={handleResetFilter}
              title="Reset Filter"
            >
              <Filter size={15} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Data Sasaran Table */}
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: '0.86rem' }}>
            <thead>
              <tr className="text-muted small text-uppercase fw-bold border-bottom" style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                <th className="ps-4 py-3 text-center" style={{ width: '50px' }}>NO</th>
                <th className="py-3" style={{ minWidth: '180px' }}>NAMA LENGKAP / NIK</th>
                <th className="py-3 text-center" style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>TANGGAL LAHIR</th>
                <th className="py-3" style={{ minWidth: '130px' }}>KATEGORI</th>
                <th className="py-3 text-center" style={{ minWidth: '120px' }}>JENIS KELAMIN</th>
                <th className="py-3 text-center" style={{ minWidth: '100px' }}>STATUS</th>
                <th className="pe-4 py-3 text-center" style={{ width: '110px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted" style={{ fontSize: '0.9rem' }}>
                    Tidak ditemukan data sasaran yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="border-bottom">
                    <td className="ps-4 text-center text-secondary fw-semibold">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{item.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{item.nik || '-'}</div>
                    </td>
                    <td className="text-center text-secondary fw-medium text-nowrap">
                      {item.tglLahir || item.tanggalLahir || '-'}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark mb-0">{item.kategori}</div>
                    </td>
                    <td className="text-center text-secondary">
                      {item.gender || (item.jenisKelamin === 'P' || item.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki') || '-'}
                    </td>
                    <td className="text-center">
                      <span className={`badge rounded-pill px-2.5 py-1 ${item.status === 'Aktif' || !item.status ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.75rem' }}>
                        {item.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="pe-4 text-center text-nowrap">
                      <button 
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none rounded-3 px-2.5 py-1"
                        onClick={() => handleOpenDetailModal(item)}
                        title="Lihat Detail Sasaran"
                        style={{ fontSize: '0.785rem' }}
                      >
                        <Eye size={14} />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between pt-3 border-top mt-3 text-muted small gap-3">
          <div>
            Menampilkan <span className="fw-semibold text-dark">{paginatedData.length}</span> dari <span className="fw-semibold text-dark">{filteredData.length}</span> sasaran
          </div>

          <div className="d-flex align-items-center gap-1">
            <button 
              className="btn btn-sm btn-light border p-1 px-2 text-muted rounded-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page}
                className={`btn btn-sm px-3 py-1 rounded-2 fw-semibold ${
                  currentPage === page 
                    ? 'btn-danger text-white' 
                    : 'btn-light border text-dark'
                }`}
                style={{ 
                  backgroundColor: currentPage === page ? '#e11d48' : undefined,
                  borderColor: currentPage === page ? '#e11d48' : undefined,
                  fontSize: '0.82rem' 
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="btn btn-sm btn-light border p-1 px-2 text-muted rounded-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Sasaran */}
      {showDetailModal && selectedSasaran && (
        <DetailSasaranModal 
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          selectedSasaran={selectedSasaran}
          themeColor={themeColor}
        />
      )}

    </div>
  );
}
