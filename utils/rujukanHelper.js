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

module.exports = { getScreeningReferralReasons };
