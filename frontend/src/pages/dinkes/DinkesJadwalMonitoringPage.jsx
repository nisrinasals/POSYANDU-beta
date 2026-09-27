import React, { useState, useMemo } from "react";
import { Calendar, Clock, MapPin, Search, Eye, Filter, UserCheck, ChevronLeft, ChevronRight, X, Info, Building2, CalendarCheck, Users, FileText } from "lucide-react";

export default function DinkesJadwalMonitoringPage({ globalJadwalList = [] }) {
  const themeColor = "#1e3a8a";
  const [searchQuery, setSearchQuery] = useState("");
  const [bulanFilter, setBulanFilter] = useState("Semua");
  const [selectedPuskesmas, setSelectedPuskesmas] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal state
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const rawList = globalJadwalList || [];

  // Filtered List se-Kota
  const filteredList = useMemo(() => {
    return rawList
      .filter((item) => {
        const matchMonth = bulanFilter === "Semua" || (item.tanggal && item.tanggal.startsWith(bulanFilter));

        const matchSearch =
          searchQuery === "" ||
          (item.posyandu && item.posyandu.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.namaPosyandu && item.namaPosyandu.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.rw && item.rw.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.lokasi && item.lokasi.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.puskesmas && item.puskesmas.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchPusk = selectedPuskesmas === "Semua" || (item.puskesmas && item.puskesmas.toLowerCase().includes(selectedPuskesmas.toLowerCase()));

        const matchStatus = statusFilter === "Semua" || item.status === statusFilter;

        return matchMonth && matchSearch && matchPusk && matchStatus;
      })
      .sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
  }, [rawList, bulanFilter, searchQuery, selectedPuskesmas, statusFilter]);

  // Statistics calculation for the current month
  const stats = useMemo(() => {
    const currentMonthItems = rawList.filter((item) => bulanFilter === "Semua" || (item.tanggal && item.tanggal.startsWith(bulanFilter)));
    const total = currentMonthItems.length;
    const selesai = currentMonthItems.filter((j) => j.status === "Selesai" || j.status === "Selesai Terlaksana").length;
    const mendatang = total - selesai;

    return { total, selesai, mendatang };
  }, [rawList, bulanFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const handleOpenDetail = (jadwal) => {
    setSelectedJadwal(jadwal);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="d-flex flex-column gap-3.5 pb-5">
      {/* Filter & Action Bar */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-3.5">
        <div className="row g-3 align-items-center">
          {/* Search bar */}
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control ps-5 pe-4 bg-light border-0 rounded-3 shadow-none"
                placeholder="Cari nama posyandu, RW, lokasi, atau puskesmas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ fontSize: "0.875rem", height: "44px" }}
              />
              {searchQuery && (
                <button className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 p-1 shadow-none" type="button" onClick={() => setSearchQuery("")}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Puskesmas Selector */}
          <div className="col-12 col-sm-6 col-md-4">
            <select
              className="form-select bg-light border-0 rounded-3 text-dark fw-semibold shadow-none px-3"
              style={{ fontSize: "0.875rem", height: "44px", cursor: "pointer" }}
              value={selectedPuskesmas}
              onChange={(e) => {
                setSelectedPuskesmas(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Semua">Semua Puskesmas</option>
              {[...new Set((rawList || []).map((item) => item.puskesmas).filter(Boolean))].sort().map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="col-12 col-sm-6 col-md-3">
            <select
              className="form-select bg-light border-0 rounded-3 text-dark fw-semibold shadow-none px-3"
              style={{ fontSize: "0.875rem", height: "44px", cursor: "pointer" }}
              value={bulanFilter}
              onChange={(e) => {
                setBulanFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Semua">Semua Jadwal</option>
              {[...new Set((rawList || []).map((item) => String(item.tanggal || "").slice(0, 7)).filter(Boolean))]
                .sort()
                .reverse()
                .map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Card: Daftar Jadwal Posyandu Se-Kota (Matching Puskesmas Table Columns) */}
      <div className="card border-0 bg-white rounded-4 shadow-xs p-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <CalendarCheck size={20} style={{ color: themeColor }} />
              <span>Daftar Jadwal Posyandu Se-Kota</span>
            </h5>
            <p className="text-muted small mb-0" style={{ fontSize: "0.8rem" }}>
              Menampilkan {paginatedList.length} dari {filteredList.length} total jadwal operasional posyandu
            </p>
          </div>
          <div className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill small fw-semibold align-self-start align-self-sm-center">Periode: {bulanFilter === "Semua" ? "Semua Jadwal" : bulanFilter}</div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
            <thead>
              <tr className="text-secondary small fw-bold bg-light" style={{ borderBottom: "2px solid #edf2f7", fontSize: "0.78rem", letterSpacing: "0.04em" }}>
                <th className="py-3 px-3 text-center" style={{ width: "55px" }}>
                  NO
                </th>
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
                    <div>Tidak ada jadwal posyandu yang cocok untuk filter yang dipilih.</div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isFinished = item.status === "Selesai";

                  return (
                    <tr key={item.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {/* NO */}
                      <td className="py-3 px-3 text-center text-muted fw-semibold" style={{ fontSize: "0.875rem" }}>
                        {rowNumber}
                      </td>

                      {/* NAMA POSYANDU & RW */}
                      <td className="py-3 px-3">
                        <div className="fw-bold text-dark" style={{ fontSize: "0.925rem" }}>
                          {item.posyandu || item.namaPosyandu || item.nama}
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.825rem" }}>
                          {item.rw || ""}
                          {item.rw && item.puskesmas ? " • " : ""}
                          {item.puskesmas || ""}
                        </div>
                      </td>

                      {/* TANGGAL & WAKTU */}
                      <td className="py-3 px-3">
                        <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>
                          {item.tanggalFormatted || item.tanggal || ""}
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.825rem" }}>
                          {item.waktu || ""}
                        </div>
                      </td>

                      {/* LOKASI */}
                      <td className="py-3 px-3">
                        <div className="text-dark fw-medium" style={{ fontSize: "0.875rem" }}>
                          {item.lokasi || ""}
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.8rem" }}>
                          {item.alamatDetail || item.rw || ""}
                        </div>
                      </td>

                      {/* FOKUS LAYANAN */}
                      <td className="py-3 px-3">
                        <div className="d-flex flex-wrap gap-1.5">
                          {(item.fokusLayanan || []).map((layanan, fIdx) => (
                            <span key={fIdx} className="badge bg-light text-dark border px-2.5 py-1 rounded-2" style={{ fontSize: "0.78rem", fontWeight: 500 }}>
                              {layanan}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* STATUS (Clean, No Icon) */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`badge px-3 py-1.5 rounded-pill fw-semibold ${isFinished ? "bg-success-subtle text-success border border-success-subtle" : "text-white"}`}
                          style={{ backgroundColor: isFinished ? undefined : themeColor, fontSize: "0.78rem" }}
                        >
                          {item.status || ""}
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="py-3 px-3 text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => handleOpenDetail(item)} title="Lihat Detail Jadwal">
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
          <div className="text-muted small" style={{ fontSize: "0.825rem" }}>
            Menampilkan <span className="fw-semibold text-dark">{paginatedList.length}</span> dari <span className="fw-semibold text-dark">{filteredList.length}</span> jadwal posyandu se-Kota
          </div>

          <div className="d-flex align-items-center gap-1">
            <button className="btn btn-sm btn-light border p-1.5 rounded-2" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, pIdx) => (
              <button
                key={pIdx + 1}
                className={`btn btn-sm px-2.5 py-1 rounded-2 fw-semibold ${currentPage === pIdx + 1 ? "text-white" : "btn-light border text-secondary"}`}
                style={{
                  fontSize: "0.8rem",
                  minWidth: "32px",
                  backgroundColor: currentPage === pIdx + 1 ? themeColor : undefined,
                  borderColor: currentPage === pIdx + 1 ? themeColor : undefined,
                }}
                onClick={() => setCurrentPage(pIdx + 1)}
              >
                {pIdx + 1}
              </button>
            ))}
            <button className="btn btn-sm btn-light border p-1.5 rounded-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Detail Jadwal Posyandu Se-Kota (Standard Posyandu-Aligned Structure) */}
      {isDetailModalOpen && selectedJadwal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: "#1e3a8a" }}>
                <div className="d-flex align-items-center gap-2">
                  <FileText size={19} color="#ffffff" style={{ stroke: "#ffffff" }} />
                  <h5 className="modal-title fw-bold mb-0" style={{ color: "#ffffff", fontSize: "1.05rem" }}>
                    Detail Jadwal Posyandu Se-Kota
                  </h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsDetailModalOpen(false)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="row g-3">
                  {/* Card 1: Informasi Pelaksanaan */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-xs rounded-3 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom text-dark">
                        <Calendar size={16} style={{ color: "#1e3a8a" }} />
                        <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                          Waktu Pelaksanaan
                        </h6>
                      </div>
                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: "0.82rem" }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: "125px" }}>
                              Hari / Tanggal
                            </td>
                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.tanggalFormatted || selectedJadwal.tanggal || ""}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Waktu Pelaksanaan</td>
                            <td className="py-1 text-dark">: {selectedJadwal.waktu || ""}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Status Jadwal</td>
                            <td className="py-1">
                              :{" "}
                              <span
                                className={`badge ${selectedJadwal.status === "Selesai" ? "bg-success-subtle text-success border border-success-subtle" : "bg-primary-subtle text-primary border border-primary-subtle"} px-2 py-0.5 rounded-pill`}
                              >
                                {selectedJadwal.status || ""}
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
                        <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                          Lokasi & Wilayah
                        </h6>
                      </div>
                      <table className="table table-borderless table-sm mb-0" style={{ fontSize: "0.82rem" }}>
                        <tbody>
                          <tr>
                            <td className="text-muted ps-0 py-1" style={{ width: "125px" }}>
                              Lokasi / Tempat
                            </td>
                            <td className="py-1 fw-bold text-dark">: {selectedJadwal.lokasi || ""}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Alamat Detail / RT</td>
                            <td className="py-1 text-dark">: {selectedJadwal.alamatDetail || selectedJadwal.rw || ""}</td>
                          </tr>
                          <tr>
                            <td className="text-muted ps-0 py-1">Posyandu</td>
                            <td className="py-1 text-dark">: {selectedJadwal.posyandu || selectedJadwal.namaPosyandu || selectedJadwal.nama}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 3: Fokus Layanan & Catatan */}
                  <div className="col-12">
                    <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
                      <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "0.9rem" }}>
                        Fokus Layanan Hari Ini
                      </h6>
                      <div className="d-flex flex-wrap gap-1.5 mb-3">
                        {(selectedJadwal.fokusLayanan || []).map((layanan, i) => (
                          <span key={i} className="badge bg-light text-secondary border px-2.5 py-1 rounded-2" style={{ fontSize: "0.78rem" }}>
                            {layanan}
                          </span>
                        ))}
                      </div>

                      <div className="p-3 bg-light rounded-2 border">
                        <span className="text-muted d-block mb-1" style={{ fontSize: "0.74rem" }}>
                          Catatan Persiapan:
                        </span>
                        <p className="mb-0 text-dark fw-medium" style={{ fontSize: "0.84rem" }}>
                          {selectedJadwal.catatan || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top py-2.5 px-4 d-flex justify-content-end">
                <button type="button" className="btn btn-secondary px-4 fw-semibold rounded-3" style={{ fontSize: "0.85rem" }} onClick={() => setIsDetailModalOpen(false)}>
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
