import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  userService,
  posyanduService,
  pemeriksaanService,
  wargaService,
} from "../../services";
import { useNotification } from "../../context/NotificationContext";
import {
  Building2,
  Users,
  Calendar,
  UserCheck,
  TrendingUp,
  Download,
  ShieldCheck,
  Clock,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getMergedLoginHistory } from "../../utils/loginTracker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Filler,
  Legend
);

const ROLE_METADATA = {
  sa: {
    label: "Super Admin",
    badgeBg: "rgba(15, 23, 42, 0.08)",
    badgeColor: "#0f172a",
    borderColor: "#94a3b8",
  },
  dinkesAdmin: {
    label: "Admin Dinkes",
    badgeBg: "rgba(30, 58, 138, 0.1)",
    badgeColor: "#1e3a8a",
    borderColor: "#93c5fd",
  },
  dinkes: {
    label: "Staf Dinkes",
    badgeBg: "rgba(2, 132, 199, 0.1)",
    badgeColor: "#0284c7",
    borderColor: "#7dd3fc",
  },
  puskesmasAdmin: {
    label: "Admin Puskesmas",
    badgeBg: "rgba(15, 118, 110, 0.1)",
    badgeColor: "#0f766e",
    borderColor: "#5eead4",
  },
  puskesmas: {
    label: "Staf Puskesmas",
    badgeBg: "rgba(5, 150, 105, 0.1)",
    badgeColor: "#059669",
    borderColor: "#6ee7b7",
  },
  kader: {
    label: "Kader Posyandu",
    badgeBg: "rgba(124, 58, 237, 0.1)",
    badgeColor: "#7c3aed",
    borderColor: "#c4b5fd",
  },
};

const getRoleMeta = (roleKey) => {
  const norm = String(roleKey || "").replace(/[-_]/g, "").toLowerCase();
  if (norm === "sa" || norm === "superadmin") return ROLE_METADATA.sa;
  if (norm === "dinkesadmin") return ROLE_METADATA.dinkesAdmin;
  if (norm === "dinkes" || norm === "dinkesstaf") return ROLE_METADATA.dinkes;
  if (norm === "puskesmasadmin") return ROLE_METADATA.puskesmasAdmin;
  if (norm === "puskesmas" || norm === "puskesmasstaf") return ROLE_METADATA.puskesmas;
  return ROLE_METADATA.kader;
};

