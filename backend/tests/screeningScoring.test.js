"use strict";

const assert = require("assert");
const test = require("node:test");
const { calculatePuma, calculateAks, calculateTbc, calculateJiwa, isJiwaEligible, finalizeScreeningScores } = require("../utils/screeningScoringHelper");
const { formatDetailSkrining, validateDetailSkrining } = require("../utils/detailSkriningHelper");

const female40 = { jenis_kelamin: "P", tanggal_lahir: "1986-01-01" };
const male60 = { jenis_kelamin: "L", tanggal_lahir: "1960-01-01" };
const components = { merokok_skor: 0, napas_pendek_skor: 0, dahak_paru_skor: 0, batuk_atau_spirometri_skor: 0 };

test("PUMA minimum score is low risk and client total is ignored", () => {
  const result = calculatePuma({ ...components, jenis_kelamin_skor: 99, usia_skor: 99, total_skor_puma: 999 }, female40);
  assert.deepStrictEqual(result.scores, { jenis_kelamin_skor: 0, usia_skor: 0, ...components });
  assert.strictEqual(result.total_skor_puma, 0);
  assert.strictEqual(result.status_risiko_puma, "risiko_rendah");
});

test("PUMA maximum score is high risk", () => {
  const result = calculatePuma({ merokok_skor: 2, napas_pendek_skor: 1, dahak_paru_skor: 1, batuk_atau_spirometri_skor: 1 }, male60);
  assert.strictEqual(result.total_skor_puma, 8);
  assert.strictEqual(result.status_risiko_puma, "risiko_tinggi");
});

test("PUMA score exactly 6 remains explicitly ambiguous", () => {
  const result = calculatePuma({ merokok_skor: 1, napas_pendek_skor: 1, dahak_paru_skor: 1, batuk_atau_spirometri_skor: 0 }, male60);
  assert.strictEqual(result.total_skor_puma, 6);
  assert.strictEqual(result.status_risiko_puma, "ambigu_skor_6");
});

test("PUMA rejects invalid component ranges and missing components", () => {
  const result = calculatePuma({ merokok_skor: 3, napas_pendek_skor: 0, dahak_paru_skor: 0 }, female40);
  assert.ok(result.errors.some((message) => message.includes("merokok_skor")));
  assert.ok(result.errors.some((message) => message.includes("batuk_atau_spirometri_skor")));
});

test("PUMA finalization derives gender and age scores from warga", () => {
  const formatted = formatDetailSkrining("dewasa", { skrining_ppok_puma: { ...components, jenis_kelamin_skor: 0, usia_skor: 0, total_skor_puma: 999 } });
  const result = finalizeScreeningScores("dewasa", formatted, male60);
  assert.deepStrictEqual(result.errors, []);
  assert.strictEqual(result.detail.skrining_ppok_puma.jenis_kelamin_skor, 1);
  assert.strictEqual(result.detail.skrining_ppok_puma.usia_skor, 2);
  assert.strictEqual(result.detail.skrining_ppok_puma.total_skor_puma, 3);
});

test("SKILAS validates all boolean indicators without inventing a total", () => {
  const detail = formatDetailSkrining("lansia", { skilas: { is_imunisasi_covid19: true } });
  assert.strictEqual(validateDetailSkrining("lansia", detail), null);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(detail.skilas, "total_skor_skilas"), false);
  assert.match(validateDetailSkrining("lansia", { skilas: { is_imunisasi_covid19: "ya" } }), /tipe data tidak valid/);
});

test("AKS accepts all ten documented activity fields", () => {
  const detail = formatDetailSkrining("lansia", { aks_aktifitas_harian: { mandi_skor: 4, total_skor_aks: 999 } });
  assert.strictEqual(validateDetailSkrining("lansia", detail), null);
  assert.strictEqual(detail.aks_aktifitas_harian.total_skor_aks, 999);
});

const aks = (overrides = {}) => ({
  bab_skor: 0,
  bak_skor: 0,
  penggunaan_wc_skor: 0,
  makan_minum_skor: 0,
  transfer_tempat_tidur_skor: 0,
  berjalan_tempat_rata_skor: 0,
  berpakaian_skor: 0,
  naik_turun_tangga_skor: 0,
  mandi_skor: 0,
  membersihkan_diri_skor: 0,
  ...overrides,
});

