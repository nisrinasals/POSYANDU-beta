"use strict";

const assert = require("assert");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const test = require("node:test");
const referenceTable = require("../utils/reference/referenceTableAdapter");
const { app } = require("../../server");
const { User, Pemeriksaan, Rujukan } = require("../models");
const pemeriksaanController = require("../controllers/pemeriksaanController");
const { calculateGrowthZScores, zScoreFromRow } = require("../utils/growthZScoreHelper");
const { calculatePregnancyAge, validateHphtAgainstDate } = require("../utils/pregnancyHelper");
const { getScreeningEligibility, validateIrreversibleAsi } = require("../utils/screeningEligibilityHelper");

const referenceRow = referenceTable.tables.find((table) => table.index === "BB/U" && table.gender === "laki-laki").rows.find((row) => row.age_months === 12);

test("growth z-score uses the real reference row and persists all available indicators", () => {
  assert.strictEqual(zScoreFromRow(referenceRow.median, referenceRow), 0);
  const result = calculateGrowthZScores({ bb_kg: referenceRow.median, tb_cm: 75, tanggal_lahir: "2025-09-21", tanggal: "2026-09-21", jenis_kelamin: "L" });
  assert.strictEqual(result.zscore_bbu, 0);
  assert.ok(Object.prototype.hasOwnProperty.call(result, "zscore_imtu"));
});

test("pregnancy age uses HPHT and historical reference date", () => {
  assert.deepStrictEqual(calculatePregnancyAge("2026-05-01", "2026-09-21"), { minggu: 20, hari: 3 });
  assert.match(validateHphtAgainstDate("2026-09-22", "2026-09-21"), /HPHT/);
});

test("ASI, MPASI, and Vitamin A eligibility follows date-based rules", () => {
  assert.strictEqual(getScreeningEligibility("2026-03-21", "2026-09-21").is_asi_eksklusif_active, true);
  assert.strictEqual(getScreeningEligibility("2025-09-21", "2026-09-21").is_asi_eksklusif_active, false);
  assert.strictEqual(getScreeningEligibility("2026-03-21", "2026-09-21").is_mpasi_active, true);
  assert.strictEqual(getScreeningEligibility("2025-09-21", "2026-09-21").is_mpasi_active, false);
  assert.strictEqual(getScreeningEligibility("2025-09-21", "2026-02-21").is_vitamin_a_active, true);
  assert.strictEqual(getScreeningEligibility("2025-09-21", "2026-03-21").is_vitamin_a_active, false);
  assert.match(validateIrreversibleAsi(false, true), /tidak dapat diubah/);
  assert.strictEqual(validateIrreversibleAsi(false, false), null);
});

test("Dinkes cannot access individual Warga data through the API", async () => {
  const originalFindByPk = User.findByPk;
  const user = { id: 4, role: "dinkes", status: "active", token_version: 1 };
  try {
    User.findByPk = async () => user;
    const token = jwt.sign({ id: user.id, token_version: user.token_version }, process.env.JWT_SECRET || "test_jwt_secret");
    const response = await request(app).get("/api/warga").set("Authorization", `Bearer ${token}`);
    assert.strictEqual(response.status, 403);
    assert.match(response.body.message, /agregat/);
  } finally {
    User.findByPk = originalFindByPk;
  }
});

test("screening history returns latest and newest-first records", async () => {
  const originalFindByPk = Pemeriksaan.findByPk;
  try {
    Pemeriksaan.findByPk = async () => ({
      screening_history: [
        { id: "old", tanggal: "2026-01-01", hasil: { score: 1 } },
        { id: "new", tanggal: "2026-09-21", hasil: { score: 2 } },
      ],
    });
    const response = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
    await pemeriksaanController.getScreeningHistory({ params: { id: "1" }, user: { role: "sa" } }, response, (error) => {
      throw error;
    });
    assert.strictEqual(response.body.data.last_filled_at, "2026-09-21");
    assert.strictEqual(response.body.data.history[0].id, "new");
    assert.deepStrictEqual(response.body.data.latest, { score: 2 });
  } finally {
    Pemeriksaan.findByPk = originalFindByPk;
  }
});

test("referral attendance is nullable and constrained to known values", () => {
  const attribute = Rujukan.rawAttributes.status_kehadiran_rujukan;
  assert.ok(attribute);
  assert.deepStrictEqual(attribute.validate.isIn[0], ["hadir", "tidak_hadir"]);
  assert.strictEqual(attribute.allowNull, true);
});
