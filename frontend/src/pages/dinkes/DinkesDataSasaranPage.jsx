import React, { useState, useMemo } from "react";
import { Search, Eye, Filter, Info, ChevronLeft, ChevronRight, Building2, X } from "lucide-react";
import DetailSasaranModal from "../../components/sasaran/DetailSasaranModal";
import { formatDateId } from "../../utils/dataMappers";

export default function DinkesDataSasaranPage({
  globalSasaranList = [],
  globalPemeriksaanData = {},
  globalStatistikSasaran = {},
  globalPosyanduList = [],
  isGlobalStatistikLoading = false,
  privacyMode = false,
  onNavigate,
  initialCategoryFilter,
  setCategoryFilterParam,
  user,
}) {
  const themeColor = user?.roleType === "sa" ? "#6b4e31" : "#1e3a8a";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter && initialCategoryFilter !== "Semua Kategori" ? initialCategoryFilter : "all");
  const [selectedPuskesmas, setSelectedPuskesmas] = useState("Semua Puskesmas");
  const [selectedPosyandu, setSelectedPosyandu] = useState("Semua Posyandu");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Available Puskesmas List
  const availablePuskesmasList = useMemo(() => {
    return [...new Set(globalPosyanduList.map((item) => item.puskesmas).filter(Boolean))].sort();
  }, [globalPosyanduList]);

  // Available Posyandu List for filter dropdown
  const availablePosyanduList = useMemo(() => {
    let baseList = globalPosyanduList;
    if (selectedPuskesmas !== "Semua Puskesmas") {
      baseList = baseList.filter(item => item.puskesmas === selectedPuskesmas);
    }
    return [...new Set(baseList.map((item) => item.nama).filter(Boolean))].sort();
  }, [selectedPuskesmas, globalPosyanduList]);

  // Selected sasaran for detailed modal
  const [selectedSasaran, setSelectedSasaran] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dataset directly reflecting database state
  const dataset = globalSasaranList || [];

  const totalSasaran = dataset.length;

  const filteredData = useMemo(() => {
    return dataset.filter((item) => {
      // 1. Search Query
      const matchesSearch =
        (item.nama && item.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.nik && item.nik.includes(searchQuery)) ||
        (item.noKk && item.noKk.includes(searchQuery)) ||
        (item.posyandu && item.posyandu.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category Filter
      let matchesCategory = true;
      if (selectedCategory !== "all" && selectedCategory !== "Semua Kategori") {
        const itemCat = (item.kategori || "").toLowerCase().replace(/[–—]/g, "-").trim();
        const selCat = selectedCategory.toLowerCase().replace(/[–—]/g, "-").trim();
        matchesCategory = itemCat.includes(selCat) || selCat.includes(itemCat);
      }

      const matchesStatus = statusFilter === "Semua Status" || (statusFilter === "Aktif" && item.status === "Aktif") || (statusFilter === "Non-Aktif" && item.status !== "Aktif");

      // 3. Puskesmas / Faskes Filter
      let matchesPuskesmas = true;
      if (selectedPuskesmas !== "Semua Puskesmas") {
        let puskesmasName = item.puskesmas;
        if (!puskesmasName) {
           const posyanduData = globalPosyanduList.find(p => p.nama === item.posyandu || p.nama_posyandu === item.posyandu);
           if (posyanduData) {
               puskesmasName = posyanduData.puskesmas || posyanduData.puskesmas?.nama_puskesmas;
           }
        }
        const itemPusk = (puskesmasName || item.posyandu || "").toLowerCase();
        matchesPuskesmas = itemPusk.includes(selectedPuskesmas.toLowerCase());
      }

      // 4. Posyandu Filter
      let matchesPosyandu = true;
      if (selectedPosyandu !== "Semua Posyandu") {
        matchesPosyandu = (item.posyandu || "").toLowerCase().includes(selectedPosyandu.toLowerCase());
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesPuskesmas && matchesPosyandu;
    });
  }, [dataset, searchQuery, statusFilter, selectedCategory, selectedPuskesmas, selectedPosyandu]);

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
    setSearchQuery("");
    setStatusFilter("Semua Status");
    setSelectedCategory("all");
    setSelectedPuskesmas("Semua Puskesmas");
    setSelectedPosyandu("Semua Posyandu");
    setCurrentPage(1);
  };

  if (privacyMode) {
    const categories = [
      ["bumil", "Bumil"],
      ["busui", "Nifas/Menyusui"],
      ["bayi", "Bayi 0-11 Bulan"],
      ["balita", "Balita 12-59 Bulan"],
      ["apras", "Apras 60-72 Bulan"],
      ["uskrem_6_14", "Usia Sekolah 6-14 Tahun"],
      ["uskrem_15_18", "Usia Sekolah 15-18 Tahun"],
      ["dewasa", "Dewasa"],
      ["lansia", "Lansia"],
    ];
    const total = Number(globalStatistikSasaran?.total_warga || 0);

    return (
      <div className="d-flex flex-column gap-3.5 pb-4">
        <div className="card border-0 bg-white shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-start gap-3">
            <div className="rounded-3 p-3 bg-primary-subtle text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <h4 className="fw-bold text-dark mb-1">Statistik Sasaran Agregat</h4>
              <p className="text-muted mb-0">Data personal seperti nama, NIK, alamat, dan detail warga tidak ditampilkan untuk role Dinkes.</p>
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-12 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <div className="text-muted small">Total warga aktif</div>
                <div className="display-6 fw-bold text-dark">{isGlobalStatistikLoading ? "..." : total.toLocaleString("id-ID")}</div>
              </div>
            </div>
            {categories.map(([key, label]) => (
              <div className="col-6 col-md-4 col-xl-3" key={key}>
                <div className="border rounded-3 p-3 h-100">
                  <div className="text-muted small">{label}</div>
                  <div className="fs-3 fw-bold text-dark">{isGlobalStatistikLoading ? "..." : Number(globalStatistikSasaran?.[key] || 0).toLocaleString("id-ID")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3.5 pb-4">
      {/* Main Container Card */}
      <div className="card border bg-white rounded-4 p-4 shadow-sm" style={{ borderRadius: "20px", borderColor: "#e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        {/* Search & Filter Bar */}
        <div className="row g-2 mb-4 align-items-center">
          <div className="col-12 col-md-3">
            <select
              className="form-select bg-white text-dark fw-medium shadow-none"
              value={selectedPuskesmas}
              onChange={(e) => {
                setSelectedPuskesmas(e.target.value);
                setSelectedPosyandu("Semua Posyandu");
                setCurrentPage(1);
              }}
              style={{ height: "42px", fontSize: "0.875rem", borderRadius: "10px", borderColor: "#dbe5ee" }}
            >
              <option value="Semua Puskesmas">Semua Puskesmas</option>
              {availablePuskesmasList.map((puskesmas, idx) => (
                <option key={idx} value={puskesmas}>{puskesmas}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select bg-white text-dark fw-medium shadow-none"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{ height: "42px", fontSize: "0.875rem", borderRadius: "10px", borderColor: "#dbe5ee" }}
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
          <div className="col-12 col-md-2">
            <select
              className="form-select bg-white text-dark fw-medium shadow-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ height: "42px", fontSize: "0.875rem", borderRadius: "10px", borderColor: "#dbe5ee" }}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <div className="position-relative">
              <Search size={18} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: themeColor }} />
              <input
                type="text"
                className="form-control ps-5 bg-white text-dark shadow-none"
                placeholder="Cari Nama / NIK..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ height: "42px", fontSize: "0.875rem", borderRadius: "10px", borderColor: themeColor }}
              />
              {searchQuery && (
                <button className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 p-1" type="button" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="col-12 col-md-1">
            <button
              className="btn btn-light border fw-semibold w-100 d-flex align-items-center justify-content-center gap-1.5 shadow-none"
              style={{ height: "42px", borderRadius: "10px", borderColor: "#dbe5ee", fontSize: "0.875rem", color: themeColor }}
              onClick={handleResetFilter}
              title="Reset Filter"
            >
              <Filter size={15} />
              <span className="d-none d-md-inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Data Sasaran Table */}
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: "0.86rem" }}>
            <thead>
              <tr className="text-muted small text-uppercase fw-bold border-bottom" style={{ backgroundColor: "#f8fafc", fontSize: "0.78rem", letterSpacing: "0.04em" }}>
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
                <th className="py-3 text-center" style={{ minWidth: "120px" }}>
                  JENIS KELAMIN
                </th>
                <th className="py-3 text-center" style={{ minWidth: "100px" }}>
                  STATUS
                </th>
                <th className="pe-4 py-3 text-center" style={{ width: "110px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted" style={{ fontSize: "0.9rem" }}>
                    Tidak ditemukan data sasaran yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="border-bottom">
                    <td className="ps-4 text-center text-secondary fw-semibold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{item.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: "0.78rem" }}>
                        {item.nik || ""}
                      </div>
                    </td>
                    <td className="text-center text-secondary fw-medium text-nowrap">{formatDateId(item.tglLahir || item.tanggalLahir)}</td>
                    <td>
                      <div className="fw-semibold text-dark mb-0">{item.kategori}</div>
                    </td>
                    <td className="text-center text-secondary">{item.gender || (item.jenisKelamin === "P" || item.jenis_kelamin === "P" ? "Perempuan" : item.jenisKelamin === "L" || item.jenis_kelamin === "L" ? "Laki-laki" : "")}</td>
                    <td className="text-center">
                      <span
                        className={`badge rounded-pill px-2.5 py-1 ${item.status === "Aktif" ? "bg-success-subtle text-success" : item.status ? "bg-secondary-subtle text-secondary" : "bg-light text-muted"}`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {item.status || ""}
                      </span>
                    </td>
                    <td className="pe-4 text-center text-nowrap">
                      <button
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none rounded-3 px-2.5 py-1"
                        onClick={() => handleOpenDetailModal(item)}
                        title="Lihat Detail Sasaran"
                        style={{ fontSize: "0.785rem" }}
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

          {totalPages > 1 && (
            <div className="d-flex align-items-center gap-1">
              <button className="btn btn-sm btn-light border p-1 px-2 text-muted rounded-2" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`btn btn-sm px-3 py-1 rounded-2 fw-semibold ${currentPage === page ? "text-white" : "btn-light border text-dark"}`}
                  style={{
                    backgroundColor: currentPage === page ? themeColor : undefined,
                    borderColor: currentPage === page ? themeColor : undefined,
                    fontSize: "0.82rem",
                  }}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button className="btn btn-sm btn-light border p-1 px-2 text-muted rounded-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Sasaran */}
      {showDetailModal && selectedSasaran && <DetailSasaranModal show={showDetailModal} onHide={handleCloseDetailModal} selectedSasaran={selectedSasaran} themeColor={themeColor} />}
    </div>
  );
}
