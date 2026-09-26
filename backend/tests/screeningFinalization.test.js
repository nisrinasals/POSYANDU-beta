"use strict";

const assert = require("assert");
const test = require("node:test");
const { Op } = require("sequelize");
const { SKEMA_SKRINING, formatDetailSkrining, validateDetailSkrining } = require("../utils/detailSkriningHelper");
const { checkSudahSkriningTahunan } = require("../utils/skriningChecker");
const { Pemeriksaan } = require("../models");
const { tentukanKategoriUmur } = require("../utils/kategoriHelper");

const categories = ["bumil", "busui", "bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18", "dewasa", "lansia"];

const clone = (value) => JSON.parse(JSON.stringify(value));
const setBooleansTrue = (value) => {
  if (Array.isArray(value)) return value.map(setBooleansTrue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, setBooleansTrue(child)]));
  return typeof value === "boolean" ? true : value;
};

const dateAtAge = (birth, years, dayOffset = 0) => {
  const date = new Date(`${birth}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
};

for (const category of categories) {
  test(`schema ${category} accepts its own defaults and rejects category leakage`, () => {
    const defaults = clone(SKEMA_SKRINING[category]);
    assert.strictEqual(validateDetailSkrining(category, defaults), null);
    const formatted = formatDetailSkrining(category, {});
    assert.strictEqual(validateDetailSkrining(category, formatted), null);
    assert.match(validateDetailSkrining(category, { field_kategori_lain: true }), /tidak dikenali/);
  });
}

test("screening schema preserves boolean and numeric types", () => {
  const allTrueSkilas = setBooleansTrue(SKEMA_SKRINING.lansia.skilas);
  assert.strictEqual(validateDetailSkrining("lansia", { skilas: allTrueSkilas }), null);
  assert.match(validateDetailSkrining("lansia", { skilas: { is_imunisasi_covid19: "true" } }), /tipe data tidak valid/);
  assert.match(validateDetailSkrining("dewasa", { skrining_ppok_puma: { total_skor_puma: "6" } }), /tipe data tidak valid/);
  assert.match(validateDetailSkrining("dewasa", { skrining_kesehatan_jiwa: { jawaban_skor: { kurang_bersemangat: null } } }), /tipe data tidak valid/);
});

test("missing nested screening objects are completed by existing schema formatter", () => {
  const formatted = formatDetailSkrining("lansia", { skilas: {} });
  assert.strictEqual(formatted.skilas.kognitif_dan_mobilisasi.has_kendala_ulang_3_kata, false);
  assert.strictEqual(formatted.skilas.is_imunisasi_covid19, false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(formatted, "aks_aktifitas_harian"), false);
  assert.strictEqual(validateDetailSkrining("lansia", formatted), null);
});

test("APRAS and USKREM boundaries are deterministic and non-overlapping", () => {
  const birth = "2020-09-14";
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 5, -1)), "balita");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 5)), "apras");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 5, 1)), "apras");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 6, -1)), "apras");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 6)), "uskrem_6_14");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 14, 1)), "uskrem_6_14");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 15)), "uskrem_15_18");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 18, 1)), "uskrem_15_18");
  assert.strictEqual(tentukanKategoriUmur(birth, dateAtAge(birth, 19)), "dewasa");
});

test("annual screening checker uses the requested examination year", async () => {
  const originalFindOne = Pemeriksaan.findOne;
  const calls = [];
  try {
    Pemeriksaan.findOne = async (options) => {
      calls.push(options);
      return null;
    };
    assert.strictEqual(await checkSudahSkriningTahunan(10, 2025), false);
    assert.strictEqual(await checkSudahSkriningTahunan(10, 2026), false);
    assert.strictEqual(await checkSudahSkriningTahunan(10, 2027), false);
    const ranges = calls.map((call) => call.where.tanggal[Object.getOwnPropertySymbols(call.where.tanggal)[0]]);
    assert.strictEqual(new Date(ranges[0][0]).getUTCFullYear(), 2025);
    assert.strictEqual(new Date(ranges[1][0]).getUTCFullYear(), 2026);
    assert.strictEqual(new Date(ranges[2][0]).getUTCFullYear(), 2027);
  } finally {
    Pemeriksaan.findOne = originalFindOne;
  }
});

test("annual screening checker excludes the pemeriksaan currently being saved from the self-match", async () => {
  const originalFindOne = Pemeriksaan.findOne;
  const calls = [];
  try {
    Pemeriksaan.findOne = async (options) => {
      calls.push(options);
      return null;
    };
    await checkSudahSkriningTahunan(10, 2026, 55);
    assert.deepStrictEqual(calls[0].where.id, { [Op.ne]: 55 });
  } finally {
    Pemeriksaan.findOne = originalFindOne;
  }
});

test("annual screening checker omits id filter when no pemeriksaan id is excluded", async () => {
  const originalFindOne = Pemeriksaan.findOne;
  const calls = [];
  try {
    Pemeriksaan.findOne = async (options) => {
      calls.push(options);
      return null;
    };
    await checkSudahSkriningTahunan(10, 2026);
    assert.strictEqual(Object.prototype.hasOwnProperty.call(calls[0].where, "id"), false);
  } finally {
    Pemeriksaan.findOne = originalFindOne;
  }
});

test("scoring fields remain numeric schema fields until authoritative rules are supplied", () => {
  const puma = formatDetailSkrining("dewasa", { skrining_ppok_puma: { jenis_kelamin_skor: 1, usia_skor: 2, total_skor_puma: 999 } });
  const jiwa = formatDetailSkrining("dewasa", { skrining_kesehatan_jiwa: { jawaban_skor: { kurang_bersemangat: 3 }, total_skor_jiwa: 999 } });
  const aks = formatDetailSkrining("lansia", { aks_aktifitas_harian: { mandi_skor: 4, total_skor_aks: 999 } });
  assert.strictEqual(validateDetailSkrining("dewasa", puma), null);
  assert.strictEqual(validateDetailSkrining("dewasa", jiwa), null);
  assert.strictEqual(validateDetailSkrining("lansia", aks), null);
  assert.strictEqual(puma.skrining_ppok_puma.total_skor_puma, 999);
  assert.strictEqual(jiwa.skrining_kesehatan_jiwa.total_skor_jiwa, 999);
  assert.strictEqual(aks.aks_aktifitas_harian.total_skor_aks, 999);
});
