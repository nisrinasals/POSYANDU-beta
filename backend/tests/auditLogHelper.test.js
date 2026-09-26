"use strict";

const assert = require("assert");
const test = require("node:test");
const { AuditLog } = require("../models");
const { createAuditLog, sanitizeValue, AUDIT_ACTIONS } = require("../utils/auditLogHelper");

test("createAuditLog berhasil membuat entri audit log dengan payload lengkap", async () => {
  const originalCreate = AuditLog.create;
  try {
    let capturedPayload = null;
    AuditLog.create = async (payload) => {
      capturedPayload = payload;
      return { id: 1, ...payload };
    };

    await createAuditLog({
      userId: 5,
      action: AUDIT_ACTIONS.WARGA_CREATE,
      tableName: "warga",
      recordId: 10,
      oldValue: null,
      newValue: { nama_lengkap: "Siti Aminah" },
    });

    assert.strictEqual(capturedPayload.user_id, 5);
    assert.strictEqual(capturedPayload.action, AUDIT_ACTIONS.WARGA_CREATE);
    assert.strictEqual(capturedPayload.table_name, "warga");
    assert.strictEqual(capturedPayload.record_id, 10);
    assert.strictEqual(capturedPayload.old_value, null);
    assert.deepStrictEqual(capturedPayload.new_value, { nama_lengkap: "Siti Aminah" });
  } finally {
    AuditLog.create = originalCreate;
  }
});

test("createAuditLog menerima userId null (action sebelum autentikasi)", async () => {
  const originalCreate = AuditLog.create;
  try {
    let capturedPayload = null;
    AuditLog.create = async (payload) => {
      capturedPayload = payload;
      return { id: 2, ...payload };
    };

    await createAuditLog({
      userId: null,
      action: AUDIT_ACTIONS.AUTH_REGISTER,
      tableName: "users",
      recordId: 1,
      oldValue: null,
      newValue: { email: "a@a.com" },
    });

    assert.strictEqual(capturedPayload.user_id, null);
  } finally {
    AuditLog.create = originalCreate;
  }
});

test("createAuditLog menerima oldValue dan newValue null", async () => {
  const originalCreate = AuditLog.create;
  try {
    let capturedPayload = null;
    AuditLog.create = async (payload) => {
      capturedPayload = payload;
      return { id: 3, ...payload };
    };

    await createAuditLog({
      userId: 1,
      action: AUDIT_ACTIONS.AUTH_LOGOUT,
      tableName: "users",
      recordId: 1,
    });

    assert.strictEqual(capturedPayload.old_value, null);
    assert.strictEqual(capturedPayload.new_value, null);
  } finally {
    AuditLog.create = originalCreate;
  }
});

test("createAuditLog gagal tidak melempar error dan tidak menggagalkan business operation", async () => {
  const originalCreate = AuditLog.create;
  try {
    AuditLog.create = async () => {
      throw new Error("DB down");
    };

    await assert.doesNotReject(
      createAuditLog({
        userId: 1,
        action: AUDIT_ACTIONS.AUTH_LOGIN,
        tableName: "users",
        recordId: 1,
      }),
    );
  } finally {
    AuditLog.create = originalCreate;
  }
});

test("createAuditLog & sanitizeValue tidak pernah menyimpan field sensitif", async () => {
  const originalCreate = AuditLog.create;
  try {
    let capturedPayload = null;
    AuditLog.create = async (payload) => {
      capturedPayload = payload;
      return { id: 4, ...payload };
    };

    const sensitivePayload = {
      email: "a@a.com",
      password: "secret123",
      password_hash: "hashedvalue",
      otp_code: "123456",
      token: "abc.def.ghi",
      refresh_token: "xyz",
      jwt: "abc",
      secret_key: "topsecret",
      nested: { credential: "shouldberemoved", nama_lengkap: "OK" },
    };

    await createAuditLog({
      userId: 1,
      action: AUDIT_ACTIONS.USER_STATUS_UPDATE,
      tableName: "users",
      recordId: 1,
      oldValue: sensitivePayload,
      newValue: sensitivePayload,
    });

    for (const value of [capturedPayload.old_value, capturedPayload.new_value]) {
      assert.strictEqual(value.password, undefined);
      assert.strictEqual(value.password_hash, undefined);
      assert.strictEqual(value.otp_code, undefined);
      assert.strictEqual(value.token, undefined);
      assert.strictEqual(value.refresh_token, undefined);
      assert.strictEqual(value.jwt, undefined);
      assert.strictEqual(value.secret_key, undefined);
      assert.strictEqual(value.nested.credential, undefined);
      assert.strictEqual(value.email, "a@a.com");
      assert.strictEqual(value.nested.nama_lengkap, "OK");
    }
  } finally {
    AuditLog.create = originalCreate;
  }
});

test("sanitizeValue membersihkan array of objects secara rekursif", () => {
  const result = sanitizeValue([{ nama_lengkap: "A", password: "x" }, { token: "y" }]);
  assert.deepStrictEqual(result, [{ nama_lengkap: "A" }, {}]);
});
