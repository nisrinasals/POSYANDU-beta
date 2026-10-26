import React, { useState, useEffect } from "react";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DataSasaranPage from "./pages/kader/DataSasaranPage";
import ProfilPenggunaPage from "./pages/kader/ProfilPenggunaPage";
import DashboardPage from "./pages/kader/DashboardPage";
import PemeriksaanPage from "./pages/kader/PemeriksaanPage";
import RekapPemeriksaanPage from "./pages/kader/RekapPemeriksaanPage";
import KaderRiwayatRujukanPage from "./pages/kader/KaderRiwayatRujukanPage";
import PuskesmasDashboardPage from "./pages/puskesmas/PuskesmasDashboardPage";
import PuskesmasVerifikasiKaderPage from "./pages/puskesmas/PuskesmasVerifikasiKaderPage";
import PuskesmasDataSasaranPage from "./pages/puskesmas/PuskesmasDataSasaranPage";
import PuskesmasRekapitulasiPage from "./pages/puskesmas/PuskesmasRekapitulasiPage";
import PuskesmasPemantauanRujukanPage from "./pages/puskesmas/PuskesmasPemantauanRujukanPage";
import PuskesmasJadwalPage from "./pages/puskesmas/PuskesmasJadwalPage";
import KaderJadwalPage from "./pages/kader/KaderJadwalPage";
import DinkesDashboardPage from "./pages/dinkes/DinkesDashboardPage";
import DinkesVerifikasiAkunPage from "./pages/dinkes/DinkesVerifikasiAkunPage";
import DinkesDataSasaranPage from "./pages/dinkes/DinkesDataSasaranPage";
import DinkesJadwalMonitoringPage from "./pages/dinkes/DinkesJadwalMonitoringPage";
import RekapTemplateExcelView from "./components/pemeriksaan/RekapTemplateExcelView";

import SADashboardPage from "./pages/sa/SADashboardPage";
import SAVerifikasiAkunPage from "./pages/sa/SAVerifikasiAkunPage";
import SADataSasaranPage from "./pages/sa/SADataSasaranPage";
import SAJadwalMonitoringPage from "./pages/sa/SAJadwalMonitoringPage";

import { authService, sesiService, pemeriksaanService, userService, posyanduService, rujukanService } from "./services";

import wargaService from "./services/wargaService";

import { mapBackendWargaToFrontend, mapBackendSesiToFrontend, cleanPuskesmasName, cleanPosyanduName } from "./utils/dataMappers";
import { recordLogin } from "./utils/loginTracker";
import { subscribeRealtimeEvent } from "./utils/realtimeSync";

const INITIAL_USER_STATE = {
  id: null,
  email: "",
  nama: "",
  nama_lengkap: "",
  posyandu: "",
  posyandu_id: null,
  puskesmas: "",
  puskesmas_id: null,
  roleType: "",
  role: "",
  telepon: "",
  nik: "",
  profile_picture: null,
};

const mapRoleToFrontend = (backendRole) => {
  const role = String(backendRole || "").trim();
  if (role === "dinkesAdmin" || role === "dinkes-admin") {
    return { roleType: "dinkes-admin", roleTitle: "Admin Dinas Kesehatan" };
  }
  if (role === "dinkes" || role === "dinkes-staf") {
    return { roleType: "dinkes-staf", roleTitle: "Staf Dinas Kesehatan" };
  }
  if (role === "puskesmasAdmin" || role === "puskesmas-admin") {
    return { roleType: "puskesmas-admin", roleTitle: "Admin Puskesmas" };
  }
  if (role === "puskesmas" || role === "puskesmas-staf" || role === "puskesmas-user") {
    return { roleType: "puskesmas-staf", roleTitle: "Staf Puskesmas" };
  }
  if (role === "sa") {
    return { roleType: "sa", roleTitle: "Super Admin" };
  }
  return { roleType: "kader", roleTitle: "Kader" };
};

