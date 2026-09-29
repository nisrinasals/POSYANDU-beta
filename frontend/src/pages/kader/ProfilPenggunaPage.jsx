import React, { useEffect, useRef, useState } from "react";
import { User, Save, KeyRound, Camera, Eye, EyeOff, Pencil, X, LockKeyhole, CircleCheck } from "lucide-react";
import { Modal, Button } from "react-bootstrap";
import { useNotification } from "../../context/NotificationContext";
import { userService, posyanduService } from "../../services";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Backend menyimpan profile_picture sebagai:
 * /uploads/profile/filename.jpg
 *
 * Karena frontend dan backend bisa berjalan pada
 * host/port yang berbeda, ubah relative path menjadi
 * absolute backend URL.
 */
const resolveProfileImageUrl = (image) => {
  if (!image) return null;

  if (image.startsWith("data:") || image.startsWith("blob:") || /^https?:\/\//i.test(image)) {
    return image;
  }

  const backendBaseUrl = API_BASE_URL.replace(/\/api\/?$/, "");

  const normalizedPath = image.startsWith("/") ? image : `/${image}`;

  return `${backendBaseUrl}${normalizedPath}`;
};

const getProfileImageFromUser = (userData) => {
  return userData?.profile_picture || userData?.profilePicture || userData?.foto_profil || userData?.poto_profile || userData?.foto || userData?.avatar || null;
};

