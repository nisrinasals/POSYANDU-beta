"use strict";

const TRIGGER_REASONS = {
  is_tbc_terindikasi: "Indikasi dari skrining TBC",
  is_rujukan_jiwa: "Indikasi dari skrining kesehatan jiwa",
  is_rujukan_aks: "Indikasi dari skrining aktivitas kehidupan sehari-hari",
  is_rujukan_skilas: "Indikasi dari skrining SKILAS",
};

const getScreeningReferralReasons = (detail = {}) => {
  const reasons = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (TRIGGER_REASONS[key] && child === true) reasons.push(TRIGGER_REASONS[key]);
      else if (key === "status_tbc" && (child === "risiko" || child === "rujukan")) reasons.push("Indikasi dari skrining TBC");
      else if (key === "status_risiko_puma" && child === "risiko_tinggi") reasons.push("Risiko tinggi PPOK (PUMA)");
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

const cleanAndDeduplicateReferralReasons = (input) => {
  if (!input) return "";
  const rawList = Array.isArray(input) ? input : [input];
  const items = [];

  for (const item of rawList) {
    if (!item) continue;
    if (typeof item === "string") {
      const parts = item.split(/[;\n]+| - /);
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed) items.push(trimmed);
      }
    } else if (typeof item === "object") {
      items.push(String(item));
    }
  }

  const seen = new Set();
  const unique = [];
  for (const item of items) {
    const norm = item.toLowerCase().replace(/\s+/g, " ");
    if (!seen.has(norm)) {
      seen.add(norm);
      unique.push(item);
    }
  }

  return unique.join("; ");
};

module.exports = {
  getScreeningReferralReasons,
  getPlotReferralReasons,
  getCombinedReferralReasons,
  cleanAndDeduplicateReferralReasons,
};
