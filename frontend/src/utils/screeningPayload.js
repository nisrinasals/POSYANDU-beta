const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key) && obj[key] !== '' && obj[key] !== null && obj[key] !== undefined;
const bool = (value) => value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'ya' || String(value).toLowerCase() === 'true';
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};
const set = (obj, key, value) => {
  if (value !== undefined) obj[key] = value;
};

function addTbc(target, form, category) {
  const tbc = {};
  const batuk = form.batukBesarTbc ?? form.batukTbc;
  if (has(form, 'batukBesarTbc') || has(form, 'batukTbc')) {
    if (category === 'dewasa' || category === 'lansia') {
      set(tbc, 'has_batuk_lebih_2_minggu', bool(batuk));
      if (has(form, 'batukTbc')) set(tbc, 'has_batuk_kurang_2_minggu', bool(form.batukTbc));
    } else if (category === 'bumil' || category === 'busui') {
      set(tbc, 'has_batuk_menerus', bool(batuk));
    } else {
      set(tbc, 'has_batuk_2_minggu', bool(batuk));
    }
  }
  if (has(form, 'demamTbc')) set(tbc, 'has_demam_2_minggu', bool(form.demamTbc));
  if (has(form, 'bbTurunTbc')) set(tbc, 'has_bb_tetap_atau_turun_2_bulan', bool(form.bbTurunTbc));
  if (has(form, 'kontakTbc')) set(tbc, 'has_kontak_pasien_tbc', bool(form.kontakTbc));
  if (has(form, 'lesuTbc')) set(tbc, 'has_lesu_malaise', bool(form.lesuTbc));
  if (category === 'dewasa' || category === 'lansia') {
    const gejala = {};
    if (has(form, 'nafsuMakanTbc')) set(gejala, 'has_nafsu_makan_menurun', bool(form.nafsuMakanTbc));
    if (has(form, 'bbMenurunTbc')) set(gejala, 'has_bb_menurun', bool(form.bbMenurunTbc));
    if (has(form, 'lemahLesuTbc')) set(gejala, 'has_lemah_letih_lesu', bool(form.lemahLesuTbc));
    if (has(form, 'berkeringatMalamTbc')) set(gejala, 'has_keringat_malam_tanpa_fisik', bool(form.berkeringatMalamTbc));
    if (has(form, 'batukDarahTbc')) set(gejala, 'has_batuk_darah', bool(form.batukDarahTbc));
    if (has(form, 'sesakNafasTbc')) set(gejala, 'has_sesak_nafas', bool(form.sesakNafasTbc));
    if (Object.keys(gejala).length) tbc.gejala_tambahan = gejala;
  }
  if (Object.keys(tbc).length) target.tbc = tbc;
}

function addPemeriksaan6Bulanan(target, form) {
  const penglihatan = {};
  const pendengaran = {};
  if (has(form, 'mataKanan')) set(penglihatan, 'is_mata_kanan_normal', bool(form.mataKanan));
  if (has(form, 'mataKiri')) set(penglihatan, 'is_mata_kiri_normal', bool(form.mataKiri));
  if (has(form, 'telingaKanan')) set(pendengaran, 'is_telinga_kanan_normal', bool(form.telingaKanan));
  if (has(form, 'telingaKiri')) set(pendengaran, 'is_telinga_kiri_normal', bool(form.telingaKiri));
  if (Object.keys(penglihatan).length || Object.keys(pendengaran).length) {
    target.pemeriksaan_6_bulanan = {};
    if (Object.keys(penglihatan).length) target.pemeriksaan_6_bulanan.tes_penglihatan_hitung_jari = penglihatan;
    if (Object.keys(pendengaran).length) target.pemeriksaan_6_bulanan.tes_pendengaran_berbisik = pendengaran;
  }
}

function addJiwa(target, form) {
  const jawaban_skor = {};
  if (has(form, 'jiwaQ1')) set(jawaban_skor, 'kurang_bersemangat', num(form.jiwaQ1));
  if (has(form, 'jiwaQ2')) set(jawaban_skor, 'murung_tertekan_putus_asa', num(form.jiwaQ2));
  if (has(form, 'jiwaQ3')) set(jawaban_skor, 'gugup_cemas_gelisah', num(form.jiwaQ3));
  if (has(form, 'jiwaQ4')) set(jawaban_skor, 'sulit_kendalikan_khawatir', num(form.jiwaQ4));
  if (Object.keys(jawaban_skor).length) {
    target.skrining_kesehatan_jiwa = {
      bulan_pemeriksaan: form.jiwaBulan || '',
      jawaban_skor,
    };
  }
}

