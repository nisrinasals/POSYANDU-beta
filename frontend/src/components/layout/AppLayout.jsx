import React, { useState } from "react";
import { LayoutDashboard, Calendar, Users, Stethoscope, ClipboardList, User, LogOut, ChevronDown, ChevronRight, HeartHandshake, Menu, Building2, UserCheck, UserCog, Activity, FileSpreadsheet, Shield, ShieldCheck } from "lucide-react";
import { kategoriPemeriksaan } from "../../data/kategoriPemeriksaan";
import { cleanPosyanduName } from "../../utils/dataMappers";
import logoSengkuyung from "../../assets/logo_sengkuyung_katresnan.png";

export default function AppLayout({ user, activeMenu, activeSubmenu, onNavigate, onLogout, globalJadwalList = [], children }) {
  const [pemeriksaanOpen, setPemeriksaanOpen] = useState(true);
  const [verifikasiDinkesOpen, setVerifikasiDinkesOpen] = useState(true);
  const [verifikasiPuskesmasOpen, setVerifikasiPuskesmasOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  const isSA = user?.roleType === "sa";
  const isPuskesmasAdmin = user?.roleType === "puskesmas" || user?.roleType === "puskesmas-admin";
  const isPuskesmasStaf = user?.roleType === "puskesmas-staf" || user?.roleType === "puskesmas-user";
  const isPuskesmas = isPuskesmasAdmin || isPuskesmasStaf;

  const isDinkesAdmin = user?.roleType === "dinkes-admin";
  const isDinkesStaf = user?.roleType === "dinkes-staf" || user?.roleType === "dinkes";
  const isDinkes = (isDinkesAdmin || isDinkesStaf) && !isSA;
  const isKader = !isSA && !isDinkes && !isPuskesmas;

  const logoutTheme = React.useMemo(() => {
    if (isSA) return { bg: "#475569", hover: "#334155" };
    if (isDinkes) return { bg: "#0f2b5c", hover: "#0a1e40" };
    if (isPuskesmas) return { bg: "#3b7d6b", hover: "#2e6354" };
    return { bg: "#2b2e4a", hover: "#1e2034" };
  }, [isSA, isDinkes, isPuskesmas]);

  // Logika Sesi Posyandu Aktif (H s.d H+6 dan status open) untuk Kader
  const sesiAktifInfo = React.useMemo(() => {
    if (!isKader || !Array.isArray(globalJadwalList) || globalJadwalList.length === 0) {
      return { hasActiveSession: true, activeCategories: null, activeSession: null };
    }

    const now = new Date();
    const localMs = now.getTime() - now.getTimezoneOffset() * 60 * 1000;
    const todayStr = new Date(localMs).toISOString().slice(0, 10);
    const todayDate = new Date(`${todayStr}T00:00:00Z`);

    const userPosyanduId = user?.posyandu_id ? Number(user.posyandu_id) : null;
    const cleanUserPos = cleanPosyanduName(user?.posyandu || "").toLowerCase().trim();

    // Cari sesi posyandu milik kader yang statusnya open dan dalam rentang H s.d H+6
    const matchingSessions = globalJadwalList.filter((j) => {
      const jPosId = j?.posyandu_id ? Number(j.posyandu_id) : null;
      const cleanJPos = cleanPosyanduName(j?.posyandu || j?.namaPosyandu || "").toLowerCase().trim();

      const matchPos =
        (userPosyanduId && jPosId && userPosyanduId === jPosId) ||
        (cleanUserPos && cleanJPos && (cleanUserPos === cleanJPos || cleanUserPos.includes(cleanJPos) || cleanJPos.includes(cleanUserPos)));

      if (!matchPos && (userPosyanduId || cleanUserPos)) return false;

      const rawDate = j?.tanggal || (j?._raw?.tanggal_pelaksanaan ? String(j._raw.tanggal_pelaksanaan).slice(0, 10) : "");
      if (!rawDate) return false;

      const sessionDate = new Date(`${rawDate}T00:00:00Z`);
      if (Number.isNaN(sessionDate.getTime())) return false;

      const diffDays = Math.floor((todayDate - sessionDate) / 86400000);
      const isOpen = j?.status === "Terjadwal" || j?.status === "open" || j?._raw?.status === "open";

      return isOpen && diffDays >= 0 && diffDays <= 6;
    });

    if (matchingSessions.length === 0) {
      // Tidak ada sesi buka saat ini dalam rentang H s.d H+6
      return { hasActiveSession: false, activeCategories: [], activeSession: null };
    }

    // Ambil fokusLayanan jika sesi posyandu membatasi kategori sasaran tertentu
    const activeSession = matchingSessions[0];
    const rawFokus = activeSession?.fokusLayanan || activeSession?._raw?.fokus_layanan || [];
    let activeCategories = null;

    if (Array.isArray(rawFokus) && rawFokus.length > 0) {
      activeCategories = rawFokus.map((f) => String(f).toLowerCase().trim());
    }

    return { hasActiveSession: true, activeCategories, activeSession };
  }, [isKader, globalJadwalList, user]);

  const isCategoryAllowed = (catId, catLabel) => {
    if (!isKader) return true;
    if (!sesiAktifInfo.hasActiveSession) return false;
    if (!sesiAktifInfo.activeCategories) return true; // Seluruh kategori ILP terbuka jika tidak dibatasi fokus spesifik

    const lowerId = String(catId).toLowerCase();
    const lowerLabel = String(catLabel).toLowerCase();

    return sesiAktifInfo.activeCategories.some((fokus) => {
      if (lowerId.includes("bumil") && fokus.includes("bumil")) return true;
      if (lowerId.includes("nifas") && (fokus.includes("nifas") || fokus.includes("menyusui"))) return true;
      if ((lowerId.includes("bayi") || lowerId.includes("balita")) && (fokus.includes("bayi") || fokus.includes("balita"))) return true;
      if (lowerId.includes("apras") && (fokus.includes("apras") || fokus.includes("pra sekolah") || fokus.includes("prasekolah"))) return true;
      if (lowerId.includes("usekrem") && (fokus.includes("usekrem") || fokus.includes("remaja") || fokus.includes("sekolah"))) return true;
      if (lowerId.includes("dewasa") && fokus.includes("dewasa")) return true;
      if (lowerId.includes("lansia") && fokus.includes("lansia")) return true;
      return lowerLabel.includes(fokus) || fokus.includes(lowerLabel);
    });
  };

  const handleSubmenuClick = (subId, catLabel) => {
    if (isKader && !isCategoryAllowed(subId, catLabel)) {
      return;
    }
    onNavigate("pemeriksaan", subId);
  };

  const getPageBg = () => {
    if (isSA) return "#f8fafc";
    if (isDinkes) return "#eef2f6";
    if (isPuskesmas) return "#EEF1EF";
    return "#f2f2f2";
  };

  const getBrandBg = () => {
    if (isSA) return "#475569";
    if (isDinkes) return "#0f2b5c";
    if (isPuskesmas) return "#3b7d6b";
    return "#2b2e4a";
  };

  const getRoleBadgeBg = () => {
    if (isSA) return "#64748b";
    if (isDinkes) return "#0f2b5c";
    if (isPuskesmasAdmin) return "#3b7d6b";
    if (isPuskesmasStaf) return "#3b7d6b";
    return "#2b2e4a";
  };

  const getRoleLabel = () => {
    if (isSA) return "Super Admin";
    if (isDinkesAdmin) return "Dinkes (Admin)";
    if (isDinkesStaf) return "Dinkes (Staf)";
    if (isPuskesmasAdmin) return "Puskesmas (Admin)";
    if (isPuskesmasStaf) return "Puskesmas (Staf)";
    return "Kader Posyandu";
  };

  const getRoleSubLabel = () => {
    if (isSA) return "SENGKUYUNG KATRESNAN";
    if (isPuskesmas) return user?.puskesmas || "";
    if (isDinkes) return user?.instansi || user?.puskesmas || "";
    return user?.posyandu || "";
  };

  // Profile picture dari backend disimpan sebagai /uploads/profile/...,
  // sedangkan frontend biasanya berjalan di origin yang berbeda dari API.
  // Normalisasi supaya header selalu memakai foto asli dari backend.
  const getProfilePictureSrc = (value) => {
    if (!value) return null;

    const picture = String(value).trim();
    if (!picture) return null;

    // Data URL / blob / absolute URL dapat langsung dipakai.
    if (/^(data:|blob:|https?:\/\/)/i.test(picture)) return picture;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
    const normalizedPath = picture.startsWith("/") ? picture : `/${picture}`;

    return `${apiOrigin}${normalizedPath}`;
  };

  const profilePictureSrc = getProfilePictureSrc(user?.profile_picture || user?.profilePicture || user?.foto_profil || user?.poto_profile || user?.foto || user?.avatar);

  const roleClass = isDinkes ? "role-dinkes" : isPuskesmas ? "role-puskesmas" : "role-kader";

  return (
    <div className={`d-flex min-vh-100 position-relative ${roleClass}`} style={{ backgroundColor: getPageBg() }}>
      {/* Mobile Toggle Bar */}
      <div className="d-lg-none position-fixed top-0 start-0 end-0 bg-white border-bottom p-3 d-flex align-items-center justify-content-between z-3 shadow-sm">
        <div className="d-flex align-items-center gap-2.5">
          <img src={logoSengkuyung} alt="Logo Sengkuyung Katresnan" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
          <span className="fw-bold text-dark" style={{ fontSize: "0.95rem", letterSpacing: "-0.01em" }}>SENGKUYUNG KATRESNAN</span>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`sidebar-container ${mobileSidebarOpen ? "show" : ""}`}>
        {/* Sidebar Header */}
        <div className="p-3.5 border-bottom d-flex align-items-center gap-3" style={{ padding: "16px 20px" }}>
          <div
            className="rounded-3 p-1.5 bg-white border d-flex align-items-center justify-content-center shadow-xs flex-shrink-0"
            style={{ width: "46px", height: "46px", borderColor: "#e2e8f0" }}
          >
            <img src={logoSengkuyung} alt="Logo Sengkuyung Katresnan" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          </div>
          <div className="overflow-hidden">
            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.92rem", letterSpacing: "-0.01em", lineHeight: 1.25 }}>
              SENGKUYUNG KATRESNAN
            </h6>
            <span
              className="fw-bold d-block text-truncate mt-0.5"
              style={{
                fontSize: "0.72rem",
                color: isSA ? "#475569" : isDinkes ? "#0f2b5c" : isPuskesmas ? "#3b7d6b" : "#64748b",
              }}
            >
              {isSA ? "SUPER ADMIN SISTEM" : isDinkes ? (isDinkesAdmin ? "DINAS KESEHATAN (ADMIN)" : "DINAS KESEHATAN (STAF)") : isPuskesmas ? (isPuskesmasAdmin ? "PUSKESMAS (ADMIN)" : "PUSKESMAS (STAF)") : "Sistem Layanan Kesehatan"}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3 flex-grow-1 overflow-auto">
          <div className="text-uppercase fw-bold text-secondary px-3 mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}>
            MENU UTAMA
          </div>

          <nav className="d-flex flex-column gap-1">
            {isSA ? (
              /* ========================================================================= */
              /* SUPER ADMINISTRATOR ROLE NAVIGATION MENU */
              /* ========================================================================= */
              <>
                {/* 1. Dashboard */}
                <a
                  href="#dashboard"
                  className={`nav-link-custom sa-nav-link ${activeMenu === "dashboard" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("dashboard");
                  }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>

                {/* 2. Manajemen Akun (Super Admin) */}
                <div>
                  <div
                    className={`nav-link-custom sa-nav-link justify-content-between ${activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun" ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      onNavigate("verifikasi-akun", activeSubmenu || "puskesmas");
                      setVerifikasiDinkesOpen(!verifikasiDinkesOpen);
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <UserCog size={18} />
                      <span>Manajemen Akun</span>
                    </div>
                    {verifikasiDinkesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>

                  {verifikasiDinkesOpen && (
                    <div className="d-flex flex-column my-1">
                      {/* Submenu 0: Verifikasi Kader Posyandu */}
                      <a
                        href="#verifikasi-kader"
                        className={`nav-link-custom submenu-link sa-submenu-link ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "kader" ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate("verifikasi-akun", "kader");
                        }}
                      >
                        <Users size={15} className="me-1.5 opacity-75" />
                        <span>Verifikasi Kader</span>
                      </a>

                      {/* Submenu 1: Verifikasi Puskesmas */}
                      <a
                        href="#verifikasi-puskesmas"
                        className={`nav-link-custom submenu-link sa-submenu-link ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && (activeSubmenu === "puskesmas" || !activeSubmenu) ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate("verifikasi-akun", "puskesmas");
                        }}
                      >
                        <Building2 size={15} className="me-1.5 opacity-75" />
                        <span>Verifikasi Puskesmas</span>
                      </a>

                      {/* Submenu 2: Verifikasi Staf Internal Dinkes */}
                      <a
                        href="#verifikasi-staf"
                        className={`nav-link-custom submenu-link sa-submenu-link ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "staf" ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate("verifikasi-akun", "staf");
                        }}
                      >
                        <Shield size={15} className="me-1.5 opacity-75" />
                        <span>Verifikasi Staf Dinkes</span>
                      </a>

                      {/* Submenu 3: Kelola Akun & Role */}
                      <a
                        href="#kelola-akun"
                        className={`nav-link-custom submenu-link sa-submenu-link ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "kelola" ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate("verifikasi-akun", "kelola");
                        }}
                      >
                        <UserCheck size={15} className="me-1.5 opacity-75" />
                        <span>Kelola Akun &amp; Role</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* 3. Data Sasaran */}
                <a
                  href="#data-sasaran"
                  className={`nav-link-custom sa-nav-link ${activeMenu === "data-sasaran" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("data-sasaran");
                  }}
                >
                  <Users size={18} />
                  <span>Data Sasaran</span>
                </a>

                {/* 4. Jadwal Posyandu */}
                <a
                  href="#jadwal-monitoring"
                  className={`nav-link-custom sa-nav-link ${activeMenu === "jadwal-monitoring" || activeMenu === "jadwal" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("jadwal-monitoring");
                  }}
                >
                  <Calendar size={18} />
                  <span>Jadwal Posyandu</span>
                </a>

                {/* 5. Rekapitulasi Pelaporan */}
                <a
                  href="#laporan-ekspor"
                  className={`nav-link-custom sa-nav-link ${activeMenu === "laporan-ekspor" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("laporan-ekspor");
                  }}
                >
                  <FileSpreadsheet size={18} />
                  <span>Rekapitulasi Pelaporan</span>
                </a>

                {/* 6. Profil Super Admin */}
                <a
                  href="#profil-pengguna"
                  className={`nav-link-custom sa-nav-link ${activeMenu === "profil-pengguna" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("profil-pengguna");
                  }}
                >
                  <Building2 size={18} />
                  <span>Profil Super Admin</span>
                </a>
              </>
            ) : isDinkes ? (
              /* ========================================================================= */
              /* DINAS KESEHATAN ROLE NAVIGATION MENU (ADMIN vs STAF) */
              /* ========================================================================= */
              <>
                {/* 1. Dashboard Dinkes */}
                <a
                  href="#dashboard"
                  className={`nav-link-custom ${isSA ? "sa-nav-link" : "dinkes-nav-link"} ${activeMenu === "dashboard" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("dashboard");
                  }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>

                {/* 2. Manajemen Akun (KHUSUS ADMIN DINKES) */}
                {isDinkesAdmin && (
                  <div>
                    <div
                      className={`nav-link-custom ${isSA ? "sa-nav-link" : "dinkes-nav-link"} justify-content-between ${activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun" ? "active" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        onNavigate("verifikasi-akun", activeSubmenu || "puskesmas");
                        setVerifikasiDinkesOpen(!verifikasiDinkesOpen);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <UserCog size={18} />
                        <span>Manajemen Akun</span>
                      </div>
                      {verifikasiDinkesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    {verifikasiDinkesOpen && (
                      <div className="d-flex flex-column my-1">
                        {/* Submenu 0: Verifikasi Kader Posyandu (For SA/Dinkes) */}
                        <a
                          href="#verifikasi-kader"
                          className={`nav-link-custom submenu-link ${isSA ? "sa-submenu-link" : "dinkes-submenu-link"} ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "kader" ? "active" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("verifikasi-akun", "kader");
                          }}
                        >
                          <Users size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Kader</span>
                        </a>

                        {/* Submenu 1: Verifikasi Puskesmas */}
                        <a
                          href="#verifikasi-puskesmas"
                          className={`nav-link-custom submenu-link ${isSA ? "sa-submenu-link" : "dinkes-submenu-link"} ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && (activeSubmenu === "puskesmas" || !activeSubmenu) ? "active" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("verifikasi-akun", "puskesmas");
                          }}
                        >
                          <Building2 size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Puskesmas</span>
                        </a>

                        {/* Submenu 2: Verifikasi Staf Internal Dinkes */}
                        <a
                          href="#verifikasi-staf"
                          className={`nav-link-custom submenu-link ${isSA ? "sa-submenu-link" : "dinkes-submenu-link"} ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "staf" ? "active" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("verifikasi-akun", "staf");
                          }}
                        >
                          <Shield size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Staf Dinkes</span>
                        </a>

                        {/* Submenu 3: Kelola Akun Terdaftar */}
                        <a
                          href="#kelola-akun"
                          className={`nav-link-custom submenu-link ${isSA ? "sa-submenu-link" : "dinkes-submenu-link"} ${(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "kelola" ? "active" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("verifikasi-akun", "kelola");
                          }}
                        >
                          <UserCheck size={15} className="me-1.5 opacity-75" />
                          <span>Kelola Akun</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Data Sasaran Wilayah (KHUSUS ADMIN DINKES - Data By Name) */}
                {isDinkesAdmin && (
                  <a
                    href="#data-sasaran"
                    className={`nav-link-custom ${isSA ? "sa-nav-link" : "dinkes-nav-link"} ${activeMenu === "data-sasaran" ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate("data-sasaran");
                    }}
                  >
                    <Users size={18} />
                    <span>Data Sasaran</span>
                  </a>
                )}

                {/* 4. Jadwal Posyandu (Bisa diakses Admin & Staf) */}
                <a
                  href="#jadwal-monitoring"
                  className={`nav-link-custom ${isSA ? "sa-nav-link" : "dinkes-nav-link"} ${activeMenu === "jadwal-monitoring" || activeMenu === "jadwal" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("jadwal-monitoring");
                  }}
                >
                  <Calendar size={18} />
                  <span>Jadwal Posyandu</span>
                </a>

                {/* 5. Rekapitulasi Wilayah (Bisa diakses Admin & Staf - Staf khusus format Excel) */}
                <a
                  href="#laporan-ekspor"
                  className={`nav-link-custom ${isSA ? "sa-nav-link" : "dinkes-nav-link"} ${activeMenu === "laporan-ekspor" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("laporan-ekspor");
                  }}
                >
                  <FileSpreadsheet size={18} />
                  <span>{isDinkesStaf ? "Rekapitulasi Pelaporan" : "Rekapitulasi Pemeriksaan"}</span>
                </a>

                {/* 6. Profil Pengguna / Instansi Dinkes */}
                <a
                  href="#profil-pengguna"
                  className={`nav-link-custom ${isSA ? "sa-nav-link" : "dinkes-nav-link"} ${activeMenu === "profil-pengguna" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("profil-pengguna");
                  }}
                >
                  <Building2 size={18} />
                  <span>{isDinkesStaf ? "Profil Pengguna" : "Profil Dinas"}</span>
                </a>
              </>
            ) : isPuskesmas ? (
              /* ========================================================================= */
              /* PUSKESMAS ROLE NAVIGATION MENU (ADMIN vs STAF) */
              /* ========================================================================= */
              <>
                {/* 1. Dashboard */}
                <a
                  href="#dashboard"
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === "dashboard" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("dashboard");
                  }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>

                {/* 2. Jadwal Posyandu */}
                <a
                  href="#jadwal"
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === "jadwal" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("jadwal");
                  }}
                >
                  <Calendar size={18} />
                  <span>Jadwal Posyandu</span>
                </a>

                {/* 3. Manajemen Akun (KHUSUS ADMIN PUSKESMAS) */}
                {isPuskesmasAdmin && (
                  <div>
                    <div
                      className={`nav-link-custom puskesmas-nav-link justify-content-between ${activeMenu === "verifikasi-akun" || activeMenu === "verifikasi-kader" || activeMenu === "manajemen-akun" ? "active" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        onNavigate("verifikasi-akun", activeSubmenu || "kader");
                        setVerifikasiPuskesmasOpen(!verifikasiPuskesmasOpen);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <UserCog size={18} />
                        <span>Manajemen Akun</span>
                      </div>
                      {verifikasiPuskesmasOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    {verifikasiPuskesmasOpen && (
                      <div className="d-flex flex-column my-1">
                        {/* Submenu 1: Verifikasi Kader Posyandu */}
                        <a
                          href="#verifikasi-kader"
                          className={`nav-link-custom submenu-link puskesmas-submenu-link ${
                            (activeMenu === "verifikasi-akun" || activeMenu === "verifikasi-kader" || activeMenu === "manajemen-akun") && (activeSubmenu === "kader" || !activeSubmenu) ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("verifikasi-akun", "kader");
                          }}
                        >
                          <HeartHandshake size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Kader</span>
                        </a>

                        {/* Submenu 2: Verifikasi Internal Puskesmas */}
                        <a
                          href="#verifikasi-puskesmas"
                          className={`nav-link-custom submenu-link puskesmas-submenu-link ${
                            (activeMenu === "verifikasi-akun" || activeMenu === "verifikasi-kader" || activeMenu === "manajemen-akun") && activeSubmenu === "staf" ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("verifikasi-akun", "staf");
                          }}
                        >
                          <Building2 size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Puskesmas</span>
                        </a>

                        {/* Submenu 3: Kelola Akun Terdaftar */}
                        <a
                          href="#kelola-akun"
                          className={`nav-link-custom submenu-link puskesmas-submenu-link ${
                            (activeMenu === "verifikasi-akun" || activeMenu === "verifikasi-kader" || activeMenu === "manajemen-akun") && activeSubmenu === "kelola" ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("verifikasi-akun", "kelola");
                          }}
                        >
                          <UserCheck size={15} className="me-1.5 opacity-75" />
                          <span>Kelola Akun</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Data Sasaran (KHUSUS ADMIN PUSKESMAS - Data By Name) */}
                {isPuskesmasAdmin && (
                  <a
                    href="#data-sasaran"
                    className={`nav-link-custom puskesmas-nav-link ${activeMenu === "data-sasaran" ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate("data-sasaran");
                    }}
                  >
                    <Users size={18} />
                    <span>Data Sasaran</span>
                  </a>
                )}

                {/* 5. Pemantauan Rujukan (KHUSUS ADMIN PUSKESMAS) */}
                {isPuskesmasAdmin && (
                  <a
                    href="#pemantauan-rujukan"
                    className={`nav-link-custom puskesmas-nav-link ${activeMenu === "pemantauan-rujukan" ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate("pemantauan-rujukan");
                    }}
                  >
                    <Activity size={18} />
                    <span>Pemantauan Rujukan</span>
                  </a>
                )}

                {/* 6. Rekapitulasi Pemeriksaan (Bisa diakses Admin & Staf - Staf khusus format Excel) */}
                <a
                  href="#laporan-ekspor"
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === "laporan-ekspor" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("laporan-ekspor");
                  }}
                >
                  <FileSpreadsheet size={18} />
                  <span>Rekapitulasi Pemeriksaan</span>
                </a>

                {/* 7. Profil Instansi / Pengguna */}
                <a
                  href="#profil-instansi"
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === "profil-instansi" || activeMenu === "profil-pengguna" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(isPuskesmasStaf ? "profil-pengguna" : "profil-instansi");
                  }}
                >
                  <Building2 size={18} />
                  <span>{isPuskesmasStaf ? "Profil Pengguna" : "Profil Instansi"}</span>
                </a>
              </>
            ) : (
              /* ========================================================================= */
              /* KADER ROLE NAVIGATION MENU */
              /* ========================================================================= */
              <>
                <a
                  href="#dashboard"
                  className={`nav-link-custom ${activeMenu === "dashboard" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("dashboard");
                  }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>

                <a
                  href="#jadwal"
                  className={`nav-link-custom ${activeMenu === "jadwal" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("jadwal");
                  }}
                >
                  <Calendar size={18} />
                  <span>Jadwal Posyandu</span>
                </a>

                <a
                  href="#data-sasaran"
                  className={`nav-link-custom ${activeMenu === "data-sasaran" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("data-sasaran");
                  }}
                >
                  <Users size={18} />
                  <span>Data Sasaran</span>
                </a>

                <div>
                  <div
                    className={`nav-link-custom justify-content-between ${activeMenu === "pemeriksaan" ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      onNavigate("pemeriksaan");
                      setPemeriksaanOpen(!pemeriksaanOpen);
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Stethoscope size={18} />
                      <span>Pemeriksaan</span>
                    </div>
                    {pemeriksaanOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>

                  {pemeriksaanOpen && (
                    <div className="d-flex flex-column my-1">
                      {kategoriPemeriksaan.map((cat) => {
                        const allowed = isCategoryAllowed(cat.id, cat.label);
                        const isActive = activeMenu === "pemeriksaan" && activeSubmenu === cat.id;

                        return (
                          <a
                            key={cat.id}
                            href={`#pemeriksaan-${cat.id}`}
                            className={`nav-link-custom submenu-link d-flex align-items-center justify-content-between ${isActive ? "active" : ""} ${!allowed ? "opacity-50 text-muted" : ""}`}
                            style={{
                              cursor: allowed ? "pointer" : "not-allowed",
                            }}
                            title={allowed ? cat.desc : "Bukan jadwal pelayanan Posyandu untuk kategori ini"}
                            onClick={(e) => {
                              e.preventDefault();
                              if (allowed) {
                                handleSubmenuClick(cat.id, cat.label);
                              }
                            }}
                          >
                            <span>{cat.label}</span>
                            {!allowed && (
                              <span
                                className="badge bg-secondary-subtle text-secondary border px-1.5 py-0.5 rounded-pill"
                                style={{ fontSize: "0.65rem", transform: "scale(0.88)" }}
                              >
                                Tutup
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                <a
                  href="#rekap-pemeriksaan"
                  className={`nav-link-custom ${activeMenu === "rekap-pemeriksaan" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("rekap-pemeriksaan");
                  }}
                >
                  <ClipboardList size={18} />
                  <span>Rekap Pemeriksaan</span>
                </a>

                <a
                  href="#riwayat-rujukan"
                  className={`nav-link-custom ${activeMenu === "riwayat-rujukan" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("riwayat-rujukan");
                  }}
                >
                  <Activity size={18} />
                  <span>Riwayat Rujukan</span>
                </a>

                <a
                  href="#profil-pengguna"
                  className={`nav-link-custom ${activeMenu === "profil-pengguna" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("profil-pengguna");
                  }}
                >
                  <User size={18} />
                  <span>Profil Pengguna</span>
                </a>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer / Log Out */}
        <div className="p-3 border-top">
          <button
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white border-0 transition-all rounded-3 fw-semibold shadow-xs"
            style={{
              backgroundColor: isLogoutHovered ? logoutTheme.hover : logoutTheme.bg,
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-wrapper flex-grow-1 mt-5 mt-lg-0">
        <header className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 mb-4 border-bottom gap-3" style={{ minHeight: "56px" }}>
          <div className="d-flex flex-column justify-content-center">
            <h2 className="page-title fw-bold mb-1 text-dark" style={{ fontSize: "1.45rem", letterSpacing: "-0.02em", lineHeight: "1.25" }}>
              {isSA ? (
                <>
                  {activeMenu === "dashboard" && "Dashboard Super Administrator"}
                  {(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") &&
                    (activeSubmenu === "staf"
                      ? "Manajemen Staf Dinkes"
                      : activeSubmenu === "kelola"
                      ? "Kelola Akun Dinkes & Puskesmas"
                      : activeSubmenu === "kader"
                      ? "Verifikasi Akun Kader Posyandu"
                      : "Manajemen Akun Puskesmas")}
                  {(activeMenu === "jadwal-monitoring" || activeMenu === "jadwal") && "Monitoring Posyandu Sistem"}
                  {activeMenu === "data-sasaran" && "Master Data Sasaran Terpadu"}
                  {activeMenu === "laporan-ekspor" && "Rekapitulasi Sistem"}
                  {activeMenu === "profil-pengguna" && "Profil Super Admin"}
                </>
              ) : isDinkes ? (
                <>
                  {activeMenu === "dashboard" && (isDinkesStaf ? "Dashboard Staf Dinas Kesehatan" : "Dashboard Dinas Kesehatan")}
                  {(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") &&
                    (activeSubmenu === "staf"
                      ? "Verifikasi Staf Dinas Kesehatan"
                      : activeSubmenu === "kelola"
                      ? "Kelola Akun Faskes & Staf Terdaftar"
                      : activeSubmenu === "kader"
                      ? "Verifikasi Akun Kader Posyandu"
                      : "Verifikasi Akun Puskesmas")}
                  {(activeMenu === "jadwal-monitoring" || activeMenu === "jadwal") && "Jadwal Posyandu Se-Kota"}
                  {activeMenu === "data-sasaran" && "Data Sasaran Wilayah Kota"}
                  {activeMenu === "laporan-ekspor" && (isDinkesStaf ? "Rekapitulasi Pelaporan" : "Rekapitulasi Pemeriksaan")}
                  {activeMenu === "profil-pengguna" && (isDinkesStaf ? "Profil Pengguna Staf" : "Profil Pengguna")}
                </>
              ) : isPuskesmas ? (
                <>
                  {activeMenu === "dashboard" && (isPuskesmasStaf ? "Dashboard Staf Puskesmas" : "Dashboard Pembina Wilayah")}
                  {activeMenu === "jadwal" && "Jadwal Posyandu Wilayah"}
                  {(activeMenu === "verifikasi-akun" || activeMenu === "verifikasi-kader" || activeMenu === "manajemen-akun") &&
                    (activeSubmenu === "staf" ? "Verifikasi Staf Internal Puskesmas" : activeSubmenu === "kelola" ? "Kelola Akun Kader & Tenaga Kesehatan" : "Verifikasi Akun Kader Posyandu")}
                  {activeMenu === "data-sasaran" && "Data Sasaran"}
                  {activeMenu === "pemantauan-rujukan" && "Pemantauan Rujukan Medis"}
                  {activeMenu === "laporan-ekspor" && "Rekapitulasi Pemeriksaan"}
                  {(activeMenu === "profil-instansi" || activeMenu === "profil-pengguna") && (isPuskesmasStaf ? "Profil Pengguna Staf" : "Profil Instansi Puskesmas")}
                </>
              ) : (
                <>
                  {activeMenu === "dashboard" && "Dashboard Layanan Posyandu"}
                  {activeMenu === "jadwal" && "Jadwal Posyandu"}
                  {activeMenu === "data-sasaran" && "Data Sasaran"}
                  {activeMenu === "pemeriksaan" && "Layanan Pemeriksaan Kesehatan"}
                  {activeMenu === "rekap-pemeriksaan" && "Rekapitulasi Pemeriksaan"}
                  {activeMenu === "riwayat-rujukan" && "Daftar Riwayat Rujukan Posyandu"}
                  {activeMenu === "profil-pengguna" && "Profil Pengguna"}
                </>
              )}
            </h2>
            <p className="text-muted small mb-0" style={{ fontSize: "0.8rem", lineHeight: "1.3" }}>
              {isSA ? (
                <>
                  {activeMenu === "dashboard" && "Pusat kendali dan manajemen master data seluruh sistem layanan terpadu"}
                  {(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && "Akses penuh memanipulasi status, aktivasi, dan password seluruh pengguna terdaftar"}
                  {(activeMenu === "jadwal-monitoring" || activeMenu === "jadwal") && "Log monitoring semua jadwal yang berjalan di sistem"}
                  {activeMenu === "data-sasaran" && "Pengelolaan master data dan agregasi demografi sasaran"}
                  {activeMenu === "laporan-ekspor" && "Ekspor data mentah dan laporan sistem untuk audit"}
                  {activeMenu === "profil-pengguna" && "Pengaturan kredensial keamanan tingkat lanjut"}
                </>
              ) : isDinkes ? (
                <>
                  {activeMenu === "dashboard" && "Pemantauan indikator kesehatan, status pelaporan Puskesmas, dan kesiapan fasilitas kesehatan tingkat Kota"}
                  {(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") &&
                    (activeSubmenu === "staf"
                      ? "Kelola persetujuan dan otorisasi pendaftaran staf internal."
                      : activeSubmenu === "kelola"
                        ? "Manajemen status aktif, nonaktif, dan hak akses seluruh akun Puskesmas dan Staf Dinkes terdaftar."
                        : "Kelola persetujuan pendaftaran akun Puskesmas.")}
                  {(activeMenu === "jadwal-monitoring" || activeMenu === "jadwal") && "Monitoring agenda buka dan operasional Posyandu se-Kota"}
                  {activeMenu === "data-sasaran" && "Monitoring cakupan data sasaran seluruh siklus hidup lintas Puskesmas dan Posyandu se-Kota"}
                  {activeMenu === "laporan-ekspor" &&
                    (isDinkesStaf
                      ? "Rekapitulasi formulir register bulanan dan unduh berkas agregat Excel (.xlsx)"
                      : "Daftar sasaran yang sudah diperiksa, filter Posyandu, dan detail hasil pemeriksaan se-Kota")}
                  {activeMenu === "profil-pengguna" && "Informasi akun dan manajemen profil pengguna"}
                </>
              ) : isPuskesmas ? (
                <>
                  {activeMenu === "dashboard" && "Ringkasan operasional fasyankes, tren pemeriksaan dan kunjungan Posyandu."}
                  {activeMenu === "jadwal" && "Jadwal operasional Posyandu di Puskesmas."}
                  {(activeMenu === "verifikasi-akun" || activeMenu === "verifikasi-kader" || activeMenu === "manajemen-akun") &&
                    (activeSubmenu === "staf"
                      ? "Kelola persetujuan dan otorisasi pendaftaran akun tenaga kesehatan dan staf administrasi internal Puskesmas."
                      : activeSubmenu === "kelola"
                        ? "Manajemen status aktif, nonaktif, dan penugasan seluruh Kader Posyandu dan Staf Puskesmas terdaftar."
                        : "Kelola persetujuan dan otorisasi pendaftaran akun kader posyandu dari berbagai RW di Puskesmas.")}
                  {activeMenu === "data-sasaran" && "Kelola dan pantau data sasaran fasyankes pembina wilayah dari seluruh Posyandu"}
                  {activeMenu === "pemantauan-rujukan" && "Monitoring kasus rujukan berisiko dari Posyandu yang membutuhkan penanganan medis di Puskesmas"}
                  {activeMenu === "laporan-ekspor" && "Rekapitulasi formulir register bulanan dan unduh laporan berkas Excel (.xlsx)"}
                  {(activeMenu === "profil-instansi" || activeMenu === "profil-pengguna") && "Informasi identitas instansi fasyankes dan manajemen akun"}
                </>
              ) : (
                <>
                  {activeMenu === "dashboard" && "Ringkasan pelayanan Posyandu."}
                  {activeMenu === "jadwal" && "Agenda dan waktu pelaksanaan Posyandu."}
                  {activeMenu === "data-sasaran" && "Data sasaran seluruh siklus hidup posyandu."}
                  {activeMenu === "pemeriksaan" && "Input dan monitoring berkala tumbuh kembang serta kesehatan."}
                  {activeMenu === "rekap-pemeriksaan" && "Laporan rekap bulanan pemeriksaan kesehatan posyandu."}
                  {activeMenu === "riwayat-rujukan" && "Daftar sasaran warga yang dirujuk ke Puskesmas / Pustu berdasarkan hasil pemeriksaan posyandu."}
                  {activeMenu === "profil-pengguna" && "Kelola informasi data pribadi dan keamanan akun Anda."}
                </>
              )}
            </p>
          </div>

          {/* User Profile Badge (Top Right - Elongated & Elegant Capsule) */}
          <div
            className="d-flex align-items-center bg-white rounded-pill border flex-shrink-0 align-self-start align-self-md-center user-select-none"
            style={{
              padding: "6px 18px 6px 12px",
              minWidth: "215px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: isProfileHovered ? "#f8fafc" : "#ffffff",
              borderColor: isProfileHovered ? "#cbd5e1" : "#e2e8f0",
              boxShadow: isProfileHovered ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
            onClick={() => onNavigate(isDinkes ? "profil-pengguna" : isPuskesmasAdmin ? "profil-instansi" : "profil-pengguna")}
            title="Buka Pengaturan Profil"
          >
            <div
              className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: isSA ? "#475569" : isDinkes ? "#0f2b5c" : isPuskesmas ? "#3b7d6b" : "#2b2e4a",
                color: "#ffffff",
                fontSize: "0.85rem",
                border: "2px solid #ffffff",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              {profilePictureSrc ? (
                <img
                  key={`avatar_${user?.id || 'none'}_${profilePictureSrc}`}
                  src={profilePictureSrc}
                  alt={user?.nama || "User"}
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : isDinkesAdmin ? (
                <Building2 size={17} />
              ) : (
                <User size={17} />
              )}
            </div>
            <div className="d-flex flex-column justify-content-center text-start" style={{ marginLeft: "12px", minWidth: "0", flex: 1 }}>
              <div
                className="fw-bold text-dark text-capitalize text-truncate"
                style={{ fontSize: "0.84rem", lineHeight: "1.25", maxWidth: "135px" }}
                title={user?.nama || "Pengguna"}
              >
                {user?.nama || "Pengguna"}
              </div>
              <span
                className="text-muted text-truncate"
                style={{ fontSize: "0.72rem", lineHeight: "1.2", marginTop: "1px", maxWidth: "135px" }}
                title={getRoleLabel()}
              >
                {getRoleLabel()}
              </span>
            </div>
            <ChevronDown size={14} className="text-muted opacity-50 ms-2 flex-shrink-0" />
          </div>
        </header>

        {/* Page Content Body */}
        <div>{children}</div>
      </main>
    </div>
  );
}
