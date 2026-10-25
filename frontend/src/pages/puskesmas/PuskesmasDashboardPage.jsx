import React, { useState, useMemo } from "react";
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Download,
  ChevronRight,
  ChevronLeft,
  Activity,
  Search,
  MapPin,
  Layers,
  CheckCircle2,
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
  BarElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatDateId } from "../../utils/dataMappers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Filler,
  Legend,
  BarElement
);

export default function PuskesmasDashboardPage({
  onNavigate,
  user,
  globalSasaranList = [],
  globalPemeriksaanData = {},
  globalJadwalList = [],
  globalStatistikSasaran = {},
  globalPosyanduList = [],
  globalRujukanList = [],
}) {
  const isStaf = user?.roleType === "puskesmas-staf" || user?.roleType === "puskesmas-user" || user?.role === "staf" || String(user?.role || "").toLowerCase().includes("staf");

  // Filter Periode Grafik ('6bulan', '2026', '2025')
  const [periodeGrafik, setPeriodeGrafik] = useState("6bulan");

  // State pencarian & filter daftar posyandu wilayah kerja
  const [searchPosyandu, setSearchPosyandu] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("all");
  const [posyanduPage, setPosyanduPage] = useState(1);
  const posyanduPerPage = 8;

  // Filter daftar posyandu wilayah kerja puskesmas yang login
  const posyanduWilayah = useMemo(() => {
    if (!Array.isArray(globalPosyanduList)) return [];
    if (user?.puskesmas_id) {
      const byId = globalPosyanduList.filter(
        (p) => String(p?.puskesmas_id || p?.puskesmas?.id) === String(user.puskesmas_id)
      );
      if (byId.length > 0) return byId;
    }
    if (user?.puskesmas) {
      const byName = globalPosyanduList.filter((p) =>
        (p?.puskesmas || p?.puskesmas?.nama_puskesmas || "")
          .toLowerCase()
          .includes(user.puskesmas.toLowerCase())
      );
      if (byName.length > 0) return byName;
    }
    return globalPosyanduList;
  }, [globalPosyanduList, user]);

  // Daftar kelurahan unik dalam wilayah kerja
  const kelurahanList = useMemo(() => {
    const set = new Set();
    posyanduWilayah.forEach((p) => {
      const k = typeof p?.kelurahan === "object" ? p?.kelurahan?.nama_kelurahan : p?.kelurahan;
      if (k && String(k).trim()) set.add(String(k).trim());
    });
    return Array.from(set).sort();
  }, [posyanduWilayah]);

  // Mapping jumlah sasaran per Posyandu
  const sasaranByPosyandu = useMemo(() => {
    const map = new Map();
    (globalSasaranList || []).forEach((s) => {
      const posId = s?.posyandu_id || s?.posyandu?.id;
      const posName = s?.posyandu?.nama_posyandu || s?.posyandu;
      if (posId) map.set(String(posId), (map.get(String(posId)) || 0) + 1);
      if (posName)
        map.set(String(posName).toLowerCase().trim(), (map.get(String(posName).toLowerCase().trim()) || 0) + 1);
    });
    return map;
  }, [globalSasaranList]);

  // Filter daftar posyandu berdasarkan pencarian & kelurahan
  const filteredPosyandu = useMemo(() => {
    return posyanduWilayah.filter((p) => {
      const nama = String(p?.nama_posyandu || p?.nama || "").toLowerCase();
      const kel = String(
        typeof p?.kelurahan === "object" ? p?.kelurahan?.nama_kelurahan : p?.kelurahan || ""
      ).toLowerCase();
      const kec = String(
        typeof p?.kelurahan === "object"
          ? p?.kelurahan?.kecamatan?.nama_kecamatan || p?.kecamatan || ""
          : p?.kecamatan || ""
      ).toLowerCase();
      const alamat = String(p?.alamat || "").toLowerCase();
      const query = searchPosyandu.trim().toLowerCase();

      const matchSearch =
        !query || nama.includes(query) || kel.includes(query) || kec.includes(query) || alamat.includes(query);
      const kelName = typeof p?.kelurahan === "object" ? p?.kelurahan?.nama_kelurahan : p?.kelurahan;
      const matchKel = selectedKelurahan === "all" || kelName === selectedKelurahan;

      return matchSearch && matchKel;
    });
  }, [posyanduWilayah, searchPosyandu, selectedKelurahan]);

  const totalPosyanduPages = Math.max(1, Math.ceil(filteredPosyandu.length / posyanduPerPage));
  const paginatedPosyandu = useMemo(() => {
    const start = (posyanduPage - 1) * posyanduPerPage;
    return filteredPosyandu.slice(start, start + posyanduPerPage);
  }, [filteredPosyandu, posyanduPage, posyanduPerPage]);

  // Dynamic totals from Posyandu data
  const totalSasaranCount = Math.max(
    Number(globalSasaranList?.length || 0),
    Number(globalStatistikSasaran?.total_warga || 0)
  );

  const examinationRecords = useMemo(() => {
    const recordsById = new Map();
    Object.values(globalPemeriksaanData || {}).forEach((record) => {
      if (record?.id && record?.tanggal) recordsById.set(String(record.id), record);
    });
    return [...recordsById.values()];
  }, [globalPemeriksaanData]);

  const examinedCount = useMemo(() => {
    if (!globalSasaranList || globalSasaranList.length === 0) return 0;
    return globalSasaranList.filter(
      (s) =>
        s.statusPemeriksaan === "Sudah" ||
        s.status === "Sudah" ||
        !!globalPemeriksaanData?.[s.id] ||
        !!globalPemeriksaanData?.[String(s.id)] ||
        examinationRecords.some(
          (rec) =>
            String(rec.warga_id || rec.warga?.id || rec.kunjungan?.warga_id) === String(s.id)
        )
    ).length;
  }, [globalSasaranList, globalPemeriksaanData, examinationRecords]);

  const rujukanCount = Array.isArray(globalRujukanList) ? globalRujukanList.length : 0;
  const totalJadwalCount = Array.isArray(globalJadwalList) ? globalJadwalList.length : 0;

  // Aggregate monthly examination records for line chart
  const chartData = useMemo(() => {
    const now = new Date();
    const countForMonth = (year, month) =>
      examinationRecords.filter((item) => {
        const [recordYear, recordMonth] = String(item.tanggal).slice(0, 10).split("-").map(Number);
        return recordYear === year && recordMonth === month + 1;
      }).length;

    const points = [];
    if (periodeGrafik === "6bulan") {
      for (let offset = 5; offset >= 0; offset -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const count = countForMonth(d.getFullYear(), d.getMonth());
        points.push({
          periode: d.toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
        });
      }
    } else {
      const year = Number(periodeGrafik);
      for (let month = 0; month < 12; month += 1) {
        const count = countForMonth(year, month);
        points.push({
          periode: new Date(year, month, 1).toLocaleDateString("id-ID", { month: "short" }),
          pemeriksaan: count,
        });
      }
    }
    return points;
  }, [examinationRecords, periodeGrafik]);

  const availableYears = useMemo(
    () =>
      [
        ...new Set(
          examinationRecords
            .map((item) => String(item?.tanggal || "").slice(0, 4))
            .filter((year) => /^\d{4}$/.test(year))
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [examinationRecords]
  );

  // Line Chart Configuration (Curved Area Chart like reference image)
  const lineChartDataConfig = useMemo(() => {
    return {
      labels: chartData.map((d) => d.periode),
      datasets: [
        {
          label: "Pemeriksaan",
          data: chartData.map((d) => d.pemeriksaan),
          borderColor: "#3b7d6b",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 240);
            gradient.addColorStop(0, "rgba(59, 125, 107, 0.28)");
            gradient.addColorStop(1, "rgba(59, 125, 107, 0.0)");
            return gradient;
          },
          tension: 0.38,
          fill: true,
          borderWidth: 2.5,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3b7d6b",
          pointBorderWidth: 2.5,
          pointRadius: 4.5,
          pointHoverRadius: 6.5,
        },
      ],
    };
  }, [chartData]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Pemeriksaan: ${context.parsed.y.toLocaleString("id-ID")} Orang`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: "#94a3b8",
          font: { size: 11, weight: "500" },
          padding: 8,
        },
        grid: { color: "#f1f5f9", lineWidth: 1 },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#64748b", font: { size: 11.5, weight: "600" } },
      },
    },
    interaction: { mode: "index", intersect: false },
  };

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* ========================================================================= */}
      {/* ROW 1: METRIC KPI CARDS (3 CARDS FOR STAF, 4 CARDS FOR ADMIN)             */}
      {/* ========================================================================= */}
      <div className="row g-3">
        {isStaf ? (
          <>
            {/* Card 1: Total Posyandu */}
            <div className="col-12 col-md-4">
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 transition-all card-hover d-flex flex-column justify-content-between"
                style={{ cursor: "pointer", minHeight: "135px" }}
                onClick={() => {
                  const el = document.getElementById("daftar-posyandu-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else onNavigate("jadwal");
                }}
                title="Lihat daftar posyandu"
              >
                <div>
                  <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                    Total Posyandu
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-1">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold text-dark fs-3 mb-0">{posyanduWilayah.length.toLocaleString("id-ID")}</span>
                      <span className="text-muted small fw-medium">Unit Posyandu</span>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1" style={{ fontSize: "0.7rem" }}>
                      Terdaftar
                    </span>
                  </div>
                </div>
                <div className="text-muted small text-truncate pt-1" style={{ fontSize: "0.76rem" }}>
                  Posyandu di {user?.puskesmas || "Puskesmas"}
                </div>
              </div>
            </div>

            {/* Card 2: Jadwal Pelayanan */}
            <div className="col-12 col-md-4">
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 transition-all card-hover d-flex flex-column justify-content-between"
                style={{ cursor: "pointer", minHeight: "135px" }}
                onClick={() => onNavigate("jadwal")}
                title="Buka agenda jadwal posyandu"
              >
                <div>
                  <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                    Jadwal Pelayanan
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-1">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold text-dark fs-3 mb-0">{totalJadwalCount.toLocaleString("id-ID")}</span>
                      <span className="text-muted small fw-medium">Sesi Aktif</span>
                    </div>
                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1" style={{ fontSize: "0.7rem" }}>
                      Bulan Ini
                    </span>
                  </div>
                </div>
                <div className="text-muted small text-truncate pt-1" style={{ fontSize: "0.76rem" }}>
                  Pelayanan posyandu terjadwal aktif
                </div>
              </div>
            </div>

            {/* Card 3: Laporan Agregat */}
            <div className="col-12 col-md-4">
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 transition-all card-hover d-flex flex-column justify-content-between"
                style={{ cursor: "pointer", minHeight: "135px" }}
                onClick={() => onNavigate("laporan-ekspor")}
                title="Buka rekapitulasi pemeriksaan & unduh laporan"
              >
                <div>
                  <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                    Laporan Agregat
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-1">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold text-dark fs-3 mb-0">Format Excel</span>
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1" style={{ fontSize: "0.7rem" }}>
                      Siap Unduh
                    </span>
                  </div>
                </div>
                <div className="text-muted small text-truncate pt-1" style={{ fontSize: "0.76rem" }}>
                  Rekapitulasi data pemeriksaan bulanan
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Card 1: Total Sasaran (Admin) */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 transition-all card-hover d-flex flex-column justify-content-between"
                style={{ cursor: "pointer", minHeight: "135px" }}
                onClick={() => onNavigate("data-sasaran")}
                title="Buka data sasaran warga"
              >
                <div>
                  <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                    Total Sasaran
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-1">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold text-dark fs-3 mb-0">{totalSasaranCount.toLocaleString("id-ID")}</span>
                      <span className="text-muted small fw-medium">Jiwa</span>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1" style={{ fontSize: "0.7rem" }}>
                      100% ILP
                    </span>
                  </div>
                </div>
                <div
                  className="text-muted small text-truncate pt-1"
                  style={{ fontSize: "0.76rem" }}
                  title={`Total warga sasaran dari seluruh Posyandu di ${user?.puskesmas || "Puskesmas"}`}
                >
                  {user?.puskesmas || "Puskesmas"} ({posyanduWilayah.length > 0 ? `${posyanduWilayah.length} Posyandu` : "Semua Posyandu"})
                </div>
              </div>
            </div>

            {/* Card 2: Pemeriksaan Tercatat (Admin) */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 transition-all card-hover d-flex flex-column justify-content-between"
                style={{ cursor: "pointer", minHeight: "135px" }}
                onClick={() => onNavigate("laporan-ekspor")}
                title="Buka rekapitulasi pemeriksaan"
              >
                <div>
                  <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                    Pemeriksaan Tercatat
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-1">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold text-dark fs-3 mb-0">{examinationRecords.length.toLocaleString("id-ID")}</span>
                      <span className="text-muted small fw-medium">Data</span>
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1" style={{ fontSize: "0.7rem" }}>
                      Terekam
                    </span>
                  </div>
                </div>
                <div className="text-muted small text-truncate pt-1" style={{ fontSize: "0.76rem" }}>
                  {examinedCount > 0 ? `${examinedCount} warga telah diskrining` : "Riwayat skrining terintegrasi"}
                </div>
              </div>
            </div>

            {/* Card 3: Jadwal Posyandu (Admin) */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 transition-all card-hover d-flex flex-column justify-content-between"
                style={{ cursor: "pointer", minHeight: "135px" }}
                onClick={() => onNavigate("jadwal")}
                title="Buka jadwal posyandu"
              >
                <div>
                  <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                    Jadwal Posyandu
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-1">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold text-dark fs-3 mb-0">{totalJadwalCount.toLocaleString("id-ID")}</span>
                      <span className="text-muted small fw-medium">Sesi</span>
                    </div>
                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1" style={{ fontSize: "0.7rem" }}>
                      Aktif
                    </span>
                  </div>
                </div>
                <div className="text-muted small text-truncate pt-1" style={{ fontSize: "0.76rem" }}>
                  Pelayanan Posyandu aktif
                </div>
              </div>
            </div>

            {/* Card 4: Rujukan Faskes (Admin) */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                className="card border bg-white shadow-xs rounded-4 p-4 h-100 transition-all card-hover d-flex flex-column justify-content-between"
                style={{ cursor: "pointer", minHeight: "135px" }}
                onClick={() => onNavigate("pemantauan-rujukan")}
                title="Buka pemantauan rujukan faskes"
              >
                <div>
                  <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                    Rujukan Faskes
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-1">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold text-danger fs-3 mb-0">
                        {rujukanCount.toLocaleString("id-ID")}
                      </span>
                      <span className="text-muted small fw-medium">Kasus</span>
                    </div>
                    <span className="badge rounded-pill px-2.5 py-1 bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: "0.7rem" }}>
                      Perlu Respon
                    </span>
                  </div>
                </div>
                <div className="text-muted small text-truncate pt-1" style={{ fontSize: "0.76rem" }}>
                  Tindak lanjut medis faskes
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: GRAFIK TREN PEMERIKSAAN LAYANAN (FULL WIDTH)                       */}
      {/* ========================================================================= */}
      <div className="row g-3">
        <div className="col-12">
          <div className="card border-0 bg-white shadow-xs rounded-4 p-4 h-100">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
              <div>
                <h6 className="fw-bold text-dark mb-0.5 d-flex align-items-center gap-2">
                  <TrendingUp size={18} style={{ color: "#3b7d6b" }} />
                  <span>Tren Pemeriksaan Layanan</span>
                </h6>
                <p className="text-muted small mb-0" style={{ fontSize: "0.8rem" }}>
                  Rekaman skrining kesehatan bulanan fasyankes.
                </p>
              </div>

              {/* Filter Periode */}
              <div className="d-flex align-items-center gap-2">
                <Calendar size={14} className="text-muted" />
                <select
                  className="form-select form-select-sm bg-light text-dark fw-semibold rounded-3 border-0 shadow-none"
                  value={periodeGrafik}
                  onChange={(e) => setPeriodeGrafik(e.target.value)}
                  style={{ fontSize: "0.8rem", height: "34px", minWidth: "140px" }}
                >
                  <option value="6bulan">6 Bulan Terakhir</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      Tahun {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Canvas Line Chart */}
            <div className="position-relative w-100 overflow-hidden" style={{ height: "280px", marginTop: "0.5rem" }}>
              {chartData.length > 0 ? (
                <Line data={lineChartDataConfig} options={lineChartOptions} />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  Tidak ada data pemeriksaan
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-2">
              <span className="text-muted small" style={{ fontSize: "0.78rem" }}>
                Sumber: Riwayat pemeriksaan posyandu aktif.
              </span>
              <button
                className="btn btn-sm btn-light border text-dark fw-semibold px-2.5 py-1 rounded-2 shadow-none"
                onClick={() => onNavigate("laporan-ekspor")}
                style={{ fontSize: "0.76rem" }}
              >
                <Download size={13} className="me-1" />
                Unduh Rekap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: DAFTAR POSYANDU WILAYAH KERJA (FULL WIDTH)                         */}
      {/* ========================================================================= */}
      <div className="row g-3">
        <div className="col-12">
          <div className="card border-0 bg-white shadow-xs rounded-4 p-4" id="daftar-posyandu-section">
            {/* Header Direktori */}
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
              <div>
                <h6 className="fw-bold text-dark mb-0.5 d-flex align-items-center gap-2">
                  <Building2 size={18} style={{ color: "#3b7d6b" }} />
                  <span>Daftar Posyandu</span>
                  <span
                    className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-0.5 ms-1 fw-semibold"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {posyanduWilayah.length}
                  </span>
                </h6>
                <p className="text-muted small mb-0" style={{ fontSize: "0.8rem" }}>
                  Unit posyandu di {user?.puskesmas || "Puskesmas"}.
                </p>
              </div>

              {/* Filter & Search controls */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                {kelurahanList.length > 0 && (
                  <select
                    className="form-select form-select-sm bg-light border-0 fw-semibold rounded-3 shadow-none"
                    value={selectedKelurahan}
                    onChange={(e) => {
                      setSelectedKelurahan(e.target.value);
                      setPosyanduPage(1);
                    }}
                    style={{ fontSize: "0.8rem", height: "34px", minWidth: "160px" }}
                  >
                    <option value="all">Semua Kelurahan</option>
                    {kelurahanList.map((kel, idx) => (
                      <option key={idx} value={kel}>
                        {kel}
                      </option>
                    ))}
                  </select>
                )}

                <div className="input-group input-group-sm" style={{ width: "240px" }}>
                  <span className="input-group-text bg-light border-0 text-muted ps-2.5">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-0 shadow-none py-1.5"
                    placeholder="Cari nama posyandu..."
                    style={{ fontSize: "0.8rem", height: "34px" }}
                    value={searchPosyandu}
                    onChange={(e) => {
                      setSearchPosyandu(e.target.value);
                      setPosyanduPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tabel Daftar Posyandu */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr
                    className="text-muted small text-uppercase fw-bold border-bottom"
                    style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}
                  >
                    <th className="ps-3 py-3 text-center" style={{ width: "50px" }}>
                      NO
                    </th>
                    <th className="py-3" style={{ minWidth: "180px" }}>
                      NAMA POSYANDU
                    </th>
                    <th className="py-3" style={{ minWidth: "140px" }}>
                      KELURAHAN
                    </th>
                    <th className="py-3" style={{ minWidth: "140px" }}>
                      KECAMATAN
                    </th>
                    <th className="pe-3 py-3 text-center" style={{ minWidth: "120px" }}>
                      JUMLAH SASARAN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPosyandu.length > 0 ? (
                    paginatedPosyandu.map((pos, idx) => {
                      const posId = String(pos?.id || "");
                      const posName = String(pos?.nama_posyandu || pos?.nama || "-");
                      const sasaranCount =
                        sasaranByPosyandu.get(posId) || sasaranByPosyandu.get(posName.toLowerCase().trim()) || 0;
                      const kelName =
                        typeof pos?.kelurahan === "object"
                          ? pos?.kelurahan?.nama_kelurahan || "-"
                          : pos?.kelurahan || "-";
                      const kecName =
                        typeof pos?.kelurahan === "object"
                          ? pos?.kelurahan?.kecamatan?.nama_kecamatan || pos?.kecamatan || "-"
                          : pos?.kecamatan || "-";

                      return (
                        <tr key={pos.id || idx} className="border-bottom">
                          <td className="ps-3 py-3 text-center text-muted small fw-medium">
                            {(posyanduPage - 1) * posyanduPerPage + idx + 1}
                          </td>
                          <td className="py-3">
                            <span className="fw-bold text-dark small">{posName}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-secondary small">{kelName}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-muted small">{kecName}</span>
                          </td>
                          <td className="pe-3 py-3 text-center">
                            <span
                              className="badge bg-light text-dark border px-2.5 py-1 fw-semibold"
                              style={{ fontSize: "0.76rem" }}
                            >
                              {sasaranCount.toLocaleString("id-ID")} Jiwa
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        Tidak ditemukan Posyandu yang sesuai dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPosyanduPages > 1 && (
              <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-2">
                <span className="text-muted small" style={{ fontSize: "0.76rem" }}>
                  Menampilkan hal {posyanduPage} dari {totalPosyanduPages} ({filteredPosyandu.length} Posyandu)
                </span>
                <div className="d-flex align-items-center gap-1">
                  <button
                    className="btn btn-sm btn-light border text-dark px-2 py-0.5 rounded-2 shadow-none"
                    disabled={posyanduPage <= 1}
                    onClick={() => setPosyanduPage((prev) => Math.max(1, prev - 1))}
                    style={{ fontSize: "0.75rem" }}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="px-2 small text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                    {posyanduPage}
                  </span>
                  <button
                    className="btn btn-sm btn-light border text-dark px-2 py-0.5 rounded-2 shadow-none"
                    disabled={posyanduPage >= totalPosyanduPages}
                    onClick={() => setPosyanduPage((prev) => Math.min(totalPosyanduPages, prev + 1))}
                    style={{ fontSize: "0.75rem" }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
