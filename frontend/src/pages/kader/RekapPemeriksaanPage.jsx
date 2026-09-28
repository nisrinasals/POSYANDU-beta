<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { Download, Search, Users, CheckCircle, Clock, AlertTriangle, Filter, Calendar, Eye, Edit, FileText, Printer } from "lucide-react";
import { pemeriksaanService } from "../../services";
import DetailRekapModal, { resolve5StepDetails } from "../../components/pemeriksaan/DetailRekapModal";
import ExportRekapModal from "../../components/pemeriksaan/ExportRekapModal";
import { formatAgeFromMonths, formatDateId } from "../../utils/dataMappers";

export default function RekapPemeriksaanPage({ onNavigate, globalSasaranList = [], setGlobalSasaranList, globalPemeriksaanData = {}, setGlobalPemeriksaanData }) {
  const [selectedMonthNum, setSelectedMonthNum] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori (Semua Siklus)");

  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const getDateOnly = (value) => {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const text = String(value || "");
    const isoMatch = text.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoMatch) return isoMatch[0];

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
  };

  const getAgeText = (birthDate, referenceDate = new Date(), category = "") => {
    const birthDateOnly = getDateOnly(birthDate);
    const referenceDateOnly = getDateOnly(referenceDate);
    if (!birthDateOnly || !referenceDateOnly) return "";

    const birth = new Date(`${birthDateOnly}T00:00:00Z`);
    const reference = new Date(`${referenceDateOnly}T00:00:00Z`);
    if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) return "";

    let months = (reference.getUTCFullYear() - birth.getUTCFullYear()) * 12 + reference.getUTCMonth() - birth.getUTCMonth();

    if (reference.getUTCDate() < birth.getUTCDate()) months -= 1;
    if (months < 0) return "";

    return formatAgeFromMonths(months, category);
  };

=======
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
  Edit,
  FileText, 
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DetailRekapModal, { resolve5StepDetails } from '../../components/pemeriksaan/DetailRekapModal';
import ExportRekapModal from '../../components/pemeriksaan/ExportRekapModal';

