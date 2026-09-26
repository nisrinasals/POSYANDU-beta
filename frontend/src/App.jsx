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
import DinkesRekapitulasiPage from "./pages/dinkes/DinkesRekapitulasiPage";
import RekapTemplateExcelView from "./components/pemeriksaan/RekapTemplateExcelView";

import { authService, sesiService, pemeriksaanService, userService, posyanduService } from "./services";
import wargaService from "./services/wargaService";
import { mapBackendWargaToFrontend, mapBackendSesiToFrontend } from "./utils/dataMappers";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState("login"); // 'login' | 'register-kader' | 'register-puskesmas' | 'register-dinkes'
  const [user, setUser] = useState({
    id: null,
    email: "",
    nama: "",
    posyandu: "",
    posyandu_id: null,
    puskesmas_id: null,
    roleType: "",
    role: "",
    telepon: "",
    nik: "",
  });

  // Shared Global Data State (Directly synced with real database)
  const [globalSasaranList, setGlobalSasaranList] = useState([]);
  const [globalPemeriksaanData, setGlobalPemeriksaanData] = useState({});
  const [globalJadwalList, setGlobalJadwalList] = useState([]);
  const [activePemeriksaanWargaId, setActivePemeriksaanWargaId] = useState(null);
  const [categoryFilterParam, setCategoryFilterParam] = useState("Semua Kategori");

  const fetchBackendData = async () => {
    // 1. Ambil Profil User Terkini jika token ada
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const meRes = await userService.getMe();
        if (meRes?.data) {
          const u = meRes.data;
          let roleType = u.role || "";
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
            id: u.id,
            email: u.email || prev.email,
            nama: u.nama_lengkap || prev.nama,
            posyandu: u.posyandu?.nama_posyandu || prev.posyandu,
            posyandu_id: u.posyandu_id || u.posyandu?.id || prev.posyandu_id,
            puskesmas_id: u.puskesmas_id || u.puskesmas?.id || prev.puskesmas_id,
            roleType: roleType,
            role: roleTitle,
            telepon: u.telepon || prev.telepon,
            nik: u.nik || prev.nik,
          }));

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
              // Profile remains usable even when the scoped Posyandu lookup fails.
            }
          }
        }
      } catch (err) {
        console.info("Token sesi lokal, menggunakan profil tersimpan.");
      }
    }

    // 2. Ambil Rekam Pemeriksaan Posyandu terlebih dahulu untuk memetakan status pemeriksaan warga
    let backendPemMap = {};
    try {
      const resPem = await pemeriksaanService.getAllPemeriksaan();
      const pemItems = resPem?.data?.items || resPem?.data;
      if (Array.isArray(pemItems)) {
        pemItems.forEach((p) => {
          if (p) {
            const wId = p.kunjungan?.warga_id || p.warga_id || p.sasaranId || p.kunjungan?.warga?.id || p.warga?.id;
            if (wId) {
              backendPemMap[wId] = p;
              backendPemMap[String(wId)] = p;
            }
            if (p.id) {
              backendPemMap[`exam_${p.id}`] = p;
            }
          }
        });
        setGlobalPemeriksaanData((prev) => ({ ...prev, ...backendPemMap }));
      } else if (resPem?.data && typeof resPem.data === "object" && !Array.isArray(resPem.data)) {
        setGlobalPemeriksaanData((prev) => ({ ...prev, ...resPem.data }));
      }
    } catch (err) {
      console.info("Backend Pemeriksaan API offline.");
    }

    // 3. Ambil Data Warga
    try {
      const resWarga = await wargaService.getAllWarga({
        status_domisili: "all",
      });
      const wargaItems = resWarga?.data?.items || resWarga?.data || (Array.isArray(resWarga) ? resWarga : null);
      if (Array.isArray(wargaItems)) {
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
            return w;
          });
        });
      }
    } catch (err) {
      console.error("Gagal mengambil Data Warga dari backend:", err);
    }

    // 4. Ambil Jadwal Sesi Posyandu
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

  // Restore an authenticated session from the backend token.
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    setIsAuthenticated(true);
  }, []);

  // Load real data from the backend after authentication.
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendData();
    }
  }, [isAuthenticated]);

  // Handle Token Expiration from API Interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setAuthScreen("login");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Navigation states
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeSubmenu, setActiveSubmenu] = useState("balita-12-59");

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
      roleType,
      role: roleTitle,
      telepon: loginData.telepon || prev.telepon,
      nik: loginData.nik || prev.nik,
    }));
    setActiveMenu("dashboard");
    setIsAuthenticated(true);
  };

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

  // 1. Unauthenticated Auth Flows
  if (!isAuthenticated) {
    if (authScreen === "register-kader" || authScreen === "register-puskesmas" || authScreen === "register-dinkes") {
      const role = authScreen.replace("register-", "");
      return <RegisterPage role={role} onRegisterSuccess={() => setAuthScreen("login")} onGoToLogin={() => setAuthScreen("login")} />;
    }

    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToRegister={(role) => setAuthScreen(`register-${role}`)} />;
  }

  // Helper flags
  const isDinkes = user.roleType === "dinkes" || user.roleType === "dinkes-admin" || user.roleType === "dinkes-staf";
  const isDinkesAdmin = user.roleType === "dinkes-admin";
  const isDinkesStaf = user.roleType === "dinkes-staf" || user.roleType === "dinkes";

  const isPuskesmas = user.roleType === "puskesmas" || user.roleType === "puskesmas-admin" || user.roleType === "puskesmas-staf";
  const isPuskesmasAdmin = user.roleType === "puskesmas" || user.roleType === "puskesmas-admin";
  const isPuskesmasStaf = user.roleType === "puskesmas-staf";

  // 2. Authenticated Dinas Kesehatan (Dinkes) Role Views
  if (isDinkes) {
    return (
      <AppLayout user={user} activeMenu={activeMenu} activeSubmenu={activeSubmenu} onNavigate={handleNavigate} onLogout={handleLogout}>
        {activeMenu === "dashboard" && (
          <DinkesDashboardPage onNavigate={handleNavigate} user={user} globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} globalJadwalList={globalJadwalList} onRefreshData={fetchBackendData} />
        )}
        {isDinkesAdmin && (activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && <DinkesVerifikasiAkunPage activeSubmenu={activeSubmenu || "puskesmas"} onRefreshData={fetchBackendData} />}
        {activeMenu === "data-sasaran" && (
          <DinkesDataSasaranPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            onNavigate={handleNavigate}
            initialCategoryFilter={categoryFilterParam}
            setCategoryFilterParam={setCategoryFilterParam}
            onRefreshData={fetchBackendData}
          />
        )}
        {(activeMenu === "jadwal" || activeMenu === "jadwal-monitoring") && <DinkesJadwalMonitoringPage globalJadwalList={globalJadwalList} onRefreshData={fetchBackendData} />}
        {activeMenu === "laporan-ekspor" &&
          (isDinkesStaf ? (
            /* TAMPILAN KHUSUS STAF DINKES: HANYA TEMPLATE EXCEL KEMENKES (TANPA DATA BY NAME) */
            <RekapTemplateExcelView globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} userRole="dinkes-staf" user={user} />
          ) : (
            /* TAMPILAN ADMIN DINKES: DATA BY NAME & DETAIL REKAP LENGKAP */
            <DinkesRekapitulasiPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onNavigate={handleNavigate} onRefreshData={fetchBackendData} />
          ))}
        {activeMenu === "profil-pengguna" && <ProfilPenggunaPage user={{ ...user, roleType: isDinkesAdmin ? "dinkes-admin" : "dinkes-staf" }} onUpdateUser={(updated) => setUser({ ...user, ...updated })} />}
      </AppLayout>
    );
  }

  // 3. Authenticated Puskesmas Role Views
  if (isPuskesmas) {
    return (
      <AppLayout user={user} activeMenu={activeMenu} activeSubmenu={activeSubmenu} onNavigate={handleNavigate} onLogout={handleLogout}>
        {isPuskesmasAdmin && (activeMenu === "verifikasi-kader" || activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && (
          <PuskesmasVerifikasiKaderPage activeSubmenu={activeSubmenu || "kader"} onRefreshData={fetchBackendData} />
        )}
        {activeMenu === "dashboard" && (
          <PuskesmasDashboardPage onNavigate={handleNavigate} globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} globalJadwalList={globalJadwalList} onRefreshData={fetchBackendData} />
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
        {isPuskesmasAdmin && activeMenu === "pemantauan-rujukan" && <PuskesmasPemantauanRujukanPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onRefreshData={fetchBackendData} />}
        {activeMenu === "laporan-ekspor" &&
          (isPuskesmasStaf ? (
            /* TAMPILAN KHUSUS STAF PUSKESMAS: HANYA TEMPLATE EXCEL KEMENKES (TANPA DATA BY NAME) */
            <RekapTemplateExcelView globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} userRole="puskesmas-staf" user={user} />
          ) : (
            /* TAMPILAN ADMIN PUSKESMAS: DATA BY NAME & DETAIL REKAP LENGKAP */
            <PuskesmasRekapitulasiPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onNavigate={handleNavigate} onRefreshData={fetchBackendData} />
          ))}
        {(activeMenu === "profil-instansi" || activeMenu === "profil-pengguna") && (
          <ProfilPenggunaPage user={{ ...user, roleType: isPuskesmasAdmin ? "puskesmas" : "puskesmas-staf" }} onUpdateUser={(updated) => setUser({ ...user, ...updated })} />
        )}
      </AppLayout>
    );
  }

  // 3. Authenticated Kader Role Views
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
      {activeMenu === "profil-pengguna" && <ProfilPenggunaPage user={user} onUpdateUser={(updated) => setUser({ ...user, ...updated })} />}
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
