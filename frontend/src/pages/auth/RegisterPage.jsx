import React, { useEffect, useState } from "react";
import {
  HeartHandshake, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  ShieldCheck, Mail, Lock, User, Phone, CreditCard, Building2, KeyRound,
  Stethoscope, ArrowRight
} from "lucide-react";
import { posyanduService, authService } from "../../services";
import { validateNik, formatNikInput, validatePhone, formatPhoneInput, validateEmail, validatePassword } from "../../utils/validators";
import { useNotification } from "../../context/NotificationContext";
import SearchablePosyanduSelect from "../../components/common/SearchablePosyanduSelect";
import logoJogja from "../../assets/logo_jogja.png";
import logoKemenkes from "../../assets/logo_kemenkes_clean.png";
import logoPosyandu from "../../assets/logo_posyandu.png";
import logoSengkuyung from "../../assets/logo_sengkuyung_katresnan.png";
import bannerSoft from "../../assets/auth_banner_soft.jpg";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .auth-screen-wrapper {
    min-height: 100vh;
    width: 100vw;
    background: #e2e8f0;
    background: radial-gradient(circle at 20% 25%, #f1f5f9 0%, #e2e8f0 45%, #cbd5e1 100%);
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
    box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.20), 0 10px 24px rgba(0, 0, 0, 0.08);
    display: flex;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.6);
  }

  /* ── PANEL KIRI: GAMBAR 3D & BRAND STORY ── */
  .auth-left-panel {
    flex: 1;
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
    margin-bottom: 12px;
  }

  .auth-hero-subtitle {
    font-size: 0.92rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.65;
    max-width: 420px;
    margin: 0;
  }

  .auth-left-badge-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
  }

  /* ── PANEL KANAN: FORMULIR ── */
  .auth-right-panel {
    flex: 1.15;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 42px 50px;
    position: relative;
    z-index: 2;
    max-height: 90vh;
    overflow-y: auto;
  }

  .auth-right-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .auth-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.84rem;
    font-weight: 600;
    color: #475569;
    background: #f1f5f9;
    border: none;
    padding: 7px 16px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .auth-back-link:hover {
    color: #0f172a;
    background: #e2e8f0;
  }

  .auth-right-title {
    font-size: 2.1rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    margin: 0 0 6px;
  }

  .auth-right-desc {
    font-size: 0.88rem;
    color: #64748b;
    margin: 0 0 20px;
    line-height: 1.5;
  }

  .auth-input-pill {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 999px;
    padding: 3px 18px;
    margin-bottom: 12px;
    border: 1.5px solid #cbd5e1;
    transition: all 0.2s ease;
  }

  .auth-input-pill:focus-within {
    background: #ffffff;
    border-color: #475569;
    box-shadow: 0 0 0 3.5px rgba(71, 85, 105, 0.15);
  }

  .auth-input-pill-icon {
    color: #64748b;
    margin-right: 10px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .auth-field-input {
    border: none;
    background: transparent;
    width: 100%;
    height: 44px;
    font-size: 0.9rem;
    color: #0f172a;
    outline: none;
    font-family: inherit;
    font-weight: 600;
  }

  .auth-field-input::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  .auth-select-pill {
    border: none;
    background: transparent;
    width: 100%;
    height: 44px;
    font-size: 0.9rem;
    color: #0f172a;
    outline: none;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .auth-btn-primary {
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 999px;
    background: #0f172a;
    color: #ffffff;
    font-size: 0.98rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;
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

  .auth-bottom-switch {
    text-align: center;
    margin-top: 18px;
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
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1.45;
  }

  .auth-success-box {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 14px;
    padding: 12px 16px;
    color: #16a34a;
    font-size: 0.84rem;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1.45;
  }

  .auth-otp-field {
    width: 100%;
    height: 56px;
    border-radius: 16px;
    border: 2px solid #cbd5e1;
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: 0.45em;
    text-align: center;
    color: #0f172a;
    outline: none;
    background: #f8fafc;
    transition: all 0.2s;
  }

  .auth-otp-field:focus {
    border-color: #475569;
    background: #ffffff;
    box-shadow: 0 0 0 3.5px rgba(71, 85, 105, 0.15);
  }

  @media (max-width: 920px) {
    .auth-main-card {
      flex-direction: column;
      border-radius: 28px;
      max-width: 520px;
    }
    .auth-left-panel {
      min-height: 240px;
      padding: 30px 24px;
    }
    .auth-right-panel {
      padding: 32px 24px;
    }
  }
`;

export default function RegisterPage({ role = "kader", onRegisterSuccess, onGoToLogin }) {
  const { showSuccess, showInfo } = useNotification();
  const [formData, setFormData] = useState({
    nama: "", email: "", nik: "", telepon: "", posyandu: "", password: "", confirmPassword: "",
  });
  const [step, setStep] = useState("form");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registeredData, setRegisteredData] = useState(null);
  const [selectedPosyandu, setSelectedPosyandu] = useState(null);
  const [puskesmasOptions, setPuskesmasOptions] = useState([]);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  useEffect(() => {
    if (role !== "puskesmas") return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await posyanduService.getPublicPuskesmasList();
        const rows = Array.isArray(res?.data) ? res.data : [];
        const opts = rows.map((i) => ({ id: i.id, name: i.nama_puskesmas })).filter((i) => i.id && i.name);
        if (!cancelled) setPuskesmasOptions(opts);
      } catch { if (!cancelled) setPuskesmasOptions([]); }
    };
    load();
    return () => { cancelled = true; };
  }, [role]);

  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === "nik") val = formatNikInput(val);
    else if (e.target.name === "telepon") val = formatPhoneInput(val);
    setFormData({ ...formData, [e.target.name]: val });
    setErrorMessage("");
  };

  const getRoleTitle = () => {
    if (role === "dinkes") return "Staf Dinas Kesehatan";
    if (role === "puskesmas") return "Staf Puskesmas";
    return "Kader Posyandu";
  };

  const getVerifierTitle = () => (role === "dinkes" ? "Admin Dinas Kesehatan" : "Admin Puskesmas");

  const mapRoleParam = () => {
    if (role === "dinkes") return "dinkes";
    if (role === "puskesmas") return "puskesmas";
    return "kader";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.nama || formData.nama.trim().length < 2) { setErrorMessage("Nama lengkap wajib diisi minimal 2 karakter!"); return; }
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) { setErrorMessage(emailCheck.message); return; }
    const nikCheck = validateNik(formData.nik);
    if (!nikCheck.isValid) { setErrorMessage(nikCheck.message); return; }
    const phoneCheck = validatePhone(formData.telepon);
    if (!phoneCheck.isValid) { setErrorMessage(phoneCheck.message); return; }
    if (role === "kader" && (!formData.posyandu || !formData.posyandu.trim())) { setErrorMessage("Silakan pilih Wilayah Posyandu Anda!"); return; }
    if (role === "puskesmas" && (!formData.posyandu || !formData.posyandu.trim())) { setErrorMessage("Silakan pilih Puskesmas tempat Anda bertugas!"); return; }
    const passCheck = validatePassword(formData.password, formData.confirmPassword);
    if (!passCheck.isValid) { setErrorMessage(passCheck.message); return; }
    setIsLoading(true);
    const selectedPuskesmas = role === "puskesmas" ? puskesmasOptions.find((i) => String(i.id) === String(formData.posyandu)) : null;
    const payload = {
      role: mapRoleParam(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      nama_lengkap: formData.nama.trim(),
      telepon: formData.telepon.trim(),
      nik: formData.nik.trim(),
      ...(role === "kader" && selectedPosyandu?.id ? { posyandu_id: Number(selectedPosyandu.id) } : {}),
      ...(role === "puskesmas" && formData.posyandu ? { puskesmas_id: Number(selectedPuskesmas?.id) } : {}),
    };
    if (role === "kader" && !payload.posyandu_id) { setErrorMessage("Posyandu yang dipilih tidak valid. Silakan pilih kembali dari daftar."); setIsLoading(false); return; }
    if (role === "puskesmas" && !payload.puskesmas_id) { setErrorMessage("Puskesmas yang dipilih tidak valid. Silakan pilih kembali dari daftar."); setIsLoading(false); return; }
    try {
      const response = await authService.register(payload);
      setRegisteredData(response?.data || null);
      setStep("otp_verification");
      setOtpMessage("Registrasi berhasil. Kode OTP verifikasi telah dikirimkan ke email Anda.");
    } catch (err) {
      setErrorMessage(err.message || "Registrasi gagal. Periksa data dan koneksi ke backend.");
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(""); setOtpMessage("");
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) { setErrorMessage("Kode OTP harus terdiri dari 6 digit angka."); return; }
    setIsVerifyingOtp(true);
    try {
      await authService.verifyOtp({ email: formData.email.trim().toLowerCase(), otp_code: cleanOtp, purpose: "register" });
      if (showSuccess) showSuccess("Verifikasi OTP Berhasil", "Email Anda berhasil diverifikasi! Akun kini menunggu persetujuan Admin.");
      setStep("pending_approval");
    } catch (err) {
      setErrorMessage(err.message || "Kode OTP tidak valid atau sudah kedaluwarsa.");
    } finally { setIsVerifyingOtp(false); }
  };

  const handleResendOtp = async () => {
    setErrorMessage(""); setOtpMessage(""); setIsResendingOtp(true);
    try {
      const res = await authService.resendOtp({ email: formData.email.trim().toLowerCase(), purpose: "register" });
      setOtpMessage(res?.message || "Kode OTP baru telah dikirimkan ke email Anda.");
      if (showInfo) showInfo("OTP Dikirim", "Kode OTP baru telah dikirimkan ke email Anda.");
    } catch (err) {
      setErrorMessage(err.message || "Gagal meminta kode OTP baru. Silakan coba beberapa saat lagi.");
    } finally { setIsResendingOtp(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-screen-wrapper">
        <div className="auth-main-card">
          {/* ══════════════════════════════════════════════
              PANEL KIRI: Visual Biru 3D Universal
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

              {/* Teks Sambutan */}
              <div style={{ margin: "auto 0", paddingTop: "20px", paddingBottom: "20px" }}>
                <div className="mb-3 d-inline-flex p-2 bg-white rounded-4 shadow-sm" style={{ backdropFilter: "blur(8px)" }}>
                  <img src={logoSengkuyung} alt="Sengkuyung Katresnan" style={{ width: "68px", height: "68px", objectFit: "contain" }} />
                </div>
                <h1 className="auth-hero-title">PENDAFTARAN AKUN</h1>
                <div className="auth-hero-appname">
                  {getRoleTitle()}
                </div>
                <p className="auth-hero-subtitle">
                  Bergabung bersama ekosistem layanan kesehatan digital berbasis Integrasi Layanan Primer (ILP) Kota Yogyakarta.
                </p>
              </div>

              {/* Footer */}
              <div className="auth-left-badge-footer">
                <ShieldCheck size={17} style={{ color: "#cbd5e1" }} />
                <span>Pendaftaran Resmi Terverifikasi · Dinas Kesehatan &amp; Puskesmas</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              PANEL KANAN: Formulir Pendaftaran (Bahasa Indonesia)
          ══════════════════════════════════════════════ */}
          <div className="auth-right-panel">
            <div className="auth-right-top-bar">
              <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#475569" }}>
                Pendaftaran {getRoleTitle()}
              </span>
              <button type="button" className="auth-back-link" onClick={onGoToLogin}>
                <ArrowLeft size={14} /> Kembali ke Masuk
              </button>
            </div>

            {/* LANGKAH 1: FORMULIR */}
            {step === "form" && (
              <>
                <h2 className="auth-right-title">Daftar Akun Baru</h2>
                <p className="auth-right-desc">
                  Lengkapi data diri Anda untuk pendaftaran resmi <strong>{getRoleTitle()}</strong>.
                </p>

                {errorMessage && (
                  <div className="auth-alert-box">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Nama Lengkap */}
                  <div className="auth-input-pill">
                    <span className="auth-input-pill-icon"><User size={16} /></span>
                    <input
                      type="text"
                      name="nama"
                      className="auth-field-input"
                      placeholder="Nama Lengkap"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email */}
                  <div className="auth-input-pill">
                    <span className="auth-input-pill-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      name="email"
                      className="auth-field-input"
                      placeholder="Alamat Email Aktif"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* NIK & Telepon */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="auth-input-pill">
                      <span className="auth-input-pill-icon"><CreditCard size={16} /></span>
                      <input
                        type="text"
                        name="nik"
                        maxLength={16}
                        className="auth-field-input"
                        placeholder="16 Digit NIK"
                        value={formData.nik}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="auth-input-pill">
                      <span className="auth-input-pill-icon"><Phone size={16} /></span>
                      <input
                        type="text"
                        name="telepon"
                        className="auth-field-input"
                        placeholder="No. WhatsApp / HP"
                        value={formData.telepon}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Posyandu / Puskesmas */}
                  {role === "puskesmas" ? (
                    <div className="auth-input-pill">
                      <span className="auth-input-pill-icon"><Building2 size={16} /></span>
                      <select
                        name="posyandu"
                        className="auth-select-pill"
                        value={formData.posyandu}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                      >
                        <option value="">-- Pilih Puskesmas Tempat Bertugas --</option>
                        {puskesmasOptions.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : role === "kader" ? (
                    <div style={{ marginBottom: "12px" }}>
                      <SearchablePosyanduSelect
                        name="posyandu"
                        placeholder="Pilih / Cari Wilayah Posyandu..."
                        value={formData.posyandu}
                        onChange={handleChange}
                        onSelectPosyandu={(item) => setSelectedPosyandu(item)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  ) : null}

                  {/* Password & Confirm Password */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="auth-input-pill">
                      <span className="auth-input-pill-icon"><Lock size={16} /></span>
                      <input
                        type="password"
                        name="password"
                        className="auth-field-input"
                        placeholder="Kata Sandi (Min 8)"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="auth-input-pill">
                      <span className="auth-input-pill-icon"><Lock size={16} /></span>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="auth-field-input"
                        placeholder="Ulangi Sandi"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        <span>Mendaftarkan akun...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar Sekarang</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="auth-bottom-switch">
                    Sudah memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={onGoToLogin}
                    >
                      Masuk ke Sistem
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* LANGKAH 2: VERIFIKASI OTP */}
            {step === "otp_verification" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(37, 99, 235, 0.12)", color: "#1d4ed8", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <KeyRound size={28} />
                </div>
                <h2 className="auth-right-title" style={{ fontSize: "1.8rem" }}>Verifikasi Kode OTP</h2>
                <p className="auth-right-desc">
                  Masukkan 6 digit kode yang telah dikirim ke email <strong>{formData.email}</strong>
                </p>

                {errorMessage && (
                  <div className="auth-alert-box">
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {otpMessage && (
                  <div className="auth-success-box">
                    <CheckCircle2 size={16} />
                    <span>{otpMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <div style={{ marginBottom: "22px" }}>
                    <input
                      type="text"
                      maxLength={6}
                      className="auth-otp-field"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      required
                      disabled={isVerifyingOtp}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={isVerifyingOtp || otpCode.length !== 6}
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <span>Verifikasi &amp; Lanjutkan</span>
                    )}
                  </button>

                  <div style={{ marginTop: "18px" }}>
                    <button
                      type="button"
                      style={{ border: "none", background: "transparent", color: "#1d4ed8", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                      onClick={handleResendOtp}
                      disabled={isResendingOtp}
                    >
                      {isResendingOtp ? "Mengirim ulang..." : "Belum menerima kode OTP? Kirim Ulang"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LANGKAH 3: MENUNGGU PERSETUJUAN */}
            {step === "pending_approval" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.12)", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <CheckCircle2 size={30} />
                </div>
                <h2 className="auth-right-title" style={{ fontSize: "1.8rem" }}>Pendaftaran Selesai!</h2>
                <p className="auth-right-desc">
                  Akun Anda sedang dalam proses verifikasi oleh <strong>{getVerifierTitle()}</strong>. Notifikasi persetujuan akan dikirimkan ke email Anda.
                </p>
                <button
                  type="button"
                  className="auth-btn-primary"
                  onClick={onGoToLogin}
                >
                  Kembali ke Halaman Masuk
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
