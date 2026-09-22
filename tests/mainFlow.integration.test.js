"use strict";

const assert = require("assert");
const test = require("node:test");
const { Warga, Posyandu, SesiPosyandu, KunjunganPosyandu, Pemeriksaan, Rujukan, AuditLog } = require("../models");
const wargaController = require("../controllers/wargaController");
const sesiController = require("../controllers/sesiPosyanduController");
const kunjunganController = require("../controllers/kunjunganController");
const pemeriksaanController = require("../controllers/pemeriksaanController");

const sa = { id: 1, role: "sa" };
const kader = { id: 2, role: "kader", posyandu_id: 7 };
const posyandu = { id: 7, puskesmas_id: 3, nama_posyandu: "Posyandu Melati" };

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

const invoke = async (handler, req) => {
  const res = response();
  let nextError = null;
  await handler(req, res, (error) => {
    nextError = error;
  });
  if (nextError) throw nextError;
  return res;
};

const request = (body, user = sa, id = 1) => ({ body, user, params: { id: String(id) }, query: {} });

const dateAtAge = (years) => {
  const date = new Date("2026-09-14T00:00:00Z");
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return date.toISOString().slice(0, 10);
};

test("main flow connects warga, sesi, kunjungan, multi-step pemeriksaan, screening, and finalization", async () => {
  const originals = {
    posyanduFindByPk: Posyandu.findByPk,
    wargaFindOne: Warga.findOne,
    wargaFindByPk: Warga.findByPk,
    wargaCreate: Warga.create,
    sesiFindOne: SesiPosyandu.findOne,
    sesiFindByPk: SesiPosyandu.findByPk,
    sesiCreate: SesiPosyandu.create,
    kunjunganFindByPk: KunjunganPosyandu.findByPk,
    kunjunganFindOne: KunjunganPosyandu.findOne,
    kunjunganFindAll: KunjunganPosyandu.findAll,
    kunjunganCount: KunjunganPosyandu.count,
    kunjunganCreate: KunjunganPosyandu.create,
    pemeriksaanFindOrCreate: Pemeriksaan.findOrCreate,
    pemeriksaanTransaction: Pemeriksaan.sequelize.transaction,
    rujukanFindOne: Rujukan.findOne,
    rujukanCreate: Rujukan.create,
    auditCreate: AuditLog.create,
  };

  const state = { warga: null, sesi: null, kunjungan: null, pemeriksaan: null, rujukan: null, audits: [] };
  try {
    Posyandu.findByPk = async () => posyandu;
    Warga.findOne = async ({ where }) => (state.warga && state.warga.nik === where.nik ? state.warga : null);
    Warga.findByPk = async () => state.warga;
    Warga.create = async (values) => {
      state.warga = {
        id: 11,
        ...values,
        posyandu,
        toJSON() {
          return { ...this };
        },
      };
      return state.warga;
    };

    SesiPosyandu.findOne = async () => null;
    SesiPosyandu.findByPk = async () => state.sesi;
    SesiPosyandu.create = async (values) => {
      state.sesi = { id: 21, ...values, posyandu };
      return state.sesi;
    };

    KunjunganPosyandu.findByPk = async () => state.kunjungan;
    KunjunganPosyandu.findOne = async ({ where }) => (state.kunjungan && state.kunjungan.warga_id === where.warga_id && state.kunjungan.sesi_posyandu_id === where.sesi_posyandu_id ? state.kunjungan : null);
    KunjunganPosyandu.findAll = async () => (state.kunjungan ? [state.kunjungan] : []);
    KunjunganPosyandu.count = async () => (state.kunjungan ? 1 : 0);
    KunjunganPosyandu.create = async (values) => {
      state.kunjungan = {
        id: 31,
        ...values,
        sesiPosyandu: state.sesi,
        warga: state.warga,
        async update(next) {
          Object.assign(this, next);
        },
        toJSON() {
          return { ...this };
        },
      };
      return state.kunjungan;
    };

    Pemeriksaan.findOrCreate = async ({ defaults }) => {
      if (!state.pemeriksaan) {
        state.pemeriksaan = {
          id: 41,
          ...defaults,
          detail_skrining: {},
          is_perlu_rujukan: false,
          async update(next) {
            Object.assign(this, next);
          },
          async destroy() {
            state.pemeriksaan = null;
          },
        };
        return [state.pemeriksaan, true];
      }
      return [state.pemeriksaan, false];
    };
    Pemeriksaan.sequelize.transaction = async () => ({ commit: async () => {}, rollback: async () => {} });
    Rujukan.findOne = async () => state.rujukan;
    Rujukan.create = async (values) => {
      state.rujukan = {
        id: 51,
        ...values,
        async update(next) {
          Object.assign(this, next);
        },
        async destroy() {
          state.rujukan = null;
        },
      };
      return state.rujukan;
    };
    AuditLog.create = async (payload) => {
      state.audits.push(payload);
      return payload;
    };

    const warga = await invoke(
      wargaController.createWarga,
      request(
        {
          nik: "3201010101010001",
          nama_lengkap: "Siti Aminah",
          jenis_kelamin: "P",
          tanggal_lahir: "1990-01-01",
          posyandu_id: 7,
        },
        kader,
      ),
    );
    assert.strictEqual(warga.statusCode, 201);
    assert.strictEqual(state.warga.posyandu_id, 7);

    const sesi = await invoke(
      sesiController.createSesiPosyandu,
      request(
        {
          posyandu_id: 7,
          tanggal_pelaksanaan: "2026-09-14",
          lokasi: "Balai RW 01",
          rw: "01",
          status: "open",
        },
        kader,
      ),
    );
    assert.strictEqual(sesi.statusCode, 201);

    const kunjungan = await invoke(kunjunganController.createKunjungan, request({ warga_id: 11, sesi_posyandu_id: 21 }, kader));
    assert.strictEqual(kunjungan.statusCode, 201);
    assert.strictEqual(kunjungan.body.data.nomor_antrean, "A-001");
    assert.strictEqual(state.kunjungan.status_langkah, "langkah_1");

    const step2 = await invoke(pemeriksaanController.saveStep2, request({ kunjungan_id: 31, bb_kg: 60, tb_cm: 165, td_sistole: 120 }, sa));
    assert.strictEqual(step2.statusCode, 200, JSON.stringify(step2.body));
    assert.strictEqual(state.pemeriksaan.bb_kg, 60);
    assert.strictEqual(state.kunjungan.status_langkah, "langkah_2");

    const step4 = await invoke(pemeriksaanController.saveStep4, request({ kunjungan_id: 31, detail_skrining: {} }, sa));
    assert.strictEqual(step4.statusCode, 200);
    assert.strictEqual(state.kunjungan.status_langkah, "langkah_4");

    const step5 = await invoke(pemeriksaanController.saveStep5, request({ kunjungan_id: 31, topik_penyuluhan: "Gizi", is_perlu_rujukan: true, alasan_rujukan: "Warga meminta konsultasi lanjutan." }, sa));
    assert.strictEqual(step5.statusCode, 200);
    assert.strictEqual(state.kunjungan.status_langkah, "langkah_5");
    assert.strictEqual(state.pemeriksaan.is_perlu_rujukan, true);
    assert.strictEqual(state.rujukan.puskesmas_id, 3);
    assert.strictEqual(state.rujukan.kader_id, 1);
    assert.ok(state.audits.some((audit) => audit.action === "WARGA_CREATE"));
    assert.ok(state.audits.some((audit) => audit.action === "SESI_CREATE"));
    assert.ok(state.audits.some((audit) => audit.action === "KUNJUNGAN_CREATE"));
  } finally {
    Posyandu.findByPk = originals.posyanduFindByPk;
    Warga.findOne = originals.wargaFindOne;
    Warga.findByPk = originals.wargaFindByPk;
    Warga.create = originals.wargaCreate;
    SesiPosyandu.findOne = originals.sesiFindOne;
    SesiPosyandu.findByPk = originals.sesiFindByPk;
    SesiPosyandu.create = originals.sesiCreate;
    KunjunganPosyandu.findByPk = originals.kunjunganFindByPk;
    KunjunganPosyandu.findOne = originals.kunjunganFindOne;
    KunjunganPosyandu.findAll = originals.kunjunganFindAll;
    KunjunganPosyandu.count = originals.kunjunganCount;
    KunjunganPosyandu.create = originals.kunjunganCreate;
    Pemeriksaan.findOrCreate = originals.pemeriksaanFindOrCreate;
    Pemeriksaan.sequelize.transaction = originals.pemeriksaanTransaction;
    Rujukan.findOne = originals.rujukanFindOne;
    Rujukan.create = originals.rujukanCreate;
    AuditLog.create = originals.auditCreate;
  }
});

