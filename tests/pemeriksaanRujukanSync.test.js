const assert = require("assert");
const test = require("node:test");
const pemeriksaanController = require("../controllers/pemeriksaanController");
const { Pemeriksaan, Rujukan, AuditLog } = require("../models");

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

const invoke = async (req) => {
  const res = response();
  let nextError = null;
  await pemeriksaanController.updatePemeriksaan(req, res, (error) => {
    nextError = error;
  });
  if (nextError) throw nextError;
  return res;
};

test("update pemeriksaan synchronizes Rujukan and records its lifecycle", async () => {
  const original = {
    transaction: Pemeriksaan.sequelize.transaction,
    findByPk: Pemeriksaan.findByPk,
    findOne: Rujukan.findOne,
    create: Rujukan.create,
    auditCreate: AuditLog.create,
  };
  const auditActions = [];
  let referral = null;
  const transaction = {
    async commit() {},
    async rollback() {},
  };
  const pemeriksaan = {
    id: 41,
    tanggal: new Date("2026-09-16"),
    usia_bulan: 480,
    kategori_sasaran: "dewasa",
    profile_kehamilan_id: null,
    detail_skrining: {},
    is_perlu_rujukan: false,
    kunjungan_id: 51,
    bb_kg: 60,
    tb_cm: 165,
    kunjungan: {
      warga_id: 7,
      warga: {
        tanggal_lahir: new Date("1986-01-01"),
        profileKehamilan: null,
        posyandu: { id: 3, puskesmas_id: 9 },
      },
      sesiPosyandu: { status: "open", tanggal_pelaksanaan: new Date("2026-09-16") },
    },
    async update(values) {
      Object.assign(this, values);
    },
  };

  try {
    Pemeriksaan.sequelize.transaction = async () => transaction;
    Pemeriksaan.findByPk = async () => pemeriksaan;
    Rujukan.findOne = async () => referral;
    Rujukan.create = async (values) => {
      referral = {
        id: 81,
        ...values,
        async update(nextValues) {
          Object.assign(this, nextValues);
        },
        async destroy() {
          referral = null;
        },
      };
      return referral;
    };
    AuditLog.create = async ({ action }) => {
      auditActions.push(action);
    };

    const first = await invoke({
      user: { id: 12, role: "kader" },
      params: { id: "41" },
      body: { is_perlu_rujukan: true, alasan_rujukan: "Konsultasi lanjutan" },
    });
    assert.strictEqual(first.statusCode, 200);
    assert.ok(referral);
    assert.strictEqual(referral.puskesmas_id, 9);
    assert.deepStrictEqual(auditActions, ["PEMERIKSAAN_UPDATE", "RUJUKAN_CREATE"]);

    auditActions.length = 0;
    const update = await invoke({
      user: { id: 12, role: "kader" },
      params: { id: "41" },
      body: { is_perlu_rujukan: true, alasan_rujukan: "Alasan diperbarui" },
    });
    assert.strictEqual(update.statusCode, 200);
    assert.strictEqual(referral.alasan_rujukan, "Alasan diperbarui");
    assert.deepStrictEqual(auditActions, ["PEMERIKSAAN_UPDATE", "RUJUKAN_UPDATE"]);

    auditActions.length = 0;
    const second = await invoke({
      user: { id: 12, role: "kader" },
      params: { id: "41" },
      body: { is_perlu_rujukan: false },
    });
    assert.strictEqual(second.statusCode, 200);
    assert.strictEqual(referral, null);
    assert.deepStrictEqual(auditActions, ["PEMERIKSAAN_UPDATE", "RUJUKAN_DELETE"]);
  } finally {
    Pemeriksaan.sequelize.transaction = original.transaction;
    Pemeriksaan.findByPk = original.findByPk;
    Rujukan.findOne = original.findOne;
    Rujukan.create = original.create;
    AuditLog.create = original.auditCreate;
  }
});
