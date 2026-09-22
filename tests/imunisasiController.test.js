"use strict";

const assert = require("assert");
const test = require("node:test");
const { validationResult } = require("express-validator");
const { Imunisasi, Warga } = require("../models");
const controller = require("../controllers/imunisasiController");
const validators = require("../middleware/validators/imunisasiValidators");

const user = { role: "kader", posyandu_id: 7 };
const warga = { id: 10, posyandu_id: 7 };

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

const request = (body = {}, id = 1, wargaId = 10) => ({ body, params: { id: String(id), warga_id: String(wargaId) }, user });

const invoke = async (handler, req) => {
  const res = response();
  let error = null;
  await handler(req, res, (nextError) => {
    error = nextError;
  });
  if (error) throw error;
  return res;
};

const validate = async (chain, req) => {
  for (const middleware of chain) await middleware.run(req);
  return validationResult(req);
};

test("model associations include Warga hasMany and Imunisasi belongsTo", () => {
  assert.strictEqual(Warga.associations.imunisasi.target, Imunisasi);
  assert.strictEqual(Imunisasi.associations.warga.target, Warga);
  assert.strictEqual(Imunisasi.rawAttributes.warga_id.allowNull, false);
  assert.strictEqual(Imunisasi.rawAttributes.jenis_imunisasi.allowNull, false);
  assert.strictEqual(Imunisasi.rawAttributes.tanggal_imunisasi.type.key, "DATEONLY");
  assert.strictEqual(Object.prototype.hasOwnProperty.call(Imunisasi.rawAttributes, "kunjungan_id"), false);
});

test("validators require valid warga, jenis, and date fields", async () => {
  const invalid = await validate(validators.create, request({ warga_id: 0, jenis_imunisasi: "", tanggal_imunisasi: "not-a-date" }));
  assert.strictEqual(invalid.isEmpty(), false);
  assert.ok(invalid.array().some((error) => error.path === "warga_id"));
  assert.ok(invalid.array().some((error) => error.path === "tanggal_imunisasi"));

  const valid = await validate(validators.create, request({ warga_id: 10, jenis_imunisasi: "Imunisasi umum", tanggal_imunisasi: "2026-09-16" }));
  assert.strictEqual(valid.isEmpty(), true);
});

test("create and list Imunisasi use scoped Warga", async () => {
  const originalFindOne = Warga.findOne;
  const originalCreate = Imunisasi.create;
  const originalFindAll = Imunisasi.findAll;
  try {
    Warga.findOne = async (options) => {
      assert.strictEqual(Number(options.where.id), 10);
      assert.strictEqual(options.include[0].required, true);
      return warga;
    };
    Imunisasi.create = async (values) => ({ id: 1, ...values });
    Imunisasi.findAll = async (options) => {
      assert.deepStrictEqual(options.where, { warga_id: 10 });
      return [{ id: 1, warga_id: 10, jenis_imunisasi: "Imunisasi umum", tanggal_imunisasi: "2026-09-16" }];
    };

    const created = await invoke(controller.createImunisasi, request({ warga_id: 10, jenis_imunisasi: "Imunisasi umum", tanggal_imunisasi: "2026-09-16" }));
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.body.data.warga_id, 10);

    const listed = await invoke(controller.getImunisasiByWarga, request({}, 1, 10));
    assert.strictEqual(listed.statusCode, 200);
    assert.strictEqual(listed.body.data.length, 1);
  } finally {
    Warga.findOne = originalFindOne;
    Imunisasi.create = originalCreate;
    Imunisasi.findAll = originalFindAll;
  }
});

test("nonexistent or cross-scope Warga is rejected", async () => {
  const originalFindOne = Warga.findOne;
  try {
    Warga.findOne = async () => null;
    const created = await invoke(controller.createImunisasi, request({ warga_id: 99, jenis_imunisasi: "Imunisasi umum", tanggal_imunisasi: "2026-09-16" }));
    assert.strictEqual(created.statusCode, 404);
    const listed = await invoke(controller.getImunisasiByWarga, request({}, 1, 99));
    assert.strictEqual(listed.statusCode, 404);
  } finally {
    Warga.findOne = originalFindOne;
  }
});

test("get and update Imunisasi remain scoped through Warga Posyandu", async () => {
  const originalFindByPk = Imunisasi.findByPk;
  try {
    const data = {
      id: 1,
      warga_id: 10,
      jenis_imunisasi: "Lama",
      tanggal_imunisasi: "2026-01-01",
      warga,
      async update(values) {
        Object.assign(this, values);
      },
    };
    Imunisasi.findByPk = async (id, options) => {
      assert.strictEqual(String(id), "1");
      assert.strictEqual(options.include[0].include[0].required, true);
      return data;
    };
    const detail = await invoke(controller.getImunisasiById, request({}, 1));
    assert.strictEqual(detail.statusCode, 200);
    const updated = await invoke(controller.updateImunisasi, request({ jenis_imunisasi: "Baru", tanggal_imunisasi: "2026-09-16" }, 1));
    assert.strictEqual(updated.statusCode, 200);
    assert.strictEqual(data.jenis_imunisasi, "Baru");
    assert.strictEqual(data.tanggal_imunisasi, "2026-09-16");
  } finally {
    Imunisasi.findByPk = originalFindByPk;
  }
});