test("main flow rejects duplicate registration, invalid measurements, invalid screening, and closed-session registration", async () => {
  const originals = {
    sessionFindByPk: SesiPosyandu.findByPk,
    wargaFindByPk: Warga.findByPk,
    visitFindOne: KunjunganPosyandu.findOne,
    visitCount: KunjunganPosyandu.count,
    visitCreate: KunjunganPosyandu.create,
    auditCreate: AuditLog.create,
  };
  const warga = { id: 11, nama_lengkap: "Siti Aminah", nik: "3201010101010001" };
  const visit = { id: 31, warga_id: 11, sesi_posyandu_id: 21, nomor_antrean: "A-001" };
  try {
    Warga.findByPk = async () => warga;
    SesiPosyandu.findByPk = async () => ({ id: 21, status: "closed", posyandu });
    const closed = await invoke(kunjunganController.createKunjungan, request({ warga_id: 11, sesi_posyandu_id: 21 }, kader));
    assert.strictEqual(closed.statusCode, 400);

    SesiPosyandu.findByPk = async () => ({ id: 21, status: "open", posyandu });
    KunjunganPosyandu.findOne = async () => visit;
    const duplicate = await invoke(kunjunganController.createKunjungan, request({ warga_id: 11, sesi_posyandu_id: 21 }, kader));
    assert.strictEqual(duplicate.statusCode, 400);

    const invalidMeasurement = await invoke(pemeriksaanController.saveStep2, request({ kunjungan_id: 31, bb_kg: 0 }, sa));
    assert.strictEqual(invalidMeasurement.statusCode, 400);
    assert.match(invalidMeasurement.body.message, /bb_kg/);
  } finally {
    SesiPosyandu.findByPk = originals.sessionFindByPk;
    Warga.findByPk = originals.wargaFindByPk;
    KunjunganPosyandu.findOne = originals.visitFindOne;
    KunjunganPosyandu.count = originals.visitCount;
    KunjunganPosyandu.create = originals.visitCreate;
    AuditLog.create = originals.auditCreate;
  }
});

