"use strict";

const assert = require("assert");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { app } = require("../server");
const { Pemeriksaan, KunjunganPosyandu, Warga, Posyandu, SesiPosyandu, Rujukan, User } = require("../models");
const { getPlotReferralReasons, getCombinedReferralReasons } = require("../utils/rujukanHelper");
const { getPreviousAnnualScreening } = require("../utils/skriningChecker");
const { isExaminationComplete } = require("../utils/examinationCompletionHelper");
const controller = require("../controllers/pemeriksaanController");
const kunjunganController = require("../controllers/kunjunganController");
const wargaController = require("../controllers/wargaController");

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
  setHeader(name, val) {
    this.headers[name] = val;
  },
  end() {},
});

const invoke = async (handler, req) => {
  const res = response();
  let error = null;
  await handler(req, res, (nextError) => {
    error = nextError;
  });
  if (error) throw error;
  return res;
};

test("Flow 13: Dinkes can export aggregate recap but personal search/NIK filters are rejected", async () => {
  const dinkesUser = { id: 99, role: "dinkes", status: "active", email_verified: true };
  const reqWithSearch = { query: { search: "John" }, user: dinkesUser };

  const res = await invoke(controller.exportPemeriksaanExcel, reqWithSearch);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /search\/warga_id/);
});

test("Flow 11: getPlotReferralReasons extracts reasons from abnormal plot result and deduplicates", () => {
  const plotData = {
    bbu: { indikator: "BB/U", kategori: "Berat badan kurang", is_merah: true },
    tbu: { indikator: "PB/U", kategori: "Normal", is_merah: false },
    hasil_plot: {
      tekanan_darah: { indikator: "Tekanan Darah", kategori: "Risiko", is_merah: true },
    },
  };

  const plotReasons = getPlotReferralReasons(plotData);
  assert.deepStrictEqual(plotReasons, [
    "Hasil plotting Tekanan Darah: Risiko",
    "Hasil plotting BB/U: Berat badan kurang",
  ]);

  const detailSkrining = { tbc: { is_tbc_terindikasi: true } };
  const combined = getCombinedReferralReasons(detailSkrining, plotData);
  assert.strictEqual(combined.length, 3);
  assert.ok(combined.includes("Indikasi dari skrining TBC"));
  assert.ok(combined.includes("Hasil plotting BB/U: Berat badan kurang"));
  assert.ok(combined.includes("Hasil plotting Tekanan Darah: Risiko"));
});

test("Flow 16: Step completion timestamps are independently updated on edit without erasing others", async () => {
  const initialDateStep2 = new Date("2026-09-10T10:00:00Z");
  const initialDateStep4 = new Date("2026-09-10T11:00:00Z");

  const mockPemeriksaan = {
    id: 50,
    kategori_sasaran: "dewasa",
    tanggal: "2026-09-15",
    usia_bulan: 360,
    bb_kg: 50,
    tb_cm: 160,
    step2_completed_at: initialDateStep2,
    step4_completed_at: initialDateStep4,
    step5_completed_at: null,
    kunjungan: {
      warga_id: 10,
      warga: {
        jenis_kelamin: "P",
        tanggal_lahir: "1996-01-01",
        posyandu: { puskesmas_id: 2 },
      },
    },
    async update(values) {
      Object.assign(this, values);
    },
  };

  const origFindByPk = Pemeriksaan.findByPk;
  const origFindOneRujukan = Rujukan.findOne;

  try {
    Pemeriksaan.findByPk = async () => mockPemeriksaan;
    Rujukan.findOne = async () => null;

    // Edit only Step 5 fields
    const reqStep5 = {
      params: { id: "50" },
      user: { role: "sa" },
      body: { topik_penyuluhan: "Pola Makan Sehat", is_perlu_rujukan: false },
    };

    const resStep5 = await invoke(controller.updatePemeriksaan, reqStep5);
    assert.strictEqual(resStep5.statusCode, 200);
    assert.strictEqual(mockPemeriksaan.step2_completed_at, initialDateStep2);
    assert.strictEqual(mockPemeriksaan.step4_completed_at, initialDateStep4);
    assert.ok(mockPemeriksaan.step5_completed_at instanceof Date);
    assert.strictEqual(isExaminationComplete(mockPemeriksaan), true);
  } finally {
    Pemeriksaan.findByPk = origFindByPk;
    Rujukan.findOne = origFindOneRujukan;
  }
});