// Format tanggal & waktu serba angka: DD/MM/YYYY, HH:mm WIB
const formatNumericDateTime = (isoString) => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes} WIB`;
  } catch {
    return String(isoString);
  }
};

const formatUnitName = (name) => {
  if (!name || typeof name !== "string") return "-";
  return name.replace(/^(puskesmas|posyandu|pusk\.|pos\.)\s+/i, "").trim() || name;
};

const PUSKESMAS_LINE_COLORS = [
  { border: "#0d9488", bg: "rgba(13, 148, 136, 0.08)", point: "#0d9488" }, // Teal
  { border: "#2563eb", bg: "rgba(37, 99, 235, 0.08)", point: "#2563eb" },   // Blue
  { border: "#7c3aed", bg: "rgba(124, 58, 237, 0.08)", point: "#7c3aed" }, // Purple
  { border: "#ea580c", bg: "rgba(234, 88, 12, 0.08)", point: "#ea580c" },  // Orange
  { border: "#ec4899", bg: "rgba(236, 72, 153, 0.08)", point: "#ec4899" }, // Pink
  { border: "#059669", bg: "rgba(5, 150, 105, 0.08)", point: "#059669" },  // Emerald
  { border: "#0284c7", bg: "rgba(2, 132, 199, 0.08)", point: "#0284c7" },  // Sky
  { border: "#d97706", bg: "rgba(217, 119, 6, 0.08)", point: "#d97706" },  // Amber
  { border: "#6366f1", bg: "rgba(99, 102, 241, 0.08)", point: "#6366f1" }, // Indigo
  { border: "#e11d48", bg: "rgba(225, 29, 72, 0.08)", point: "#e11d48" },  // Rose
  { border: "#14b8a6", bg: "rgba(20, 184, 166, 0.08)", point: "#14b8a6" }, // Cyan
  { border: "#8b5cf6", bg: "rgba(139, 92, 246, 0.08)", point: "#8b5cf6" }, // Violet
];

export default function SADashboardPage({
  onNavigate,
  user,
  globalStatistikSasaran = {},
  isGlobalStatistikLoading = false,
  globalPosyanduList = [],
}) {
  const { showSuccess, showError } = useNotification();

  // Core Data States (Live from Backend)
  const [users, setUsers] = useState([]);
  const [posyanduList, setPosyanduList] = useState(globalPosyanduList || []);
  const [puskesmasList, setPuskesmasList] = useState([]);
  const [allPemeriksaan, setAllPemeriksaan] = useState([]);
  const [localStatistikSasaran, setLocalStatistikSasaran] = useState(globalStatistikSasaran || {});

  // Loading & Sync States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Filter Riwayat Login
  const [loginSearchTerm, setLoginSearchTerm] = useState("");
  const [loginRoleFilter, setLoginRoleFilter] = useState("all");
  const [loginCurrentPage, setLoginCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Grafik Tren Perbandingan Antar Puskesmas (Multi-Select Checkbox)
  const [periodeGrafik, setPeriodeGrafik] = useState("6bulan");
  const [selectedWilayah, setSelectedWilayah] = useState([]);
  const [isWilayahDropdownOpen, setIsWilayahDropdownOpen] = useState(false);
  const wilayahDropdownRef = useRef(null);
  const hasInitializedWilayah = useRef(false);

  // =========================================================================
  // 1. FETCH ALL DATA SECARA REALTIME DARI BACKEND
  // =========================================================================
  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);

    try {
      const [
        usersRes,
        posyanduRes,
        puskesmasRes,
        pemeriksaanRes,
        sasaranRes,
      ] = await Promise.all([
        userService.getAllUsers().catch((err) => {
          console.warn("Gagal memuat pengguna:", err);
          return { data: [] };
        }),
        posyanduService.getAllPosyandu().catch((err) => {
          console.warn("Gagal memuat posyandu:", err);
          return { data: [] };
        }),
        posyanduService.getPublicPuskesmasList().catch((err) => {
          console.warn("Gagal memuat puskesmas:", err);
          return { data: [] };
        }),
        pemeriksaanService.getAllPemeriksaan().catch((err) => {
          console.warn("Gagal memuat riwayat pemeriksaan:", err);
          return { data: [] };
        }),
        wargaService.getStatistikSasaran().catch((err) => {
          console.warn("Gagal memuat statistik sasaran:", err);
          return { data: {} };
        }),
      ]);

      setUsers(Array.isArray(usersRes?.data) ? usersRes.data : []);
      setPosyanduList(Array.isArray(posyanduRes?.data) ? posyanduRes.data : []);
      setPuskesmasList(Array.isArray(puskesmasRes?.data) ? puskesmasRes.data : []);

      const rawPemeriksaan = Array.isArray(pemeriksaanRes?.data)
        ? pemeriksaanRes.data
        : Array.isArray(pemeriksaanRes)
        ? pemeriksaanRes
        : [];
      setAllPemeriksaan(rawPemeriksaan);

      if (sasaranRes?.data && Object.keys(sasaranRes.data).length > 0) {
        setLocalStatistikSasaran(sasaranRes.data);
      }

      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // =========================================================================
  // 2. METRIK REALTIME UNTUK 4 KARTU ATAS (KOMPAK & TIDAK PADAT)
  // =========================================================================
  const pendingUsers = useMemo(() => users.filter((u) => u.status === "pending_approval"), [users]);
  const activeUsers = useMemo(() => users.filter((u) => u.status === "active"), [users]);

  const totalPuskesmas = puskesmasList.length;
  const totalPosyandu = posyanduList.length;
  const totalSasaran = Number(localStatistikSasaran?.total_warga || globalStatistikSasaran?.total_warga || 0);

  // =========================================================================
  // 3. RIWAYAT AKUN YANG LOGIN (BERSIH, TANPA ICON PENGGUNA, TANPA SESI GANDA)
  // =========================================================================
  const loginHistory = useMemo(() => {
    return getMergedLoginHistory(activeUsers, user);
  }, [activeUsers, user]);

  const filteredLoginHistory = useMemo(() => {
    return loginHistory.filter((item) => {
      if (loginRoleFilter !== "all") {
        const itemNorm = String(item.role || "").replace(/[-_]/g, "").toLowerCase();
        const filterNorm = String(loginRoleFilter).replace(/[-_]/g, "").toLowerCase();
        if (itemNorm !== filterNorm) return false;
      }

      if (loginSearchTerm.trim() !== "") {
        const query = loginSearchTerm.toLowerCase();
        const nama = (item.nama_lengkap || "").toLowerCase();
        const email = (item.email || "").toLowerCase();
        const puskesmas = (item.puskesmas || "").toLowerCase();
        const posyandu = (item.posyandu || "").toLowerCase();
        const role = (item.role || "").toLowerCase();

        return (
          nama.includes(query) ||
          email.includes(query) ||
          puskesmas.includes(query) ||
          posyandu.includes(query) ||
          role.includes(query)
        );
      }

      return true;
    });
  }, [loginHistory, loginRoleFilter, loginSearchTerm]);

  const totalLoginPages = Math.max(1, Math.ceil(filteredLoginHistory.length / itemsPerPage));
  const paginatedLoginHistory = useMemo(() => {
    const start = (loginCurrentPage - 1) * itemsPerPage;
    return filteredLoginHistory.slice(start, start + itemsPerPage);
  }, [filteredLoginHistory, loginCurrentPage, itemsPerPage]);

  useEffect(() => {
    setLoginCurrentPage(1);
  }, [loginRoleFilter, loginSearchTerm]);

  // =========================================================================
  // 4. LINE CHART PERBANDINGAN TREN ANTAR PUSKESMAS (PER KATEGORI PUSKESMAS)
  // =========================================================================
  const chartPeriods = useMemo(() => {
    const now = new Date();
    const periods = [];
    if (periodeGrafik === "6bulan") {
      for (let offset = 5; offset >= 0; offset -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
        const labelLong = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        periods.push({ monthKey, label, labelLong });
      }
    } else {
      const year = Number(periodeGrafik);
      for (let month = 0; month < 12; month += 1) {
        const d = new Date(year, month, 1);
        const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
        const label = `${String(month + 1).padStart(2, "0")}/${String(year).slice(-2)}`;
        const labelLong = `${String(month + 1).padStart(2, "0")}/${year}`;
        periods.push({ monthKey, label, labelLong });
      }
    }
    return periods;
  }, [periodeGrafik]);

  // Pengelompokan data rekaman pemeriksaan per Puskesmas dan per Bulan
  const puskesmasComparisonData = useMemo(() => {
    const puskMap = new Map();

    // 1. Inisialisasi setiap puskesmas dari master puskesmasList
    puskesmasList.forEach((p) => {
      const rawName = p.nama_puskesmas || p.nama || "";
      const cleanName = formatUnitName(rawName);
      if (cleanName && cleanName !== "-" && !puskMap.has(cleanName.toLowerCase())) {
        puskMap.set(cleanName.toLowerCase(), {
          id: p.id,
          name: cleanName,
          displayName: cleanName,
          total: 0,
          months: {},
        });
      }
    });

    // 2. Petakan setiap data pemeriksaan ke Puskesmas masing-masing
    allPemeriksaan.forEach((item) => {
      if (!item.tanggal) return;
      const monthKey = String(item.tanggal).slice(0, 7);

      let rawPuskName =
        item.kunjungan?.sesiPosyandu?.posyandu?.puskesmas?.nama_puskesmas ||
        item.kunjungan?.warga?.posyandu?.puskesmas?.nama_puskesmas;

      if (!rawPuskName) {
        const posId =
          item.kunjungan?.sesiPosyandu?.posyandu?.id ||
          item.kunjungan?.sesiPosyandu?.posyandu_id ||
          item.kunjungan?.warga?.posyandu_id;
        if (posId) {
          const matchedPos = posyanduList.find((p) => String(p.id) === String(posId));
          if (matchedPos) {
            rawPuskName =
              (typeof matchedPos.puskesmas === "object" ? matchedPos.puskesmas?.nama_puskesmas : matchedPos.puskesmas) ||
              puskesmasList.find((pk) => String(pk.id) === String(matchedPos.puskesmas_id))?.nama_puskesmas;
          }
        }
      }

      const cleanPuskName = formatUnitName(rawPuskName || "Gedongtengen");
      const puskKey = cleanPuskName.toLowerCase();

      if (!puskMap.has(puskKey)) {
        puskMap.set(puskKey, {
          id: cleanPuskName,
          name: cleanPuskName,
          displayName: cleanPuskName,
          total: 0,
          months: {},
        });
      }

      const entry = puskMap.get(puskKey);
      entry.total += 1;
      entry.months[monthKey] = (entry.months[monthKey] || 0) + 1;
    });

    // Urutkan: Puskesmas dengan data rekaman terbanyak di urutan teratas, sisanya alfabetis
    return [...puskMap.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [allPemeriksaan, puskesmasList, posyanduList]);

  // Inisialisasi awal pilihan wilayah (default 3 teratas atau yang ada data)
  useEffect(() => {
    if (!hasInitializedWilayah.current && puskesmasComparisonData.length > 0) {
      setSelectedWilayah(puskesmasComparisonData.slice(0, 3).map((p) => p.name));
      hasInitializedWilayah.current = true;
    }
  }, [puskesmasComparisonData]);

  // Tutup dropdown wilayah saat klik di luar elemen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wilayahDropdownRef.current && !wilayahDropdownRef.current.contains(event.target)) {
        setIsWilayahDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAllSelected =
    puskesmasComparisonData.length > 0 && selectedWilayah.length === puskesmasComparisonData.length;

  const handleToggleWilayah = (name) => {
    setSelectedWilayah((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleToggleAllWilayah = () => {
    if (isAllSelected) {
      setSelectedWilayah([]);
    } else {
      setSelectedWilayah(puskesmasComparisonData.map((p) => p.name));
    }
  };

  const getWilayahDropdownLabel = () => {
    if (selectedWilayah.length === 0) return "Pilih Wilayah";
    if (isAllSelected) return "Semua Wilayah";
    if (selectedWilayah.length === 1) return selectedWilayah[0];
    return `${selectedWilayah.length} Wilayah Dipilih`;
  };

  const activePuskList = useMemo(() => {
    return puskesmasComparisonData.filter((p) => selectedWilayah.includes(p.name));
  }, [puskesmasComparisonData, selectedWilayah]);

  // Available Years untuk filter grafik
  const availableYears = useMemo(() => {
    const yrs = [
      ...new Set(
        allPemeriksaan.map((item) => String(item.tanggal || "").slice(0, 4)).filter((y) => /^\d{4}$/.test(y))
      ),
    ];
    if (yrs.length === 0) yrs.push(String(new Date().getFullYear()));
    return yrs.sort((a, b) => Number(b) - Number(a));
  }, [allPemeriksaan]);

  // Dataset perbandingan antar Puskesmas untuk Line Chart
  const chartDataConfig = useMemo(() => {
    const labels = chartPeriods.map((p) => p.label);
    if (activePuskList.length === 0) {
      return { labels, datasets: [] };
    }

    const datasets = activePuskList.map((pusk, index) => {
      const colorScheme = PUSKESMAS_LINE_COLORS[index % PUSKESMAS_LINE_COLORS.length];
      const dataPoints = chartPeriods.map((period) => pusk.months[period.monthKey] || 0);

      return {
        label: pusk.name,
        data: dataPoints,
        borderColor: colorScheme.border,
        backgroundColor: colorScheme.bg,
        fill: activePuskList.length === 1,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: colorScheme.point,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4.5,
        pointHoverRadius: 7,
      };
    });

    return {
      labels,
      datasets,
    };
  }, [activePuskList, chartPeriods]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Bebaskan kanvas grafik dari teks berjejer panjang
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11.5 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items) => {
            if (items.length > 0) {
              const period = chartPeriods[items[0].dataIndex];
              return `Periode Bulan: ${period?.labelLong || items[0].label}`;
            }
            return "";
          },
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("id-ID")} Warga`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#64748b",
          font: { size: 11 },
          padding: 8,
        },
        grid: { color: "#f1f5f9" },
        border: { dash: [4, 4], color: "#e2e8f0" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#334155", font: { size: 11.5, weight: "600" } },
        border: { color: "#cbd5e1" },
      },
    },
  };

  return (
    <div className="d-flex flex-column gap-4 pb-5">
      {/* ========================================================================= */}
      {/* 1. CLEAN EXECUTIVE HERO BANNER                                             */}
      {/* ========================================================================= */}
      <div
        className="card border-0 rounded-4 text-white shadow-sm p-4"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div
              className="d-inline-flex align-items-center gap-2 fw-semibold px-3 py-1 rounded-pill mb-2"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "0.78rem",
              }}
            >
              <ShieldCheck size={14} className="text-info" />
              <span>Pusat Kendali Pengguna &amp; Layanan</span>
            </div>

            <h3 className="fw-bold mb-1 text-white fs-4">
              Dashboard Super Administrator
            </h3>
            <p className="mb-0 text-white-50 small" style={{ maxWidth: "620px", fontSize: "0.85rem", lineHeight: "1.5" }}>
              Pusat pemantauan akun login, perbandingan tren rekaman layanan antar Puskesmas, dan registri fasyankes se-kota.
            </p>
          </div>

          {/* Quick Refresh Button & Last Sync */}
          <div className="d-flex flex-column align-items-md-end gap-1 flex-shrink-0">
            <button
              className="btn btn-light d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 shadow-sm"
              onClick={() => fetchAllData(false)}
              disabled={isRefreshing}
              style={{ fontSize: "0.825rem" }}
            >
              <RefreshCw size={14} className={isRefreshing ? "spin-animation" : ""} />
              <span>{isRefreshing ? "Menyinkronkan..." : "Segarkan Data"}</span>
            </button>
            {lastSyncTime && (
              <span className="small text-white-50" style={{ fontSize: "0.72rem" }}>
                Terakhir diperbarui: {lastSyncTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATISTIK 4 KARTU KONSISTEN (TOTAL LOGIN, PENDING, SASARAN, 18/34 UNIT) */}
      {/* ========================================================================= */}
      <div>
        <div className="text-uppercase fw-bold text-secondary small mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.08em" }}>
          RINGKASAN SISTEM
        </div>

        <div className="row g-3">
          {/* Card 1: Total Akun yang Login */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all" style={{ borderLeftColor: "#0284c7" }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                  TOTAL AKUN LOGIN
                </span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(2, 132, 199, 0.1)", color: "#0284c7", width: "40px", height: "40px" }}
                >
                  <Users size={19} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <span className="fw-bolder text-dark fs-3 mb-0">{isLoading ? "..." : loginHistory.length}</span>
                <span className="text-muted fw-medium small">Akun</span>
              </div>
              <div className="text-muted small" style={{ fontSize: "0.78rem" }}>
                Akun aktif terotentikasi ke sistem
              </div>
            </div>
          </div>

          {/* Card 2: Menunggu Persetujuan */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all"
              style={{ borderLeftColor: pendingUsers.length > 0 ? "#f59e0b" : "#10b981", cursor: "pointer" }}
              onClick={() => onNavigate("verifikasi-akun", "puskesmas")}
              title="Buka menu verifikasi akun"
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                  MENUNGGU PERSETUJUAN
                </span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: pendingUsers.length > 0 ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                    color: pendingUsers.length > 0 ? "#d97706" : "#059669",
                    width: "40px",
                    height: "40px",
                  }}
                >
                  <Clock size={19} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <span className={`fw-bolder fs-3 mb-0 ${pendingUsers.length > 0 ? "text-warning" : "text-dark"}`}>
                  {isLoading ? "..." : pendingUsers.length}
                </span>
                <span className="text-muted fw-medium small">Akun</span>
              </div>
              <div className="text-muted small" style={{ fontSize: "0.78rem" }}>
                {pendingUsers.length > 0 ? "Memerlukan persetujuan Admin" : "Semua akun telah diproses"}
              </div>
            </div>
          </div>

          {/* Card 3: Total Sasaran */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all"
              style={{ borderLeftColor: "#7c3aed", cursor: "pointer" }}
              onClick={() => onNavigate("data-sasaran")}
              title="Buka data sasaran warga"
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                  TOTAL SASARAN
                </span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(124, 58, 237, 0.1)", color: "#7c3aed", width: "40px", height: "40px" }}
                >
                  <UserCheck size={19} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <span className="fw-bolder text-dark fs-3 mb-0">
                  {isGlobalStatistikLoading ? "..." : totalSasaran.toLocaleString("id-ID")}
                </span>
                <span className="text-muted fw-medium small">Jiwa</span>
              </div>
              <div className="text-muted small" style={{ fontSize: "0.78rem" }}>
                Warga sasaran terdata se-kota
              </div>
            </div>
          </div>

          {/* Card 4: Ringkas & Kompak (Contoh: 18 / 34 Unit Faskes & Pos) */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card border bg-white shadow-xs rounded-4 p-4 h-100 border-start border-4 transition-all"
              style={{ borderLeftColor: "#0f766e", cursor: "pointer" }}
              onClick={() => onNavigate("laporan-ekspor")}
              title="Buka rekapitulasi posyandu & faskes"
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                  PUSKESMAS / POSYANDU
                </span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(15, 118, 110, 0.1)", color: "#0f766e", width: "40px", height: "40px" }}
                >
                  <Building2 size={19} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-1.5 mb-1">
                <span className="fw-bolder text-dark fs-3 mb-0">{totalPuskesmas}</span>
                <span className="text-muted fw-bold fs-4 opacity-40">/</span>
                <span className="fw-bolder text-dark fs-3 mb-0">{totalPosyandu}</span>
                <span className="text-muted small fw-medium ms-1">Faskes &amp; Pos</span>
              </div>
              <div className="text-muted small text-truncate" style={{ fontSize: "0.78rem" }}>
                {totalPuskesmas} Faskes Pembina • {totalPosyandu} Pos Layanan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GRAFIK TREN PERBANDINGAN REKAMAN PEMERIKSAAN ANTAR PUSKESMAS           */}
      {/* ========================================================================= */}
      <div className="card border-0 bg-white shadow-sm rounded-4 p-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
          <div>
            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <TrendingUp size={18} className="text-success" />
              <span>Tren Rekaman Layanan Antar Puskesmas</span>
            </h6>
            <p className="text-muted small mb-0" style={{ fontSize: "0.78rem" }}>
              Perbandingan tren rekaman pemeriksaan kesehatan masyarakat antar wilayah.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Filter Wilayah (Multi-select Checkbox Dropdown tanpa icon dan tanpa embel-embel) */}
            <div className="position-relative" ref={wilayahDropdownRef}>
              <button
                type="button"
                className="btn btn-sm bg-light border rounded-3 fw-semibold text-dark shadow-none d-flex align-items-center justify-content-between gap-2"
                style={{ fontSize: "0.8rem", height: "35px", minWidth: "175px" }}
                onClick={() => setIsWilayahDropdownOpen((prev) => !prev)}
              >
                <span className="text-truncate" style={{ maxWidth: "140px" }}>
                  {getWilayahDropdownLabel()}
                </span>
                <ChevronDown size={14} className="text-muted flex-shrink-0" />
              </button>

              {isWilayahDropdownOpen && (
                <div
                  className="position-absolute end-0 mt-1 bg-white border rounded-3 shadow-lg p-2"
                  style={{ zIndex: 1050, minWidth: "220px", maxWidth: "260px" }}
                >
                  <div className="d-flex align-items-center justify-content-between px-2 py-1 pb-2 border-bottom">
                    <label className="d-flex align-items-center gap-2 small fw-semibold text-dark mb-0 cursor-pointer user-select-none">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        checked={isAllSelected}
                        onChange={handleToggleAllWilayah}
                      />
                      <span>Pilih Semua</span>
                    </label>
                    {selectedWilayah.length > 0 && !isAllSelected && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none text-muted"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => setSelectedWilayah([])}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div
                    className="d-flex flex-column gap-1 pt-2"
                    style={{ maxHeight: "230px", overflowY: "auto" }}
                  >
                    {puskesmasComparisonData.map((p) => {
                      const isChecked = selectedWilayah.includes(p.name);
                      return (
                        <label
                          key={p.name}
                          className="d-flex align-items-center gap-2 px-2 py-1.5 rounded-2 small text-dark mb-0 cursor-pointer user-select-none hover-bg-light"
                          style={{ fontSize: "0.8rem" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={isChecked}
                            onChange={() => handleToggleWilayah(p.name)}
                          />
                          <span className="text-truncate">{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Periode (Tanpa icon) */}
            <select
              className="form-select form-select-sm bg-light border rounded-3 fw-medium text-dark shadow-none"
              value={periodeGrafik}
              onChange={(e) => setPeriodeGrafik(e.target.value)}
              style={{ fontSize: "0.8rem", height: "35px", minWidth: "140px" }}
            >
              <option value="6bulan">6 Bulan Terakhir</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend Wilayah Terpilih */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 px-3 py-2 rounded-3 bg-light border">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {activePuskList.length === 0 ? (
              <span className="small text-muted" style={{ fontSize: "0.78rem" }}>
                Tidak ada wilayah yang dipilih
              </span>
            ) : (
              activePuskList.map((p, idx) => {
                const color = PUSKESMAS_LINE_COLORS[idx % PUSKESMAS_LINE_COLORS.length];
                return (
                  <span
                    key={p.name}
                    className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-white border small fw-medium"
                    style={{ fontSize: "0.75rem" }}
                  >
                    <span
                      className="rounded-circle"
                      style={{ width: "8px", height: "8px", backgroundColor: color.border }}
                    ></span>
                    <span className="text-dark">{p.name}</span>
                  </span>
                );
              })
            )}
          </div>

          <span className="small text-muted ms-auto" style={{ fontSize: "0.72rem" }}>
            Periode: {periodeGrafik === "6bulan" ? "6 Bulan Terakhir" : `Tahun ${periodeGrafik}`}
          </span>
        </div>

        {/* Multi-Line Chart Canvas Antar Puskesmas */}
        <div className="position-relative w-100" style={{ height: "310px" }}>
          {activePuskList.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
              Pilih minimal satu wilayah pada dropdown di atas untuk menampilkan grafik.
            </div>
          ) : (
            <Line data={chartDataConfig} options={chartOptions} />
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="d-flex align-items-center justify-content-end pt-3 border-top mt-3">
          <button
            className="btn btn-sm btn-light border text-dark fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 shadow-none"
            onClick={() => onNavigate("laporan-ekspor")}
            style={{ fontSize: "0.785rem" }}
          >
            <Download size={13} />
            <span>Unduh Rekapitulasi (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LOG AKTIVITAS AKSES PENGGUNA (BERSIH, SEARCHBAR BEBAS OVERLAP, WARNA SA)*/}
      {/* ========================================================================= */}
      <div className="card border-0 bg-white shadow-sm rounded-4 p-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
          <div>
            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-secondary" />
              <span>Log Aktivitas Akses Pengguna</span>
            </h6>
            <p className="text-muted small mb-0" style={{ fontSize: "0.78rem" }}>
              Audit rekam jejak autentikasi dan status sesi login pengguna terverifikasi ke dalam sistem berdasarkan fasyankes dan wilayah kerja.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Search Input Bebas Tumpang Tindih Menggunakan Flex Container */}
            <div
              className="d-flex align-items-center rounded-3 px-3 transition-all"
              style={{
                height: "36px",
                minWidth: "260px",
                backgroundColor: "#f8fafc",
                border: "1.5px solid #cbd5e1",
              }}
            >
              <Search size={15} className="text-muted flex-shrink-0 me-2" />
              <input
                type="text"
                className="border-0 bg-transparent p-0 shadow-none text-dark w-100"
                placeholder="Cari nama, email, faskes..."
                value={loginSearchTerm}
                onChange={(e) => setLoginSearchTerm(e.target.value)}
                style={{
                  fontSize: "0.8125rem",
                  outline: "none",
                  boxShadow: "none",
                  color: "#1e293b",
                }}
              />
              {loginSearchTerm && (
                <button
                  type="button"
                  onClick={() => setLoginSearchTerm("")}
                  className="btn btn-link btn-sm p-0 text-muted ms-1 text-decoration-none flex-shrink-0"
                  title="Bersihkan pencarian"
                  style={{ lineHeight: 1 }}
                >
                  ✕
                </button>
              )}
            </div>

            <select
              className="form-select form-select-sm bg-light border rounded-3 text-dark fw-medium shadow-none"
              value={loginRoleFilter}
              onChange={(e) => setLoginRoleFilter(e.target.value)}
              style={{ fontSize: "0.8rem", height: "36px", minWidth: "160px" }}
            >
              <option value="all">Semua Peran</option>
              <option value="sa">Super Admin</option>
              <option value="dinkesAdmin">Admin Dinkes</option>
              <option value="dinkes">Staf Dinkes</option>
              <option value="puskesmasAdmin">Admin Puskesmas</option>
              <option value="puskesmas">Staf Puskesmas</option>
              <option value="kader">Kader Posyandu</option>
            </select>
          </div>
        </div>

        {/* Tabel Log Aktivitas Akses Pengguna */}
        <div className="table-responsive border rounded-3 overflow-hidden">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.825rem" }}>
            <thead className="table-light text-secondary text-uppercase fw-bold" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
              <tr>
                <th style={{ width: "5%" }} className="text-center">No</th>
                <th style={{ width: "27%" }}>Pengguna / Akun</th>
                <th style={{ width: "16%" }}>Hak Akses / Peran</th>
                <th style={{ width: "18%" }}>Puskesmas Pembina</th>
                <th style={{ width: "15%" }}>Pos Layanan</th>
                <th style={{ width: "19%", whiteSpace: "nowrap" }}>Waktu Autentikasi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
                    Memuat log aktivitas akses pengguna...
                  </td>
                </tr>
              ) : paginatedLoginHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <Users size={32} className="opacity-30 mb-2" />
                    <div>Tidak ada akun yang sesuai dengan pencarian atau filter peran.</div>
                  </td>
                </tr>
              ) : (
                paginatedLoginHistory.map((item, idx) => {
                  const meta = getRoleMeta(item.role);
                  const isCurrent = item.isCurrentSession || (user?.email && item.email === user.email);
                  const rowNumber = (loginCurrentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={item.id || idx} className={isCurrent ? "table-light" : ""}>
                      {/* No */}
                      <td className="text-center text-muted fw-semibold">
                        {rowNumber}
                      </td>

                      {/* Pengguna (Bersih Tanpa Avatar Icon & Tanpa Badge Sesi Dobel) */}
                      <td>
                        <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                          <span className="fw-bold text-dark text-truncate" style={{ fontSize: "0.85rem" }}>
                            {item.nama_lengkap || "-"}
                          </span>
                          <span className="text-muted small text-truncate" style={{ fontSize: "0.75rem" }}>
                            {item.email || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Peran */}
                      <td>
                        <span
                          className="badge border"
                          style={{
                            backgroundColor: meta.badgeBg,
                            color: meta.badgeColor,
                            borderColor: meta.borderColor,
                            fontSize: "0.74rem",
                            fontWeight: "600",
                          }}
                        >
                          {meta.label}
                        </span>
                      </td>

                      {/* Puskesmas */}
                      <td>
                        <span className="fw-medium text-dark text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                          {formatUnitName(item.puskesmas)}
                        </span>
                      </td>

                      {/* Posyandu */}
                      <td>
                        <span className="fw-medium text-secondary text-truncate d-inline-block" style={{ maxWidth: "180px" }}>
                          {formatUnitName(item.posyandu)}
                        </span>
                      </td>

                      {/* Tanggal & Waktu Login (Semua Angka, Rapi & Tidak Tumpang Tindih) */}
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold text-dark" style={{ fontSize: "0.825rem", letterSpacing: "0.02em" }}>
                            {formatNumericDateTime(item.login_at)}
                          </span>
                          <span
                            className="small"
                            style={{
                              fontSize: "0.72rem",
                              color: isCurrent ? "#059669" : "#64748b",
                              fontWeight: isCurrent ? "600" : "400",
                            }}
                          >
                            {isCurrent ? "🟢 Sedang aktif sekarang" : "Login terverifikasi"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        {filteredLoginHistory.length > 0 && (
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 pt-3 border-top mt-3">
            <span className="text-muted small" style={{ fontSize: "0.78rem" }}>
              Menampilkan {Math.min((loginCurrentPage - 1) * itemsPerPage + 1, filteredLoginHistory.length)} -{" "}
              {Math.min(loginCurrentPage * itemsPerPage, filteredLoginHistory.length)} dari{" "}
              <strong>{filteredLoginHistory.length}</strong> akun terdata
            </span>

            {totalLoginPages > 1 && (
              <div className="d-flex align-items-center gap-1.5">
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center justify-content-center rounded-2 transition-all shadow-none"
                  disabled={loginCurrentPage === 1}
                  onClick={() => setLoginCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    width: "32px",
                    height: "32px",
                    padding: 0,
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    color: loginCurrentPage === 1 ? "#94a3b8" : "#1e293b",
                    cursor: loginCurrentPage === 1 ? "not-allowed" : "pointer",
                    opacity: loginCurrentPage === 1 ? 0.6 : 1,
                  }}
                  title="Halaman sebelumnya"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalLoginPages }, (_, i) => i + 1).map((pg) => {
                  const isActive = pg === loginCurrentPage;
                  return (
                    <button
                      key={pg}
                      type="button"
                      className="btn btn-sm fw-semibold rounded-2 transition-all shadow-none"
                      onClick={() => setLoginCurrentPage(pg)}
                      style={{
                        minWidth: "32px",
                        height: "32px",
                        padding: "0 8px",
                        fontSize: "0.78rem",
                        backgroundColor: isActive ? "#1e293b" : "#ffffff", // Super Admin Navy
                        borderColor: isActive ? "#1e293b" : "#e2e8f0",
                        color: isActive ? "#ffffff" : "#475569",
                        boxShadow: isActive ? "0 2px 4px rgba(30, 41, 59, 0.25)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center justify-content-center rounded-2 transition-all shadow-none"
                  disabled={loginCurrentPage === totalLoginPages}
                  onClick={() => setLoginCurrentPage((p) => Math.min(totalLoginPages, p + 1))}
                  style={{
                    width: "32px",
                    height: "32px",
                    padding: 0,
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    color: loginCurrentPage === totalLoginPages ? "#94a3b8" : "#1e293b",
                    cursor: loginCurrentPage === totalLoginPages ? "not-allowed" : "pointer",
                    opacity: loginCurrentPage === totalLoginPages ? 0.6 : 1,
                  }}
                  title="Halaman berikutnya"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
