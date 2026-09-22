"use strict";

const assert = require("assert");
const test = require("node:test");
const { ProfileKehamilan, Warga, AuditLog } = require("../models");
const controller = require("../controllers/kehamilanController");
const { tentukanKategoriAktif } = require("../utils/kategoriHelper");

const user = { role: "kader", posyandu_id: 7 };
const warga = { id: 10, posyandu_id: 7, tanggal_lahir: "1990-01-01" };

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

test("pregnancy status and breastfeeding combinations are validated", async () => {
  const originalFindOne = Warga.findOne;
  const originalCreate = ProfileKehamilan.create;
  try {
    Warga.findOne = async () => warga;
    ProfileKehamilan.create = async (values) => ({ id: 1, ...values });

    const valid = await invoke(controller.createKehamilan, request({ warga_id: 10, status_kehamilan: "hamil", hpht: "2026-01-01", hpl: "2026-10-08" }));
    assert.strictEqual(valid.statusCode, 201);

    const invalidStatus = await invoke(controller.createKehamilan, request({ warga_id: 10, status_kehamilan: "invalid" }));
    assert.strictEqual(invalidStatus.statusCode, 400);

    const invalidBreastfeeding = await invoke(controller.createKehamilan, request({ warga_id: 10, status_kehamilan: "hamil", is_menyusui: true }));
    assert.strictEqual(invalidBreastfeeding.statusCode, 400);

    const missingDeliveryDate = await invoke(controller.createKehamilan, request({ warga_id: 10, status_kehamilan: "menyusui" }));
    assert.strictEqual(missingDeliveryDate.statusCode, 400);

    const missingBreastfeedingFlag = await invoke(controller.createKehamilan, request({ warga_id: 10, status_kehamilan: "menyusui", tanggal_persalinan: "2026-09-01" }));
    assert.strictEqual(missingBreastfeedingFlag.statusCode, 400);

    const invalidDates = await invoke(controller.createKehamilan, request({ warga_id: 10, status_kehamilan: "hamil", hpht: "2026-05-01", hpl: "2026-04-01" }));
    assert.strictEqual(invalidDates.statusCode, 400);
  } finally {
    Warga.findOne = originalFindOne;
    ProfileKehamilan.create = originalCreate;
  }
});

test("update status and delivery date preserve old data on invalid input", async () => {
  const originalFindByPk = ProfileKehamilan.findByPk;
  const originalFindOne = Warga.findOne;
  try {
    const profile = {
      id: 1,
      warga_id: 10,
      status_kehamilan: "hamil",
      hpht: "2026-01-01",
      hpl: "2026-10-08",
      tanggal_persalinan: null,
      is_menyusui: false,
      async update(values) {
        Object.assign(this, values);
      },
    };
    ProfileKehamilan.findByPk = async () => profile;
    Warga.findOne = async () => warga;

    const invalid = await invoke(controller.updateKehamilan, request({ status_kehamilan: "menyusui" }));
    assert.strictEqual(invalid.statusCode, 400);
    assert.strictEqual(profile.status_kehamilan, "hamil");
    assert.strictEqual(profile.tanggal_persalinan, null);

    const editedDate = await invoke(controller.updateStatusKehamilan, request({ status_kehamilan: "menyusui", is_menyusui: true, tanggal_persalinan: "2026-09-01" }));
    assert.strictEqual(editedDate.statusCode, 200);
    assert.strictEqual(profile.tanggal_persalinan, "2026-09-01");
    assert.strictEqual(profile.status_kehamilan, "menyusui");
  } finally {
    ProfileKehamilan.findByPk = originalFindByPk;
    Warga.findOne = originalFindOne;
  }
});

test("pregnancy reads and updates enforce Posyandu scope", async () => {
  const originalFindOne = Warga.findOne;
  const originalFindByPk = ProfileKehamilan.findByPk;
  try {
    Warga.findOne = async () => null;
    const outOfScope = await invoke(controller.getKehamilanByWarga, request({}, 1, 99));
    assert.strictEqual(outOfScope.statusCode, 404);

    ProfileKehamilan.findByPk = async () => ({ id: 1, warga_id: 99 });
    const blockedUpdate = await invoke(controller.updateStatusKehamilan, request({ status_kehamilan: "selesai" }));
    assert.strictEqual(blockedUpdate.statusCode, 404);
  } finally {
    Warga.findOne = originalFindOne;
    ProfileKehamilan.findByPk = originalFindByPk;
  }
});

test("latest pregnancy profile drives category after delivery date change", () => {
  const beforeDelivery = tentukanKategoriAktif("1990-01-01", [{ id: 2, status_kehamilan: "hamil", is_menyusui: false }], "2026-08-01");
  const afterDelivery = tentukanKategoriAktif("1990-01-01", [{ id: 2, status_kehamilan: "menyusui", tanggal_persalinan: "2026-08-01", is_menyusui: true }], "2026-08-10");
  assert.strictEqual(beforeDelivery, "bumil");
  assert.strictEqual(afterDelivery, "busui");
});

test("update status kehamilan menghasilkan satu audit log KEHAMILAN_STATUS_UPDATE", async () => {
  const originalFindByPk = ProfileKehamilan.findByPk;
  const originalFindOne = Warga.findOne;
  const originalAuditCreate = AuditLog.create;
  try {
    const profile = {
      id: 1,
      warga_id: 10,
      status_kehamilan: "hamil",
      hpht: "2026-01-01",
      hpl: "2026-10-08",
      tanggal_persalinan: null,
      is_menyusui: false,
      async update(values) {
        Object.assign(this, values);
      },
    };
    ProfileKehamilan.findByPk = async () => profile;
    Warga.findOne = async () => warga;

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const updated = await invoke(controller.updateStatusKehamilan, request({ status_kehamilan: "menyusui", is_menyusui: true, tanggal_persalinan: "2026-09-01" }));
    assert.strictEqual(updated.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "KEHAMILAN_STATUS_UPDATE");
    assert.strictEqual(auditCalls[0].old_value.status_kehamilan, "hamil");
    assert.strictEqual(auditCalls[0].new_value.status_kehamilan, "menyusui");
  } finally {
    ProfileKehamilan.findByPk = originalFindByPk;
    Warga.findOne = originalFindOne;
    AuditLog.create = originalAuditCreate;
  }
});
