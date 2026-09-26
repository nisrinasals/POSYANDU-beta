import React, { useState } from "react";
import { Search, Filter, Check, X, Clock, UserCheck, UserX, UserCog, RefreshCw, Building2, Shield, CheckCircle2, PowerOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { userService } from "../../services";

export default function DinkesVerifikasiAkunPage({
  activeSubmenu = "puskesmas",
  staffList: propStaffList,
  puskesmasList: propPuskesmasList,
  puskesmasStaffList: propPuskesmasStaffList,
  onApproveStaff: propOnApproveStaff,
  onRejectStaff: propOnRejectStaff,
  onToggleStaffStatus: propOnToggleStaffStatus,
  onApprovePuskesmas: propOnApprovePuskesmas,
  onRejectPuskesmas: propOnRejectPuskesmas,
  onTogglePuskesmasStatus: propOnTogglePuskesmasStatus,
  onTogglePuskesmasStaffStatus: propOnTogglePuskesmasStaffStatus,
  onRefreshData,
}) {
  const { showConfirm, showSuccess, showWarning } = useNotification();
  const isPuskesmas = activeSubmenu === "puskesmas";
  const isStaf = activeSubmenu === "staf";
  const isKelola = activeSubmenu === "kelola";

  // Status tab for verifikasi: 'pending' | 'active' | 'rejected'
  const [statusTab, setStatusTab] = useState("pending");
  // Status tab for kelola akun: 'all' | 'active' | 'inactive'
  const [kelolaTab, setKelolaTab] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [tipeAkunFilter, setTipeAkunFilter] = useState("Semua");

  const [localPuskesmasList, setLocalPuskesmasList] = useState([]);
  const [localStaffList, setLocalStaffList] = useState([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getAllUsers();
        if (res?.data && Array.isArray(res.data)) {
          const pusks = [];
          const staffs = [];
          res.data.forEach((u) => {
            const role = (u.role || "").toLowerCase();
            const initials = (u.nama_lengkap || u.nama || "U")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const mapped = {
              id: u.id,
              namaPendaftar: u.nama_lengkap || u.nama || "",
              namaPetugas: u.nama_lengkap || u.nama || "",
              namaPuskesmas: u.puskesmas?.nama_puskesmas || u.puskesmas || "",
              initials: initials,
              nik: u.nik || "",
              email: u.email || "",
              telepon: u.no_telepon || u.telepon || "",
              bidangJabatan: u.jabatan || u.bidangJabatan || "",
              jabatan: u.jabatan || "",
              tglDaftar: u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "",
              status: u.status === "pending_approval" ? "pending" : u.status || "",
            };
            if (role.includes("puskesmas")) {
              pusks.push(mapped);
            } else if (role.includes("dinkes")) {
              staffs.push(mapped);
            }
          });
          setLocalPuskesmasList(pusks);
          setLocalStaffList(staffs);
        }
      } catch (err) {
        console.info("Load dinkes users error:", err);
      }
    };
    fetchUsers();
  }, []);

  const puskesmasList = propPuskesmasList || localPuskesmasList;
  const staffList = propStaffList || localStaffList;
  const puskesmasStaffList = propPuskesmasStaffList || [];

  const currentVerifList = isPuskesmas ? puskesmasList : staffList;

  // Counts for Verifikasi Tabs
  const pendingCount = currentVerifList.filter((item) => item.status === "pending").length;
  const activeCount = currentVerifList.filter((item) => item.status === "active").length;
  const rejectedCount = currentVerifList.filter((item) => item.status === "rejected" || item.status === "inactive").length;
  const totalCount = pendingCount + activeCount + rejectedCount;

  // Kelola Akun — gabungan Dinkes Staf, Admin Puskesmas, dan Staf Puskesmas
  const verifiedDinkesStaf = staffList.filter((s) => s.status === "active" || s.status === "inactive").map((s) => ({ ...s, tipeAkun: "staf-dinkes", nama: s.namaPetugas, jabatanRender: s.jabatan }));
  const verifiedAdminPuskesmas = puskesmasList
    .filter((p) => p.status === "active" || p.status === "inactive")
    .map((p) => ({ ...p, tipeAkun: "admin-puskesmas", nama: p.namaPendaftar, jabatanRender: "Admin " + p.namaPuskesmas, telepon: p.telepon || "" }));
  const verifiedStafPuskesmas = puskesmasStaffList.filter((s) => s.status === "active" || s.status === "inactive").map((s) => ({ ...s, tipeAkun: "staf-puskesmas", nama: s.nama, jabatanRender: s.bidangJabatan + " (" + s.puskesmas + ")" }));

  const kelolaAkunList = [...verifiedDinkesStaf, ...verifiedAdminPuskesmas, ...verifiedStafPuskesmas];
  const kelolaDinkesTotal = kelolaAkunList.length;
  const kelolaDinkesActive = kelolaAkunList.filter((s) => s.status === "active").length;
  const kelolaDinkesInactive = kelolaAkunList.filter((s) => s.status === "inactive").length;

  // Filtered list for Verifikasi Puskesmas & Verifikasi Staf
  const filteredData = currentVerifList.filter((item) => {
    const matchStatus = item.status === statusTab;
    const matchSearch = isPuskesmas
      ? (item.namaPendaftar && item.namaPendaftar.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.namaPuskesmas && item.namaPuskesmas.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()))
      : (item.namaPetugas && item.namaPetugas.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.bidangJabatan && item.bidangJabatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchKategori = filterKategori === "Semua" || (isPuskesmas ? item.namaPuskesmas.includes(filterKategori) : item.bidangJabatan && item.bidangJabatan.includes(filterKategori));

    return matchStatus && matchSearch && matchKategori;
  });

  // Filtered list for Kelola Akun
  const filteredKelolaDinkes = kelolaAkunList.filter((item) => {
    let matchTab = true;
    if (kelolaTab === "active") matchTab = item.status === "active";
    else if (kelolaTab === "inactive") matchTab = item.status === "inactive";

    const matchSearch =
      (item.nama && item.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.jabatanRender && item.jabatanRender.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.nik && item.nik.includes(searchQuery));

    const matchTipe = tipeAkunFilter === "Semua" || item.tipeAkun === tipeAkunFilter;

    return matchTab && matchSearch && matchTipe;
  });

  // Action Handlers
  const handleApprove = async (id, name) => {
    const targetStaff = localStaffList.find((s) => s.id === id);
    const targetPuskesmas = localPuskesmasList.find((p) => p.id === id);
    const targetEmail = isPuskesmas ? targetPuskesmas?.email : targetStaff?.email;

    const confirmed = await showConfirm({
      title: "Setujui Pendaftaran?",
      message: `Setujui permohonan verifikasi akun ${name}? Notifikasi aktivasi akan dikirimkan ke email ${targetEmail || "pengguna"}.`,
      confirmText: "Setujui & Kirim Notifikasi",
      cancelText: "Batal",
      type: "success",
    });

    if (confirmed) {
      try {
        await userService.verifyUser(id);
      } catch (err) {
        showWarning("Perubahan Gagal", err.message || "Perubahan akun gagal disimpan ke backend.");
        return;
      }

      if (isPuskesmas) {
        if (propOnApprovePuskesmas) {
          propOnApprovePuskesmas(id, name);
        } else {
          const nextList = localPuskesmasList.map((item) => (item.id === id ? { ...item, status: "active" } : item));
          setLocalPuskesmasList(nextList);
        }
      } else {
        if (propOnApproveStaff) {
          propOnApproveStaff(id, name);
        } else {
          const nextList = localStaffList.map((item) => (item.id === id ? { ...item, status: "active" } : item));
          setLocalStaffList(nextList);
        }
      }
      showSuccess("Pendaftaran Disetujui & Email Terkirim", `Pendaftaran akun ${name} berhasil disetujui. Email notifikasi aktivasi telah dikirimkan ke ${targetEmail || "pengguna"}.`);
      onRefreshData?.();
    }
  };

  const handleReject = async (id, name) => {
    const targetStaff = localStaffList.find((s) => s.id === id);
    const targetPuskesmas = localPuskesmasList.find((p) => p.id === id);
    const targetEmail = isPuskesmas ? targetPuskesmas?.email : targetStaff?.email;

    const confirmed = await showConfirm({
      title: "Tolak Pendaftaran?",
      message: `Tolak permohonan pendaftaran akun ${name}? Email pemberitahuan penolakan akan dikirimkan ke ${targetEmail || "pengguna"}.`,
      confirmText: "Tolak Pendaftaran",
      cancelText: "Batal",
      type: "danger",
    });

    if (confirmed) {
      if (isPuskesmas) {
        showWarning("Aksi Tidak Tersedia", "Backend hanya mengizinkan Dinkes Admin menonaktifkan akun Dinkes; akun Puskesmas dikelola melalui alur penggantian/admin yang tersedia.");
        return;
      }
      try {
        await userService.deactivateUser(id);
      } catch (err) {
        showWarning("Perubahan Gagal", err.message || "Perubahan akun gagal disimpan ke backend.");
        return;
      }

      if (isPuskesmas) {
        if (propOnRejectPuskesmas) {
          propOnRejectPuskesmas(id, name);
        } else {
          const nextList = localPuskesmasList.map((item) => (item.id === id ? { ...item, status: "rejected" } : item));
          setLocalPuskesmasList(nextList);
        }
      } else {
        if (propOnRejectStaff) {
          propOnRejectStaff(id, name);
        } else {
          const nextList = localStaffList.map((item) => (item.id === id ? { ...item, status: "rejected" } : item));
          setLocalStaffList(nextList);
        }
      }
      showWarning("Pendaftaran Ditolak", `Pendaftaran akun ${name} telah ditolak. Notifikasi email telah dikirimkan ke ${targetEmail || "pengguna"}.`);
      onRefreshData?.();
    }
  };

  // Toggle Status for Kelola Akun (Nonaktifkan / Aktifkan)
  const handleToggleKelolaStatus = async (item, newStatus) => {
    const labelAction = newStatus === "inactive" ? "Non-Aktifkan" : "Aktifkan";
    const confirmed = await showConfirm({
      title: `${labelAction} Akun?`,
      message: `${labelAction} akun "${item.nama}"?`,
      confirmText: labelAction,
      cancelText: "Batal",
      type: newStatus === "inactive" ? "warning" : "success",
    });

    if (confirmed) {
      if (item.tipeAkun === "admin-puskesmas" || item.tipeAkun === "staf-puskesmas") {
        showWarning("Aksi Tidak Tersedia", "Backend tidak memberikan Dinkes Admin izin mengubah status akun Puskesmas dari endpoint ini.");
        return;
      }
      try {
        await userService.changeUserStatus(item.id, {
          status: newStatus === "inactive" ? "inactive" : "active",
        });
      } catch (err) {
        console.info("Backend change user status notice:", err);
      }

      if (item.tipeAkun === "staf-dinkes") {
        if (propOnToggleStaffStatus) propOnToggleStaffStatus(item.id, newStatus);
        else setLocalStaffList((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
      } else if (item.tipeAkun === "admin-puskesmas") {
        if (propOnTogglePuskesmasStatus) propOnTogglePuskesmasStatus(item.id, newStatus);
        else setLocalPuskesmasList((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
      } else if (item.tipeAkun === "staf-puskesmas") {
        if (propOnTogglePuskesmasStaffStatus) propOnTogglePuskesmasStaffStatus(item.id, newStatus);
      }
      showSuccess("Status Diperbarui", `Akun ${item.nama} kini berstatus ${newStatus === "inactive" ? "Non-Aktif" : "Aktif"}.`);
      onRefreshData?.();
    }
  };

  return (
    <div className="d-flex flex-column gap-3 pb-4">
      {/* Main Container Card */}
      <div className="card border-0 bg-white shadow-xs rounded-4 p-4">
        {/* ========================================================================= */}
        {/* STATUS TAB FILTERS */}
        {/* ========================================================================= */}
        {!isKelola && (
          <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
            <button
              className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold border-0 ${statusTab === "pending" ? "text-white shadow-sm" : "bg-light text-secondary"}`}
              style={{ backgroundColor: statusTab === "pending" ? "#1e3a8a" : undefined }}
              onClick={() => setStatusTab("pending")}
            >
              <Clock size={16} />
              <span>Menunggu Persetujuan</span>
              <span className={`badge rounded-pill ${statusTab === "pending" ? "bg-white text-dark" : "bg-secondary text-white"}`}>{pendingCount}</span>
            </button>

            <button
              className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold border-0 ${statusTab === "active" ? "text-white shadow-sm" : "bg-light text-secondary"}`}
              style={{ backgroundColor: statusTab === "active" ? "#1e3a8a" : undefined }}
              onClick={() => setStatusTab("active")}
            >
              <UserCheck size={16} />
              <span>{isPuskesmas ? "Puskesmas Aktif" : "Staf Aktif"}</span>
              <span className={`badge rounded-pill ${statusTab === "active" ? "bg-white text-dark" : "bg-secondary text-white"}`}>{activeCount}</span>
            </button>

            <button
              className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold border-0 ${statusTab === "rejected" ? "text-white shadow-sm" : "bg-light text-secondary"}`}
              style={{ backgroundColor: statusTab === "rejected" ? "#1e3a8a" : undefined }}
              onClick={() => setStatusTab("rejected")}
            >
              <X size={16} />
              <span>Ditolak / Non-Aktif</span>
              <span className={`badge rounded-pill ${statusTab === "rejected" ? "bg-white text-dark" : "bg-secondary text-white"}`}>{rejectedCount}</span>
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="row g-3 mb-4 align-items-center">
          <div className={isKelola ? "col-12 col-md-6" : "col-12 col-md-10"}>
            <div className="position-relative">
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                className="form-control form-control-custom ps-5 bg-light border-0 rounded-3"
                placeholder={isPuskesmas ? "Cari Nama Pendaftar / Puskesmas / Email..." : isStaf ? "Cari Nama Staf / Bidang / Email..." : "Cari Nama Staf, NIK, Email, atau Jabatan..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: "40px", fontSize: "0.85rem" }}
              />
            </div>
          </div>
          {isKelola && (
            <div className="col-12 col-md-4">
              <select className="form-select form-control-custom bg-light border-0 text-muted fw-semibold rounded-3" value={tipeAkunFilter} onChange={(e) => setTipeAkunFilter(e.target.value)} style={{ height: "40px", fontSize: "0.85rem" }}>
                <option value="Semua">Semua Tipe Akun</option>
                <option value="staf-dinkes">Staf Dinas Kesehatan</option>
                <option value="admin-puskesmas">Admin Puskesmas</option>
                <option value="staf-puskesmas">Staf Puskesmas</option>
              </select>
            </div>
          )}
          <div className="col-12 col-md-2 d-flex gap-2">
            <button className="btn text-white w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold rounded-3 shadow-xs" style={{ backgroundColor: "#1e3a8a", height: "40px", fontSize: "0.85rem" }}>
              <Filter size={16} /> <span>Filter</span>
            </button>
            <button
              className="btn btn-light border p-2 rounded-3 text-secondary d-flex align-items-center justify-content-center"
              title="Reset Filter"
              onClick={() => {
                setSearchQuery("");
                setFilterKategori("Semua");
              }}
              style={{ height: "40px", width: "40px" }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABEL VERIFIKASI (SUBMENU 1 & 2) */}
        {/* ========================================================================= */}
        {!isKelola && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
              <thead className="bg-light text-secondary small text-uppercase" style={{ fontSize: "0.74rem", letterSpacing: "0.04em" }}>
                {isPuskesmas ? (
                  <tr>
                    <th className="ps-3 py-3" style={{ width: "48px" }}>
                      NO
                    </th>
                    <th className="py-3">NAMA PENDAFTAR</th>
                    <th className="py-3">NAMA PUSKESMAS</th>
                    <th className="py-3">EMAIL RESMI</th>
                    <th className="py-3">TANGGAL DAFTAR</th>
                    <th className="py-3 text-center">STATUS</th>
                    <th className="pe-3 py-3 text-end">AKSI</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="ps-3 py-3" style={{ width: "48px" }}>
                      NO
                    </th>
                    <th className="py-3">NAMA STAF</th>
                    <th className="py-3">BIDANG / JABATAN</th>
                    <th className="py-3">EMAIL</th>
                    <th className="py-3">TANGGAL DAFTAR</th>
                    <th className="py-3 text-center">STATUS</th>
                    <th className="pe-3 py-3 text-end">AKSI</th>
                  </tr>
                )}
              </thead>
              <tbody className="border-top-0">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="ps-3 text-muted fw-semibold">{index + 1 < 10 ? `0${index + 1}` : index + 1}</td>

                      {/* Kolom 2: Nama */}
                      <td>
                        <div className="fw-bold text-dark">{isPuskesmas ? item.namaPendaftar : item.namaPetugas}</div>
                      </td>

                      {/* Kolom 3: Puskesmas atau Bidang/Jabatan */}
                      <td>
                        <div className="text-dark fw-medium">{isPuskesmas ? item.namaPuskesmas : item.bidangJabatan}</div>
                      </td>

                      {/* Kolom 4: Email */}
                      <td>
                        <div className="text-muted font-monospace small">{item.email}</div>
                      </td>

                      {/* Kolom 5: Tanggal Daftar */}
                      <td className="text-secondary small">{item.tglDaftar}</td>

                      {/* Kolom 6: Status */}
                      <td className="text-center">
                        {item.status === "pending" && (
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                            <Clock size={12} />
                            <span>Menunggu</span>
                          </span>
                        )}
                        {item.status === "active" && (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>Aktif</span>
                          </span>
                        )}
                        {(item.status === "rejected" || item.status === "inactive") && (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                            <X size={12} />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </td>

                      {/* Kolom 7: Aksi */}
                      <td className="pe-3 text-end">
                        {item.status === "pending" ? (
                          <div className="d-flex align-items-center justify-content-end gap-2">
                            <button
                              className="btn btn-sm text-white fw-semibold d-flex align-items-center gap-1 px-3 py-1.5 rounded-2 shadow-xs"
                              style={{ backgroundColor: "#1e3a8a", fontSize: "0.8rem" }}
                              onClick={() => handleApprove(item.id, isPuskesmas ? item.namaPendaftar : item.namaPetugas)}
                            >
                              <Check size={14} /> <span>Setujui</span>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-2"
                              style={{ fontSize: "0.8rem" }}
                              onClick={() => handleReject(item.id, isPuskesmas ? item.namaPendaftar : item.namaPetugas)}
                            >
                              <X size={14} /> <span>Tolak</span>
                            </button>
                          </div>
                        ) : item.status === "active" ? (
                          <span className="badge bg-light text-success border border-success-subtle rounded-pill px-2.5 py-1">Terverifikasi</span>
                        ) : (
                          <span className="badge bg-light text-danger border border-danger-subtle rounded-pill px-2.5 py-1">Ditolak</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      Tidak ada data pendaftaran yang ditemukan pada status ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TABEL KELOLA AKUN STAF DINKES (SUBMENU 3) */}
        {/* Kolom: NO, NAMA PEGAWAI & NIK, BIDANG / JABATAN, EMAIL & KONTAK, TGL TERDAFTAR, STATUS, AKSI */}
        {/* ========================================================================= */}
        {isKelola && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase">
                <tr>
                  <th className="fw-semibold py-3" style={{ width: "50px" }}>
                    NO
                  </th>
                  <th className="fw-semibold py-3">NAMA PEGAWAI &amp; NIK</th>
                  <th className="fw-semibold py-3">EMAIL &amp; KONTAK</th>
                  <th className="fw-semibold py-3">TANGGAL BERGABUNG</th>
                  <th className="fw-semibold py-3">STATUS AKSES</th>
                  <th className="fw-semibold py-3 text-end" style={{ width: "180px" }}>
                    AKSI PENGELOLAAN
                  </th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filteredKelolaDinkes.length > 0 ? (
                  filteredKelolaDinkes.map((item, index) => (
                    <tr key={item.id} className={item.status === "inactive" ? "bg-light bg-opacity-50" : ""}>
                      <td className="text-muted small fw-bold">{index + 1 < 10 ? `0${index + 1}` : index + 1}</td>

                      {/* Kolom 2: Nama & NIK */}
                      <td>
                        <div className="fw-semibold text-dark">{item.nama}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: "0.75rem" }}>
                          {item.nik || ""}
                        </div>
                        {item.tipeAkun === "staf-dinkes" && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 mt-1" style={{ fontSize: "0.65rem" }}>
                            Staf Dinkes
                          </span>
                        )}
                        {item.tipeAkun === "admin-puskesmas" && (
                          <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-0.5 mt-1" style={{ fontSize: "0.65rem" }}>
                            Admin Puskesmas
                          </span>
                        )}
                        {item.tipeAkun === "staf-puskesmas" && (
                          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-0.5 mt-1" style={{ fontSize: "0.65rem" }}>
                            Staf Puskesmas
                          </span>
                        )}
                      </td>

                      {/* Kolom 3: Email & Telepon */}
                      <td>
                        <div className="text-dark small font-monospace">{item.email}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {item.telepon || ""}
                        </div>
                      </td>

                      {/* Kolom 5: Tgl Daftar */}
                      <td className="small text-muted">{item.tglDaftar}</td>

                      {/* Kolom 6: Status Akses */}
                      <td>
                        {item.status === "active" ? (
                          <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1.5">
                            <span className="rounded-circle bg-success" style={{ width: "6px", height: "6px" }}></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1.5">
                            <span className="rounded-circle bg-danger" style={{ width: "6px", height: "6px" }}></span>
                            Non-Aktif
                          </span>
                        )}
                      </td>

                      {/* Kolom 7: Aksi */}
                      <td className="text-end">
                        {item.status === "active" ? (
                          <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 fw-semibold" onClick={() => handleToggleKelolaStatus(item, "inactive")} title="Nonaktifkan akses akun">
                            <UserX size={14} />
                            <span>Nonaktifkan</span>
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-success text-white d-inline-flex align-items-center gap-1.5 fw-semibold" onClick={() => handleToggleKelolaStatus(item, "active")} title="Aktifkan kembali akses akun">
                            <UserCheck size={14} />
                            <span>Aktifkan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Tidak ditemukan data akun pada filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between pt-3 border-top mt-3 text-muted small gap-3">
          <div>
            <span>Menampilkan </span>
            <strong className="text-dark">{isKelola ? filteredKelolaDinkes.length : filteredData.length}</strong>
            <span>{isKelola ? ` dari total ${kelolaDinkesTotal} akun staf Dinas Kesehatan Kota` : ` dari data ${isPuskesmas ? "Puskesmas" : "Staf Dinas"} terdaftar`}</span>
          </div>

          <div className="d-flex align-items-center gap-1">
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-sm text-white px-3 py-1 rounded-2 fw-bold" style={{ backgroundColor: "#1e3a8a" }}>
              1
            </button>
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
