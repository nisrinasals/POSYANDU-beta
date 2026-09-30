import React, { useState, useMemo } from "react";
import { Download, Search, Users, CheckCircle, Clock, AlertTriangle, Filter, Calendar, Eye, FileText, Printer, Heart, Baby, GraduationCap, Activity } from "lucide-react";
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
  const [stafExportAll, setStafExportAll] = useState(false);
  const [stafPreviewKey, setStafPreviewKey] = useState(null);

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

  // Staf category definitions
  const stafCategories = [
    {
      key: "bumil_nifas_menyusui",
      label: "Ibu Hamil, Nifas & Menyusui",
      desc: "Rekap pemeriksaan ibu hamil, nifas, dan menyusui.",
      icon: <Heart size={22} />,
      iconColor: "#e11d48",
      iconBg: "rgba(225,29,72,0.08)",
    },
    {
      key: "bayi_balita_apras",
      label: "Bayi, Balita & Anak Pra-Sekolah",
      desc: "Rekap pemeriksaan bayi, balita, dan anak pra-sekolah.",
      icon: <Baby size={22} />,
      iconColor: "#0891b2",
      iconBg: "rgba(8,145,178,0.08)",
    },
    {
      key: "usia_sekolah_remaja",
      label: "Anak Usia Sekolah & Remaja (6–18 Tahun)",
      desc: "Rekap pemeriksaan anak usia sekolah dan remaja.",
      icon: <GraduationCap size={22} />,
      iconColor: "#7c3aed",
      iconBg: "rgba(124,58,237,0.08)",
    },
    {
      key: "dewasa_lansia",
      label: "Usia Dewasa & Lansia (≥ 19 Tahun)",
      desc: "Rekap pemeriksaan dewasa dan lansia.",
      icon: <Activity size={22} />,
      iconColor: "#059669",
      iconBg: "rgba(5,150,105,0.08)",
    },
  ];

  if (isStaf) {
    return (
      <div className="container-fluid p-0">
        {/* ── Header Bar ── */}
        <div className="card card-custom p-3 mb-4 bg-white border-0 shadow-sm rounded-4">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "46px", height: "46px", backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                <FileText size={22} />
              </div>
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: "0.95rem", letterSpacing: "-0.01em" }}>Format Rekapitulasi Pemeriksaan</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>Pilih template kategori atau ekspor semua template.</div>
              </div>
            </div>
            <button
              className="btn fw-semibold d-flex align-items-center gap-2 rounded-3 shadow-none text-white px-3 py-2"
              style={{ backgroundColor: themeColor, fontSize: "0.84rem" }}
              onClick={() => {
                setStafTemplateKey("bumil_nifas_menyusui");
                setStafExportAll(true);
                setIsExportModalOpen(true);
              }}
            >
              <Download size={15} /> Export Semua Kategori (.xlsx)
            </button>
          </div>
        </div>

        {/* ── 2×2 Category Cards ── */}
        <div className="row g-3 mb-4">
          {stafCategories.map((cat) => (
            <div key={cat.key} className="col-12 col-md-6">
              <div
                className="card bg-white border-0 shadow-sm rounded-4 p-3 h-100"
                style={{ borderColor: "#eef0f4", transition: "box-shadow 0.2s" }}
              >
                {/* Card Header */}
                <div className="mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", backgroundColor: cat.iconBg, color: cat.iconColor }}
                  >
                    {cat.icon}
                  </div>
                </div>

                {/* Card Body */}
                <div className="fw-bold text-dark mb-1" style={{ fontSize: "0.88rem", letterSpacing: "-0.01em" }}>
                  {cat.label}
                </div>
                <p className="text-muted mb-3" style={{ fontSize: "0.78rem", lineHeight: "1.5" }}>
                  {cat.desc}
                </p>

                {/* Footer */}
                <div className="d-flex align-items-center justify-content-between mt-auto pt-2" style={{ borderTop: "1px solid #f1f4f8" }}>
                  <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "0.73rem" }}>
                    <FileText size={12} className="text-danger" />
                    <span>Microsoft Excel (.xlsx)</span>
                  </div>
                  <button
                    className="btn btn-sm d-flex align-items-center gap-1 fw-semibold rounded-3 text-white"
                    style={{ fontSize: "0.76rem", backgroundColor: themeColor, padding: "5px 12px" }}
                    onClick={() => {
                      setStafTemplateKey(cat.key);
                      setStafExportAll(false);
                      setIsExportModalOpen(true);
                    }}
                  >
                    <Download size={13} /> Export Excel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* EXPORT REKAP MODAL */}
        <ExportRekapModal
          isOpen={isExportModalOpen}
          onClose={() => { setIsExportModalOpen(false); setStafExportAll(false); }}
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
