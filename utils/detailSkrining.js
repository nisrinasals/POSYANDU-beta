/**
 * Template default skema JSONB detail_skrining per kategori sasaran
 */
const SKEMA_SKRINING = {
  bumil: {
    tfu_cm: null, // Tinggi Fundus Uteri
    djj_bpm: null, // Denyut Jantung Janin
    hemoglobin_gdl: null,
    status_tt: null, // T1 - T5
    lingkar_lengan_status: null, // KEK / Normal
    bengkak_kaki: false,
    refleks_patela: null,
  },
  busui: {
    produksi_asi: null,
    masalah_menyusui: null,
    kb_pasca_salin: null,
  },
  bayi: {
    asi_eksklusif: true,
    inisiasi_menyusu_dini: true,
    imunisasi_rutin: [],
    vit_a: false,
  },
  balita: {
    mpasi: true,
    status_gizi: null, // Stunting / Wasting / Normal / Obesitas
    perkembangan_sdidtk: null,
    vit_a: false,
    obat_cacing: false,
  },
  apras: {
    pemeriksaan_gigi: null,
    perkembangan_sdidtk: null,
    kemampuan_sosialisasi: null,
  },
  uskrem_6_14: {
    skrining_anemia: false,
    kesehatan_gigi_mulut: null,
    tajam_penglihatan: null,
  },
  uskerem_15_18: {
    skrining_anemia: false,
    perilaku_berisiko: {
      merokok: false,
      tinggi_gula: false,
      tinggi_garam: false,
      tinggi_lemak: false,
    },
  },
  dewasa: {
    // Bulanan / Rutin
    perilaku_berisiko: {
      merokok: false,
      tinggi_gula: false,
      tinggi_garam: false,
      tinggi_lemak: false,
    },
    // Skrining Tambahan jika Skrining Tahunan (1x per tahun)
    skrining_tahunan: {
      skrining_ptm: null, // Hipertensi, Diabetes, dll
      skrining_ppok: false, // PPOK (Kuesioner PUMA)
      skrining_tb: false, // Gejala Batuk > 2 minggu
      skrining_jiwa: null, // SRQ-20
      skrining_kanker_payudara: false,
    },
  },
  lansia: {
    // Bulanan / Rutin
    risiko_jatuh: false,
    perilaku_berisiko: {
      merokok: false,
      tinggi_gula: false,
      tinggi_garam: false,
      tinggi_lemak: false,
    },
    // Skrining Tambahan jika Skrining Tahunan (1x per tahun)
    skrining_tahunan: {
      skrining_aks: null, // Aktivitas Kehidupan Sehari-hari (BARTHEL Index)
      skrining_pikun_amt: null, // Abbreviated Mental Test
      skrining_ptm: null,
      skrining_tb: false,
      skrining_jiwa: null,
    },
  },
};

/**
 * Validasi dan format detail_skrining sesuai kategori sasaran.
 * Menautkan flag is_skrining_tahunan langsung ke dalam JSONB.
 *
 * @param {string} kategoriSasaran
 * @param {object} inputSkrining
 * @param {boolean} isTahunan
 * @returns {object} Payload detail_skrining terformat
 */
const formatDetailSkrining = (kategoriSasaran, inputSkrining = {}, isTahunan = false) => {
  const schemaDefault = SKEMA_SKRINING[kategoriSasaran];

  if (!schemaDefault) return inputSkrining || {};

  const formatted = { ...inputSkrining };

  // Khusus sasaran Dewasa dan Lansia
  if (["dewasa", "lansia"].includes(kategoriSasaran)) {
    // Flag disimpan LANGSUNG di dalam JSONB detail_skrining
    formatted.is_skrining_tahunan = Boolean(isTahunan);

    // Jika BUKAN skrining tahunan, buang objek skrining_tahunan agar JSONB ringkas
    if (!isTahunan) {
      delete formatted.skrining_tahunan;
    }
  }

  return formatted;
};

module.exports = {
  SKEMA_SKRINING,
  formatDetailSkrining,
};
