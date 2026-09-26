"use strict";

const assert = require("assert");
const test = require("node:test");
const { Rujukan } = require("../models");
const controller = require("../controllers/rujukanController");

const user = { id: 77, role: "kader", posyandu_id: 7 };
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

test("list rujukan applies filters, warga search, and role Posyandu scope", async () => {
  const originalFindAndCountAll = Rujukan.findAndCountAll;
  try {
    let options;
    Rujukan.findAndCountAll = async (receivedOptions) => {
      options = receivedOptions;
      return { count: 1, rows: [{ id: 51 }] };
    };
    const result = await invoke(controller.getAllRujukan, {
      user,
      query: { page: "2", limit: "5", search: "Siti", puskesmas_id: "3", kader_id: "77", start_date: "2026-01-01", end_date: "2026-09-30" },
    });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.body.pagination.current_page, 2);
    assert.strictEqual(options.where.puskesmas_id, "3");
    assert.strictEqual(options.where.kader_id, "77");
    assert.ok(options.where.tanggal_rujukan);
    assert.strictEqual(options.include[0].where[require("sequelize").Op.or][0].nama_lengkap[require("sequelize").Op.iLike], "%Siti%");
    assert.deepStrictEqual(options.include[0].include[0].where, { id: 7 });
  } finally {
    Rujukan.findAndCountAll = originalFindAndCountAll;
  }
});

test("detail rujukan returns not-found for records outside scoped relation", async () => {
  const originalFindByPk = Rujukan.findByPk;
  try {
    let options;
    Rujukan.findByPk = async (_id, receivedOptions) => {
      options = receivedOptions;
      return null;
    };
    const result = await invoke(controller.getRujukanById, { user, params: { id: "999" } });
    assert.strictEqual(result.statusCode, 404);
    assert.deepStrictEqual(options.include[0].include[0].where, { id: 7 });
  } finally {
    Rujukan.findByPk = originalFindByPk;
  }
});
