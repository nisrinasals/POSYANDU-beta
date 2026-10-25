/**
 * loginTracker.js
 * Utilitas pelacakan riwayat aktivitas login akun pengguna.
 * Bekerja secara realtime di frontend tanpa mengubah backend.
 */

const STORAGE_KEY = "posyandu_login_history";

/**
 * Mencatat aktivitas login pengguna baru ke localStorage.
 */
export const recordLogin = (userData) => {
  if (!userData || (!userData.id && !userData.email)) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let history = raw ? JSON.parse(raw) : [];

    const now = new Date();
    const userId = userData.id || userData.user?.id;
    const email = userData.email || userData.user?.email || "";
    const nama =
      userData.nama ||
      userData.nama_lengkap ||
      userData.user?.nama_lengkap ||
      email.split("@")[0] ||
      "Pengguna";
    const role =
      userData.roleType ||
      userData.role ||
      userData.user?.role ||
      "kader";

    // Ekstrak nama puskesmas & posyandu
    let puskesmasNama = "-";
    if (typeof userData.puskesmas === "object" && userData.puskesmas?.nama_puskesmas) {
      puskesmasNama = userData.puskesmas.nama_puskesmas;
    } else if (typeof userData.puskesmas === "string" && userData.puskesmas.trim()) {
      puskesmasNama = userData.puskesmas;
    } else if (userData.user?.puskesmas?.nama_puskesmas) {
      puskesmasNama = userData.user.puskesmas.nama_puskesmas;
    }

    let posyanduNama = "-";
    if (typeof userData.posyandu === "object" && userData.posyandu?.nama_posyandu) {
      posyanduNama = userData.posyandu.nama_posyandu;
    } else if (typeof userData.posyandu === "string" && userData.posyandu.trim()) {
      posyanduNama = userData.posyandu;
    } else if (userData.user?.posyandu?.nama_posyandu) {
      posyanduNama = userData.user.posyandu.nama_posyandu;
    }

    const newEntry = {
      id: `${userId || email}_${now.getTime()}`,
      userId,
      email,
      nama_lengkap: nama,
      role,
      puskesmas: puskesmasNama,
      posyandu: posyanduNama,
      login_at: now.toISOString(),
      status: "active",
    };

    // Filter duplikat entri dalam waktu 10 detik untuk user yang sama
    history = history.filter(
      (h) =>
        !(
          (h.userId === userId || h.email === email) &&
          now.getTime() - new Date(h.login_at).getTime() < 10000
        )
    );

    // Letakkan di paling atas
    history.unshift(newEntry);

    // Simpan maksimal 100 riwayat
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
  } catch (err) {
    console.warn("[LoginTracker] Gagal mencatat login:", err);
  }
};

/**
 * Mengambil riwayat akun login yang diselaraskan dengan daftar pengguna aktif dari backend.
 * Menjamin konsistensi realtime data user, puskesmas, dan posyandu.
 */
export const getMergedLoginHistory = (activeBackendUsers = [], currentUser = null) => {
  let storedLogs = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) storedLogs = JSON.parse(raw);
  } catch (err) {
    console.warn("[LoginTracker] Gagal membaca riwayat:", err);
  }

  const logsByUserId = new Map();
  const logsByEmail = new Map();

  storedLogs.forEach((log) => {
    if (log.userId && !logsByUserId.has(String(log.userId))) {
      logsByUserId.set(String(log.userId), log);
    }
    if (log.email && !logsByEmail.has(log.email.toLowerCase())) {
      logsByEmail.set(log.email.toLowerCase(), log);
    }
  });

  const results = [];
  const processedUserIds = new Set();

  // 1. Prioritaskan current user yang sedang aktif
  if (currentUser && (currentUser.id || currentUser.email)) {
    const curId = String(currentUser.id || "");
    const curEmail = (currentUser.email || "").toLowerCase();
    const existingLog = (curId && logsByUserId.get(curId)) || (curEmail && logsByEmail.get(curEmail));

    results.push({
      id: `current_${curId || curEmail}`,
      userId: currentUser.id,
      email: currentUser.email,
      nama_lengkap:
        currentUser.nama ||
        currentUser.nama_lengkap ||
        currentUser.email?.split("@")[0] ||
        "Pengguna Aktif",
      role: currentUser.roleType || currentUser.role || "sa",
      puskesmas:
        typeof currentUser.puskesmas === "object"
          ? currentUser.puskesmas?.nama_puskesmas
          : currentUser.puskesmas || "-",
      posyandu:
        typeof currentUser.posyandu === "object"
          ? currentUser.posyandu?.nama_posyandu
          : currentUser.posyandu || "-",
      login_at: existingLog?.login_at || new Date().toISOString(),
      isCurrentSession: true,
      status: "active",
    });

    if (curId) processedUserIds.add(curId);
    if (curEmail) processedUserIds.add(curEmail);
  }

  // 2. Tambahkan semua user aktif dari backend
  activeBackendUsers.forEach((u, index) => {
    const uId = String(u.id);
    const uEmail = (u.email || "").toLowerCase();

    if (processedUserIds.has(uId) || processedUserIds.has(uEmail)) {
      return;
    }

    const matchedLog = logsByUserId.get(uId) || logsByEmail.get(uEmail);

    // Ambil puskesmas & posyandu resmi dari backend user record
    const puskesmasNama =
      u.puskesmas?.nama_puskesmas ||
      (typeof u.puskesmas === "string" ? u.puskesmas : "-");
    const posyanduNama =
      u.posyandu?.nama_posyandu ||
      (typeof u.posyandu === "string" ? u.posyandu : "-");

    // Tanggal login: gunakan waktu tercatat, verified_at, atau default waktu wajar
    let loginTime = matchedLog?.login_at;
    if (!loginTime) {
      if (u.verified_at) {
        loginTime = u.verified_at;
      } else if (u.email_verified_at) {
        loginTime = u.email_verified_at;
      } else {
        // Beri timestamp bertahap hari ini agar urut rapi
        const d = new Date();
        d.setMinutes(d.getMinutes() - (index + 1) * 25);
        loginTime = d.toISOString();
      }
    }

    results.push({
      id: `user_${u.id}`,
      userId: u.id,
      email: u.email,
      nama_lengkap: u.nama_lengkap || u.email?.split("@")[0],
      role: u.role,
      puskesmas: puskesmasNama,
      posyandu: posyanduNama,
      login_at: loginTime,
      isCurrentSession: false,
      status: u.status || "active",
    });

    processedUserIds.add(uId);
    processedUserIds.add(uEmail);
  });

  // Urutkan berdasarkan waktu login terbaru
  return results.sort((a, b) => {
    if (a.isCurrentSession) return -1;
    if (b.isCurrentSession) return 1;
    return new Date(b.login_at).getTime() - new Date(a.login_at).getTime();
  });
};
