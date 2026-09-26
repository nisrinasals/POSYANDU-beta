const assert = require("assert");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const request = require("supertest");

require("dotenv").config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "http-test-secret";

const { app } = require("../server");
const { User, Warga, Pemeriksaan, Rujukan } = require("../models");

const activeUser = (role = "kader") => ({ id: 12, role, status: "active", token_version: 1, posyandu_id: 7, puskesmas_id: 9 });
const tokenFor = (user) => jwt.sign({ id: user.id, token_version: user.token_version }, process.env.JWT_SECRET);
const authRequest = (user, path) =>
  request(app)
    .get(path)
    .set("Authorization", `Bearer ${tokenFor(user)}`);

test("HTTP auth rejects missing token with 401", async () => {
  const response = await request(app).get("/api/rujukan");
  assert.strictEqual(response.status, 401);
});

test("HTTP authorization rejects an unauthorized role with 403", async () => {
  const originalFindByPk = User.findByPk;
  try {
    User.findByPk = async () => activeUser("guest");
    const response = await authRequest(activeUser("guest"), "/api/rujukan");
    assert.strictEqual(response.status, 403);
  } finally {
    User.findByPk = originalFindByPk;
  }
});

test("HTTP validation rejects invalid Warga pagination with 400", async () => {
  const originalFindByPk = User.findByPk;
  try {
    User.findByPk = async () => activeUser();
    const response = await authRequest(activeUser(), "/api/warga?page=0");
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.message, "Validasi data gagal");
  } finally {
    User.findByPk = originalFindByPk;
  }
});

test("HTTP Pemeriksaan list returns success through authentication and controller", async () => {
  const originals = { user: User.findByPk, pemeriksaan: Pemeriksaan.findAndCountAll };
  try {
    User.findByPk = async () => activeUser();
    Pemeriksaan.findAndCountAll = async () => ({ count: 0, rows: [] });
    const response = await authRequest(activeUser(), "/api/pemeriksaan");
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
  } finally {
    User.findByPk = originals.user;
    Pemeriksaan.findAndCountAll = originals.pemeriksaan;
  }
});

test("HTTP Rujukan detail returns scoped 404", async () => {
  const originals = { user: User.findByPk, rujukan: Rujukan.findByPk };
  try {
    User.findByPk = async () => activeUser();
    Rujukan.findByPk = async () => null;
    const response = await authRequest(activeUser(), "/api/rujukan/999");
    assert.strictEqual(response.status, 404);
  } finally {
    User.findByPk = originals.user;
    Rujukan.findByPk = originals.rujukan;
  }
});

test("HTTP Rujukan list returns success and PDF export returns a PDF", async () => {
  const originals = { user: User.findByPk, list: Rujukan.findAndCountAll, detail: Rujukan.findByPk };
  const plainReferral = {
    id: 81,
    tanggal_rujukan: "2026-09-16",
    alasan_rujukan: "Konsultasi lanjutan",
    warga: { nama_lengkap: "Siti", nik: "123" },
    puskesmas: { nama_puskesmas: "Puskesmas Utama" },
    kader: { nama_lengkap: "Kader A" },
    pemeriksaan: { id: 41, tanggal: "2026-09-16", kategori_sasaran: "dewasa" },
  };
  try {
    User.findByPk = async () => activeUser();
    Rujukan.findAndCountAll = async () => ({ count: 1, rows: [plainReferral] });
    Rujukan.findByPk = async () => ({ get: () => plainReferral });

    const listResponse = await authRequest(activeUser(), "/api/rujukan");
    assert.strictEqual(listResponse.status, 200);
    assert.strictEqual(listResponse.body.pagination.total_items, 1);

    const pdfResponse = await authRequest(activeUser(), "/api/rujukan/81/export");
    assert.strictEqual(pdfResponse.status, 200);
    assert.match(pdfResponse.headers["content-type"], /application\/pdf/);
    assert.ok(pdfResponse.body.length > 100);
  } finally {
    User.findByPk = originals.user;
    Rujukan.findAndCountAll = originals.list;
    Rujukan.findByPk = originals.detail;
  }
});
