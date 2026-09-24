import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, HeartHandshake, CheckCircle2 } from 'lucide-react';
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
  const [serverNotice, setServerNotice] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setServerNotice('');

    const cleanEmail = email.trim().toLowerCase();

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password: password
      });

      let userData = {
        email: email.trim(),
        roleType: response?.data?.user?.role || response?.user?.role,
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

      if (userData.status && userData.status !== 'active') {
        const statusMessages = {
          pending_approval: 'Akun masih menunggu persetujuan admin.',
          rejected: 'Akun ditolak atau dinonaktifkan oleh admin.',
          inactive: 'Akun sedang nonaktif.'
        };
        setErrorMessage(statusMessages[userData.status] || `Akun belum aktif (status: ${userData.status}).`);
        return;
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
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-white">
      
      {/* LEFT COLUMN: HERO SECTION */}
      <div 
        className="col-12 col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #031317 0%, #062e2a 45%, #054238 100%)',
          minHeight: '100vh'
        }}
      >
        {/* Ambient Subtle Gradient Glow */}
        <div 
          className="position-absolute" 
          style={{ 
            top: '-10%', 
            left: '-10%', 
            width: '450px', 
            height: '450px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none' 
          }} 
        />
        <div 
          className="position-absolute" 
          style={{ 
            bottom: '-5%', 
            right: '-5%', 
            width: '400px', 
            height: '400px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none' 
          }} 
        />

        {/* Top Header: Single Clean White Logo Badge (Left) & Aligned ILP Badge (Right) */}
        <div className="d-flex align-items-center justify-content-between z-1 pt-1 w-100">
          <div 
            className="d-inline-flex align-items-center gap-3 bg-white px-3 py-1.5 rounded-pill shadow-sm"
            style={{ height: '42px' }}
          >
            <img src={logoJogja} alt="Logo Pemda" style={{ height: '24px', objectFit: 'contain' }} />
            <div style={{ width: '1px', height: '18px', background: '#e2e8f0' }}></div>
            <img src={logoKemenkes} alt="Logo Kemenkes" style={{ height: '16px', objectFit: 'contain' }} />
            <div style={{ width: '1px', height: '18px', background: '#e2e8f0' }}></div>
            <img src={logoPosyandu} alt="Logo Posyandu" style={{ height: '20px', objectFit: 'contain' }} />
          </div>

          <div 
            className="d-inline-flex align-items-center gap-2 px-3.5 rounded-pill shadow-sm"
            style={{ 
              background: 'rgba(6, 78, 59, 0.85)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(45, 212, 191, 0.4)',
              fontSize: '0.785rem',
              height: '42px'
            }}
          >
            <span className="rounded-circle" style={{ width: '7px', height: '7px', backgroundColor: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }}></span>
            <span className="text-white fw-semibold">Integrasi Layanan Primer (ILP)</span>
          </div>
        </div>

        {/* Center Headline & Value Highlights */}
        <div className="my-auto py-4 z-1" style={{ maxWidth: '520px' }}>
          <div 
            className="text-uppercase fw-bold mb-2.5" 
            style={{ 
              color: '#2dd4bf', 
              fontSize: '0.78rem', 
              letterSpacing: '0.12em' 
            }}
          >
            LAYANAN KESEHATAN MASYARAKAT TERPADU
          </div>

          <h1 className="fw-bold text-white mb-3" style={{ fontSize: '2.5rem', lineHeight: '1.2', letterSpacing: '-0.03em' }}>
            Masa Depan Layanan Posyandu Terpadu<br />
            <span style={{ 
              background: 'linear-gradient(90deg, #2dd4bf 0%, #38bdf8 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}>
              Ada di Sini
            </span>
          </h1>

          <p className="text-light mb-4" style={{ lineHeight: '1.65', fontSize: '0.95rem', color: '#cbd5e1' }}>
            Digitalisasi pencatatan 5 langkah berbasis 9 siklus hidup ILP secara akurat, modern, dan terhubung real-time dari Posyandu hingga Dinas Kesehatan.
          </p>

          {/* 3 Quick Clean Glass Feature Pillars */}
          <div className="row g-2.5">
            <div className="col-4">
              <div 
                className="p-3 rounded-4 h-100 shadow-sm"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)' 
                }}
              >
                <div className="fw-bolder fs-5 mb-1" style={{ color: '#2dd4bf' }}>9 Siklus</div>
                <div className="small" style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  Bumil, Balita, Remaja, Dewasa &amp; Lansia
                </div>
              </div>
            </div>
            <div className="col-4">
              <div 
                className="p-3 rounded-4 h-100 shadow-sm"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)' 
                }}
              >
                <div className="fw-bolder fs-5 mb-1" style={{ color: '#38bdf8' }}>5 Langkah</div>
                <div className="small" style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  Alur Standar Pemeriksaan ILP
                </div>
              </div>
            </div>
            <div className="col-4">
              <div 
                className="p-3 rounded-4 h-100 shadow-sm"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)' 
                }}
              >
                <div className="fw-bolder fs-5 mb-1" style={{ color: '#a7f3d0' }}>Sinkron</div>
                <div className="small" style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  Posyandu • Puskesmas • Dinkes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note with Security Badge */}
        <div 
          className="d-flex align-items-center justify-content-between z-1 pt-3 border-top text-white-50 small" 
          style={{ borderColor: 'rgba(255, 255, 255, 0.12)', fontSize: '0.8rem' }}
        >
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={16} style={{ color: '#2dd4bf' }} />
            <span className="text-white-50">Sistem Terverifikasi &amp; Terenkripsi Faskes</span>
          </div>
          <span className="text-white-50">Dinas Kesehatan &amp; Puskesmas</span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM SECTION */}
      <div 
        className="col-12 col-lg-6 d-flex flex-column justify-content-between p-4 p-md-5"
        style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}
      >
        {/* Top Header Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2.5">
            <img src={logoPosyandu} alt="Posyandu Care" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            <span className="fw-bold text-dark fs-5">Posyandu Care</span>
          </div>

          <button 
            type="button" 
            className="btn btn-sm btn-link text-decoration-none text-muted p-0 small fw-medium"
            style={{ fontSize: '0.82rem' }}
            onClick={() => setShowHelpModal(true)}
          >
            Bantuan
          </button>
        </div>

        {/* Center Form Container */}
        <div className="my-auto mx-auto w-100" style={{ maxWidth: '440px' }}>
          
          <div 
            className="card border bg-white p-4 p-md-4"
            style={{ 
              borderRadius: '24px', 
              borderColor: '#e2e8f0', 
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.02)' 
            }}
          >
            {/* Header Title */}
            <h4 className="fw-bold text-dark mb-1.5" style={{ letterSpacing: '-0.025em', fontSize: '1.4rem' }}>
              Selamat Datang Kembali!
            </h4>
            <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.5' }}>
              Masuk untuk mengelola data Posyandu &amp; sasaran terhubung ke database.
            </p>

            {/* Error Notice Alert */}
            {errorMessage && (
              <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3" style={{ fontSize: '0.82rem' }}>
                {errorMessage}
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit}>
              
              {/* Email Input */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                  Alamat Email
                </label>
                <div className="input-group" style={{ height: '46px' }}>
                  <span 
                    className="input-group-text border-end-0 text-secondary"
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderTopLeftRadius: '12px', 
                      borderBottomLeftRadius: '12px' 
                    }}
                  >
                    <Mail size={16} className="text-muted" />
                  </span>
                  <input 
                    type="email" 
                    className="form-control border-start-0 text-dark shadow-none" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@posyandu.org / nama@pkm.go.id"
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderTopRightRadius: '12px', 
                      borderBottomRightRadius: '12px',
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
                  <label className="form-label fw-bold text-dark mb-0" style={{ fontSize: '0.82rem' }}>
                    Kata Sandi / Password
                  </label>
                  <a 
                    href="#lupa-password" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      showInfo(
                        "Pemulihan Kata Sandi",
                        "Tautan instruksi reset kata sandi telah dikirimkan ke email Anda."
                      ); 
                    }} 
                    className="text-decoration-none text-muted small"
                    style={{ fontSize: '0.76rem' }}
                  >
                    Lupa Kata Sandi?
                  </a>
                </div>
                <div className="input-group" style={{ height: '46px' }}>
                  <span 
                    className="input-group-text border-end-0 text-secondary"
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderTopLeftRadius: '12px', 
                      borderBottomLeftRadius: '12px' 
                    }}
                  >
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 text-dark shadow-none" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
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
                      borderColor: '#e2e8f0', 
                      borderTopRightRadius: '12px', 
                      borderBottomRightRadius: '12px',
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
              <div className="form-check mb-4 mt-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="rememberMeCheck"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label className="form-check-label text-dark small" htmlFor="rememberMeCheck" style={{ fontSize: '0.82rem' }}>
                  Ingat Saya di perangkat ini
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3.5"
                style={{ 
                  backgroundColor: '#1e293b', 
                  height: '48px', 
                  borderRadius: '10px', 
                  fontSize: '0.9rem' 
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* Registration Footer */}
            <div className="text-center pt-2">
              <button 
                type="button" 
                className="btn btn-link p-0 text-decoration-none text-muted small"
                style={{ fontSize: '0.82rem' }}
                onClick={() => setShowRoleModal(true)}
              >
                Belum punya akun? <span className="text-dark fw-bold">Registrasi Akun Petugas/Kader &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-muted small mt-4" style={{ fontSize: '0.74rem' }}>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 p-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0 text-dark">
                  Panduan Masuk Sistem
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowHelpModal(false)}></button>
              </div>
              <div className="small text-secondary mb-4" style={{ lineHeight: '1.5' }}>
                <p className="mb-2">Akun terdaftar pada database PostgreSQL lokal (Password: <code>password123</code>):</p>
                <ul className="ps-3 mb-3">
                  <li className="mb-1"><strong>Kader Melati:</strong> <code>kader.melati@posyandu.org</code></li>
                  <li className="mb-1"><strong>Admin Puskesmas:</strong> <code>admin.sukamaju@pkm.go.id</code></li>
                  <li className="mb-1"><strong>Admin Dinas Kesehatan:</strong> <code>admin.dinkes@depok.go.id</code></li>
                </ul>
                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                  Jika mengalami kendala, hubungi Helpdesk IT Puskesmas Pembina wilayah Anda.
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-dark w-100 rounded-3 py-2 fw-semibold"
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
