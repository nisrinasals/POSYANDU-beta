<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { Search, Filter, Eye, Info, ChevronLeft, ChevronRight, User, Calendar, Heart, Activity, ShieldCheck, CheckCircle2, Stethoscope, Baby, UserCheck, Clock, FileText, AlertCircle, X } from "lucide-react";
import { Modal, Button } from "react-bootstrap";
import DetailSasaranModal from "../../components/sasaran/DetailSasaranModal";
import ExportSasaranButton from "../../components/sasaran/ExportSasaranButton";
import { formatDateId } from "../../utils/dataMappers";

export default function PuskesmasDataSasaranPage({ globalSasaranList = [], globalPemeriksaanData = {}, onNavigate, initialCategoryFilter, setCategoryFilterParam, user, userRole = "puskesmas" }) {
  const isDinkes = userRole === "dinkes" || user?.roleType?.includes("dinkes");
  const themeColor = isDinkes ? "#1e3a8a" : "#428A75";

  const [searchQuery, setSearchQuery] = useState("");
  const [posyanduFilter, setPosyanduFilter] = useState("Semua Posyandu");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter && initialCategoryFilter !== "Semua Kategori" ? initialCategoryFilter : "all");
=======
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Calendar, 
  Heart, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Stethoscope, 
  Baby, 
  UserCheck, 
  Clock, 
  FileText, 
  AlertCircle,
  X 
} from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import DetailSasaranModal from '../../components/sasaran/DetailSasaranModal';
import { formatIndoDate } from '../../utils/dataMappers';

export const defaultFallbackSasaranList = [];

