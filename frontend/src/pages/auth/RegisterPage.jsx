import React, { useEffect, useState } from "react";
import {
  HeartHandshake, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  ShieldCheck, Mail, Lock, User, Phone, CreditCard, Building2, KeyRound,
} from "lucide-react";
import { posyanduService, authService } from "../../services";
import { validateNik, formatNikInput, validatePhone, formatPhoneInput, validateEmail, validatePassword } from "../../utils/validators";
import { useNotification } from "../../context/NotificationContext";
import SearchablePosyanduSelect from "../../components/common/SearchablePosyanduSelect";
import logoJogja from "../../assets/logo_jogja.png";
import logoKemenkes from "../../assets/logo_kemenkes.png";
import logoPosyandu from "../../assets/logo_posyandu.png";

/* ─────────────────────────── SHARED CSS ─────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .rg-root {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100dvh;
    display: flex;
  }

  /* ── LEFT PANEL ── */
  .rg-left {
    width: 42%;
    min-height: 100dvh;
    background: linear-gradient(155deg, #0d1b35 0%, #0f2557 50%, #1a3a8f 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.25rem 2.5rem;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  .rg-left::before {
    content: '';
    position: absolute;
    top: -120px; left: -80px;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .rg-left::after {
    content: '';
    position: absolute;
    bottom: -80px; right: -60px;
    width: 380px; height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(147,197,253,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .rg-logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.96);
    padding: 7px 14px;
    border-radius: 100px;
    height: 42px;
  }
  .rg-logo-sep { width: 1px; height: 18px; background: #cbd5e1; }

  .rg-ilp-badge {
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
  .rg-ilp-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #60a5fa;
    box-shadow: 0 0 10px rgba(96,165,250,0.8);
    flex-shrink: 0;
  }

  .rg-eyebrow {
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: #60a5fa; margin-bottom: 14px;
  }
  .rg-headline {
    font-family: 'Outfit', sans-serif;
    font-size: 2.6rem; font-weight: 800;
    line-height: 1.1; letter-spacing: -0.03em;
    color: #ffffff; margin: 0 0 8px;
  }
  .rg-headline-accent {
    background: linear-gradient(90deg, #60a5fa 0%, #93c5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
  }
  .rg-body {
    font-size: 0.88rem; font-weight: 400;
    line-height: 1.65; color: #94a3b8;
    max-width: 380px; margin-bottom: 28px;
  }

  .rg-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .rg-stat-card {
    background: rgba(255,255,255,0.065);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 14px;
    padding: 14px 12px 12px;
    transition: border-color 0.2s;
  }
  .rg-stat-card:hover { border-color: rgba(96,165,250,0.25); }
  .rg-stat-val {
    font-size: 1.25rem; font-weight: 800;
    letter-spacing: -0.03em; line-height: 1; margin-bottom: 5px;
  }
  .rg-stat-desc { font-size: 0.67rem; color: #94a3b8; line-height: 1.35; }

  .rg-left-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 18px;
    border-top: 1px solid rgba(255,255,255,0.10);
    font-size: 0.74rem; color: #64748b;
    position: relative; z-index: 1;
  }

  /* ── RIGHT PANEL ── */
  .rg-right {
    flex: 1;
    min-height: 100dvh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 2rem 2.5rem;
  }

  .rg-topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0; flex-shrink: 0;
  }

  .rg-brand { display: flex; align-items: center; gap: 10px; }
  .rg-brand-name {
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    letter-spacing: -0.01em; color: #0f172a;
  }
  .rg-brand-sub { font-size: 0.7rem; font-weight: 500; color: #64748b; }

  .rg-back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 14px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.78rem; font-weight: 500; color: #64748b;
    cursor: pointer; transition: all 0.15s;
  }
  .rg-back-btn:hover { border-color: #cbd5e1; color: #0f172a; background: #f8fafc; }

  /* ── FORM AREA ── */
  .rg-form-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 1.5rem 0;
  }

  .rg-card {
    background: #ffffff;
    border: 1px solid #e8edf3;
    border-radius: 20px;
    padding: 2.25rem 2rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    width: 100%;
    max-width: 480px;
  }

  .rg-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.75rem; font-weight: 800;
    letter-spacing: -0.04em; line-height: 1.1;
    color: #0f172a; margin: 0 0 6px;
  }
  .rg-subtitle {
    font-size: 0.83rem; font-weight: 400;
    color: #64748b; line-height: 1.55; margin: 0 0 20px;
  }

  /* ── FORM FIELDS ── */
  .rg-field { margin-bottom: 14px; }
  .rg-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.77rem; font-weight: 600;
    color: #374151; letter-spacing: 0.01em;
    display: block; margin-bottom: 6px;
  }
  .rg-label-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  .rg-input-wrap {
    position: relative; display: flex; align-items: center;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: #fafbfc;
    transition: border-color 0.15s, box-shadow 0.15s;
    overflow: hidden;
  }
  .rg-input-wrap:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    background: #ffffff;
  }
  .rg-input-icon {
    padding: 0 11px; color: #94a3b8;
    display: flex; align-items: center; flex-shrink: 0;
  }
  .rg-input {
    flex: 1; height: 44px; border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem; font-weight: 400; color: #0f172a;
    outline: none; padding: 0;
    min-width: 0;
  }
  .rg-input::placeholder { color: #b0bcc8; font-weight: 400; }
  .rg-input:disabled { color: #94a3b8; }
  .rg-select {
    flex: 1; height: 44px; border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem; color: #0f172a;
    outline: none; padding: 0 10px 0 0; cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  /* ── OTP INPUT ── */
  .rg-otp-input {
    width: 100%; height: 58px;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    background: #fafbfc;
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem; font-weight: 700;
    letter-spacing: 0.45em;
    text-align: center; color: #0f172a;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .rg-otp-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    background: #ffffff;
  }

  /* ── ERROR / SUCCESS ALERTS ── */
  .rg-error {
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 10px; padding: 10px 14px;
    font-size: 0.81rem; font-weight: 500; color: #dc2626;
    margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 8px;
  }
  .rg-success {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 10px 14px;
    font-size: 0.81rem; font-weight: 500; color: #16a34a;
    margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  /* ── SUBMIT BUTTON ── */
  .rg-submit {
    width: 100%; height: 48px;
    background: #0f172a; color: #ffffff;
    border: none; border-radius: 11px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.92rem; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background 0.15s, transform 0.1s;
    margin-bottom: 14px;
  }
  .rg-submit:hover:not(:disabled) { background: #1e293b; }
  .rg-submit:active:not(:disabled) { transform: translateY(1px) scale(0.99); }
  .rg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── LINK BUTTON ── */
  .rg-link-btn {
    background: none; border: none; padding: 0; cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 0.81rem; color: #64748b;
    transition: color 0.15s;
    text-decoration: none;
  }
  .rg-link-btn strong { color: #0f172a; font-weight: 700; }
  .rg-link-btn:hover { color: #0f172a; }

  .rg-otp-resend {
    background: none; border: none; padding: 0; cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 0.79rem; font-weight: 500; color: #3b82f6;
    transition: opacity 0.15s;
  }
  .rg-otp-resend:hover:not(:disabled) { opacity: 0.75; }
  .rg-otp-resend:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── PENDING STATE ── */
  .rg-icon-circle {
    width: 64px; height: 64px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }
  .rg-email-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: #f1f5f9; border: 1px solid #e2e8f0;
    border-radius: 100px; padding: 8px 16px;
    font-size: 0.88rem; font-weight: 600; color: #0f172a;
    font-family: monospace;
    margin-bottom: 24px;
  }

  /* ── FOOTNOTE ── */
  .rg-hint { font-size: 0.71rem; color: #94a3b8; margin-top: 4px; }

  /* ── ROW FIELDS ── */
  .rg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 480px) { .rg-row { grid-template-columns: 1fr; } }

  /* ── RIGHT FOOTER ── */
  .rg-footer {
    text-align: center;
    font-size: 0.72rem; color: #94a3b8;
    font-family: 'Outfit', sans-serif;
    flex-shrink: 0; padding-top: 1rem;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1023px) {
    .rg-left { display: none !important; }
    .rg-right { padding: 1.5rem 1.25rem; }
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.9s linear infinite; }
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

  const handleBackToLogin = () => { if (onRegisterSuccess) onRegisterSuccess(); };

  return (
    <>
      <style>{CSS}</style>
      <div className="rg-root">

        {/* ════════════════════════════════════
            LEFT PANEL — Brand Story
        ════════════════════════════════════ */}
        <div className="rg-left">
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
            <div className="rg-logo-badge">
              <img src={logoJogja} alt="Logo Pemda" style={{ height: "22px", objectFit: "contain" }} />
              <div className="rg-logo-sep" />
              <img src={logoKemenkes} alt="Logo Kemenkes" style={{ height: "15px", objectFit: "contain" }} />
              <div className="rg-logo-sep" />
              <img src={logoPosyandu} alt="Logo Posyandu" style={{ height: "19px", objectFit: "contain" }} />
            </div>
            <div className="rg-ilp-badge">
              <div className="rg-ilp-dot" />
              <span>Integrasi Layanan Primer</span>
            </div>
          </div>

          {/* Center hero */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: "360px" }}>
            <p className="rg-eyebrow">Registrasi Akun Resmi</p>
            <h1 className="rg-headline">
              Bergabung Bersama Transformasi
              <span className="rg-headline-accent">Layanan Posyandu</span>
            </h1>
            <p className="rg-body">
              Daftarkan akun petugas kader, staf puskesmas, atau dinas kesehatan untuk pencatatan dan pelaporan kesehatan terpadu.
            </p>
            <div className="rg-stats">
              <div className="rg-stat-card">
                <div className="rg-stat-val" style={{ color: "#60a5fa" }}>Otorisasi</div>
                <div className="rg-stat-desc">Diverifikasi Pembina Wilayah</div>
              </div>
              <div className="rg-stat-card">
                <div className="rg-stat-val" style={{ color: "#93c5fd" }}>Keamanan</div>
                <div className="rg-stat-desc">Akses Terenkripsi &amp; Aman</div>
              </div>
              <div className="rg-stat-card">
                <div className="rg-stat-val" style={{ color: "#bfdbfe" }}>Real-Time</div>
                <div className="rg-stat-desc">Sinkronisasi Otomatis</div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="rg-left-footer">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={15} style={{ color: "#60a5fa" }} />
              <span>Sistem Registrasi Terverifikasi Instansi</span>
            </div>
            <span>Dinas Kesehatan &amp; Puskesmas</span>
          </div>
        </div>

        {/* ════════════════════════════════════
            RIGHT PANEL — Registration Form
        ════════════════════════════════════ */}
        <div className="rg-right">
          {/* Top bar */}
          <div className="rg-topbar">
            <div className="rg-brand">
              <img src={logoPosyandu} alt="SENGKUYUNG KATRESNAN" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
              <div>
                <div className="rg-brand-name">SENGKUYUNG KATRESNAN</div>
                <div className="rg-brand-sub">Sistem Informasi Posyandu</div>
              </div>
            </div>
            <button type="button" className="rg-back-btn" onClick={onGoToLogin}>
              <ArrowLeft size={13} /> Kembali ke Login
            </button>
          </div>

          {/* Form area */}
          <div className="rg-form-area">
            <div className="rg-card">

              {/* ── STEP: FORM ── */}
              {step === "form" && (
                <>
                  <h2 className="rg-title">Daftar sebagai<br />{getRoleTitle()}</h2>
                  <p className="rg-subtitle">
                    Lengkapi formulir di bawah ini. Akun akan diverifikasi oleh <strong>{getVerifierTitle()}</strong>.
                  </p>

                  {errorMessage && (
                    <div className="rg-error">
                      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Nama Lengkap */}
                    <div className="rg-field">
                      <label className="rg-label" htmlFor="rg-nama">Nama Lengkap &amp; Gelar</label>
                      <div className="rg-input-wrap">
                        <span className="rg-input-icon"><User size={15} /></span>
                        <input id="rg-nama" type="text" name="nama" className="rg-input" value={formData.nama}
                          onChange={handleChange} placeholder="Contoh: dr. Sarah Amanda" required disabled={isLoading} />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="rg-field">
                      <label className="rg-label" htmlFor="rg-email">Alamat Email</label>
                      <div className="rg-input-wrap">
                        <span className="rg-input-icon"><Mail size={15} /></span>
                        <input id="rg-email" type="email" name="email" className="rg-input" value={formData.email}
                          onChange={handleChange} placeholder="nama@gmail.com" required disabled={isLoading} />
                      </div>
                      <div className="rg-hint">*Notifikasi persetujuan dari {getVerifierTitle()} dikirim ke email ini.</div>
                    </div>

                    {/* NIK + Telepon */}
                    <div className="rg-row rg-field">
                      <div>
                        <label className="rg-label" htmlFor="rg-nik">NIK (16 Digit)</label>
                        <div className="rg-input-wrap">
                          <span className="rg-input-icon"><CreditCard size={15} /></span>
                          <input id="rg-nik" type="text" name="nik" maxLength={16} className="rg-input" value={formData.nik}
                            onChange={handleChange} placeholder="16 digit NIK" required disabled={isLoading} />
                        </div>
                      </div>
                      <div>
                        <label className="rg-label" htmlFor="rg-telepon">No. WhatsApp / HP</label>
                        <div className="rg-input-wrap">
                          <span className="rg-input-icon"><Phone size={15} /></span>
                          <input id="rg-telepon" type="text" name="telepon" className="rg-input" value={formData.telepon}
                            onChange={handleChange} placeholder="0812xxxxxxxx" required disabled={isLoading} />
                        </div>
                      </div>
                    </div>

                    {/* Posyandu / Puskesmas */}
                    {role === "puskesmas" ? (
                      <div className="rg-field">
                        <label className="rg-label" htmlFor="rg-puskesmas">Puskesmas</label>
                        <div className="rg-input-wrap">
                          <span className="rg-input-icon"><Building2 size={15} /></span>
                          <select id="rg-puskesmas" name="posyandu" className="rg-select" value={formData.posyandu}
                            onChange={handleChange} disabled={isLoading}>
                            <option value="">-- Pilih Puskesmas --</option>
                            {puskesmasOptions.map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : role === "kader" ? (
                      <div className="rg-field">
                        <label className="rg-label">Wilayah Posyandu</label>
                        <SearchablePosyanduSelect
                          name="posyandu"
                          placeholder="Pilih / Cari nama Posyandu..."
                          value={formData.posyandu}
                          onChange={handleChange}
                          onSelectPosyandu={(item) => setSelectedPosyandu(item)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    ) : null}

                    {/* Password */}
                    <div className="rg-field">
                      <label className="rg-label" htmlFor="rg-password">Kata Sandi (Min. 8 Karakter)</label>
                      <div className="rg-input-wrap">
                        <span className="rg-input-icon"><Lock size={15} /></span>
                        <input id="rg-password" type="password" name="password" className="rg-input" value={formData.password}
                          onChange={handleChange} placeholder="••••••••" required disabled={isLoading} />
                      </div>
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="rg-field" style={{ marginBottom: "20px" }}>
                      <label className="rg-label" htmlFor="rg-confirm">Konfirmasi Kata Sandi</label>
                      <div className="rg-input-wrap">
                        <span className="rg-input-icon"><Lock size={15} /></span>
                        <input id="rg-confirm" type="password" name="confirmPassword" className="rg-input"
                          value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required disabled={isLoading} />
                      </div>
                    </div>

                    <button type="submit" className="rg-submit" disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 size={16} className="spin" /><span>Mengajukan Pendaftaran…</span></>
                      ) : (
                        <><span>Daftar Akun</span><span style={{ fontSize: "1.05em" }}>→</span></>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* ── STEP: OTP ── */}
              {step === "otp_verification" && (
                <div style={{ textAlign: "center" }}>
                  <div className="rg-icon-circle" style={{ background: "rgba(59,130,246,0.1)", color: "#2563eb", margin: "0 auto 16px" }}>
                    <KeyRound size={28} />
                  </div>
                  <h2 className="rg-title" style={{ fontSize: "1.5rem" }}>Verifikasi Kode OTP</h2>
                  <p className="rg-subtitle">
                    Masukkan <strong>6 digit kode OTP</strong> yang telah dikirimkan ke:
                  </p>
                  <div className="rg-email-pill">
                    <Mail size={13} style={{ color: "#3b82f6" }} />
                    <span>{formData.email}</span>
                  </div>

                  {errorMessage && (
                    <div className="rg-error">
                      <AlertCircle size={15} style={{ flexShrink: 0 }} /><span>{errorMessage}</span>
                    </div>
                  )}
                  {otpMessage && (
                    <div className="rg-success">
                      <CheckCircle2 size={15} style={{ flexShrink: 0 }} /><span>{otpMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp}>
                    <div className="rg-field" style={{ marginBottom: "20px" }}>
                      <label className="rg-label" style={{ textAlign: "center" }}>KODE OTP 6-DIGIT</label>
                      <input
                        type="text" maxLength={6} className="rg-otp-input"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        required disabled={isVerifyingOtp} autoFocus
                      />
                    </div>
                    <button type="submit" className="rg-submit" disabled={isVerifyingOtp || otpCode.length !== 6}>
                      {isVerifyingOtp ? (
                        <><Loader2 size={16} className="spin" /><span>Memverifikasi OTP…</span></>
                      ) : (
                        <><span>Verifikasi OTP</span><span style={{ fontSize: "1.05em" }}>→</span></>
                      )}
                    </button>
                    <div style={{ textAlign: "center" }}>
                      <button type="button" className="rg-otp-resend" onClick={handleResendOtp} disabled={isResendingOtp}>
                        {isResendingOtp ? "Mengirim ulang kode…" : "Belum menerima kode OTP? Kirim Ulang"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── STEP: PENDING APPROVAL ── */}
              {step === "pending_approval" && (
                <div style={{ textAlign: "center" }}>
                  <div className="rg-icon-circle" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", margin: "0 auto 16px" }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h2 className="rg-title" style={{ fontSize: "1.5rem" }}>Email Berhasil Diverifikasi!</h2>
                  <p className="rg-subtitle">
                    Pendaftaran akun Anda sedang ditinjau oleh <strong>{getVerifierTitle()}</strong>. Anda akan menerima notifikasi melalui email setelah akun disetujui.
                  </p>
                  <div className="rg-email-pill" style={{ margin: "0 auto 24px" }}>
                    <Mail size={13} style={{ color: "#16a34a" }} />
                    <span>{formData.email}</span>
                  </div>
                  <button type="button" className="rg-submit" onClick={onGoToLogin}>
                    Kembali ke Halaman Login
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Footer login link */}
          {step === "form" && (
            <div className="rg-footer">
              <button type="button" className="rg-link-btn" onClick={onGoToLogin}>
                Sudah memiliki akun? <strong>Masuk ke Sistem →</strong>
              </button>
            </div>
          )}

          {step !== "form" && (
            <div className="rg-footer">
              © 2026 SENGKUYUNG KATRESNAN &nbsp;·&nbsp; Terintegrasi Standar ILP Kemenkes RI
            </div>
          )}
        </div>
      </div>
    </>
  );
}
