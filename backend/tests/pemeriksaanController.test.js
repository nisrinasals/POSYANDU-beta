"use strict";

const assert = require("assert");
const test = require("node:test");
const { Pemeriksaan, KunjunganPosyandu, SesiPosyandu, Rujukan, AuditLog } = require("../models");
const controller = require("../controllers/pemeriksaanController");
const { evaluasiBBU, STANDAR_PLOT } = require("../utils/plotHelper");

const sa = { role: "sa" };
const kader = { role: "kader", posyandu_id: 7 };
const posyandu = { id: 7, puskesmas_id: 3 };
const recentSessionDate = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);

const response = () => ({
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
});

const request = (body = {}, user = sa, id = 1) => ({ body, user, params: { id: String(id) } });

const invoke = async (handler, req) => {
  const res = response();
  let error = null;
  await handler(req, res, (nextError) => {
    error = nextError;
  });
  if (error) throw error;
  return res;
};

const makeKunjungan = (status = "langkah_1", session = { tanggal_pelaksanaan: recentSessionDate, status: "open", posyandu }) => ({
  id: 10,
  warga_id: 20,
  status_langkah: status,
  sesiPosyandu: session,
  warga: {
    id: 20,
    tanggal_lahir: "1990-01-01",
    jenis_kelamin: "P",
    profileKehamilan: [],
    posyandu: { id: 7, puskesmas_id: 3 },
  },
  async update(values) {
    Object.assign(this, values);
  },
});

const makePemeriksaan = (kunjungan) => ({
  id: 30,
  kunjungan_id: kunjungan.id,
  tanggal: "2026-09-14",
  usia_bulan: 440,
  kategori_sasaran: "dewasa",
  detail_skrining: {},
  is_perlu_rujukan: false,
  kunjungan,
  async update(values) {
    Object.assign(this, values);
  },
  async destroy() {
    this.destroyed = true;
  },
});

test("create is derived from warga and findOrCreate avoids duplicate records", async () => {
  const originalFindByPk = KunjunganPosyandu.findByPk;
  const originalFindOrCreate = Pemeriksaan.findOrCreate;
  const originalTransaction = Pemeriksaan.sequelize.transaction;
  const originalReferralFindOne = Rujukan.findOne;
  const originalReferralCreate = Rujukan.create;
  try {
    const kunjungan = makeKunjungan();
    const pemeriksaan = makePemeriksaan(kunjungan);
    let findOrCreateCalls = 0;
    KunjunganPosyandu.findByPk = async () => kunjungan;
    Pemeriksaan.findOrCreate = async (options) => {
      findOrCreateCalls += 1;
      assert.deepStrictEqual(options.where, { kunjungan_id: 10 });
      return [pemeriksaan, true];
    };
    Rujukan.findOne = async () => null;
    Rujukan.create = async (payload) => payload;

    const created = await invoke(controller.createPemeriksaan, request({ kunjungan_id: 10, kategori_sasaran: "uskrem_6_14", bb_kg: 60, tb_cm: 165, is_perlu_rujukan: true, alasan_rujukan: "Perlu konsultasi lanjutan" }));
    assert.strictEqual(created.statusCode, 200);
    assert.strictEqual(pemeriksaan.kategori_sasaran, "dewasa");
    assert.strictEqual(pemeriksaan.usia_bulan, 440);
    assert.strictEqual(pemeriksaan.is_perlu_rujukan, true);
    assert.strictEqual(kunjungan.status_langkah, "langkah_5");
    assert.strictEqual(findOrCreateCalls, 1);
  } finally {
    KunjunganPosyandu.findByPk = originalFindByPk;
    Pemeriksaan.findOrCreate = originalFindOrCreate;
    Rujukan.findOne = originalReferralFindOne;
    Rujukan.create = originalReferralCreate;
  }
});

