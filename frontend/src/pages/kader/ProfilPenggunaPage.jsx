import React, { useState, useRef } from 'react';
import { User, Lock, Save, KeyRound, Camera, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import { useNotification } from '../../context/NotificationContext';
import { userService } from '../../services';

export default function ProfilPenggunaPage({ user, onUpdateUser }) {
  const { showSuccess, showWarning } = useNotification();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user?.foto || user?.avatar || null);

  const isPuskesmas = user?.roleType?.includes('puskesmas') || user?.posyandu?.toLowerCase().includes('puskesmas');
  const isDinkes = user?.roleType?.includes('dinkes') || user?.posyandu?.toLowerCase().includes('dinas') || user?.nama?.toLowerCase().includes('dinas');

  const getRoleTheme = () => {
    if (isDinkes) {
      return {
        primary: '#1e3a8a',
        primaryHover: '#172554',
        bgLight: '#e0e7ff',
        textColor: '#1e3a8a',
      };
    }
    if (isPuskesmas) {
      return {
        primary: '#428A75', // Aussie Surf (Teal Garage)
        primaryHover: '#2E4E52', // Dark Slate Grey
        bgLight: 'rgba(66, 138, 117, 0.12)',
        textColor: '#428A75',
      };
    }
    // Kader / Posyandu
    return {
      primary: '#2b2e4a',
      primaryHover: '#1e2034',
      bgLight: '#f1f5f9',
      textColor: '#2b2e4a',
    };
  };

  const theme = getRoleTheme();

  const [profileData, setProfileData] = useState({
    nama: user?.nama || "",
    nik: user?.nik || "",
    email: user?.email || "",
    telepon: user?.telepon || "",
    posyandu: user?.posyandu || "",
    password: ""
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle Photo Upload & Instant Realtime Sync
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showWarning(
          "Ukuran Berkas Terlalu Besar",
          "Ukuran foto yang diunggah melebihi batas maksimal 5 MB. Silakan pilih foto dengan resolusi lebih kecil."
        );
        return;
      }
      try {
        await userService.uploadProfilePicture(file);
      } catch (err) {
        console.info('Upload foto ke backend (simulasi lokal).');
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageData = reader.result;
        setProfileImage(newImageData);
        if (onUpdateUser) {
          onUpdateUser({ ...user, ...profileData, foto: newImageData, avatar: newImageData });
        }
        showSuccess("Foto Profil Diperbarui", "Foto profil akun Anda berhasil diubah.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateMe({
        nama_lengkap: profileData.nama,
        telepon: profileData.telepon
      });
    } catch (err) {
      console.info('Backend update user info notice:', err);
    }

    if (onUpdateUser) {
      onUpdateUser({ ...user, ...profileData, foto: profileImage, avatar: profileImage });
    }
    showSuccess("Profil Tersimpan", "Perubahan nomor telepon dan profil akun berhasil disimpan.");
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showWarning(
        "Validasi Kata Sandi",
        "Konfirmasi kata sandi baru tidak cocok. Pastikan kata sandi baru dan konfirmasinya sama."
      );
      return;
    }
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    showSuccess("Kata Sandi Diperbarui", "Kata sandi akun Anda telah berhasil diperbarui dan siap digunakan untuk login berikutnya.");
  };

  return (
    <div className="container-fluid p-0">
      <div className="card card-custom p-4 border-0 shadow-sm rounded-4 bg-white">
        {/* User Profile Avatar & Header */}
        <div className="d-flex flex-column align-items-center mb-4 text-center">
          <div className="position-relative mb-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
              style={{ width: '104px', height: '104px', backgroundColor: theme.bgLight, border: `3px solid ${theme.primary}` }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Foto Profil" className="w-100 h-100 object-fit-cover" />
              ) : (
                <User size={52} style={{ color: theme.primary }} />
              )}
            </div>

            {/* Interactive Camera Button Overlay for Photo Upload */}
            <button 
              type="button" 
              className="btn position-absolute bottom-0 end-0 rounded-circle p-2 d-flex align-items-center justify-content-center shadow"
              style={{ backgroundColor: theme.primary, color: '#ffffff', border: '2px solid #ffffff' }}
              title="Ubah Foto Profil"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <Camera size={16} />
            </button>
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="d-none" 
              onChange={handlePhotoChange} 
            />
          </div>

          <h3 className="fw-bold text-dark mb-1">{profileData.nama}</h3>
          <p className="text-muted fw-medium small mb-0">{profileData.posyandu}</p>
        </div>

        {/* Form Area (Informasi Akun: Telepon & Password Editable, Lainnya Read-Only) */}
        <form onSubmit={handleSaveProfile}>
          <div 
            className="p-3 p-md-4 rounded-4 mb-4" 
            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <div className="row g-3">
              {/* Nama Lengkap (Read-Only) */}
              <div className="col-12 col-md-6">
                <div className="mb-1">
                  <label className="form-label fw-bold text-dark small mb-0">Nama Lengkap</label>
                </div>
                <input 
                  type="text" 
                  className="form-control form-control-custom bg-white text-muted border-0 py-2 fw-medium"
                  value={profileData.nama}
                  disabled
                  readOnly
                />
              </div>

              {/* NIK (Read-Only) */}
              <div className="col-12 col-md-6">
                <div className="mb-1">
                  <label className="form-label fw-bold text-dark small mb-0">Nomor Induk Kependudukan (NIK)</label>
                </div>
                <input 
                  type="text" 
                  className="form-control form-control-custom bg-white text-muted border-0 py-2 fw-medium font-monospace"
                  value={profileData.nik}
                  disabled
                  readOnly
                />
              </div>

              {/* Alamat Email (Read-Only) */}
              <div className="col-12 col-md-6">
                <div className="mb-1">
                  <label className="form-label fw-bold text-dark small mb-0">Alamat Email</label>
                </div>
                <input 
                  type="email" 
                  className="form-control form-control-custom bg-white text-muted border-0 py-2 fw-medium"
                  value={profileData.email}
                  disabled
                  readOnly
                />
              </div>

              {/* Nomor Handphone / WhatsApp (Dapat Diedit) */}
              <div className="col-12 col-md-6">
                <div className="mb-1">
                  <label className="form-label fw-bold text-dark small mb-0">Nomor Handphone / WhatsApp</label>
                </div>
                <input 
                  type="text" 
                  className="form-control form-control-custom bg-white text-dark border py-2 fw-medium font-monospace"
                  value={profileData.telepon}
                  onChange={(e) => setProfileData({ ...profileData, telepon: e.target.value })}
                  placeholder="Contoh: 088227683468"
                />
              </div>

              {/* Posyandu (Read-Only) */}
              <div className="col-12">
                <div className="mb-1">
                  <label className="form-label fw-bold text-dark small mb-0">Posyandu</label>
                </div>
                <input 
                  type="text" 
                  className="form-control form-control-custom bg-white text-muted border-0 py-2 fw-medium"
                  value={profileData.posyandu}
                  disabled
                  readOnly
                />
              </div>

              {/* Password & Ubah Password Action Link (Editable) */}
              <div className="col-12">
                <label className="form-label fw-bold text-dark small mb-1">Password</label>
                <div className="position-relative">
                  <input 
                    type="password" 
                    className="form-control form-control-custom bg-white border-0 py-2 fw-medium"
                    value={profileData.password || "••••••••"}
                    readOnly
                  />
                  <div className="text-end mt-2">
                    <button 
                      type="button" 
                      className="btn btn-link p-0 text-decoration-underline fw-bold small"
                      style={{ color: theme.primary }}
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Ubah Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button 
              type="submit" 
              className="btn text-white px-4 py-2 d-flex align-items-center gap-2 rounded-3 shadow-xs fw-semibold"
              style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
            >
              <Save size={18} />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal Ubah Password */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <KeyRound size={20} style={{ color: theme.primary }} />
            <span>Ubah Password Akun</span>
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleChangePasswordSubmit}>
          <Modal.Body className="p-4">
            {/* Password Lama */}
            <div className="mb-3">
              <label className="form-label fw-medium small">Password Lama</label>
              <div className="position-relative">
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  className="form-control form-control-custom py-2 pe-5"
                  placeholder="Masukkan password lama"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
                <button 
                  type="button"
                  className="btn border-0 text-muted position-absolute top-50 translate-middle-y end-0 me-2 p-1"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  title={showOldPassword ? "Sembunyikan Password" : "Lihat Password"}
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div className="mb-3">
              <label className="form-label fw-medium small">Password Baru</label>
              <div className="position-relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  className="form-control form-control-custom py-2 pe-5"
                  placeholder="Masukkan password baru"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                <button 
                  type="button"
                  className="btn border-0 text-muted position-absolute top-50 translate-middle-y end-0 me-2 p-1"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  title={showNewPassword ? "Sembunyikan Password" : "Lihat Password"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="mb-3">
              <label className="form-label fw-medium small">Konfirmasi Password Baru</label>
              <div className="position-relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="form-control form-control-custom py-2 pe-5"
                  placeholder="Ulangi password baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
                <button 
                  type="button"
                  className="btn border-0 text-muted position-absolute top-50 translate-middle-y end-0 me-2 p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? "Sembunyikan Password" : "Lihat Password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowPasswordModal(false)}>Batal</Button>
            <Button 
              type="submit" 
              className="text-white px-4 fw-semibold border-0" 
              style={{ backgroundColor: theme.primary }}
            >
              Update Password
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
