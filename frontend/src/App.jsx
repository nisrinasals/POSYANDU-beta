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

import { mapBackendWargaToFrontend, mapBackendSesiToFrontend } from "./utils/dataMappers";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [authScreen, setAuthScreen] = useState("login");

  // =========================================================
  // GLOBAL USER STATE
  // =========================================================
  const [user, setUser] = useState({
    id: null,
    email: "",
    nama: "",
    posyandu: "",
    posyandu_id: null,
    puskesmas: "",
    puskesmas_id: null,
    roleType: "",
    role: "",
    telepon: "",
    nik: "",
    profile_picture: null,
  });

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

          currentBackendRole = u.role || currentBackendRole;

          let roleType = currentBackendRole;

          let roleTitle = "Kader";

          if (roleType === "dinkesAdmin") {
            roleTitle = "Admin Dinas Kesehatan";
            roleType = "dinkes-admin";
          } else if (roleType === "dinkes") {
            roleTitle = "Staf Dinas Kesehatan";
            roleType = "dinkes-staf";
          } else if (roleType === "puskesmasAdmin") {
            roleTitle = "Admin Puskesmas";
            roleType = "puskesmas-admin";
          } else if (roleType === "puskesmas") {
            roleTitle = "Staf Puskesmas";
            roleType = "puskesmas-staf";
          } else if (roleType === "sa") {
            roleTitle = "Super Admin";
            roleType = "sa";
          }

          setUser((prev) => ({
            ...prev,

            id: u.id ?? prev.id,

            email: u.email || prev.email,

            nama: u.nama_lengkap || prev.nama,

            posyandu: u.posyandu?.nama_posyandu || prev.posyandu,

            puskesmas: u.puskesmas?.nama_puskesmas || u.puskesmas?.nama || prev.puskesmas,

            posyandu_id: u.posyandu_id || u.posyandu?.id || prev.posyandu_id,

            puskesmas_id: u.puskesmas_id || u.puskesmas?.id || prev.puskesmas_id,

            roleType: roleType,

            role: roleTitle,

            telepon: u.telepon || prev.telepon,

            nik: u.nik || prev.nik,

            /*
             * PENTING:
             * profile_picture sekarang disimpan
             * di global user.
             */
            profile_picture: u.profile_picture ?? u.profilePicture ?? u.foto_profil ?? u.foto ?? u.avatar ?? prev.profile_picture,
          }));

          // /users/me pada backend mengembalikan puskesmas_id, tetapi tidak menyertakan relasi puskesmas.
          // Resolve nama Puskesmas berdasarkan ID user agar sidebar/profil tidak mengambil nama Posyandu.
          if (u.puskesmas_id) {
            try {
              const puskesmasRes = await posyanduService.getPublicPuskesmasList();
              const puskesmas = (Array.isArray(puskesmasRes?.data) ? puskesmasRes.data : []).find((item) => String(item?.id) === String(u.puskesmas_id));

              if (puskesmas) {
                setUser((prev) => ({
                  ...prev,
                  puskesmas: puskesmas.nama_puskesmas || prev.puskesmas,
                  puskesmas_id: puskesmas.id,
                }));
              }
            } catch (error) {
              console.warn("Gagal mengambil nama Puskesmas user:", error);
            }
          }

          if (u.posyandu_id) {
            try {
              const posyanduRes = await posyanduService.getPosyanduById(u.posyandu_id);

              const posyandu = posyanduRes?.data;

              if (posyandu) {
                setUser((prev) => ({
                  ...prev,
                  posyandu: posyandu.nama_posyandu || prev.posyandu,
                  posyandu_id: posyandu.id,
                }));
              }
            } catch (error) {
              // Profile tetap digunakan
              // walaupun lookup posyandu gagal.
            }
          }
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

    const isStafRole = ["dinkes-staf", "puskesmas-staf"].includes(currentBackendRole);
    const canAccessPersonalData = (isSA || !isDinkesRole || isDinkesAdminRole) && !isStafRole;
    const isPuskesmasRole = ["puskesmas", "puskesmasAdmin", "puskesmas-admin", "puskesmas-staf", "puskesmas-user"].includes(currentBackendRole);

    if (!canAccessPersonalData) {
      setGlobalPemeriksaanData({});
      setGlobalSasaranList([]);
    }

    if (!isPuskesmasRole) {
      setGlobalPosyanduList([]);
      setGlobalRujukanList([]);
    }

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

            const isCompleted = statusLangkah === "langkah_5";

            if (isCompleted) {
              return {
                ...w,
                statusPemeriksaan: "Sudah",
                tglPeriksa: exam?.tanggal ? String(exam.tanggal).split("T")[0] : "",
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
      setGlobalPosyanduList(Array.isArray(posyanduRes?.data) ? posyanduRes.data : []);
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
  // LOAD BACKEND DATA AFTER LOGIN
  // =========================================================
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendData();
    }

    // Jangan bergantung pada object user,
    // karena fetchBackendData sendiri membaca data terbaru.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // =========================================================
  // TOKEN EXPIRED
  // =========================================================
  useEffect(() => {
    const handleUnauthorized = () => {
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
    const backendRole = loginData.roleType || loginData.role || "";

    const roleMap = {
      kader: ["kader", "Kader"],

      puskesmas: ["puskesmas-staf", "Staf Puskesmas"],

      puskesmasAdmin: ["puskesmas-admin", "Admin Puskesmas"],

      dinkes: ["dinkes-staf", "Staf Dinas Kesehatan"],

      dinkesAdmin: ["dinkes-admin", "Admin Dinas Kesehatan"],

      sa: ["sa", "Super Admin"],
    };

    const [roleType, roleTitle] = roleMap[backendRole] || ["", ""];

    setUser((prev) => ({
      ...prev,

      id: loginData.id || loginData.user?.id || prev.id,

      email: loginData.email || loginData.user?.email || prev.email,

      nama: loginData.nama || loginData.nama_lengkap || loginData.user?.nama_lengkap || prev.nama,

      posyandu: loginData.posyandu?.nama_posyandu || loginData.posyandu || prev.posyandu,

      puskesmas: loginData.puskesmas?.nama_puskesmas || loginData.puskesmas?.nama || loginData.user?.puskesmas?.nama_puskesmas || prev.puskesmas,

      roleType,

      role: roleTitle,

      telepon: loginData.telepon || prev.telepon,

      nik: loginData.nik || prev.nik,

      /*
       * Tambahkan profile_picture
       * apabila login response memilikinya.
       */
      profile_picture:
        loginData.profile_picture ||
        loginData.profilePicture ||
        loginData.foto_profil ||
        loginData.foto ||
        loginData.avatar ||
        loginData.user?.profile_picture ||
        loginData.user?.profilePicture ||
        loginData.user?.foto_profil ||
        loginData.user?.foto ||
        loginData.user?.avatar ||
        prev.profile_picture,
    }));

    setActiveMenu("dashboard");

    setIsAuthenticated(true);
  };

  // =========================================================
  // NAVIGATION HANDLER
  // =========================================================
  const handleNavigate = (menu, submenu = null, options = {}) => {
    setActiveMenu(menu);

    if (submenu) {
      setActiveSubmenu(submenu);
    }

    if (options.wargaId) {
      setActivePemeriksaanWargaId(options.wargaId);
    } else if (menu !== "pemeriksaan") {
      setActivePemeriksaanWargaId(null);
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
            onRefreshData={fetchBackendData}
          />
        )}

        {(activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && (
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
            onNavigate={handleNavigate}
            onRefreshData={fetchBackendData}
            user={user}
            userRole={"sa"}
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
            globalJadwalList={globalJadwalList}
            onRefreshData={fetchBackendData}
          />
        )}

        {isDinkesAdmin && (activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && <DinkesVerifikasiAkunPage activeSubmenu={activeSubmenu || "puskesmas"} onRefreshData={fetchBackendData} user={user} />}

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
          <PuskesmasVerifikasiKaderPage activeSubmenu={activeSubmenu || "kader"} onRefreshData={fetchBackendData} />
        )}

        {activeMenu === "dashboard" && (
          <PuskesmasDashboardPage
            onNavigate={handleNavigate}
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

        {activeMenu === "data-sasaran" && (
          <PuskesmasDataSasaranPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            onNavigate={handleNavigate}
            initialCategoryFilter={categoryFilterParam}
            setCategoryFilterParam={setCategoryFilterParam}
            onRefreshData={fetchBackendData}
          />
        )}

        {activeMenu === "pemantauan-rujukan" && <PuskesmasPemantauanRujukanPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onRefreshData={fetchBackendData} />}

        {activeMenu === "laporan-ekspor" && (
          <PuskesmasRekapitulasiPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
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
    <AppLayout user={user} activeMenu={activeMenu} activeSubmenu={activeSubmenu} onNavigate={handleNavigate} onLogout={handleLogout}>
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