export default function RekapPemeriksaanPage({ 
  onNavigate,
  globalSasaranList = [],
  setGlobalSasaranList,
  globalPemeriksaanData = {},
  setGlobalPemeriksaanData
}) {
  // Month & Year Filter State (Default: September 2026)
  const [selectedMonthNum, setSelectedMonthNum] = useState('09'); // 'Semua', '01' s/d '12'
  const [selectedYear, setSelectedYear] = useState('2026'); // 'Semua', '2024', '2025', '2026', '2027'
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori (Semua Siklus)');

  // Modal State for Single-Page View
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  // Modal State for Export Excel
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Dynamic Unified Rekap Data derived from globalSasaranList and globalPemeriksaanData (Hanya yang sudah periksa)
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const allRekapList = useMemo(() => {
    if (!globalSasaranList || globalSasaranList.length === 0) return [];

    return globalSasaranList
<<<<<<< HEAD
      .map((s) => {
        if (!s) return null;
        const exam = (globalPemeriksaanData && (globalPemeriksaanData[s.id] || globalPemeriksaanData[String(s.id)] || globalPemeriksaanData[s.nik] || globalPemeriksaanData[`exam_${s.id}`])) || s.exam || null;
        const resolved = resolve5StepDetails(s, exam) || {};
        const isExamined = s.statusPemeriksaan === "Sudah" || s.status === "Sudah" || resolved.isExamined || !!exam;

        return {
          ...resolved,
          id: s.id,
          idSasaran: s.idSasaran || "",
          nama: s.nama || "",
          nik: s.nik || "",
          kategori: s.kategori || "",
          subKategori: s.subKategori || "",
          subText: formatAgeFromMonths(exam?.usia_bulan, s.subKategori || s.kategori) || getAgeText(s.tglLahir, exam?.tanggal || new Date(), s.subKategori || s.kategori) || s.usia || "",
          tglLahir: s.tglLahir || "",
          gender: s.gender || "",
          keteranganKeluarga: s.keteranganIbuSuami || s.namaIbu || s.namaAyah || "",
          tglPeriksa: resolved.tglPeriksa || s.tglPeriksa || "",
          pemeriksaanId: exam?.id || resolved?.idPemeriksaan || null,
          status: isExamined ? "Sudah" : "Belum",
        };
      })
      .filter(Boolean)
      .filter((item) => item.status === "Sudah");
  }, [globalSasaranList, globalPemeriksaanData]);

  const filteredList = useMemo(() => {
    return (allRekapList || []).filter((item) => {
      if (!item) return false;
      const matchSearch = (item.nama || "").toLowerCase().includes((searchTerm || "").toLowerCase()) || (item.nik || "").includes(searchTerm || "");

      let matchCat = true;
      if (selectedCategory !== "Semua Kategori (Semua Siklus)") {
        const itemKat = (item.kategori || "").toLowerCase();
        const itemSubKat = (item.subKategori || "").toLowerCase();
        const targetCat = (selectedCategory || "").toLowerCase();
        matchCat = itemKat.includes(targetCat) || itemSubKat.includes(targetCat) || targetCat.includes(itemKat);
      }

      let matchMonthYear = true;
      if (selectedMonthNum !== "Semua" || selectedYear !== "Semua") {
        if (!item.tglPeriksa || item.tglPeriksa === "-") {
          matchMonthYear = false;
        } else {
          const cleanStr = String(item.tglPeriksa).trim().replace(/\//g, "-");
          const parts = cleanStr.split("-");
          let itemMonth = "";
          let itemYear = "";

          if (parts.length === 3) {
            if (parts[0].length === 4) {
              itemYear = parts[0];
              itemMonth = parts[1].padStart(2, "0");
            } else {
              itemMonth = parts[1].padStart(2, "0");
=======
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
          keteranganKeluarga: s.keteranganIbuSuami || s.namaIbu || s.namaAyah || '-',
          tglPeriksa: resolved.tglPeriksa || (isExamined ? (s.tglPeriksa && s.tglPeriksa !== '-' ? s.tglPeriksa : '24-09-2026') : '-'),
          status: isExamined ? 'Sudah' : 'Belum'
        };
      })
      .filter(Boolean)
      .filter(item => item.status === 'Sudah');
  }, [globalSasaranList, globalPemeriksaanData]);

  // Filtered List Logic (Search, Category, Month & Year)
  const filteredList = useMemo(() => {
    return (allRekapList || []).filter((item) => {
      if (!item) return false;
      // 1. Search match
      const matchSearch = (item.nama || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                          (item.nik || '').includes(searchTerm || '');
      
      // 2. Category match
      let matchCat = true;
      if (selectedCategory !== 'Semua Kategori (Semua Siklus)') {
        const itemKat = (item.kategori || '').toLowerCase();
        const itemSubKat = (item.subKategori || '').toLowerCase();
        const targetCat = (selectedCategory || '').toLowerCase();
        matchCat = itemKat.includes(targetCat) || itemSubKat.includes(targetCat) || targetCat.includes(itemKat);
      }

      // 3. Month & Year Filter (Supports DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY)
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              itemYear = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            }
          }

<<<<<<< HEAD
          if (selectedMonthNum !== "Semua" && itemMonth && itemMonth !== selectedMonthNum) {
            matchMonthYear = false;
          }
          if (selectedYear !== "Semua" && itemYear && itemYear !== selectedYear) {
=======
          if (selectedMonthNum !== 'Semua' && itemMonth && itemMonth !== selectedMonthNum) {
            matchMonthYear = false;
          }
          if (selectedYear !== 'Semua' && itemYear && itemYear !== selectedYear) {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            matchMonthYear = false;
          }
        }
      }

      return matchSearch && matchCat && matchMonthYear;
    });
  }, [allRekapList, searchTerm, selectedCategory, selectedMonthNum, selectedYear]);

<<<<<<< HEAD
  const handleOpenDetail = async (citizen) => {
    setSelectedCitizen(citizen);
    setSelectedExamDetail(null);

    const pemeriksaanId = citizen?.pemeriksaanId;
    if (!pemeriksaanId) {
      setIsLoadingDetail(false);
      return;
    }

    setIsLoadingDetail(true);

    try {
      const response = await pemeriksaanService.getPemeriksaanById(pemeriksaanId);
      const detail = response?.data || response || null;
      setSelectedExamDetail(detail);
    } catch (error) {
      console.error("Gagal mengambil detail pemeriksaan:", error);
      setSelectedExamDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
=======
  // Dynamic Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedMonthNum, selectedYear]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const handleOpenDetail = (citizen) => {
    setSelectedCitizen(citizen);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };

  const handleCloseDetail = () => {
    setSelectedCitizen(null);
<<<<<<< HEAD
    setSelectedExamDetail(null);
    setIsLoadingDetail(false);
=======
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };

  const handlePeriksaClick = (subKategori, wargaId) => {
    if (onNavigate) {
<<<<<<< HEAD
      onNavigate("pemeriksaan", subKategori, { wargaId });
=======
      onNavigate('pemeriksaan', subKategori, { wargaId });
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }
  };

  return (
    <div className="container-fluid p-0">
<<<<<<< HEAD
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-dark-custom btn-top-action shadow-xs" onClick={() => setIsExportModalOpen(true)} title="Export Laporan Rekapitulasi ke Excel">
=======
      {/* Top Action Bar: Export Excel Button */}
      <div className="d-flex justify-content-end mb-3">
        <button 
          className="btn btn-dark-custom btn-top-action shadow-xs" 
          onClick={() => setIsExportModalOpen(true)}
          title="Export Laporan Rekapitulasi ke Excel"
        >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          <Download size={16} /> <span>Export Excel</span>
        </button>
      </div>

<<<<<<< HEAD
      <div className="card card-custom p-3 mb-4 bg-white border-0 shadow-sm rounded-4">
        <div className="row g-2 align-items-center">
=======
      {/* Filter Bar Section */}
      <div className="card card-custom p-3 mb-4 bg-white border-0 shadow-sm rounded-4">
        <div className="row g-2 align-items-center">
          
          {/* Dropdown Filter Bulan */}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          <div className="col-12 col-sm-6 col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted px-2">
                <Calendar size={14} />
              </span>
<<<<<<< HEAD
              <select className="form-select bg-light border-start-0 text-dark fw-semibold small py-2" value={selectedMonthNum} onChange={(e) => setSelectedMonthNum(e.target.value)} title="Pilih Bulan Periksa">
=======
              <select 
                className="form-select bg-light border-start-0 text-dark fw-semibold small py-2"
                value={selectedMonthNum}
                onChange={(e) => setSelectedMonthNum(e.target.value)}
                title="Pilih Bulan Periksa"
              >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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

<<<<<<< HEAD
          <div className="col-12 col-sm-6 col-md-2">
            <select className="form-select bg-light text-dark fw-semibold small py-2" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} title="Pilih Tahun Periksa">
              <option value="Semua">Semua Tahun</option>
              {[
                ...new Set(
                  Object.values(globalPemeriksaanData || {})
                    .map((exam) => String(exam?.tanggal || "").slice(0, 4))
                    .filter((year) => /^\d{4}$/.test(year)),
                ),
              ]
                .sort((a, b) => Number(b) - Number(a))
                .map((year) => (
                  <option key={year} value={year}>
                    Tahun {year}
                  </option>
                ))}
            </select>
          </div>

=======
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

          {/* Search Bar */}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted px-2">
                <Search size={14} />
              </span>
<<<<<<< HEAD
              <input type="text" className="form-control bg-light border-start-0 text-dark small py-2" placeholder="Cari Nama / NIK..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select className="form-select bg-light text-dark small py-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
=======
              <input 
                type="text" 
                className="form-control bg-light border-start-0 text-dark small py-2" 
                placeholder="Cari Nama / NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="col-12 col-md-4">
            <select 
              className="form-select bg-light text-dark small py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
        </div>
      </div>

=======

        </div>
      </div>

      {/* Info Alert Banner */}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      <div className="alert bg-white border border-light-subtle rounded-3 p-3 mb-4 shadow-xs d-flex align-items-center gap-2">
        <span className="text-muted fs-5">ⓘ</span>
        <span className="text-secondary small mb-0">
          Seluruh data klinis spesifik langkah 1-5 dapat dilihat lengkap dalam <strong>satu halaman detail</strong> melalui tombol Lihat Detail.
        </span>
      </div>

<<<<<<< HEAD
=======
      {/* Data Table Card */}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      <div className="card card-custom p-0 bg-white border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase fw-bold border-bottom">
<<<<<<< HEAD
                <th className="ps-4 py-3 text-center" style={{ width: "60px" }}>
                  NO
                </th>
                <th className="py-3" style={{ minWidth: "180px" }}>
                  NAMA LENGKAP / NIK
                </th>
                <th className="py-3" style={{ minWidth: "140px" }}>
                  KATEGORI
                </th>
                <th className="py-3" style={{ minWidth: "150px", whiteSpace: "nowrap" }}>
                  USIA
                </th>
                <th className="py-3" style={{ minWidth: "160px", whiteSpace: "nowrap" }}>
                  TANGGAL PEMERIKSAAN
                </th>
                <th className="pe-4 py-3 text-center" style={{ width: "130px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Tidak ada data pemeriksaan yang sesuai dengan filter bulan ({selectedMonthNum}) / tahun ({selectedYear}) yang dipilih.
                  </td>
                </tr>
              ) : (
<<<<<<< HEAD
                filteredList.map((row, idx) => (
                  <tr key={row.id} className="border-bottom">
                    <td className="ps-4 text-center fw-medium text-muted small">{idx + 1}</td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{row.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: "0.78rem" }}>
                        {row.nik}
                      </div>
=======
                paginatedList.map((row, idx) => (
                  <tr key={row.id} className="border-bottom">
                    <td className="ps-4 text-center fw-medium text-muted small">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{row.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{row.nik}</div>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    </td>
                    <td>
                      <div className="fw-semibold text-dark mb-0">{row.kategori}</div>
                    </td>
<<<<<<< HEAD
                    <td className="text-dark fw-medium text-nowrap">{row.subText || row.usia || "-"}</td>
                    <td className="text-secondary small text-nowrap">{formatDateId(row.tglPeriksa)}</td>
                    <td className="pe-4 text-center text-nowrap">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => handleOpenDetail(row)} title="Lihat Detail Hasil 5 Langkah">
                          <Eye size={14} /> <span>Detail</span>
                        </button>
                        <button className="btn btn-sm btn-outline-pink d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => onNavigate("pemeriksaan", row.subKategori, { wargaId: row.id })} title="Edit Data Pemeriksaan">
=======
                    <td className="text-dark fw-medium text-nowrap">{row.subText || row.usia || '-'}</td>
                    <td className="text-secondary small text-nowrap">{row.tglPeriksa}</td>
                    <td className="pe-4 text-center text-nowrap">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button 
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none"
                          onClick={() => handleOpenDetail(row)}
                          title="Lihat Detail Hasil 5 Langkah"
                        >
                          <Eye size={14} /> <span>Detail</span>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-pink d-inline-flex align-items-center gap-1.5 shadow-none"
                          onClick={() => onNavigate('pemeriksaan', row.subKategori, { wargaId: row.id })}
                          title="Edit Data Pemeriksaan"
                        >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          <Edit size={14} /> <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

<<<<<<< HEAD
        <div className="p-3 bg-light-subtle d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 border-top">
          <span className="text-muted small">
            Menampilkan {filteredList.length} dari {allRekapList.length} sasaran
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">&lt;</span>
              </li>
              <li className="page-item active">
                <span className="page-link bg-dark border-dark">1</span>
              </li>
              <li className="page-item">
                <span className="page-link text-dark">2</span>
              </li>
              <li className="page-item">
                <span className="page-link text-dark">3</span>
              </li>
              <li className="page-item">
                <span className="page-link text-dark">&gt;</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {selectedCitizen && (
        <DetailRekapModal
          citizen={selectedCitizen}
          examData={selectedExamDetail}
          isLoading={isLoadingDetail}
=======
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
                className={`btn btn-sm px-3 py-1 me-1 ${currentPage === page ? 'btn-dark fw-bold' : 'btn-light border'}`}
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          onClose={handleCloseDetail}
          theme="kader"
          onEdit={(citizen) => {
            handleCloseDetail();
<<<<<<< HEAD
            onNavigate("pemeriksaan", citizen.subKategori, { wargaId: citizen.id });
=======
            onNavigate('pemeriksaan', citizen.subKategori, { wargaId: citizen.id });
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          }}
        />
      )}

<<<<<<< HEAD
      <ExportRekapModal
=======
      {/* EXPORT REKAP MODAL (Mendukung Template Kemenkes RI 14 Kolom Bumil/Nifas) */}
      <ExportRekapModal 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentCategory={selectedCategory}
        currentYear={selectedYear}
        globalSasaranList={globalSasaranList}
        globalPemeriksaanData={globalPemeriksaanData}
        filteredList={filteredList}
      />
<<<<<<< HEAD
=======

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    </div>
  );
}
