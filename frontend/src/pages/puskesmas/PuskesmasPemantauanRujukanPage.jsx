import React, { useState, useMemo, useEffect } from "react";
import { Search, Eye, FileText, ChevronLeft, ChevronRight, X, RotateCcw, Filter, User, AlertTriangle, ShieldCheck } from "lucide-react";
import { STANDAR_KATEGORI } from "../../data/kategoriPemeriksaan";
import { rujukanService } from "../../services";

export default function PuskesmasPemantauanRujukanPage({ globalSasaranList = [], globalPemeriksaanData = {} }) {
  // State kehadiran pasien rujukan (id: 'Hadir' | 'Tidak Hadir')

  const [backendReferrals, setBackendReferrals] = useState([]);

  useEffect(() => {
    let cancelled = false;
    rujukanService
      .getAllRujukan()
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) setBackendReferrals(rows);
      })
      .catch(() => {
        if (!cancelled) setBackendReferrals([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dynamicReferrals = useMemo(
    () =>
      backendReferrals.map((item, index) => ({
        id: item.id,
        no: String(index + 1).padStart(2, "0"),
        nama: item.warga?.nama_lengkap || "",
        nik: item.warga?.nik || "",
        kategori:
          {
            bumil: "Bumil",
            busui: "Nifas/Menyusui",
            bayi: "Bayi 0–11 Bln",
            balita: "Balita 12–59 Bln",
            apras: "Apras 60–72 Bln",
            uskrem_6_14: "Usekrem 6–14 Thn",
            uskrem_15_18: "Usekrem 15–18 Thn",
            dewasa: "Dewasa",
            lansia: "Lansia",
          }[item.pemeriksaan?.kategori_sasaran] ||
          item.pemeriksaan?.kategori_sasaran ||
          "",
        kategoriKey: item.pemeriksaan?.kategori_sasaran || "",
        usia: "",
        posyandu: item.warga?.posyandu?.nama_posyandu || "",
        kader: item.kader?.nama_lengkap || "",
        masalahBadge: item.alasan_rujukan || "",
        masalahSub: item.alasan_rujukan || "",
        tglDirujuk: item.tanggal_rujukan ? String(item.tanggal_rujukan).split("T")[0] : "",
        kehadiran: item.status_kehadiran_rujukan === "tidak_hadir" ? "Tidak Hadir" : item.status_kehadiran_rujukan === "hadir" ? "Hadir" : "",
        catatanKunjungan: "",
        raw: item,
      })),
    [backendReferrals],
  );

  const referrals = useMemo(() => {
    return dynamicReferrals;
  }, [dynamicReferrals]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosyandu, setSelectedPosyandu] = useState("all");
  const [selectedSiklus, setSelectedSiklus] = useState("all");
  const [selectedKehadiranFilter, setSelectedKehadiranFilter] = useState("all");

  // List of Posyandu for dropdown filter, sourced from backend referrals.
  const availablePosyanduList = useMemo(() => {
    const listFromData = referrals.map((item) => (item.posyandu ? item.posyandu.split("(")[0].trim() : "")).filter(Boolean);
    return Array.from(new Set(listFromData));
  }, [referrals]);

  // Modal state
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nik.includes(searchTerm) ||
        item.posyandu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.kader && item.kader.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPosyandu = selectedPosyandu === "all" || (item.posyandu && item.posyandu.toLowerCase().includes(selectedPosyandu.toLowerCase()));

      const matchSiklus = selectedSiklus === "all" || item.kategori === selectedSiklus;

      const currentAttendance = item.kehadiran || "";
      const matchKehadiran = selectedKehadiranFilter === "all" || currentAttendance === selectedKehadiranFilter;

      return matchSearch && matchPosyandu && matchSiklus && matchKehadiran;
    });
  }, [referrals, searchTerm, selectedPosyandu, selectedSiklus, selectedKehadiranFilter]);

  const handleOpenDetailModal = (item) => {
    setSelectedReferral(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedReferral(null);
    setShowDetailModal(false);
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedPosyandu("all");
    setSelectedSiklus("all");
    setSelectedKehadiranFilter("all");
  };

  return (
    <div className="d-flex flex-column gap-3 pb-4">
      {/* Filter and Search Bar Section */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-4" style={{ borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="row g-3 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-4">
            <div className="position-relative">
              <Search size={17} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-75" />
              <input
                type="text"
                className="form-control bg-white border border-secondary-subtle ps-5 pe-5 rounded-3 shadow-none text-dark"
                placeholder="Cari Nama / NIK / No. KK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: "44px", fontSize: "0.875rem", borderColor: "#d0d5dd", borderRadius: "10px" }}
              />
              {searchTerm && (
                <button className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 p-1" type="button" onClick={() => setSearchTerm("")}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Posyandu Select */}
          <div className="col-12 col-sm-6 col-md-3">
            <select
              className="form-select bg-white border border-secondary-subtle fw-medium text-dark rounded-3 shadow-none"
              value={selectedPosyandu}
              onChange={(e) => setSelectedPosyandu(e.target.value)}
              style={{ height: "44px", fontSize: "0.85rem", borderColor: "#d0d5dd", borderRadius: "10px" }}
            >
              <option value="all">Semua Posyandu</option>
              {availablePosyanduList.map((pos, idx) => (
                <option key={idx} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Siklus Hidup Select */}
          <div className="col-12 col-sm-6 col-md-2">
            <select
              className="form-select bg-white border border-secondary-subtle fw-medium text-dark rounded-3 shadow-none"
              value={selectedSiklus}
              onChange={(e) => setSelectedSiklus(e.target.value)}
              style={{ height: "44px", fontSize: "0.85rem", borderColor: "#d0d5dd", borderRadius: "10px" }}
            >
              <option value="all">Semua Kategori</option>
              {STANDAR_KATEGORI.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Kehadiran */}
          <div className="col-12 col-sm-6 col-md-2">
            <select
              className="form-select bg-white border border-secondary-subtle fw-medium text-dark rounded-3 shadow-none"
              value={selectedKehadiranFilter}
              onChange={(e) => setSelectedKehadiranFilter(e.target.value)}
              style={{ height: "44px", fontSize: "0.85rem", borderColor: "#d0d5dd", borderRadius: "10px" }}
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Tidak Hadir">Tidak Hadir</option>
            </select>
          </div>

          {/* Filter Action Button */}
          <div className="col-12 col-md-1">
            <button
              type="button"
              className="btn w-100 d-flex align-items-center justify-content-center text-white fw-bold rounded-3 shadow-xs"
              style={{ backgroundColor: "#428A75", height: "44px", fontSize: "0.85rem", borderRadius: "10px" }}
              onClick={handleResetFilter}
              title="Filter / Reset"
            >
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Referral Table Card */}
      <div className="card border-0 shadow-xs rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
            <thead className="bg-light small text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.04em", color: "#334155" }}>
              <tr>
                <th className="ps-4 py-3 text-center fw-bold" style={{ width: "45px" }}>
                  NO
                </th>
                <th className="py-3 fw-bold" style={{ minWidth: "180px" }}>
                  NAMA LENGKAP
                  <br />/ NIK
                </th>
                <th className="py-3 fw-bold" style={{ minWidth: "130px" }}>
                  KATEGORI
                </th>
                <th className="py-3 fw-bold" style={{ minWidth: "150px" }}>
                  ASAL
                  <br />
                  POSYANDU
                </th>
                <th className="py-3 text-center fw-bold" style={{ minWidth: "130px", whiteSpace: "nowrap" }}>
                  TANGGAL
                  <br />
                  DIRUJUK
                </th>
                <th className="py-3 fw-bold" style={{ minWidth: "220px" }}>
                  INDIKASI / MASALAH RUJUKAN
                </th>
                <th className="py-3 fw-bold" style={{ minWidth: "140px" }}>
                  STATUS HADIR
                </th>
                <th className="pe-4 py-3 text-center fw-bold" style={{ width: "80px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((item, idx) => {
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="ps-4 py-3 text-center fw-semibold text-secondary">{idx + 1}</td>
                      <td className="py-3">
                        <div className="fw-bold text-dark mb-0">{item.nama}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: "0.78rem" }}>
                          {item.nik}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="fw-semibold text-dark mb-0">{item.kategori}</div>
                      </td>
                      <td className="py-3">
                        <div className="fw-semibold text-dark">{item.posyandu}</div>
                      </td>
                      <td className="py-3 text-center fw-semibold text-secondary font-monospace" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {item.tglDirujuk}
                      </td>
                      <td className="py-3">
                        <div className="text-danger fw-bold mb-1" style={{ fontSize: "0.78rem" }}>
                          {item.masalahBadge}
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem", lineHeight: "1.35" }}>
                          {item.masalahSub}
                        </div>
                      </td>

                      <td className="py-3">
                        {item.kehadiran ? (
                          <span
                            className={`badge ${item.kehadiran === "Hadir" ? "bg-success-subtle text-success border border-success-subtle" : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"} px-2.5 py-1 rounded-pill`}
                          >
                            {item.kehadiran}
                          </span>
                        ) : (
                          ""
                        )}
                      </td>

                      <td className="pe-4 py-3 text-center text-nowrap">
                        <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none rounded-3 px-2.5 py-1" onClick={() => handleOpenDetailModal(item)} title="Lihat Detail Rujukan">
                          <Eye size={14} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Tidak ditemukan data pasien rujukan yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="card-footer bg-light py-3 px-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2" style={{ fontSize: "0.8rem" }}>
          <div className="text-muted">
            Menampilkan <span className="fw-semibold text-dark">{filteredReferrals.length}</span> dari total <span className="fw-semibold text-dark">{referrals.length}</span> data rujukan
          </div>

          <div className="d-flex align-items-center gap-1">
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled>
              <ChevronLeft size={15} />
            </button>
            <button className="btn btn-sm text-white px-2.5 py-0.5 fw-bold rounded-2" style={{ backgroundColor: "#428A75" }}>
              1
            </button>
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Rujukan & Catatan */}
      {showDetailModal && selectedReferral && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060, overflowY: "auto" }}
          tabIndex="-1"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDetailModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable my-4" style={{ maxHeight: "90vh" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column" style={{ maxHeight: "90vh" }}>
              {/* Modal Header */}
              <div className="modal-header text-white p-3 px-4 d-flex align-items-center justify-content-between flex-shrink-0" style={{ backgroundColor: "#428A75" }}>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-white text-dark fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: "0.74rem" }}>
                      {selectedReferral.kategori} ({selectedReferral.usia})
                    </span>
                    <span className="badge bg-white bg-opacity-25 text-white px-2.5 py-1 rounded-pill" style={{ fontSize: "0.74rem" }}>
                      Status: {selectedReferral.kehadiran || ""}
                    </span>
                  </div>
                  <h5 className="modal-title fw-bold text-white mb-0">Detail Informasi Rujukan Pasien</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseDetailModal} aria-label="Tutup"></button>
              </div>

              <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                {/* Modal Body with smooth scrolling */}
                <div className="modal-body p-4 bg-light overflow-y-auto" style={{ maxHeight: "calc(90vh - 130px)", overflowY: "auto" }}>
                  {/* Card 1: Identitas Pasien Warga */}
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                    <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                      <User size={18} style={{ color: "#428A75" }} />
                      <span>Identitas Pasien Warga</span>
                    </h6>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Nomor Induk Kependudukan (NIK)
                          </div>
                          <div className="fw-bold font-monospace text-dark fs-6">{selectedReferral.nik}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Nama Lengkap Pasien
                          </div>
                          <div className="fw-bold text-dark fs-6">{selectedReferral.nama}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Kategori &amp; Usia
                          </div>
                          <div className="fw-bold text-dark fs-6">
                            {selectedReferral.kategori} ({selectedReferral.usia})
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Asal Posyandu
                          </div>
                          <div className="fw-bold text-dark fs-6">{selectedReferral.posyandu}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Kader yang Merujuk
                          </div>
                          <div className="fw-bold text-dark fs-6">{selectedReferral.kader}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Indikasi Masalah Rujukan */}
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                    <h6 className="fw-bold text-danger mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                      <AlertTriangle size={18} className="text-danger" />
                      <span>Indikasi Klinis &amp; Masalah Medis Rujukan</span>
                    </h6>

                    <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 mb-3">
                      <div className="fw-bold text-danger fs-6 mb-1">{selectedReferral.masalahBadge}</div>
                      <div className="text-dark small" style={{ lineHeight: "1.5" }}>
                        {selectedReferral.masalahSub}
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Tanggal Pengantar Rujukan
                          </div>
                          <div className="fw-bold text-dark fs-6 font-monospace">{selectedReferral.tglDirujuk}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Fasilitas Rujukan
                          </div>
                          <div className="fw-bold text-dark fs-6">{selectedReferral.raw?.puskesmas?.nama_puskesmas || selectedReferral.raw?.puskesmas?.nama || selectedReferral.raw?.puskesmas_nama || ""}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Presensi & Tindak Lanjut */}
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                      <ShieldCheck size={18} style={{ color: "#428A75" }} />
                      <span>Presensi &amp; Tindak Lanjut</span>
                    </h6>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1">Status Kehadiran</div>
                          <div className="fw-bold text-dark">{selectedReferral.kehadiran || ""}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1">Catatan</div>
                          <div className="text-dark small">{selectedReferral.raw?.catatan || selectedReferral.raw?.catatan_kunjungan || ""}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-end gap-2 border-top flex-shrink-0">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-4 rounded-3 fw-semibold" onClick={handleCloseDetailModal}>
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
