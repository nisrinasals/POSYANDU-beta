<<<<<<< HEAD
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
    const isDinkesRole = ["dinkes", "dinkesAdmin", "dinkes-staf", "dinkes-admin"].includes(currentBackendRole);

    const isDinkesAdminRole = ["dinkesAdmin", "dinkes-admin"].includes(currentBackendRole);
    const canAccessPersonalData = !isDinkesRole || isDinkesAdminRole;
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
=======
import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DataSasaranPage from './pages/kader/DataSasaranPage';
import ProfilPenggunaPage from './pages/kader/ProfilPenggunaPage';
import DashboardPage from './pages/kader/DashboardPage';
import PemeriksaanPage from './pages/kader/PemeriksaanPage';
import RekapPemeriksaanPage from './pages/kader/RekapPemeriksaanPage';
import KaderRiwayatRujukanPage from './pages/kader/KaderRiwayatRujukanPage';
import PuskesmasDashboardPage from './pages/puskesmas/PuskesmasDashboardPage';
import PuskesmasVerifikasiKaderPage from './pages/puskesmas/PuskesmasVerifikasiKaderPage';
import PuskesmasDataSasaranPage from './pages/puskesmas/PuskesmasDataSasaranPage';
import PuskesmasRekapitulasiPage from './pages/puskesmas/PuskesmasRekapitulasiPage';
import PuskesmasPemantauanRujukanPage from './pages/puskesmas/PuskesmasPemantauanRujukanPage';
import PuskesmasJadwalPage from './pages/puskesmas/PuskesmasJadwalPage';
import KaderJadwalPage from './pages/kader/KaderJadwalPage';
import DinkesDashboardPage from './pages/dinkes/DinkesDashboardPage';
import DinkesVerifikasiAkunPage from './pages/dinkes/DinkesVerifikasiAkunPage';
import DinkesDataSasaranPage from './pages/dinkes/DinkesDataSasaranPage';
import DinkesJadwalMonitoringPage from './pages/dinkes/DinkesJadwalMonitoringPage';
import DinkesRekapitulasiPage from './pages/dinkes/DinkesRekapitulasiPage';
import RekapTemplateExcelView from './components/pemeriksaan/RekapTemplateExcelView';
import { initialUserProfile, initialSasaranList, initialPemeriksaanData, initialJadwalList } from './data/mockData';
import { authService, wargaService, sesiService, pemeriksaanService, userService } from './services';
import { mapBackendWargaToFrontend, mapBackendSesiToFrontend } from './utils/dataMappers';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register-kader' | 'register-puskesmas' | 'register-dinkes'
  const [user, setUser] = useState(initialUserProfile);
  
  // Shared Global Data State (Directly synced with real database)
  const [globalSasaranList, setGlobalSasaranList] = useState([]);
  const [globalPemeriksaanData, setGlobalPemeriksaanData] = useState({});
  const [globalJadwalList, setGlobalJadwalList] = useState([]);
  const [activePemeriksaanWargaId, setActivePemeriksaanWargaId] = useState(null);
  const [categoryFilterParam, setCategoryFilterParam] = useState('Semua Kategori');

  const fetchBackendData = async () => {
    // 1. Ambil Profil User Terkini jika token ada
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const meRes = await userService.getMe();
        if (meRes?.data) {
          const u = meRes.data;
          let roleTitle = 'Kader';
          let roleType = u.role || 'kader';
          if (roleType === 'dinkesAdmin' || roleType === 'dinkes-admin') {
            roleTitle = 'Admin Dinas Kesehatan';
            roleType = 'dinkes-admin';
          } else if (roleType === 'dinkes' || roleType === 'dinkes-staf') {
            roleTitle = 'Staf Dinas Kesehatan';
            roleType = 'dinkes-staf';
          } else if (roleType === 'puskesmasAdmin' || roleType === 'puskesmas') {
            roleTitle = 'Admin Puskesmas Sukamaju';
            roleType = 'puskesmas';
          } else if (roleType === 'puskesmas-staf') {
            roleTitle = 'Staf Puskesmas Sukamaju';
            roleType = 'puskesmas-staf';
          }

          setUser(prev => ({
            ...prev,
            id: u.id,
            email: u.email || prev.email,
            nama: u.nama_lengkap || prev.nama,
            posyandu: u.posyandu?.nama_posyandu || prev.posyandu,
            roleType: roleType,
            role: roleTitle,
            telepon: u.telepon || prev.telepon,
            nik: u.nik || prev.nik
          }));
        }
      } catch (err) {
        console.info('Token sesi lokal, menggunakan profil tersimpan.');
      }
    }

    // 2. Ambil Rekam Pemeriksaan Posyandu terlebih dahulu untuk memetakan status pemeriksaan warga
    let backendPemMap = {};
    try {
      const resPem = await pemeriksaanService.getPemeriksaanList();
      const pemItems = resPem?.data?.items || resPem?.data;
      if (Array.isArray(pemItems)) {
        pemItems.forEach(p => {
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
        setGlobalPemeriksaanData(prev => ({ ...prev, ...backendPemMap }));
      } else if (resPem?.data && typeof resPem.data === 'object' && !Array.isArray(resPem.data)) {
        setGlobalPemeriksaanData(prev => ({ ...prev, ...resPem.data }));
      }
    } catch (err) {
      console.info('Backend Pemeriksaan API offline.');
    }

    // 3. Ambil Data Warga
    try {
      const resWarga = await wargaService.getWargaList();
      const wargaItems = resWarga?.data?.items || resWarga?.data || (Array.isArray(resWarga) ? resWarga : null);
      if (Array.isArray(wargaItems)) {
        const mapped = wargaItems.map(mapBackendWargaToFrontend).filter(Boolean);
        setGlobalSasaranList(prev => {
          return mapped.map(w => {
            const existing = prev.find(p => String(p.id) === String(w.id));
            const hasExam = !!backendPemMap[w.id] || !!backendPemMap[String(w.id)] || (existing && (existing.statusPemeriksaan === 'Sudah' || existing.status === 'Sudah'));
            if (hasExam) {
              return {
                ...w,
                statusPemeriksaan: 'Sudah',
                tglPeriksa: existing?.tglPeriksa || (backendPemMap[w.id]?.tanggal ? String(backendPemMap[w.id].tanggal).split('T')[0] : '24-09-2026'),
                bb: existing?.bb || w.bb,
                tb: existing?.tb || w.tb
              };
            }
            return w;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          });
        });
      }
    } catch (err) {
<<<<<<< HEAD
      console.error("Gagal mengambil Data Warga dari backend:", err);
    }
    // =======================================================
    // POSYANDU & RUJUKAN PUSKESMAS
    // =======================================================
    if (isPuskesmasRole) {
      try {
        const [posyanduRes, rujukanRes] = await Promise.all([posyanduService.getAllPosyandu(), rujukanService.getAllRujukan()]);

        setGlobalPosyanduList(Array.isArray(posyanduRes?.data) ? posyanduRes.data : []);
        setGlobalRujukanList(Array.isArray(rujukanRes?.data) ? rujukanRes.data : []);
      } catch (err) {
        console.error("Gagal mengambil data Posyandu/Rujukan Puskesmas:", err);
        setGlobalPosyanduList([]);
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
=======
      console.info('Backend Warga API offline.');
    }

    // 4. Ambil Jadwal Sesi Posyandu
    try {
      const resSesi = await sesiService.getSesiList();
      const sesiItems = resSesi?.data?.items || resSesi?.data || (Array.isArray(resSesi) ? resSesi : null);
      if (Array.isArray(sesiItems)) {
        const mappedSesi = sesiItems.map(mapBackendSesiToFrontend).filter(Boolean);
        setGlobalJadwalList(mappedSesi);
      }
    } catch (err) {
      console.info('Backend Sesi API offline.');
    }
  };

  // Load Real Data from Backend on Authenticated Mount
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendData();
    }
<<<<<<< HEAD

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

=======
  }, [isAuthenticated]);

  // Handle Token Expiration from API Interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setAuthScreen('login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Navigation states
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubmenu, setActiveSubmenu] = useState('balita-12-59');

  const handleLoginSuccess = (loginData) => {
    const roleType = loginData.roleType || 'kader';
    let roleTitle = 'Kader';
    let defaultMenu = 'dashboard';
    let defaultNama = user.nama || 'Dzakiyah Al Zahrani';
    let defaultPosyandu = 'Posyandu Melati';

    if (roleType === 'dinkes-admin') {
      roleTitle = 'Admin Dinas Kesehatan';
      defaultNama = 'dr. H. Rahmat Hidayat, M.Kes';
      defaultPosyandu = 'Dinas Kesehatan Kota';
    } else if (roleType === 'dinkes-staf' || roleType === 'dinkes') {
      roleTitle = 'Staf Dinas Kesehatan';
      defaultNama = 'Anisa Mayasari, SKM';
      defaultPosyandu = 'Dinas Kesehatan Kota';
    } else if (roleType === 'puskesmas' || roleType === 'puskesmas-admin') {
      roleTitle = 'Admin Puskesmas Sukamaju';
      defaultNama = 'dr. Hendra Setiawan';
      defaultPosyandu = 'Puskesmas Pembina Sukamaju';
    } else if (roleType === 'puskesmas-staf') {
      roleTitle = 'Staf Puskesmas Sukamaju';
      defaultNama = 'dr. Sarah Amanda Putri';
      defaultPosyandu = 'Puskesmas Sukamaju';
    }

    setUser({
      ...user,
      email: loginData.email,
      nama: defaultNama,
      posyandu: defaultPosyandu,
      roleType: roleType,
      role: roleTitle
    });
    setActiveMenu(defaultMenu);
    setIsAuthenticated(true);
  };

  const handleNavigate = (menu, submenu = null, options = {}) => {
    setActiveMenu(menu);
    if (submenu) {
      setActiveSubmenu(submenu);
    }
    if (options.wargaId) {
      setActivePemeriksaanWargaId(options.wargaId);
    } else if (menu !== 'pemeriksaan') {
      setActivePemeriksaanWargaId(null);
    }
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    if (options.kategori) {
      setCategoryFilterParam(options.kategori);
    }
  };

