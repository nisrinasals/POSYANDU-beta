import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import RegisterRoleModal from "../../components/auth/RegisterRoleModal";
import { useNotification } from "../../context/NotificationContext";
import { authService, userService } from "../../services";
import logoJogja from "../../assets/logo_jogja.png";
import logoKemenkes from "../../assets/logo_kemenkes.png";
import logoPosyandu from "../../assets/logo_posyandu.png";
import logoSengkuyung from "../../assets/logo_sengkuyung_katresnan.png";
import bannerSoft from "../../assets/auth_banner_soft.jpg";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .auth-screen-wrapper {
    min-height: 100vh;
    width: 100vw;
    background: #f1f5f9;
    background: linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 50%, #cbd5e1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
    position: relative;
    overflow-x: hidden;
  }

  .auth-main-card {
    width: 100%;
    max-width: 1060px;
    min-height: 600px;
    background: #ffffff;
    border-radius: 36px;
    box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.12), 0 4px 16px rgba(15, 23, 42, 0.05);
    display: flex;
    overflow: hidden;
    position: relative;
    border: 1px solid #e2e8f0;
  }

  /* ── PANEL KIRI: GAMBAR SOFT NEUTRAL ── */
  .auth-left-panel {
    flex: 1.05;
    position: relative;
    background-image: url('${bannerSoft}');
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 44px 46px;
    overflow: hidden;
    color: #ffffff;
  }

  .auth-left-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(150deg, rgba(15, 23, 42, 0.72) 0%, rgba(30, 41, 59, 0.60) 50%, rgba(15, 23, 42, 0.82) 100%);
    backdrop-filter: blur(1px);
    z-index: 1;
  }

  .auth-left-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .auth-logos-badge {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
    padding: 7px 18px;
    border-radius: 999px;
    box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.20), 0 0 0 1px rgba(255, 255, 255, 0.4);
    align-self: flex-start;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .auth-logos-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.28);
  }

  .auth-badge-logo {
    height: 26px;
    width: auto;
    object-fit: contain;
    display: block;
  }

  .auth-badge-logo.kemenkes {
    height: 18px;
  }

  .auth-badge-logo.posyandu {
    height: 25px;
  }

  .auth-logo-sep {
    width: 1px;
    height: 18px;
    background: #cbd5e1;
  }

  .auth-hero-title {
    font-size: 2.35rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0 0 8px;
    color: #ffffff;
    text-transform: uppercase;
  }

  .auth-hero-appname {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #cbd5e1;
    margin-bottom: 14px;
  }

  .auth-hero-subtitle {
    font-size: 0.92rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.65;
    max-width: 420px;
    margin: 0 0 24px;
  }

  .auth-info-card {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 16px 20px;
    max-width: 420px;
  }

  .auth-info-card-title {
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #cbd5e1;
    margin-bottom: 4px;
  }

  .auth-info-card-text {
    font-size: 0.88rem;
    color: #ffffff;
    line-height: 1.5;
    margin: 0;
  }

  .auth-left-badge-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  /* ── PANEL KANAN: FORMULIR ── */
  .auth-right-panel {
    flex: 1;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 54px;
    position: relative;
    z-index: 2;
  }

  .auth-right-title {
    font-size: 2.2rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    margin: 0 0 8px;
  }

  .auth-right-desc {
    font-size: 0.88rem;
    color: #64748b;
    margin: 0 0 28px;
    line-height: 1.55;
  }

  .auth-input-pill {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 999px;
    padding: 3px 20px;
    margin-bottom: 16px;
    border: 1.5px solid #cbd5e1;
    transition: all 0.2s ease;
  }

  .auth-input-pill:focus-within {
    background: #ffffff;
    border-color: #0f172a;
    box-shadow: 0 0 0 3.5px rgba(15, 23, 42, 0.1);
  }

  .auth-input-pill-icon {
    color: #64748b;
    margin-right: 12px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .auth-field-input {
    border: none;
    background: transparent;
    width: 100%;
    height: 48px;
    font-size: 0.92rem;
    color: #0f172a;
    outline: none;
    font-family: inherit;
    font-weight: 600;
  }

  .auth-field-input::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  .auth-pass-toggle {
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-right: 4px;
  }

  .auth-pass-toggle:hover {
    color: #0f172a;
    background: rgba(15, 23, 42, 0.08);
  }

  .auth-pass-toggle:active {
    transform: scale(0.92);
  }

  .auth-extra-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    font-size: 0.85rem;
  }

  .auth-remember-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    cursor: pointer;
    font-weight: 600;
  }

  .auth-remember-label input[type="checkbox"] {
    accent-color: #0f172a;
    width: 17px;
    height: 17px;
    border-radius: 4px;
    cursor: pointer;
  }

  .auth-forgot-link {
    color: #64748b;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s;
  }

  .auth-forgot-link:hover {
    color: #0f172a;
    text-decoration: underline;
  }

  .auth-btn-primary {
    width: 100%;
    height: 52px;
    border: none;
    border-radius: 999px;
    background: #0f172a;
    color: #ffffff;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .auth-btn-primary:hover:not(:disabled) {
    background: #1e293b;
    transform: translateY(-1.5px);
    box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.45);
  }

  .auth-btn-primary:active:not(:disabled) {
    transform: translateY(1px);
  }

  .auth-btn-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .auth-divider-or {
    display: flex;
    align-items: center;
    margin: 18px 0;
    color: #94a3b8;
    font-size: 0.78rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .auth-divider-or::before,
  .auth-divider-or::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }

  .auth-divider-or span {
    padding: 0 14px;
  }

  .auth-btn-secondary {
    width: 100%;
    height: 48px;
    border: 1.5px solid #cbd5e1;
    border-radius: 999px;
    background: #ffffff;
    color: #1e293b;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .auth-btn-secondary:hover {
    border-color: #94a3b8;
    background: #f8fafc;
    color: #0f172a;
  }

  .auth-bottom-switch {
    text-align: center;
    margin-top: 24px;
    font-size: 0.84rem;
    color: #64748b;
  }

  .auth-bottom-switch button {
    border: none;
    background: transparent;
    color: #0f172a;
    font-weight: 700;
    cursor: pointer;
    padding: 0 4px;
    text-decoration: underline;
  }

  .auth-alert-box {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 14px;
    padding: 12px 16px;
    color: #dc2626;
    font-size: 0.84rem;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1.45;
  }

  @media (max-width: 920px) {
    .auth-main-card {
      flex-direction: column;
      border-radius: 28px;
      max-width: 520px;
    }
    .auth-left-panel {
      min-height: 260px;
      padding: 32px 28px;
    }
    .auth-right-panel {
      padding: 36px 28px;
    }
    .auth-hero-title {
      font-size: 1.85rem;
    }
  }
