"use strict";

const assert = require("assert");
const { PassThrough } = require("stream");
const test = require("node:test");
const { Warga, Posyandu, AuditLog } = require("../models");
const controller = require("../controllers/wargaController");

const kader = { role: "kader", posyandu_id: 7 };
const destination = { id: 7, puskesmas_id: 3, nama_posyandu: "Posyandu Tujuan" };

const response = () => ({
  statusCode: 200,
  body: null,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  setHeader(name, value) {
    this.headers[name] = value;
  },
  end() {
    this.ended = true;
  },
});

const request = (body = {}, user = kader, id = 1, query = {}) => ({ body, user, params: { id: String(id) }, query });

const invoke = async (handler, req, res = response()) => {
  let error = null;
  await handler(req, res, (nextError) => {
    error = nextError;
  });
  if (error) throw error;
  return res;
};

const wargaBody = {
  nik: "3201010101010001",
  nama_lengkap: "Siti Aminah",
  jenis_kelamin: "P",
  tanggal_lahir: "1990-01-01",
  posyandu_id: 7,
};

test("create warga valid, invalid NIK, and duplicate NIK", async () => {
  const originalFindPosyandu = Posyandu.findByPk;
  const originalFindWarga = Warga.findOne;
  const originalCreate = Warga.create;
  try {
    Posyandu.findByPk = async () => destination;
    Warga.findOne = async () => null;
    Warga.create = async (values) => ({ toJSON: () => ({ id: 1, ...values }) });

    const created = await invoke(controller.createWarga, request(wargaBody));
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.body.data.nik, wargaBody.nik);

    const invalid = await invoke(controller.createWarga, request({ ...wargaBody, nik: "123" }));
    assert.strictEqual(invalid.statusCode, 400);

    Warga.findOne = async () => ({ nama_lengkap: "Warga Lama" });
    const duplicate = await invoke(controller.createWarga, request(wargaBody));
    assert.strictEqual(duplicate.statusCode, 409);
    assert.match(duplicate.body.message, /sudah terdaftar/i);
  } finally {
    Posyandu.findByPk = originalFindPosyandu;
    Warga.findOne = originalFindWarga;
    Warga.create = originalCreate;
  }
});

test("update warga keeps Posyandu immutable and rejects cross-Posyandu access", async () => {
  const originalFindWarga = Warga.findOne;
  try {
    Warga.findOne = async () => null;
    const forbidden = await invoke(controller.updateWarga, request({ nama_lengkap: "Nama Baru" }, kader, 99));
    assert.strictEqual(forbidden.statusCode, 404);

    const warga = {
      id: 1,
      nik: wargaBody.nik,
      posyandu_id: 7,
      nama_lengkap: wargaBody.nama_lengkap,
      jenis_kelamin: "P",
      tanggal_lahir: wargaBody.tanggal_lahir,
      status_perkawinan: "tidak_menikah",
      status_domisili: "aktif",
      update: async (values) => Object.assign(warga, values),
      posyandu: destination,
    };
    Warga.findOne = async () => warga;
    const updated = await invoke(controller.updateWarga, request({ nama_lengkap: "Siti Baru", posyandu_id: 99 }, kader));
    assert.strictEqual(updated.statusCode, 200);
    assert.strictEqual(warga.nama_lengkap, "Siti Baru");
    assert.strictEqual(warga.posyandu_id, 7);
  } finally {
    Warga.findOne = originalFindWarga;
  }
});

test("verify migration requires matching NIK, full name, and mother name", async () => {
  const originalFindPosyandu = Posyandu.findByPk;
  const originalFindWarga = Warga.findOne;
  try {
    Posyandu.findByPk = async () => destination;
    const body = { nik: wargaBody.nik, nama_lengkap: "Siti Aminah", nama_ibu: "Ibu Aminah" };
    Warga.findOne = async ({ where }) => {
      assert.strictEqual(where.nik, body.nik);
      assert.deepStrictEqual(where.nama_lengkap, { [require("sequelize").Op.iLike]: body.nama_lengkap });
      return { id: 1, ...body, posyandu: { id: 3, nama_posyandu: "Posyandu Asal" } };
    };
    const verified = await invoke(controller.verifyMutasiWarga, request(body));
    assert.strictEqual(verified.statusCode, 200);
    assert.strictEqual(verified.body.data.posyandu_tujuan.id, 7);

    Warga.findOne = async () => null;
    for (const identity of ["NIK-SALAH", "Nama Salah", "Ibu Salah"]) {
      const wrongBody = { ...body, ...(identity === "NIK-SALAH" ? { nik: "3201010101010002" } : {}), ...(identity === "Nama Salah" ? { nama_lengkap: identity } : {}), ...(identity === "Ibu Salah" ? { nama_ibu: identity } : {}) };
      const notFound = await invoke(controller.verifyMutasiWarga, request(wrongBody));
      assert.strictEqual(notFound.statusCode, 404);
    }
  } finally {
    Posyandu.findByPk = originalFindPosyandu;
    Warga.findOne = originalFindWarga;
  }
});

