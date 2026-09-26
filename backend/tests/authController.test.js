"use strict";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";

const assert = require("assert");
const test = require("node:test");
const bcrypt = require("bcryptjs");
const { User, AuditLog } = require("../models");
const controller = require("../controllers/authController");

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

const request = (body = {}, user = null) => ({ body, user });

const invoke = async (handler, req) => {
  const res = response();
  let error = null;
  await handler(req, res, (nextError) => {
    error = nextError;
  });
  if (error) throw error;
  return res;
};

test("login berhasil menghasilkan satu audit log AUTH_LOGIN dengan user_id yang benar", async () => {
  const originalFindOne = User.findOne;
  const originalAuditCreate = AuditLog.create;
  try {
    const passwordHash = await bcrypt.hash("rahasia123", 10);
    const user = {
      id: 42,
      email: "kader@test.com",
      password_hash: passwordHash,
      role: "kader",
      status: "active",
      token_version: 1,
      puskesmas_id: null,
      posyandu_id: 1,
      puskesmas: null,
      posyandu: null,
      async increment() {
        this.token_version += 1;
      },
      async reload() {},
    };
    User.findOne = async () => user;

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const result = await invoke(controller.login, request({ email: user.email, password: "rahasia123" }));

    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "AUTH_LOGIN");
    assert.strictEqual(auditCalls[0].user_id, 42);
    assert.strictEqual(auditCalls[0].table_name, "users");
    assert.strictEqual(auditCalls[0].new_value.password, undefined);
    assert.strictEqual(auditCalls[0].new_value.password_hash, undefined);
  } finally {
    User.findOne = originalFindOne;
    AuditLog.create = originalAuditCreate;
  }
});

test("logout menghasilkan satu audit log AUTH_LOGOUT dengan user_id dari req.user", async () => {
  const originalIncrement = User.increment;
  const originalAuditCreate = AuditLog.create;
  try {
    User.increment = async () => [1];

    const auditCalls = [];
    AuditLog.create = async (payload) => {
      auditCalls.push(payload);
      return { id: 1, ...payload };
    };

    const result = await invoke(controller.logout, request({}, { id: 7 }));

    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(auditCalls.length, 1);
    assert.strictEqual(auditCalls[0].action, "AUTH_LOGOUT");
    assert.strictEqual(auditCalls[0].user_id, 7);
  } finally {
    User.increment = originalIncrement;
    AuditLog.create = originalAuditCreate;
  }
});