const formatUserObject = (data) => {
  if (!data) return INITIAL_USER_STATE;
  const rawRole = data.roleType || data.role || data.user?.role || "";
  const { roleType, roleTitle } = mapRoleToFrontend(rawRole);

  const rawPhoto =
    data.profile_picture ??
    data.profilePicture ??
    data.foto_profil ??
    data.foto ??
    data.avatar ??
    data.user?.profile_picture ??
    null;

  const posyanduName =
    typeof data.posyandu === "object"
      ? data.posyandu?.nama_posyandu
      : data.posyandu || data.user?.posyandu?.nama_posyandu || "";

  const puskesmasName =
    typeof data.puskesmas === "object"
      ? data.puskesmas?.nama_puskesmas
      : data.puskesmas || data.user?.puskesmas?.nama_puskesmas || "";

  return {
    id: data.id || data.user?.id || null,
    email: data.email || data.user?.email || "",
    nama: data.nama_lengkap || data.nama || data.user?.nama_lengkap || data.user?.nama || "",
    nama_lengkap: data.nama_lengkap || data.nama || data.user?.nama_lengkap || data.user?.nama || "",
    posyandu: posyanduName || "",
    posyandu_id: data.posyandu_id || data.posyandu?.id || data.user?.posyandu_id || null,
    puskesmas: puskesmasName || "",
    puskesmas_id: data.puskesmas_id || data.puskesmas?.id || data.user?.puskesmas_id || null,
    roleType,
    role: roleTitle,
    telepon: data.telepon || data.user?.telepon || "",
    nik: data.nik || data.user?.nik || "",
    profile_picture: rawPhoto || null,
  };
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [authScreen, setAuthScreen] = useState("login");

  // =========================================================
  // GLOBAL USER STATE
  // =========================================================
  const [user, setUser] = useState(INITIAL_USER_STATE);

  // =========================================================
  // GLOBAL DATA
  // =========================================================
  const [globalSasaranList, setGlobalSasaranList] = useState([]);

  const [globalPemeriksaanData, setGlobalPemeriksaanData] = useState({});

  const [globalStatistikSasaran, setGlobalStatistikSasaran] = useState({});

  const [isGlobalStatistikLoading, setIsGlobalStatistikLoading] = useState(false);

  const [globalJadwalList, setGlobalJadwalList] = useState([]);

  const [globalPosyanduList, setGlobalPosyanduList] = useState([]);

  const [globalRujukanList, setGlobalRujukanList] = useState([]);

  const [activePemeriksaanWargaId, setActivePemeriksaanWargaId] = useState(null);

  const [pemeriksaanReturnTo, setPemeriksaanReturnTo] = useState(null);

  const [categoryFilterParam, setCategoryFilterParam] = useState("Semua Kategori");

  // =========================================================
  // FETCH BACKEND DATA
  // =========================================================
  const fetchBackendData = async () => {
    const token = localStorage.getItem("token");

    let currentBackendRole = user.roleType;

    if (token) {
      try {
        const meRes = await userService.getMe();

        if (meRes?.data) {
          const u = meRes.data;
          const formatted = formatUserObject(u);

          // Resolve nama Puskesmas jika belum ada tetapi memiliki puskesmas_id
          if (u.puskesmas_id && !formatted.puskesmas) {
            try {
              const puskesmasRes = await posyanduService.getPublicPuskesmasList();
              const found = (Array.isArray(puskesmasRes?.data) ? puskesmasRes.data : []).find(
                (item) => String(item?.id) === String(u.puskesmas_id)
              );
              if (found) {
                formatted.puskesmas = found.nama_puskesmas || "";
                formatted.puskesmas_id = found.id;
              }
            } catch (error) {
              console.warn("Gagal mengambil nama Puskesmas user:", error);
            }
          }

          // Resolve nama Posyandu jika belum ada tetapi memiliki posyandu_id
          if (u.posyandu_id && !formatted.posyandu) {
            try {
              const posyanduRes = await posyanduService.getPosyanduById(u.posyandu_id);
              if (posyanduRes?.data) {
                formatted.posyandu = posyanduRes.data.nama_posyandu || "";
                formatted.posyandu_id = posyanduRes.data.id;
              }
            } catch (error) {
              // ignore
            }
          }

          currentBackendRole = formatted.roleType;
          setUser(formatted);
          recordLogin(u);
        }
      } catch (err) {
        console.info("Token sesi lokal, menggunakan profil tersimpan.");
      }
    }

    // =======================================================
    // ROLE ACCESS
    // =======================================================
    const isSA = currentBackendRole === "sa";
    const isDinkesAdminRole = ["dinkesAdmin", "dinkes-admin"].includes(currentBackendRole);
    const isDinkesRole = ["dinkes", "dinkesAdmin", "dinkes-staf", "dinkes-admin"].includes(currentBackendRole);
    const isPuskesmasRole = ["puskesmas", "puskesmasAdmin", "puskesmas-admin", "puskesmas-staf", "puskesmas-user"].includes(currentBackendRole);
    const canAccessPersonalData = true; // Otorisasi data dikendalikan langsung oleh token backend

    // =======================================================
    // STATISTIK SASARAN
    // =======================================================
    try {
      setIsGlobalStatistikLoading(true);

      const statistikRes = await wargaService.getStatistikSasaran();

      setGlobalStatistikSasaran(statistikRes?.data || {});
    } catch (err) {
      console.error("Gagal mengambil statistik sasaran dari backend:", err);

      setGlobalStatistikSasaran({});
    } finally {
      setIsGlobalStatistikLoading(false);
    }

    // =======================================================
    // PEMERIKSAAN
    // =======================================================
    let backendPemMap = {};

    try {
      if (canAccessPersonalData) {
        const resPem = await pemeriksaanService.getAllPemeriksaan();

        const pemItems = resPem?.data?.items || resPem?.data;

        if (Array.isArray(pemItems)) {
          pemItems.forEach((p) => {
            if (!p) return;

            const wId = p.kunjungan?.warga_id || p.warga_id || p.sasaranId || p.kunjungan?.warga?.id || p.warga?.id;

            if (wId) {
              const residentKey = String(wId);
              const existing = backendPemMap[residentKey];
              const existingDate = String(existing?.tanggal || "").slice(0, 10);
              const recordDate = String(p.tanggal || "").slice(0, 10);
              if (!existing || recordDate > existingDate || (recordDate === existingDate && Number(p.id) > Number(existing.id))) {
                backendPemMap[residentKey] = p;
              }
            }

            if (p.id) {
              backendPemMap[`exam_${p.id}`] = p;
            }
          });

          setGlobalPemeriksaanData(backendPemMap);
        } else if (resPem?.data && typeof resPem.data === "object" && !Array.isArray(resPem.data)) {
          setGlobalPemeriksaanData(resPem.data);
        }
      }
    } catch (err) {
      console.info("Backend Pemeriksaan API offline.");
      if (canAccessPersonalData) setGlobalPemeriksaanData({});
    }

    // =======================================================
    // DATA WARGA
    // =======================================================
    try {
      if (canAccessPersonalData) {
        const resWarga = await wargaService.getAllWarga({
          page: 1,
          limit: 100,
          status_domisili: "all",
        });

        // Normalisasi berbagai kemungkinan bentuk response service
        const wargaPayload = resWarga?.data ?? resWarga;

        const wargaItems = Array.isArray(wargaPayload) ? wargaPayload : Array.isArray(wargaPayload?.items) ? wargaPayload.items : Array.isArray(wargaPayload?.data) ? wargaPayload.data : [];

        console.log("[APP] Data warga awal:", {
          response: resWarga,
          total: wargaItems.length,
        });

        const mapped = wargaItems.map(mapBackendWargaToFrontend).filter(Boolean);

        setGlobalSasaranList((prev) => {
          return mapped.map((w) => {
            const existing = prev.find((p) => String(p.id) === String(w.id));

            const exam = backendPemMap[w.id] || backendPemMap[String(w.id)];

            const statusLangkah = exam?.kunjungan?.status_langkah;

            const isCompleted = !!exam || statusLangkah === "langkah_5" || statusLangkah === "selesai";

            if (isCompleted) {
              return {
                ...w,
                statusPemeriksaan: "Sudah",
                tglPeriksa: exam?.tanggal ? String(exam.tanggal).split("T")[0] : (w.tglPeriksa || ""),
                exam: exam,
              };
            }

            return existing
              ? {
                  ...existing,
                  ...w,
                }
              : w;
          });
        });
      }
    } catch (err) {
      console.error("Gagal mengambil Data Warga dari backend:", err);
    }
    
    // =======================================================
    // POSYANDU & PUSKESMAS (DIAMBIL UNTUK SEMUA ROLE KARENA DIGUNAKAN DI FILTER DATA)
    // =======================================================
    try {
      const posyanduRes = await posyanduService.getAllPosyandu();
      const rawPosList = Array.isArray(posyanduRes?.data) ? posyanduRes.data : [];
      const cleanPosList = rawPosList
        .map((p) => ({
          ...p,
          nama: cleanPosyanduName(p.nama || p.nama_posyandu || ""),
          puskesmas: cleanPuskesmasName(p.puskesmas || p.puskesmas?.nama_puskesmas || ""),
        }))
        .sort((a, b) => (a.nama || "").localeCompare(b.nama || "", undefined, { numeric: true, sensitivity: "base" }));
      setGlobalPosyanduList(cleanPosList);

      // Sinkronkan ke globalSasaranList jika ada warga yang belum punya puskesmas
      setGlobalSasaranList((prevList) => {
        if (!Array.isArray(prevList) || prevList.length === 0) return prevList;
        return prevList.map((item) => {
          if (item.puskesmas && !item.puskesmas.toLowerCase().startsWith("puskesmas")) return item;
          const match = cleanPosList.find(
            (p) => (item.posyandu_id && p.id === item.posyandu_id) || (p.nama && p.nama.toLowerCase() === (item.posyandu || "").toLowerCase())
          );
          if (match?.puskesmas) {
            return {
              ...item,
              puskesmas: cleanPuskesmasName(match.puskesmas),
              posyandu: cleanPosyanduName(item.posyandu || match.nama || ""),
            };
          }
          return item;
        });
      });
    } catch (err) {
      console.error("Gagal mengambil data Posyandu secara global:", err);
      setGlobalPosyanduList([]);
    }
    // =======================================================
    // RUJUKAN PUSKESMAS
    // =======================================================
    if (isPuskesmasRole) {
      try {
        const rujukanRes = await rujukanService.getAllRujukan();
        setGlobalRujukanList(Array.isArray(rujukanRes?.data) ? rujukanRes.data : []);
      } catch (err) {
        console.error("Gagal mengambil data Rujukan Puskesmas:", err);
        setGlobalRujukanList([]);
      }
    }

    // =======================================================
    // JADWAL
    // =======================================================
    try {
      const resSesi = await sesiService.getAllSesi();

      const sesiItems = resSesi?.data?.items || resSesi?.data || (Array.isArray(resSesi) ? resSesi : null);

      if (Array.isArray(sesiItems)) {
        const mappedSesi = sesiItems.map(mapBackendSesiToFrontend).filter(Boolean);

        setGlobalJadwalList(mappedSesi);
      }
    } catch (err) {
      console.info("Backend Sesi API offline.");
    }
  };

  // =========================================================
  // RESTORE SESSION
  // =========================================================
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      return;
    }

    setIsAuthenticated(true);
  }, []);

  // =========================================================
  // LOAD BACKEND DATA AFTER LOGIN & REALTIME SYNC MULTI-ROLE
  // =========================================================
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchBackendData();

    // 1. Subscribe ke BroadcastChannel & Storage Event lintas tab / role
    const unsubscribe = subscribeRealtimeEvent(() => {
      fetchBackendData();
    });

    // 2. Refetch otomatis ketika user kembali ke tab browser
    const handleFocus = () => {
      fetchBackendData();
    };
    window.addEventListener("focus", handleFocus);

    // 3. Polling lembut setiap 12 detik sebagai jaring pengaman sinkronisasi
    const pollInterval = setInterval(() => {
      fetchBackendData();
    }, 12000);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // =========================================================
  // TOKEN EXPIRED
  // =========================================================
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(INITIAL_USER_STATE);
      setIsAuthenticated(false);
      setAuthScreen("login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // =========================================================
  // NAVIGATION
  // =========================================================
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [activeSubmenu, setActiveSubmenu] = useState("balita-12-59");

  // =========================================================
  // LOGIN SUCCESS
  // =========================================================
  const handleLoginSuccess = (loginData) => {
    const formattedUser = formatUserObject(loginData);
    setUser(formattedUser);
    recordLogin(loginData);
    setActiveMenu("dashboard");
    setIsAuthenticated(true);
  };

  // =========================================================
  // NAVIGATION HANDLER
  // =========================================================
  const handleNavigate = (menu, submenu = null, options = {}) => {
    const isStafUser = user?.roleType === "puskesmas-staf" || user?.roleType === "dinkes-staf";
    const targetMenu = isStafUser && (menu === "data-sasaran" || menu === "pemantauan-rujukan") ? "laporan-ekspor" : menu;

    setActiveMenu(targetMenu);

    if (submenu) {
      setActiveSubmenu(submenu);
    }

    if (options.wargaId) {
      setActivePemeriksaanWargaId(options.wargaId);
    } else if (menu !== "pemeriksaan") {
      setActivePemeriksaanWargaId(null);
    }

    if (options.returnTo) {
      setPemeriksaanReturnTo(options.returnTo);
    } else if (menu !== "pemeriksaan") {
      setPemeriksaanReturnTo(null);
    }

    if (options.kategori) {
      setCategoryFilterParam(options.kategori);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout error", e);
    }

    // Reset user state to initial empty state to prevent leakage to next login
    setUser(INITIAL_USER_STATE);

    // Clear all global cached data
    setGlobalSasaranList([]);
    setGlobalPemeriksaanData({});
    setGlobalStatistikSasaran({});
    setGlobalJadwalList([]);
    setGlobalPosyanduList([]);
    setGlobalRujukanList([]);
    setActivePemeriksaanWargaId(null);
    setPemeriksaanReturnTo(null);

    setIsAuthenticated(false);

    setAuthScreen("login");

    setActiveMenu("dashboard");
  };

  // =========================================================
  // AUTH SCREEN
  // =========================================================
  if (!isAuthenticated) {
    if (authScreen === "register-kader" || authScreen === "register-puskesmas" || authScreen === "register-dinkes") {
      const role = authScreen.replace("register-", "");

      return <RegisterPage role={role} onRegisterSuccess={() => setAuthScreen("login")} onGoToLogin={() => setAuthScreen("login")} />;
    }

    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToRegister={(role) => setAuthScreen(`register-${role}`)} />;
  }

  // =========================================================
  // ROLE FLAGS
  // =========================================================
  const isDinkes = user.roleType === "dinkes" || user.roleType === "dinkes-admin" || user.roleType === "dinkes-staf";

  const isDinkesAdmin = user.roleType === "dinkes-admin";

  const isDinkesStaf = user.roleType === "dinkes-staf" || user.roleType === "dinkes";

  const isPuskesmas = user.roleType === "puskesmas" || user.roleType === "puskesmas-admin" || user.roleType === "puskesmas-staf";

  const isPuskesmasAdmin = user.roleType === "puskesmas" || user.roleType === "puskesmas-admin";

  const isPuskesmasStaf = user.roleType === "puskesmas-staf";

  // =========================================================
  // SUPER ADMIN (SA)
  // =========================================================
  const isSA = user.roleType === "sa";
  if (isSA) {
    return (
      <AppLayout user={user} activeMenu={activeMenu} activeSubmenu={activeSubmenu} onNavigate={handleNavigate} onLogout={handleLogout}>
        {activeMenu === "dashboard" && (
          <SADashboardPage
            onNavigate={handleNavigate}
            user={user}
            globalStatistikSasaran={globalStatistikSasaran}
            isGlobalStatistikLoading={isGlobalStatistikLoading}
            globalJadwalList={globalJadwalList}
            globalPosyanduList={globalPosyanduList}
            onRefreshData={fetchBackendData}
          />
        )}

        {(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "kader" && (
          <PuskesmasVerifikasiKaderPage activeSubmenu="kader" onRefreshData={fetchBackendData} user={user} themeColor="#475569" />
        )}
        {(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu !== "kader" && (
          <SAVerifikasiAkunPage activeSubmenu={activeSubmenu || "puskesmas"} onRefreshData={fetchBackendData} user={user} />
        )}

        {activeMenu === "data-sasaran" && (
          <SADataSasaranPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalStatistikSasaran={globalStatistikSasaran}
            isGlobalStatistikLoading={isGlobalStatistikLoading}
            privacyMode={false}
            onNavigate={handleNavigate}
            initialCategoryFilter={categoryFilterParam}
            setCategoryFilterParam={setCategoryFilterParam}
            onRefreshData={fetchBackendData}
            user={user}
            globalPosyanduList={globalPosyanduList}
          />
        )}

        {(activeMenu === "jadwal" || activeMenu === "jadwal-monitoring") && (
          <SAJadwalMonitoringPage globalJadwalList={globalJadwalList} onRefreshData={fetchBackendData} user={user} />
        )}

        {activeMenu === "laporan-ekspor" && (
          <PuskesmasRekapitulasiPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalStatistikSasaran={globalStatistikSasaran}
            globalPosyanduList={globalPosyanduList}
            onNavigate={handleNavigate}
            onRefreshData={fetchBackendData}
            user={user}
            userRole={"sa"}
            theme={"sa"}
          />
        )}

        {activeMenu === "profil-pengguna" && (
          <ProfilPenggunaPage
            user={{
              ...user,
              roleType: "sa",
            }}
            onUpdateUser={(updated) =>
              setUser((prev) => ({
                ...prev,
                ...updated,
              }))
            }
          />
        )}
      </AppLayout>
    );
  }

  // =========================================================
  // DINKES
  // =========================================================
  if (isDinkes) {
    return (
      <AppLayout user={user} activeMenu={activeMenu} activeSubmenu={activeSubmenu} onNavigate={handleNavigate} onLogout={handleLogout}>
        {activeMenu === "dashboard" && (
          <DinkesDashboardPage
            onNavigate={handleNavigate}
            user={user}
            globalStatistikSasaran={globalStatistikSasaran}
            isGlobalStatistikLoading={isGlobalStatistikLoading}
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalPosyanduList={globalPosyanduList}
            globalJadwalList={globalJadwalList}
            onRefreshData={fetchBackendData}
          />
        )}

        {isDinkesAdmin && (activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu === "kader" && (
          <PuskesmasVerifikasiKaderPage activeSubmenu="kader" onRefreshData={fetchBackendData} user={user} themeColor="#0f2b5c" />
        )}
        {isDinkesAdmin && (activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && activeSubmenu !== "kader" && (
          <DinkesVerifikasiAkunPage activeSubmenu={activeSubmenu || "puskesmas"} onRefreshData={fetchBackendData} user={user} />
        )}

        {activeMenu === "data-sasaran" && (
          <DinkesDataSasaranPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalStatistikSasaran={globalStatistikSasaran}
            isGlobalStatistikLoading={isGlobalStatistikLoading}
            privacyMode={!isDinkesAdmin}
            onNavigate={handleNavigate}
            initialCategoryFilter={categoryFilterParam}
            setCategoryFilterParam={setCategoryFilterParam}
            onRefreshData={fetchBackendData}
            user={user}
            globalPosyanduList={globalPosyanduList}
          />
        )}

        {(activeMenu === "jadwal" || activeMenu === "jadwal-monitoring") && <DinkesJadwalMonitoringPage globalJadwalList={globalJadwalList} onRefreshData={fetchBackendData} user={user} />}

        {activeMenu === "laporan-ekspor" && (
          <PuskesmasRekapitulasiPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalStatistikSasaran={globalStatistikSasaran}
            onNavigate={handleNavigate}
            onRefreshData={fetchBackendData}
            user={user}
            userRole={user.roleType === "sa" ? "sa" : isDinkesAdmin ? "dinkes-admin" : "dinkes-staf"}
            globalPosyanduList={globalPosyanduList}
          />
        )}

        {activeMenu === "profil-pengguna" && (
          <ProfilPenggunaPage
            user={{
              ...user,
              roleType: user.roleType === "sa" ? "sa" : isDinkesAdmin ? "dinkes-admin" : "dinkes-staf",
            }}
            onUpdateUser={(updated) =>
              setUser((prev) => ({
                ...prev,
                ...updated,
              }))
            }
          />
        )}
      </AppLayout>
    );
  }

  // =========================================================
  // PUSKESMAS
  // =========================================================
  if (isPuskesmas) {
    return (
      <AppLayout user={user} activeMenu={activeMenu} activeSubmenu={activeSubmenu} onNavigate={handleNavigate} onLogout={handleLogout}>
        {isPuskesmasAdmin && (activeMenu === "verifikasi-kader" || activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && (
          <PuskesmasVerifikasiKaderPage activeSubmenu={activeSubmenu || "kader"} onRefreshData={fetchBackendData} user={user} themeColor="#3b7d6b" />
        )}

        {activeMenu === "dashboard" && (
          <PuskesmasDashboardPage
            onNavigate={handleNavigate}
            user={user}
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalJadwalList={globalJadwalList}
            globalPosyanduList={globalPosyanduList}
            globalRujukanList={globalRujukanList}
            globalStatistikSasaran={globalStatistikSasaran}
            isGlobalStatistikLoading={isGlobalStatistikLoading}
            onRefreshData={fetchBackendData}
          />
        )}

        {activeMenu === "jadwal" && <PuskesmasJadwalPage globalJadwalList={globalJadwalList} setGlobalJadwalList={setGlobalJadwalList} onRefreshData={fetchBackendData} />}

        {activeMenu === "data-sasaran" && isPuskesmasAdmin && (
          <PuskesmasDataSasaranPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            onNavigate={handleNavigate}
            initialCategoryFilter={categoryFilterParam}
            setCategoryFilterParam={setCategoryFilterParam}
            onRefreshData={fetchBackendData}
          />
        )}

        {activeMenu === "pemantauan-rujukan" && isPuskesmasAdmin && <PuskesmasPemantauanRujukanPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onRefreshData={fetchBackendData} />}

        {activeMenu === "laporan-ekspor" && (
          <PuskesmasRekapitulasiPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalStatistikSasaran={globalStatistikSasaran}
            onNavigate={handleNavigate}
            onRefreshData={fetchBackendData}
            user={user}
            userRole={isPuskesmasStaf ? "puskesmas-staf" : "puskesmas-admin"}
            globalPosyanduList={globalPosyanduList}
          />
        )}

        {(activeMenu === "profil-instansi" || activeMenu === "profil-pengguna") && (
          <ProfilPenggunaPage
            user={{
              ...user,
              roleType: isPuskesmasAdmin ? "puskesmas" : "puskesmas-staf",
            }}
            onUpdateUser={(updated) =>
              setUser((prev) => ({
                ...prev,
                ...updated,
              }))
            }
          />
        )}
      </AppLayout>
    );
  }

  // =========================================================
  // KADER
  // =========================================================
  return (
    <AppLayout user={user} activeMenu={activeMenu} activeSubmenu={activeSubmenu} onNavigate={handleNavigate} onLogout={handleLogout} globalJadwalList={globalJadwalList}>
      {activeMenu === "dashboard" && (
        <DashboardPage onNavigate={handleNavigate} user={user} globalJadwalList={globalJadwalList} globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onRefreshData={fetchBackendData} />
      )}

      {activeMenu === "jadwal" && <KaderJadwalPage globalJadwalList={globalJadwalList} setGlobalJadwalList={setGlobalJadwalList} user={user} onRefreshData={fetchBackendData} />}

      {activeMenu === "data-sasaran" && (
        <DataSasaranPage
          globalSasaranList={globalSasaranList}
          setGlobalSasaranList={setGlobalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          onNavigate={handleNavigate}
          initialCategoryFilter={categoryFilterParam}
          setCategoryFilterParam={setCategoryFilterParam}
          onRefreshData={fetchBackendData}
        />
      )}

      {activeMenu === "profil-pengguna" && (
        <ProfilPenggunaPage
          user={user}
          onUpdateUser={(updated) =>
            setUser((prev) => ({
              ...prev,
              ...updated,
            }))
          }
        />
      )}

      {activeMenu === "pemeriksaan" && (
        <PemeriksaanPage
          activeSubmenu={activeSubmenu}
          onNavigate={handleNavigate}
          globalSasaranList={globalSasaranList}
          setGlobalSasaranList={setGlobalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          setGlobalPemeriksaanData={setGlobalPemeriksaanData}
          activePemeriksaanWargaId={activePemeriksaanWargaId}
          returnTo={pemeriksaanReturnTo}
          globalJadwalList={globalJadwalList}
          onRefreshData={fetchBackendData}
        />
      )}

      {activeMenu === "rekap-pemeriksaan" && (
        <RekapPemeriksaanPage
          onNavigate={handleNavigate}
          globalSasaranList={globalSasaranList}
          setGlobalSasaranList={setGlobalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          setGlobalPemeriksaanData={setGlobalPemeriksaanData}
          onRefreshData={fetchBackendData}
        />
      )}

      {activeMenu === "riwayat-rujukan" && <KaderRiwayatRujukanPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onNavigate={handleNavigate} onRefreshData={fetchBackendData} />}
    </AppLayout>
  );
}