test("migration rejects invalid destination and confirms verified identity", async () => {
  const originalFindPosyandu = Posyandu.findByPk;
  const originalFindWarga = Warga.findOne;
  const originalTransaction = Warga.sequelize.transaction;
  try {
    Posyandu.findByPk = async () => null;
    const invalidTarget = await invoke(controller.verifyMutasiWarga, request({ nik: wargaBody.nik, nama_lengkap: "Siti Aminah", nama_ibu: "Ibu Aminah" }));
    assert.strictEqual(invalidTarget.statusCode, 403);

    Posyandu.findByPk = async () => destination;
    const warga = { id: 1, nik: wargaBody.nik, nama_lengkap: "Siti Aminah", posyandu_id: 3, update: async (values) => Object.assign(warga, values) };
    Warga.findOne = async () => warga;
    const transaction = { LOCK: { UPDATE: "UPDATE" }, commit: async () => {}, rollback: async () => {} };
    Warga.sequelize.transaction = async () => transaction;
    const confirmed = await invoke(controller.confirmMutasiWarga, request({ warga_id: 1, nik: wargaBody.nik, nama_lengkap: "Siti Aminah", nama_ibu: "Ibu Aminah" }));
    assert.strictEqual(confirmed.statusCode, 200);
    assert.strictEqual(warga.posyandu_id, 7);
  } finally {
    Posyandu.findByPk = originalFindPosyandu;
    Warga.findOne = originalFindWarga;
    Warga.sequelize.transaction = originalTransaction;
  }
});

test("statistics and export warga remain available", async () => {
  const originalFindAll = Warga.findAll;
  try {
    const row = {
      get: () => ({ id: 1, tanggal_lahir: "2020-01-01", profileKehamilan: [], posyandu: { nama_posyandu: "Posyandu Tujuan" }, nik: wargaBody.nik, nama_lengkap: "Siti Aminah", jenis_kelamin: "P", status_domisili: "aktif" }),
    };
    Warga.findAll = async () => [row];
    const stats = await invoke(controller.getStatistikSasaran, request());
    assert.strictEqual(stats.statusCode, 200);
    assert.ok(stats.body.data);

    const exportResponse = new PassThrough();
    const headers = {};
    exportResponse.setHeader = (name, value) => {
      headers[name] = value;
    };
    const chunks = [];
    exportResponse.on("data", (chunk) => chunks.push(chunk));
    await invoke(controller.exportWargaExcel, request(), exportResponse);
    assert.match(headers["Content-Type"], /spreadsheetml/);
    assert.ok(Buffer.concat(chunks).length > 0);
  } finally {
    Warga.findAll = originalFindAll;
  }
});

test("create warga menghasilkan satu audit log WARGA_CREATE", async () => {
  const originalFindPosyandu = Posyandu.findByPk;
  const originalFindWarga = Warga.findOne;
  const originalCreate = Warga.create;
  const originalAuditCreate = AuditLog.create;
  try {
    Posyandu.findByPk = async () => destination;
    Warga.findOne = async () => null;
    Warga.create = async (values) => ({ toJSON: () => ({ id: 1, ...values }) });

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const created = await invoke(controller.createWarga, request(wargaBody));
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "WARGA_CREATE");
    assert.strictEqual(auditCalls[0].old_value, null);
    assert.strictEqual(auditCalls[0].new_value.nik, wargaBody.nik);
  } finally {
    Posyandu.findByPk = originalFindPosyandu;
    Warga.findOne = originalFindWarga;
    Warga.create = originalCreate;
    AuditLog.create = originalAuditCreate;
  }
});