test("step 2 validates measurements, stores them, and advances status", async () => {
  const originalFindByPk = KunjunganPosyandu.findByPk;
  const originalFindOrCreate = Pemeriksaan.findOrCreate;
  try {
    const kunjungan = makeKunjungan();
    const pemeriksaan = makePemeriksaan(kunjungan);
    KunjunganPosyandu.findByPk = async () => kunjungan;
    Pemeriksaan.findOrCreate = async () => [pemeriksaan, false];

    const invalid = await invoke(controller.saveStep2, request({ kunjungan_id: 10, bb_kg: 0 }));
    assert.strictEqual(invalid.statusCode, 400);

    const saved = await invoke(controller.saveStep2, request({ kunjungan_id: 10, bb_kg: 60, tb_cm: 165, td_sistole: 120 }));
    assert.strictEqual(saved.statusCode, 200);
    assert.strictEqual(pemeriksaan.bb_kg, 60);
    assert.strictEqual(pemeriksaan.tb_cm, 165);
    assert.strictEqual(kunjungan.status_langkah, "langkah_2");
  } finally {
    KunjunganPosyandu.findByPk = originalFindByPk;
    Pemeriksaan.findOrCreate = originalFindOrCreate;
  }
});

test("step 3 uses stored measurements and scoped history", async () => {
  const originalFindByPk = Pemeriksaan.findByPk;
  const originalFindAll = Pemeriksaan.findAll;
  try {
    const pemeriksaan = {
      get: () => ({
        id: 30,
        tanggal: "2026-09-14",
        usia_bulan: 440,
        kategori_sasaran: "dewasa",
        bb_kg: 60,
        tb_cm: 165,
        td_sistole: 120,
        td_diastole: 80,
        lila_cm: 22,
        lingkar_perut_cm: 75,
        kunjungan: {
          warga_id: 20,
          warga: { tanggal_lahir: "1990-01-01", jenis_kelamin: "P", profileKehamilan: [] },
          sesiPosyandu: { tanggal_pelaksanaan: "2026-09-14", status: "open", posyandu_id: 7 },
        },
        profileKehamilan: null,
      }),
    };
    Pemeriksaan.findByPk = async () => pemeriksaan;
    Pemeriksaan.findAll = async (options) => {
      if (options?.where?.["$kunjungan.warga_id$"]) {
        assert.ok(options.include[0].include[0].include[0].where);
        return [{ id: 29, kategori_sasaran: "dewasa" }];
      }
      return [];
    };

    const plotted = await invoke(controller.getStep3Pemeriksaan, request({}, sa, 30));
    assert.strictEqual(plotted.statusCode, 200);
    assert.strictEqual(plotted.body.data.pengukuran_step_2.bb_kg, 60);
    assert.ok(plotted.body.data.hasil_plot);
    assert.deepStrictEqual(plotted.body.data.historis, [{ id: 29, kategori_sasaran: "dewasa" }]);
  } finally {
    Pemeriksaan.findByPk = originalFindByPk;
    Pemeriksaan.findAll = originalFindAll;
  }
});

test("step 4 rejects invalid screening detail and step 5 finalizes referral", async () => {
  const originalFindByPk = KunjunganPosyandu.findByPk;
  const originalFindOrCreate = Pemeriksaan.findOrCreate;
  const originalTransaction = Pemeriksaan.sequelize.transaction;
  const originalReferralFindOne = Rujukan.findOne;
  const originalReferralCreate = Rujukan.create;
  try {
    const kunjungan = makeKunjungan("langkah_2");
    const pemeriksaan = makePemeriksaan(kunjungan);
    KunjunganPosyandu.findByPk = async () => kunjungan;
    Pemeriksaan.findOrCreate = async () => [pemeriksaan, false];
    Pemeriksaan.sequelize.transaction = async () => ({ commit: async () => {}, rollback: async () => {} });
    Rujukan.findOne = async () => null;
    Rujukan.create = async (values) => ({ id: 50, ...values });

    const invalid = await invoke(controller.saveStep4, request({ kunjungan_id: 10, detail_skrining: { field_tidak_valid: true } }));
    assert.strictEqual(invalid.statusCode, 400);

    const screened = await invoke(controller.saveStep4, request({ kunjungan_id: 10, detail_skrining: { tbc: { has_batuk_lebih_2_minggu: true } } }));
    assert.strictEqual(screened.statusCode, 200);
    assert.strictEqual(pemeriksaan.detail_skrining.tbc.has_batuk_lebih_2_minggu, true);
    assert.strictEqual(kunjungan.status_langkah, "langkah_4");

    const finalized = await invoke(controller.saveStep5, request({ kunjungan_id: 10, topik_penyuluhan: "Gizi", is_perlu_rujukan: true }));
    assert.strictEqual(finalized.statusCode, 200);
    assert.strictEqual(pemeriksaan.is_perlu_rujukan, true);
    assert.strictEqual(kunjungan.status_langkah, "langkah_5");
  } finally {
    KunjunganPosyandu.findByPk = originalFindByPk;
    Pemeriksaan.findOrCreate = originalFindOrCreate;
    Pemeriksaan.sequelize.transaction = originalTransaction;
    Rujukan.findOne = originalReferralFindOne;
    Rujukan.create = originalReferralCreate;
  }
});

