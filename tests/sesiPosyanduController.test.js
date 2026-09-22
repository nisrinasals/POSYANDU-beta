"use strict";

const assert = require("assert");
const test = require("node:test");
const { Posyandu, SesiPosyandu, AuditLog } = require("../models");
const controller = require("../controllers/sesiPosyanduController");

const kader = { role: "kader", posyandu_id: 10 };
const posyandu = { id: 10, puskesmas_id: 1 };
const outsidePosyandu = { id: 20, puskesmas_id: 2 };

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

const request = (body = {}, user = kader, id = 1) => ({ body, user, params: { id: String(id) } });

const invoke = async (handler, req) => {
  const res = response();
  let error = null;
  await handler(req, res, (nextError) => {
    error = nextError;
  });
  if (error) throw error;
  return res;
};

test("create sesi, duplicate, and posyandu scope", async () => {
  const originalFindPosyandu = Posyandu.findByPk;
  const originalFindSession = SesiPosyandu.findOne;
  const originalCreate = SesiPosyandu.create;
  try {
    Posyandu.findByPk = async () => posyandu;
    SesiPosyandu.findOne = async () => null;
    SesiPosyandu.create = async (values) => ({ id: 1, ...values });

    const created = await invoke(controller.createSesiPosyandu, request({ posyandu_id: 10, tanggal_pelaksanaan: "2026-09-20", lokasi: "Balai RW 01", rw: "01", status: "open" }));
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.body.data.lokasi, "Balai RW 01");
    assert.strictEqual(created.body.data.rw, "01");

    SesiPosyandu.findOne = async () => ({ id: 2 });
    const duplicate = await invoke(controller.createSesiPosyandu, request({ posyandu_id: 10, tanggal_pelaksanaan: "2026-09-20", lokasi: "Balai RW 01", rw: "01", status: "closed" }));
    assert.strictEqual(duplicate.statusCode, 409);

    Posyandu.findByPk = async () => outsidePosyandu;
    const forbidden = await invoke(controller.createSesiPosyandu, request({ posyandu_id: 20, tanggal_pelaksanaan: "2026-09-21", lokasi: "Balai RW 02", rw: "02", status: "open" }));
    assert.strictEqual(forbidden.statusCode, 403);
  } finally {
    Posyandu.findByPk = originalFindPosyandu;
    SesiPosyandu.findOne = originalFindSession;
    SesiPosyandu.create = originalCreate;
  }
});

test("update open session and status open to closed", async () => {
  const originalFindByPk = SesiPosyandu.findByPk;
  const originalFindOne = SesiPosyandu.findOne;
  try {
    const session = {
      id: 1,
      posyandu_id: 10,
      tanggal_pelaksanaan: "2026-09-20",
      lokasi: "Lama",
      rw: "01",
      status: "open",
      posyandu,
      async update(values) {
        Object.assign(this, values);
        return this;
      },
    };
    SesiPosyandu.findByPk = async () => session;
    SesiPosyandu.findOne = async () => null;

    const updated = await invoke(controller.updateSesiPosyandu, request({ lokasi: "Baru", rw: "02", status: "open" }));
    assert.strictEqual(updated.statusCode, 200);
    assert.strictEqual(updated.body.data.lokasi, "Baru");
    assert.strictEqual(updated.body.data.rw, "02");

    const closed = await invoke(controller.updateSesiPosyanduStatus, request({ status: "closed" }));
    assert.strictEqual(closed.statusCode, 200);
    assert.strictEqual(closed.body.data.status, "closed");
  } finally {
    SesiPosyandu.findByPk = originalFindByPk;
    SesiPosyandu.findOne = originalFindOne;
  }
});

test("closed session cannot be edited or reopened, and invalid status is rejected", async () => {
  const originalFindByPk = SesiPosyandu.findByPk;
  try {
    const session = {
      id: 1,
      posyandu_id: 10,
      tanggal_pelaksanaan: "2026-09-20",
      lokasi: "Balai RW 01",
      rw: "01",
      status: "closed",
      posyandu,
      update: async () => {
        throw new Error("closed session was updated");
      },
    };
    SesiPosyandu.findByPk = async () => session;

    const edited = await invoke(controller.updateSesiPosyandu, request({ lokasi: "Baru" }));
    assert.strictEqual(edited.statusCode, 400);

    const reopened = await invoke(controller.updateSesiPosyanduStatus, request({ status: "open" }));
    assert.strictEqual(reopened.statusCode, 400);

    session.status = "open";
    const invalid = await invoke(controller.updateSesiPosyanduStatus, request({ status: "invalid" }));
    assert.strictEqual(invalid.statusCode, 400);
  } finally {
    SesiPosyandu.findByPk = originalFindByPk;
  }
});

test("perubahan status sesi menghasilkan satu audit log SESI_STATUS_UPDATE", async () => {
  const originalFindByPk = SesiPosyandu.findByPk;
  const originalAuditCreate = AuditLog.create;
  try {
    const session = {
      id: 1,
      posyandu_id: 10,
      tanggal_pelaksanaan: "2026-09-20",
      lokasi: "Balai RW 01",
      rw: "01",
      status: "open",
      posyandu,
      async update(values) {
        Object.assign(this, values);
      },
    };
    SesiPosyandu.findByPk = async () => session;

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const closed = await invoke(controller.updateSesiPosyanduStatus, request({ status: "closed" }));
    assert.strictEqual(closed.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "SESI_STATUS_UPDATE");
    assert.strictEqual(auditCalls[0].old_value.status, "open");
    assert.strictEqual(auditCalls[0].new_value.status, "closed");
  } finally {
    SesiPosyandu.findByPk = originalFindByPk;
    AuditLog.create = originalAuditCreate;
  }
});

console.log("sesi Posyandu controller tests loaded");
