const SKEMA_SKRINING = {
  busui: {
    tbc: {
      has_batuk_menerus: false,
      has_demam_2_minggu: false,
      has_bb_tetap_atau_turun_2_bulan: false,
      has_kontak_pasien_tbc: false,
    },
    pelayanan_kesehatan: {
      is_vit_a_given: false,
      jumlah_kapsul_vit_a: 0,
      is_rutin_vit_a: false,
      is_menyusui: true,
      is_kb_pasca_persalinan: false,
    },
  },
  bumil: {
    tbc: {
      has_batuk_menerus: false,
      has_demam_2_minggu: false,
      has_bb_tetap_atau_turun_2_bulan: false,
      has_kontak_pasien_tbc: false,
    },
    pelayanan_kesehatan: {
      jumlah_ttd_given: 0,
      is_rutin_ttd: false,
      is_mt_kek_given: false,
      komposisi_mt_kek: "",
      jumlah_m_kek: 0,
      is_rutin_mt_kek: false,
    },
  },
  bayi: {
    pelayanan_kesehatan: {
      tempat_imunisasi: "puskesmas || rumah_sakit || klinik",
      is_asi_eksklusif: false,
      is_mpasi: false,
      is_pmt_lokal_pemulihan: false,
      is_konsumsi_pmt_habis: false,
      is_vit_a_given: false,
      is_ikut_kelas_balita: false,
    },
    tbc: {
      has_batuk_2_minggu: false,
      has_demam_2_minggu: false,
      has_bb_tetap_atau_turun_2_bulan: false,
      has_lesu_malaise: false,
    },
  },
  balita: {
    pelayanan_kesehatan: {
      tempat_imunisasi: "puskesmas || rumah_sakit || klinik",
      is_mp_asi: false,
      is_pmt_lokal_pemulihan: false,
      is_konsumsi_pmt_habis: false,
      is_vit_a_given: false,
      is_obat_cacing_given: false,
      is_ikut_kelas_balita: false,
    },
    tbc: {
      has_batuk_2_minggu: false,
      has_demam_2_minggu: false,
      has_bb_tetap_atau_turun_2_bulan: false,
      has_lesu_malaise: false,
    },
  },
  apras: {
    pelayanan_kesehatan: {
      is_obat_cacing_given: false,
    },
    tbc: {
      has_batuk_2_minggu: false,
      has_demam_2_minggu: false,
      has_bb_tetap_atau_turun_2_bulan: false,
      has_lesu_malaise: false,
    },
  },
  uskrem_6_14: {
    pemeriksaan_6_bulanan: {
      tes_penglihatan_hitung_jari: {
        is_mata_kanan_normal: true,
        is_mata_kiri_normal: true,
      },
      tes_pendengaran_berbisik: {
        is_telinga_kanan_normal: true,
        is_telinga_kiri_normal: true,
      },
    },
    pemeriksaan_tahunan_remaja_putri: {
      is_skrining_jiwa: false,
      is_periksa_hb: false,
    },
    tbc: {
      has_batuk_2_minggu: false,
      has_demam_2_minggu: false,
      has_bb_tetap_atau_turun_2_bulan: false,
      has_lesu_malaise: false,
    },
  },
  uskrem_15_18: {
    pemeriksaan_6_bulanan: {
      tes_penglihatan_hitung_jari: {
        is_mata_kanan_normal: true,
        is_mata_kiri_normal: true,
      },
      tes_pendengaran_berbisik: {
        is_telinga_kanan_normal: true,
        is_telinga_kiri_normal: true,
      },
    },
    pemeriksaan_tahunan_remaja_putri: {
      is_skrining_jiwa: false,
      is_periksa_hb: false,
    },
    tbc: {
      has_batuk_2_minggu: false,
      has_demam_2_minggu: false,
      has_bb_tetap_atau_turun_2_bulan: false,
      has_lesu_malaise: false,
    },
  },
  dewasa: {
    kadar_gula_darah: 0,
    ploting_gula_darah: "normal",
    kadar_kolesterol: 0,
    ploting_kolesterol: "normal",
    is_menggunakan_kontrasepsi: false,
    tbc: {
      has_batuk_lebih_2_minggu: false,
      has_batuk_kurang_2_minggu: false,
      gejala_tambahan: {
        has_nafsu_makan_menurun: false,
        has_bb_menurun: false,
        has_lemah_letih_lesu: false,
        has_keringat_malam_tanpa_fisik: false,
        has_batuk_darah: false,
        has_sesak_nafas: false,
      },
    },
    pemeriksaan_6_bulanan: {
      tes_penglihatan_hitung_jari: {
        is_mata_kanan_normal: true,
        is_mata_kiri_normal: true,
      },
      tes_pendengaran_berbisik: {
        is_telinga_kanan_normal: true,
        is_telinga_kiri_normal: true,
      },
    },
    skrining_ppok_puma: {
      jenis_kelamin_skor: 0,
      usia_skor: 0,
      merokok_skor: 0,
      napas_pendek_skor: 0,
      dahak_paru_skor: 0,
      batuk_atau_spirometri_skor: 0,
      total_skor_puma: 0,
      status_risiko_puma: "risiko_rendah",
    },
    skrining_kesehatan_jiwa: {
      bulan_pemeriksaan: "",
      jawaban_skor: {
        kurang_bersemangat: 0,
        murung_tertekan_putus_asa: 0,
        gugup_cemas_gelisah: 0,
        sulit_kendalikan_khawatir: 0,
      },
      total_skor_jiwa: 0,
    },
  },
  lansia: {
    kadar_gula_darah: 0,
    ploting_gula_darah: "",
    kadar_kolesterol: 0,
    ploting_kolesterol: "",
    tbc: {
      has_batuk_lebih_2_minggu: false,
      has_batuk_kurang_2_minggu: false,
      gejala_tambahan: {
        has_nafsu_makan_menurun: false,
        has_bb_menurun: false,
        has_lemah_letih_lesu: false,
        has_keringat_malam_tanpa_fisik: false,
        has_batuk_darah: false,
        has_sesak_nafas: false,
      },
    },
    pemeriksaan_6_bulanan: {
      tes_penglihatan_hitung_jari: {
        is_mata_kanan_normal: true,
        is_mata_kiri_normal: true,
      },
      tes_pendengaran_berbisik: {
        is_telinga_kanan_normal: true,
        is_telinga_kiri_normal: true,
      },
    },
    aks_aktifitas_harian: {
      bab_skor: 0,
      bak_skor: 0,
      membersihkan_diri_skor: 0,
      penggunaan_wc_skor: 0,
      makan_minum_skor: 0,
      transfer_tempat_tidur_skor: 0,
      berjalan_tempat_rata_skor: 0,
      berpakaian_skor: 0,
      naik_turun_tangga_skor: 0,
      mandi_skor: 0,
      total_skor_aks: 0,
      status_aks: "ketergantungan_total",
      kode_aks: "T",
      is_rujukan_aks: true,
    },
    skilas: {
      kognitif_dan_mobilisasi: {
        has_kendala_orientasi_waktu_tempat: false,
        has_kendala_ulang_3_kata: false,
        has_keterbatasan_mobilisasi: false,
        has_kendala_tes_berdiri_kursi: false,
      },
      malnutrisi: {
        has_bb_turun_3kg_3_bulan: false,
        has_hilang_nafsu_makan: false,
        is_lila_kurang_21cm: false,
      },
      gangguan_penglihatan: {
        has_masalah_mata: false,
        has_kendala_tes_melihat: false,
      },
      gangguan_pendengaran: {
        has_kendala_tes_berbisik: false,
      },
      gejala_depresi: {
        has_sedih_tertekan_putus_asa: false,
        has_kurang_minat_kesenangan: false,
      },
      is_imunisasi_covid19: false,
    },
  },
};