test("Flow 9: Step 3 utilizes persisted z-scores to maintain classification consistency", async () => {
  const mockPemeriksaan = {
    id: 88,
    tanggal: "2026-09-15",
    usia_bulan: 12,
    kategori_sasaran: "bayi",
    bb_kg: 7.5,
    tb_cm: 72,
    zscore_bbu: -2.5,
    zscore_pbu: 0.1,
    zscore_tbu: null,
    zscore_bbpb: -2.2,
    zscore_bbtb: null,
    zscore_imtu: -1.8,
    kunjungan: {
      warga_id: 5,
      warga: {
        id: 5,
        jenis_kelamin: "L",
        tanggal_lahir: "2025-09-15",
        profileKehamilan: [],
      },
      sesiPosyandu: {
        id: 1,
        posyandu_id: 1,
        status: "open",
        posyandu: { id: 1 },
      },
    },
    get(options) {
      return this;
    },
  };

  const origFindByPk = Pemeriksaan.findByPk;
  const origFindAll = Pemeriksaan.findAll;

  try {
    Pemeriksaan.findByPk = async () => mockPemeriksaan;
    Pemeriksaan.findAll = async () => [mockPemeriksaan];

    const req = { params: { id: "88" }, user: { role: "sa" } };
    const res = await invoke(controller.getStep3Pemeriksaan, req);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.z_scores.zscore_bbu, -2.5);
    assert.strictEqual(res.body.data.hasil_plot.bbu.zscore, -2.5);
    assert.strictEqual(res.body.data.hasil_plot.bbu.is_merah, true);
  } finally {
    Pemeriksaan.findByPk = origFindByPk;
    Pemeriksaan.findAll = origFindAll;
  }
});

test("Flow 7: updateStatusLangkah rejects langkah_5 if examination is incomplete", async () => {
  const incompleteKunjungan = {
    id: 100,
    status_langkah: "langkah_1",
    pemeriksaan: {
      step2_completed_at: new Date(),
      step4_completed_at: null,
      step5_completed_at: null,
    },
    async update(values) {
      Object.assign(this, values);
    },
  };

  const origFindByPk = KunjunganPosyandu.findByPk;
  try {
    KunjunganPosyandu.findByPk = async () => incompleteKunjungan;
    const req = { params: { id: "100" }, body: { status_langkah: "langkah_5" }, user: { role: "sa" } };
    const res = await invoke(kunjunganController.updateStatusLangkah, req);

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /belum lengkap/);
  } finally {
    KunjunganPosyandu.findByPk = origFindByPk;
  }
});

test("Flow 15: updateWarga explicitly clears nullable fields when passed as null", async () => {
  const mockWarga = {
    id: 123,
    nik: "1234567890123456",
    nama_lengkap: "Warga Test",
    jenis_kelamin: "L",
    tanggal_lahir: "1995-05-05",
    alamat: "Jl. Lama No. 1",
    telepon: "08123456789",
    posyandu_id: 1,
    status_domisili: "aktif",
    async update(values) {
      Object.assign(this, values);
    },
  };

  const origFindOne = Warga.findOne;
  try {
    Warga.findOne = async () => mockWarga;
    const req = {
      params: { id: "123" },
      user: { role: "sa" },
      body: {
        alamat: null,
        telepon: null,
      },
    };

    const res = await invoke(wargaController.updateWarga, req);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(mockWarga.alamat, null);
    assert.strictEqual(mockWarga.telepon, null);
  } finally {
    Warga.findOne = origFindOne;
  }
});