export default function PuskesmasDataSasaranPage({ 
  globalSasaranList = [], 
  globalPemeriksaanData = {}, 
  onNavigate, 
  initialCategoryFilter, 
  setCategoryFilterParam,
  user,
  userRole = 'puskesmas'
}) {
  const isDinkes = userRole === 'dinkes' || user?.roleType?.includes('dinkes');
  const themeColor = isDinkes ? '#1e3a8a' : '#428A75';

  const [searchQuery, setSearchQuery] = useState('');
  const [posyanduFilter, setPosyanduFilter] = useState('Semua Posyandu');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryFilter && initialCategoryFilter !== 'Semua Kategori' ? initialCategoryFilter : 'all'
  );
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected sasaran for category-specific detailed view modal
  const [selectedSasaran, setSelectedSasaran] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sync category filter if changed from parent/dashboard
  React.useEffect(() => {
<<<<<<< HEAD
    if (initialCategoryFilter && initialCategoryFilter !== "Semua Kategori") {
=======
    if (initialCategoryFilter && initialCategoryFilter !== 'Semua Kategori') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      setSelectedCategory(initialCategoryFilter);
      setCurrentPage(1);
    }
  }, [initialCategoryFilter]);

  // Dataset directly reflecting database state
  const dataset = globalSasaranList || [];

  // Available Posyandu List for filter dropdown
  const availablePosyanduList = useMemo(() => {
<<<<<<< HEAD
    const list = [];
    dataset.forEach((item) => {
      if (item.posyandu) {
        const rawName = item.posyandu.split("—")[0].split("RW")[0].trim();
=======
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
    dataset.forEach(item => {
      if (item.posyandu) {
        const rawName = item.posyandu.split('—')[0].split('RW')[0].trim();
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
        if (rawName && !list.includes(rawName)) {
          list.push(rawName);
        }
      }
    });
    return list;
  }, [dataset]);

  // Filtered dataset
  const filteredData = useMemo(() => {
<<<<<<< HEAD
    return dataset.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || item.nama?.toLowerCase().includes(q) || item.nik?.includes(q) || item.noKk?.includes(q) || (item.keteranganIbuSuami && item.keteranganIbuSuami.toLowerCase().includes(q));

      const matchPosyandu = posyanduFilter === "Semua Posyandu" || posyanduFilter === "all" || (item.posyandu && item.posyandu.toLowerCase().includes(posyanduFilter.toLowerCase()));

      const matchStatus =
        statusFilter === "Semua Status" || statusFilter === "all" || (statusFilter === "Aktif" && item.status === "Aktif") || (statusFilter === "Non-Aktif" && (item.status === "Non-Aktif" || item.status === "Tidak Aktif"));

      const normItemKat = (item.kategori || "").toLowerCase().replace(/[–—]/g, "-").trim();
      const normSelKat = selectedCategory.toLowerCase().replace(/[–—]/g, "-").trim();

      const matchCategory = selectedCategory === "all" || selectedCategory === "Semua Kategori" || normItemKat === normSelKat || normItemKat.includes(normSelKat) || normSelKat.includes(normItemKat);
=======
    return dataset.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        item.nama?.toLowerCase().includes(q) ||
        item.nik?.includes(q) ||
        item.noKk?.includes(q) ||
        (item.keteranganIbuSuami && item.keteranganIbuSuami.toLowerCase().includes(q));

      const matchPosyandu = 
        posyanduFilter === 'Semua Posyandu' || 
        posyanduFilter === 'all' ||
        (item.posyandu && item.posyandu.toLowerCase().includes(posyanduFilter.toLowerCase()));

      const matchStatus = 
        statusFilter === 'Semua Status' || 
        statusFilter === 'all' ||
        (statusFilter === 'Aktif' && (item.status === 'Aktif' || !item.status)) ||
        (statusFilter === 'Non-Aktif' && (item.status === 'Non-Aktif' || item.status === 'Tidak Aktif'));

      const normItemKat = (item.kategori || '').toLowerCase().replace(/[–—]/g, '-').trim();
      const normSelKat = selectedCategory.toLowerCase().replace(/[–—]/g, '-').trim();

      const matchCategory = 
        selectedCategory === 'all' || 
        selectedCategory === 'Semua Kategori' ||
        normItemKat === normSelKat ||
        normItemKat.includes(normSelKat) ||
        normSelKat.includes(normItemKat);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

      return matchSearch && matchPosyandu && matchStatus && matchCategory;
    });
  }, [dataset, searchQuery, posyanduFilter, statusFilter, selectedCategory]);

  // Dynamic Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenDetail = (item) => {
    setSelectedSasaran(item);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedSasaran(null);
  };

  return (
    <div className="d-flex flex-column gap-3 pb-4">
<<<<<<< HEAD
      <div className="d-flex justify-content-end">
        <ExportSasaranButton themeColor={themeColor} />
      </div>
=======
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      {/* Filter & Search Bar Section */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-3">
        <div className="row g-2.5 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="position-relative">
              <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
<<<<<<< HEAD
              <input
                type="text"
                className="form-control ps-5 bg-light border-0 rounded-3"
=======
              <input 
                type="text" 
                className="form-control ps-5 bg-light border-0 rounded-3" 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                placeholder="Cari Nama / NIK / No. KK..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
<<<<<<< HEAD
                style={{ height: "40px", fontSize: "0.85rem" }}
=======
                style={{ height: '40px', fontSize: '0.85rem' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              />
            </div>
          </div>

          {/* Posyandu Filter */}
          <div className="col-12 col-sm-6 col-md-3">
<<<<<<< HEAD
            <select
=======
            <select 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              className="form-select bg-light border-0 fw-medium rounded-3"
              value={posyanduFilter}
              onChange={(e) => {
                setPosyanduFilter(e.target.value);
                setCurrentPage(1);
              }}
<<<<<<< HEAD
              style={{ height: "40px", fontSize: "0.85rem" }}
            >
              <option value="Semua Posyandu">Semua Posyandu</option>
              {availablePosyanduList.map((pos, idx) => (
                <option key={idx} value={pos}>
                  {pos}
                </option>
=======
              style={{ height: '40px', fontSize: '0.85rem' }}
            >
              <option value="Semua Posyandu">Semua Posyandu</option>
              {availablePosyanduList.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              ))}
            </select>
          </div>

          {/* Kategori Siklus Hidup Filter */}
          <div className="col-12 col-sm-6 col-md-2">
<<<<<<< HEAD
            <select
=======
            <select 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              className="form-select bg-light border-0 fw-medium rounded-3"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
<<<<<<< HEAD
              style={{ height: "40px", fontSize: "0.85rem" }}
=======
              style={{ height: '40px', fontSize: '0.85rem' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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

          {/* Status Filter (Aktif / Non-Aktif) */}
          <div className="col-12 col-sm-6 col-md-2">
<<<<<<< HEAD
            <select
=======
            <select 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              className="form-select bg-light border-0 fw-medium rounded-3"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
<<<<<<< HEAD
              style={{ height: "40px", fontSize: "0.85rem" }}
=======
              style={{ height: '40px', fontSize: '0.85rem' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>

          {/* Filter / Reset Button */}
          <div className="col-12 col-sm-6 col-md-1">
<<<<<<< HEAD
            <button
              type="button"
              className="btn w-100 d-flex align-items-center justify-content-center gap-1.5 text-white fw-bold rounded-3 shadow-xs"
              style={{ backgroundColor: themeColor, height: "40px", fontSize: "0.825rem" }}
              onClick={() => {
                setSearchQuery("");
                setPosyanduFilter("Semua Posyandu");
                setSelectedCategory("all");
                setStatusFilter("Semua Status");
=======
            <button 
              type="button"
              className="btn w-100 d-flex align-items-center justify-content-center gap-1.5 text-white fw-bold rounded-3 shadow-xs"
              style={{ backgroundColor: themeColor, height: '40px', fontSize: '0.825rem' }}
              onClick={() => {
                setSearchQuery('');
                setPosyanduFilter('Semua Posyandu');
                setSelectedCategory('all');
                setStatusFilter('Semua Status');
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                setCurrentPage(1);
              }}
              title="Reset Filter"
            >
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container with Requested Columns:
          No | Nama & NIK | Tanggal Lahir | Kategori | Asal Posyandu | Tanggal Periksa | Aksi */}
      <div className="card border-0 bg-white shadow-xs rounded-3 overflow-hidden">
        <div className="table-responsive">
<<<<<<< HEAD
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.86rem" }}>
            <thead className="bg-light border-bottom text-muted small text-uppercase fw-bold" style={{ fontSize: "0.78rem", letterSpacing: "0.04em" }}>
              <tr>
                <th className="ps-4 py-3 text-center" style={{ width: "50px" }}>
                  NO
                </th>
                <th className="py-3" style={{ minWidth: "180px" }}>
                  NAMA LENGKAP / NIK
                </th>
                <th className="py-3 text-center" style={{ minWidth: "130px", whiteSpace: "nowrap" }}>
                  TANGGAL LAHIR
                </th>
                <th className="py-3" style={{ minWidth: "130px" }}>
                  KATEGORI
                </th>
                <th className="py-3" style={{ minWidth: "160px" }}>
                  ASAL POSYANDU
                </th>
                <th className="py-3 text-center" style={{ minWidth: "150px", whiteSpace: "nowrap" }}>
                  TANGGAL PEMERIKSAAN
                </th>
                <th className="pe-4 py-3 text-center" style={{ width: "110px" }}>
                  AKSI
                </th>
=======
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
            <thead className="bg-light border-bottom text-muted small text-uppercase fw-bold" style={{ fontSize: '0.78rem', letterSpacing: '0.04em' }}>
              <tr>
                <th className="ps-4 py-3 text-center" style={{ width: '50px' }}>NO</th>
                <th className="py-3" style={{ minWidth: '180px' }}>NAMA LENGKAP / NIK</th>
                <th className="py-3 text-center" style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>TANGGAL LAHIR</th>
                <th className="py-3" style={{ minWidth: '130px' }}>KATEGORI</th>
                <th className="py-3" style={{ minWidth: '160px' }}>ASAL POSYANDU</th>
                <th className="py-3 text-center" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>TANGGAL PEMERIKSAAN</th>
                <th className="pe-4 py-3 text-center" style={{ width: '110px' }}>AKSI</th>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Tidak ditemukan data sasaran yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id}>
<<<<<<< HEAD
                    <td className="ps-4 text-center text-muted fw-semibold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{item.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: "0.78rem" }}>
                        {item.nik}
                      </div>
                    </td>
                    <td className="text-center text-secondary fw-medium text-nowrap">{formatDateId(item.tglLahir)}</td>
=======
                    <td className="ps-4 text-center text-muted fw-semibold">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{item.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{item.nik}</div>
                    </td>
                    <td className="text-center text-secondary fw-medium text-nowrap">
                      {formatIndoDate(item.tglLahir)}
                    </td>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <td>
                      <div className="fw-semibold text-dark mb-0">{item.kategori}</div>
                    </td>
                    <td>
<<<<<<< HEAD
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.84rem" }}>
                        {item.posyandu ? item.posyandu.split("—")[0].trim() : "-"}
                      </div>
                      <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                        {item.rw ? `Wilayah ${item.rw}` : ""}
                      </div>
                    </td>
                    <td className="text-center text-secondary fw-medium">{formatDateId(item.tglPeriksa)}</td>
                    <td className="pe-4 text-center text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => handleOpenDetail(item)} title="Lihat Detail Sasaran">
=======
                      <div className="fw-semibold text-dark" style={{ fontSize: '0.84rem' }}>
                        {item.posyandu ? item.posyandu.split('—')[0].trim() : 'Posyandu Melati'}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        {item.rw ? `Wilayah ${item.rw}` : 'Wilayah RW 04'}
                      </div>
                    </td>
                    <td className="text-center text-secondary fw-medium">
                      {item.tglPeriksa}
                    </td>
                    <td className="pe-4 text-center text-nowrap">
                      <button 
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none"
                        onClick={() => handleOpenDetail(item)}
                        title="Lihat Detail Sasaran"
                      >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
        <div className="card-footer bg-white border-top py-3 px-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
          <div className="text-muted small">
<<<<<<< HEAD
            Menampilkan <span className="fw-semibold text-dark">{paginatedData.length}</span> dari <span className="fw-semibold text-dark">{totalItems}</span> sasaran
          </div>

          <div className="d-flex align-items-center gap-1">
            <button className="btn btn-sm btn-light border p-1 px-2 text-muted" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-sm px-2.5 py-1 fw-bold ${currentPage === page ? "text-white" : "btn-light border text-dark"}`}
                style={{
                  backgroundColor: currentPage === page ? "#428A75" : undefined,
                  fontSize: "0.8rem",
=======
            Menampilkan <span className="fw-semibold text-dark">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> s/d <span className="fw-semibold text-dark">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="fw-semibold text-dark">{totalItems}</span> sasaran
          </div>

          <div className="d-flex align-items-center gap-1">
            <button 
              className="btn btn-sm btn-light border p-1 px-2 text-muted"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page}
                className={`btn btn-sm px-2.5 py-1 fw-bold ${
                  currentPage === page 
                    ? 'text-white' 
                    : 'btn-light border text-dark'
                }`}
                style={{ 
                  backgroundColor: currentPage === page ? '#428A75' : undefined,
                  fontSize: '0.8rem'
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
<<<<<<< HEAD
            <button className="btn btn-sm btn-light border p-1 px-2 text-muted" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
=======
            <button 
              className="btn btn-sm btn-light border p-1 px-2 text-muted"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Harmonized Detail Sasaran Modal (Harmonized across Posyandu, Puskesmas, & Dinkes) */}
<<<<<<< HEAD
      <DetailSasaranModal show={showDetailModal} onHide={handleCloseDetail} selectedSasaran={selectedSasaran} themeColor={themeColor} />
    </div>
=======
      <DetailSasaranModal 
        show={showDetailModal} 
        onHide={handleCloseDetail} 
        selectedSasaran={selectedSasaran} 
        themeColor={themeColor}
      />
      </div>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  );
}
