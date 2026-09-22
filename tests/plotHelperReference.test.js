"use strict";

const assert = require("assert");
const test = require("node:test");
const referenceTable = require("../utils/reference/referenceTableAdapter");
const { evaluasiBBU, evaluasiTBU, evaluasiIMTU, kalkulasiAntropometriAnak, evaluasiPemeriksaan } = require("../utils/plotHelper");

const table = (index, gender, ageRange) => referenceTable.tables.find((item) => item.index === index && item.gender === gender && (!ageRange || item.age_range === ageRange));
const row = (index, gender, key, value, ageRange) => table(index, gender, ageRange).rows.find((item) => item[key] === value);
const birthForAge = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
};

test("BB/U uses normalized gender, real rows, and SD boundaries", () => {
  const male = row("BB/U", "laki-laki", "age_months", 12);
  assert.strictEqual(evaluasiBBU(male.median, 12, "L").reference.median, male.median);
  assert.strictEqual(evaluasiBBU(male.median, 12, "L").kode, "N");
  assert.strictEqual(evaluasiBBU(male.sd_minus_3, 12, "laki-laki").sd_position, "-3 SD s.d. <-2 SD");
  assert.strictEqual(evaluasiBBU(male.sd_minus_3 - 0.01, 12, "male").sd_position, "<-3 SD");
  assert.strictEqual(evaluasiBBU(male.sd_plus_1 + 0.01, 12, "L").sd_position, ">+1 SD s.d. +2 SD");
  assert.match(evaluasiBBU(10, 61, "L").error, /usia 61 bulan/);
});

test("PB/U and TB/U switch tables at 24 months", () => {
  const pb = row("PB/U", "perempuan", "age_months", 23);
  const tb = row("TB/U", "perempuan", "age_months", 24);
  assert.strictEqual(evaluasiTBU(pb.median, 23, "P").indikator, "PB/U");
  assert.strictEqual(evaluasiTBU(pb.median, 23, "P").reference.median, pb.median);
  assert.strictEqual(evaluasiTBU(tb.median, 24, "perempuan").indikator, "TB/U");
  assert.strictEqual(evaluasiTBU(tb.median, 24, "perempuan").reference.median, tb.median);
  assert.strictEqual(evaluasiTBU(tb.sd_minus_3 - 0.01, 24, "P").sd_position, "<-3 SD");
  assert.match(evaluasiTBU(100, 61, "P").error, /usia 61 bulan/);
});

test("BB/PB and BB/TB use measurement-axis rows from production data", () => {
  const child = kalkulasiAntropometriAnak({ bb_kg: 8, tb_cm: 70, tanggal_lahir: birthForAge(12), jenis_kelamin: "P" });
  assert.strictEqual(child.bb_panjang_tinggi.indikator, "BB/PB");
  assert.ok(child.bb_panjang_tinggi.reference.length_cm);

  const nonExact = kalkulasiAntropometriAnak({ bb_kg: 8, tb_cm: 70.2, tanggal_lahir: birthForAge(12), jenis_kelamin: "P" });
  assert.strictEqual(nonExact.bb_panjang_tinggi.reference.length_cm, 70);

  const toddler = kalkulasiAntropometriAnak({ bb_kg: 12, tb_cm: 85, tanggal_lahir: birthForAge(24), jenis_kelamin: "L" });
  assert.strictEqual(toddler.bb_panjang_tinggi.indikator, "BB/TB");
  assert.ok(toddler.bb_panjang_tinggi.reference.height_cm);
});

test("IMT/U selects 0-24, 24-60, and 5-18 tables without z-score fabrication", () => {
  const cases = [
    [12, "laki-laki", "0-24 bulan"],
    [24, "perempuan", "24-60 bulan"],
    [61, "laki-laki", "5-18 tahun"],
  ];
  for (const [age, gender, ageRange] of cases) {
    const expected = row("IMT/U", gender, "age_months", age, ageRange);
    const result = evaluasiIMTU(expected.median, 100, age, gender);
    assert.strictEqual(result.reference.median, expected.median);
    assert.strictEqual(Object.prototype.hasOwnProperty.call(result, "z_score"), false);
  }
  const reference = row("IMT/U", "laki-laki", "age_months", 12, "0-24 bulan");
  assert.strictEqual(evaluasiIMTU(reference.median, 100, 12, "L").sd_position, "-2 SD s.d. +1 SD");
  const schoolReference = row("IMT/U", "laki-laki", "age_months", 61, "5-18 tahun");
  assert.strictEqual(evaluasiIMTU(schoolReference.sd_plus_2 + 0.01, 100, 61, "L").kode, "Obes");
});

test("adult plotting remains on existing non-reference logic", () => {
  const result = evaluasiPemeriksaan({ kategori_sasaran: "dewasa", bb_kg: 60, tb_cm: 165, td_sistole: 120, td_diastole: 80, jenis_kelamin: "P" });
  assert.strictEqual(result.hasil_plot.imt.kode, "N");
  assert.strictEqual(result.hasil_plot.tekanan_darah.kode, "N");
});
