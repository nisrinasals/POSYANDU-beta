import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import RegisterRoleModal from "../../components/auth/RegisterRoleModal";
import { useNotification } from "../../context/NotificationContext";
import { authService, userService } from "../../services";
import logoJogja from "../../assets/logo_jogja.png";
import logoKemenkes from "../../assets/logo_kemenkes.png";
import logoPosyandu from "../../assets/logo_posyandu.png";

/* ─── Inline styles as a style block (injected once) ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .login-root {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100dvh;
    display: flex;
  }

  /* ── LEFT PANEL ── */
  .login-left {
    width: 50%;
    min-height: 100dvh;
    background: linear-gradient(155deg, #0d1b35 0%, #0f2557 50%, #1a3a8f 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.25rem 2.75rem;
    position: relative;
    overflow: hidden;
  }

  .login-left::before {
    content: '';
    position: absolute;
    top: -120px;
    left: -80px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.14) 0%, transparent 70%);
    pointer-events: none;
  }
  .login-left::after {
    content: '';
    position: absolute;
    bottom: -80px;
    right: -60px;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(147, 197, 253, 0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.96);
    padding: 7px 14px;
    border-radius: 100px;
    height: 42px;
  }

  .login-logo-sep {
    width: 1px;
    height: 18px;
    background: #cbd5e1;
  }

  .login-ilp-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(29, 78, 216, 0.80);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(96, 165, 250, 0.35);
    padding: 0 14px;
    border-radius: 100px;
    height: 42px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #ffffff;
  }

  .login-ilp-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #60a5fa;
    box-shadow: 0 0 10px rgba(45, 212, 191, 0.8);
    flex-shrink: 0;
  }

  /* ── HERO COPY ── */
  .login-eyebrow {
    font-family: 'Outfit', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #60a5fa;
    margin-bottom: 14px;
  }

  .login-headline {
    font-family: 'Outfit', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin: 0 0 8px;
  }

  .login-headline-accent {
    background: linear-gradient(90deg, #60a5fa 0%, #93c5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
  }

  .login-body {
    font-size: 0.9rem;
    font-weight: 400;
    line-height: 1.65;
    color: #94a3b8;
    max-width: 420px;
    margin-bottom: 28px;
  }

  /* ── STAT CARDS ── */
  .login-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .login-stat-card {
    background: rgba(255, 255, 255, 0.065);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 14px;
    padding: 14px 14px 12px;
    transition: border-color 0.2s;
  }

  .login-stat-card:hover {
    border-color: rgba(45, 212, 191, 0.25);
  }

  .login-stat-val {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 5px;
  }

  .login-stat-desc {
    font-size: 0.68rem;
    font-weight: 400;
    color: #94a3b8;
    line-height: 1.35;
  }

  /* ── LEFT FOOTER ── */
  .login-left-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.10);
    font-size: 0.75rem;
    color: #64748b;
    position: relative;
    z-index: 1;
  }

  /* ── RIGHT PANEL ── */
  .login-right {
    width: 50%;
    min-height: 100dvh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.25rem 2.75rem;
  }

  .login-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .login-brand-name {
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #0f172a;
  }

  .login-brand-sub {
    font-size: 0.7rem;
    font-weight: 500;
    color: #64748b;
    letter-spacing: 0.01em;
  }

  .login-help-btn {
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 5px 13px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
  }

  .login-help-btn:hover {
    border-color: #cbd5e1;
    color: #0f172a;
    background: #f8fafc;
  }

  /* ── FORM CARD ── */
  .login-form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-card {
    background: #ffffff;
    border: 1px solid #e8edf3;
    border-radius: 20px;
    padding: 2.5rem 2.25rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    width: 100%;
    max-width: 420px;
  }

  .login-title {
    font-family: 'Outfit', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.05;
    color: #0f172a;
    margin: 0 0 8px;
  }

  .login-subtitle {
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    font-weight: 400;
    color: #64748b;
    line-height: 1.55;
    margin: 0 0 24px;
  }

  /* ── FORM ELEMENTS ── */
  .login-field {
    margin-bottom: 16px;
  }

  .login-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
    display: block;
    margin-bottom: 7px;
  }

  .login-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #fafbfc;
    transition: border-color 0.15s, box-shadow 0.15s;
    overflow: hidden;
  }

  .login-input-wrap:focus-within {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
    background: #ffffff;
  }

  .login-input-icon {
    padding: 0 12px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .login-input {
    flex: 1;
    height: 46px;
    border: none;
    background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    color: #0f172a;
    outline: none;
    padding: 0;
  }

  .login-input::placeholder {
    color: #b0bcc8;
    font-weight: 400;
  }

  .login-input:disabled {
    color: #94a3b8;
  }

  .login-eye-btn {
    padding: 0 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .login-eye-btn:hover {
    color: #475569;
  }

  /* ── LABEL ROW (password) ── */
  .login-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 7px;
  }

  .login-forgot {
    font-family: 'Outfit', sans-serif;
    font-size: 0.76rem;
    font-weight: 500;
    color: #60a5fa;
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .login-forgot:hover {
    opacity: 0.75;
    color: #60a5fa;
  }

  /* ── REMEMBER ME ── */
  .login-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 22px;
    margin-top: 4px;
    cursor: pointer;
  }

  .login-remember input[type="checkbox"] {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    accent-color: #0f172a;
    cursor: pointer;
    flex-shrink: 0;
  }

  .login-remember span {
    font-family: 'Outfit', sans-serif;
    font-size: 0.81rem;
    font-weight: 400;
    color: #475569;
  }

  /* ── SUBMIT BUTTON ── */
  .login-submit {
    width: 100%;
    height: 50px;
    background: #0f172a;
    color: #ffffff;
    border: none;
    border-radius: 11px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, transform 0.1s;
    margin-bottom: 16px;
  }

  .login-submit:hover:not(:disabled) {
    background: #1e293b;
  }

  .login-submit:active:not(:disabled) {
    transform: translateY(1px) scale(0.99);
  }

  .login-submit:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  /* ── ERROR ALERT ── */
  .login-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.81rem;
    font-weight: 500;
    color: #dc2626;
    margin-bottom: 18px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  /* ── REGISTER LINK ── */
  .login-register-row {
    text-align: center;
  }

  .login-register-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    font-weight: 400;
    color: #64748b;
    transition: color 0.15s;
  }

  .login-register-btn strong {
    color: #0f172a;
    font-weight: 700;
  }

  .login-register-btn:hover {
    color: #0f172a;
  }

  /* ── RIGHT FOOTER ── */
  .login-right-footer {
    text-align: center;
    font-family: 'Outfit', sans-serif;
    font-size: 0.72rem;
    font-weight: 400;
    color: #94a3b8;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1023px) {
    .login-left { display: none !important; }
    .login-right {
      width: 100%;
      padding: 2rem 1.5rem;
    }
  }

  /* ── SPIN ANIMATION ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.9s linear infinite; }
`;

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const { showInfo } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
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
          pending_approval: "Akun masih menunggu persetujuan admin.",
          rejected: "Akun ditolak atau dinonaktifkan oleh admin.",
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

      <div className="login-root">
        {/* ══════════════════════════════════════════════
            LEFT PANEL — Hero & Brand Story
        ══════════════════════════════════════════════ */}
        <div className="login-left">
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
            <div className="login-logo-badge">
              <img src={logoJogja} alt="Logo Pemda" style={{ height: "22px", objectFit: "contain" }} />
              <div className="login-logo-sep" />
              <img src={logoKemenkes} alt="Logo Kemenkes" style={{ height: "15px", objectFit: "contain" }} />
              <div className="login-logo-sep" />
              <img src={logoPosyandu} alt="Logo Posyandu" style={{ height: "19px", objectFit: "contain" }} />
            </div>

            <div className="login-ilp-badge">
              <div className="login-ilp-dot" />
              <span>Integrasi Layanan Primer (ILP)</span>
            </div>
          </div>

          {/* Center hero copy */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: "500px" }}>
            <p className="login-eyebrow">Layanan Kesehatan Masyarakat Terpadu</p>

            <h1 className="login-headline">
              Masa Depan Layanan
              <br />
              Posyandu Terpadu
              <span className="login-headline-accent">Ada di Sini</span>
            </h1>

            <p className="login-body">
              Digitalisasi pencatatan 5 langkah berbasis 9 siklus hidup ILP secara akurat, modern, dan terhubung real-time dari Posyandu hingga Dinas Kesehatan.
            </p>

            {/* Stat cards */}
            <div className="login-stats">
              <div className="login-stat-card">
                <div className="login-stat-val" style={{ color: "#60a5fa" }}>9 Siklus</div>
                <div className="login-stat-desc">Bumil, Balita, Remaja, Dewasa &amp; Lansia</div>
              </div>
              <div className="login-stat-card">
                <div className="login-stat-val" style={{ color: "#93c5fd" }}>5 Langkah</div>
                <div className="login-stat-desc">Alur Standar Pemeriksaan ILP</div>
              </div>
              <div className="login-stat-card">
                <div className="login-stat-val" style={{ color: "#bfdbfe" }}>Sinkron</div>
                <div className="login-stat-desc">Posyandu • Puskesmas • Dinkes</div>
              </div>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="login-left-footer">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={15} style={{ color: "#60a5fa" }} />
              <span>Sistem Terverifikasi &amp; Terenkripsi Faskes</span>
            </div>
            <span>Dinas Kesehatan &amp; Puskesmas</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            RIGHT PANEL — Login Form
        ══════════════════════════════════════════════ */}
        <div className="login-right">
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="login-brand">
              <img src={logoPosyandu} alt="SENGKUYUNG KATRESNAN" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
              <div>
                <div className="login-brand-name">SENGKUYUNG KATRESNAN</div>
                <div className="login-brand-sub">Sistem Informasi Posyandu</div>
              </div>
            </div>
            <button type="button" className="login-help-btn" onClick={() => setShowHelpModal(true)}>
              Bantuan
            </button>
          </div>

          {/* Form */}
          <div className="login-form-wrap">
            <div className="login-card">
              <h2 className="login-title">Selamat Datang<br />Kembali!</h2>
              <p className="login-subtitle">
                Masuk untuk mengelola data Posyandu &amp; sasaran terhubung ke database real-time.
              </p>

              {errorMessage && (
                <div className="login-error">
                  <span style={{ flexShrink: 0, marginTop: "1px" }}>⚠</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="login-field">
                  <label className="login-label" htmlFor="login-email">Alamat Email</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">
                      <Mail size={15} />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      className="login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@posyandu.org"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="login-field">
                  <div className="login-label-row">
                    <label className="login-label" style={{ margin: 0 }} htmlFor="login-password">Kata Sandi</label>
                    <a
                      href="#lupa-password"
                      className="login-forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        showInfo("Pemulihan Kata Sandi", "Tautan instruksi reset kata sandi telah dikirimkan ke email Anda.");
                      }}
                    >
                      Lupa kata sandi?
                    </a>
                  </div>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">
                      <Lock size={15} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="login-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="login-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      disabled={isLoading}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="login-remember" htmlFor="remember-me">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>

                {/* Submit */}
                <button type="submit" className="login-submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Memverifikasi…</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <span style={{ fontSize: "1.05em" }}>→</span>
                    </>
                  )}
                </button>
              </form>

              {/* Register link */}
              <div className="login-register-row">
                <button type="button" className="login-register-btn" onClick={() => setShowRoleModal(true)}>
                  Belum punya akun?{" "}
                  <strong>Registrasi Akun Petugas / Kader →</strong>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="login-right-footer">
            © 2026 SENGKUYUNG KATRESNAN &nbsp;·&nbsp; Terintegrasi Standar ILP Kemenkes RI
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <RegisterRoleModal show={showRoleModal} onHide={() => setShowRoleModal(false)} onSelectRole={handleSelectRole} />

      {showHelpModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'Outfit', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#0f172a" }}>Panduan Masuk Sistem</h5>
              <button
                style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "1rem" }}
                onClick={() => setShowHelpModal(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6, margin: "0 0 8px" }}>
              Gunakan email dan password akun yang sudah terdaftar pada backend.
            </p>
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 24px" }}>
              Jika mengalami kendala login, pastikan akun sudah terdaftar, terverifikasi, dan telah memperoleh persetujuan yang diperlukan.
            </p>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              style={{ width: "100%", height: "46px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "11px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
