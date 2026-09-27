import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar,
  Users, 
  Stethoscope, 
  ClipboardList, 
  User, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  HeartHandshake,
  Menu,
  Building2,
  RefreshCw,
  UserCheck,
  UserCog,
  Activity,
  FileSpreadsheet,
  Shield
} from 'lucide-react';
import { kategoriPemeriksaan } from '../../data/mockData';

export default function AppLayout({ 
  user, 
  activeMenu, 
  activeSubmenu, 
  onNavigate, 
  onLogout, 
  onToggleRole,
  children 
}) {
  const [pemeriksaanOpen, setPemeriksaanOpen] = useState(true);
  const [verifikasiDinkesOpen, setVerifikasiDinkesOpen] = useState(true);
  const [verifikasiPuskesmasOpen, setVerifikasiPuskesmasOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPuskesmasAdmin = user?.roleType === 'puskesmas' || user?.roleType === 'puskesmas-admin';
  const isPuskesmasStaf = user?.roleType === 'puskesmas-staf' || user?.roleType === 'puskesmas-user';
  const isPuskesmas = isPuskesmasAdmin || isPuskesmasStaf;

  const isDinkesAdmin = user?.roleType === 'dinkes-admin';
  const isDinkesStaf = user?.roleType === 'dinkes-staf' || user?.roleType === 'dinkes';
  const isDinkes = isDinkesAdmin || isDinkesStaf;

  const handleSubmenuClick = (subId) => {
    onNavigate('pemeriksaan', subId);
  };

  const getPageBg = () => {
    if (isDinkes) return '#eef2f6';
    if (isPuskesmas) return '#EEF1EF';
    return '#f2f2f2';
  };

  const getBrandBg = () => {
    if (isDinkes) return '#1e3a8a';
    if (isPuskesmas) return '#2E4E52';
    return '#2b2e4a';
  };

  const getRoleBadgeBg = () => {
    if (isDinkesAdmin) return '#1e3a8a';
    if (isDinkesStaf) return '#0284c7';
    if (isPuskesmasAdmin) return '#2E4E52';
    if (isPuskesmasStaf) return '#0D9488';
    return '#F25B8E';
  };

  const getRoleLabel = () => {
    if (isDinkesAdmin) return 'Dinkes (Admin)';
    if (isDinkesStaf) return 'Dinkes (Staf)';
    if (isPuskesmasAdmin) return 'Puskesmas (Admin)';
    if (isPuskesmasStaf) return 'Puskesmas (Staf)';
    return 'Kader';
  };

  const getRoleSubLabel = () => {
    if (isDinkesAdmin) return 'Dinas Kesehatan Kota';
    if (isDinkesStaf) return 'Staf Dinkes Kota';
    if (isPuskesmasAdmin) return 'Puskesmas Sukamaju';
    if (isPuskesmasStaf) return 'Staf Puskesmas Sukamaju';
    return 'Posyandu Melati';
  };

  const roleClass = isDinkes ? 'role-dinkes' : isPuskesmas ? 'role-puskesmas' : 'role-kader';

  return (
    <div 
      className={`d-flex min-vh-100 position-relative ${roleClass}`}
      style={{ backgroundColor: getPageBg() }}
    >
      {/* Mobile Toggle Bar */}
      <div className="d-lg-none position-fixed top-0 start-0 end-0 bg-white border-bottom p-3 d-flex align-items-center justify-content-between z-3 shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <div 
            className="p-2 text-white rounded-3 d-flex align-items-center justify-content-center" 
            style={{ backgroundColor: getBrandBg() }}
          >
            {isDinkes ? <Building2 size={20} /> : (isPuskesmas ? <Shield size={20} /> : <HeartHandshake size={20} />)}
          </div>
          <span className="fw-bold text-dark">Posyandu Beta</span>
        </div>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`sidebar-container ${mobileSidebarOpen ? 'show' : ''}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-bottom d-flex align-items-center gap-3">
          <div 
            className="rounded-3 p-2 text-white d-flex align-items-center justify-content-center shadow-sm" 
            style={{ backgroundColor: getBrandBg() }}
          >
            {isDinkes ? <Building2 size={24} /> : (isPuskesmas ? <Shield size={24} /> : <HeartHandshake size={24} />)}
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">Posyandu Beta</h6>
            <span 
              className="fw-bold" 
              style={{ 
                fontSize: '0.75rem', 
                color: isDinkes ? '#1e3a8a' : (isPuskesmas ? '#428A75' : '#64748b') 
              }}
            >
              {isDinkes 
                ? (isDinkesAdmin ? 'DINAS KESEHATAN (ADMIN)' : 'DINAS KESEHATAN (STAF)') 
                : (isPuskesmas 
                  ? (isPuskesmasAdmin ? 'PUSKESMAS (ADMIN)' : 'PUSKESMAS (STAF)') 
                  : 'Sistem Layanan Kesehatan')}
            </span>
          </div>
        </div>

        {/* Role Indicator Banner & Switch Button */}
        <div className="px-3 pt-3">
          <div 
            className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between"
            style={{ 
              fontSize: '0.8rem', 
              backgroundColor: isDinkes 
                ? 'rgba(219, 234, 254, 0.5)' 
                : (isPuskesmas ? 'rgba(220, 252, 231, 0.5)' : '#f8fafc') 
            }}
          >
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <span 
                className="badge text-white"
                style={{ backgroundColor: getRoleBadgeBg() }}
              >
                {getRoleLabel()}
              </span>
              <span className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                {getRoleSubLabel()}
              </span>
            </div>
            <button 
              className="btn btn-xs border p-1 rounded-2 fw-bold"
              title="Ganti Role View (Kader ⇄ Puskesmas Admin ⇄ Puskesmas Staf ⇄ Dinkes Admin ⇄ Dinkes Staf)"
              onClick={onToggleRole}
              style={{ 
                fontSize: '0.7rem', 
                backgroundColor: isDinkes ? '#0284c7' : (isPuskesmas ? '#FE6D01' : '#2b2e4a'), 
                color: '#ffffff',
                borderColor: isDinkes ? '#0284c7' : (isPuskesmas ? '#FE6D01' : '#2b2e4a')
              }}
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3 flex-grow-1 overflow-auto">
          <div className="text-uppercase fw-bold text-secondary px-3 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
            MENU UTAMA
          </div>

          <nav className="d-flex flex-column gap-1">
            {isDinkes ? (
              /* ========================================================================= */
              /* DINAS KESEHATAN ROLE NAVIGATION MENU (ADMIN vs STAF) */
              /* ========================================================================= */
              <>
                {/* 1. Dashboard Dinkes */}
                <a 
                  href="#dashboard" 
                  className={`nav-link-custom dinkes-nav-link ${activeMenu === 'dashboard' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>

                {/* 2. Manajemen Akun (KHUSUS ADMIN DINKES) */}
                {isDinkesAdmin && (
                  <div>
                    <div 
                      className={`nav-link-custom dinkes-nav-link justify-content-between ${activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun' ? 'active' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        onNavigate('verifikasi-akun', activeSubmenu || 'puskesmas');
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
                        {/* Submenu 1: Verifikasi Puskesmas */}
                        <a
                          href="#verifikasi-puskesmas"
                          className={`nav-link-custom submenu-link dinkes-submenu-link ${
                            (activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun') && (activeSubmenu === 'puskesmas' || !activeSubmenu) ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate('verifikasi-akun', 'puskesmas');
                          }}
                        >
                          <Building2 size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Puskesmas</span>
                        </a>

                        {/* Submenu 2: Verifikasi Staf Internal Dinkes */}
                        <a
                          href="#verifikasi-staf"
                          className={`nav-link-custom submenu-link dinkes-submenu-link ${
                            (activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun') && activeSubmenu === 'staf' ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate('verifikasi-akun', 'staf');
                          }}
                        >
                          <Shield size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Staf Dinkes</span>
                        </a>

                        {/* Submenu 3: Kelola Akun Terdaftar */}
                        <a
                          href="#kelola-akun"
                          className={`nav-link-custom submenu-link dinkes-submenu-link ${
                            (activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun') && activeSubmenu === 'kelola' ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate('verifikasi-akun', 'kelola');
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
                    className={`nav-link-custom dinkes-nav-link ${activeMenu === 'data-sasaran' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('data-sasaran'); }}
                  >
                    <Users size={18} />
                    <span>Data Sasaran</span>
                  </a>
                )}

                {/* 4. Jadwal Posyandu (Bisa diakses Admin & Staf) */}
                <a 
                  href="#jadwal-monitoring" 
                  className={`nav-link-custom dinkes-nav-link ${activeMenu === 'jadwal-monitoring' || activeMenu === 'jadwal' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('jadwal-monitoring'); }}
                >
                  <Calendar size={18} />
                  <span>Jadwal Posyandu</span>
                </a>

                {/* 5. Rekapitulasi Wilayah (Bisa diakses Admin & Staf - Staf khusus format Excel) */}
                <a 
                  href="#laporan-ekspor" 
                  className={`nav-link-custom dinkes-nav-link ${activeMenu === 'laporan-ekspor' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('laporan-ekspor'); }}
                >
                  <FileSpreadsheet size={18} />
                  <span>{isDinkesStaf ? 'Rekapitulasi Pelaporan' : 'Rekapitulasi Wilayah'}</span>
                </a>

                {/* 6. Profil Pengguna / Instansi Dinkes */}
                <a 
                  href="#profil-pengguna" 
                  className={`nav-link-custom dinkes-nav-link ${activeMenu === 'profil-pengguna' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('profil-pengguna'); }}
                >
                  <Building2 size={18} />
                  <span>{isDinkesStaf ? 'Profil Pengguna' : 'Profil Dinas'}</span>
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
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === 'dashboard' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>

                {/* 2. Jadwal Posyandu */}
                <a 
                  href="#jadwal" 
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === 'jadwal' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('jadwal'); }}
                >
                  <Calendar size={18} />
                  <span>Jadwal Posyandu</span>
                </a>

                {/* 3. Manajemen Akun (KHUSUS ADMIN PUSKESMAS) */}
                {isPuskesmasAdmin && (
                  <div>
                    <div 
                      className={`nav-link-custom puskesmas-nav-link justify-content-between ${activeMenu === 'verifikasi-akun' || activeMenu === 'verifikasi-kader' || activeMenu === 'manajemen-akun' ? 'active' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        onNavigate('verifikasi-akun', activeSubmenu || 'kader');
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
                            (activeMenu === 'verifikasi-akun' || activeMenu === 'verifikasi-kader' || activeMenu === 'manajemen-akun') && (activeSubmenu === 'kader' || !activeSubmenu) ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate('verifikasi-akun', 'kader');
                          }}
                        >
                          <HeartHandshake size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Kader</span>
                        </a>

                        {/* Submenu 2: Verifikasi Internal Puskesmas */}
                        <a
                          href="#verifikasi-puskesmas"
                          className={`nav-link-custom submenu-link puskesmas-submenu-link ${
                            (activeMenu === 'verifikasi-akun' || activeMenu === 'verifikasi-kader' || activeMenu === 'manajemen-akun') && activeSubmenu === 'staf' ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate('verifikasi-akun', 'staf');
                          }}
                        >
                          <Building2 size={15} className="me-1.5 opacity-75" />
                          <span>Verifikasi Puskesmas</span>
                        </a>

                        {/* Submenu 3: Kelola Akun Terdaftar */}
                        <a
                          href="#kelola-akun"
                          className={`nav-link-custom submenu-link puskesmas-submenu-link ${
                            (activeMenu === 'verifikasi-akun' || activeMenu === 'verifikasi-kader' || activeMenu === 'manajemen-akun') && activeSubmenu === 'kelola' ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate('verifikasi-akun', 'kelola');
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
                    className={`nav-link-custom puskesmas-nav-link ${activeMenu === 'data-sasaran' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('data-sasaran'); }}
                  >
                    <Users size={18} />
                    <span>Data Sasaran</span>
                  </a>
                )}

                {/* 5. Pemantauan Rujukan (KHUSUS ADMIN PUSKESMAS) */}
                {isPuskesmasAdmin && (
                  <a 
                    href="#pemantauan-rujukan" 
                    className={`nav-link-custom puskesmas-nav-link ${activeMenu === 'pemantauan-rujukan' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('pemantauan-rujukan'); }}
                  >
                    <Activity size={18} />
                    <span>Pemantauan Rujukan</span>
                  </a>
                )}

                {/* 6. Rekapitulasi Pemeriksaan (Bisa diakses Admin & Staf - Staf khusus format Excel) */}
                <a 
                  href="#laporan-ekspor" 
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === 'laporan-ekspor' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('laporan-ekspor'); }}
                >
                  <FileSpreadsheet size={18} />
                  <span>Rekapitulasi Pemeriksaan</span>
                </a>

                {/* 7. Profil Instansi / Pengguna */}
                <a 
                  href="#profil-instansi" 
                  className={`nav-link-custom puskesmas-nav-link ${activeMenu === 'profil-instansi' || activeMenu === 'profil-pengguna' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(isPuskesmasStaf ? 'profil-pengguna' : 'profil-instansi'); }}
                >
                  <Building2 size={18} />
                  <span>{isPuskesmasStaf ? 'Profil Pengguna' : 'Profil Instansi'}</span>
                </a>
              </>
            ) : (
              /* ========================================================================= */
              /* KADER ROLE NAVIGATION MENU */
              /* ========================================================================= */
              <>
                <a 
                  href="#dashboard" 
                  className={`nav-link-custom ${activeMenu === 'dashboard' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>

                <a 
                  href="#jadwal" 
                  className={`nav-link-custom ${activeMenu === 'jadwal' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('jadwal'); }}
                >
                  <Calendar size={18} />
                  <span>Jadwal Posyandu</span>
                </a>

                <a 
                  href="#data-sasaran" 
                  className={`nav-link-custom ${activeMenu === 'data-sasaran' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('data-sasaran'); }}
                >
                  <Users size={18} />
                  <span>Data Sasaran</span>
                </a>

                <div>
                  <div 
                    className={`nav-link-custom justify-content-between ${activeMenu === 'pemeriksaan' ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onNavigate('pemeriksaan');
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
                      {kategoriPemeriksaan.map((cat) => (
                        <a
                          key={cat.id}
                          href={`#pemeriksaan-${cat.id}`}
                          className={`nav-link-custom submenu-link ${activeMenu === 'pemeriksaan' && activeSubmenu === cat.id ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSubmenuClick(cat.id);
                          }}
                        >
                          <span>{cat.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <a 
                  href="#rekap-pemeriksaan" 
                  className={`nav-link-custom ${activeMenu === 'rekap-pemeriksaan' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('rekap-pemeriksaan'); }}
                >
                  <ClipboardList size={18} />
                  <span>Rekap Pemeriksaan</span>
                </a>

                <a 
                  href="#riwayat-rujukan" 
                  className={`nav-link-custom ${activeMenu === 'riwayat-rujukan' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('riwayat-rujukan'); }}
                >
                  <Activity size={18} />
                  <span>Riwayat Rujukan</span>
                </a>

                <a 
                  href="#profil-pengguna" 
                  className={`nav-link-custom ${activeMenu === 'profil-pengguna' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('profil-pengguna'); }}
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
            className="btn btn-dark-custom w-100 d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-wrapper flex-grow-1 mt-5 mt-lg-0">
        <header className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 mb-4 border-bottom gap-3" style={{ minHeight: '56px' }}>
          <div className="d-flex flex-column justify-content-center">
            <h2 className="page-title fw-bold mb-1 text-dark" style={{ fontSize: '1.45rem', letterSpacing: '-0.02em', lineHeight: '1.25' }}>
              {isDinkes ? (
                <>
                  {activeMenu === 'dashboard' && (isDinkesStaf ? 'Dashboard Staf Dinas Kesehatan' : 'Dashboard Dinas Kesehatan')}
                  {(activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun') && (
                    activeSubmenu === 'staf' 
                      ? 'Verifikasi Staf Dinas Kesehatan' 
                      : activeSubmenu === 'kelola'
                        ? 'Kelola Akun Faskes & Staf Terdaftar'
                        : 'Verifikasi Akun Puskesmas'
                  )}
                  {(activeMenu === 'jadwal-monitoring' || activeMenu === 'jadwal') && 'Jadwal Posyandu Se-Kota'}
                  {activeMenu === 'data-sasaran' && 'Data Sasaran Wilayah Kota'}
                  {activeMenu === 'laporan-ekspor' && (isDinkesStaf ? 'Rekapitulasi Pelaporan' : 'Rekapitulasi Pelaporan Kota')}
                  {activeMenu === 'profil-pengguna' && (isDinkesStaf ? 'Profil Pengguna Staf' : 'Profil Dinas Kesehatan Kota')}
                </>
              ) : isPuskesmas ? (
                <>
                  {activeMenu === 'dashboard' && (isPuskesmasStaf ? 'Dashboard Staf Puskesmas' : 'Dashboard Pembina Wilayah')}
                  {activeMenu === 'jadwal' && 'Jadwal Posyandu Wilayah'}
                  {(activeMenu === 'verifikasi-akun' || activeMenu === 'verifikasi-kader' || activeMenu === 'manajemen-akun') && (
                    activeSubmenu === 'staf' 
                      ? 'Verifikasi Staf Internal Puskesmas' 
                      : activeSubmenu === 'kelola'
                        ? 'Kelola Akun Kader & Tenaga Kesehatan'
                        : 'Verifikasi Akun Kader Posyandu'
                  )}
                  {activeMenu === 'data-sasaran' && 'Data Sasaran'}
                  {activeMenu === 'pemantauan-rujukan' && 'Pemantauan Rujukan Medis'}
                  {activeMenu === 'laporan-ekspor' && 'Rekapitulasi Pemeriksaan'}
                  {(activeMenu === 'profil-instansi' || activeMenu === 'profil-pengguna') && (isPuskesmasStaf ? 'Profil Pengguna Staf' : 'Profil Instansi Puskesmas')}
                </>
              ) : (
                <>
                  {activeMenu === 'dashboard' && 'Dashboard Layanan Posyandu'}
                  {activeMenu === 'jadwal' && 'Jadwal Posyandu'}
                  {activeMenu === 'data-sasaran' && 'Data Sasaran'}
                  {activeMenu === 'pemeriksaan' && 'Layanan Pemeriksaan Kesehatan'}
                  {activeMenu === 'rekap-pemeriksaan' && 'Rekapitulasi Pemeriksaan'}
                  {activeMenu === 'riwayat-rujukan' && 'Daftar Riwayat Rujukan Posyandu'}
                  {activeMenu === 'profil-pengguna' && 'Profil Pengguna'}
                </>
              )}
            </h2>
            <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
              {isDinkes ? (
                <>
                  {activeMenu === 'dashboard' && 'Pemantauan indikator kesehatan, status pelaporan Puskesmas, dan kesiapan fasilitas kesehatan tingkat Kota'}
                  {(activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun') && (
                    activeSubmenu === 'staf'
                      ? 'Kelola persetujuan dan otorisasi pendaftaran staf internal Dinas Kesehatan Kota.'
                      : activeSubmenu === 'kelola'
                        ? 'Manajemen status aktif, nonaktif, dan hak akses seluruh akun Puskesmas dan Staf Dinkes terdaftar.'
                        : 'Kelola persetujuan pendaftaran akun resmi Puskesmas Induk & Pembantu se-wilayah Kota.'
                  )}
                  {(activeMenu === 'jadwal-monitoring' || activeMenu === 'jadwal') && 'Monitoring agenda buka dan operasional Posyandu se-Kota'}
                  {activeMenu === 'data-sasaran' && 'Monitoring cakupan data sasaran seluruh siklus hidup lintas Puskesmas dan Posyandu se-Kota'}
                  {activeMenu === 'laporan-ekspor' && (isDinkesStaf ? 'Rekapitulasi formulir register bulanan dan unduh berkas agregat Excel (.xlsx)' : 'Rekapitulasi dan ekspor data agregat kesehatan masyarakat tingkat Kota')}
                  {activeMenu === 'profil-pengguna' && 'Informasi akun dan manajemen profil pengguna'}
                </>
              ) : isPuskesmas ? (
                <>
                  {activeMenu === 'dashboard' && 'Ringkasan operasional fasyankes, tren pemeriksaan dan kunjungan Posyandu se-wilayah kerja'}
                  {activeMenu === 'jadwal' && 'Jadwal operasional Posyandu di wilayah kerja Puskesmas'}
                  {(activeMenu === 'verifikasi-akun' || activeMenu === 'verifikasi-kader' || activeMenu === 'manajemen-akun') && (
                    activeSubmenu === 'staf'
                      ? 'Kelola persetujuan dan otorisasi pendaftaran akun tenaga kesehatan dan staf administrasi internal Puskesmas.'
                      : activeSubmenu === 'kelola'
                        ? 'Manajemen status aktif, nonaktif, dan penugasan seluruh Kader Posyandu dan Staf Puskesmas terdaftar.'
                        : 'Kelola persetujuan dan otorisasi pendaftaran akun kader posyandu dari berbagai RW wilayah kerja Puskesmas.'
                  )}
                  {activeMenu === 'data-sasaran' && 'Kelola dan pantau data sasaran fasyankes pembina wilayah dari seluruh Posyandu'}
                  {activeMenu === 'pemantauan-rujukan' && 'Monitoring kasus rujukan berisiko dari Posyandu yang membutuhkan penanganan medis di Puskesmas'}
                  {activeMenu === 'laporan-ekspor' && 'Rekapitulasi formulir register bulanan dan unduh laporan berkas Excel (.xlsx)'}
                  {(activeMenu === 'profil-instansi' || activeMenu === 'profil-pengguna') && 'Informasi identitas instansi fasyankes dan manajemen akun'}
                </>
              ) : (
                <>
                  {activeMenu === 'dashboard' && 'Ringkasan pelayanan Posyandu Melati RW 04 hari ini.'}
                  {activeMenu === 'jadwal' && 'Agenda dan waktu pelaksanaan posyandu Posyandu Melati RW 04.'}
                  {activeMenu === 'data-sasaran' && 'Data sasaran seluruh siklus hidup posyandu di wilayah kerja Posyandu.'}
                  {activeMenu === 'pemeriksaan' && 'Input dan monitoring berkala tumbuh kembang serta kesehatan.'}
                  {activeMenu === 'rekap-pemeriksaan' && 'Laporan rekap bulanan pemeriksaan kesehatan posyandu.'}
                  {activeMenu === 'riwayat-rujukan' && 'Daftar sasaran warga yang dirujuk ke Puskesmas / Pustu berdasarkan hasil pemeriksaan posyandu.'}
                  {activeMenu === 'profil-pengguna' && 'Kelola informasi data pribadi dan keamanan akun Anda.'}
                </>
              )}
            </p>
          </div>

          {/* User Profile Badge (Top Right - Aligned Horizontally) */}
          <div 
            className="d-flex align-items-center gap-2.5 bg-white p-1.5 pe-3 rounded-pill border shadow-xs flex-shrink-0 align-self-start align-self-md-center"
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            onClick={() => onNavigate(isDinkes ? 'profil-pengguna' : (isPuskesmasAdmin ? 'profil-instansi' : 'profil-pengguna'))}
            title="Buka Pengaturan Profil"
          >
            <div 
              className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0" 
              style={{ 
                width: '38px', 
                height: '38px', 
                backgroundColor: isDinkes ? (isDinkesAdmin ? '#1e3a8a' : '#0284c7') : (isPuskesmas ? (isPuskesmasAdmin ? '#2E4E52' : '#0D9488') : '#2b2e4a'), 
                color: '#ffffff',
                fontSize: '0.85rem' 
              }}
            >
              {(user?.foto || user?.avatar) ? (
                <img 
                  src={user.foto || user.avatar} 
                  alt={user.nama || "User"} 
                  className="w-100 h-100 object-fit-cover" 
                />
              ) : isDinkesAdmin ? (
                <Building2 size={18} />
              ) : (
                <User size={18} />
              )}
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: '0.825rem', lineHeight: '1.2' }}>
                {user.nama || (isDinkesAdmin ? 'dr. H. Rahmat Hidayat, M.Kes' : isDinkesStaf ? 'Anisa Mayasari, SKM' : isPuskesmasAdmin ? 'dr. Hendra Setiawan' : isPuskesmasStaf ? 'dr. Sarah Amanda Putri' : 'Dzakiyah Al Zahrani')}
              </div>
              <span className="text-muted" style={{ fontSize: '0.725rem' }}>
                {user.role || (isDinkesAdmin ? 'Admin Dinas Kesehatan' : isDinkesStaf ? 'Staf Dinas Kesehatan' : isPuskesmasAdmin ? 'Admin Puskesmas Sukamaju' : isPuskesmasStaf ? 'Staf Puskesmas Sukamaju' : 'Kader Posyandu')}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div>
          {children}
        </div>
      </main>
    </div>
  );
}

