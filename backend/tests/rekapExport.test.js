"use strict";

const assert = require("assert");
const jwt = require("jsonwebtoken");
const { PassThrough } = require("stream");
const request = require("supertest");
const test = require("node:test");
const controller = require("../controllers/pemeriksaanController");
const { app } = require("../server");
const { Pemeriksaan, User } = require("../models");
const { REKAP_GROUPS, REKAP_EXPORT_COLUMNS, aggregateRekapRows } = require("../utils/export/rekapExportHelper");

const response = () => {
  const stream = new PassThrough();
  stream.statusCode = 200;
  stream.body = null;
  stream.headers = {};
  stream.status = (code) => {
    stream.statusCode = code;
    return stream;
  };
  stream.json = (body) => {
    stream.body = body;
    return stream;
  };
  stream.setHeader = (name, value) => {
    stream.headers[name] = value;
  };
  return stream;
};

const invoke = async (request) => {
  const res = response();
  let nextError = null;
  await controller.exportPemeriksaanExcel(request, res, (error) => {
    nextError = error;
  });
  if (nextError) throw nextError;
  return res;
};

const record = (category, detail_skrining = {}) => ({
  id: 1,
  tanggal: "2026-09-17",
  kategori_sasaran: category,
  topik_penyuluhan: "Edukasi",
  is_perlu_rujukan: true,
  detail_skrining,
  kunjungan: {
    warga: { profileKehamilan: [] },
  },
});

test("Rekap helper exposes the four PDF groups and exact column counts", () => {
  assert.deepStrictEqual(Object.keys(REKAP_GROUPS), ["bumil_nifas_menyusui", "bayi_balita_apras", "usia_sekolah_remaja", "dewasa_lansia"]);
  assert.strictEqual(REKAP_EXPORT_COLUMNS.bumil_nifas_menyusui.length, 29);
  assert.strictEqual(REKAP_EXPORT_COLUMNS.bayi_balita_apras.length, 36);
  assert.strictEqual(REKAP_EXPORT_COLUMNS.usia_sekolah_remaja.length, 26);
  assert.strictEqual(REKAP_EXPORT_COLUMNS.dewasa_lansia.length, 47);
});

test("Rekap helper maps every major category group and flattens screening data", () => {
  const rows = [
    ...aggregateRekapRows([record("bumil", { tbc: { is_tbc_terindikasi: true }, pelayanan_kesehatan: { jumlah_ttd_given: 10, is_rutin_ttd: true } })], "bumil_nifas_menyusui"),
    ...aggregateRekapRows([record("balita", { pelayanan_kesehatan: { is_vit_a_given: true } })], "bayi_balita_apras"),
    ...aggregateRekapRows([record("uskrem_15_18", { skrining_kesehatan_jiwa: { total_skor_jiwa: 6 } })], "usia_sekolah_remaja"),
    ...aggregateRekapRows([record("dewasa", { skrining_ppok_puma: { status_risiko_puma: "risiko_tinggi" } }), record("lansia", { aks_aktifitas_harian: { kode_aks: "M" } })], "dewasa_lansia"),
  ];

  assert.strictEqual(rows.length, 4);
  assert.strictEqual(rows[0].ibu_hamil_mendapatkan_ttd, 1);
  assert.strictEqual(rows[0].bergejala_tbc, 1);
  assert.strictEqual(rows[1].vitamin_a, "");
  assert.strictEqual(rows[2].skrining_jiwa_ge_6, 1);
  assert.strictEqual(rows[3].aks_m, 1);
  assert.strictEqual(rows[3].puma_tinggi, 1);
  assert.strictEqual(rows[3].detail_skrining, undefined);
});

test("Rekap endpoint preserves filters and Posyandu scope and returns XLSX for empty results", async () => {
  const originalFindAll = Pemeriksaan.findAll;
  try {
    let options;
    Pemeriksaan.findAll = async (receivedOptions) => {
      options = receivedOptions;
      return [];
    };

    const result = await invoke({
      user: { id: 7, role: "kader", posyandu_id: 12 },
      query: {
        search: "Siti",
        kategori_sasaran: "balita",
        sesi_posyandu_id: "21",
        posyandu_id: "12",
        start_date: "2026-09-01",
        end_date: "2026-09-30",
      },
    });

    assert.strictEqual(result.statusCode, 200);
    assert.match(result.headers["Content-Type"], /spreadsheetml/);
    assert.match(result.headers["Content-Disposition"], /Rekap_Pemeriksaan_/);
    assert.strictEqual(options.where.kategori_sasaran, "balita");
    assert.ok(options.where.tanggal);
    assert.strictEqual(options.include[0].include[1].where.id, "21");
    assert.strictEqual(options.include[0].include[0].where.posyandu_id, "12");
    assert.ok(options.include[0].include[1].include[0].where.id === 12);
    assert.ok(options.include[0].include[0].where[require("sequelize").Op.or]);
  } finally {
    Pemeriksaan.findAll = originalFindAll;
  }
});

test("HTTP Rekap export requires authentication and supports an authenticated request", async () => {
  const originals = { user: User.findByPk, pemeriksaan: Pemeriksaan.findAll };
  const user = { id: 7, role: "kader", status: "active", token_version: 1, posyandu_id: 12, puskesmas_id: 3 };
  try {
    User.findByPk = async () => user;
    Pemeriksaan.findAll = async () => [];

    const unauthorized = await request(app).get("/api/pemeriksaan/export");
    assert.strictEqual(unauthorized.status, 401);

    const token = jwt.sign({ id: user.id, token_version: user.token_version }, process.env.JWT_SECRET || "test_jwt_secret");
    const authorized = await request(app).get("/api/pemeriksaan/export").set("Authorization", `Bearer ${token}`);
    assert.strictEqual(authorized.status, 200);
    assert.match(authorized.headers["content-type"], /spreadsheetml/);
  } finally {
    User.findByPk = originals.user;
    Pemeriksaan.findAll = originals.pemeriksaan;
  }
});