test("AKS classifies documented boundaries and ignores client total", () => {
  assert.strictEqual(calculateAks(aks()).status_aks, "ketergantungan_total");
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2 })).total_skor_aks, 4);
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, mandi_skor: 1 })).status_aks, "ketergantungan_berat");
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, mandi_skor: 1 })).total_skor_aks, 5);
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, penggunaan_wc_skor: 2, makan_minum_skor: 1, mandi_skor: 1 })).total_skor_aks, 8);
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, penggunaan_wc_skor: 2, makan_minum_skor: 2, mandi_skor: 1 })).total_skor_aks, 9);
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, penggunaan_wc_skor: 2, makan_minum_skor: 2, transfer_tempat_tidur_skor: 1, mandi_skor: 1 })).total_skor_aks, 10);
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, penggunaan_wc_skor: 2, makan_minum_skor: 2, transfer_tempat_tidur_skor: 2, mandi_skor: 1 })).status_aks, "ketergantungan_sedang");
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, penggunaan_wc_skor: 2, makan_minum_skor: 2, transfer_tempat_tidur_skor: 3, mandi_skor: 1 })).status_aks, "ketergantungan_ringan");
  assert.strictEqual(calculateAks(aks({ bab_skor: 2, bak_skor: 2, penggunaan_wc_skor: 2, makan_minum_skor: 2, transfer_tempat_tidur_skor: 3, berjalan_tempat_rata_skor: 1, mandi_skor: 1 })).status_aks, "ketergantungan_ringan");
  assert.strictEqual(
    calculateAks(aks({ bab_skor: 2, bak_skor: 2, penggunaan_wc_skor: 2, makan_minum_skor: 2, transfer_tempat_tidur_skor: 3, berjalan_tempat_rata_skor: 3, berpakaian_skor: 2, naik_turun_tangga_skor: 2, mandi_skor: 1, total_skor_aks: 0 }))
      .total_skor_aks,
    19,
  );
  assert.strictEqual(
    calculateAks(
      aks({
        bab_skor: 2,
        bak_skor: 2,
        membersihkan_diri_skor: 1,
        penggunaan_wc_skor: 2,
        makan_minum_skor: 2,
        transfer_tempat_tidur_skor: 3,
        berjalan_tempat_rata_skor: 3,
        berpakaian_skor: 2,
        naik_turun_tangga_skor: 2,
        mandi_skor: 1,
        total_skor_aks: 0,
      }),
    ).total_skor_aks,
    20,
  );
  assert.strictEqual(
    calculateAks(
      aks({ bab_skor: 2, bak_skor: 2, membersihkan_diri_skor: 1, penggunaan_wc_skor: 2, makan_minum_skor: 2, transfer_tempat_tidur_skor: 3, berjalan_tempat_rata_skor: 3, berpakaian_skor: 2, naik_turun_tangga_skor: 2, mandi_skor: 1 }),
    ).status_aks,
    "mandiri",
  );
});

test("AKS rejects invalid item scores", () => {
  assert.ok(calculateAks(aks({ mandi_skor: 2 })).errors.some((message) => message.includes("mandi_skor")));
  assert.ok(calculateAks(aks({ membersihkan_diri_skor: 2 })).errors.some((message) => message.includes("membersihkan_diri_skor")));
});

test("SKILAS validation does not invent an automatic referral result", () => {
  const detail = formatDetailSkrining("lansia", { skilas: { is_imunisasi_covid19: true } });
  const finalized = finalizeScreeningScores("lansia", detail, {}, { skilasProvided: true });
  assert.strictEqual(validateDetailSkrining("lansia", finalized.detail), null);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(finalized.detail.skilas, "is_rujukan_skilas"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(finalized.detail.skilas, "status_skilas"), false);
});

// TBC: minimal 1 field true -> terindikasi; semua false -> tidak terindikasi.
test("TBC calculateTbc returns tidak_terindikasi when every field is false", () => {
  assert.deepStrictEqual(calculateTbc("bumil", { has_batuk_menerus: false, has_demam_2_minggu: false, has_bb_tetap_atau_turun_2_bulan: false, has_kontak_pasien_tbc: false }), {
    is_tbc_terindikasi: false,
    status_tbc: "tidak_terindikasi",
  });
});

