import React, { useState, useMemo } from "react";
import { Download, Search, Users, CheckCircle, Clock, AlertTriangle, Filter, Calendar, Eye, FileText, Printer } from "lucide-react";
import DetailRekapModal, { resolve5StepDetails } from "../../components/pemeriksaan/DetailRekapModal";
import ExportRekapModal from "../../components/pemeriksaan/ExportRekapModal";
import RekapWorksheetPreview from "../../components/pemeriksaan/RekapWorksheetPreview";
import { formatAgeFromMonths, formatDateId } from "../../utils/dataMappers";
import { pemeriksaanService } from "../../services";

const getAgeInMonths = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) return null;
  let months = (reference.getFullYear() - birth.getFullYear()) * 12 + reference.getMonth() - birth.getMonth();
  if (reference.getDate() < birth.getDate()) months -= 1;
  return months < 0 ? null : months;
};

export default function PuskesmasRekapitulasiPage({ globalSasaranList = [], globalPemeriksaanData = {}, globalPosyanduList = [], onNavigate, user, userRole = "puskesmas" }) {
  const isSA = userRole === "sa" || user?.roleType === "sa";
  const isDinkes = userRole === "dinkes" || userRole === "dinkes-admin" || userRole === "dinkes-staf" || user?.roleType?.includes("dinkes");
  const isStaf = userRole === "dinkes-staf" || userRole === "puskesmas-staf" || user?.roleType === "dinkes-staf" || user?.roleType === "puskesmas-staf" || user?.role === "staf";
  const isSuperAdminOrDinkes = isSA || isDinkes;
  const themeColor = isDinkes ? "#1e3a8a" : "#428A75";
  const roleTitle = isDinkes ? user?.instansi || user?.role || "" : user?.puskesmas || user?.instansi || user?.role || "";
  const [stafTemplateKey, setStafTemplateKey] = useState("bumil_nifas_menyusui");

  // Filter starts from all backend data; user can narrow it with month/year selectors.
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const selectedYear = selectedMonthYear ? selectedMonthYear.split("-")[0] : "Semua";
  const selectedMonthNum = selectedMonthYear ? selectedMonthYear.split("-")[1] : "Semua";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosyandu, setSelectedPosyandu] = useState("Semua Posyandu");
  const [selectedPuskesmas, setSelectedPuskesmas] = useState("Semua Puskesmas");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori (Semua Siklus)");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State for Single-Page View
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Modal State for Export Excel
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Dynamic Unified Rekap Data derived from globalSasaranList and globalPemeriksaanData (Hanya yang sudah periksa - persis seperti Posyandu)
  const allRekapList = useMemo(() => {
    if (!globalSasaranList || globalSasaranList.length === 0) return [];

    return globalSasaranList
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
          subText:
            formatAgeFromMonths(exam?.usia_bulan, s.subKategori || s.kategori) ||
            formatAgeFromMonths(getAgeInMonths(s.tglLahir, exam?.tanggal || new Date()), s.subKategori || s.kategori) ||
            s.usia ||
            "",
          tglLahir: s.tglLahir || "",
          gender: s.gender || "",
          posyandu: s.posyandu || "",
          puskesmas: s.puskesmas || "",
          rw: s.rw || "",
          keteranganKeluarga: s.keteranganIbuSuami || s.namaIbu || s.namaAyah || "",
          tglPeriksa: resolved.tglPeriksa || s.tglPeriksa || resolved.tanggal || "",
          pemeriksaanId: exam?.id || resolved?.idPemeriksaan || s.pemeriksaanId || null,
          status: isExamined ? "Sudah" : "Belum",
        };
      })
      .filter(Boolean)
      .filter((item) => item.status === "Sudah");
  }, [globalSasaranList, globalPemeriksaanData]);

  // Available Puskesmas List
  const availablePuskesmasList = useMemo(() => {
    return [...new Set(globalPosyanduList.map((item) => item.puskesmas).filter(Boolean))].sort();
  }, [globalPosyanduList]);

  // Available Posyandu List for filter dropdown
  const availablePosyanduList = useMemo(() => {
    let baseList = globalPosyanduList;
    if (isSuperAdminOrDinkes && selectedPuskesmas !== "Semua Puskesmas") {
      baseList = baseList.filter(item => item.puskesmas === selectedPuskesmas);
    } else if (!isSuperAdminOrDinkes && user?.puskesmas) {
      baseList = baseList.filter(item => item.puskesmas === user.puskesmas);
    }
    return [...new Set(baseList.map((item) => item.nama).filter(Boolean))].sort();
  }, [isSuperAdminOrDinkes, selectedPuskesmas, user?.puskesmas]);

  // Filtered List Logic (Search, Category, Posyandu, Month & Year)
  const filteredList = useMemo(() => {
    return allRekapList.filter((item) => {
      // 1. Search match
      const matchSearch = !searchTerm || (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.nik || "").includes(searchTerm) || (item.posyandu || "").toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Posyandu & Puskesmas match
      const matchPuskesmas = selectedPuskesmas === "Semua Puskesmas" || (item.puskesmas && item.puskesmas.toLowerCase().includes(selectedPuskesmas.toLowerCase()));
      const matchPosyandu = selectedPosyandu === "Semua Posyandu" || selectedPosyandu === "all" || (item.posyandu && item.posyandu.toLowerCase().includes(selectedPosyandu.toLowerCase()));

      // 3. Category match
      let matchCat = true;
      if (selectedCategory !== "Semua Kategori (Semua Siklus)") {
        const itemKat = (item.kategori || "").toLowerCase();
        const itemSubKat = (item.subKategori || "").toLowerCase();
        const targetCat = (selectedCategory || "").toLowerCase();
        matchCat = itemKat.includes(targetCat) || itemSubKat.includes(targetCat) || targetCat.includes(itemKat);
      }

      // 4. Month & Year Filter (Supports DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY)
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
              itemYear = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            }
          }

          if (selectedMonthNum !== "Semua" && itemMonth && itemMonth !== selectedMonthNum) {
            matchMonthYear = false;
          }
          if (selectedYear !== "Semua" && itemYear && itemYear !== selectedYear) {
            matchMonthYear = false;
          }
        }
      }

      return matchSearch && matchPuskesmas && matchPosyandu && matchCat && matchMonthYear;
    });
  }, [allRekapList, searchTerm, selectedPosyandu, selectedPuskesmas, selectedCategory, selectedMonthNum, selectedYear]);

  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenDetail = async (citizen) => {
    setSelectedCitizen(citizen);
    setSelectedExamDetail(null);
    const pemeriksaanId = citizen?.pemeriksaanId || citizen?.exam?.id;
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
  };

  const handleCloseDetail = () => {
    setSelectedCitizen(null);
    setSelectedExamDetail(null);
    setIsLoadingDetail(false);
  };

  if (isStaf) {
    return (
      <div className="container-fluid p-0">
        {/* Top Header & Export Action */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Rekapitulasi Pelaporan (Agregat)</h4>
            <p className="text-muted small mb-0">Format laporan agregat bulanan Excel (.xlsx) untuk verifikasi &amp; pelaporan.</p>
          </div>
          <button
            className="btn btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2 rounded-3 shadow-xs text-white"
            style={{ backgroundColor: themeColor }}
            onClick={() => setIsExportModalOpen(true)}
            title="Export Laporan Rekapitulasi ke Excel"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>

        {/* Filter Bar for Staf */}
        <div className="card card-custom p-3 mb-4 bg-white border-0 shadow-sm rounded-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <label className="form-label text-muted small fw-bold mb-1">Pilih Template Kategori Rekap</label>
              <select
                className="form-select bg-light text-dark fw-semibold py-2"
                value={stafTemplateKey}
                onChange={(e) => setStafTemplateKey(e.target.value)}
              >
                <option value="bumil_nifas_menyusui">Ibu Hamil, Nifas &amp; Menyusui</option>
                <option value="bayi_balita_apras">Bayi, Balita &amp; Anak Pra-Sekolah</option>
                <option value="usia_sekolah_remaja">Anak Usia Sekolah &amp; Remaja (6–18 Tahun)</option>
                <option value="dewasa_lansia">Usia Dewasa &amp; Lansia (≥ 19 Tahun)</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label text-muted small fw-bold mb-1">Tahun Laporan</label>
              <select
                className="form-select bg-light text-dark fw-semibold py-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="Semua">Semua Tahun</option>
                {[
                  ...new Set([
                    ...Object.values(globalPemeriksaanData || {})
                      .map((exam) => String(exam?.tanggal || "").slice(0, 4))
                      .filter((year) => /^\d{4}$/.test(year)),
                    String(new Date().getFullYear()),
                  ]),
                ]
                  .sort((a, b) => Number(b) - Number(a))
                  .map((year) => (
                    <option key={year} value={year}>
                      Tahun {year}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Aggregate Preview Table Component */}
        <div className="card card-custom p-3 bg-white border-0 shadow-sm rounded-4 mb-4">
          <RekapWorksheetPreview
            templateRekap={stafTemplateKey}
            year={selectedYear}
            theme={isDinkes ? "dinkes" : "puskesmas"}
            roleTitle={roleTitle}
          />
        </div>

        {/* EXPORT REKAP MODAL */}
        <ExportRekapModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          currentCategory={stafTemplateKey}
          currentYear={selectedYear}
          globalSasaranList={globalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          filteredList={filteredList}
          theme={isDinkes ? "dinkes" : "puskesmas"}
          themeColor={themeColor}
          roleTitle={roleTitle}
        />
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Export Action & Filter Bar */}
      <div className="d-flex justify-content-end gap-2 mb-3">
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
          {/* Puskesmas Filter */}
          {isSuperAdminOrDinkes && (
            <div className="col-12 col-md-2">
              <select className="form-select text-dark fw-semibold small py-2" style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6" }} value={selectedPuskesmas} onChange={(e) => { setSelectedPuskesmas(e.target.value); setSelectedPosyandu("Semua Posyandu"); }} title="Pilih Puskesmas">
                <option value="Semua Puskesmas">Semua Puskesmas</option>
                {availablePuskesmasList.map((puskesmas, idx) => (
                  <option key={idx} value={puskesmas}>{puskesmas}</option>
                ))}
              </select>
            </div>
          )}

          {/* Posyandu Filter */}
          <div className={`col-12 ${isSuperAdminOrDinkes ? "col-md-2" : "col-md-3"}`}>
            <select className="form-select text-dark fw-semibold small py-2" style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6" }} value={selectedPosyandu} onChange={(e) => setSelectedPosyandu(e.target.value)} title="Pilih Posyandu">
              <option value="Semua Posyandu">Semua Posyandu</option>
              {availablePosyanduList.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className={`col-12 ${isSuperAdminOrDinkes ? "col-md-3" : "col-md-3"}`}>
            <select className="form-select text-dark small py-2" style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6" }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
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

          {/* Bulan & Tahun Filter (Combined) */}
          <div className={`col-12 ${isSuperAdminOrDinkes ? "col-md-2" : "col-md-3"}`}>
            <div className="input-group">
              <span className="input-group-text border-end-0 px-2" style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6", color: themeColor }}>
                <Calendar size={14} />
              </span>
              <input 
                type="month" 
                className="form-control border-start-0 text-dark fw-semibold small py-2" 
                style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6", outlineColor: themeColor }}
                value={selectedMonthYear} 
                onChange={(e) => setSelectedMonthYear(e.target.value)} 
                title="Pilih Waktu Periksa" 
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text border-end-0 px-2" style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6", color: themeColor }}>
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-control border-start-0 text-dark small py-2" 
                style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6", outlineColor: themeColor }}
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
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Tidak ada data pemeriksaan yang sesuai dengan filter bulan ({selectedMonthNum}) / tahun ({selectedYear}) yang dipilih.
                  </td>
                </tr>
              ) : (
                paginatedList.map((row, idx) => (
                  <tr key={row.id || idx} className="border-bottom">
                    <td className="ps-4 text-center fw-medium text-muted small">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{row.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: "0.78rem" }}>
                        {row.nik}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark mb-0">{row.kategori}</div>
                    </td>
                    <td className="text-dark fw-medium text-nowrap">{row.subText || row.usia || "-"}</td>
                    <td className="text-secondary small text-nowrap">{formatDateId(row.tglPeriksa)}</td>
                    <td className="pe-4 text-center text-nowrap">
                      <div className="d-flex align-items-center justify-content-center gap-1.5">
                        <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => handleOpenDetail(row)} title="Lihat Detail Hasil 5 Langkah">
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
            Menampilkan {paginatedList.length} dari {totalItems} sasaran
          </span>
          <nav>
            {totalPages > 1 && (
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link shadow-none" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                    &lt;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                    <button
                      className="page-link shadow-none text-dark"
                      style={currentPage === page ? { backgroundColor: themeColor, color: "white", borderColor: themeColor } : {}}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link shadow-none" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                    &gt;
                  </button>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </div>

      {/* SINGLE-PAGE DETAIL MODAL (Menampilkan Seluruh Langkah 1 s/d 5 Dalam Satu Halaman Utuh) */}
      {selectedCitizen && (
        <DetailRekapModal
          citizen={selectedCitizen}
          examData={selectedExamDetail}
          isLoading={isLoadingDetail}
          onClose={handleCloseDetail}
          theme={isDinkes ? "dinkes" : "puskesmas"}
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
        theme={isDinkes ? "dinkes" : "puskesmas"}
        themeColor={themeColor}
        roleTitle={roleTitle}
      />
    </div>
  );
}