test("update and delete stay scoped and kader mutation follows session rules", async () => {
  const originalFindByPk = Pemeriksaan.findByPk;
  const originalKunjunganFindByPk = KunjunganPosyandu.findByPk;
  const originalQuery = SesiPosyandu.sequelize.query;
  try {
    const kunjungan = makeKunjungan();
    const pemeriksaan = makePemeriksaan(kunjungan);
    Pemeriksaan.findByPk = async () => pemeriksaan;

    const updated = await invoke(controller.updatePemeriksaan, request({ bb_kg: 61 }, sa, 30));
    assert.strictEqual(updated.statusCode, 200);
    assert.strictEqual(pemeriksaan.bb_kg, 61);

    const deleted = await invoke(controller.deletePemeriksaan, request({}, sa, 30));
    assert.strictEqual(deleted.statusCode, 200);
    assert.strictEqual(pemeriksaan.destroyed, true);

    SesiPosyandu.sequelize.query = async () => [{ tanggal: "2026-09-14" }];
    const closedKunjungan = makeKunjungan("langkah_2", { tanggal_pelaksanaan: "2026-09-14", status: "closed", posyandu });
    const closedPemeriksaan = makePemeriksaan(closedKunjungan);
    KunjunganPosyandu.findByPk = async () => closedKunjungan;
    Pemeriksaan.findByPk = async () => closedPemeriksaan;
    const closed = await invoke(controller.saveStep2, request({ kunjungan_id: 10, bb_kg: 60 }, kader));
    assert.strictEqual(closed.statusCode, 400);

    const lateKunjungan = makeKunjungan("langkah_2", { tanggal_pelaksanaan: "2026-09-07", status: "open", posyandu });
    const latePemeriksaan = makePemeriksaan(lateKunjungan);
    KunjunganPosyandu.findByPk = async () => lateKunjungan;
    Pemeriksaan.findByPk = async () => latePemeriksaan;
    const late = await invoke(controller.saveStep2, request({ kunjungan_id: 10, bb_kg: 60 }, kader));
    assert.strictEqual(late.statusCode, 403);
  } finally {
    Pemeriksaan.findByPk = originalFindByPk;
    KunjunganPosyandu.findByPk = originalKunjunganFindByPk;
    SesiPosyandu.sequelize.query = originalQuery;
  }
});

test("plot helper keeps reference and boundary behavior available", () => {
  assert.ok(STANDAR_PLOT.uskrem_6_14);
  const result = evaluasiBBU(8.9, 12, "P");
  assert.strictEqual(result.reference.median, 8.9);
  assert.strictEqual(result.sd_position, "-2 SD s.d. +1 SD");
  assert.strictEqual(result.kode, "N");
});

test("createPemeriksaan menghasilkan satu audit log PEMERIKSAAN_CREATE saat record baru", async () => {
  const originalFindByPk = KunjunganPosyandu.findByPk;
  const originalFindOrCreate = Pemeriksaan.findOrCreate;
  const originalAuditCreate = AuditLog.create;
  try {
    const kunjungan = makeKunjungan();
    const pemeriksaan = makePemeriksaan(kunjungan);
    KunjunganPosyandu.findByPk = async () => kunjungan;
    Pemeriksaan.findOrCreate = async () => [pemeriksaan, true];

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const created = await invoke(controller.createPemeriksaan, request({ kunjungan_id: 10, bb_kg: 60, tb_cm: 165 }));
    assert.strictEqual(created.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "PEMERIKSAAN_CREATE");
    assert.strictEqual(auditCalls[0].old_value, null);
  } finally {
    KunjunganPosyandu.findByPk = originalFindByPk;
    Pemeriksaan.findOrCreate = originalFindOrCreate;
    AuditLog.create = originalAuditCreate;
  }
});

