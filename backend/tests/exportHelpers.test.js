"use strict";

const assert = require("assert");
const test = require("node:test");
const { formatSasaranRow, getExportIndicators } = require("../utils/export/sasaranExportHelper");

const referenceDate = new Date("2026-09-17T00:00:00Z");

const dateAtMonths = (months) => {
  const date = new Date(referenceDate);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString().slice(0, 10);
};

const wargaAtMonths = (months, profileKehamilan) => ({
  tanggal_lahir: dateAtMonths(months),
  profileKehamilan,
});

const printResult = (label, warga) => {
  const row = formatSasaranRow(warga, 0, referenceDate);
  const indicators = getExportIndicators(warga, referenceDate);
  console.log(label, JSON.stringify({ kategori: row.kategori, indicators }));
  return { row, indicators };
};

test("export pregnancy indicators remain independent", () => {
  const cases = [
    ["no pregnancy profile", wargaAtMonths(228)],
    ["hamil", wargaAtMonths(228, [{ id: 1, status_kehamilan: "hamil", is_menyusui: false }])],
    ["nifas", wargaAtMonths(228, [{ id: 1, status_kehamilan: "nifas", is_menyusui: false }])],
    ["menyusui", wargaAtMonths(228, [{ id: 1, status_kehamilan: "menyusui", is_menyusui: true }])],
    ["selesai + is_menyusui=true", wargaAtMonths(228, [{ id: 1, status_kehamilan: "selesai", is_menyusui: true }])],
  ];

  const results = cases.map(([label, warga]) => [label, printResult(label, warga).indicators]);
  const pregnancyIndicators = ({ bumil, nifas, menyusui }) => ({ bumil, nifas, menyusui });
  assert.deepStrictEqual(pregnancyIndicators(results[0][1]), { bumil: false, nifas: false, menyusui: false });
  assert.deepStrictEqual(pregnancyIndicators(results[1][1]), { bumil: true, nifas: false, menyusui: false });
  assert.deepStrictEqual(pregnancyIndicators(results[2][1]), { bumil: false, nifas: true, menyusui: false });
  assert.deepStrictEqual(pregnancyIndicators(results[3][1]), { bumil: false, nifas: false, menyusui: true });
  assert.deepStrictEqual(pregnancyIndicators(results[4][1]), { bumil: false, nifas: false, menyusui: false });
});

test("export age boundaries use total months", () => {
  const cases = [
    ["11 months", 11, "Bayi"],
    ["12 months", 12, "Balita"],
    ["59 months", 59, "Balita"],
    ["60 months", 60, "Anak Prasekolah"],
    ["72 months", 72, "Anak Prasekolah"],
    ["73 months", 73, "Usia Sekolah"],
    ["15 years", 180, "Remaja"],
    ["18 years", 216, "Remaja"],
    ["19 years", 228, "Dewasa"],
    ["59 years", 708, "Dewasa"],
    ["60 years", 720, "Lansia"],
  ];

  for (const [label, months, expectedCategory] of cases) {
    const result = printResult(label, wargaAtMonths(months));
    assert.strictEqual(result.row.kategori, expectedCategory);
  }
});
