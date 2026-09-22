"use strict";

const assert = require("assert");
const { tentukanPeriodePemeriksaan } = require("../utils/kategoriHelper");

const acuan = { tanggal_persalinan: "2026-01-01" };
assert.deepStrictEqual(tentukanPeriodePemeriksaan("busui", "2026-01-05", acuan), { usia_hari: 4, periode: "0-7_hari" });
assert.deepStrictEqual(tentukanPeriodePemeriksaan("busui", "2026-01-08", acuan), { usia_hari: 7, periode: "7-28_hari" });
assert.deepStrictEqual(tentukanPeriodePemeriksaan("busui", "2026-01-29", acuan), { usia_hari: 28, periode: "7-28_hari" });
assert.deepStrictEqual(tentukanPeriodePemeriksaan("busui", "2026-02-10", acuan), { usia_hari: 40, periode: "28-42_hari" });
assert.deepStrictEqual(tentukanPeriodePemeriksaan("busui", "2026-03-01", acuan), { usia_hari: 59, periode: "bulan_2" });
assert.strictEqual(tentukanPeriodePemeriksaan("dewasa", "2026-01-08", acuan), null);

console.log("pemeriksaan period derived-value tests passed");
