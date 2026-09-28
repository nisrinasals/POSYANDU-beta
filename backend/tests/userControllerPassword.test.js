"use strict";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";

const assert = require("assert");
const test = require("node:test");
const bcrypt = require("bcryptjs");
const { User, AuditLog } = require("../models");
const userController = require("../controllers/userController");

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

test("changePassword gagal jika password lama tidak sesuai", async () => {
  const originalFindByPk = User.findByPk;
  try {
    const passwordHash = await bcrypt.hash("PasswordLama123", 10);
    User.findByPk = async () => ({
      id: 1,
      email: "user@test.com",
      password_hash: passwordHash,
      token_version: 1,
      async update() {},
    });

    const res = await invoke(
      userController.changePassword,
      request(
        {
          old_password: "SalahPassword123",
          new_password: "PasswordBaru123",
          confirm_password: "PasswordBaru123",
        },
        { id: 1 }
      )
    );

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Password lama tidak sesuai.");
  } finally {
    User.findByPk = originalFindByPk;
  }
});

test("changePassword gagal jika password baru kurang dari 8 karakter", async () => {
  const res = await invoke(
    userController.changePassword,
    request(
      {
        old_password: "PasswordLama123",
        new_password: "short",
        confirm_password: "short",
      },
      { id: 1 }
    )
  );

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, "Password baru minimal 8 karakter.");
});

test("changePassword gagal jika password baru sama dengan password lama", async () => {
  const res = await invoke(
    userController.changePassword,
    request(
      {
        old_password: "PasswordLama123",
        new_password: "PasswordLama123",
        confirm_password: "PasswordLama123",
      },
      { id: 1 }
    )
  );

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, "Password baru harus berbeda dari password lama.");
});

test("changePassword gagal jika confirm_password tidak cocok", async () => {
  const res = await invoke(
    userController.changePassword,
    request(
      {
        old_password: "PasswordLama123",
        new_password: "PasswordBaru123",
        confirm_password: "BedaPassword123",
      },
      { id: 1 }
    )
  );

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, "Konfirmasi password baru tidak cocok.");
});

test("changePassword berhasil memperbarui password dan menaikkan token_version", async () => {
  const originalFindByPk = User.findByPk;
  const originalAuditCreate = AuditLog.create;
  try {
    const passwordHash = await bcrypt.hash("PasswordLama123", 10);
    let updatedPayload = null;

    const mockUser = {
      id: 1,
      email: "user@test.com",
      password_hash: passwordHash,
      token_version: 2,
      async update(payload) {
        updatedPayload = payload;
        this.password_hash = payload.password_hash;
        this.token_version = payload.token_version;
      },
    };

    User.findByPk = async () => mockUser;
    AuditLog.create = async () => ({ id: 1 });

    const res = await invoke(
      userController.changePassword,
      request(
        {
          old_password: "PasswordLama123",
          new_password: "PasswordBaru123",
          confirm_password: "PasswordBaru123",
        },
        { id: 1 }
      )
    );

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, "Password berhasil diperbarui.");
    assert.strictEqual(res.body.password_hash, undefined);
    assert.ok(updatedPayload);
    assert.strictEqual(updatedPayload.token_version, 3);
    const matchesNew = await bcrypt.compare("PasswordBaru123", updatedPayload.password_hash);
    assert.strictEqual(matchesNew, true);
  } finally {
    User.findByPk = originalFindByPk;
    AuditLog.create = originalAuditCreate;
  }
});
