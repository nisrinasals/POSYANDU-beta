<<<<<<< HEAD
// frontend/src/components/pemeriksaan/GrowthChartPlotter.jsx

import React, { useEffect, useMemo, useRef } from "react";

import { Chart, registerables } from "chart.js";

import { Activity, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { formatDateId } from "../../utils/dataMappers";

Chart.register(...registerables);

// ============================================================
// COLORS
// ============================================================

const GENDER_COLOR = {
  perempuan: "#e83e8c",
  laki: "#0288d1",
  default: "#64748b",
};

const SD_STYLE = {
  sd_minus_3: {
    label: "-3 SD",
    color: "#212529",
    width: 2,
  },

  sd_minus_2: {
    label: "-2 SD",
    color: "#c94b72",
    width: 1.8,
  },

  sd_minus_1: {
    label: "-1 SD",
    color: "#d9a441",
    width: 1.8,
  },

  median: {
    label: "0 SD",
    color: "#198754",
    width: 2.8,
  },

  sd_plus_1: {
    label: "+1 SD",
    color: "#d9a441",
    width: 1.8,
  },

  sd_plus_2: {
    label: "+2 SD",
    color: "#c94b72",
    width: 1.8,
  },

  sd_plus_3: {
    label: "+3 SD",
    color: "#212529",
    width: 2,
  },
};

// ============================================================
// BASIC HELPERS
// ============================================================

const normalizeGender = (gender) => {
  const value = String(gender || "")
    .trim()
    .toLowerCase();

  if (["p", "perempuan", "female", "f"].includes(value)) {
    return "perempuan";
  }

  if (["l", "laki", "laki-laki", "laki laki", "male", "m"].includes(value)) {
    return "laki";
  }

  return "";
};

const getGenderColor = (gender) => {
  const normalized = normalizeGender(gender);

  return GENDER_COLOR[normalized] || GENDER_COLOR.default;
};

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

// ============================================================
// BACKEND RESULT
// ============================================================

const getBackendResults = (plottingData) => {
  const raw = plottingData?.hasil_plot;

  if (!raw || typeof raw !== "object") {
    return {};
  }

  if (raw.hasil_plot && typeof raw.hasil_plot === "object") {
    return raw.hasil_plot;
  }

  return raw;
};

// ============================================================
// INDICATOR CONFIG
// ============================================================

const getIndicatorConfig = (indicatorName, usiaBulan, results) => {
  const name = normalizeText(indicatorName);

  const age = Number(usiaBulan || 0);

  // ==========================================================
  // BB/U
  // ==========================================================

  if (name.includes("bb/u")) {
    return {
      index: "BB/U",

      result: results?.bbu || null,

      zscoreKey: "zscore_bbu",

      xKey: "usia_bulan",

      yKey: "bb_kg",

      xLabel: "Umur (bulan penuh)",

      yLabel: "Berat Badan (kg)",

      xUnit: "bulan",
    };
  }

  // ==========================================================
  // PB/U / TB/U
  // ==========================================================

  if (name.includes("pb/u") || name.includes("tb/u") || name.includes("panjang badan menurut umur") || name.includes("tinggi badan menurut umur")) {
    const isPanjang = age < 24;

    return {
      index: isPanjang ? "PB/U" : "TB/U",

      result: results?.tbu || null,

      zscoreKey: isPanjang ? "zscore_pbu" : "zscore_tbu",

      xKey: "usia_bulan",

      yKey: "tb_cm",

      xLabel: "Umur (bulan penuh)",

      yLabel: isPanjang ? "Panjang Badan (cm)" : "Tinggi Badan (cm)",

      xUnit: "bulan",
    };
  }

  // ==========================================================
  // BB/PB / BB/TB
  // ==========================================================

  if (name.includes("bb/pb") || name.includes("bb/tb") || name.includes("berat badan menurut panjang badan") || name.includes("berat badan menurut tinggi badan")) {
    const isPanjang = age < 24;

    return {
      index: isPanjang ? "BB/PB" : "BB/TB",

      result: results?.bb_panjang_tinggi || null,

      zscoreKey: isPanjang ? "zscore_bbpb" : "zscore_bbtb",

      xKey: "tb_cm",

      yKey: "bb_kg",

      xLabel: isPanjang ? "Panjang Badan (cm)" : "Tinggi Badan (cm)",

      yLabel: "Berat Badan (kg)",

      xUnit: "cm",
    };
  }

  // ==========================================================
  // IMT/U
  // ==========================================================

  if (name.includes("imt/u") || name.includes("indeks massa tubuh menurut umur")) {
    return {
      index: "IMT/U",

      result: results?.imtu || results?.imt || null,

      zscoreKey: "zscore_imtu",

      xKey: "usia_bulan",

      yKey: "__imt__",

      xLabel: age > 60 ? "Umur (bulan dan tahun penuh)" : "Umur (bulan penuh)",

      yLabel: "IMT (kg/m²)",

      xUnit: "bulan",
    };
  }

  return null;
};

// ============================================================
// IMT
// ============================================================

const calculateImt = (bb, tb) => {
  const weight = Number(bb);

  const height = Number(tb);

  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
    return null;
  }

  return Number((weight / (height / 100) ** 2).toFixed(2));
};

// ============================================================
// HISTORY POINT
// ============================================================

const getHistoryPoint = (item, config) => {
  if (!item || !config) {
    return null;
  }

  let x = null;
  let y = null;

  // ----------------------------------------------------------
  // X
  // ----------------------------------------------------------

  if (config.index === "BB/PB") {
    x = toNumber(item.tb_cm);
  } else if (config.index === "BB/TB") {
    x = toNumber(item.tb_cm);
  } else {
    x = toNumber(item[config.xKey]);
  }

  // ----------------------------------------------------------
  // Y
  // ----------------------------------------------------------

  if (config.yKey === "__imt__") {
    y = calculateImt(item.bb_kg, item.tb_cm);
  } else {
    y = toNumber(item[config.yKey]);
  }

  // ----------------------------------------------------------
  // Z-SCORE
  // ----------------------------------------------------------

  const zscore = toNumber(item?.[config.zscoreKey]);

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(zscore)) {
    return null;
  }

  return {
    id: item?.id ?? null,

    tanggal: item?.tanggal ?? null,

    x,
    y,
    zscore,

    isCurrent: false,
  };
};

// ============================================================
// CURRENT POINT
// ============================================================

const getCurrentPoint = (plottingData, result, config) => {
  if (!plottingData || !config) {
    return null;
  }

  const measurements = plottingData?.pengukuran_step_2 || {};

  let x = null;
  let y = null;

  // ----------------------------------------------------------
  // X
  // ----------------------------------------------------------

  if (config.index === "BB/PB") {
    x = toNumber(measurements?.tb_cm);
  } else if (config.index === "BB/TB") {
    x = toNumber(measurements?.tb_cm);
  } else {
    x = toNumber(plottingData?.usia_bulan);
  }

  // ----------------------------------------------------------
  // Y
  // ----------------------------------------------------------

  if (config.yKey === "__imt__") {
    y = calculateImt(measurements?.bb_kg, measurements?.tb_cm);
  } else {
    y = toNumber(measurements?.[config.yKey]);
  }

  // ----------------------------------------------------------
  // Z-SCORE
  //
  // SEMUA DARI BE
  // ----------------------------------------------------------

  const zscore = toNumber(result?.zscore) ?? toNumber(result?.z_score) ?? toNumber(plottingData?.z_scores?.[config.zscoreKey]);

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(zscore)) {
    return null;
  }

  return {
    id: plottingData?.pemeriksaan_id ?? "current",

    tanggal: plottingData?.tanggal ?? null,

    x,
    y,
    zscore,

    isCurrent: true,
  };
};

