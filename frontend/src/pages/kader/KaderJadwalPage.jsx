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

  const itemsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [alertNotification, setAlertNotification] = useState(null);

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

  const filteredList = useMemo(() => {
    return (globalJadwalList || [])
      .filter((item) => {
        if (!item) return false;

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

        return matchPosyandu && matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
  }, [globalJadwalList, posyanduName, searchQuery, statusFilter]);

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

    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (jadwal) => {
    setSelectedJadwal(jadwal);
    setIsDetailModalOpen(true);
  };

  const formatTanggalIndo = (dateStr) => {
    return formatDateId(dateStr);
  };

  const handleSaveJadwal = async (e) => {
    e.preventDefault();

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
    };

    try {
      const res = await sesiService.createSesi(payload);

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
    }
  };

  return (
    <div className="d-flex flex-column gap-3 pb-4">
      {/* Toast */}
      {alertNotification && (
        <div className="alert border-0 shadow-sm rounded-3 position-fixed bottom-0 end-0 m-4 z-3 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: "#2b2e4a" }}>
          <CheckCircle2 size={20} className="text-primary" />
          <span className="fw-medium">{alertNotification}</span>
        </div>
      )}

      {/* Top Action */}
      <div className="d-flex align-items-center justify-content-end mb-3">
        <button className="btn btn-dark-custom btn-top-action shadow-xs" onClick={handleOpenCreateModal}>
          <Plus size={16} />
          <span>Tambah Jadwal Baru</span>
        </button>
      </div>

      {/* Jadwal Hari Buka Berikutnya */}
      {upcomingJadwal && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-relative overflow-hidden">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge px-2.5 py-1 rounded-pill small fw-semibold text-white" style={{ backgroundColor: "#2b2e4a" }}>
              Jadwal Hari Buka Berikutnya
            </span>
          </div>

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
          </div>
        </div>
      )}

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
            >
              {filteredList.length} Jadwal
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Search */}
            <div className="input-group input-group-sm" style={{ minWidth: "220px" }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={15} />
              </span>

              <input
                type="text"
                className="form-control form-control-sm bg-light border-start-0 ps-0"
                placeholder="Cari jadwal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />

              {searchQuery && (
                <button className="btn btn-light btn-sm border-start-0 text-muted" type="button" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              className="form-select form-select-sm bg-light rounded-2 text-dark fw-semibold"
              style={{
                width: "auto",
                minWidth: "130px",
              }}
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

            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <Info size={28} className="opacity-40 mb-2 d-block mx-auto" />

                    <div>Tidak ada jadwal posyandu yang sesuai dengan filter pencarian.</div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={item.id}>
                      {/* NO */}
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
                      </td>

                      {/* STATUS */}
                      <td className="py-2.5 text-center">
                        {item.status === "Terjadwal" ? (
                          <span className="badge px-2.5 py-1 rounded-pill fw-semibold bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "0.72rem" }}>
                            Terjadwal
                          </span>
                        ) : (
                          <span className="badge px-2.5 py-1 rounded-pill fw-semibold bg-success-subtle text-success border border-success-subtle" style={{ fontSize: "0.72rem" }}>
                            Selesai
                          </span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="pe-4 py-2.5 text-center text-nowrap">
                        <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => handleOpenDetailModal(item)}>
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

        {/* Pagination */}
        <div className="card-footer bg-light py-2.5 px-3 px-md-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2" style={{ fontSize: "0.8rem" }}>
          <div className="text-muted">
            Menampilkan <span className="fw-semibold text-dark">{paginatedList.length}</span> dari total <span className="fw-semibold text-dark">{filteredList.length}</span> jadwal
          </div>

          {totalPages > 1 && (
            <div className="d-flex align-items-center gap-1">
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
                  }}
                  onClick={() => setCurrentPage(pIdx + 1)}
                >
                  {pIdx + 1}
                </button>
              ))}

              <button className="btn btn-sm btn-light border p-1" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

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
                        required
                      />
                    </div>

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
                        required
                      />
                    </div>

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
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="row g-3">
                  {/* Informasi Tanggal */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-xs rounded-3 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom text-dark">
                        <Calendar size={16} className="text-primary" />

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
                                {selectedJadwal.status}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Lokasi & RW */}
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
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top py-2.5 px-4 d-flex justify-content-end">
                <button type="button" className="btn btn-secondary px-4 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={() => setIsDetailModalOpen(false)}>
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
