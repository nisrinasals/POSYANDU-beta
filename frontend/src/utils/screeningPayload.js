const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key) && obj[key] !== "" && obj[key] !== null && obj[key] !== undefined;
const bool = (value) => value === true || value === 1 || value === "1" || ["ya", "sudah", "true"].includes(String(value).toLowerCase());
const isNormalFinding = (value) => (typeof value === "string" ? value.trim().toLowerCase() === "normal" : bool(value));
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};
const numFromStatus = (value) => {
  const normalized = String(value).trim().toLowerCase();
  if (["sudah", "ya", "true"].includes(normalized)) return 1;
  if (["belum", "tidak", "false"].includes(normalized)) return 0;
  return num(value);
};
const set = (obj, key, value) => {
  if (value !== undefined) obj[key] = value;
};

function addTbc(target, form, category) {
  const tbc = {};
  const batuk = form.batukBesarTbc ?? form.batukTbc;
  if (has(form, "batukBesarTbc") || has(form, "batukTbc")) {
    if (category === "dewasa" || category === "lansia") {
      set(tbc, "has_batuk_lebih_2_minggu", bool(batuk));
      if (has(form, "batukTbc")) set(tbc, "has_batuk_kurang_2_minggu", bool(form.batukTbc));
    } else if (category === "bumil" || category === "busui") {
      set(tbc, "has_batuk_menerus", bool(batuk));
    } else {
      set(tbc, "has_batuk_2_minggu", bool(batuk));
    }
  }
  if (has(form, "demamTbc")) set(tbc, "has_demam_2_minggu", bool(form.demamTbc));
  if (has(form, "bbTurunTbc")) set(tbc, "has_bb_tetap_atau_turun_2_bulan", bool(form.bbTurunTbc));
  if (has(form, "kontakTbc")) set(tbc, "has_kontak_pasien_tbc", bool(form.kontakTbc));
  if (has(form, "lesuTbc")) set(tbc, "has_lesu_malaise", bool(form.lesuTbc));
  if (category === "dewasa" || category === "lansia") {
    const gejala = {};
    if (has(form, "nafsuMakanTbc")) set(gejala, "has_nafsu_makan_menurun", bool(form.nafsuMakanTbc));
    if (has(form, "bbMenurunTbc")) set(gejala, "has_bb_menurun", bool(form.bbMenurunTbc));
    if (has(form, "lemahLesuTbc")) set(gejala, "has_lemah_letih_lesu", bool(form.lemahLesuTbc));
    if (has(form, "berkeringatMalamTbc")) set(gejala, "has_keringat_malam_tanpa_fisik", bool(form.berkeringatMalamTbc));
    if (has(form, "batukDarahTbc")) set(gejala, "has_batuk_darah", bool(form.batukDarahTbc));
    if (has(form, "sesakNafasTbc")) set(gejala, "has_sesak_nafas", bool(form.sesakNafasTbc));
    if (Object.keys(gejala).length) tbc.gejala_tambahan = gejala;
  }
  if (Object.keys(tbc).length) target.tbc = tbc;
}

function addPemeriksaan6Bulanan(target, form) {
  if (form.isSkrining6Bulanan !== true) return;
  const penglihatan = {};
  const pendengaran = {};
  if (has(form, "mataKanan")) set(penglihatan, "is_mata_kanan_normal", isNormalFinding(form.mataKanan));
  if (has(form, "mataKiri")) set(penglihatan, "is_mata_kiri_normal", isNormalFinding(form.mataKiri));
  if (has(form, "telingaKanan")) set(pendengaran, "is_telinga_kanan_normal", isNormalFinding(form.telingaKanan));
  if (has(form, "telingaKiri")) set(pendengaran, "is_telinga_kiri_normal", isNormalFinding(form.telingaKiri));
  if (Object.keys(penglihatan).length || Object.keys(pendengaran).length) {
    target.pemeriksaan_6_bulanan = {};
    if (Object.keys(penglihatan).length) target.pemeriksaan_6_bulanan.tes_penglihatan_hitung_jari = penglihatan;
    if (Object.keys(pendengaran).length) target.pemeriksaan_6_bulanan.tes_pendengaran_berbisik = pendengaran;
  }
}

