"use strict";

const assert = require("assert");
const test = require("node:test");
const { Pemeriksaan, KunjunganPosyandu, Rujukan } = require("../models");
const pemeriksaanController = require("../controllers/pemeriksaanController");

const kader = { id: 77, role: "kader", posyandu_id: 7 };
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
const invoke = async (body) => {
  const res = response();
  let nextError = null;
  await pemeriksaanController.saveStep5({ body, user: kader }, res, (error) => {
    nextError = error;
  });
  if (nextError) throw nextError;
  return res;
};

const makeFixture = (detail = {}) => {
  const kunjungan = {
    id: 31,
    warga_id: 11,
    status_langkah: "langkah_4",
    sesiPosyandu: { id: 21, tanggal_pelaksanaan: recentSessionDate, status: "open", posyandu: { id: 7, puskesmas_id: 3 } },
    warga: {
      id: 11,
      tanggal_lahir: "1990-01-01",
      jenis_kelamin: "P",
      profileKehamilan: [],
      posyandu: { id: 7, puskesmas_id: 3 },
    },
    async update(values) {
      Object.assign(this, values);
    },
  };
  const pemeriksaan = {
    id: 41,
    kunjungan_id: 31,
    tanggal: "2026-09-14",
    kategori_sasaran: "dewasa",
    detail_skrining: detail,
    is_perlu_rujukan: false,
    async update(values) {
      Object.assign(this, values);
    },
  };
  return { kunjungan, pemeriksaan };
};

const withReferralMocks = async (fixture, callback) => {
  const originals = {
    transaction: Pemeriksaan.sequelize.transaction,
    examinationFindOrCreate: Pemeriksaan.findOrCreate,
    visitFindByPk: KunjunganPosyandu.findByPk,
    referralFindOne: Rujukan.findOne,
    referralCreate: Rujukan.create,
  };
  const state = { referral: null, creates: 0 };
  try {
    Pemeriksaan.sequelize.transaction = async () => ({ commit: async () => {}, rollback: async () => {} });
    Pemeriksaan.findOrCreate = async () => [fixture.pemeriksaan, false];
    KunjunganPosyandu.findByPk = async () => fixture.kunjungan;
    Rujukan.findOne = async () => state.referral;
    Rujukan.create = async (values) => {
      state.creates += 1;
      state.referral = {
        id: 51,
        ...values,
        async update(next) {
          Object.assign(this, next);
        },
        async destroy() {
          state.referral = null;
        },
      };
      return state.referral;
    };
    await callback(state);
  } finally {
    Pemeriksaan.sequelize.transaction = originals.transaction;
    Pemeriksaan.findOrCreate = originals.examinationFindOrCreate;
    KunjunganPosyandu.findByPk = originals.visitFindByPk;
    Rujukan.findOne = originals.referralFindOne;
    Rujukan.create = originals.referralCreate;
  }
};

test("screening trigger defaults final decision to true and derives a non-diagnostic reason", async () => {
  await withReferralMocks(makeFixture({ tbc: { is_tbc_terindikasi: true } }), async (state) => {
    const result = await invoke({ kunjungan_id: 31 });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.body.data.is_perlu_rujukan, true);
    assert.strictEqual(state.referral.puskesmas_id, 3);
    assert.strictEqual(state.referral.kader_id, 77);
    assert.strictEqual(state.referral.alasan_rujukan, "Indikasi dari skrining TBC");
    assert.doesNotMatch(state.referral.alasan_rujukan, /TBC aktif|diagnosis/i);
  });
});

test("manual referral requires a reason when no screening trigger exists", async () => {
  await withReferralMocks(makeFixture({}), async (state) => {
    const missingReason = await invoke({ kunjungan_id: 31, is_perlu_rujukan: true });
    assert.strictEqual(missingReason.statusCode, 400);
    assert.strictEqual(state.creates, 0);

    const manual = await invoke({ kunjungan_id: 31, is_perlu_rujukan: true, alasan_rujukan: "Perlu konsultasi lanjutan." });
    assert.strictEqual(manual.statusCode, 200);
    assert.strictEqual(state.referral.alasan_rujukan, "Perlu konsultasi lanjutan.");
  });
});

test("false final decision removes an existing referral and repeated true decisions do not duplicate it", async () => {
  await withReferralMocks(makeFixture({ tbc: { is_tbc_terindikasi: true } }), async (state) => {
    const first = await invoke({ kunjungan_id: 31 });
    assert.strictEqual(first.statusCode, 200);
    assert.strictEqual(state.creates, 1);

    const second = await invoke({ kunjungan_id: 31, is_perlu_rujukan: true });
    assert.strictEqual(second.statusCode, 200);
    assert.strictEqual(state.creates, 1);
    assert.strictEqual(state.referral.id, 51);

    const falseDecision = await invoke({ kunjungan_id: 31, is_perlu_rujukan: false });
    assert.strictEqual(falseDecision.statusCode, 200);
    assert.strictEqual(falseDecision.body.data.is_perlu_rujukan, false);
    assert.strictEqual(state.referral, null);
  });
});
