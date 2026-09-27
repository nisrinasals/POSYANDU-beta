"use strict";

const TRIGGER_REASONS = {
  is_tbc_terindikasi: "Indikasi dari skrining TBC",
  is_rujukan_jiwa: "Indikasi dari skrining kesehatan jiwa",
  is_rujukan_aks: "Indikasi dari skrining aktivitas kehidupan sehari-hari",
};

const getScreeningReferralReasons = (detail = {}) => {
  const reasons = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (TRIGGER_REASONS[key] && child === true) reasons.push(TRIGGER_REASONS[key]);
      else if (child && typeof child === "object") visit(child);
    }
  };
  visit(detail);
  return [...new Set(reasons)];
};

const getPlotReferralReasons = (plotData) => {
  if (!plotData || typeof plotData !== "object") return [];
  const reasons = [];

  const inspectItem = (item) => {
    if (!item || typeof item !== "object") return;
    if (item.is_merah === true) {
      const label = item.indikator || item.nama;
      const category = item.kategori;
      if (label && category) {
        reasons.push(`Hasil plotting ${label}: ${category}`);
      } else if (label) {
        reasons.push(`Hasil plotting ${label} tidak normal`);
      } else if (category) {
        reasons.push(`Hasil plotting: ${category}`);
      } else {
        reasons.push("Hasil plotting antropometri/fisik tidak normal");
      }
    }
  };

  if (plotData.hasil_plot && typeof plotData.hasil_plot === "object") {
    for (const val of Object.values(plotData.hasil_plot)) {
      inspectItem(val);
    }
  }

  for (const [key, val] of Object.entries(plotData)) {
    if (key !== "hasil_plot" && val && typeof val === "object") {
      inspectItem(val);
    }
  }

  return [...new Set(reasons)];
};

const getCombinedReferralReasons = (detailSkrining = {}, plotData = null) => {
  const screeningReasons = getScreeningReferralReasons(detailSkrining);
  const plotReasons = getPlotReferralReasons(plotData);
  return [...new Set([...screeningReasons, ...plotReasons])];
};

module.exports = { getScreeningReferralReasons, getPlotReferralReasons, getCombinedReferralReasons };