function addJiwa(target, form) {
  const jawaban_skor = {};
  if (has(form, "jiwaQ1")) set(jawaban_skor, "kurang_bersemangat", num(form.jiwaQ1));
  if (has(form, "jiwaQ2")) set(jawaban_skor, "murung_tertekan_putus_asa", num(form.jiwaQ2));
  if (has(form, "jiwaQ3")) set(jawaban_skor, "gugup_cemas_gelisah", num(form.jiwaQ3));
  if (has(form, "jiwaQ4")) set(jawaban_skor, "sulit_kendalikan_khawatir", num(form.jiwaQ4));
  if (Object.keys(jawaban_skor).length) {
    target.skrining_kesehatan_jiwa = {
      bulan_pemeriksaan: form.jiwaBulan || "",
      jawaban_skor,
    };
  }
}

function addAks(target, form) {
  const map = {
    aksBab: "bab_skor",
    aksBak: "bak_skor",
    aksCuciMuka: "membersihkan_diri_skor",
    aksWc: "penggunaan_wc_skor",
    aksMakan: "makan_minum_skor",
    aksPindah: "transfer_tempat_tidur_skor",
    aksJalan: "berjalan_tempat_rata_skor",
    aksPakaian: "berpakaian_skor",
    aksTangga: "naik_turun_tangga_skor",
    aksMandi: "mandi_skor",
  };
  const aks = {};
  Object.entries(map).forEach(([source, key]) => {
    if (has(form, source)) set(aks, key, num(form[source]));
  });
  if (Object.keys(aks).length) target.aks_aktifitas_harian = aks;
}

function addSkilas(target, form) {
  const sections = {
    kognitif_dan_mobilisasi: {
      skilasOrientasi: "has_kendala_orientasi_waktu_tempat",
      skilasUlangKata: "has_kendala_ulang_3_kata",
      skilasMobilisasi: "has_keterbatasan_mobilisasi",
      skilasTesKursi: "has_kendala_tes_berdiri_kursi",
    },
    malnutrisi: {
      skilasBbTurun: "has_bb_turun_3kg_3_bulan",
      skilasNafsuMakan: "has_hilang_nafsu_makan",
      skilasLilaKurang: "is_lila_kurang_21cm",
    },
    gangguan_penglihatan: {
      skilasMasalahMata: "has_masalah_mata",
      skilasTesLihat: "has_kendala_tes_melihat",
    },
    gangguan_pendengaran: { skilasTesBisik: "has_kendala_tes_berbisik" },
    gejala_depresi: {
      skilasPerasaanSedih: "has_sedih_tertekan_putus_asa",
      skilasHilangMinat: "has_kurang_minat_kesenangan",
    },
  };
  const result = {};
  Object.entries(sections).forEach(([section, mappings]) => {
    const node = {};
    Object.entries(mappings).forEach(([source, key]) => {
      if (has(form, source)) {
        const isNormalResponse = ["skilasOrientasi", "skilasUlangKata", "skilasTesKursi", "skilasTesLihat", "skilasTesBisik"].includes(source);
        set(node, key, isNormalResponse ? !bool(form[source]) : bool(form[source]));
      }
    });
    if (Object.keys(node).length) result[section] = node;
  });
  if (has(form, "skilasImunisasiCovid")) set(result, "is_imunisasi_covid19", bool(form.skilasImunisasiCovid));
  if (Object.keys(result).length) target.skilas = result;
}