const mergeWithSchema = (schema, input) => {
  if (Array.isArray(schema)) {
    return Array.isArray(input) ? [...input] : [...schema];
  }

  if (schema && typeof schema === "object") {
    const inputObject = input && typeof input === "object" && !Array.isArray(input) ? input : {};

    return Object.keys({ ...schema, ...inputObject }).reduce((result, key) => {
      result[key] = key in inputObject ? mergeWithSchema(schema[key], inputObject[key]) : mergeWithSchema(schema[key], undefined);
      return result;
    }, {});
  }

  return input === undefined ? schema : input;
};

const formatDetailSkrining = (kategoriSasaran, inputSkrining = {}, isTahunan = false) => {
  const schemaDefault = SKEMA_SKRINING[kategoriSasaran];

  if (!schemaDefault) return inputSkrining || {};

  const formatted = mergeWithSchema(schemaDefault, inputSkrining);

  if (["dewasa", "lansia"].includes(kategoriSasaran)) {
    formatted.is_skrining_tahunan = Boolean(isTahunan);

    if (!isTahunan) {
      delete formatted.skrining_tahunan;
    }
  }

  return formatted;
};

const validateDetailSkrining = (kategoriSasaran, inputSkrining) => {
  if (inputSkrining === undefined) return null;
  if (!inputSkrining || typeof inputSkrining !== "object" || Array.isArray(inputSkrining)) return "detail_skrining harus berupa objek JSON.";

  const schema = SKEMA_SKRINING[kategoriSasaran];
  if (!schema) return `Kategori screening tidak valid: ${kategoriSasaran}.`;

  const screeningInput = { ...inputSkrining };
  if (Object.prototype.hasOwnProperty.call(screeningInput, "is_skrining_tahunan")) {
    if (!["dewasa", "lansia"].includes(kategoriSasaran)) return "is_skrining_tahunan hanya berlaku untuk kategori dewasa atau lansia.";
    if (typeof screeningInput.is_skrining_tahunan !== "boolean") return "is_skrining_tahunan harus berupa boolean.";
    delete screeningInput.is_skrining_tahunan;
  }

  const validateNode = (nodeSchema, nodeInput, path) => {
    if (!nodeInput || typeof nodeInput !== "object" || Array.isArray(nodeInput)) return `${path} harus berupa objek JSON.`;

    for (const [key, value] of Object.entries(nodeInput)) {
      if (!Object.prototype.hasOwnProperty.call(nodeSchema, key)) return `${path}.${key} tidak dikenali.`;
      if (key === "status_risiko_puma" && !["risiko_rendah", "risiko_tinggi", "ambigu_skor_6"].includes(value)) return `${path}.${key} tidak valid.`;
      if (key === "status_aks" && !["mandiri", "ketergantungan_ringan", "ketergantungan_sedang", "ketergantungan_berat", "ketergantungan_total"].includes(value)) return `${path}.${key} tidak valid.`;
      if (["is_rujukan_aks"].includes(key) && typeof value !== "boolean") return `${path}.${key} memiliki tipe data tidak valid.`;
      if (key === "kode_aks" && !["M", "R", "S", "B", "T"].includes(value)) return `${path}.${key} tidak valid.`;
      const expected = nodeSchema[key];
      if (expected && typeof expected === "object") {
        const nestedError = validateNode(expected, value, `${path}.${key}`);
        if (nestedError) return nestedError;
      } else if (typeof expected !== typeof value || (typeof value === "number" && !Number.isFinite(value))) {
        return `${path}.${key} memiliki tipe data tidak valid.`;
      }
    }
    return null;
  };

  return validateNode(schema, screeningInput, "detail_skrining");
};

module.exports = {
  SKEMA_SKRINING,
  formatDetailSkrining,
  validateDetailSkrining,
};