test("TBC outcome is RISIKO for bumil/busui/dewasa/lansia when terindikasi", () => {
  for (const category of ["bumil", "busui", "dewasa", "lansia"]) {
    const result = calculateTbc(category, { has_kontak_pasien_tbc: true });
    assert.strictEqual(result.is_tbc_terindikasi, true);
    assert.strictEqual(result.status_tbc, "risiko");
  }
});

test("TBC outcome is RUJUKAN for bayi/balita/apras/uskrem_6_14/uskrem_15_18 when terindikasi", () => {
  for (const category of ["bayi", "balita", "apras", "uskrem_6_14", "uskrem_15_18"]) {
    const result = calculateTbc(category, { has_lesu_malaise: true });
    assert.strictEqual(result.is_tbc_terindikasi, true);
    assert.strictEqual(result.status_tbc, "rujukan");
  }
});

test("TBC handles nested gejala_tambahan for dewasa/lansia", () => {
  const onlyNestedTrue = { has_batuk_lebih_2_minggu: false, has_batuk_kurang_2_minggu: false, gejala_tambahan: { has_nafsu_makan_menurun: false, has_bb_menurun: true } };
  const result = calculateTbc("lansia", onlyNestedTrue);
  assert.strictEqual(result.is_tbc_terindikasi, true);
  assert.strictEqual(result.status_tbc, "risiko");

  const allFalseIncludingNested = { has_batuk_lebih_2_minggu: false, has_batuk_kurang_2_minggu: false, gejala_tambahan: { has_nafsu_makan_menurun: false, has_bb_menurun: false } };
  const negative = calculateTbc("dewasa", allFalseIncludingNested);
  assert.strictEqual(negative.is_tbc_terindikasi, false);
  assert.strictEqual(negative.status_tbc, "tidak_terindikasi");
});

test("TBC recalculation via finalizeScreeningScores ignores client-supplied status_tbc/is_tbc_terindikasi", () => {
  const formatted = formatDetailSkrining("balita", { tbc: { has_batuk_2_minggu: true, is_tbc_terindikasi: false, status_tbc: "tidak_terindikasi" } });
  const finalized = finalizeScreeningScores("balita", formatted, {});
  assert.strictEqual(finalized.errors.length, 0);
  assert.strictEqual(finalized.detail.tbc.is_tbc_terindikasi, true);
  assert.strictEqual(finalized.detail.tbc.status_tbc, "rujukan");
});

// Skrining Jiwa: score per pertanyaan, group threshold, dan eligibility kategori/gender.
test("Skrining Jiwa: semua jawaban 0 tidak menghasilkan rujukan", () => {
  const input = { jawaban_skor: { kurang_bersemangat: 0, murung_tertekan_putus_asa: 0, gugup_cemas_gelisah: 0, sulit_kendalikan_khawatir: 0 } };
  const result = calculateJiwa(input);
  assert.strictEqual(result.group1_skor_jiwa, 0);
  assert.strictEqual(result.group2_skor_jiwa, 0);
  assert.strictEqual(result.is_rujukan_jiwa, false);
});

test("Skrining Jiwa: 'kurang dari 1 minggu' bernilai 1, group1 = 3 -> rujukan", () => {
  const result = calculateJiwa({ jawaban_skor: { kurang_bersemangat: 1, murung_tertekan_putus_asa: 2, gugup_cemas_gelisah: 0, sulit_kendalikan_khawatir: 0 } });
  assert.strictEqual(result.group1_skor_jiwa, 3);
  assert.strictEqual(result.is_rujukan_jiwa, true);
});

test("Skrining Jiwa: group2 = 3 -> rujukan meskipun group1 rendah", () => {
  const result = calculateJiwa({ jawaban_skor: { kurang_bersemangat: 0, murung_tertekan_putus_asa: 1, gugup_cemas_gelisah: 2, sulit_kendalikan_khawatir: 1 } });
  assert.strictEqual(result.group1_skor_jiwa, 1);
  assert.strictEqual(result.group2_skor_jiwa, 3);
  assert.strictEqual(result.is_rujukan_jiwa, true);
});