// ============================================================
// HISTORY
// ============================================================

const buildHistory = (plottingData, result, config) => {
  const rawHistory = Array.isArray(plottingData?.growth_history) ? plottingData.growth_history : Array.isArray(plottingData?.historis) ? plottingData.historis : [];

  const history = rawHistory
    .map((item) => getHistoryPoint(item, config))
    .filter(Boolean)
    .sort((a, b) => {
      const xDiff = a.x - b.x;

      if (xDiff !== 0) {
        return xDiff;
      }

      return new Date(a.tanggal || 0) - new Date(b.tanggal || 0);
    });

  const current = getCurrentPoint(plottingData, result, config);

  if (!current) {
    return history;
  }

  // ----------------------------------------------------------
  // Jangan duplicate current
  // ----------------------------------------------------------

  const currentAlreadyInHistory = history.some((point) => String(point.id) === String(current.id) || (Number(point.x) === Number(current.x) && Number(point.y) === Number(current.y) && Number(point.zscore) === Number(current.zscore)));

  if (currentAlreadyInHistory) {
    return history.map((point) =>
      String(point.id) === String(current.id)
        ? {
            ...point,
            isCurrent: true,
          }
        : point,
    );
  }

  return [...history, current].sort((a, b) => {
    const xDiff = a.x - b.x;

    if (xDiff !== 0) {
      return xDiff;
    }

    return new Date(a.tanggal || 0) - new Date(b.tanggal || 0);
  });
};

// ============================================================
// BACKEND PLOT EXPLANATION
//
// Tidak menghitung kategori dari FE.
// Cari kategori/kode/batas pada standar_plot dari BE.
// ============================================================

const getPlotExplanation = (standard, result, currentPoint) => {
  const items = Array.isArray(standard?.items) ? standard.items : [];

  const resultCategory = normalizeText(result?.kategori || result?.category || result?.status);

  const resultCode = normalizeText(result?.kode || result?.code);

  const resultIsRed = result?.is_merah === true;

  // ----------------------------------------------------------
  // 1. Cari category yang paling cocok
  // ----------------------------------------------------------

  let matchedItem = items.find((item) => {
    const category = normalizeText(item?.kategori);

    return category && resultCategory && (category === resultCategory || category.includes(resultCategory) || resultCategory.includes(category));
  });

  // ----------------------------------------------------------
  // 2. Kalau tidak ketemu, cari berdasarkan kode
  //    + status merah/hijau
  // ----------------------------------------------------------

  if (!matchedItem && resultCode) {
    matchedItem = items.find((item) => {
      const code = normalizeText(item?.kode);

      const itemIsRed = item?.is_merah === true;

      return code === resultCode && itemIsRed === resultIsRed;
    });
  }

  // ----------------------------------------------------------
  // 3. Kalau tidak ketemu, cari kode saja
  // ----------------------------------------------------------

  if (!matchedItem && resultCode) {
    matchedItem = items.find((item) => normalizeText(item?.kode) === resultCode);
  }

  const kategori = result?.kategori || matchedItem?.kategori || "-";

  const kode = result?.kode || matchedItem?.kode || "-";

  const batas = result?.batas || result?.sd_position || result?.z_score_range || matchedItem?.batas || null;

  const zscore = toNumber(result?.zscore) ?? toNumber(result?.z_score) ?? toNumber(currentPoint?.zscore);

  return {
    kategori,
    kode,
    batas,
    zscore,
  };
};

// ============================================================
// RESULT STATUS
// ============================================================

const getResultRisk = (result) => result?.is_merah === true;

// ============================================================
// GROWTH CHART
// ============================================================

