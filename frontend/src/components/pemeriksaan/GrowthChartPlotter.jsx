// frontend/src/components/pemeriksaan/GrowthChartPlotter.jsx

import React, { useEffect, useMemo, useRef } from "react";

import { Chart, registerables } from "chart.js";

import { Activity, AlertTriangle, CheckCircle2, Info } from "lucide-react";

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

                  const tanggal = raw?.tanggal ? new Date(raw.tanggal).toLocaleDateString("id-ID") : "-";

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
// NON GRAPH RESULT CARD
// ============================================================

const ResultCard = ({ indicator, result, standard }) => {
  if (!result) {
    return null;
  }

  const risk = result?.is_merah === true;

  const explanation = getPlotExplanation(standard, result, null);

  const value = result?.nilai_riil ?? result?.nilai ?? result?.nilai_imt ?? result?.nilai_bb ?? result?.imt ?? null;

  const zscore = toNumber(result?.zscore) ?? toNumber(result?.z_score);

  return (
    <div className="col-12 col-md-6">
      <div className="card border rounded-4 shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
            <h6 className="fw-bold mb-0">{indicator}</h6>

            {risk ? (
              <span className="badge bg-danger-subtle text-danger rounded-pill d-flex align-items-center gap-1">
                <AlertTriangle size={12} />
                Berisiko
              </span>
            ) : (
              <span className="badge bg-success-subtle text-success rounded-pill d-flex align-items-center gap-1">
                <CheckCircle2 size={12} />
                Normal
              </span>
            )}
          </div>

          <div className="small">
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="text-muted">Nilai</span>

              <strong>{value ?? "-"}</strong>
            </div>

            {zscore !== null && (
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted">Z-Score</span>

                <strong>{zscore.toFixed(2)} SD</strong>
              </div>
            )}

            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="text-muted">Kategori</span>

              <strong>{explanation.kategori}</strong>
            </div>

            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="text-muted">Kode</span>

              <strong>{explanation.kode}</strong>
            </div>

            <div className="d-flex justify-content-between pt-2">
              <span className="text-muted">Batas</span>

              <strong>{explanation.batas || "-"}</strong>
            </div>
          </div>
        </div>
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
  // NON GRAPH INDICATORS
  // ==========================================================

  const nonGraphIndicators = useMemo(() => {
    return standards
      .map((standard) => {
        const config = getIndicatorConfig(standard?.nama, usiaBulan, results);

        if (!config || !config.result || config.result.error) {
          return null;
        }

        const hasStandardCurve = Array.isArray(config.result?.grafik_sd?.points) && config.result.grafik_sd.points.length > 0;

        const current = getCurrentPoint(safePlottingData, config.result, config);

        if (hasStandardCurve || current) {
          return null;
        }

        return {
          indicator: standard.nama,

          standard,

          result: config.result,
        };
      })
      .filter(Boolean);
  }, [standards, usiaBulan, results, safePlottingData]);

  // ==========================================================
  // REFERRAL
  // ==========================================================

  const overallReferral = Boolean(safePlottingData?.hasil_plot?.is_perlu_rujukan === true || safePlottingData?.hasil_plot?.status_plot === "merah" || Object.values(results).some((item) => item?.is_merah === true));

  // ==========================================================
  // NO PLOTTING
  // ==========================================================

  if (!safePlottingData || (graphIndicators.length === 0 && nonGraphIndicators.length === 0)) {
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

        {/* ====================================================
            NON-GRAPH RESULTS
        ==================================================== */}

        {nonGraphIndicators.length > 0 && (
          <div className="mt-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Activity size={17} className="text-primary" />

              <h6 className="fw-bold mb-0">Hasil Pemeriksaan Lainnya</h6>
            </div>

            <div className="row g-3">
              {nonGraphIndicators.map(({ indicator, standard, result }) => (
                <ResultCard key={indicator} indicator={indicator} standard={standard} result={result} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