export default function ProfilPenggunaPage({ user, onUpdateUser }) {
  const { showSuccess, showWarning, showError } = useNotification();

  const fileInputRef = useRef(null);

  // =========================================================
  // ROLE THEME
  // =========================================================
  const isPuskesmas = user?.roleType?.includes("puskesmas");

  const isDinkes = user?.roleType?.includes("dinkes");

  const getRoleTheme = () => {
    if (isDinkes) {
      return {
        primary: "#1e3a8a",
        primaryHover: "#172554",
        bgLight: "#e0e7ff",
        textColor: "#1e3a8a",
      };
    }

    if (isPuskesmas) {
      return {
        primary: "#428A75",
        primaryHover: "#2E4E52",
        bgLight: "rgba(66, 138, 117, 0.12)",
        textColor: "#428A75",
      };
    }

    return {
      primary: "#2b2e4a",
      primaryHover: "#1e2034",
      bgLight: "#f1f5f9",
      textColor: "#2b2e4a",
    };
  };

  const theme = getRoleTheme();

  // =========================================================
  // PROFILE DATA
  // =========================================================
  const createProfileData = (data) => ({
    nama: data?.nama_lengkap || data?.nama || "",
    nik: data?.nik || "",
    email: data?.email || "",
    telepon: data?.telepon || "",
    posyandu: data?.posyandu?.nama_posyandu || data?.posyandu || "",
    puskesmas: data?.puskesmas?.nama_puskesmas || data?.puskesmas || "",
    puskesmas: data?.puskesmas?.nama_puskesmas || data?.puskesmas?.nama || data?.puskesmas || "",
  });

  const initialProfileData = createProfileData(user);

  const [profileData, setProfileData] = useState(initialProfileData);

  const [originalProfileData, setOriginalProfileData] = useState(initialProfileData);

  const [isEditing, setIsEditing] = useState(false);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // =========================================================
  // PROFILE PHOTO
  // =========================================================
  const [profileImage, setProfileImage] = useState(resolveProfileImageUrl(getProfileImageFromUser(user)));

  // =========================================================
  // PASSWORD
  // =========================================================
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================================================
  // LOAD PROFILE FROM BACKEND
  // =========================================================
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);

        const response = await userService.getMe();

        /*
         * api.js mengembalikan response.data.
         * Karena response backend:
         *
         * {
         *   success: true,
         *   data: user
         * }
         *
         * maka response.data = object user.
         */
        const backendUser = response?.data;

        if (!backendUser || !mounted) {
          return;
        }

        let resolvedPuskesmas = backendUser.puskesmas?.nama_puskesmas || backendUser.puskesmas?.nama || backendUser.puskesmas || user?.puskesmas || "";

        if (isPuskesmas && backendUser.puskesmas_id && !resolvedPuskesmas) {
          try {
            const puskesmasRes = await posyanduService.getPublicPuskesmasList();
            const matched = (Array.isArray(puskesmasRes?.data) ? puskesmasRes.data : []).find((item) => String(item?.id) === String(backendUser.puskesmas_id));
            resolvedPuskesmas = matched?.nama_puskesmas || "";
          } catch (resolveError) {
            console.warn("Gagal resolve nama Puskesmas:", resolveError);
          }
        }

        const freshProfileData = {
          nama: backendUser.nama_lengkap || backendUser.nama || user?.nama || "",

          nik: backendUser.nik ?? user?.nik ?? "",

          email: backendUser.email ?? user?.email ?? "",

          telepon: backendUser.telepon ?? user?.telepon ?? "",

          posyandu: backendUser.posyandu?.nama_posyandu || backendUser.posyandu || user?.posyandu || "",

          puskesmas: resolvedPuskesmas,
        };

        const rawPhoto = getProfileImageFromUser(backendUser);

        const photoUrl = resolveProfileImageUrl(rawPhoto);

        /*
         * Ambil data lama dari DB.
         * Tidak mengganti dengan string kosong
         * selama field DB memang memiliki nilai.
         */
        setProfileData(freshProfileData);

        setOriginalProfileData(freshProfileData);

        setProfileImage(photoUrl);

        /*
         * Sinkronkan data ke global App state.
         */
        if (onUpdateUser) {
          onUpdateUser({
            ...user,
            ...backendUser,

            nama: freshProfileData.nama,

            nama_lengkap: backendUser.nama_lengkap || freshProfileData.nama,

            nik: freshProfileData.nik,

            email: freshProfileData.email,

            telepon: freshProfileData.telepon,

            posyandu: freshProfileData.posyandu,

            puskesmas: freshProfileData.puskesmas,

            profile_picture: rawPhoto || user?.profile_picture || null,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil profil user:", error);

        /*
         * Fallback ke data yang sudah ada.
         */
        if (mounted) {
          const fallback = createProfileData(user);

          setProfileData(fallback);
          setOriginalProfileData(fallback);

          setProfileImage(resolveProfileImageUrl(getProfileImageFromUser(user)));
        }
      } finally {
        if (mounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };

    // Hanya load sekali ketika halaman dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // START EDIT
  // =========================================================
  const handleStartEdit = () => {
    /*
     * Simpan snapshot data lama.
     * TIDAK ada API call di sini.
     */
    setOriginalProfileData({
      ...profileData,
    });

    /*
     * Pastikan data lama tetap dipakai.
     */
    setProfileData({
      ...profileData,
    });

    setIsEditing(true);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================
  const handleCancelEdit = () => {
    setProfileData({
      ...originalProfileData,
    });

    setIsEditing(false);
  };

  // =========================================================
  // FIELD CHANGE
  // =========================================================
  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================
  const handleSaveProfile = async () => {
    if (isSavingProfile) {
      return;
    }

    const nama = profileData.nama.trim();

    const telepon = profileData.telepon.trim();

    if (!nama) {
      showWarning("Nama Lengkap Wajib Diisi", "Silakan masukkan nama lengkap Anda.");
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await userService.updateMe({
        nama_lengkap: nama,
        telepon,
      });

      const backendUser = response?.data || {};

      const updatedData = {
        ...profileData,

        nama: backendUser.nama_lengkap || nama,

        telepon: backendUser.telepon ?? telepon,
      };

      setProfileData(updatedData);
      setOriginalProfileData(updatedData);

      setIsEditing(false);

      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          ...backendUser,

          nama: updatedData.nama,

          nama_lengkap: updatedData.nama,

          nik: updatedData.nik,

          email: updatedData.email,

          telepon: updatedData.telepon,

          posyandu: updatedData.posyandu,

          puskesmas: updatedData.puskesmas,

          profile_picture: user?.profile_picture || getProfileImageFromUser(backendUser) || null,
        });
      }

      showSuccess("Profil Tersimpan", "Perubahan profil Anda berhasil disimpan.");
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);

      const message = error?.message || error?.errors?.[0]?.message || "Gagal menyimpan perubahan profil. Silakan coba lagi.";

      showError("Gagal Menyimpan Profil", message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // =========================================================
  // UPLOAD PROFILE PHOTO
  // =========================================================
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Backend multer = maksimum 2 MB.
     */
    if (file.size > 2 * 1024 * 1024) {
      showWarning("Ukuran Foto Terlalu Besar", "Ukuran foto maksimal 2 MB.");

      e.target.value = "";
      return;
    }

    try {
      const response = await userService.uploadProfilePicture(file);

      /*
       * Controller backend mengembalikan:
       *
       * data: {
       *   profile_picture:
       *     "/uploads/profile/..."
       * }
       */
      let rawPhoto =
        response?.data?.profile_picture ||
        response?.data?.profilePicture ||
        response?.data?.foto_profil ||
        response?.data?.poto_profile ||
        response?.data?.foto ||
        response?.data?.avatar ||
        response?.profile_picture ||
        response?.profilePicture ||
        response?.foto_profil ||
        response?.poto_profile ||
        response?.foto ||
        response?.avatar ||
        response?.data?.user?.profile_picture ||
        response?.data?.user?.profilePicture ||
        response?.data?.user?.foto_profil ||
        response?.data?.user?.poto_profile ||
        response?.data?.user?.foto ||
        response?.data?.user?.avatar ||
        response?.user?.profile_picture ||
        response?.user?.profilePicture ||
        response?.user?.foto_profil ||
        response?.user?.poto_profile ||
        response?.user?.foto ||
        response?.user?.avatar ||
        null;

      /*
       * Apabila response upload tidak membawa
       * path foto, ambil ulang langsung dari DB.
       */
      if (!rawPhoto) {
        const meResponse = await userService.getMe();

        rawPhoto = getProfileImageFromUser(meResponse?.data);
      }

      if (!rawPhoto) {
        throw new Error("Foto berhasil diunggah, tetapi lokasi foto tidak ditemukan.");
      }

      const baseUrl = resolveProfileImageUrl(rawPhoto);

      /*
       * Cache bust supaya browser tidak menggunakan
       * gambar lama yang masih tersimpan di cache.
       */
      const photoUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;

      setProfileImage(photoUrl);

      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          profile_picture: rawPhoto,
          foto: rawPhoto,
          avatar: rawPhoto,
        });
      }

      showSuccess("Foto Profil Diperbarui", "Foto profil berhasil diubah.");
    } catch (error) {
      console.error("Gagal upload foto profil:", error);

      const message = error?.message || error?.errors?.[0]?.message || "Gagal mengunggah foto profil. Silakan coba lagi.";

      showError("Gagal Mengubah Foto Profil", message);
    } finally {
      e.target.value = "";
    }
  };

  // =========================================================
  // PASSWORD
  // =========================================================
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      showWarning("Validasi Kata Sandi", "Password baru minimal 8 karakter.");
      return;
    }

    if (passwordForm.newPassword === passwordForm.oldPassword) {
      showWarning("Validasi Kata Sandi", "Password baru harus berbeda dari password lama.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showWarning("Validasi Kata Sandi", "Konfirmasi password baru tidak cocok.");
      return;
    }

    try {
      await userService.changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword,
      });

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordModal(false);

      showSuccess("Kata Sandi Diperbarui", "Kata sandi akun Anda berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal mengubah password:", error);

      const message = error?.message || error?.errors?.[0]?.message || "Gagal memperbarui password. Silakan coba lagi.";

      showError("Gagal Memperbarui Password", message);
    }
  };

  // =========================================================
  // FIELD STYLE HELPERS
  // =========================================================
  const editableInputClass = isEditing ? "form-control form-control-custom bg-white text-dark border py-2 fw-medium" : "form-control form-control-custom bg-white text-muted border-0 py-2 fw-medium";

  const readonlyInputClass = "form-control form-control-custom bg-light text-muted border-0 py-2 fw-medium";

  return (
    <div className="container-fluid p-0">
      <div className="card card-custom p-4 border-0 shadow-sm rounded-4 bg-white">
        {/* ===================================================
            PROFILE HEADER
        ==================================================== */}
        <div className="d-flex flex-column align-items-center mb-4 text-center">
          <div className="position-relative mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
              style={{
                width: "104px",
                height: "104px",
                backgroundColor: theme.bgLight,
                border: `3px solid ${theme.primary}`,
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto Profil"
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    console.error("Foto profil gagal dimuat:", profileImage);

                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <User
                  size={52}
                  style={{
                    color: theme.primary,
                  }}
                />
              )}
            </div>

            {/* UBAH FOTO */}
            <button
              type="button"
              className="btn position-absolute bottom-0 end-0 rounded-circle p-2 d-flex align-items-center justify-content-center shadow"
              style={{
                backgroundColor: theme.primary,
                color: "#ffffff",
                border: "2px solid #ffffff",
              }}
              title="Ubah Foto Profil"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} />
            </button>

            <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" className="d-none" onChange={handlePhotoChange} />
          </div>

          <h3 className="fw-bold text-dark mb-1">{isLoadingProfile ? "Memuat..." : profileData.nama || "-"}</h3>

          <p className="text-muted fw-medium small mb-0">{isPuskesmas ? profileData.puskesmas || user?.puskesmas || "-" : isDinkes ? user?.instansi || profileData.puskesmas || "-" : profileData.posyandu || user?.posyandu || "-"}</p>
        </div>

        {/* ===================================================
            PROFILE INFORMATION
        ==================================================== */}
        <div
          className="p-3 p-md-4 rounded-4 mb-4"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div className="row g-4">
            {/* NAMA LENGKAP */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold text-dark small mb-1">Nama Lengkap</label>

              <input
                type="text"
                className={`form-control form-control-custom py-2 fw-medium ${isEditing ? "bg-white text-dark border" : "bg-light text-muted border-0"}`}
                value={profileData.nama}
                onChange={(e) => handleProfileChange("nama", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* NIK */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold text-dark small mb-1">Nomor Induk Kependudukan (NIK)</label>

              <input type="text" className="form-control form-control-custom bg-light text-muted border-0 py-2 fw-medium font-monospace" value={profileData.nik || "-"} disabled readOnly />
            </div>

            {/* EMAIL */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold text-dark small mb-1">Alamat Email</label>

              <input type="email" className="form-control form-control-custom bg-light text-muted border-0 py-2 fw-medium" value={profileData.email || "-"} disabled readOnly />
            </div>

            {/* TELEPON */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold text-dark small mb-1">Nomor Handphone / WhatsApp</label>

              <input
                type="text"
                className={`form-control form-control-custom py-2 fw-medium font-monospace ${isEditing ? "bg-white text-dark border" : "bg-light text-muted border-0"}`}
                value={profileData.telepon}
                onChange={(e) => handleProfileChange("telepon", e.target.value)}
                placeholder=""
                disabled={!isEditing}
              />
            </div>

            {/* PASSWORD TERPISAH */}
            <div className="col-12">
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <div className="fw-bold text-dark small">Kata Sandi</div>
                </div>

                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-underline fw-bold small d-flex align-items-center gap-1"
                  style={{
                    color: theme.primary,
                  }}
                  onClick={() => setShowPasswordModal(true)}
                >
                  <KeyRound size={16} />
                  Ubah Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            BUTTON AREA
        ==================================================== */}
        <div className="d-flex justify-content-end gap-2">
          {!isEditing ? (
            <button
              type="button"
              className="btn text-white px-4 py-2 d-flex align-items-center gap-2 rounded-3 shadow-xs fw-semibold"
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              }}
              onClick={handleStartEdit}
            >
              <Pencil size={18} />
              <span>Edit Profil</span>
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-light px-4 py-2 d-flex align-items-center gap-2 rounded-3 fw-semibold" onClick={handleCancelEdit} disabled={isSavingProfile}>
                <X size={18} />
                <span>Batal</span>
              </button>

              <button
                type="button"
                className="btn text-white px-4 py-2 d-flex align-items-center gap-2 rounded-3 shadow-xs fw-semibold"
                style={{
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                }}
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
              >
                <Save size={18} />
                <span>{isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL UBAH PASSWORD
      ====================================================== */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <KeyRound
              size={20}
              style={{
                color: theme.primary,
              }}
            />
            <span>Ubah Password Akun</span>
          </Modal.Title>
        </Modal.Header>

        <form onSubmit={handleChangePasswordSubmit}>
          <Modal.Body className="p-4">
            {/* PASSWORD LAMA */}
            <div className="mb-3">
              <label className="form-label fw-medium small">Password Lama</label>

              <div className="position-relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  className="form-control form-control-custom py-2 pe-5"
                  placeholder="Masukkan password lama"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  required
                />

                <button type="button" className="btn border-0 text-muted position-absolute top-50 translate-middle-y end-0 me-2 p-1" onClick={() => setShowOldPassword(!showOldPassword)}>
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* PASSWORD BARU */}
            <div className="mb-3">
              <label className="form-label fw-medium small">Password Baru</label>

              <div className="position-relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control form-control-custom py-2 pe-5"
                  placeholder="Masukkan password baru"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                />

                <button type="button" className="btn border-0 text-muted position-absolute top-50 translate-middle-y end-0 me-2 p-1" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* KONFIRMASI */}
            <div className="mb-3">
              <label className="form-label fw-medium small">Konfirmasi Password Baru</label>

              <div className="position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control form-control-custom py-2 pe-5"
                  placeholder="Ulangi password baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />

                <button type="button" className="btn border-0 text-muted position-absolute top-50 translate-middle-y end-0 me-2 p-1" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="light" onClick={() => setShowPasswordModal(false)}>
              Batal
            </Button>

            <Button
              type="submit"
              className="text-white px-4 fw-semibold border-0"
              style={{
                backgroundColor: theme.primary,
              }}
            >
              Update Password
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