test("Skrining Jiwa: group1 = 2 dan group2 = 2 tidak rujukan (total 4 pertanyaan tidak dipakai sebagai threshold)", () => {
  const result = calculateJiwa({ jawaban_skor: { kurang_bersemangat: 1, murung_tertekan_putus_asa: 1, gugup_cemas_gelisah: 1, sulit_kendalikan_khawatir: 1 } });
  assert.strictEqual(result.total_skor_jiwa, 4);
  assert.strictEqual(result.is_rujukan_jiwa, false);
});

test("Skrining Jiwa: skor tinggi di satu group dan rendah di group lain tetap rujukan", () => {
  const result = calculateJiwa({ jawaban_skor: { kurang_bersemangat: 3, murung_tertekan_putus_asa: 0, gugup_cemas_gelisah: 0, sulit_kendalikan_khawatir: 0 } });
  assert.strictEqual(result.group1_skor_jiwa, 3);
  assert.strictEqual(result.group2_skor_jiwa, 0);
  assert.strictEqual(result.is_rujukan_jiwa, true);
});

test("Skrining Jiwa eligibility: dewasa selalu eligible, uskrem hanya perempuan", () => {
  assert.strictEqual(isJiwaEligible("dewasa", { jenis_kelamin: "L" }), true);
  assert.strictEqual(isJiwaEligible("dewasa", { jenis_kelamin: "P" }), true);
  assert.strictEqual(isJiwaEligible("uskrem_6_14", { jenis_kelamin: "P" }), true);
  assert.strictEqual(isJiwaEligible("uskrem_6_14", { jenis_kelamin: "L" }), false);
  assert.strictEqual(isJiwaEligible("uskrem_15_18", { jenis_kelamin: "L" }), false);
  assert.strictEqual(isJiwaEligible("lansia", { jenis_kelamin: "P" }), false);
});

test("Skrining Jiwa: kategori/gender tidak eligible ditolak secara konsisten (bukan diabaikan)", () => {
  const formatted = formatDetailSkrining("uskrem_6_14", { skrining_kesehatan_jiwa: { jawaban_skor: { kurang_bersemangat: 3, murung_tertekan_putus_asa: 3, gugup_cemas_gelisah: 0, sulit_kendalikan_khawatir: 0 } } });
  const finalized = finalizeScreeningScores("uskrem_6_14", formatted, { jenis_kelamin: "L" });
  assert.ok(finalized.errors.length > 0);
  assert.match(finalized.errors[0], /hanya berlaku/);
});

test("Skrining Jiwa: backend menghitung ulang total/group/rujukan, bukan mempercayai nilai client", () => {
  const formatted = formatDetailSkrining("dewasa", {
    skrining_kesehatan_jiwa: { jawaban_skor: { kurang_bersemangat: 0, murung_tertekan_putus_asa: 0, gugup_cemas_gelisah: 0, sulit_kendalikan_khawatir: 0 }, total_skor_jiwa: 999, is_rujukan_jiwa: true },
  });
  const finalized = finalizeScreeningScores("dewasa", formatted, { jenis_kelamin: "P" }, { pumaProvided: false, aksProvided: false });
  assert.strictEqual(finalized.errors.length, 0);
  assert.strictEqual(finalized.detail.skrining_kesehatan_jiwa.total_skor_jiwa, 0);
  assert.strictEqual(finalized.detail.skrining_kesehatan_jiwa.is_rujukan_jiwa, false);
});

test("Skrining Jiwa: schema Q1-Q4 tersedia untuk uskrem_6_14 dan uskrem_15_18", () => {
  for (const category of ["uskrem_6_14", "uskrem_15_18"]) {
    const formatted = formatDetailSkrining(category, {});
    assert.ok(formatted.skrining_kesehatan_jiwa);
    assert.deepStrictEqual(Object.keys(formatted.skrining_kesehatan_jiwa.jawaban_skor), ["kurang_bersemangat", "murung_tertekan_putus_asa", "gugup_cemas_gelisah", "sulit_kendalikan_khawatir"]);
  }
});