test("update warga menghasilkan satu audit log WARGA_UPDATE dengan old/new value", async () => {
  const originalFindWarga = Warga.findOne;
  const originalAuditCreate = AuditLog.create;
  try {
    const warga = {
      id: 1,
      nik: wargaBody.nik,
      posyandu_id: 7,
      nama_lengkap: wargaBody.nama_lengkap,
      jenis_kelamin: "P",
      tanggal_lahir: wargaBody.tanggal_lahir,
      status_perkawinan: "tidak_menikah",
      status_domisili: "aktif",
      update: async (values) => Object.assign(warga, values),
      posyandu: destination,
    };
    Warga.findOne = async () => warga;

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const updated = await invoke(controller.updateWarga, request({ nama_lengkap: "Siti Baru" }, kader));
    assert.strictEqual(updated.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "WARGA_UPDATE");
    assert.strictEqual(auditCalls[0].old_value.nama_lengkap, wargaBody.nama_lengkap);
    assert.strictEqual(auditCalls[0].new_value.nama_lengkap, "Siti Baru");
  } finally {
    Warga.findOne = originalFindWarga;
    AuditLog.create = originalAuditCreate;
  }
});

test("mutasi warga menghasilkan satu audit log WARGA_MUTATION dengan posyandu lama & baru", async () => {
  const originalFindPosyandu = Posyandu.findByPk;
  const originalFindWarga = Warga.findOne;
  const originalTransaction = Warga.sequelize.transaction;
  const originalAuditCreate = AuditLog.create;
  try {
    Posyandu.findByPk = async () => destination;
    const warga = { id: 1, nik: wargaBody.nik, nama_lengkap: "Siti Aminah", posyandu_id: 3, update: async (values) => Object.assign(warga, values) };
    Warga.findOne = async () => warga;
    const transaction = { LOCK: { UPDATE: "UPDATE" }, commit: async () => {}, rollback: async () => {} };
    Warga.sequelize.transaction = async () => transaction;

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const confirmed = await invoke(controller.confirmMutasiWarga, request({ warga_id: 1, nik: wargaBody.nik, nama_lengkap: "Siti Aminah", nama_ibu: "Ibu Aminah" }));
    assert.strictEqual(confirmed.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "WARGA_MUTATION");
    assert.strictEqual(auditCalls[0].old_value.posyandu_id, 3);
    assert.strictEqual(auditCalls[0].new_value.posyandu_id, 7);
  } finally {
    Posyandu.findByPk = originalFindPosyandu;
    Warga.findOne = originalFindWarga;
    Warga.sequelize.transaction = originalTransaction;
    AuditLog.create = originalAuditCreate;
  }
});

test("puskesmasAdmin dan dinkesAdmin ditolak (403) saat mencoba mutasi data Warga (Read-Only)", async () => {
  const puskesmasAdmin = { role: "puskesmasAdmin", puskesmas_id: 3 };
  const dinkesAdmin = { role: "dinkesAdmin" };

  const createdByPuskesmasAdmin = await invoke(controller.createWarga, request(wargaBody, puskesmasAdmin));
  assert.strictEqual(createdByPuskesmasAdmin.statusCode, 403);

  const createdByDinkesAdmin = await invoke(controller.createWarga, request(wargaBody, dinkesAdmin));
  assert.strictEqual(createdByDinkesAdmin.statusCode, 403);

  const updatedByPuskesmasAdmin = await invoke(controller.updateWarga, request({ nama_lengkap: "Siti Baru" }, puskesmasAdmin));
  assert.strictEqual(updatedByPuskesmasAdmin.statusCode, 403);

  const updatedByDinkesAdmin = await invoke(controller.updateWarga, request({ nama_lengkap: "Siti Baru" }, dinkesAdmin));
  assert.strictEqual(updatedByDinkesAdmin.statusCode, 403);

  const statusByPuskesmasAdmin = await invoke(controller.updateStatusDomisili, request({ status_domisili: "pindah" }, puskesmasAdmin));
  assert.strictEqual(statusByPuskesmasAdmin.statusCode, 403);

  const statusByDinkesAdmin = await invoke(controller.updateStatusDomisili, request({ status_domisili: "pindah" }, dinkesAdmin));
  assert.strictEqual(statusByDinkesAdmin.statusCode, 403);
});
