import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Activity, 
  Users2, 
  FileText,
  HelpCircle,
  KeyRound
} from 'lucide-react';
import RegisterRoleModal from '../../components/auth/RegisterRoleModal';
import { useNotification } from '../../context/NotificationContext';
import { authService, userService } from '../../services';
import logoJogja from '../../assets/logo_jogja.png';
import logoKemenkes from '../../assets/logo_kemenkes.png';
import logoPosyandu from '../../assets/logo_posyandu.png';

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const { showInfo, showWarning } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const detectRoleFromEmail = (targetEmail) => {
    const lowerEmail = (targetEmail || '').toLowerCase();
    if (lowerEmail.includes('admin.dinkes') || lowerEmail.includes('dinkes.admin') || lowerEmail.includes('rahmat')) {
      return 'dinkes-admin';
    } else if (lowerEmail.includes('staf.dinkes') || lowerEmail.includes('anisa') || lowerEmail.includes('dinkes')) {
      return 'dinkes-staf';
    } else if (lowerEmail.includes('admin.sukamaju') || lowerEmail.includes('admin.pkm') || lowerEmail.includes('sukamaju@pkm') || lowerEmail.includes('hendra')) {
      return 'puskesmas'; // Admin Puskesmas
    } else if (lowerEmail.includes('staf.sukamaju') || lowerEmail.includes('amanda') || lowerEmail.includes('staf.pkm') || lowerEmail.includes('sarah') || lowerEmail.includes('puskesmas') || lowerEmail.includes('pkm')) {
      return 'puskesmas-staf';
    } else {
      return 'kader';
    }
  };

  const handleQuickFill = (demoEmail, demoPassword = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();

    // Check if account is in pending or rejected status from Admin Puskesmas verification
    let registeredUserStatus = null;
    try {
      const regUsers = JSON.parse(localStorage.getItem('posyandu_registered_users') || '[]');
      const match = regUsers.find(u => u.email?.toLowerCase() === cleanEmail);
      if (match) {
        registeredUserStatus = match;
      }
    } catch (e) {}

    if (registeredUserStatus && registeredUserStatus.status === 'pending') {
      const verifierName = registeredUserStatus.role === 'dinkes' ? 'Admin Dinas Kesehatan' : 'Admin Puskesmas';
      showWarning(
        `Akun Menunggu Persetujuan ${verifierName}`,
        `Pendaftaran akun Anda atas nama "${registeredUserStatus.nama}" saat ini sedang dalam proses peninjauan oleh ${verifierName}. Pemberitahuan persetujuan dan tautan aktivasi akan dikirimkan ke email: "${registeredUserStatus.email}".`,
        {
          confirmText: "Mengerti"
        }
      );
      return;
    }

    if (registeredUserStatus && registeredUserStatus.status === 'rejected') {
      const verifierName = registeredUserStatus.role === 'dinkes' ? 'Admin Dinas Kesehatan' : 'Admin Puskesmas';
      setErrorMessage(`Pendaftaran akun atas nama "${registeredUserStatus.nama}" telah ditolak oleh ${verifierName}. Silakan hubungi admin instansi terkait atau lakukan pendaftaran ulang.`);
      return;
    }

    setIsLoading(true);

    const detectedRole = detectRoleFromEmail(email);

    try {
      const response = await authService.login({
        email: email.trim(),
        password: password
      });

      let userData = {
        email: email.trim(),
        roleType: response?.data?.user?.role || response?.user?.role || detectedRole,
        nama: response?.data?.user?.nama_lengkap || response?.user?.nama_lengkap,
        token: response?.data?.token || response?.token
      };

      try {
        const meResponse = await userService.getMe();
        if (meResponse?.data) {
          userData = { ...userData, ...meResponse.data };
        }
      } catch (err) {
        console.warn('Gagal fetch /users/me, menggunakan data login.', err);
      }

      onLoginSuccess(userData);
    } catch (error) {
      console.warn('Login Error:', error);
      
      if (error.status === 0 || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        setErrorMessage('Tidak dapat terhubung ke server backend (port 3000). Pastikan backend sudah dijalankan.');
      } else {
        setErrorMessage(error.message || 'Email atau kata sandi tidak sesuai.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role) => {
    setShowRoleModal(false);
    onNavigateToRegister(role);
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
      
      {/* LEFT COLUMN: EDITORIAL INSTITUTIONAL HERO */}
      <div 
        className="col-12 col-lg-6 col-xl-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 20% 0%, #064e3b 0%, #042f2e 50%, #021a17 100%)',
          minHeight: '100vh',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Subtle Geometric Ambient Grid Overlay */}
        <div 
          className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Header: Institutional Identity & ILP Indicator */}
        <div className="d-flex align-items-center justify-content-between z-1 w-100">
          <div 
            className="d-inline-flex align-items-center gap-3 px-3 py-2 rounded-3"
            style={{ 
              background: 'rgba(255, 255, 255, 0.96)', 
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <img src={logoJogja} alt="Pemda DIY" style={{ height: '26px', objectFit: 'contain' }} />
            <div style={{ width: '1px', height: '20px', background: '#cbd5e1' }}></div>
            <img src={logoKemenkes} alt="Kemenkes RI" style={{ height: '18px', objectFit: 'contain' }} />
            <div style={{ width: '1px', height: '20px', background: '#cbd5e1' }}></div>
            <img src={logoPosyandu} alt="Posyandu" style={{ height: '22px', objectFit: 'contain' }} />
          </div>

          <div 
            className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill"
            style={{ 
              background: 'rgba(13, 148, 136, 0.15)', 
              border: '1px solid rgba(45, 212, 191, 0.3)',
              fontSize: '0.785rem'
            }}
          >
            <span className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#2dd4bf', boxShadow: '0 0 6px #2dd4bf' }}></span>
            <span className="text-teal-200 fw-medium" style={{ color: '#99f6e4', letterSpacing: '0.02em' }}>
              Integrasi Layanan Primer (ILP)
            </span>
          </div>
        </div>

        {/* Center Editorial Hero Content */}
        <div className="my-auto py-5 z-1" style={{ maxWidth: '540px' }}>
          <div className="d-inline-flex align-items-center gap-2 mb-3">
            <span 
              className="badge px-2.5 py-1 text-uppercase fw-semibold rounded-2" 
              style={{ 
                backgroundColor: 'rgba(20, 184, 166, 0.2)', 
                color: '#5eead4',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                border: '1px solid rgba(45, 212, 191, 0.3)'
              }}
            >
              Standar Kemenkes RI
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>•</span>
            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Transformasi Digital Kesehatan</span>
          </div>

          <h1 className="fw-bold text-white mb-3" style={{ fontSize: '2.35rem', lineHeight: '1.22', letterSpacing: '-0.03em' }}>
            Sistem Informasi Layanan Posyandu Terintegrasi
          </h1>

          <p className="mb-4" style={{ lineHeight: '1.65', fontSize: '0.95rem', color: '#94a3b8', maxWidth: '480px' }}>
            Digitalisasi alur pemeriksaan 5 langkah berbasis 9 siklus hidup secara terpusat, memudahkan pelaporan real-time antara Kader Posyandu, Puskesmas Pembina, dan Dinas Kesehatan.
          </p>

          {/* Value Highlights Cards */}
          <div className="d-flex flex-column gap-2.5 pt-2">
            <div 
              className="d-flex align-items-center gap-3 p-3 rounded-3"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                style={{ width: '36px', height: '36px', background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf' }}
              >
                <Activity size={18} />
              </div>
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: '0.875rem' }}>Pencatatan 5 Langkah Alur ILP</div>
                <div style={{ color: '#94a3b8', fontSize: '0.775rem' }}>Pendaftaran, Penimbangan, Pencatatan, Pelayanan, hingga Edukasi</div>
              </div>
            </div>

            <div 
              className="d-flex align-items-center gap-3 p-3 rounded-3"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                style={{ width: '36px', height: '36px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
              >
                <Users2 size={18} />
              </div>
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: '0.875rem' }}>Pemantauan 9 Siklus Hidup</div>
                <div style={{ color: '#94a3b8', fontSize: '0.775rem' }}>Ibu Hamil, Bayi-Balita, Usia Sekolah, Remaja, Dewasa, hingga Lansia</div>
              </div>
            </div>

            <div 
              className="d-flex align-items-center gap-3 p-3 rounded-3"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                style={{ width: '36px', height: '36px', background: 'rgba(167, 243, 208, 0.15)', color: '#6ee7b7' }}
              >
                <Building2 size={18} />
              </div>
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: '0.875rem' }}>Sinkronisasi Posyandu, PKM &amp; Dinkes</div>
                <div style={{ color: '#94a3b8', fontSize: '0.775rem' }}>Rekap data epidemiologi, validasi sasaran, dan evaluasi capaian terpadu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Institutional & Security Status */}
        <div 
          className="d-flex align-items-center justify-content-between z-1 pt-3 border-top" 
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontSize: '0.8rem' }}
        >
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={16} style={{ color: '#2dd4bf' }} />
            <span style={{ color: '#cbd5e1' }}>Sistem Terverifikasi Faskes &amp; Terenkripsi</span>
          </div>
          <span style={{ color: '#64748b' }}>v2.6 • Kemenkes RI</span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM SECTION */}
      <div 
        className="col-12 col-lg-6 col-xl-6 d-flex flex-column justify-content-between p-4 p-sm-5"
        style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}
      >
        {/* Top Header Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2.5">
            <img src={logoPosyandu} alt="Posyandu Care" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <div>
              <div className="fw-bold text-dark lh-1" style={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Posyandu Care</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>Platform Integrasi Layanan Primer</div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill"
            style={{ fontSize: '0.8rem', borderColor: '#e2e8f0', color: '#475569' }}
            onClick={() => setShowHelpModal(true)}
          >
            <HelpCircle size={14} />
            <span>Bantuan &amp; Akun</span>
          </button>
        </div>

        {/* Center Form Container */}
        <div className="my-auto mx-auto w-100" style={{ maxWidth: '420px' }}>
          
          {/* Main Card */}
          <div 
            className="p-4 p-sm-4 rounded-4"
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)' 
            }}
          >
            {/* Header Title */}
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.025em', fontSize: '1.45rem' }}>
                Selamat Datang
              </h2>
              <p className="text-muted small mb-0" style={{ fontSize: '0.84rem', lineHeight: '1.45' }}>
                Masuk untuk mengakses pencatatan sasaran dan rekap layanan.
              </p>
            </div>

            {/* Error Notice Alert */}
            {errorMessage && (
              <div 
                className="alert alert-danger py-2.5 px-3 rounded-3 d-flex align-items-start gap-2 mb-3" 
                style={{ fontSize: '0.82rem', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#991b1b' }}
              >
                <span className="fw-bold">•</span>
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit}>
              
              {/* Email Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                  Alamat Email
                </label>
                <div className="input-group" style={{ height: '44px' }}>
                  <span 
                    className="input-group-text border-end-0"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderColor: '#cbd5e1', 
                      borderTopLeftRadius: '10px', 
                      borderBottomLeftRadius: '10px',
                      color: '#64748b'
                    }}
                  >
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email" 
                    className="form-control border-start-0 text-dark shadow-none" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@posyandu.org / nama@pkm.go.id"
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1', 
                      borderTopRightRadius: '10px', 
                      borderBottomRightRadius: '10px',
                      fontSize: '0.875rem' 
                    }}
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1.5">
                  <label className="form-label fw-semibold text-slate-700 mb-0" style={{ fontSize: '0.82rem', color: '#334155' }}>
                    Kata Sandi
                  </label>
                  <button 
                    type="button"
                    onClick={() => { 
                      showInfo(
                        "Pemulihan Kata Sandi",
                        "Untuk mereset kata sandi akun resmi Posyandu Care, silakan hubungi Administrator Puskesmas Pembina atau Dinas Kesehatan."
                      ); 
                    }} 
                    className="btn btn-link text-decoration-none text-muted p-0 small"
                    style={{ fontSize: '0.76rem' }}
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="input-group" style={{ height: '44px' }}>
                  <span 
                    className="input-group-text border-end-0"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderColor: '#cbd5e1', 
                      borderTopLeftRadius: '10px', 
                      borderBottomLeftRadius: '10px',
                      color: '#64748b'
                    }}
                  >
                    <Lock size={16} />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 text-dark shadow-none" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1', 
                      fontSize: '0.875rem' 
                    }}
                    required 
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    className="input-group-text border-start-0 text-muted"
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1', 
                      borderTopRightRadius: '10px', 
                      borderBottomRightRadius: '10px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
                <div className="form-check mb-0">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="rememberMeCheck"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label text-slate-600 small" htmlFor="rememberMeCheck" style={{ fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                    Ingat saya di perangkat ini
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn w-100 text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3"
                style={{ 
                  backgroundColor: '#0f766e', 
                  height: '44px', 
                  borderRadius: '10px', 
                  fontSize: '0.9rem',
                  letterSpacing: '0.01em',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Demo Quick Account Selector */}
            <div className="pt-2 pb-1 border-top mt-3" style={{ borderColor: '#f1f5f9' }}>
              <div className="text-muted small mb-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.72rem' }}>
                <span className="fw-semibold text-uppercase" style={{ letterSpacing: '0.05em', color: '#94a3b8' }}>Akun Demo Cepat:</span>
                <span style={{ color: '#94a3b8' }}>Klik untuk mengisi</span>
              </div>
              <div className="d-flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('kader.melati@posyandu.org')}
                  className="btn btn-sm btn-light border text-dark fw-medium px-2 py-1 rounded-2"
                  style={{ fontSize: '0.74rem', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                >
                  🌱 Kader Posyandu
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin.sukamaju@pkm.go.id')}
                  className="btn btn-sm btn-light border text-dark fw-medium px-2 py-1 rounded-2"
                  style={{ fontSize: '0.74rem', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                >
                  🏥 Admin Puskesmas
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin.dinkes@depok.go.id')}
                  className="btn btn-sm btn-light border text-dark fw-medium px-2 py-1 rounded-2"
                  style={{ fontSize: '0.74rem', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                >
                  🏛️ Admin Dinkes
                </button>
              </div>
            </div>

            {/* Registration Footer */}
            <div className="text-center pt-3 border-top mt-3" style={{ borderColor: '#f1f5f9' }}>
              <button 
                type="button" 
                className="btn btn-link p-0 text-decoration-none small"
                style={{ fontSize: '0.82rem', color: '#64748b' }}
                onClick={() => setShowRoleModal(true)}
              >
                Belum memiliki akun? <span className="fw-bold" style={{ color: '#0f766e' }}>Registrasi Petugas/Kader &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-muted small mt-4" style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
          &copy; 2026 Posyandu Care • Terintegrasi Standar Layanan Primer Kemenkes RI
        </div>

      </div>

      {/* Role Selector Modal */}
      <RegisterRoleModal 
        show={showRoleModal} 
        onHide={() => setShowRoleModal(false)} 
        onSelectRole={handleSelectRole}
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 p-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded-3" style={{ background: '#f0fdfa', color: '#0f766e' }}>
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.1rem' }}>
                      Akun Uji Coba Sistem
                    </h5>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Password seragam: <code>password123</code></div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowHelpModal(false)}></button>
              </div>

              <div className="d-flex flex-column gap-2 mb-4">
                <div 
                  className="p-3 rounded-3 border cursor-pointer"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', cursor: 'pointer' }}
                  onClick={() => { handleQuickFill('kader.melati@posyandu.org'); setShowHelpModal(false); }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Kader Melati (Posyandu)</span>
                    <span className="badge bg-teal-subtle text-teal-800" style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '0.7rem' }}>Kader</span>
                  </div>
                  <div className="font-monospace text-muted small" style={{ fontSize: '0.78rem' }}>kader.melati@posyandu.org</div>
                </div>

                <div 
                  className="p-3 rounded-3 border cursor-pointer"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', cursor: 'pointer' }}
                  onClick={() => { handleQuickFill('admin.sukamaju@pkm.go.id'); setShowHelpModal(false); }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Admin Puskesmas Sukamaju</span>
                    <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem' }}>Puskesmas</span>
                  </div>
                  <div className="font-monospace text-muted small" style={{ fontSize: '0.78rem' }}>admin.sukamaju@pkm.go.id</div>
                </div>

                <div 
                  className="p-3 rounded-3 border cursor-pointer"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', cursor: 'pointer' }}
                  onClick={() => { handleQuickFill('admin.dinkes@depok.go.id'); setShowHelpModal(false); }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Admin Dinas Kesehatan</span>
                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.7rem' }}>Dinkes</span>
                  </div>
                  <div className="font-monospace text-muted small" style={{ fontSize: '0.78rem' }}>admin.dinkes@depok.go.id</div>
                </div>
              </div>

              <button 
                type="button" 
                className="btn w-100 text-white rounded-3 py-2 fw-semibold"
                style={{ backgroundColor: '#0f766e' }}
                onClick={() => setShowHelpModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