function addAks(target, form) {
  const map = {
    aksBab: 'bab_skor', aksBak: 'bak_skor', aksCuciMuka: 'membersihkan_diri_skor', aksWc: 'penggunaan_wc_skor',
    aksMakan: 'makan_minum_skor', aksPindah: 'transfer_tempat_tidur_skor', aksJalan: 'berjalan_tempat_rata_skor',
    aksPakaian: 'berpakaian_skor', aksTangga: 'naik_turun_tangga_skor', aksMandi: 'mandi_skor'
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
      skilasOrientasi: 'has_kendala_orientasi_waktu_tempat',
      skilasUlangKata: 'has_kendala_ulang_3_kata',
      skilasTesKursi: 'has_kendala_tes_berdiri_kursi',
    },
    malnutrisi: {
      skilasBbTurun: 'has_bb_turun_3kg_3_bulan',
      skilasNafsuMakan: 'has_hilang_nafsu_makan',
      skilasLilaKurang: 'is_lila_kurang_21cm',
    },
    gangguan_penglihatan: {
      skilasMasalahMata: 'has_masalah_mata',
      skilasTesLihat: 'has_kendala_tes_melihat',
    },
    gangguan_pendengaran: { skilasTesBisik: 'has_kendala_tes_berbisik' },
    gejala_depresi: {
      skilasPerasaanSedih: 'has_sedih_tertekan_putus_asa',
      skilasHilangMinat: 'has_kurang_minat_kesenangan',
    },
  };
  const result = {};
  Object.entries(sections).forEach(([section, mappings]) => {
    const node = {};
    Object.entries(mappings).forEach(([source, key]) => {
      if (has(form, source)) set(node, key, bool(form[source]));
    });
    if (Object.keys(node).length) result[section] = node;
  });
  if (has(form, 'skilasImunisasiCovid')) set(result, 'is_imunisasi_covid19', bool(form.skilasImunisasiCovid));
  if (Object.keys(result).length) target.skilas = result;
}

