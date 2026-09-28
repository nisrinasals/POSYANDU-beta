<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { Calendar, MapPin, Plus, Search, ChevronLeft, ChevronRight, X, Eye, Info, FileText, CheckCircle2 } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { sesiService } from "../../services";
import { formatDateId, mapBackendSesiToFrontend } from "../../utils/dataMappers";

export default function KaderJadwalPage({ globalJadwalList = [], setGlobalJadwalList, user, onRefreshData }) {
  const { showWarning, showSuccess } = useNotification();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);

=======
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  Info,
  Check, 
  FileText,
  Users,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { sesiService } from '../../services';
import { mapBackendSesiToFrontend } from '../../utils/dataMappers';
import { daftarPosyandu2026 } from '../../data/mockData';
import SearchablePosyanduSelect from '../../components/common/SearchablePosyanduSelect';

const OPSI_FOKUS_LAYANAN = [
  "Bumil",
  "Nifas / Menyusui",
  "Bayi & Balita",
  "Apras (Pra Sekolah)",
  "Usekrem (Remaja)",
  "Dewasa",
  "Lansia"
];

export default function KaderJadwalPage({ 
  globalJadwalList = [], 
  setGlobalJadwalList,
  user,
  onRefreshData
}) {
  const { showWarning, showSuccess } = useNotification();
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [currentPage, setCurrentPage] = useState(1);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const itemsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [alertNotification, setAlertNotification] = useState(null);

<<<<<<< HEAD
  // Form state
  const [formData, setFormData] = useState({
    rw: "",
    tanggal: "",
    lokasi: "",
  });

  const posyanduName = user?.posyandu || "";

  /*
   * Tanggal hari ini dalam format YYYY-MM-DD.
   * Digunakan untuk menentukan jadwal buka berikutnya.
   */
  const dateToday = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const getDateOnly = (dateValue) => {
    if (!dateValue) return "";

    const value = String(dateValue);

    const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);

    if (isoMatch) {
      return isoMatch[1];
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

=======
  // Form state for Create New Schedule
  const posyanduName = user?.posyandu?.split(' — ')[0] || '';
  const [formData, setFormData] = useState({
    posyandu: '',
    rw: '',
    kelurahan: '',
    tanggal: '',
    waktuMulai: '',
    waktuSelesai: '',
    lokasi: '',
    alamatDetail: '',
    fokusLayanan: [],
    targetSasaran: '',
    catatan: ''
  });

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const filteredList = useMemo(() => {
    return (globalJadwalList || [])
      .filter((item) => {
        if (!item) return false;
<<<<<<< HEAD

        const itemPos = (item.posyandu || "").toLowerCase();
        const targetPos = (posyanduName || "").toLowerCase();

        const matchPosyandu = !targetPos || itemPos === targetPos || itemPos.includes(targetPos);

        const matchSearch =
          searchQuery === "" ||
          (item.lokasi || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.rw || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tanggalFormatted || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.alamatDetail || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = statusFilter === "Semua Status" || item.status === statusFilter;
=======
        const itemPos = (item.posyandu || '').toLowerCase();
        const itemRw = (item.rw || '').toLowerCase();
        const targetPos = (posyanduName || '').toLowerCase();

        const matchPosyandu = !targetPos || 
                              itemPos.includes(targetPos) || 
                              itemRw.includes('04') || 
                              itemPos.includes('melati');
        
        const matchSearch = searchQuery === '' || 
          (item.lokasi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tanggalFormatted || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.alamatDetail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(item.fokusLayanan) && item.fokusLayanan.some(f => (f || '').toLowerCase().includes(searchQuery.toLowerCase())));

        const matchStatus = statusFilter === 'Semua Status' || item.status === statusFilter;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

        return matchPosyandu && matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
  }, [globalJadwalList, posyanduName, searchQuery, statusFilter]);

<<<<<<< HEAD
  /*
   * Jadwal Hari Buka Berikutnya:
   * - Sesuai Posyandu kader
   * - Status Terjadwal
   * - tanggal >= hari ini
   * - Diambil tanggal paling dekat
   */
  const upcomingJadwal = useMemo(() => {
    if (!globalJadwalList || globalJadwalList.length === 0) {
      return null;
    }

    return (
      globalJadwalList
        .filter((jadwal) => {
          if (!jadwal) return false;

          const itemPos = (jadwal.posyandu || "").toLowerCase();
          const targetPos = (posyanduName || "").toLowerCase();

          const matchPosyandu = !targetPos || itemPos === targetPos || itemPos.includes(targetPos);

          const jadwalDate = getDateOnly(jadwal.tanggal);

          return matchPosyandu && jadwal.status === "Terjadwal" && jadwalDate !== "" && jadwalDate >= dateToday;
        })
        .sort((a, b) => new Date(a.tanggal || 0) - new Date(b.tanggal || 0))[0] || null
    );
  }, [globalJadwalList, posyanduName, dateToday]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleOpenCreateModal = () => {
    setFormData({
      rw: "",
      tanggal: "",
      lokasi: "",
    });

=======
  // Featured upcoming schedule (first active schedule in future or latest 'Terjadwal')
  const upcomingJadwal = useMemo(() => {
    if (!globalJadwalList || globalJadwalList.length === 0) return null;
    const active = globalJadwalList.find(
      (j) => j && (((j.posyandu || '').includes('Melati')) || ((j.rw || '').includes('04'))) && j.status === 'Terjadwal'
    );
    return active || globalJadwalList[0];
  }, [globalJadwalList]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const showToast = (message) => {
    setAlertNotification(message);
    setTimeout(() => {
      setAlertNotification(null);
    }, 3500);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      posyandu: posyanduName,
      rw: 'Wilayah RW 04',
      kelurahan: 'Kelurahan Sukamaju',
      tanggal: new Date().toISOString().split('T')[0],
      waktuMulai: '08:00',
      waktuSelesai: '11:30',
      lokasi: 'Balai Warga RW 04',
      alamatDetail: 'RT 03 / RW 04 Melati',
      fokusLayanan: ['Bayi & Balita', 'Bumil'],
      targetSasaran: '45 Sasaran',
      catatan: ''
    });
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (jadwal) => {
    setSelectedJadwal(jadwal);
    setIsDetailModalOpen(true);
  };

<<<<<<< HEAD
  const formatTanggalIndo = (dateStr) => {
    return formatDateId(dateStr);
=======
  const toggleFokusLayanan = (layanan) => {
    setFormData((prev) => {
      const exists = prev.fokusLayanan.includes(layanan);
      if (exists) {
        if (prev.fokusLayanan.length === 1) return prev;
        return { ...prev, fokusLayanan: prev.fokusLayanan.filter((f) => f !== layanan) };
      } else {
        return { ...prev, fokusLayanan: [...prev.fokusLayanan, layanan] };
      }
    });
  };

  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };

  const handleSaveJadwal = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

    if (!formData.tanggal || !formData.lokasi.trim() || !formData.rw.trim()) {
      showWarning("Validasi Jadwal Posyandu", "Mohon lengkapi tanggal, RW, dan lokasi posyandu sebelum menyimpan.");
      return;
    }

    if (!user?.posyandu_id) {
      showWarning("Posyandu Belum Terhubung", "Akun kader belum memiliki Posyandu pada backend.");
      return;
    }

    const payload = {
      posyandu_id: Number(user.posyandu_id),
      tanggal_pelaksanaan: formData.tanggal,
      lokasi: formData.lokasi.trim(),
      rw: formData.rw.trim(),
      status: "open",
=======
    if (!formData.tanggal || !formData.lokasi) {
      showWarning(
        "Validasi Jadwal Posyandu",
        "Mohon lengkapi tanggal pelaksanaan dan lokasi posyandu sebelum menyimpan."
      );
      return;
    }

    const tglIndo = formatTanggalIndo(formData.tanggal);
    const waktuMulaiClean = (formData.waktuMulai || '08:00').replace(':', '.');
    const waktuSelesaiClean = (formData.waktuSelesai || '11:30').replace(':', '.');
    const waktuStr = `${waktuMulaiClean} - ${waktuSelesaiClean} WIB`;
    const rwClean = (formData.rw || '04').replace(/\D/g, '') || '04';

    const payload = {
      posyandu_id: user?.posyandu_id || 1,
      tanggal_pelaksanaan: formData.tanggal,
      lokasi: (formData.lokasi || 'Posyandu Melati').trim(),
      rw: rwClean.padStart(2, '0').slice(-2),
      status: 'open'
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    };

    try {
      const res = await sesiService.createSesi(payload);
<<<<<<< HEAD

      if (!res?.data?.id) {
        throw new Error("Backend tidak mengembalikan data sesi yang baru dibuat.");
      }

      const createdSesi = mapBackendSesiToFrontend(res.data);

      setGlobalJadwalList?.((prev) => [createdSesi, ...(prev || []).filter((j) => String(j.id) !== String(createdSesi.id))]);

      showSuccess("Jadwal Tersimpan", `Jadwal posyandu pada tanggal ${formatTanggalIndo(formData.tanggal)} berhasil disimpan ke database.`);

      setIsModalOpen(false);

      onRefreshData?.();
    } catch (err) {
      console.error("Gagal simpan jadwal sesi:", err);

      showWarning("Gagal Menyimpan Jadwal", err?.message || "Gagal menyimpan jadwal posyandu ke database.");
=======
      const createdId = res?.data?.id || Date.now();

      // Simpan metadata spesifik (fokusLayanan, alamatDetail, waktu) ke localStorage
      try {
        const metaMap = JSON.parse(localStorage.getItem('posyandu_sesi_metadata') || '{}');
        metaMap[String(createdId)] = {
          fokusLayanan: formData.fokusLayanan && formData.fokusLayanan.length > 0 ? formData.fokusLayanan : ['Bumil', 'Bayi & Balita'],
          alamatDetail: formData.alamatDetail || formData.rw || 'RT 03 / RW 04',
          lokasi: formData.lokasi,
          waktuMulai: waktuMulaiClean,
          waktuSelesai: waktuSelesaiClean,
          targetSasaran: formData.targetSasaran || '40 Sasaran',
          catatan: formData.catatan
        };
        metaMap[formData.tanggal] = metaMap[String(createdId)];
        localStorage.setItem('posyandu_sesi_metadata', JSON.stringify(metaMap));
      } catch {}

      let createdSesi = null;
      if (res?.data) {
        createdSesi = mapBackendSesiToFrontend(res.data);
      }

      if (!createdSesi) {
        createdSesi = {
          id: createdId,
          posyandu: formData.posyandu || 'Posyandu Melati',
          rw: formData.rw || 'RW 04',
          kelurahan: formData.kelurahan || 'Kelurahan Sukamaju',
          tanggal: formData.tanggal,
          hari: tglIndo.split(',')[0],
          tanggalFormatted: tglIndo,
          waktuMulai: waktuMulaiClean,
          waktuSelesai: waktuSelesaiClean,
          waktu: waktuStr,
          lokasi: formData.lokasi,
          alamatDetail: formData.alamatDetail || 'RT 03 / RW 04',
          fokusLayanan: formData.fokusLayanan,
          status: 'Terjadwal',
          kontakKader: `${user?.nama || 'Kader Utama'} (${user?.telepon || '088227683468'})`,
          targetSasaran: formData.targetSasaran || '40 Sasaran',
          catatan: formData.catatan
        };
      }

      setGlobalJadwalList((prev) => [createdSesi, ...prev.filter(j => j.id !== createdSesi.id && j.tanggal !== createdSesi.tanggal)]);
      showSuccess("Jadwal Tersimpan", `Jadwal posyandu baru pada tanggal ${tglIndo} berhasil disimpan ke database.`);
      setIsModalOpen(false);
      onRefreshData?.();
    } catch (err) {
      console.error('Gagal simpan jadwal sesi:', err);
      showWarning(
        "Gagal Menyimpan Jadwal",
        err.message || "Gagal menyimpan jadwal posyandu ke database. Pastikan tanggal tersebut belum memiliki sesi yang terdaftar."
      );
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }
  };

  return (
    <div className="d-flex flex-column gap-3 pb-4">
<<<<<<< HEAD
      {/* Toast */}
      {alertNotification && (
        <div className="alert border-0 shadow-sm rounded-3 position-fixed bottom-0 end-0 m-4 z-3 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: "#2b2e4a" }}>
=======
      {/* Toast Notification */}
      {alertNotification && (
        <div 
          className="alert border-0 shadow-sm rounded-3 position-fixed bottom-0 end-0 m-4 z-3 d-flex align-items-center gap-3 text-white" 
          style={{ backgroundColor: '#2b2e4a' }}
        >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          <CheckCircle2 size={20} className="text-primary" />
          <span className="fw-medium">{alertNotification}</span>
        </div>
      )}

<<<<<<< HEAD
      {/* Top Action */}
      <div className="d-flex align-items-center justify-content-end mb-3">
        <button className="btn btn-dark-custom btn-top-action shadow-xs" onClick={handleOpenCreateModal}>
=======
      {/* Top Action Bar: Tambah Jadwal Baru Button */}
      <div className="d-flex align-items-center justify-content-end mb-3">
        <button 
          className="btn btn-dark-custom btn-top-action shadow-xs"
          onClick={handleOpenCreateModal}
        >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          <Plus size={16} />
          <span>Tambah Jadwal Baru</span>
        </button>
      </div>

<<<<<<< HEAD
      {/* Jadwal Hari Buka Berikutnya */}
      {upcomingJadwal && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-relative overflow-hidden">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge px-2.5 py-1 rounded-pill small fw-semibold text-white" style={{ backgroundColor: "#2b2e4a" }}>
=======
      {/* Featured Card: Jadwal Hari Buka Berikutnya (Posyandu Theme) */}
      {upcomingJadwal && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-relative overflow-hidden">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span 
              className="badge px-2.5 py-1 rounded-pill small fw-semibold text-white" 
              style={{ backgroundColor: '#2b2e4a' }}
            >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              Jadwal Hari Buka Berikutnya
            </span>
          </div>

<<<<<<< HEAD
          <h3 className="fw-bold text-dark mb-2 fs-4">{upcomingJadwal.tanggalFormatted}</h3>

          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
            <div className="d-flex align-items-center gap-1">
              <MapPin size={16} className="text-muted" />

              <span className="fw-medium text-dark">
                {upcomingJadwal.lokasi}
                {upcomingJadwal.alamatDetail ? `, ${upcomingJadwal.alamatDetail}` : ""}
              </span>
            </div>

            {upcomingJadwal.rw && (
              <>
                <span className="text-muted opacity-50">•</span>

                <span className="fw-medium text-dark">RW {upcomingJadwal.rw}</span>
              </>
            )}
=======
          <h3 className="fw-bold text-dark mb-2 fs-4">
            {upcomingJadwal.tanggalFormatted}
          </h3>

          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-3">
            <div className="d-flex align-items-center gap-1.5">
              <Clock size={16} className="text-muted" />
              <span className="fw-medium text-dark">{upcomingJadwal.waktu}</span>
            </div>
            <span className="text-muted opacity-50">•</span>
            <div className="d-flex align-items-center gap-1.5">
              <MapPin size={16} className="text-muted" />
              <span className="fw-medium text-dark">{upcomingJadwal.lokasi}, {upcomingJadwal.alamatDetail}</span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-1.5">
            {upcomingJadwal.fokusLayanan?.map((layanan, i) => (
              <span key={i} className="badge bg-light text-secondary border px-2.5 py-1 rounded-2 small fw-normal">
                {layanan}
              </span>
            ))}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Daftar Jadwal */}
      <div className="card border-0 shadow-sm rounded-4 bg-white">
        <div className="card-header bg-white py-3 px-3 px-md-4 border-bottom d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold text-dark mb-0">Daftar Jadwal Posyandu</h6>

            <span
              className="badge px-2.5 py-1 rounded-pill fw-semibold text-white"
              style={{
                backgroundColor: "#2b2e4a",
                fontSize: "0.72rem",
              }}
=======
      {/* Table Section: Daftar Jadwal Posyandu */}
      <div className="card border-0 shadow-sm rounded-4 bg-white">
        {/* Table Header & Controls */}
        <div className="card-header bg-white py-3 px-3 px-md-4 border-bottom d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold text-dark mb-0">Daftar Jadwal Posyandu</h6>
            <span 
              className="badge px-2.5 py-1 rounded-pill fw-semibold text-white" 
              style={{ backgroundColor: '#2b2e4a', fontSize: '0.72rem' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            >
              {filteredList.length} Jadwal
            </span>
          </div>
<<<<<<< HEAD

          <div className="d-flex align-items-center gap-2">
            {/* Search */}
            <div className="input-group input-group-sm" style={{ minWidth: "220px" }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={15} />
              </span>

              <input
                type="text"
=======
          
          <div className="d-flex align-items-center gap-2">
            {/* Search Input */}
            <div className="input-group input-group-sm" style={{ minWidth: '220px' }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={15} />
              </span>
              <input 
                type="text" 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                className="form-control form-control-sm bg-light border-start-0 ps-0"
                placeholder="Cari jadwal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
<<<<<<< HEAD

              {searchQuery && (
                <button className="btn btn-light btn-sm border-start-0 text-muted" type="button" onClick={() => setSearchQuery("")}>
=======
              {searchQuery && (
                <button 
                  className="btn btn-light btn-sm border-start-0 text-muted" 
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
<<<<<<< HEAD
            <select
              className="form-select form-select-sm bg-light rounded-2 text-dark fw-semibold"
              style={{
                width: "auto",
                minWidth: "130px",
              }}
=======
            <select 
              className="form-select form-select-sm bg-light rounded-2 text-dark fw-semibold"
              style={{ width: 'auto', minWidth: '130px' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

<<<<<<< HEAD
        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.84rem" }}>
            <thead
              className="bg-light text-muted text-uppercase"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.04em",
              }}
            >
              <tr>
                <th className="ps-4 py-2.5 text-center" style={{ width: "45px" }}>
                  NO
                </th>

                <th className="py-2.5">TANGGAL</th>

                <th className="py-2.5">LOKASI / TEMPAT</th>

                <th className="py-2.5">RW</th>

                <th className="py-2.5 text-center" style={{ width: "120px" }}>
                  STATUS
                </th>

                <th className="pe-4 py-2.5 text-center" style={{ width: "120px" }}>
                  AKSI
                </th>
              </tr>
            </thead>

=======
        {/* Responsive Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
            <thead className="bg-light text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              <tr>
                <th className="ps-4 py-2.5 text-center" style={{ width: '45px' }}>NO</th>
                <th className="py-2.5">TANGGAL &amp; WAKTU</th>
                <th className="py-2.5">LOKASI / TEMPAT</th>
                <th className="py-2.5">FOKUS LAYANAN</th>
                <th className="py-2.5 text-center" style={{ width: '120px' }}>STATUS</th>
                <th className="pe-4 py-2.5 text-center" style={{ width: '120px' }}>AKSI</th>
              </tr>
            </thead>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <Info size={28} className="opacity-40 mb-2 d-block mx-auto" />
<<<<<<< HEAD

=======
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <div>Tidak ada jadwal posyandu yang sesuai dengan filter pencarian.</div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={item.id}>
                      {/* NO */}
<<<<<<< HEAD
                      <td className="ps-4 py-2.5 text-center fw-semibold text-secondary">{rowNumber}</td>

                      {/* TANGGAL */}
                      <td className="py-2.5">
                        <div className="fw-bold text-dark">{item.tanggalFormatted}</div>
                      </td>

                      {/* LOKASI */}
                      <td className="py-2.5">
                        <div className="fw-semibold text-dark">{item.lokasi}</div>

                        {item.alamatDetail && (
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {item.alamatDetail}
                          </div>
                        )}
                      </td>

                      {/* RW */}
                      <td className="py-2.5">
                        <span className="fw-semibold text-dark">{item.rw ? `RW ${item.rw}` : "-"}</span>
=======
                      <td className="ps-4 py-2.5 text-center fw-semibold text-secondary">
                        {rowNumber}
                      </td>

                      {/* TANGGAL & WAKTU */}
                      <td className="py-2.5">
                        <div className="fw-bold text-dark">
                          {item.tanggalFormatted}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.waktu}
                        </div>
                      </td>

                      {/* LOKASI / TEMPAT */}
                      <td className="py-2.5">
                        <div className="fw-semibold text-dark">
                          {item.lokasi}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.alamatDetail}
                        </div>
                      </td>

                      {/* FOKUS LAYANAN */}
                      <td className="py-2.5">
                        <div className="d-flex flex-wrap gap-1">
                          {item.fokusLayanan?.map((layanan, fIdx) => (
                            <span 
                              key={fIdx} 
                              className="badge bg-light text-secondary border px-2 py-0.5 rounded-1"
                              style={{ fontSize: '0.72rem', fontWeight: 500 }}
                            >
                              {layanan}
                            </span>
                          ))}
                        </div>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </td>

                      {/* STATUS */}
                      <td className="py-2.5 text-center">
<<<<<<< HEAD
                        {item.status === "Terjadwal" ? (
                          <span className="badge px-2.5 py-1 rounded-pill fw-semibold bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "0.72rem" }}>
                            Terjadwal
                          </span>
                        ) : (
                          <span className="badge px-2.5 py-1 rounded-pill fw-semibold bg-success-subtle text-success border border-success-subtle" style={{ fontSize: "0.72rem" }}>
=======
                        {item.status === 'Terjadwal' ? (
                          <span 
                            className="badge px-2.5 py-1 rounded-pill fw-semibold bg-primary-subtle text-primary border border-primary-subtle" 
                            style={{ fontSize: '0.72rem' }}
                          >
                            Terjadwal
                          </span>
                        ) : (
                          <span 
                            className="badge px-2.5 py-1 rounded-pill fw-semibold bg-success-subtle text-success border border-success-subtle" 
                            style={{ fontSize: '0.72rem' }}
                          >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            Selesai
                          </span>
                        )}
                      </td>

<<<<<<< HEAD
                      {/* AKSI */}
                      <td className="pe-4 py-2.5 text-center text-nowrap">
                        <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => handleOpenDetailModal(item)}>
=======
                      {/* AKSI: HANYA LIHAT DETAIL */}
                      <td className="pe-4 py-2.5 text-center text-nowrap">
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none"
                          onClick={() => handleOpenDetailModal(item)}
                        >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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

<<<<<<< HEAD
        {/* Pagination */}
        <div className="card-footer bg-light py-2.5 px-3 px-md-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2" style={{ fontSize: "0.8rem" }}>
=======
        {/* Table Footer: Counter & Pagination */}
        <div className="card-footer bg-light py-2.5 px-3 px-md-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2" style={{ fontSize: '0.8rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          <div className="text-muted">
            Menampilkan <span className="fw-semibold text-dark">{paginatedList.length}</span> dari total <span className="fw-semibold text-dark">{filteredList.length}</span> jadwal
          </div>

          <div className="d-flex align-items-center gap-1">
<<<<<<< HEAD
            <button className="btn btn-sm btn-light border p-1" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }).map((_, pIdx) => (
              <button
                key={pIdx + 1}
                className={`btn btn-sm px-2.5 py-0.5 fw-bold ${currentPage === pIdx + 1 ? "text-white" : "btn-light border text-secondary"}`}
                style={{
                  backgroundColor: currentPage === pIdx + 1 ? "#2b2e4a" : undefined,
                  borderColor: currentPage === pIdx + 1 ? "#2b2e4a" : undefined,
                  fontSize: "0.78rem",
                  minWidth: "28px",
=======
            <button 
              className="btn btn-sm btn-light border p-1"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, pIdx) => (
              <button 
                key={pIdx + 1}
                className={`btn btn-sm px-2.5 py-0.5 fw-bold ${currentPage === pIdx + 1 ? 'text-white' : 'btn-light border text-secondary'}`}
                style={{ 
                  backgroundColor: currentPage === pIdx + 1 ? '#2b2e4a' : undefined,
                  borderColor: currentPage === pIdx + 1 ? '#2b2e4a' : undefined,
                  fontSize: '0.78rem', 
                  minWidth: '28px' 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                }}
                onClick={() => setCurrentPage(pIdx + 1)}
              >
                {pIdx + 1}
              </button>
            ))}
<<<<<<< HEAD

            <button className="btn btn-sm btn-light border p-1" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
=======
            <button 
              className="btn btn-sm btn-light border p-1"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Modal Tambah Jadwal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: "#2b2e4a" }}>
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={19} color="#ffffff" style={{ stroke: "#ffffff" }} />

                  <h5
                    className="modal-title fw-bold mb-0"
                    style={{
                      color: "#ffffff",
                      fontSize: "1.05rem",
                    }}
                  >
                    Tambah Jadwal Posyandu Baru
                  </h5>
                </div>

                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)} />
              </div>

              <form onSubmit={handleSaveJadwal}>
                <div className="modal-body p-4 bg-white">
                  <div className="row g-3">
                    {/* Tanggal */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        Tanggal Pelaksanaan <span className="text-danger">*</span>
                      </label>

                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.tanggal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tanggal: e.target.value,
                          })
                        }
=======
      {/* Modal: Tambah Jadwal Baru (Posyandu Palette: Dark Navy & Pink Accent) */}
      {isModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: '#2b2e4a' }}>
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={19} color="#ffffff" style={{ stroke: '#ffffff' }} />
                  <h5 className="modal-title fw-bold mb-0" style={{ color: '#ffffff', fontSize: '1.05rem' }}>
                    Tambah Jadwal Posyandu Baru
                  </h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveJadwal}>
                <div className="modal-body p-4 bg-white">
                  <div className="row g-3">
                    {/* Tanggal Pelaksanaan */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">
                        Tanggal Pelaksanaan <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm"
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        required
                      />
                    </div>

<<<<<<< HEAD
                    {/* RW */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">
                        RW <span className="text-danger">*</span>
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Contoh: 04"
                        value={formData.rw}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rw: e.target.value,
                          })
                        }
=======
                    {/* Waktu Mulai & Selesai */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">
                        Waktu Mulai <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="time" 
                        className="form-control form-control-sm"
                        value={formData.waktuMulai}
                        onChange={(e) => setFormData({ ...formData, waktuMulai: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">
                        Waktu Selesai <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="time" 
                        className="form-control form-control-sm"
                        value={formData.waktuSelesai}
                        onChange={(e) => setFormData({ ...formData, waktuSelesai: e.target.value })}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        required
                      />
                    </div>

<<<<<<< HEAD
                    {/* Lokasi */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark">
                        Lokasi / Tempat Pelaksanaan <span className="text-danger">*</span>
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Masukkan lokasi pelaksanaan"
                        value={formData.lokasi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lokasi: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-2.5 bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-2" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-dark-custom btn-sm text-white px-4 py-1.5 rounded-2 fw-semibold"
                    style={{
                      backgroundColor: "#2b2e4a",
                      borderColor: "#2b2e4a",
                    }}
=======
                    {/* Lokasi / Tempat */}
                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-bold text-dark">
                        Lokasi / Tempat Pelaksanaan <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        placeholder="Contoh: Balai Warga RW 04"
                        value={formData.lokasi}
                        onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                        required
                      />
                    </div>

                    {/* Alamat Detail */}
                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-bold text-dark">
                        Alamat Detail / RT
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        placeholder="Contoh: RT 03 / RW 04 Melati"
                        value={formData.alamatDetail}
                        onChange={(e) => setFormData({ ...formData, alamatDetail: e.target.value })}
                      />
                    </div>

                    {/* Fokus Layanan */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark d-flex justify-content-between align-items-center">
                        <span>Fokus Layanan Hari Ini <span className="text-danger">*</span></span>
                        <span className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>Pilih kategori sasaran</span>
                      </label>
                      <div className="d-flex flex-wrap gap-2 pt-1">
                        {OPSI_FOKUS_LAYANAN.map((item) => {
                          const isSelected = formData.fokusLayanan.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5 transition-all ${
                                isSelected 
                                  ? 'text-white shadow-xs' 
                                  : 'btn-light border text-secondary'
                              }`}
                              style={{ 
                                backgroundColor: isSelected ? '#2b2e4a' : undefined,
                                borderColor: isSelected ? '#2b2e4a' : undefined,
                                fontSize: '0.78rem' 
                              }}
                              onClick={() => toggleFokusLayanan(item)}
                            >
                              {isSelected && <Check size={13} className="text-primary" />}
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Catatan / Kebutuhan Tambahan */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark">
                        Catatan Persiapan
                      </label>
                      <textarea 
                        className="form-control form-control-sm"
                        rows={3}
                        placeholder="Tuliskan catatan persiapan posyandu..."
                        value={formData.catatan}
                        onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer border-top px-4 py-2.5 bg-light">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-2"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-dark-custom btn-sm text-white px-4 py-1.5 rounded-2 fw-semibold"
                    style={{ backgroundColor: '#2b2e4a', borderColor: '#2b2e4a' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Modal Detail */}
      {isDetailModalOpen && selectedJadwal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: "#2b2e4a" }}>
                <div className="d-flex align-items-center gap-2">
                  <FileText size={19} color="#ffffff" style={{ stroke: "#ffffff" }} />

                  <h5
                    className="modal-title fw-bold mb-0"
                    style={{
                      color: "#ffffff",
                      fontSize: "1.05rem",
                    }}
                  >
                    Detail Jadwal Posyandu
                  </h5>
                </div>

                <button type="button" className="btn-close btn-close-white" onClick={() => setIsDetailModalOpen(false)} />
=======
      {/* Modal: Detail Jadwal Posyandu (Pure Read-Only - Posyandu Palette) */}
      {isDetailModalOpen && selectedJadwal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: '#2b2e4a' }}>
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="row g-3">
<<<<<<< HEAD
                  {/* Informasi Tanggal */}
=======
                  {/* Card 1: Informasi Pelaksanaan */}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-xs rounded-3 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom text-dark">
                        <Calendar size={16} className="text-primary" />
<<<<<<< HEAD

                        <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                          Tanggal Pelaksanaan
                        </h6>
                      </div>

                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: "0.82rem" }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: "120px" }}>
                              Hari / Tanggal
                            </td>

                            <td className="py-1 fw-bold text-dark">: {formatDateId(selectedJadwal.tanggalFormatted || selectedJadwal.tanggal)}</td>
                          </tr>

                          <tr>
                            <td className="text-muted ps-0 py-1">Status Jadwal</td>

                            <td className="py-1">
                              :{" "}
                              <span
                                className={`badge ${
                                  selectedJadwal.status === "Terjadwal" ? "bg-primary-subtle text-primary border border-primary-subtle" : "bg-success-subtle text-success border border-success-subtle"
                                } px-2 py-0.5 rounded-pill`}
                              >
=======
                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>Waktu Pelaksanaan</h6>
                      </div>
                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: '0.82rem' }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: '120px' }}>Hari / Tanggal</td>
                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.tanggalFormatted}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Waktu Pelaksanaan</td>
                            <td className="py-1 text-dark">: {selectedJadwal.waktu}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Status Jadwal</td>
                            <td className="py-1">
                              : <span className={`badge ${selectedJadwal.status === 'Terjadwal' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-2 py-0.5 rounded-pill`}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                {selectedJadwal.status}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

<<<<<<< HEAD
                  {/* Lokasi & RW */}
=======
                  {/* Card 2: Lokasi & Wilayah */}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-xs rounded-3 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom text-dark">
                        <MapPin size={16} className="text-danger" />
<<<<<<< HEAD

                        <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                          Lokasi & Wilayah
                        </h6>
                      </div>

                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: "0.82rem" }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: "120px" }}>
                              Lokasi / Tempat
                            </td>

                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.lokasi}</td>
                          </tr>

                          <tr>
                            <td className="text-muted ps-0 py-1">RW</td>

                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.rw ? `RW ${selectedJadwal.rw}` : "-"}</td>
                          </tr>

                          {selectedJadwal.alamatDetail && (
                            <tr>
                              <td className="text-muted ps-0 py-1">Alamat Detail</td>

                              <td className="py-1 text-dark">: {selectedJadwal.alamatDetail}</td>
                            </tr>
                          )}

                          <tr>
                            <td className="text-muted ps-0 py-1">Posyandu</td>

                            <td className="py-1 text-dark">: {selectedJadwal.posyandu || ""}</td>
=======
                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>Lokasi & Wilayah</h6>
                      </div>
                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: '0.82rem' }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: '120px' }}>Lokasi / Tempat</td>
                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.lokasi}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Alamat Detail / RT</td>
                            <td className="py-1 text-dark">: {selectedJadwal.alamatDetail || '-'}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Posyandu</td>
                            <td className="py-1 text-dark">: {selectedJadwal.posyandu || 'Posyandu Melati RW 04'}</td>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
<<<<<<< HEAD
=======

                  {/* Card 3: Fokus Layanan & Catatan */}
                  <div className="col-12">
                    <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
                      <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Fokus Layanan Hari Ini</h6>
                      <div className="d-flex flex-wrap gap-1.5 mb-3">
                        {selectedJadwal.fokusLayanan?.map((layanan, i) => (
                          <span key={i} className="badge bg-light text-secondary border px-2.5 py-1 rounded-2" style={{ fontSize: '0.78rem' }}>
                            {layanan}
                          </span>
                        ))}
                      </div>

                      <div className="p-3 bg-light rounded-2 border">
                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.74rem' }}>Catatan Persiapan:</span>
                        <p className="mb-0 text-dark fw-medium" style={{ fontSize: '0.84rem' }}>
                          {selectedJadwal.catatan || 'Tidak ada catatan persiapan tambahan.'}
                        </p>
                      </div>
                    </div>
                  </div>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                </div>
              </div>

              <div className="modal-footer bg-white border-top py-2.5 px-4 d-flex justify-content-end">
<<<<<<< HEAD
                <button type="button" className="btn btn-secondary px-4 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={() => setIsDetailModalOpen(false)}>
=======
                <button 
                  type="button" 
                  className="btn btn-secondary px-4 fw-semibold" 
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setIsDetailModalOpen(false)}
                >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