`;

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const { showInfo } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password: password,
      });

      let userData = {
        email: email.trim(),
        roleType: response?.data?.user?.role || response?.user?.role,
        nama: response?.data?.user?.nama_lengkap || response?.user?.nama_lengkap,
        token: response?.data?.token || response?.token,
      };

      try {
        const meResponse = await userService.getMe();
        if (meResponse?.data) userData = { ...userData, ...meResponse.data };
      } catch (err) {
        console.warn("Gagal fetch /users/me, menggunakan data login.", err);
      }

      if (userData.status && userData.status !== "active") {
        const statusMessages = {
          pending_approval: "Akun Anda masih menunggu persetujuan dari Admin.",
          rejected: "Akun ditolak atau dinonaktifkan oleh Admin.",
          inactive: "Akun sedang nonaktif.",
        };
        setErrorMessage(statusMessages[userData.status] || `Akun belum aktif (status: ${userData.status}).`);
        return;
      }

      onLoginSuccess(userData);
    } catch (error) {
      if (error.status === 0 || error.message?.includes("Network Error") || error.message?.includes("Failed to fetch")) {
        setErrorMessage("Tidak dapat terhubung ke server. Pastikan backend sudah dijalankan.");
      } else {
        setErrorMessage(error.message || "Email atau kata sandi tidak sesuai.");
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
    <>
      <style>{CSS}</style>

      <div className="auth-screen-wrapper">
        <div className="auth-main-card">
          {/* ══════════════════════════════════════════════
              PANEL KIRI: Visual Netral Soft & Info Sistem
          ══════════════════════════════════════════════ */}
          <div className="auth-left-panel">
            <div className="auth-left-overlay" />

            <div className="auth-left-content">
              {/* Badge Logo Lembaga Terpadu */}
              <div className="auth-logos-badge">
                <img
                  src={logoJogja}
                  alt="Pemerintah Kota Yogyakarta"
                  className="auth-badge-logo"
                  title="Pemerintah Kota Yogyakarta"
                />
                <div className="auth-logo-sep" />
                <img
                  src={logoKemenkes}
                  alt="Kementerian Kesehatan RI"
                  className="auth-badge-logo kemenkes"
                  title="Kementerian Kesehatan RI"
                />
                <div className="auth-logo-sep" />
                <img
                  src={logoPosyandu}
                  alt="Posyandu"
                  className="auth-badge-logo posyandu"
                  title="Posyandu"
                />
              </div>

              {/* Identitas Ringkas Sistem */}
              <div style={{ margin: "auto 0", paddingTop: "20px", paddingBottom: "20px" }}>
                <div className="mb-3 d-inline-flex p-2 bg-white rounded-4 shadow-sm" style={{ backdropFilter: "blur(8px)" }}>
                  <img src={logoSengkuyung} alt="Sengkuyung Katresnan" style={{ width: "68px", height: "68px", objectFit: "contain" }} />
                </div>
                <h1 className="auth-hero-title" style={{ fontSize: "2.1rem", marginBottom: "10px" }}>
                  SENGKUYUNG KATRESNAN
                </h1>
                <p className="auth-hero-subtitle" style={{ fontSize: "0.95rem", lineHeight: "1.55", margin: 0, opacity: 0.9 }}>
                  Sistem Informasi Posyandu Integrasi Layanan Primer (ILP) Kota Yogyakarta
                </p>
              </div>

              {/* Footer Panel Kiri */}
              <div className="auth-left-badge-footer">
                <ShieldCheck size={16} style={{ color: "#cbd5e1" }} />
                <span>Dinas Kesehatan Kota Yogyakarta</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              PANEL KANAN: Formulir Masuk Universal
          ══════════════════════════════════════════════ */}
          <div className="auth-right-panel">
            <h2 className="auth-right-title">Masuk ke Sistem</h2>
            <p className="auth-right-desc">
              Silakan masukkan email dan kata sandi akun Anda untuk mengakses sistem layanan kesehatan.
            </p>

            {errorMessage && (
              <div className="auth-alert-box">
                <span style={{ fontWeight: "bold" }}>⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Input Email / Username */}
              <div className="auth-input-pill">
                <span className="auth-input-pill-icon">
                  <Mail size={18} />
                </span>
                <input
                  type="text"
                  inputMode="email"
                  className="auth-field-input"
                  placeholder="Email atau Nama Akun Petugas / Kader"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Input Kata Sandi */}
              <div className="auth-input-pill">
                <span className="auth-input-pill-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-field-input"
                  placeholder="Kata Sandi Akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Ingat Saya & Lupa Kata Sandi */}
              <div className="auth-extra-row">
                <label className="auth-remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Ingat saya</span>
                </label>
                <a
                  href="#lupa-password"
                  className="auth-forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    showInfo("Bantuan Kata Sandi", "Silakan hubungi administrator Puskesmas atau Dinas Kesehatan untuk bantuan reset kata sandi.");
                  }}
                >
                  Lupa kata sandi?
                </a>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Memverifikasi akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Pembatas Atau */}
              <div className="auth-divider-or">
                <span>Atau</span>
              </div>

              {/* Tombol Registrasi Akun Baru */}
              <button
                type="button"
                className="auth-btn-secondary"
                onClick={() => setShowRoleModal(true)}
              >
                <span>Daftar Akun Baru</span>
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* Modal Pilihan Peran Pendaftaran */}
      <RegisterRoleModal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
        onSelectRole={handleSelectRole}
      />
    </>
  );
}