export function mapFlatScreeningToBackend(category, form = {}) {
  const result = {};
  addTbc(result, form, category);

  if (['bayi', 'balita'].includes(category)) {
    const pelayanan_kesehatan = {};
    if (has(form, 'tempatImunisasi')) set(pelayanan_kesehatan, 'tempat_imunisasi', form.tempatImunisasi);
    if (has(form, 'asiEksklusif')) set(pelayanan_kesehatan, 'is_asi_eksklusif', bool(form.asiEksklusif));
    if (has(form, 'mpAsi')) set(pelayanan_kesehatan, category === 'bayi' ? 'is_mpasi' : 'is_mp_asi', bool(form.mpAsi));
    if (has(form, 'pmtPemulihan')) set(pelayanan_kesehatan, 'is_pmt_lokal_pemulihan', bool(form.pmtPemulihan));
    if (has(form, 'pmtHabis')) set(pelayanan_kesehatan, 'is_konsumsi_pmt_habis', bool(form.pmtHabis));
    if (has(form, 'vitA')) set(pelayanan_kesehatan, 'is_vit_a_given', bool(form.vitA));
    if (category === 'bayi' && has(form, 'ikutKelasBalita')) set(pelayanan_kesehatan, 'is_ikut_kelas_balita', bool(form.ikutKelasBalita));
    if (category === 'balita') {
      if (has(form, 'obatCacing')) set(pelayanan_kesehatan, 'is_obat_cacing_given', bool(form.obatCacing));
      if (has(form, 'ikutKelasBalita')) set(pelayanan_kesehatan, 'is_ikut_kelas_balita', bool(form.ikutKelasBalita));
    }
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (category === 'bumil') {
    const pelayanan_kesehatan = {};
    if (has(form, 'jumlahTtd')) set(pelayanan_kesehatan, 'jumlah_ttd_given', num(form.jumlahTtd));
    if (has(form, 'rutinTtd')) set(pelayanan_kesehatan, 'is_rutin_ttd', bool(form.rutinTtd));
    if (has(form, 'pemberianTtd') && !has(form, 'jumlahTtd')) set(pelayanan_kesehatan, 'jumlah_ttd_given', num(form.pemberianTtd));
    if (has(form, 'komposisiMtBumil')) set(pelayanan_kesehatan, 'komposisi_mt_kek', form.komposisiMtBumil);
    if (has(form, 'rutinMtBumil')) set(pelayanan_kesehatan, 'is_rutin_mt_kek', bool(form.rutinMtBumil));
    if (has(form, 'komposisiMtBumil') || has(form, 'rutinMtBumil')) set(pelayanan_kesehatan, 'is_mt_kek_given', true);
    if (has(form, 'jumlahVitA')) set(pelayanan_kesehatan, 'jumlah_m_kek', num(form.jumlahVitA));
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (category === 'busui') {
    const pelayanan_kesehatan = {};
    if (has(form, 'jumlahVitA')) set(pelayanan_kesehatan, 'jumlah_kapsul_vit_a', num(form.jumlahVitA));
    if (has(form, 'rutinVitA')) set(pelayanan_kesehatan, 'is_rutin_vit_a', bool(form.rutinVitA));
    if (has(form, 'menyusui')) set(pelayanan_kesehatan, 'is_menyusui', bool(form.menyusui));
    if (has(form, 'kbPascaPersalinan')) set(pelayanan_kesehatan, 'is_kb_pasca_persalinan', bool(form.kbPascaPersalinan));
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (category === 'apras') {
    const pelayanan_kesehatan = {};
    if (has(form, 'obatCacing')) set(pelayanan_kesehatan, 'is_obat_cacing_given', bool(form.obatCacing));
    if (Object.keys(pelayanan_kesehatan).length) result.pelayanan_kesehatan = pelayanan_kesehatan;
  }

  if (['uskrem_6_14', 'uskrem_15_18'].includes(category)) {
    addPemeriksaan6Bulanan(result, form);
    const tahunan = {};
    if (has(form, 'skriningJiwa')) set(tahunan, 'is_skrining_jiwa', bool(form.skriningJiwa));
    if (has(form, 'periksaHb')) set(tahunan, 'is_periksa_hb', bool(form.periksaHb));
    if (Object.keys(tahunan).length) result.pemeriksaan_tahunan_remaja_putri = tahunan;
    if (has(form, 'jiwaQ1') || has(form, 'jiwaQ2') || has(form, 'jiwaQ3') || has(form, 'jiwaQ4')) addJiwa(result, form);
  }

  if (['dewasa', 'lansia'].includes(category)) {
    addPemeriksaan6Bulanan(result, form);
    if (has(form, 'kolesterol')) {
      set(result, 'kadar_kolesterol', num(form.kolesterol));
      if (has(form, 'kolesterol')) set(result, 'ploting_kolesterol', '');
    }
    if (has(form, 'skriningPtm')) set(result, 'kadar_gula_darah', num(form.skriningPtm));
    if (has(form, 'alatKontrasepsi')) set(result, 'is_menggunakan_kontrasepsi', bool(form.alatKontrasepsi));

    const puma = {};
    if (has(form, 'pumaMerokok')) set(puma, 'merokok_skor', num(form.pumaMerokok));
    if (has(form, 'pumaNapasPendek')) set(puma, 'napas_pendek_skor', num(form.pumaNapasPendek));
    if (has(form, 'pumaDahak')) set(puma, 'dahak_paru_skor', num(form.pumaDahak));
    if (has(form, 'pumaBatukFlu')) set(puma, 'batuk_atau_spirometri_skor', num(form.pumaBatukFlu));
    if (Object.keys(puma).length) result.skrining_ppok_puma = puma;

    if (category === 'lansia') {
      addAks(result, form);
      addSkilas(result, form);
    }
    if (has(form, 'jiwaQ1') || has(form, 'jiwaQ2') || has(form, 'jiwaQ3') || has(form, 'jiwaQ4')) addJiwa(result, form);
  }

  return result;
}