test("screening step accepts every official category through the pemeriksaan controller", async () => {
  const originals = {
    visitFindByPk: KunjunganPosyandu.findByPk,
    examinationFindOrCreate: Pemeriksaan.findOrCreate,
    examinationFindOne: Pemeriksaan.findOne,
  };
  const cases = [
    ["bumil", dateAtAge(25), [{ id: 1, status_kehamilan: "hamil" }]],
    ["busui", dateAtAge(25), [{ id: 1, is_menyusui: true, tanggal_persalinan: "2026-09-01" }]],
    ["bayi", dateAtAge(0), []],
    ["balita", dateAtAge(2), []],
    ["apras", dateAtAge(5), []],
    ["uskrem_6_14", dateAtAge(10), []],
    ["uskrem_15_18", dateAtAge(16), []],
    ["dewasa", dateAtAge(30), []],
    ["lansia", dateAtAge(65), []],
  ];
  let current = null;
  try {
    KunjunganPosyandu.findByPk = async () => current;
    Pemeriksaan.findOne = async () => null;
    Pemeriksaan.findOrCreate = async ({ defaults }) => {
      const examination = {
        id: 41,
        ...defaults,
        detail_skrining: {},
        async update(next) {
          Object.assign(this, next);
        },
      };
      return [examination, true];
    };

    for (const [category, tanggal_lahir, profileKehamilan] of cases) {
      current = {
        id: 31,
        warga_id: 11,
        status_langkah: "langkah_1",
        sesiPosyandu: { id: 21, tanggal_pelaksanaan: "2026-09-14", status: "open", posyandu },
        warga: { id: 11, tanggal_lahir, jenis_kelamin: "P", profileKehamilan },
        async update(next) {
          Object.assign(this, next);
        },
      };
      const result = await invoke(pemeriksaanController.saveStep4, request({ kunjungan_id: 31, detail_skrining: {} }, sa));
      assert.strictEqual(result.statusCode, 200, `${category} screening should be accepted: ${JSON.stringify(result.body)}`);
      assert.strictEqual(current.status_langkah, "langkah_4");
    }
  } finally {
    KunjunganPosyandu.findByPk = originals.visitFindByPk;
    Pemeriksaan.findOrCreate = originals.examinationFindOrCreate;
    Pemeriksaan.findOne = originals.examinationFindOne;
  }
});
