import React, { useEffect, useState } from 'react';
import { 
  HeartHandshake, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CreditCard, 
  Building2, 
  Clock, 
  Inbox, 
  Send, 
  CheckCircle,
  FileText,
  Shield,
  Sparkles
} from 'lucide-react';
import { posyanduService, authService } from '../../services';
import { puskesmasList } from '../../data/mockData';

import { validateNik, formatNikInput, validatePhone, formatPhoneInput, validateEmail, validatePassword } from '../../utils/validators';
import { useNotification } from '../../context/NotificationContext';
import SearchablePosyanduSelect from '../../components/common/SearchablePosyanduSelect';
import logoJogja from '../../assets/logo_jogja.png';
import logoKemenkes from '../../assets/logo_kemenkes.png';
import logoPosyandu from '../../assets/logo_posyandu.png';

export default function RegisterPage({ role = 'kader', onRegisterSuccess, onGoToLogin }) {
  const { showSuccess, showWarning, showInfo } = useNotification();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nik: '',
    telepon: '',
    posyandu: '',
    bidang: '',
    password: '',
    confirmPassword: ''
  });

  // State flow: 'form' | 'pending_approval'
  const [step, setStep] = useState('form');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredData, setRegisteredData] = useState(null);
  const [selectedPosyandu, setSelectedPosyandu] = useState(null);
  const [puskesmasOptions, setPuskesmasOptions] = useState([]);

  useEffect(() => {
    if (role !== 'puskesmas') return;
    let cancelled = false;
    if (!localStorage.getItem('token')) {
      setPuskesmasOptions(puskesmasList.map((name, index) => ({ id: index + 1, name })));
      return () => { cancelled = true; };
    }
    posyanduService.getPosyanduList({ page: 1, limit: 1000 })
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : [];
        const byId = new Map();
        rows.forEach((item) => {
          const id = item.puskesmas_id || item.puskesmas?.id;
          const name = item.puskesmas?.nama_puskesmas || item.puskesmas || '';
          if (id && name && !byId.has(String(id))) byId.set(String(id), { id, name });
        });
        if (!cancelled) {
          setPuskesmasOptions(
            byId.size ? [...byId.values()] : puskesmasList.map((name, index) => ({ id: index + 1, name }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPuskesmasOptions(puskesmasList.map((name, index) => ({ id: index + 1, name })));
        }
      });
    return () => { cancelled = true; };
  }, [role]);

  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'nik') {
      val = formatNikInput(val);
    } else if (e.target.name === 'telepon') {
      val = formatPhoneInput(val);
    }
    setFormData({ ...formData, [e.target.name]: val });
    setErrorMessage('');
  };

  const getRoleTitle = () => {
    if (role === 'dinkes') return 'Staf Dinas Kesehatan';
    if (role === 'puskesmas') return 'Staf Puskesmas';
    return 'Kader Posyandu';
  };

  const getVerifierTitle = () => {
    if (role === 'dinkes') return 'Admin Dinas Kesehatan';
    return 'Admin Puskesmas';
  };

  const mapRoleParam = () => {
    if (role === 'dinkes') return 'dinkes';
    if (role === 'puskesmas') return 'puskesmas';
    return 'kader';
  };

  // Submit Registrasi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validasi Nama
    if (!formData.nama || formData.nama.trim().length < 2) {
      setErrorMessage("Nama lengkap wajib diisi minimal 2 karakter!");
      return;
    }

    // 2. Validasi Email
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.message);
      return;
    }

    // 3. Validasi NIK (Harus tepat 16 digit angka)
    const nikCheck = validateNik(formData.nik);
    if (!nikCheck.isValid) {
      setErrorMessage(nikCheck.message);
      return;
    }

    // 4. Validasi Telepon
    const phoneCheck = validatePhone(formData.telepon);
    if (!phoneCheck.isValid) {
      setErrorMessage(phoneCheck.message);
      return;
    }

    // 5. Validasi Instansi / Wilayah
    if (role === 'kader' && (!formData.posyandu || !formData.posyandu.trim())) {
      setErrorMessage("Silakan pilih Wilayah Posyandu Anda!");
      return;
    }
    if (role === 'puskesmas' && (!formData.posyandu || !formData.posyandu.trim())) {
      setErrorMessage("Silakan pilih Puskesmas tempat Anda bertugas!");
      return;
    }
    if (role === 'dinkes' && (!formData.bidang || !formData.bidang.trim())) {
      setErrorMessage("Silakan pilih Bidang Penugasan Anda!");
      return;
    }

    // 6. Validasi Password
    const passCheck = validatePassword(formData.password, formData.confirmPassword);
    if (!passCheck.isValid) {
      setErrorMessage(passCheck.message);
      return;
    }

    setIsLoading(true);

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    const newRecord = {
      id: Date.now(),
      nama: formData.nama.trim(),
      namaPetugas: formData.nama.trim(),
      initials: formData.nama.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      nik: formData.nik.trim(),
      email: formData.email.trim(),
      telepon: formData.telepon.trim(),
      role: mapRoleParam(),
      posyandu: role === 'kader' ? formData.posyandu : (role === 'dinkes' ? 'Dinas Kesehatan Kota' : (formData.posyandu || 'Puskesmas Sukamaju')),
      rw: role === 'kader' ? 'RW 01' : '',
      bidangJabatan: role === 'puskesmas' ? 'Petugas Layanan Puskesmas' : (role === 'dinkes' ? formData.bidang : 'Kader Posyandu'),
      unitKategori: role === 'puskesmas' ? 'Layanan Puskesmas' : (role === 'dinkes' ? formData.bidang : 'Posyandu'),
      puskesmas: role === 'dinkes' ? 'Dinas Kesehatan' : 'Puskesmas Sukamaju',
      tglDaftar: formattedDate,
      status: 'pending' // Menunggu Persetujuan Admin Terkait
    };

    const payload = {
      role: mapRoleParam(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      nama_lengkap: formData.nama.trim(),
      telepon: formData.telepon.trim(),
      nik: formData.nik.trim(),
      ...(role === 'kader' && selectedPosyandu?.id ? { posyandu_id: Number(selectedPosyandu.id) } : {}),
      ...(role === 'puskesmas' && formData.posyandu ? {
        puskesmas_id: Number(puskesmasOptions.find((item) => item.name === formData.posyandu)?.id)
      } : {})
    };

    if (role === 'kader' && !payload.posyandu_id) {
      setErrorMessage('Posyandu yang dipilih tidak valid. Silakan pilih kembali dari daftar.');
      setIsLoading(false);
      return;
    }
    if (role === 'puskesmas' && !payload.puskesmas_id) {
      setErrorMessage('Puskesmas yang dipilih tidak valid. Silakan pilih kembali dari daftar.');
      setIsLoading(false);
      return;
    }

    try {
      await authService.register(payload);
      setRegisteredData({ ...newRecord, status: 'pending_approval' });
      setStep('pending_approval');
    } catch (err) {
      setErrorMessage(err.message || 'Registrasi gagal. Periksa data dan koneksi ke backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Approval is handled by the backend admin workflow.
  const handleBackToLogin = () => {
    if (onRegisterSuccess) onRegisterSuccess();
  };


  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-white">
      
      {/* LEFT COLUMN: HERO SECTION */}
      <div 
        className="col-12 col-lg-5 col-xl-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden"
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
            REGISTRASI AKUN RESMI
          </div>

          <h1 className="fw-bold text-white mb-3" style={{ fontSize: '2.4rem', lineHeight: '1.2', letterSpacing: '-0.03em' }}>
            Bergabung Bersama Transformasi<br />
            <span style={{ 
              background: 'linear-gradient(90deg, #2dd4bf 0%, #38bdf8 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}>
              Layanan Posyandu
            </span>
          </h1>

          <p className="text-light mb-4" style={{ lineHeight: '1.65', fontSize: '0.95rem', color: '#cbd5e1' }}>
            Daftarkan akun petugas kader, staf puskesmas pembina, atau dinas kesehatan untuk pencatatan dan pelaporan kesehatan terpadu.
          </p>

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
                <div className="fw-bolder fs-5 mb-1" style={{ color: '#2dd4bf' }}>Otorisasi</div>
                <div className="small" style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  Diverifikasi Pembina Wilayah
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
                <div className="fw-bolder fs-5 mb-1" style={{ color: '#38bdf8' }}>Keamanan</div>
                <div className="small" style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  Akses Terenkripsi &amp; Aman
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
                <div className="fw-bolder fs-5 mb-1" style={{ color: '#a7f3d0' }}>Real-Time</div>
                <div className="small" style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  Sinkronisasi Otomatis
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
            <span className="text-white-50">Sistem Registrasi Terverifikasi Instansi</span>
          </div>
          <span className="text-white-50">Dinas Kesehatan &amp; Puskesmas</span>
        </div>
      </div>

      {/* RIGHT COLUMN: REGISTRATION FORM SECTION */}
      <div 
        className="col-12 col-lg-7 col-xl-6 d-flex flex-column justify-content-between p-4 p-md-5 overflow-auto"
        style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}
      >
        {/* Top Header Bar */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2.5">
            <img src={logoPosyandu} alt="Posyandu Care" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            <span className="fw-bold text-dark fs-5">Posyandu Care</span>
          </div>

          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.785rem' }}
            onClick={onGoToLogin}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Login</span>
          </button>
        </div>

        {/* Center Register Form Card */}
        <div className="my-auto mx-auto w-100" style={{ maxWidth: '500px' }}>
          <div 
            className="card border bg-white p-4 p-md-4"
            style={{ 
              borderRadius: '24px', 
              borderColor: '#e2e8f0', 
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.02)' 
            }}
          >
        
        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="mb-3.5">
              <h4 className="fw-bold text-dark mb-1.5" style={{ letterSpacing: '-0.02em', fontSize: '1.3rem' }}>
                Daftar sebagai {getRoleTitle()}
              </h4>
              <p className="text-muted small mb-0" style={{ fontSize: '0.825rem', lineHeight: '1.45' }}>
                Lengkapi formulir di bawah ini untuk pendaftaran akun yang akan diverifikasi oleh {getVerifierTitle()}.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center gap-2 small mb-3" style={{ fontSize: '0.82rem' }}>
                <AlertCircle size={15} className="flex-shrink-0 text-danger" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              
              {/* Nama Lengkap & Gelar */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                  Nama Lengkap &amp; Gelar
                </label>
                <div className="input-group" style={{ height: '44px' }}>
                  <span 
                    className="input-group-text border-end-0 text-secondary"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderColor: '#dbe5ee', 
                      borderTopLeftRadius: '10px', 
                      borderBottomLeftRadius: '10px' 
                    }}
                  >
                    <User size={16} />
                  </span>
                  <input 
                    type="text" 
                    name="nama"
                    className="form-control border-start-0 text-dark shadow-none" 
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Contoh: dr. Sarah Amanda"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderColor: '#dbe5ee', 
                      borderTopRightRadius: '10px', 
                      borderBottomRightRadius: '10px',
                      fontSize: '0.875rem' 
                    }}
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Alamat Email */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                  Alamat Email
                </label>
                <div className="input-group" style={{ height: '44px' }}>
                  <span 
                    className="input-group-text border-end-0 text-secondary"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderColor: '#dbe5ee', 
                      borderTopLeftRadius: '10px', 
                      borderBottomLeftRadius: '10px' 
                    }}
                  >
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email" 
                    name="email"
                    className="form-control border-start-0 text-dark shadow-none" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@gmail.com"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderColor: '#dbe5ee', 
                      borderTopRightRadius: '10px', 
                      borderBottomRightRadius: '10px',
                      fontSize: '0.875rem' 
                    }}
                    required 
                    disabled={isLoading}
                  />
                </div>
                <div className="text-muted mt-1" style={{ fontSize: '0.73rem' }}>
                  *Notifikasi persetujuan akun dari {getVerifierTitle()} akan dikirimkan ke email ini.
                </div>
              </div>

              {/* NIK & Telepon */}
              <div className="row g-2.5 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                    NIK (16 Digit)
                  </label>
                  <div className="input-group" style={{ height: '44px' }}>
                    <span 
                      className="input-group-text border-end-0 text-secondary"
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopLeftRadius: '10px', 
                        borderBottomLeftRadius: '10px' 
                      }}
                    >
                      <CreditCard size={15} />
                    </span>
                    <input 
                      type="text" 
                      name="nik"
                      maxLength={16}
                      className="form-control border-start-0 text-dark shadow-none" 
                      value={formData.nik}
                      onChange={handleChange}
                      placeholder="16 digit NIK"
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopRightRadius: '10px', 
                        borderBottomRightRadius: '10px',
                        fontSize: '0.875rem' 
                      }}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                    Nomor WhatsApp / HP
                  </label>
                  <div className="input-group" style={{ height: '44px' }}>
                    <span 
                      className="input-group-text border-end-0 text-secondary"
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopLeftRadius: '10px', 
                        borderBottomLeftRadius: '10px' 
                      }}
                    >
                      <Phone size={15} />
                    </span>
                    <input 
                      type="text" 
                      name="telepon"
                      className="form-control border-start-0 text-dark shadow-none" 
                      value={formData.telepon}
                      onChange={handleChange}
                      placeholder="0812xxxxxxxx"
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopRightRadius: '10px', 
                        borderBottomRightRadius: '10px',
                        fontSize: '0.875rem' 
                      }}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Posyandu / Puskesmas / Bidang */}
              {role === 'dinkes' ? (
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                    Bidang Penugasan
                  </label>
                  <div className="input-group" style={{ height: '44px' }}>
                    <span 
                      className="input-group-text border-end-0 text-secondary"
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopLeftRadius: '10px', 
                        borderBottomLeftRadius: '10px' 
                      }}
                    >
                      <Building2 size={16} />
                    </span>
                    <select 
                      name="bidang"
                      className="form-select border-start-0 text-dark shadow-none"
                      value={formData.bidang}
                      onChange={handleChange}
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopRightRadius: '10px', 
                        borderBottomRightRadius: '10px',
                        fontSize: '0.875rem' 
                      }}
                      disabled={isLoading}
                    >
                      <option value="">-- Pilih Bidang Penugasan --</option>
                      <option value="Bidang Kesmas (Kesehatan Masyarakat)">Bidang Kesmas (Kesehatan Masyarakat)</option>
                      <option value="Bidang P2P (Pencegahan &amp; Pengendalian Penyakit)">Bidang P2P (Pencegahan &amp; Pengendalian Penyakit)</option>
                      <option value="Bidang Yankes (Pelayanan Kesehatan)">Bidang Yankes (Pelayanan Kesehatan)</option>
                      <option value="Bidang SDK (Sumber Daya Kesehatan)">Bidang SDK (Sumber Daya Kesehatan)</option>
                      <option value="Sekretariat / Perencanaan">Sekretariat / Perencanaan</option>
                    </select>
                  </div>
                </div>
              ) : role === 'puskesmas' ? (
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                    Puskesmas
                  </label>
                  <div className="input-group" style={{ height: '44px' }}>
                    <span 
                      className="input-group-text border-end-0 text-secondary"
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopLeftRadius: '10px', 
                        borderBottomLeftRadius: '10px' 
                      }}
                    >
                      <Building2 size={16} />
                    </span>
                    <select 
                      name="posyandu"
                      className="form-select border-start-0 text-dark shadow-none"
                      value={formData.posyandu}
                      onChange={handleChange}
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        borderColor: '#dbe5ee', 
                        borderTopRightRadius: '10px', 
                        borderBottomRightRadius: '10px',
                        fontSize: '0.875rem' 
                      }}
                      disabled={isLoading}
                    >
                      <option value="">-- Pilih Puskesmas --</option>
                      {puskesmasOptions.map((item) => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-1.5 d-flex justify-content-between align-items-center" style={{ fontSize: '0.82rem' }}>
                    <span>Wilayah Posyandu</span>
                    <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>Ketik nama posyandu</span>
                  </label>
                  <SearchablePosyanduSelect
                    name="posyandu"
                    placeholder="Pilih / Cari Wilayah Posyandu (contoh: Melati, Mawar)..."
                    value={formData.posyandu}
                    onChange={handleChange}
                    onSelectPosyandu={(item) => setSelectedPosyandu(item)}
                    disabled={isLoading}
                    required
                  />
                </div>
              )}

              {/* Kata Sandi (Minimal 8 Karakter) */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                  Kata Sandi (Minimal 8 Karakter)
                </label>
                <div className="input-group" style={{ height: '44px' }}>
                  <span 
                    className="input-group-text border-end-0 text-secondary"
                    style={{ 
                      backgroundColor: '#f0f5fa', 
                      borderColor: '#dbe5ee', 
                      borderTopLeftRadius: '10px', 
                      borderBottomLeftRadius: '10px' 
                    }}
                  >
                    <Lock size={16} />
                  </span>
                  <input 
                    type="password" 
                    name="password"
                    className="form-control border-start-0 text-dark shadow-none" 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ 
                      backgroundColor: '#f0f5fa', 
                      borderColor: '#dbe5ee', 
                      borderTopRightRadius: '10px', 
                      borderBottomRightRadius: '10px',
                      fontSize: '0.875rem' 
                    }}
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '0.82rem' }}>
                  Konfirmasi Kata Sandi
                </label>
                <div className="input-group" style={{ height: '44px' }}>
                  <span 
                    className="input-group-text border-end-0 text-secondary"
                    style={{ 
                      backgroundColor: '#f0f5fa', 
                      borderColor: '#dbe5ee', 
                      borderTopLeftRadius: '10px', 
                      borderBottomLeftRadius: '10px' 
                    }}
                  >
                    <Lock size={16} />
                  </span>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    className="form-control border-start-0 text-dark shadow-none" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ 
                      backgroundColor: '#f0f5fa', 
                      borderColor: '#dbe5ee', 
                      borderTopRightRadius: '10px', 
                      borderBottomRightRadius: '10px',
                      fontSize: '0.875rem' 
                    }}
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3.5"
                style={{ 
                  backgroundColor: '#1e293b', 
                  height: '46px', 
                  borderRadius: '10px', 
                  fontSize: '0.9rem' 
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mengajukan Pendaftaran...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* =========================================================================
             HALAMAN MENUNGGU PERSETUJUAN (SIMPEL & CLEAN)
             ========================================================================= */
          <div className="text-center py-2">
            
            {/* Minimalist Clock Icon */}
            <div className="rounded-circle bg-light p-3 d-inline-flex align-items-center justify-content-center mb-3 text-secondary" style={{ width: '64px', height: '64px' }}>
              <Clock size={30} className="text-dark" />
            </div>

            <h2 className="fw-bold text-dark fs-4 mb-2">
              Menunggu Verifikasi
            </h2>
            
            <p className="text-muted small mb-4" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
              Pendaftaran akun Anda sedang ditinjau oleh <strong>{getVerifierTitle()}</strong>. Pemberitahuan aktivasi akan dikirimkan ke email:
            </p>

            {/* Email Container (Clean & Direct) */}
            <div className="p-3 bg-light rounded-3 mb-4 text-center border">
              <div className="text-muted small mb-0.5" style={{ fontSize: '0.75rem' }}>Email Terdaftar</div>
              <div className="fw-bold text-dark font-monospace" style={{ fontSize: '0.95rem' }}>
                {formData.email}
              </div>
            </div>

            {/* Action Buttons */}
            <button 
              type="button" 
              className="btn w-100 text-white fw-bold py-2.5 rounded-3 shadow-sm mb-2"
              style={{ backgroundColor: '#0f172a' }}
              onClick={onGoToLogin}
            >
              Kembali ke Login
            </button>

            <button 
              type="button" 
              className="btn btn-link text-decoration-none text-muted small p-0 mt-2"
              style={{ fontSize: '0.78rem' }}
              onClick={handleBackToLogin}
            >
              Simulasi Setujui Akun (Demo Mode)
            </button>

          </div>
        )}
          </div>
        </div>

        {/* Footer Login Link */}
        {step === 'form' && (
          <div className="text-center pt-2">
            <button 
              type="button" 
              className="btn btn-link p-0 text-decoration-none text-muted small"
              style={{ fontSize: '0.82rem' }}
              onClick={onGoToLogin}
            >
              Sudah memiliki akun terverifikasi? <span className="text-dark fw-bold">Masuk ke Sistem &rarr;</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

