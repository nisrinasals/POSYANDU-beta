"use strict";

const assert = require("assert");
const test = require("node:test");
const { Warga, Posyandu, ProfilKesehatanWarga, sequelize } = require("../models");
const controller = require("../controllers/wargaController");
const { denyDinkesPersonalData } = require("../middleware/authMiddleware");

const kader = { role: "kader", posyandu_id: 7 };
const destination = { id: 7, puskesmas_id: 3, nama_posyandu: "Posyandu Merpati" };

const responseMock = () => ({
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

const requestMock = (body = {}, user = kader, id = 1, query = {}) => ({
  body,
  user,
  params: { id: String(id) },
  query,
});

const invoke = async (handler, req, res = responseMock()) => {
  let error = null;
  await handler(req, res, (err) => {
    error = err;
  });
  if (error) throw error;
  return res;
};

test("ProfilKesehatanWarga model associations", () => {
  assert.ok(Warga.associations.profilKesehatan, "Warga should have profilKesehatan association");
  assert.ok(ProfilKesehatanWarga.associations.warga, "ProfilKesehatanWarga should have warga association");
});

test("createWarga with profil_kesehatan stores health profile in transaction", async () => {
  const originalTransaction = sequelize.transaction;
  const originalFindPosyandu = Posyandu.findByPk;
  const originalFindWarga = Warga.findOne;
  const originalCreateWarga = Warga.create;
  const originalCreateProfil = ProfilKesehatanWarga.create;

  const mockTransaction = {
    commit: async () => {},
    rollback: async () => {},
  };

  try {
    sequelize.transaction = async () => mockTransaction;
    Posyandu.findByPk = async () => destination;
    Warga.findOne = async () => null;

    let createdWargaValues = null;
    let createdProfilValues = null;

    Warga.create = async (values) => {
      createdWargaValues = values;
      return {
        id: 101,
        ...values,
        toJSON: () => ({ id: 101, ...values }),
      };
    };

    ProfilKesehatanWarga.create = async (values) => {
      createdProfilValues = values;
      return {
        id: 201,
        ...values,
        toJSON: () => ({ id: 201, ...values }),
      };
    };

    const payload = {
      nik: "3201010101019999",
      nama_lengkap: "Budi Santoso",
      jenis_kelamin: "L",
      tanggal_lahir: "1985-05-15",
      posyandu_id: 7,
      profil_kesehatan: {
        riwayat_keluarga: { hipertensi: true, DM: false },
        riwayat_diri: { asma: true },
        perilaku_berisiko: { merokok: true, konsumsi_tinggi_gula: false },
      },
    };

    const res = await invoke(controller.createWarga, requestMock(payload));
    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.success);
    assert.strictEqual(createdWargaValues.nama_lengkap, "Budi Santoso");
    assert.strictEqual(createdProfilValues.warga_id, 101);
    assert.strictEqual(createdProfilValues.riwayat_keluarga.hipertensi, true);
    assert.strictEqual(createdProfilValues.riwayat_diri.asma, true);
    assert.strictEqual(createdProfilValues.perilaku_berisiko.merokok, true);
  } finally {
    sequelize.transaction = originalTransaction;
    Posyandu.findByPk = originalFindPosyandu;
    Warga.findOne = originalFindWarga;
    Warga.create = originalCreateWarga;
    ProfilKesehatanWarga.create = originalCreateProfil;
  }
});

test("updateWarga upserts profil_kesehatan inside transaction", async () => {
  const originalTransaction = sequelize.transaction;
  const originalFindWarga = Warga.findOne;
  const originalFindProfil = ProfilKesehatanWarga.findOne;
  const originalFindByPk = Warga.findByPk;

  const mockTransaction = {
    commit: async () => {},
    rollback: async () => {},
  };

  try {
    sequelize.transaction = async () => mockTransaction;

    const mockWarga = {
      id: 50,
      nik: "3201010101018888",
      posyandu_id: 7,
      nama_lengkap: "Dewi Lestari",
      jenis_kelamin: "P",
      tanggal_lahir: "1992-10-20",
      status_perkawinan: "menikah",
      status_domisili: "aktif",
      posyandu: destination,
      update: async (values) => Object.assign(mockWarga, values),
    };

    Warga.findOne = async () => mockWarga;

    let updatedProfil = null;
    const mockExistingProfil = {
      id: 301,
      warga_id: 50,
      riwayat_keluarga: { hipertensi: false },
      riwayat_diri: { DM: false },
      perilaku_berisiko: { merokok: false },
      update: async (values) => {
        updatedProfil = values;
        return Object.assign(mockExistingProfil, values);
      },
    };

    ProfilKesehatanWarga.findOne = async () => mockExistingProfil;

    Warga.findByPk = async () => ({
      ...mockWarga,
      profilKesehatan: mockExistingProfil,
    });

    const updatePayload = {
      nama_lengkap: "Dewi Lestari Updated",
      profil_kesehatan: {
        riwayat_keluarga: { hipertensi: true, stroke: true },
        riwayat_diri: { DM: true },
        perilaku_berisiko: { merokok: false, garam: true },
      },
    };

    const res = await invoke(controller.updateWarga, requestMock(updatePayload, kader, 50));
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.success);
    assert.strictEqual(updatedProfil.riwayat_keluarga.hipertensi, true);
    assert.strictEqual(updatedProfil.riwayat_keluarga.stroke, true);
    assert.strictEqual(updatedProfil.riwayat_diri.DM, true);
  } finally {
    sequelize.transaction = originalTransaction;
    Warga.findOne = originalFindWarga;
    ProfilKesehatanWarga.findOne = originalFindProfil;
    Warga.findByPk = originalFindByPk;
  }
});

test("denyDinkesPersonalData blocks Dinkes role from accessing personal health routes", async () => {
  const dinkesReq = { user: { role: "dinkes" } };
  const dinkesRes = responseMock();
  let calledNext = false;

  denyDinkesPersonalData(dinkesReq, dinkesRes, () => {
    calledNext = true;
  });

  assert.strictEqual(calledNext, false);
  assert.strictEqual(dinkesRes.statusCode, 403);
  assert.match(dinkesRes.body.message, /dinkes hanya dapat mengakses data agregat/i);
});