const GrowthChart = ({ indicator, plottingData, standard, result, config, gender }) => {
  const canvasRef = useRef(null);

  // ----------------------------------------------------------
  // Standard curve dari BE
  // ----------------------------------------------------------

  const standardPoints = useMemo(() => {
    const points = result?.grafik_sd?.points;

    return Array.isArray(points) ? points : [];
  }, [result]);

  // ----------------------------------------------------------
  // History + current
  // ----------------------------------------------------------

  const history = useMemo(() => buildHistory(plottingData, result, config), [plottingData, result, config]);

  const currentPoint = useMemo(() => {
    return history.find((point) => point.isCurrent) || history[history.length - 1] || null;
  }, [history]);

  // ----------------------------------------------------------
  // Explanation dari BE
  // ----------------------------------------------------------

  const explanation = useMemo(() => getPlotExplanation(standard, result, currentPoint), [standard, result, currentPoint]);

  const genderColor = getGenderColor(gender);

  const normalizedGender = normalizeGender(gender);

  // ==========================================================
  // CHART
  // ==========================================================

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    // ========================================================
    // DATASETS
    // ========================================================

    const datasets = [];

    // --------------------------------------------------------
    // STANDARD SD CURVES
    //
    // Hanya dari backend.
    // --------------------------------------------------------

    if (standardPoints.length > 0) {
      Object.keys(SD_STYLE).forEach((key) => {
        const style = SD_STYLE[key];

        const data = standardPoints
          .map((point) => ({
            x: Number(point.x),

            y: Number(point[key]),
          }))
          .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

        if (!data.length) {
          return;
        }

        datasets.push({
          label: style.label,

          data,

          borderColor: style.color,

          backgroundColor: style.color,

          borderWidth: style.width,

          pointRadius: 0,

          pointHoverRadius: 0,

          tension: 0.18,

          fill: false,

          spanGaps: true,

          order: 1,
        });
      });
    }

    // --------------------------------------------------------
    // HISTORY / TREND
    //
    // Pemeriksaan sebelumnya -> sekarang.
    // --------------------------------------------------------

    if (history.length > 0) {
      datasets.push({
        label: history.length === 1 ? "Pemeriksaan" : "Riwayat Pemeriksaan",

        data: history.map((point) => ({
          x: point.x,
          y: point.y,

          zscore: point.zscore,

          tanggal: point.tanggal,

          id: point.id,
        })),

        borderColor: genderColor,

        backgroundColor: genderColor,

        borderWidth: 3,

        pointRadius: history.length === 1 ? 7 : 4,

        pointHoverRadius: 9,

        pointBackgroundColor: genderColor,

        pointBorderColor: "#ffffff",

        pointBorderWidth: 2,

        tension: 0.15,

        fill: false,

        // 1 titik = titik saja
        // >1 titik = garis
        showLine: history.length > 1,

        spanGaps: true,

        order: 10,
      });
    }

    // --------------------------------------------------------
    // CURRENT POINT
    // --------------------------------------------------------

    if (currentPoint) {
      datasets.push({
        label: "Pemeriksaan Sekarang",

        data: [
          {
            x: currentPoint.x,

            y: currentPoint.y,

            zscore: currentPoint.zscore,

            tanggal: currentPoint.tanggal,
          },
        ],

        showLine: false,

        pointRadius: 8,

        pointHoverRadius: 11,

        pointBackgroundColor: genderColor,

        pointBorderColor: "#ffffff",

        pointBorderWidth: 3,

        order: 20,
      });
    }

    // ========================================================
    // AXIS RANGE
    // ========================================================

    const allX = [];
    const allY = [];

    standardPoints.forEach((point) => {
      Object.keys(SD_STYLE).forEach((key) => {
        const x = Number(point.x);

        const y = Number(point[key]);

        if (Number.isFinite(x) && Number.isFinite(y)) {
          allX.push(x);
          allY.push(y);
        }
      });
    });

    history.forEach((point) => {
      if (Number.isFinite(point.x)) {
        allX.push(point.x);
      }

      if (Number.isFinite(point.y)) {
        allY.push(point.y);
      }
    });

    let xMin = null;
    let xMax = null;
    let yMin = null;
    let yMax = null;

    // --------------------------------------------------------
    // X
    // --------------------------------------------------------

    if (standardPoints.length > 0) {
      const standardX = standardPoints.map((point) => Number(point.x)).filter(Number.isFinite);

      if (standardX.length) {
        xMin = Math.min(...standardX);

        xMax = Math.max(...standardX);
      }
    }

    if (xMin === null && allX.length > 0) {
      xMin = Math.min(...allX);

      xMax = Math.max(...allX);

      if (xMin === xMax) {
        xMin -= 1;
        xMax += 1;
      }
    }

    // --------------------------------------------------------
    // Y
    // --------------------------------------------------------

    if (allY.length > 0) {
      yMin = Math.floor(Math.min(...allY) - 1);

      yMax = Math.ceil(Math.max(...allY) + 1);

      if (yMin === yMax) {
        yMin -= 1;
        yMax += 1;
      }
    }

    // ========================================================
    // CHART
    // ========================================================

    const chart = new Chart(canvasRef.current, {
      type: "line",

      data: {
        datasets,
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        parsing: false,

        animation: {
          duration: 400,
        },

        interaction: {
          intersect: false,
          mode: "nearest",
        },

        scales: {
          x: {
            type: "linear",

            ...(xMin !== null
              ? {
                  min: xMin,
                  max: xMax,
                }
              : {}),

            title: {
              display: true,

              text: result?.grafik_sd?.x_label || config?.xLabel || "Nilai X",

              font: {
                weight: "bold",
              },
            },

            grid: {
              color: "#e5e7eb",

              lineWidth: 1,
            },

            ticks: {
              maxTicksLimit: 13,

              callback: (value) => {
                return Number(value).toFixed(0);
              },
            },
          },

          y: {
            ...(yMin !== null
              ? {
                  min: yMin,
                  max: yMax,
                }
              : {}),

            title: {
              display: true,

              text: result?.grafik_sd?.y_label || config?.yLabel || "Nilai",

              font: {
                weight: "bold",
              },
            },

            grid: {
              color: "#e5e7eb",

              lineWidth: 1,
            },

            ticks: {
              precision: 1,
            },
          },
        },

        plugins: {
          legend: {
            position: "top",

            labels: {
              usePointStyle: true,

              padding: 14,
            },
          },

          tooltip: {
            callbacks: {
              title: () => indicator,

              label: (context) => {
                const raw = context.raw || {};

                const datasetLabel = context.dataset?.label;

                // ------------------------------------
                // HISTORY / CURRENT
                // ------------------------------------

                if (datasetLabel === "Riwayat Pemeriksaan" || datasetLabel === "Pemeriksaan" || datasetLabel === "Pemeriksaan Sekarang") {
                  const zscore = toNumber(raw?.zscore);

                  const tanggal = formatDateId(raw?.tanggal) || "-";

                  return [`${config.xLabel}: ${raw.x ?? "-"}`, `${config.yLabel}: ${raw.y ?? "-"}`, `Z-Score: ${Number.isFinite(zscore) ? zscore.toFixed(2) : "-"} SD`, `Tanggal: ${tanggal}`];
                }

                // ------------------------------------
                // SD
                // ------------------------------------

                return `${datasetLabel || ""}: ${context.parsed?.y ?? "-"}`;
              },
            },
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [standardPoints, history, currentPoint, genderColor, indicator, result, config]);

  // ==========================================================
  // NOTHING
  //
  // Jangan tampilkan error.
  // ==========================================================

  if (history.length === 0 && standardPoints.length === 0) {
    return null;
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="p-3 border-bottom"
        style={{
          borderTop: `4px solid ${genderColor}`,

          backgroundColor: normalizedGender === "perempuan" ? "#fff0f6" : "#eef8ff",
        }}
      >
        <div className="d-flex justify-content-between align-items-center gap-3">
          <div>
            <h6 className="fw-bold mb-1">{indicator}</h6>

            <div className="text-muted small">Kurva standar SD + riwayat pemeriksaan</div>
          </div>

          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              backgroundColor: genderColor,

              color: "#ffffff",
            }}
          >
            {normalizedGender === "perempuan" ? "Perempuan" : normalizedGender === "laki" ? "Laki-laki" : "Jenis Kelamin"}
          </span>
        </div>
      </div>

      {/* ======================================================
          CHART
      ====================================================== */}

      <div className="p-3">
        <div
          style={{
            position: "relative",

            height: "480px",

            width: "100%",
          }}
        >
          <canvas ref={canvasRef} />
        </div>

        {/* ====================================================
            KETERANGAN
        ==================================================== */}

        {currentPoint && (
          <div
            className="mt-3 p-3 rounded-3"
            style={{
              backgroundColor: normalizedGender === "perempuan" ? "#fff0f6" : "#eef8ff",

              borderLeft: `4px solid ${genderColor}`,
            }}
          >
            <div className="fw-bold mb-3">Keterangan Plot</div>

            <div className="row g-3">
              {/* ------------------------------------------------
                  KATEGORI
              ------------------------------------------------ */}

              <div className="col-12 col-md-4">
                <div className="text-muted small mb-1">Kategori</div>

                <div className="d-flex align-items-center gap-2">
                  {getResultRisk(result) ? <AlertTriangle size={17} className="text-danger" /> : <CheckCircle2 size={17} className="text-success" />}

                  <strong>{explanation.kategori}</strong>
                </div>
              </div>

              {/* ------------------------------------------------
                  KODE
              ------------------------------------------------ */}

              <div className="col-12 col-md-4">
                <div className="text-muted small mb-1">Kode</div>

                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    backgroundColor: getResultRisk(result) ? "#dc3545" : "#198754",

                    color: "#ffffff",
                  }}
                >
                  {explanation.kode}
                </span>
              </div>

              {/* ------------------------------------------------
                  BATAS
              ------------------------------------------------ */}

              <div className="col-12 col-md-4">
                <div className="text-muted small mb-1">Batas</div>

                <strong>{explanation.batas || "-"}</strong>
              </div>

              {/* ------------------------------------------------
                  Z-SCORE
              ------------------------------------------------ */}

              <div className="col-12 col-md-4">
                <div className="text-muted small mb-1">Z-Score Pemeriksaan Sekarang</div>

                <strong className="fs-5">{Number.isFinite(explanation.zscore) ? `${explanation.zscore.toFixed(2)} SD` : "-"}</strong>
              </div>

              {/* ------------------------------------------------
                  NILAI Y
              ------------------------------------------------ */}

              <div className="col-12 col-md-4">
                <div className="text-muted small mb-1">{config.yLabel}</div>

                <strong className="fs-5">{currentPoint.y}</strong>
              </div>

              {/* ------------------------------------------------
                  NILAI X
              ------------------------------------------------ */}

              <div className="col-12 col-md-4">
                <div className="text-muted small mb-1">{config.xLabel}</div>

                <strong className="fs-5">
                  {currentPoint.x} {config.xUnit === "cm" && "cm"}
                  {config.xUnit === "bulan" && "bulan"}
                </strong>
              </div>
            </div>

            {/* --------------------------------------------------
                FIRST EXAMINATION
            -------------------------------------------------- */}

            {history.length === 1 && (
              <div className="mt-3 pt-3 border-top d-flex align-items-start gap-2">
                <Info size={17} className="text-primary mt-1" />

                <div>
                  <div className="fw-semibold">Pemeriksaan pertama</div>

                  <div className="small text-muted">Belum ada pemeriksaan sebelumnya. Titik pada grafik merupakan hasil pemeriksaan hari ini.</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// NON GRAPH MEASUREMENT HELPERS
// ============================================================

const normalizeIndicatorKey = (value) =>
  normalizeText(value)
    .replace(/[\/\\]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getMeasurementDefinition = (indicatorName) => {
  const key = normalizeIndicatorKey(indicatorName);

  if (key === "imt" || key === "imt sebelum hamil") {
    return {
      resultKeys: ["imt", "imt_sebelum_hamil"],
      value: (measurements, result) => result?.imt ?? result?.nilai_imt ?? calculateImt(measurements?.bb_kg, measurements?.tb_cm),
      unit: "kg/m²",
    };
  }

  if (key === "lingkar perut") {
    return {
      resultKeys: ["lingkar_perut"],
      value: (measurements, result) => result?.nilai ?? measurements?.lingkar_perut_cm,
      unit: "cm",
    };
  }

  if (key === "lila" || key === "lingkar lengan atas") {
    return {
      resultKeys: ["lila"],
      value: (measurements, result) => result?.nilai ?? measurements?.lila_cm,
      unit: "cm",
    };
  }

  if (key === "tekanan darah") {
    return {
      resultKeys: ["tekanan_darah"],
      value: (measurements, result) => {
        if (result?.nilai) return result.nilai;
        const systole = measurements?.td_sistole;
        const diastole = measurements?.td_diastole;
        if (systole == null && diastole == null) return null;
        return `${systole ?? "-"}/${diastole ?? "-"}`;
      },
      unit: "mmHg",
    };
  }

  if (key === "kadar gula darah") {
    return {
      resultKeys: ["kadar_gula_darah"],
      value: (measurements, result) => result?.nilai_riil ?? result?.nilai ?? measurements?.kadar_gula,
      unit: "mg/dl",
    };
  }

  if (key === "lingkar kepala") {
    return {
      resultKeys: ["lingkar_kepala"],
      value: (measurements, result) => result?.nilai ?? measurements?.lingkar_kepala_cm,
      unit: "cm",
    };
  }

  return null;
};

const getResultForIndicator = (indicatorName, results) => {
  const definition = getMeasurementDefinition(indicatorName);
  if (!definition) return null;
  return definition.resultKeys.map((key) => results?.[key]).find(Boolean) || null;
};

const getMeasurementRows = (standards, plottingData, results) => {
  const measurements = plottingData?.pengukuran_step_2 || {};

  return standards
    .map((standard) => {
      const definition = getMeasurementDefinition(standard?.nama);
      if (!definition) return null;

      const result = getResultForIndicator(standard?.nama, results);
      const value = definition.value(measurements, result);

      if (value === null || value === undefined || value === "") return null;

      const explanation = getPlotExplanation(standard, result || {}, null);

      return {
        indicator: standard.nama,
        value,
        unit: definition.unit,
        category: result?.kategori || explanation.kategori || "-",
        code: result?.kode || explanation.kode || "-",
        batas: result?.batas || explanation.batas || "-",
        risk: result?.is_merah === true,
      };
    })
    .filter(Boolean);
};

// ============================================================
// NON GRAPH RESULT TABLE
// ============================================================

const MeasurementResultTable = ({ rows }) => {
  if (!rows.length) return null;

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Activity size={17} className="text-primary" />
        <h6 className="fw-bold mb-0">Hasil Pengukuran</h6>
      </div>

      <div className="table-responsive border rounded-3">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Pengukuran</th>
              <th>Hasil</th>
              <th>Kategori</th>
              <th>Kode</th>
              <th>Batas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.indicator}>
                <td className="fw-semibold">{row.indicator}</td>
                <td className="fw-semibold">
                  {row.value} {row.unit}
                </td>
                <td>
                  <span className={`badge rounded-pill ${row.risk ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}`}>{row.category}</span>
                </td>
                <td>{row.code === "R" && row.category === "Risiko" ? "R (Risiko)" : row.code}</td>
                <td>{row.batas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function GrowthChartPlotter({ plottingData }) {
  // Jangan return sebelum hooks.
  const safePlottingData = plottingData || {};

  // ==========================================================
  // BACKEND RESULTS
  // ==========================================================

  const results = useMemo(() => getBackendResults(safePlottingData), [safePlottingData]);

  // ==========================================================
  // BACKEND STANDARD PLOT
  // ==========================================================

  const standards = Array.isArray(safePlottingData?.standar_plot?.plot) ? safePlottingData.standar_plot.plot : [];

  const usiaBulan = Number(safePlottingData?.usia_bulan || 0);

  const gender = safePlottingData?.warga?.jenis_kelamin || "";

  // ==========================================================
  // GRAPH INDICATORS
  // ==========================================================

  const graphIndicators = useMemo(() => {
    return standards
      .map((standard) => {
        const config = getIndicatorConfig(standard?.nama, usiaBulan, results);

        if (!config || !config.result || config.result.error) {
          return null;
        }

        const current = getCurrentPoint(safePlottingData, config.result, config);

        const hasStandardCurve = Array.isArray(config.result?.grafik_sd?.points) && config.result.grafik_sd.points.length > 0;

        // --------------------------------------------------
        // Tampil jika:
        //
        // 1. BE punya kurva standar
        // atau
        // 2. pemeriksaan hari ini punya titik
        //
        // Jadi pemeriksaan pertama tetap tampil.
        // --------------------------------------------------

        if (!hasStandardCurve && !current) {
          return null;
        }

        return {
          indicator: standard.nama,

          standard,

          config,

          result: config.result,
        };
      })
      .filter(Boolean);
  }, [standards, usiaBulan, results, safePlottingData]);

  // ==========================================================
  // NON GRAPH MEASUREMENTS
  // Semua plot yang tidak memiliki grafik standar ditampilkan
  // sebagai tabel hasil pengukuran. Tidak lagi bergantung pada
  // adanya config chart.
  // ==========================================================

  const measurementRows = useMemo(() => getMeasurementRows(standards, safePlottingData, results), [standards, safePlottingData, results]);

  // ==========================================================
  // REFERRAL
  // ==========================================================

  const overallReferral = Boolean(safePlottingData?.hasil_plot?.is_perlu_rujukan === true || safePlottingData?.hasil_plot?.status_plot === "merah" || Object.values(results).some((item) => item?.is_merah === true));

  // ==========================================================
  // NO PLOTTING
  // ==========================================================

  if (!safePlottingData || (graphIndicators.length === 0 && measurementRows.length === 0)) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="d-flex align-items-start gap-2">
            <Activity size={20} className="text-primary mt-1" />

            <div>
              <h5 className="fw-bold mb-1">Grafik Pertumbuhan</h5>

              <div className="text-muted small">History z-score sebelumnya → garis tren → pemeriksaan sekarang</div>
            </div>
          </div>

          {overallReferral ? <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2">Perlu Tindak Lanjut</span> : <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">Normal</span>}
        </div>
      </div>

      {/* ======================================================
          GRAPHS
      ====================================================== */}

      <div className="p-3">
        {graphIndicators.map(({ indicator, standard, config, result }) => (
          <GrowthChart key={indicator} indicator={indicator} plottingData={safePlottingData} standard={standard} result={result} config={config} gender={gender} />
        ))}

        <MeasurementResultTable rows={measurementRows} />
=======
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight,
  Maximize2,
  Calendar,
  Layers
} from 'lucide-react';
import antropometriData from '../../data/antropometriData.json';
import { 
  normalizeGender, 
  evaluateTbu, 
  evaluateBbu, 
  evaluateBbpb, 
  evaluateImtu,
  lookupStandardRow,
  lookupImt5to18Row
} from '../../utils/antropometriHelper';

/**
 * GrowthChartPlotter Component
 * Plotting grafik standar antropometri Permenkes No. 2 Tahun 2020 / WHO Growth Charts
 */
export default function GrowthChartPlotter({
  gender = 'Perempuan',
  umurBulan: propUmurBulan,
  ageInMonths,
  bb: propBb,
  weight,
  tb: propTb,
  height,
  riwayatPemeriksaan = [],
  activeCategory: propCategory,
  category,
  namaAnak: propNama,
  childName
}) {
  const gCode = normalizeGender(gender);
  const isFemale = gCode === 'F';

  const umurBulan = parseFloat(propUmurBulan ?? ageInMonths ?? 36);
  const bb = parseFloat(propBb ?? weight ?? 13.5);
  const tb = parseFloat(propTb ?? height ?? 92.0);
  const activeCategory = String(propCategory || category || 'balita-12-59').toLowerCase();
  const namaAnak = propNama || childName || 'Anak';

  // Apras (60-72 bulan / 5-6 tahun) sampai Usekrem (6-14 & 15-18 tahun / 5-18 tahun):
  // Sesuai standar Permenkes No. 2 Tahun 2020 & permintaan user, hanya kurva IMT/U saja yang ditampilkan.
  const isOnlyImt = [
    'apras-60-72',
    'apras',
    'usekrem-6-14',
    'usekrem-15-18',
    'usekrem',
    'remaja'
  ].some(k => activeCategory.includes(k)) || umurBulan >= 60;

  // Tabs pilihan tipe grafik
  const defaultChartType = isOnlyImt ? 'imtu' : (umurBulan >= 24 ? 'tbu' : 'pbu');
  const [chartType, setChartType] = useState(defaultChartType);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  React.useEffect(() => {
    if (isOnlyImt) {
      setChartType('imtu');
    }
  }, [isOnlyImt, umurBulan, activeCategory]);

  // Konfigurasi kurva & dataset berdasarkan chartType & gender
  const { datasetKey, chartTitle, yLabel, xLabel, xMin, xMax, yMin, yMax, unitX, unitY, isImtTeen } = useMemo(() => {
    if (chartType === 'tbu') {
      return {
        datasetKey: `${gCode}(24-60) TBU`,
        chartTitle: `Grafik Tinggi Badan Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 2 - 5 Tahun`,
        yLabel: 'Tinggi Badan (cm)',
        xLabel: 'Umur (Bulan Penuh)',
        xMin: 24,
        xMax: 60,
        yMin: 75,
        yMax: 125,
        unitX: 'bln',
        unitY: 'cm',
        isImtTeen: false
      };
    } else if (chartType === 'pbu') {
      return {
        datasetKey: `${gCode}(0-24) PBU`,
        chartTitle: `Grafik Panjang Badan Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 0 - 24 Bulan`,
        yLabel: 'Panjang Badan (cm)',
        xLabel: 'Umur (Bulan Penuh)',
        xMin: 0,
        xMax: 24,
        yMin: 40,
        yMax: 95,
        unitX: 'bln',
        unitY: 'cm',
        isImtTeen: false
      };
    } else if (chartType === 'bbu') {
      return {
        datasetKey: `${gCode}(0-60) BBU`,
        chartTitle: `Grafik Berat Badan Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 0 - 5 Tahun`,
        yLabel: 'Berat Badan (kg)',
        xLabel: 'Umur (Bulan Penuh)',
        xMin: 0,
        xMax: 60,
        yMin: 1,
        yMax: 26,
        unitX: 'bln',
        unitY: 'kg',
        isImtTeen: false
      };
    } else if (chartType === 'bbpb') {
      const is0to24 = umurBulan <= 24 || parseFloat(tb || 0) <= 85;
      return {
        datasetKey: is0to24 ? `${gCode}(0-24) BBPB` : `${gCode}(24-60) BBPB`,
        chartTitle: `Grafik Berat Badan Menurut ${is0to24 ? 'Panjang Badan (0-2 Tahun)' : 'Tinggi Badan (2-5 Tahun)'} Anak ${isFemale ? 'Perempuan' : 'Laki-laki'}`,
        yLabel: 'Berat Badan (kg)',
        xLabel: is0to24 ? 'Panjang Badan (cm)' : 'Tinggi Badan (cm)',
        xMin: is0to24 ? 45 : 65,
        xMax: is0to24 ? 110 : 120,
        yMin: is0to24 ? 1.5 : 5,
        yMax: is0to24 ? 26 : 28,
        unitX: 'cm',
        unitY: 'kg',
        isImtTeen: false
      };
    } else {
      // IMT/U
      if (isOnlyImt) {
        return {
          datasetKey: `${gCode}(5-18 tahun) IMTU`,
          chartTitle: `Grafik Indeks Massa Tubuh (IMT) Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 5 - 18 Tahun`,
          yLabel: 'IMT (kg/m²)',
          xLabel: 'Umur (Tahun)',
          xMin: 60,
          xMax: 216,
          yMin: 10,
          yMax: 32,
          unitX: 'thn',
          unitY: 'kg/m²',
          isImtTeen: true
        };
      } else {
        const is0to24 = umurBulan <= 24;
        return {
          datasetKey: is0to24 ? `${gCode}(0-24) IMTU` : `${gCode}(24-60) IMTU`,
          chartTitle: `Grafik Indeks Massa Tubuh (IMT) Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} ${is0to24 ? '0 - 24 Bulan' : '2 - 5 Tahun'}`,
          yLabel: 'IMT (kg/m²)',
          xLabel: 'Umur (Bulan Penuh)',
          xMin: is0to24 ? 0 : 24,
          xMax: is0to24 ? 24 : 60,
          yMin: 9,
          yMax: 22,
          unitX: 'bln',
          unitY: 'kg/m²',
          isImtTeen: false
        };
      }
    }
  }, [chartType, gCode, isFemale, isOnlyImt, umurBulan, tb]);

  // Data kurva standar dari file JSON
  const rawTableData = useMemo(() => {
    return antropometriData[datasetKey] || [];
  }, [datasetKey]);

  // Hitung Nilai Pengukuran Saat Ini
  const currentVal = useMemo(() => {
    const numAge = parseFloat(umurBulan) || 0;
    const numTb = parseFloat(tb) || 0;
    const numBb = parseFloat(bb) || 0;
    const numImt = (numBb > 0 && numTb > 0) ? (numBb / Math.pow(numTb / 100, 2)) : 0;

    if (chartType === 'tbu' || chartType === 'pbu') {
      return { x: numAge, y: numTb, valid: numTb > 0, isCurrent: true, label: 'Saat Ini' };
    } else if (chartType === 'bbu') {
      return { x: numAge, y: numBb, valid: numBb > 0, isCurrent: true, label: 'Saat Ini' };
    } else if (chartType === 'bbpb') {
      return { x: numTb, y: numBb, valid: numTb > 0 && numBb > 0, isCurrent: true, label: 'Saat Ini' };
    } else {
      // imtu
      return { x: numAge, y: parseFloat(numImt.toFixed(1)), valid: numImt > 0, isCurrent: true, label: 'Saat Ini' };
    }
  }, [chartType, umurBulan, tb, bb]);

  // Evaluasi Titik-Titik Riwayat Pemeriksaan Lintas Bulan (KMS Buku KIA)
  const trajectoryPoints = useMemo(() => {
    const list = [];
    const rawList = Array.isArray(riwayatPemeriksaan) ? riwayatPemeriksaan : [];

    rawList.forEach((item, idx) => {
      if (!item) return;
      const hAge = parseFloat(item.usia_bulan || item.umurBulan || item.usia || 0);
      const hBb = parseFloat(item.bb_kg || item.bb || 0);
      const hTb = parseFloat(item.tb_cm || item.tb || item.pb || 0);
      const hImt = (hBb > 0 && hTb > 0) ? (hBb / Math.pow(hTb / 100, 2)) : 0;
      const tgl = item.tanggal || item.tglPemeriksaan || item.tglPeriksa || `Bulan ${idx + 1}`;

      let p = null;
      if (chartType === 'tbu' || chartType === 'pbu') {
        if (hAge >= 0 && hTb > 0) p = { x: hAge, y: hTb, valid: true, tanggal: tgl, isCurrent: false, label: `Pemeriksaan ${tgl}` };
      } else if (chartType === 'bbu') {
        if (hAge >= 0 && hBb > 0) p = { x: hAge, y: hBb, valid: true, tanggal: tgl, isCurrent: false, label: `Pemeriksaan ${tgl}` };
      } else if (chartType === 'bbpb') {
        if (hTb > 0 && hBb > 0) p = { x: hTb, y: hBb, valid: true, tanggal: tgl, isCurrent: false, label: `Pemeriksaan ${tgl}` };
      } else {
        if (hAge >= 0 && hImt > 0) p = { x: hAge, y: parseFloat(hImt.toFixed(1)), valid: true, tanggal: tgl, isCurrent: false, label: `Pemeriksaan ${tgl}` };
      }
      if (p) list.push(p);
    });

    // Tambahkan titik saat ini jika valid
    if (currentVal.valid) {
      // Cek apakah titik saat ini belum terduplikasi
      const isDuplicated = list.some(pt => pt.x === currentVal.x && Math.abs(pt.y - currentVal.y) < 0.05);
      if (!isDuplicated) {
        list.push(currentVal);
      }
    }

    // Urutkan berdasarkan sumbu X (umur / TB)
    return list.sort((a, b) => a.x - b.x);
  }, [riwayatPemeriksaan, currentVal, chartType]);

  // Hitung Tren Pertumbuhan N / T (Naik / Tidak Naik KMS)
  const growthTrend = useMemo(() => {
    if (trajectoryPoints.length < 2) {
      return { code: 'N', label: 'Pengukuran Baru', isNaik: true, delta: 0, text: 'Data awal pemantauan pertumbuhan.' };
    }
    const last = trajectoryPoints[trajectoryPoints.length - 1];
    const prev = trajectoryPoints[trajectoryPoints.length - 2];
    const delta = parseFloat((last.y - prev.y).toFixed(2));

    if (delta > 0) {
      return { 
        code: 'N', 
        label: 'N (Naik)', 
        isNaik: true, 
        delta, 
        text: `Pertumbuhan naik (+${delta} ${unitY}) mengikuti arah kurva standar.` 
      };
    } else if (delta === 0) {
      return { 
        code: 'T', 
        label: 'T (Tetap / Mendatar)', 
        isNaik: false, 
        delta, 
        text: 'Berat/tinggi badan mendatar dibanding bulan lalu. Perlu perhatian asupan gizi.' 
      };
    } else {
      return { 
        code: 'T', 
        label: 'T (Turun)', 
        isNaik: false, 
        delta, 
        text: `Terjadi penurunan (${delta} ${unitY}) dibanding bulan lalu. Waspada risiko gangguan pertumbuhan!` 
      };
    }
  }, [trajectoryPoints, unitY]);

  // Evaluasi Klinis Z-Score Berdasarkan Permenkes 2/2020
  const evaluation = useMemo(() => {
    if (chartType === 'tbu' || chartType === 'pbu') {
      return evaluateTbu(gender, umurBulan, tb);
    } else if (chartType === 'bbu') {
      return evaluateBbu(gender, umurBulan, bb);
    } else if (chartType === 'bbpb') {
      return evaluateBbpb(gender, umurBulan, tb, bb);
    } else {
      const numTb = parseFloat(tb) || 0;
      const numBb = parseFloat(bb) || 0;
      const numImt = (numBb > 0 && numTb > 0) ? (numBb / Math.pow(numTb / 100, 2)).toFixed(1) : 0;
      return evaluateImtu(gender, umurBulan, numImt);
    }
  }, [chartType, gender, umurBulan, tb, bb]);

  // Transformasi Koordinat SVG (Width: 800, Height: 480, Padding: 60)
  const svgWidth = 780;
  const svgHeight = 440;
  const padding = { top: 35, right: 45, bottom: 50, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const scaleX = (val) => {
    return padding.left + ((val - xMin) / (xMax - xMin)) * plotWidth;
  };

  const scaleY = (val) => {
    return padding.top + plotHeight - ((val - yMin) / (yMax - yMin)) * plotHeight;
  };

  // Bangun path garis SVG untuk masing-masing garis SD
  const generatePath = (key) => {
    if (!rawTableData || rawTableData.length === 0) return '';
    const points = rawTableData.map(d => {
      const xVal = isImtTeen ? d.totalBulan : d.x;
      const yVal = d[key];
      return `${scaleX(xVal)},${scaleY(yVal)}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const pathMin3 = useMemo(() => generatePath('min3'), [rawTableData, isImtTeen]);
  const pathMin2 = useMemo(() => generatePath('min2'), [rawTableData, isImtTeen]);
  const pathMedian = useMemo(() => generatePath('median'), [rawTableData, isImtTeen]);
  const pathPlus2 = useMemo(() => generatePath('plus2'), [rawTableData, isImtTeen]);
  const pathPlus3 = useMemo(() => generatePath('plus3'), [rawTableData, isImtTeen]);

  // Garis Penghubung Trajectory Pertumbuhan Anak Lintas Bulan (KMS Buku KIA)
  const trajectoryPathD = useMemo(() => {
    const validPts = trajectoryPoints.filter(p => p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax);
    if (validPts.length < 2) return '';
    return `M ${validPts.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' L ')}`;
  }, [trajectoryPoints, xMin, xMax, yMin, yMax]);

  // Tema Warna (Pink untuk Perempuan sesuai Buku KIA Kemenkes, Biru untuk Laki-laki)
  const theme = isFemale ? {
    primary: '#e83e8c',
    headerBg: '#fce4ec',
    border: '#f48fb1',
    areaNormal: 'rgba(76, 175, 80, 0.08)',
    areaWarning: 'rgba(255, 152, 0, 0.08)',
    areaDanger: 'rgba(244, 67, 54, 0.08)',
    accent: '#d81b60',
    gridColor: '#f1f1f1'
  } : {
    primary: '#0288d1',
    headerBg: '#e1f5fe',
    border: '#81d4fa',
    areaNormal: 'rgba(76, 175, 80, 0.08)',
    areaWarning: 'rgba(255, 152, 0, 0.08)',
    areaDanger: 'rgba(244, 67, 54, 0.08)',
    accent: '#0277bd',
    gridColor: '#f1f1f1'
  };

  // Grid Ticks
  const xTicks = useMemo(() => {
    const ticks = [];
    const step = isImtTeen ? 24 : (xMax - xMin <= 24 ? 2 : 4);
    for (let i = xMin; i <= xMax; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [xMin, xMax, isImtTeen]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const step = (yMax - yMin) <= 30 ? 5 : 10;
    for (let i = yMin; i <= yMax; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [yMin, yMax]);

  return (
    <div className="card rounded-4 border-0 shadow-sm overflow-hidden mb-4 bg-white">
      {/* Header Banner Khas Buku KIA Kemenkes / WHO */}
      <div className="p-3 border-bottom d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2" style={{ backgroundColor: theme.headerBg, borderTop: `4px solid ${theme.primary}` }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span className="badge px-2.5 py-1 rounded-pill fw-bold text-white small" style={{ backgroundColor: theme.primary }}>
              WHO &amp; Kemenkes RI
            </span>
            <span className="badge bg-white text-dark border px-2 py-0.5 rounded-pill small" style={{ fontSize: '0.75rem' }}>
              Permenkes No. 2 Tahun 2020
            </span>
            {trajectoryPoints.length > 1 && (
              <span className={`badge px-2.5 py-0.5 rounded-pill small fw-bold ${growthTrend.isNaik ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                Tren: {growthTrend.label}
              </span>
            )}
          </div>
          <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.3px' }}>
            {chartTitle}
          </h5>
          <div className="text-muted small mt-0.5" style={{ fontSize: '0.8rem' }}>
            Pemantauan kurva tumbuh kembang anak lintas bulan &amp; deteksi dini stunting (KMS Buku KIA)
          </div>
        </div>

        {/* Tipe Grafik Tabs */}
        <div className="btn-group btn-group-sm bg-white p-1 rounded-pill border shadow-xs" role="group">
          {!isOnlyImt ? (
            <>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === (umurBulan >= 24 ? 'tbu' : 'pbu') ? 'text-white' : 'text-dark border-0'}`}
                style={{ backgroundColor: chartType === (umurBulan >= 24 ? 'tbu' : 'pbu') ? theme.primary : 'transparent' }}
                onClick={() => setChartType(umurBulan >= 24 ? 'tbu' : 'pbu')}
              >
                {umurBulan >= 24 ? 'TB/U' : 'PB/U'} (Tinggi)
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === 'bbu' ? 'text-white' : 'text-dark border-0'}`}
                style={{ backgroundColor: chartType === 'bbu' ? theme.primary : 'transparent' }}
                onClick={() => setChartType('bbu')}
              >
                BB/U (Berat)
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === 'bbpb' ? 'text-white' : 'text-dark border-0'}`}
                style={{ backgroundColor: chartType === 'bbpb' ? theme.primary : 'transparent' }}
                onClick={() => setChartType('bbpb')}
              >
                {umurBulan <= 24 ? 'BB/PB' : 'BB/TB'}
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === 'imtu' ? 'text-white' : 'text-dark border-0'}`}
                style={{ backgroundColor: chartType === 'imtu' ? theme.primary : 'transparent' }}
                onClick={() => setChartType('imtu')}
              >
                IMT/U (Gizi)
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-sm rounded-pill px-3 py-1 font-semibold text-white"
              style={{ backgroundColor: theme.primary }}
              onClick={() => setChartType('imtu')}
            >
              IMT/U (Gizi 5–18 Tahun)
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Plotting */}
      <div className="p-3 bg-white position-relative">
        <div className="table-responsive d-flex justify-content-center">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            style={{ width: '100%', maxWidth: '900px', height: 'auto', maxHeight: '460px', userSelect: 'none' }}
          >
            {/* Background Grid */}
            <rect 
              x={padding.left} 
              y={padding.top} 
              width={plotWidth} 
              height={plotHeight} 
              fill="#ffffff" 
              stroke="#cbd5e1" 
              strokeWidth="1.2" 
            />

            {/* Grid Lines Horizontal (Y) */}
            {yTicks.map(val => (
              <g key={`y-${val}`}>
                <line 
                  x1={padding.left} 
                  y1={scaleY(val)} 
                  x2={padding.left + plotWidth} 
                  y2={scaleY(val)} 
                  stroke={val % 10 === 0 ? '#e2e8f0' : '#f1f5f9'} 
                  strokeWidth="1" 
                />
                <text 
                  x={padding.left - 8} 
                  y={scaleY(val) + 4} 
                  textAnchor="end" 
                  fontSize="10.5" 
                  fontWeight="600"
                  fill="#64748b"
                >
                  {val}
                </text>
                <text 
                  x={padding.left + plotWidth + 8} 
                  y={scaleY(val) + 4} 
                  textAnchor="start" 
                  fontSize="10.5" 
                  fontWeight="600"
                  fill="#64748b"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Grid Lines Vertical (X) */}
            {xTicks.map(val => (
              <g key={`x-${val}`}>
                <line 
                  x1={scaleX(val)} 
                  y1={padding.top} 
                  x2={scaleX(val)} 
                  y2={padding.top + plotHeight} 
                  stroke="#e2e8f0" 
                  strokeWidth="1" 
                />
                <text 
                  x={scaleX(val)} 
                  y={padding.top + plotHeight + 16} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fontWeight="600"
                  fill="#475569"
                >
                  {isImtTeen ? `${Math.floor(val / 12)} Th` : val}
                </text>
              </g>
            ))}

            {/* 5 Kurva Standar Antropometri Permenkes / WHO */}
            {/* Kurva +3 SD (Hitam) */}
            <path d={pathPlus3} fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
            
            {/* Kurva +2 SD (Merah) */}
            <path d={pathPlus2} fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />

            {/* Kurva Median / 0 SD (Hijau Ideal) */}
            <path d={pathMedian} fill="none" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" />

            {/* Kurva -2 SD (Merah) */}
            <path d={pathMin2} fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />

            {/* Kurva -3 SD (Hitam) */}
            <path d={pathMin3} fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />

            {/* Label Z-Score di Ujung Kanan Garis */}
            {rawTableData.length > 0 && (() => {
              const last = rawTableData[rawTableData.length - 1];
              const lastX = isImtTeen ? last.totalBulan : last.x;
              const posX = scaleX(lastX) - 14;
              return (
                <g fontWeight="bold" fontSize="11.5">
                  <text x={posX + 18} y={scaleY(last.plus3) + 4} fill="#334155">+3</text>
                  <text x={posX + 18} y={scaleY(last.plus2) + 4} fill="#ef4444">+2</text>
                  <text x={posX + 18} y={scaleY(last.median) + 4} fill="#16a34a">0</text>
                  <text x={posX + 18} y={scaleY(last.min2) + 4} fill="#ef4444">-2</text>
                  <text x={posX + 18} y={scaleY(last.min3) + 4} fill="#334155">-3</text>
                </g>
              );
            })()}

            {/* Garis Trajectory Pertumbuhan Lintas Bulan (KMS Buku KIA) */}
            {trajectoryPathD && (
              <path 
                d={trajectoryPathD} 
                fill="none" 
                stroke="#1d4ed8" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Titik-Titik Riwayat Pemeriksaan Lintas Bulan */}
            {trajectoryPoints.map((pt, idx) => {
              if (pt.x < xMin || pt.x > xMax || pt.y < yMin || pt.y > yMax) return null;
              const isCurr = pt.isCurrent;
              return (
                <g 
                  key={`pt-${idx}-${pt.x}`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {isCurr ? (
                    <>
                      <circle 
                        cx={scaleX(pt.x)} 
                        cy={scaleY(pt.y)} 
                        r="12" 
                        fill={evaluation.color} 
                        opacity="0.3"
                      />
                      <circle 
                        cx={scaleX(pt.x)} 
                        cy={scaleY(pt.y)} 
                        r="6.5" 
                        fill={evaluation.color} 
                        stroke="#ffffff" 
                        strokeWidth="2.5" 
                      />
                      <rect 
                        x={scaleX(pt.x) - 40} 
                        y={scaleY(pt.y) - 28} 
                        width="80" 
                        height="20" 
                        rx="4" 
                        fill="#0f172a" 
                        opacity="0.88" 
                      />
                      <text 
                        x={scaleX(pt.x)} 
                        y={scaleY(pt.y) - 14} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fontWeight="bold" 
                        fill="#ffffff"
                      >
                        {pt.y} {unitY}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle 
                        cx={scaleX(pt.x)} 
                        cy={scaleY(pt.y)} 
                        r="4.5" 
                        fill="#1d4ed8" 
                        stroke="#ffffff" 
                        strokeWidth="1.8" 
                      />
                      {hoveredPoint === pt && (
                        <g>
                          <rect 
                            x={scaleX(pt.x) - 45} 
                            y={scaleY(pt.y) - 30} 
                            width="90" 
                            height="22" 
                            rx="4" 
                            fill="#1e293b" 
                            opacity="0.92" 
                          />
                          <text 
                            x={scaleX(pt.x)} 
                            y={scaleY(pt.y) - 15} 
                            textAnchor="middle" 
                            fontSize="9.5" 
                            fontWeight="bold" 
                            fill="#ffffff"
                          >
                            {pt.y} {unitY} ({pt.x} {unitX})
                          </text>
                        </g>
                      )}
                    </>
                  )}
                </g>
              );
            })}

            {/* Label Sumbu X & Y */}
            <text 
              x={padding.left + plotWidth / 2} 
              y={svgHeight - 12} 
              textAnchor="middle" 
              fontSize="12" 
              fontWeight="bold" 
              fill="#1e293b"
            >
              {xLabel}
            </text>

            <text 
              transform={`rotate(-90)`}
              x={-(padding.top + plotHeight / 2)} 
              y={18} 
              textAnchor="middle" 
              fontSize="12" 
              fontWeight="bold" 
              fill="#1e293b"
            >
              {yLabel}
            </text>
          </svg>
        </div>


        {/* Tabel Standar Permenkes No. 2 Tahun 2020 (Inset Legend Box seperti Gambar User) */}
        <div className="row g-3 mt-3 align-items-stretch">
          <div className="col-12 col-md-7">
            <div className="card border-0 bg-white rounded-4 p-3.5 h-100 shadow-xs border">
              <h6 className="fw-bold text-dark mb-2.5 small d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                <Info size={16} className="text-primary flex-shrink-0" />
                <span>Standar Kategori Z-Score (Permenkes No. 2 Tahun 2020)</span>
              </h6>
              
              <div className="table-responsive">
                <table className="table table-sm table-bordered bg-white mb-0 text-center small align-middle" style={{ fontSize: '0.8rem' }}>
                  <thead className="table-light">
                    <tr className="text-secondary fw-bold">
                      <th className="py-2" style={{ width: '40%' }}>Rentang Z-Score</th>
                      <th className="py-2 text-start ps-3">Kategori / Status Pertumbuhan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartType === 'tbu' || chartType === 'pbu' ? (
                      <>
                        <tr className={evaluation.zRange === '< -3 SD' ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&lt; -3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Sangat pendek (severely stunted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-3 SD s.d. < -2 SD' ? 'table-warning fw-bold' : ''}>
                          <td className="py-1.5">-3 SD s.d. &lt; -2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-warning-emphasis fw-semibold">Pendek (stunted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-2 SD s.d. +3 SD' ? 'table-success fw-bold' : ''}>
                          <td className="py-1.5">-2 SD s.d. +3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-success fw-semibold">Normal</td>
                        </tr>
                        <tr className={evaluation.zRange === '> +3 SD' ? 'table-primary fw-bold' : ''}>
                          <td className="py-1.5">&gt; +3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-primary fw-semibold">Tinggi</td>
                        </tr>
                      </>
                    ) : chartType === 'bbu' ? (
                      <>
                        <tr className={evaluation.zRange === '< -3 SD' ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&lt; -3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Berat badan sangat kurang</td>
                        </tr>
                        <tr className={evaluation.zRange === '-3 SD s.d. < -2 SD' ? 'table-warning fw-bold' : ''}>
                          <td className="py-1.5">-3 SD s.d. &lt; -2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-warning-emphasis fw-semibold">Berat badan kurang (underweight)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-2 SD s.d. +1 SD' ? 'table-success fw-bold' : ''}>
                          <td className="py-1.5">-2 SD s.d. +1 SD</td>
                          <td className="py-1.5 text-start ps-3 text-success fw-semibold">Berat badan normal</td>
                        </tr>
                        <tr className={evaluation.zRange === '> +1 SD' ? 'table-info fw-bold' : ''}>
                          <td className="py-1.5">&gt; +1 SD</td>
                          <td className="py-1.5 text-start ps-3 text-info-emphasis fw-semibold">Risiko berat badan lebih</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className={evaluation.zRange === '< -3 SD' ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&lt; -3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Gizi buruk (severely wasted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-3 SD s.d. < -2 SD' ? 'table-warning fw-bold' : ''}>
                          <td className="py-1.5">-3 SD s.d. &lt; -2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-warning-emphasis fw-semibold">Gizi kurang (wasted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-2 SD s.d. +1 SD' ? 'table-success fw-bold' : ''}>
                          <td className="py-1.5">-2 SD s.d. +1 SD</td>
                          <td className="py-1.5 text-start ps-3 text-success fw-semibold">Gizi baik (normal)</td>
                        </tr>
                        <tr className={evaluation.zRange?.includes('> +1 SD') ? 'table-info fw-bold' : ''}>
                          <td className="py-1.5">&gt; +1 SD s.d. +2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-info-emphasis fw-semibold">Berisiko gizi lebih</td>
                        </tr>
                        <tr className={evaluation.zRange?.includes('> +2 SD') || evaluation.zRange?.includes('> +3 SD') ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&gt; +2 SD / +3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Gizi lebih / Obesitas</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kartu Status Hasil & Rekomendasi Klinis */}
          <div className="col-12 col-md-5">
            <div className="card border-0 rounded-4 p-3.5 h-100 shadow-xs border d-flex flex-column justify-content-between" style={{ backgroundColor: '#ffffff', borderLeft: `5px solid ${evaluation.color || '#10b981'}` }}>
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                    Hasil Plotting Pengukuran
                  </span>
                  <span className={`badge px-3 py-1 rounded-pill fw-bold ${evaluation.badgeClass}`} style={{ fontSize: '0.8rem' }}>
                    {evaluation.short || evaluation.status}
                  </span>
                </div>

                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom text-muted" style={{ fontSize: '0.83rem' }}>
                    <span>Sasaran / Umur:</span>
                    <strong className="text-dark">{namaAnak} ({umurBulan} Bulan)</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom text-muted" style={{ fontSize: '0.83rem' }}>
                    <span>Hasil Ukur Saat Ini:</span>
                    <strong className="text-primary">{currentVal.y > 0 ? `${currentVal.y} ${unitY}` : 'Belum diukur'}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-1 text-muted" style={{ fontSize: '0.83rem' }}>
                    <span>Posisi Kurva:</span>
                    <span className="fw-bold" style={{ color: evaluation.color }}>{evaluation.zRange}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-light border mt-2">
                <div className="fw-bold small text-dark mb-1 d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                  <Activity size={15} className="text-danger" />
                  <span>Rekomendasi / Tindak Lanjut:</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.45' }}>
                  {evaluation.rekomendasi || 'Tumbuh kembang optimal sesuai umur. Pertahankan stimulasi dan gizi seimbang.'}
                </div>
              </div>
            </div>
          </div>
        </div>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      </div>
    </div>
  );
}
