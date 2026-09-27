import React, { useState } from 'react';
import { 
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
  Activity,
  Users2,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { daftarPosyandu2026, posyanduList, puskesmasList } from '../../data/mockData';
import { authService } from '../../services';
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

    // Save to localStorage
    try {
      const regUsers = JSON.parse(localStorage.getItem('posyandu_registered_users') || '[]');
      const filtered = regUsers.filter(u => u.email?.toLowerCase() !== newRecord.email.toLowerCase());
      filtered.push(newRecord);
      localStorage.setItem('posyandu_registered_users', JSON.stringify(filtered));

      if (role === 'kader') {
        const kaderList = JSON.parse(localStorage.getItem('posyandu_kader_list') || '[]');
        const filteredKader = kaderList.filter(k => k.email?.toLowerCase() !== newRecord.email.toLowerCase());
        filteredKader.unshift(newRecord);
        localStorage.setItem('posyandu_kader_list', JSON.stringify(filteredKader));
      } else if (role === 'dinkes') {
        const dinkesList = JSON.parse(localStorage.getItem('posyandu_dinkes_staf_list') || '[]');
        const filteredDinkes = dinkesList.filter(s => s.email?.toLowerCase() !== newRecord.email.toLowerCase());
        filteredDinkes.unshift(newRecord);
        localStorage.setItem('posyandu_dinkes_staf_list', JSON.stringify(filteredDinkes));
      } else {
        const stafList = JSON.parse(localStorage.getItem('posyandu_staf_list') || '[]');
        const filteredStaf = stafList.filter(s => s.email?.toLowerCase() !== newRecord.email.toLowerCase());
        filteredStaf.unshift(newRecord);
        localStorage.setItem('posyandu_staf_list', JSON.stringify(filteredStaf));
      }
    } catch (err) {
      console.warn('Gagal menyimpan pendaftaran ke local storage:', err);
    }

    const payload = {
      role: mapRoleParam(),
      email: formData.email.trim(),
      password: formData.password,
      nama_lengkap: formData.nama.trim(),
      telepon: formData.telepon.trim(),
      nik: formData.nik.trim(),
      puskesmas_id: 1,
      posyandu_id: 1
    };

    try {
      await authService.register(payload);
    } catch (err) {
      console.warn('API Register Notice:', err);
    } finally {
      setIsLoading(false);
      setRegisteredData(newRecord);
      setStep('pending_approval');
    }
  };

  // Simulasi Persetujuan Langsung oleh Admin Terkait (untuk kebutuhan testing/demo)
  const handleSimulateApproval = () => {
    if (!registeredData) return;

    try {
      // 1. Update registered users
      const regUsers = JSON.parse(localStorage.getItem('posyandu_registered_users') || '[]');
      const updatedReg = regUsers.map(u => u.email?.toLowerCase() === registeredData.email.toLowerCase() ? { ...u, status: 'active' } : u);
      localStorage.setItem('posyandu_registered_users', JSON.stringify(updatedReg));

      // 2. Update role-specific list
      if (role === 'kader') {
        const kaderList = JSON.parse(localStorage.getItem('posyandu_kader_list') || '[]');
        const updatedKader = kaderList.map(k => k.email?.toLowerCase() === registeredData.email.toLowerCase() ? { ...k, status: 'active' } : k);
        localStorage.setItem('posyandu_kader_list', JSON.stringify(updatedKader));
      } else if (role === 'dinkes') {
        const dinkesList = JSON.parse(localStorage.getItem('posyandu_dinkes_staf_list') || '[]');
        const updatedDinkes = dinkesList.map(s => s.email?.toLowerCase() === registeredData.email.toLowerCase() ? { ...s, status: 'active' } : s);
        localStorage.setItem('posyandu_dinkes_staf_list', JSON.stringify(updatedDinkes));
      } else {
        const stafList = JSON.parse(localStorage.getItem('posyandu_staf_list') || '[]');
        const updatedStaf = stafList.map(s => s.email?.toLowerCase() === registeredData.email.toLowerCase() ? { ...s, status: 'active' } : s);
        localStorage.setItem('posyandu_staf_list', JSON.stringify(updatedStaf));
      }
    } catch (e) {
      console.warn('Simulasi error', e);
    }

    showSuccess(
      "Akun Berhasil Disetujui & Diaktifkan!",
      `Simulasi: ${getVerifierTitle()} telah menyetujui akun Anda. Email pemberitahuan aktivasi telah dikirimkan ke "${registeredData.email}". Anda sekarang dapat langsung masuk.`,
      {
        confirmText: "Masuk ke Sistem Sekarang",
        onConfirm: () => {
          if (onRegisterSuccess) onRegisterSuccess();
        }
      }
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
      
      {/* LEFT COLUMN: EDITORIAL INSTITUTIONAL HERO */}
      <div 
        className="col-12 col-lg-5 col-xl-5 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 20% 0%, #064e3b 0%, #042f2e 50%, #021a17 100%)',
          minHeight: '100vh',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Ambient Grid Overlay */}
        <div 
          className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Header: Institutional Identity & Indicator */}
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
            <span className="text-teal-200 fw-medium" style={{ color: '#99f6e4' }}>
              Registrasi Resmi
            </span>
          </div>
        </div>

        {/* Center Editorial Hero Content */}
        <div className="my-auto py-5 z-1" style={{ maxWidth: '480px' }}>
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
              Registrasi Akun Baru
            </span>
          </div>

          <h1 className="fw-bold text-white mb-3" style={{ fontSize: '2.1rem', lineHeight: '1.24', letterSpacing: '-0.03em' }}>
            Aktivasi Akses Petugas &amp; Kader Kesehatan
          </h1>

          <p className="mb-4" style={{ lineHeight: '1.65', fontSize: '0.925rem', color: '#94a3b8' }}>
            Daftarkan diri Anda untuk mengelola pencatatan siklus hidup, skrining ILP berkala, dan rekapitulasi data posyandu terintegrasi.
          </p>

          <div className="d-flex flex-column gap-2.5">
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
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: '0.875rem' }}>Verifikasi Berlapis Instansi</div>
                <div style={{ color: '#94a3b8', fontSize: '0.775rem' }}>Divalidasi langsung oleh {getVerifierTitle()} wilayah kerja</div>
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
                <Activity size={18} />
              </div>
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: '0.875rem' }}>Akses Sesuai Wewenang</div>
                <div style={{ color: '#94a3b8', fontSize: '0.775rem' }}>Hak akses otomatis terkonfigurasi untuk peran {getRoleTitle()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div 
          className="d-flex align-items-center justify-content-between z-1 pt-3 border-top" 
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontSize: '0.8rem' }}
        >
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={16} style={{ color: '#2dd4bf' }} />
            <span style={{ color: '#cbd5e1' }}>Sistem Registrasi Terverifikasi Instansi</span>
          </div>
          <span style={{ color: '#64748b' }}>Kemenkes RI</span>
        </div>
      </div>

      {/* RIGHT COLUMN: FORM CONTAINER */}
      <div 
        className="col-12 col-lg-7 col-xl-7 d-flex flex-column justify-content-between p-4 p-md-5 overflow-auto"
        style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}
      >
        {/* Top Navigation */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2.5">
            <img src={logoPosyandu} alt="Posyandu Care" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <div>
              <div className="fw-bold text-dark lh-1" style={{ fontSize: '1.05rem' }}>Posyandu Care</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>Pendaftaran Akun Petugas</div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill"
            style={{ fontSize: '0.8rem', borderColor: '#e2e8f0', color: '#475569' }}
            onClick={onGoToLogin}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Login</span>
          </button>
        </div>

        {/* Center Register Form Card */}
        <div className="my-auto mx-auto w-100" style={{ maxWidth: '520px' }}>
          
          <div 
            className="p-4 p-sm-4 rounded-4"
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)' 
            }}
          >
            {step === 'form' ? (
              <>
                {/* Header Title */}
                <div className="mb-4">
                  <div className="d-inline-block px-2.5 py-0.5 rounded-pill mb-2" style={{ backgroundColor: '#f0fdfa', color: '#0f766e', fontSize: '0.75rem', fontWeight: '600' }}>
                    Peran: {getRoleTitle()}
                  </div>
                  <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.025em', fontSize: '1.35rem' }}>
                    Formulir Pendaftaran Akun
                  </h2>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.825rem', lineHeight: '1.45' }}>
                    Lengkapi data diri di bawah ini. Akun akan ditinjau oleh {getVerifierTitle()}.
                  </p>
                </div>

                {/* Error Notice Alert */}
                {errorMessage && (
                  <div 
                    className="alert alert-danger py-2.5 px-3 rounded-3 d-flex align-items-start gap-2 mb-3" 
                    style={{ fontSize: '0.82rem', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#991b1b' }}
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <div>{errorMessage}</div>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  
                  {/* Nama Lengkap & Gelar */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                      Nama Lengkap &amp; Gelar
                    </label>
                    <div className="input-group" style={{ height: '42px' }}>
                      <span 
                        className="input-group-text border-end-0"
                        style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
                      >
                        <User size={15} />
                      </span>
                      <input 
                        type="text" 
                        name="nama"
                        className="form-control border-start-0 text-dark shadow-none" 
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Contoh: dr. Sarah Amanda / Siti Aminah"
                        style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                        required 
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Alamat Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                      Alamat Email
                    </label>
                    <div className="input-group" style={{ height: '42px' }}>
                      <span 
                        className="input-group-text border-end-0"
                        style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
                      >
                        <Mail size={15} />
                      </span>
                      <input 
                        type="email" 
                        name="email"
                        className="form-control border-start-0 text-dark shadow-none" 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nama@posyandu.org / nama@gmail.com"
                        style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                        required 
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* NIK & Telepon */}
                  <div className="row g-2.5 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                        NIK (16 Digit)
                      </label>
                      <div className="input-group" style={{ height: '42px' }}>
                        <span 
                          className="input-group-text border-end-0"
                          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
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
                          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                          required 
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                        Nomor HP / WhatsApp
                      </label>
                      <div className="input-group" style={{ height: '42px' }}>
                        <span 
                          className="input-group-text border-end-0"
                          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
                        >
                          <Phone size={15} />
                        </span>
                        <input 
                          type="text" 
                          name="telepon"
                          className="form-control border-start-0 text-dark shadow-none" 
                          value={formData.telepon}
                          onChange={handleChange}
                          placeholder="08xxxxxxxxxx"
                          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                          required 
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Penugasan Sesuai Role */}
                  {role === 'dinkes' ? (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                        Bidang Penugasan
                      </label>
                      <div className="input-group" style={{ height: '42px' }}>
                        <span 
                          className="input-group-text border-end-0"
                          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
                        >
                          <Building2 size={15} />
                        </span>
                        <select 
                          name="bidang"
                          className="form-select border-start-0 text-dark shadow-none"
                          value={formData.bidang}
                          onChange={handleChange}
                          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                          disabled={isLoading}
                          required
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
                      <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                        Puskesmas Tempat Tugas
                      </label>
                      <div className="input-group" style={{ height: '42px' }}>
                        <span 
                          className="input-group-text border-end-0"
                          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
                        >
                          <Building2 size={15} />
                        </span>
                        <select 
                          name="posyandu"
                          className="form-select border-start-0 text-dark shadow-none"
                          value={formData.posyandu}
                          onChange={handleChange}
                          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                          disabled={isLoading}
                          required
                        >
                          <option value="">-- Pilih Puskesmas --</option>
                          {puskesmasList.map((item, idx) => (
                            <option key={idx} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-slate-700 mb-1.5 d-flex justify-content-between align-items-center" style={{ fontSize: '0.82rem', color: '#334155' }}>
                        <span>Wilayah Posyandu</span>
                        <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>Pilih posyandu terdaftar</span>
                      </label>
                      <SearchablePosyanduSelect
                        name="posyandu"
                        placeholder="Pilih / Cari Wilayah Posyandu..."
                        value={formData.posyandu}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  )}

                  {/* Kata Sandi & Konfirmasi */}
                  <div className="row g-2.5 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                        Kata Sandi (Min. 8)
                      </label>
                      <div className="input-group" style={{ height: '42px' }}>
                        <span 
                          className="input-group-text border-end-0"
                          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
                        >
                          <Lock size={15} />
                        </span>
                        <input 
                          type="password" 
                          name="password"
                          className="form-control border-start-0 text-dark shadow-none" 
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                          required 
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', color: '#334155' }}>
                        Konfirmasi Kata Sandi
                      </label>
                      <div className="input-group" style={{ height: '42px' }}>
                        <span 
                          className="input-group-text border-end-0"
                          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#64748b' }}
                        >
                          <Lock size={15} />
                        </span>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          className="form-control border-start-0 text-dark shadow-none" 
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.875rem' }}
                          required 
                          disabled={isLoading}
                        />
                      </div>
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
                      borderRadius: '8px', 
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
                        <span>Mengirim Data Pendaftaran...</span>
                      </>
                    ) : (
                      <>
                        <span>Ajukan Pendaftaran Akun</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* =========================================================================
                 PENDING APPROVAL NOTIFICATION CARD
                 ========================================================================= */
              <div className="text-center py-2">
                
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '60px', height: '60px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                >
                  <Clock size={28} />
                </div>

                <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                  Pendaftaran Berhasil Dikirim
                </h3>
                
                <p className="text-muted small mb-4" style={{ fontSize: '0.84rem', lineHeight: '1.5' }}>
                  Akun Anda sedang dalam proses verifikasi oleh <strong>{getVerifierTitle()}</strong>. Notifikasi aktivasi akan dikirimkan ke alamat email berikut:
                </p>

                <div className="p-3 rounded-3 mb-4 text-center border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <div className="text-muted small mb-0.5" style={{ fontSize: '0.74rem' }}>Email Pendaftar</div>
                  <div className="fw-bold text-dark font-monospace" style={{ fontSize: '0.925rem' }}>
                    {formData.email}
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn w-100 text-white fw-semibold py-2.5 rounded-3 shadow-sm mb-2"
                  style={{ backgroundColor: '#0f766e' }}
                  onClick={onGoToLogin}
                >
                  Kembali ke Halaman Login
                </button>

                <button 
                  type="button" 
                  className="btn btn-link text-decoration-none text-muted small p-0 mt-2"
                  style={{ fontSize: '0.78rem' }}
                  onClick={handleSimulateApproval}
                >
                  Simulasi Persetujuan Instansi (Demo Mode)
                </button>
              </div>
            )}
          </div>

          {/* Footer Login Link */}
          {step === 'form' && (
            <div className="text-center pt-3 mt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
              <button 
                type="button" 
                className="btn btn-link p-0 text-decoration-none small"
                style={{ fontSize: '0.82rem', color: '#64748b' }}
                onClick={onGoToLogin}
              >
                Sudah memiliki akun terverifikasi? <span className="fw-bold" style={{ color: '#0f766e' }}>Masuk ke Sistem &rarr;</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-muted small mt-4" style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
          &copy; 2026 Posyandu Care • Terintegrasi Standar Layanan Primer Kemenkes RI
        </div>

      </div>
    </div>
  );
}