<<<<<<< HEAD
  // =========================================================
  // LOGOUT
  // =========================================================
=======
  const handleToggleRole = () => {
    // 5-way rotation: Kader -> Puskesmas Admin -> Puskesmas Staf -> Dinkes Admin -> Dinkes Staf -> Kader
    let nextRole = 'puskesmas';
    let nextRoleTitle = 'Admin Puskesmas Sukamaju';
    let nextNama = 'dr. Hendra Setiawan';
    let nextPosyandu = 'Puskesmas Pembina Sukamaju';

    if (user.roleType === 'kader') {
      nextRole = 'puskesmas';
      nextRoleTitle = 'Admin Puskesmas Sukamaju';
      nextNama = 'dr. Hendra Setiawan';
      nextPosyandu = 'Puskesmas Pembina Sukamaju';
    } else if (user.roleType === 'puskesmas' || user.roleType === 'puskesmas-admin') {
      nextRole = 'puskesmas-staf';
      nextRoleTitle = 'Staf Puskesmas Sukamaju';
      nextNama = 'dr. Sarah Amanda Putri';
      nextPosyandu = 'Puskesmas Sukamaju';
    } else if (user.roleType === 'puskesmas-staf') {
      nextRole = 'dinkes-admin';
      nextRoleTitle = 'Admin Dinas Kesehatan Kota';
      nextNama = 'dr. H. Rahmat Hidayat, M.Kes';
      nextPosyandu = 'Dinas Kesehatan Kota';
    } else if (user.roleType === 'dinkes-admin') {
      nextRole = 'dinkes-staf';
      nextRoleTitle = 'Staf Dinas Kesehatan';
      nextNama = 'Anisa Mayasari, SKM';
      nextPosyandu = 'Dinas Kesehatan Kota';
    } else {
      nextRole = 'kader';
      nextRoleTitle = 'Kader';
      nextNama = 'Dzakiyah Al Zahrani';
      nextPosyandu = 'Posyandu Melati';
    }

    setUser({
      ...user,
      roleType: nextRole,
      role: nextRoleTitle,
      nama: nextNama,
      posyandu: nextPosyandu
    });
    setActiveMenu('dashboard');
  };

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
<<<<<<< HEAD
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
=======
      console.warn('Logout error', e);
    }
    setIsAuthenticated(false);
    setAuthScreen('login');
    setActiveMenu('dashboard');
  };

  // 1. Unauthenticated Auth Flows
  if (!isAuthenticated) {
    if (authScreen === 'register-kader' || authScreen === 'register-puskesmas' || authScreen === 'register-dinkes') {
      const role = authScreen.replace('register-', '');
      return (
        <RegisterPage 
          role={role}
          onRegisterSuccess={() => setAuthScreen('login')}
          onGoToLogin={() => setAuthScreen('login')}
        />
      );
    }

    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={(role) => setAuthScreen(`register-${role}`)}
      />
    );
  }

  // Helper flags
  const isDinkes = user.roleType === 'dinkes' || user.roleType === 'dinkes-admin' || user.roleType === 'dinkes-staf';
  const isDinkesAdmin = user.roleType === 'dinkes-admin';
  const isDinkesStaf = user.roleType === 'dinkes-staf' || user.roleType === 'dinkes';

  const isPuskesmas = user.roleType === 'puskesmas' || user.roleType === 'puskesmas-admin' || user.roleType === 'puskesmas-staf';
  const isPuskesmasAdmin = user.roleType === 'puskesmas' || user.roleType === 'puskesmas-admin';
  const isPuskesmasStaf = user.roleType === 'puskesmas-staf';

  // 2. Authenticated Dinas Kesehatan (Dinkes) Role Views
  if (isDinkes) {
    return (
      <AppLayout 
        user={user}
        activeMenu={activeMenu}
        activeSubmenu={activeSubmenu}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onToggleRole={handleToggleRole}
      >
        {activeMenu === 'dashboard' && (
          <DinkesDashboardPage 
            onNavigate={handleNavigate} 
            user={user}
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            globalJadwalList={globalJadwalList}
            onRefreshData={fetchBackendData}
          />
        )}
<<<<<<< HEAD

        {isDinkesAdmin && (activeMenu === "verifikasi-akun" || activeMenu === "manajemen-akun") && <DinkesVerifikasiAkunPage activeSubmenu={activeSubmenu || "puskesmas"} onRefreshData={fetchBackendData} />}

        {activeMenu === "data-sasaran" && (
          <DinkesDataSasaranPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalStatistikSasaran={globalStatistikSasaran}
            isGlobalStatistikLoading={isGlobalStatistikLoading}
            privacyMode={!isDinkesAdmin}
=======
        {isDinkesAdmin && (activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun') && (
          <DinkesVerifikasiAkunPage 
            activeSubmenu={activeSubmenu || 'puskesmas'}
            onRefreshData={fetchBackendData}
          />
        )}
        {activeMenu === 'data-sasaran' && (
          <DinkesDataSasaranPage 
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            onNavigate={handleNavigate}
            initialCategoryFilter={categoryFilterParam}
            setCategoryFilterParam={setCategoryFilterParam}
            onRefreshData={fetchBackendData}
          />
        )}
<<<<<<< HEAD

        {(activeMenu === "jadwal" || activeMenu === "jadwal-monitoring") && <DinkesJadwalMonitoringPage globalJadwalList={globalJadwalList} onRefreshData={fetchBackendData} />}

        {activeMenu === "laporan-ekspor" &&
          (isDinkesAdmin ? (
            <PuskesmasRekapitulasiPage
              globalSasaranList={globalSasaranList}
              globalPemeriksaanData={globalPemeriksaanData}
              onNavigate={handleNavigate}
              user={user}
              userRole="dinkes-admin"
            />
          ) : (
            <RekapTemplateExcelView userRole="dinkes-staf" user={user} />
          ))}

        {activeMenu === "profil-pengguna" && (
          <ProfilPenggunaPage
            user={{
              ...user,
              roleType: isDinkesAdmin ? "dinkes-admin" : "dinkes-staf",
            }}
            onUpdateUser={(updated) =>
              setUser((prev) => ({
                ...prev,
                ...updated,
              }))
            }
=======
        {(activeMenu === 'jadwal' || activeMenu === 'jadwal-monitoring') && (
          <DinkesJadwalMonitoringPage 
            globalJadwalList={globalJadwalList}
            onRefreshData={fetchBackendData}
          />
        )}
        {activeMenu === 'laporan-ekspor' && (
          isDinkesStaf ? (
            /* TAMPILAN KHUSUS STAF DINKES: HANYA TEMPLATE EXCEL KEMENKES (TANPA DATA BY NAME) */
            <RekapTemplateExcelView 
              globalSasaranList={globalSasaranList}
              globalPemeriksaanData={globalPemeriksaanData}
              userRole="dinkes-staf"
              user={user}
            />
          ) : (
            /* TAMPILAN ADMIN DINKES: DATA BY NAME & DETAIL REKAP LENGKAP */
            <DinkesRekapitulasiPage 
              globalSasaranList={globalSasaranList}
              globalPemeriksaanData={globalPemeriksaanData}
              onNavigate={handleNavigate}
              onRefreshData={fetchBackendData}
            />
          )
        )}
        {activeMenu === 'profil-pengguna' && (
          <ProfilPenggunaPage 
            user={{ 
              ...user, 
              roleType: isDinkesAdmin ? 'dinkes-admin' : 'dinkes-staf',
              nama: user.nama || (isDinkesAdmin ? "dr. H. Rahmat Hidayat, M.Kes" : "Anisa Mayasari, SKM"), 
              posyandu: "Dinas Kesehatan Kota",
              email: user.email || (isDinkesAdmin ? "admin.dinkes@depok.go.id" : "staf.dinkes@depok.go.id")
            }} 
            onUpdateUser={(updated) => setUser({ ...user, ...updated })} 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          />
        )}
      </AppLayout>
    );
  }

<<<<<<< HEAD
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
=======
  // 3. Authenticated Puskesmas Role Views
  if (isPuskesmas) {
    return (
      <AppLayout 
        user={user}
        activeMenu={activeMenu}
        activeSubmenu={activeSubmenu}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onToggleRole={handleToggleRole}
      >
        {isPuskesmasAdmin && (activeMenu === 'verifikasi-kader' || activeMenu === 'verifikasi-akun' || activeMenu === 'manajemen-akun') && (
          <PuskesmasVerifikasiKaderPage activeSubmenu={activeSubmenu || 'kader'} onRefreshData={fetchBackendData} />
        )}
        {activeMenu === 'dashboard' && (
          <PuskesmasDashboardPage 
            onToggleRole={handleToggleRole} 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            onNavigate={handleNavigate}
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            globalJadwalList={globalJadwalList}
<<<<<<< HEAD
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
=======
            onRefreshData={fetchBackendData}
          />
        )}
        {activeMenu === 'jadwal' && (
          <PuskesmasJadwalPage 
            globalJadwalList={globalJadwalList}
            setGlobalJadwalList={setGlobalJadwalList}
            onRefreshData={fetchBackendData}
          />
        )}
        {activeMenu === 'data-sasaran' && (
          <PuskesmasDataSasaranPage 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            onNavigate={handleNavigate}
            initialCategoryFilter={categoryFilterParam}
            setCategoryFilterParam={setCategoryFilterParam}
            onRefreshData={fetchBackendData}
          />
        )}
<<<<<<< HEAD

        {activeMenu === "pemantauan-rujukan" && <PuskesmasPemantauanRujukanPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onRefreshData={fetchBackendData} />}

        {activeMenu === "laporan-ekspor" && (
          <PuskesmasRekapitulasiPage
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            onNavigate={handleNavigate}
            onRefreshData={fetchBackendData}
            user={user}
            userRole={isPuskesmasStaf ? "puskesmas-staf" : "puskesmas-admin"}
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
=======
        {isPuskesmasAdmin && activeMenu === 'pemantauan-rujukan' && (
          <PuskesmasPemantauanRujukanPage 
            globalSasaranList={globalSasaranList}
            globalPemeriksaanData={globalPemeriksaanData}
            onRefreshData={fetchBackendData}
          />
        )}
        {activeMenu === 'laporan-ekspor' && (
          isPuskesmasStaf ? (
            /* TAMPILAN KHUSUS STAF PUSKESMAS: HANYA TEMPLATE EXCEL KEMENKES (TANPA DATA BY NAME) */
            <RekapTemplateExcelView 
              globalSasaranList={globalSasaranList}
              globalPemeriksaanData={globalPemeriksaanData}
              userRole="puskesmas-staf"
              user={user}
            />
          ) : (
            /* TAMPILAN ADMIN PUSKESMAS: DATA BY NAME & DETAIL REKAP LENGKAP */
            <PuskesmasRekapitulasiPage 
              globalSasaranList={globalSasaranList}
              globalPemeriksaanData={globalPemeriksaanData}
              onNavigate={handleNavigate}
              onRefreshData={fetchBackendData}
            />
          )
        )}
        {(activeMenu === 'profil-instansi' || activeMenu === 'profil-pengguna') && (
          <ProfilPenggunaPage 
            user={{ 
              ...user, 
              roleType: isPuskesmasAdmin ? 'puskesmas' : 'puskesmas-staf', 
              nama: user.nama || (isPuskesmasAdmin ? "dr. Hendra Setiawan" : "dr. Sarah Amanda Putri"), 
              posyandu: isPuskesmasAdmin ? "Puskesmas Pembina Sukamaju" : "Puskesmas Sukamaju" 
            }} 
            onUpdateUser={(updated) => setUser({ ...user, ...updated })} 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          />
        )}
      </AppLayout>
    );
  }

<<<<<<< HEAD
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
=======
  // 3. Authenticated Kader Role Views
  return (
    <AppLayout 
      user={user}
      activeMenu={activeMenu}
      activeSubmenu={activeSubmenu}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onToggleRole={handleToggleRole}
    >
      {activeMenu === 'dashboard' && (
        <DashboardPage 
          onNavigate={handleNavigate} 
          globalSasaranList={globalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          onRefreshData={fetchBackendData}
        />
      )}
      {activeMenu === 'jadwal' && (
        <KaderJadwalPage 
          globalJadwalList={globalJadwalList}
          setGlobalJadwalList={setGlobalJadwalList}
          user={user}
          onRefreshData={fetchBackendData}
        />
      )}
      {activeMenu === 'data-sasaran' && (
        <DataSasaranPage 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          globalSasaranList={globalSasaranList}
          setGlobalSasaranList={setGlobalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          onNavigate={handleNavigate}
          initialCategoryFilter={categoryFilterParam}
          setCategoryFilterParam={setCategoryFilterParam}
          onRefreshData={fetchBackendData}
        />
      )}
<<<<<<< HEAD

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
=======
      {activeMenu === 'profil-pengguna' && (
        <ProfilPenggunaPage 
          user={user} 
          onUpdateUser={(updated) => setUser({ ...user, ...updated })} 
        />
      )}
      {activeMenu === 'pemeriksaan' && (
        <PemeriksaanPage 
          activeSubmenu={activeSubmenu} 
          onNavigate={handleNavigate} 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          globalSasaranList={globalSasaranList}
          setGlobalSasaranList={setGlobalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          setGlobalPemeriksaanData={setGlobalPemeriksaanData}
          activePemeriksaanWargaId={activePemeriksaanWargaId}
          onRefreshData={fetchBackendData}
        />
      )}
<<<<<<< HEAD

      {activeMenu === "rekap-pemeriksaan" && (
        <RekapPemeriksaanPage
          onNavigate={handleNavigate}
=======
      {activeMenu === 'rekap-pemeriksaan' && (
        <RekapPemeriksaanPage 
          onNavigate={handleNavigate} 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          globalSasaranList={globalSasaranList}
          setGlobalSasaranList={setGlobalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          setGlobalPemeriksaanData={setGlobalPemeriksaanData}
          onRefreshData={fetchBackendData}
        />
      )}
<<<<<<< HEAD

      {activeMenu === "riwayat-rujukan" && <KaderRiwayatRujukanPage globalSasaranList={globalSasaranList} globalPemeriksaanData={globalPemeriksaanData} onNavigate={handleNavigate} onRefreshData={fetchBackendData} />}
=======
      {activeMenu === 'riwayat-rujukan' && (
        <KaderRiwayatRujukanPage 
          globalSasaranList={globalSasaranList}
          globalPemeriksaanData={globalPemeriksaanData}
          onNavigate={handleNavigate}
          onRefreshData={fetchBackendData}
        />
      )}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    </AppLayout>
  );
}