export function mapFlatScreeningToBackend(category, form = {}) {
  const result = {};
  addTbc(result, form, category);

  if (["bayi", "balita"].includes(category)) {
    const pelayanan_kesehatan = {};
    if (has(form, "asiEksklusif")) set(pelayanan_kesehatan, "is_asi_eksklusif", bool(form.asiEksklusif));
    if (has(form, "mpAsi")) set(pelayanan_kesehatan, category === "bayi" ? "is_mpasi" : "is_mp_asi", bool(form.mpAsi));
    if (has(form, "pmtPemulihan")) set(pelayanan_kesehatan, "is_pmt_lokal_pemulihan", bool(form.pmtPemulihan));
    if (has(form, "pmtHabis")) set(pelayanan_kesehatan, "is_konsumsi_pmt_habis", bool(form.pmtHabis));
    if (has(form, "vitA")) set(pelayanan_kesehatan, "is_vit_a_given", bool(form.vitA));
    if (category === "bayi" && has(form, "ikutKelasBalita")) set(pelayanan_kesehatan, "is_ikut_kelas_balita", bool(form.ikutKelasBalita));
    if (category === "balita") {
      if (has(form, "obatCacing")) set(pelayanan_kesehatan, "is_obat_cacing_given", bool(form.obatCacing));
      if (has(form, "ikutKelasBalita")) set(pelayanan_kesehatan, "is_ikut_kelas_balita", bool(form.ikutKelasBalita));
    }
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (category === "bumil") {
    const pelayanan_kesehatan = {};
    const ttdVal = has(form, "jumlahTtd") ? form.jumlahTtd : has(form, "pemberianTtd") ? form.pemberianTtd : undefined;
    if (ttdVal !== undefined) {
      set(pelayanan_kesehatan, "jumlah_ttd_given", numFromStatus(ttdVal));
    }
    if (has(form, "rutinTtd")) set(pelayanan_kesehatan, "is_rutin_ttd", bool(form.rutinTtd));
    if (has(form, "komposisiMtBumil")) set(pelayanan_kesehatan, "komposisi_mt_kek", form.komposisiMtBumil);
    if (has(form, "rutinMtBumil")) set(pelayanan_kesehatan, "is_rutin_mt_kek", bool(form.rutinMtBumil));
    if (has(form, "komposisiMtBumil") || has(form, "rutinMtBumil")) set(pelayanan_kesehatan, "is_mt_kek_given", true);
    if (has(form, "jumlahVitA")) set(pelayanan_kesehatan, "jumlah_m_kek", num(form.jumlahVitA));
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (category === "busui") {
    const pelayanan_kesehatan = {};
    const vitAVal = has(form, "jumlahVitA") ? form.jumlahVitA : has(form, "vitA") ? form.vitA : undefined;
    if (vitAVal !== undefined) {
      set(pelayanan_kesehatan, "is_vit_a_given", bool(vitAVal));
      set(pelayanan_kesehatan, "jumlah_kapsul_vit_a", numFromStatus(vitAVal));
    }
    if (has(form, "rutinVitA")) set(pelayanan_kesehatan, "is_rutin_vit_a", bool(form.rutinVitA));
    if (has(form, "menyusui")) set(pelayanan_kesehatan, "is_menyusui", bool(form.menyusui));
    if (has(form, "kbPascaPersalinan")) set(pelayanan_kesehatan, "is_kb_pasca_persalinan", bool(form.kbPascaPersalinan));
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (category === "apras") {
    const pelayanan_kesehatan = {};
    if (has(form, "obatCacing")) set(pelayanan_kesehatan, "is_obat_cacing_given", bool(form.obatCacing));
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (["uskrem_6_14", "uskrem_15_18"].includes(category)) {
    addPemeriksaan6Bulanan(result, form);
    const tahunan = {};
    if (has(form, "skriningJiwa")) set(tahunan, "is_skrining_jiwa", bool(form.skriningJiwa));
    if (has(form, "periksaHb")) set(tahunan, "is_periksa_hb", bool(form.periksaHb));
    if (Object.keys(tahunan).length) result.pemeriksaan_tahunan_remaja_putri = tahunan;
    if (has(form, "jiwaQ1") || has(form, "jiwaQ2") || has(form, "jiwaQ3") || has(form, "jiwaQ4")) addJiwa(result, form);
  }

  if (["dewasa", "lansia"].includes(category)) {
    addPemeriksaan6Bulanan(result, form);
    if (has(form, "kolesterol")) {
      set(result, "kadar_kolesterol", num(form.kolesterol));
      if (has(form, "kolesterol")) set(result, "ploting_kolesterol", "");
    }
    if (has(form, "skriningPtm")) set(result, "kadar_gula_darah", num(form.skriningPtm));
    if (has(form, "alatKontrasepsi")) set(result, "is_menggunakan_kontrasepsi", bool(form.alatKontrasepsi));

    const puma = {};
    if (has(form, "pumaMerokok")) set(puma, "merokok_skor", num(form.pumaMerokok));
    if (has(form, "pumaNapasPendek")) set(puma, "napas_pendek_skor", bool(form.pumaNapasPendek) ? 1 : 0);
    if (has(form, "pumaDahak")) set(puma, "dahak_paru_skor", bool(form.pumaDahak) ? 1 : 0);
    if (has(form, "pumaBatukFlu")) set(puma, "batuk_atau_spirometri_skor", bool(form.pumaBatukFlu) ? 1 : 0);
    if (Object.keys(puma).length) result.skrining_ppok_puma = puma;

    if (category === "lansia") {
      addAks(result, form);
      addSkilas(result, form);
    }
    if (has(form, "jiwaQ1") || has(form, "jiwaQ2") || has(form, "jiwaQ3") || has(form, "jiwaQ4")) addJiwa(result, form);
  }

  return result;
}

export function unflattenScreeningFromBackend(category, detail = {}) {
  if (!detail || typeof detail !== "object") return {};
  const form = {};
  const tbc = detail.tbc || {};
  const pk = detail.pelayanan_kesehatan || {};

  // TBC Gejala (Child / Bumil / Umum)
  if (tbc.has_batuk_menerus !== undefined) form.batukTbc = tbc.has_batuk_menerus ? "Ya" : "Tidak";
  if (tbc.has_batuk_2_minggu !== undefined) form.batukTbc = tbc.has_batuk_2_minggu ? "Ya" : "Tidak";
  if (tbc.has_batuk_lebih_2_minggu !== undefined) form.batukBesarTbc = tbc.has_batuk_lebih_2_minggu ? "Ya" : "Tidak";
  if (tbc.has_batuk_kurang_2_minggu !== undefined) form.batukTbc = tbc.has_batuk_kurang_2_minggu ? "Ya" : "Tidak";
  if (tbc.has_demam_2_minggu !== undefined) form.demamTbc = tbc.has_demam_2_minggu ? "Ya" : "Tidak";
  if (tbc.has_bb_tetap_atau_turun_2_bulan !== undefined) form.bbTurunTbc = tbc.has_bb_tetap_atau_turun_2_bulan ? "Ya" : "Tidak";
  if (tbc.has_kontak_pasien_tbc !== undefined) form.kontakTbc = tbc.has_kontak_pasien_tbc ? "Ya" : "Tidak";
  if (tbc.has_lesu_malaise !== undefined) form.lesuTbc = tbc.has_lesu_malaise ? "Ya" : "Tidak";

  // Gejala Tambahan TBC Dewasa/Lansia
  const gt = tbc.gejala_tambahan || {};
  if (gt.has_nafsu_makan_menurun !== undefined) form.nafsuMakanTbc = gt.has_nafsu_makan_menurun ? "Ya" : "Tidak";
  if (gt.has_bb_menurun !== undefined) form.bbMenurunTbc = gt.has_bb_menurun ? "Ya" : "Tidak";
  if (gt.has_lemah_letih_lesu !== undefined) form.lemahLesuTbc = gt.has_lemah_letih_lesu ? "Ya" : "Tidak";
  if (gt.has_keringat_malam_tanpa_fisik !== undefined) form.berkeringatMalamTbc = gt.has_keringat_malam_tanpa_fisik ? "Ya" : "Tidak";
  if (gt.has_batuk_darah !== undefined) form.batukDarahTbc = gt.has_batuk_darah ? "Ya" : "Tidak";
  if (gt.has_sesak_nafas !== undefined) form.sesakNafasTbc = gt.has_sesak_nafas ? "Ya" : "Tidak";

  // Bumil
  if (category === "bumil") {
    if (pk.jumlah_ttd_given !== undefined) {
      form.jumlahTtd = String(pk.jumlah_ttd_given);
      form.pemberianTtd = Number(pk.jumlah_ttd_given) >= 1 ? "Sudah" : "Belum";
    }
    if (pk.is_rutin_ttd !== undefined) form.rutinTtd = pk.is_rutin_ttd ? "Ya" : "Tidak";
    if (pk.komposisi_mt_kek !== undefined) form.komposisiMtBumil = pk.komposisi_mt_kek;
    if (pk.is_rutin_mt_kek !== undefined) form.rutinMtBumil = pk.is_rutin_mt_kek ? "Ya" : "Tidak";
  }

  // Busui / Nifas
  if (category === "busui" || category === "nifas") {
    if (pk.is_vit_a_given !== undefined || pk.jumlah_kapsul_vit_a !== undefined) {
      form.jumlahVitA = (pk.is_vit_a_given || pk.jumlah_kapsul_vit_a >= 1) ? "Sudah" : "Belum";
    }
    if (pk.is_rutin_vit_a !== undefined) form.rutinVitA = pk.is_rutin_vit_a ? "Ya" : "Tidak";
    if (pk.is_menyusui !== undefined) form.menyusui = pk.is_menyusui ? "Ya" : "Tidak";
    if (pk.is_kb_pasca_persalinan !== undefined) form.kbPascaPersalinan = pk.is_kb_pasca_persalinan ? "Ya" : "Tidak";
  }

  // Bayi & Balita
  if (category === "bayi" || category === "balita") {
    if (pk.is_asi_eksklusif !== undefined) form.asiEksklusif = pk.is_asi_eksklusif ? "Ya" : "Tidak";
    if (pk.is_mpasi !== undefined || pk.is_mp_asi !== undefined) form.mpAsi = (pk.is_mpasi || pk.is_mp_asi) ? "Ya" : "Tidak";
    if (pk.is_pmt_lokal_pemulihan !== undefined) form.pmtPemulihan = pk.is_pmt_lokal_pemulihan ? "Ya" : "Tidak";
    if (pk.is_konsumsi_pmt_habis !== undefined) form.pmtHabis = pk.is_konsumsi_pmt_habis ? "Ya" : "Tidak";
    if (pk.is_vit_a_given !== undefined) form.vitA = pk.is_vit_a_given ? "Ya" : "Tidak";
    if (pk.is_obat_cacing_given !== undefined) form.obatCacing = pk.is_obat_cacing_given ? "Ya" : "Tidak";
    if (pk.is_ikut_kelas_balita !== undefined) form.ikutKelasBalita = pk.is_ikut_kelas_balita ? "Ya" : "Tidak";
  }

  // Apras
  if (category === "apras") {
    if (pk.is_obat_cacing_given !== undefined) form.obatCacing = pk.is_obat_cacing_given ? "Ya" : "Tidak";
  }

  // 6 Bulanan (Dewasa, Lansia, Remaja)
  const sem = detail.pemeriksaan_6_bulanan || {};
  if (sem.tes_penglihatan_hitung_jari) {
    if (sem.tes_penglihatan_hitung_jari.is_mata_kanan_normal !== undefined) form.mataKanan = sem.tes_penglihatan_hitung_jari.is_mata_kanan_normal ? "Normal" : "Gangguan";
    if (sem.tes_penglihatan_hitung_jari.is_mata_kiri_normal !== undefined) form.mataKiri = sem.tes_penglihatan_hitung_jari.is_mata_kiri_normal ? "Normal" : "Gangguan";
  }
  if (sem.tes_pendengaran_berbisik) {
    if (sem.tes_pendengaran_berbisik.is_telinga_kanan_normal !== undefined) form.telingaKanan = sem.tes_pendengaran_berbisik.is_telinga_kanan_normal ? "Normal" : "Gangguan";
    if (sem.tes_pendengaran_berbisik.is_telinga_kiri_normal !== undefined) form.telingaKiri = sem.tes_pendengaran_berbisik.is_telinga_kiri_normal ? "Normal" : "Gangguan";
  }

  // Remaja Tahunan
  const rem = detail.pemeriksaan_tahunan_remaja_putri || {};
  if (rem.is_skrining_jiwa !== undefined) form.skriningJiwa = rem.is_skrining_jiwa ? "Ya" : "Tidak";
  if (rem.is_periksa_hb !== undefined) form.periksaHb = rem.is_periksa_hb ? "Ya" : "Tidak";

  // Dewasa & Lansia PTM
  if (detail.kadar_kolesterol !== undefined) form.kolesterol = String(detail.kadar_kolesterol);
  if (detail.kadar_gula_darah !== undefined) form.skriningPtm = String(detail.kadar_gula_darah);
  if (detail.is_menggunakan_kontrasepsi !== undefined) form.alatKontrasepsi = detail.is_menggunakan_kontrasepsi ? "Ya" : "Tidak";

  // PUMA
  const puma = detail.skrining_ppok_puma || {};
  if (puma.merokok_skor !== undefined) form.pumaMerokok = puma.merokok_skor;
  if (puma.napas_pendek_skor !== undefined) form.pumaNapasPendek = puma.napas_pendek_skor === 1 ? "Ya" : "Tidak";
  if (puma.dahak_paru_skor !== undefined) form.pumaDahak = puma.dahak_paru_skor === 1 ? "Ya" : "Tidak";
  if (puma.batuk_atau_spirometri_skor !== undefined) form.pumaBatukFlu = puma.batuk_atau_spirometri_skor === 1 ? "Ya" : "Tidak";

  // AKS Lansia
  const aks = detail.aks_aktifitas_harian || {};
  if (aks.bab_skor !== undefined) form.aksBab = aks.bab_skor;
  if (aks.bak_skor !== undefined) form.aksBak = aks.bak_skor;
  if (aks.membersihkan_diri_skor !== undefined) form.aksCuciMuka = aks.membersihkan_diri_skor;
  if (aks.penggunaan_wc_skor !== undefined) form.aksWc = aks.penggunaan_wc_skor;
  if (aks.makan_minum_skor !== undefined) form.aksMakan = aks.makan_minum_skor;
  if (aks.transfer_tempat_tidur_skor !== undefined) form.aksPindah = aks.transfer_tempat_tidur_skor;
  if (aks.berjalan_tempat_rata_skor !== undefined) form.aksJalan = aks.berjalan_tempat_rata_skor;
  if (aks.berpakaian_skor !== undefined) form.aksPakaian = aks.berpakaian_skor;
  if (aks.naik_turun_tangga_skor !== undefined) form.aksTangga = aks.naik_turun_tangga_skor;
  if (aks.mandi_skor !== undefined) form.aksMandi = aks.mandi_skor;

  // SKILAS Lansia
  const sk = detail.skilas || {};
  if (sk.has_kendala_orientasi_waktu_tempat !== undefined) form.skilasOrientasi = sk.has_kendala_orientasi_waktu_tempat ? "Ya" : "Tidak";
  if (sk.has_kendala_ulang_3_kata !== undefined) form.skilasUlangKata = sk.has_kendala_ulang_3_kata ? "Ya" : "Tidak";
  if (sk.has_keterbatasan_mobilisasi !== undefined) form.skilasMobilisasi = sk.has_keterbatasan_mobilisasi ? "Ya" : "Tidak";
  if (sk.has_kendala_tes_berdiri_kursi !== undefined) form.skilasTesKursi = sk.has_kendala_tes_berdiri_kursi ? "Ya" : "Tidak";
  if (sk.has_bb_turun_3kg_3_bulan !== undefined) form.skilasBbTurun = sk.has_bb_turun_3kg_3_bulan ? "Ya" : "Tidak";
  if (sk.has_hilang_nafsu_makan !== undefined) form.skilasNafsuMakan = sk.has_hilang_nafsu_makan ? "Ya" : "Tidak";
  if (sk.is_lila_kurang_21cm !== undefined) form.skilasLilaKurang = sk.is_lila_kurang_21cm ? "Ya" : "Tidak";
  if (sk.has_masalah_mata !== undefined) form.skilasMasalahMata = sk.has_masalah_mata ? "Ya" : "Tidak";
  if (sk.has_kendala_tes_melihat !== undefined) form.skilasTesLihat = sk.has_kendala_tes_melihat ? "Ya" : "Tidak";
  if (sk.has_kendala_tes_berbisik !== undefined) form.skilasTesBisik = sk.has_kendala_tes_berbisik ? "Ya" : "Tidak";
  if (sk.has_sedih_tertekan_putus_asa !== undefined) form.skilasPerasaanSedih = sk.has_sedih_tertekan_putus_asa ? "Ya" : "Tidak";
  if (sk.has_kurang_minat_kesenangan !== undefined) form.skilasHilangMinat = sk.has_kurang_minat_kesenangan ? "Ya" : "Tidak";
  if (sk.is_imunisasi_covid19 !== undefined) form.skilasImunisasiCovid = sk.is_imunisasi_covid19 ? "Ya" : "Tidak";

  // Skrining Jiwa PHQ-4
  const jiwa = detail.skrining_jiwa || {};
  if (jiwa.kurang_bersemangat !== undefined) form.jiwaQ1 = jiwa.kurang_bersemangat;
  if (jiwa.murung_tertekan_putus_asa !== undefined) form.jiwaQ2 = jiwa.murung_tertekan_putus_asa;
  if (jiwa.gugup_cemas_gelisah !== undefined) form.jiwaQ3 = jiwa.gugup_cemas_gelisah;
  if (jiwa.sulit_kendalikan_khawatir !== undefined) form.jiwaQ4 = jiwa.sulit_kendalikan_khawatir;
  if (jiwa.bulan_pemeriksaan !== undefined) form.bulanSkriningJiwa = jiwa.bulan_pemeriksaan;

  return form;
}