test("updatePemeriksaan menghasilkan satu audit log PEMERIKSAAN_UPDATE dengan old/new value", async () => {
  const originalFindByPk = Pemeriksaan.findByPk;
  const originalAuditCreate = AuditLog.create;
  try {
    const kunjungan = makeKunjungan();
    const pemeriksaan = makePemeriksaan(kunjungan);
    Pemeriksaan.findByPk = async () => pemeriksaan;

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const updated = await invoke(controller.updatePemeriksaan, request({ bb_kg: 61 }, sa, 30));
    assert.strictEqual(updated.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "PEMERIKSAAN_UPDATE");
    assert.strictEqual(auditCalls[0].new_value.bb_kg, 61);
  } finally {
    Pemeriksaan.findByPk = originalFindByPk;
    AuditLog.create = originalAuditCreate;
  }
});

test("annual screening flag is not reset when the record being saved matches itself in the duplicate check", async () => {
  const originalKunjunganFindByPk = KunjunganPosyandu.findByPk;
  const originalFindOrCreate = Pemeriksaan.findOrCreate;
  const originalFindOne = Pemeriksaan.findOne;
  try {
    const kunjungan = makeKunjungan();
    const pemeriksaan = makePemeriksaan(kunjungan);
    pemeriksaan.detail_skrining = { is_skrining_tahunan: true };
    KunjunganPosyandu.findByPk = async () => kunjungan;
    Pemeriksaan.findOrCreate = async () => [pemeriksaan, false];
    // Simulasi DB: satu-satunya record "tahunan" tahun ini adalah pemeriksaan itu sendiri.
    // Jika query tidak mengecualikan id-nya sendiri, ini akan salah terbaca sebagai duplikat.
    Pemeriksaan.findOne = async (options) => {
      const idFilter = options.where.id;
      if (idFilter) {
        const excludedId = idFilter[Object.getOwnPropertySymbols(idFilter)[0]];
        if (excludedId === pemeriksaan.id) return null;
      }
      return { id: pemeriksaan.id };
    };

    const saved = await invoke(controller.saveStep4, request({ kunjungan_id: 10, is_skrining_tahunan: true, detail_skrining: { tbc: { has_batuk_lebih_2_minggu: false } } }));
    assert.strictEqual(saved.statusCode, 200);
    assert.strictEqual(pemeriksaan.detail_skrining.is_skrining_tahunan, true);
  } finally {
    KunjunganPosyandu.findByPk = originalKunjunganFindByPk;
    Pemeriksaan.findOrCreate = originalFindOrCreate;
    Pemeriksaan.findOne = originalFindOne;
  }
});

test("partial detail_skrining saves deep-merge with existing data instead of resetting siblings to schema defaults", async () => {
  const originalFindByPk = KunjunganPosyandu.findByPk;
  const originalFindOrCreate = Pemeriksaan.findOrCreate;
  try {
    const kunjungan = makeKunjungan("langkah_2");
    const pemeriksaan = makePemeriksaan(kunjungan);
    KunjunganPosyandu.findByPk = async () => kunjungan;
    Pemeriksaan.findOrCreate = async () => [pemeriksaan, false];

    const first = await invoke(controller.saveStep4, request({ kunjungan_id: 10, detail_skrining: { tbc: { has_batuk_lebih_2_minggu: true } } }));
    assert.strictEqual(first.statusCode, 200);
    assert.strictEqual(pemeriksaan.detail_skrining.tbc.has_batuk_lebih_2_minggu, true);

    const second = await invoke(
      controller.saveStep4,
      request({ kunjungan_id: 10, detail_skrining: { skrining_kesehatan_jiwa: { jawaban_skor: { kurang_bersemangat: 1, murung_tertekan_putus_asa: 0, gugup_cemas_gelisah: 0, sulit_kendalikan_khawatir: 0 } } } }),
    );
    assert.strictEqual(second.statusCode, 200);
    // Data TBC dari save pertama harus tetap ada, tidak tertimpa schema default oleh save kedua yang partial.
    assert.strictEqual(pemeriksaan.detail_skrining.tbc.has_batuk_lebih_2_minggu, true);
    assert.strictEqual(pemeriksaan.detail_skrining.skrining_kesehatan_jiwa.jawaban_skor.kurang_bersemangat, 1);
  } finally {
    KunjunganPosyandu.findByPk = originalFindByPk;
    Pemeriksaan.findOrCreate = originalFindOrCreate;
  }
});
