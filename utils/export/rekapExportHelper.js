"use strict";

const REKAP_GROUPS = Object.freeze({
  bumil_nifas_menyusui: ["bumil", "busui"],
  bayi_balita_apras: ["bayi", "balita", "apras"],
  usia_sekolah_remaja: ["uskrem_6_14", "uskrem_15_18"],
  dewasa_lansia: ["dewasa", "lansia"],
});

const column = (key, label) => Object.freeze({ key, label });

const REKAP_EXPORT_COLUMNS = Object.freeze({
  bumil_nifas_menyusui: Object.freeze([
    column("bulan_tahun", "Bulan dan Tahun"),
    column("jumlah_ibu_hamil", "Ibu Hamil"),
    column("jumlah_ibu_nifas_menyusui", "Ibu Nifas/Menyusui"),
    column("ibu_hamil_datang", "Datang - Ibu Hamil"),
    column("ibu_nifas_menyusui_datang", "Datang - Ibu Nifas/Menyusui"),
    column("ibu_hamil_tidak_datang", "Tidak Datang - Ibu Hamil"),
    column("ibu_nifas_menyusui_tidak_datang", "Tidak Datang - Ibu Nifas/Menyusui"),
    column("berat_badan_hijau", "Berat Badan - Hijau"),
    column("berat_badan_merah", "Berat Badan - Merah"),
    column("lila_hijau", "Lingkar Lengan Atas - Hijau"),
    column("lila_merah_kek", "Lingkar Lengan Atas - Merah/KEK"),
    column("tekanan_darah_hijau", "Tekanan Darah - Hijau"),
    column("tekanan_darah_merah", "Tekanan Darah - Merah"),
    column("bergejala_tbc", "Bergejala TBC (memenuhi 2 gejala)"),
    column("ibu_hamil_mendapatkan_ttd", "Ibu Hamil Mendapatkan TTD"),
    column("ibu_hamil_ttd_setiap_hari", "Ibu Hamil Konsumsi TTD Setiap hari"),
    column("ibu_hamil_ttd_tidak_setiap_hari", "Ibu Hamil Konsumsi TTD Tidak setiap hari"),
    column("ibu_hamil_mendapatkan_pmt_bumil_kek", "Ibu Hamil Mendapatkan PMT Bumil KEK"),
    column("ibu_hamil_pmt_setiap_hari", "Ibu Hamil Konsumsi PMT Setiap hari"),
    column("ibu_hamil_pmt_tidak_setiap_hari", "Ibu Hamil Konsumsi PMT Tidak setiap hari"),
    column("ibu_hamil_kelas_ya", "Ibu Hamil Mengikuti Kelas - Ya"),
    column("ibu_hamil_kelas_tidak", "Ibu Hamil Mengikuti Kelas - Tidak"),
    column("ibu_nifas_mendapatkan_vitamin_a_ya", "Ibu Nifas Mendapatkan Vitamin A - Ya"),
    column("ibu_nifas_mendapatkan_vitamin_a_tidak", "Ibu Nifas Mendapatkan Vitamin A - Tidak"),
    column("ibu_nifas_menyusui_kb_ya", "Ibu Nifas/Menyusui Mengikuti KB Pasca Persalinan - Ya"),
    column("ibu_nifas_menyusui_kb_tidak", "Ibu Nifas/Menyusui Mengikuti KB Pasca Persalinan - Tidak"),
    column("mendapatkan_edukasi", "Mendapatkan Edukasi"),
    column("dirujuk_ibu_hamil", "Sasaran Dirujuk - Ibu Hamil"),
    column("dirujuk_ibu_nifas_menyusui", "Sasaran Dirujuk - Ibu Nifas/Menyusui"),
  ]),
  bayi_balita_apras: Object.freeze([
    column("bulan_tahun", "Bulan dan Tahun"),
    column("jumlah_bayi", "Bayi (0-11 bln)"),
    column("jumlah_balita", "Balita (12-59 bln)"),
    column("jumlah_apras", "Apras (60-72 bln)"),
    column("bayi_datang", "Datang - Bayi"),
    column("balita_datang", "Datang - Balita"),
    column("apras_datang", "Datang - Apras"),
    column("bayi_tidak_datang", "Tidak Datang - Bayi"),
    column("balita_tidak_datang", "Tidak Datang - Balita"),
    column("apras_tidak_datang", "Tidak Datang - Apras"),
    column("balita_ceklis_perkembangan_lengkap", "Balita Ceklis Perkembangan - Lengkap"),
    column("balita_ceklis_perkembangan_tidak_lengkap", "Balita Ceklis Perkembangan - Tidak Lengkap"),
    column("bb_naik", "BB Naik (N)"),
    column("bb_tidak_naik", "BB Tidak Naik/Bawah Garis Merah/Atas Oranye"),
    column("bb_gizi_baik", "BB/U - Gizi Baik"),
    column("bb_gizi_buruk", "BB/U - Gizi Buruk/Gizi Kurang/Berisiko Gizi Lebih/Gizi Lebih/Obesitas"),
    column("hasil_pengukuran_normal", "Hasil Pengukuran PB/TB/Umur - Normal"),
    column("hasil_pengukuran_sangat_pendek", "Hasil Pengukuran PB/TB/Umur - Sangat Pendek dan Pendek/Tinggi melebihi normal"),
    column("imt_apras_gizi_baik", "IMT APRAS - Gizi Baik"),
    column("imt_apras_gizi_buruk", "IMT APRAS - Gizi Buruk/Gizi Kurang/Berisiko Gizi Lebih/Gizi Lebih/Obesitas"),
    column("lingkar_kepala_normal", "Lingkar Kepala - Normal"),
    column("lingkar_kepala_tidak_normal", "Lingkar Kepala - Melebihi/Kurang dari normal"),
    column("lila_hijau", "Lingkar Lengan Atas - Hijau"),
    column("lila_kuning_merah", "Lingkar Lengan Atas - Kuning/Merah"),
    column("bergejala_tbc", "Bergejala TBC (memenuhi 2 gejala)"),
    column("asi_eksklusif", "ASI Eksklusif (0-6 bulan)"),
    column("mpasi", "MP ASI (>6 bulan)"),
    column("imunisasi", "Imunisasi (Bayi/Balita)"),
    column("vitamin_a", "Vitamin A"),
    column("obat_cacing", "Obat Cacing"),
    column("pmt_pangan_lokal", "MT Pangan Lokal"),
    column("mendapatkan_edukasi", "Mendapatkan Edukasi"),
    column("balita_sakit", "Jumlah Balita Sakit"),
    column("dirujuk_bayi", "Sasaran Dirujuk - Bayi"),
    column("dirujuk_balita", "Sasaran Dirujuk - Balita"),
    column("dirujuk_apras", "Sasaran Dirujuk - Apras"),
  ]),
  usia_sekolah_remaja: Object.freeze([
    column("bulan_tahun", "Bulan dan Tahun"),
    column("jumlah_usia_sekolah", "6-14 Tahun"),
    column("jumlah_remaja", "15-18 Tahun"),
    column("usia_sekolah_datang", "Datang - 6-14 Tahun"),
    column("remaja_datang", "Datang - 15-18 Tahun"),
    column("usia_sekolah_tidak_datang", "Tidak Datang - 6-14 Tahun"),
    column("remaja_tidak_datang", "Tidak Datang - 15-18 Tahun"),
    column("imt_sangat_kurus", "IMT - Sangat Kurus"),
    column("imt_kurus", "IMT - Kurus"),
    column("imt_normal", "IMT - Normal"),
    column("imt_gemuk", "IMT - Gemuk"),
    column("imt_obesitas", "IMT - Obesitas"),
    column("lingkar_perut_tinggi", "Lingkar Perut (cm)"),
    column("tekanan_darah_rendah", "Tekanan Darah - Rendah"),
    column("tekanan_darah_normal", "Tekanan Darah - Normal"),
    column("tekanan_darah_tinggi", "Tekanan Darah - Tinggi"),
    column("gula_darah_rendah", "Gula Darah - Rendah"),
    column("gula_darah_normal", "Gula Darah - Normal"),
    column("gula_darah_tinggi", "Gula Darah - Tinggi"),
    column("anemia", "Remaja Putri - Anemia"),
    column("tidak_anemia", "Remaja Putri - Tidak Anemia"),
    column("bergejala_tbc", "Bergejala TBC (memenuhi 2 gejala)"),
    column("skrining_jiwa_le_5", "Skrining Jiwa - <= 5"),
    column("skrining_jiwa_ge_6", "Skrining Jiwa - >= 6"),
    column("mendapatkan_edukasi", "Mendapatkan Edukasi"),
    column("dirujuk", "Jumlah Usia Sekolah/Remaja Dirujuk"),
  ]),
  dewasa_lansia: Object.freeze([
    column("bulan_tahun", "Bulan dan Tahun"),
    column("jumlah_dewasa", "19-59 Tahun"),
    column("jumlah_lansia", ">= 60 Tahun"),
    column("dewasa_datang", "Datang - 19-59 Tahun"),
    column("lansia_datang", "Datang - >= 60 Tahun"),
    column("dewasa_tidak_datang", "Tidak Datang - 19-59 Tahun"),
    column("lansia_tidak_datang", "Tidak Datang - >= 60 Tahun"),
    column("imt_sangat_kurus", "IMT - Sangat Kurus"),
    column("imt_kurus", "IMT - Kurus"),
    column("imt_normal", "IMT - Normal"),
    column("imt_gemuk", "IMT - Gemuk"),
    column("imt_obesitas", "IMT - Obesitas"),
    column("lingkar_perut_laki_laki", "Lingkar Perut - Laki-laki > 90 cm"),
    column("lingkar_perut_perempuan", "Lingkar Perut - Perempuan > 80 cm"),
    column("tekanan_darah_rendah", "Tekanan Darah - Rendah"),
    column("tekanan_darah_normal", "Tekanan Darah - Normal"),
    column("tekanan_darah_tinggi", "Tekanan Darah - Tinggi"),
    column("gula_darah_rendah", "Gula Darah - Rendah"),
    column("gula_darah_normal", "Gula Darah - Normal"),
    column("gula_darah_tinggi", "Gula Darah - Tinggi"),
    column("kolesterol_normal", "Kolesterol - Normal"),
    column("kolesterol_tinggi", "Kolesterol - Tinggi"),
    column("skrining_jiwa_le_5", "Skrining Jiwa - <= 5"),
    column("skrining_jiwa_ge_6", "Skrining Jiwa - >= 6"),
    column("skrining_jiwa_pertanyaan_17_ya", "Skrining Jiwa - Pertanyaan 17 Ya"),
    column("puma_normal", "Skrining PUMA - Normal"),
    column("puma_tinggi", "Skrining PUMA - Tinggi"),
    column("aks_m", "AKS - M"),
    column("aks_r", "AKS - R"),
    column("aks_s", "AKS - S"),
    column("aks_b", "AKS - B"),
    column("aks_t", "AKS - T"),
    column("skilas_kognitif_ya", "SKILAS Kognitif - Ya"),
    column("skilas_kognitif_tidak", "SKILAS Kognitif - Tidak"),
    column("skilas_gerak_ya", "SKILAS Gerak - Ya"),
    column("skilas_gerak_tidak", "SKILAS Gerak - Tidak"),
    column("skilas_malnutrisi_ya", "SKILAS Malnutrisi - Ya"),
    column("skilas_malnutrisi_tidak", "SKILAS Malnutrisi - Tidak"),
    column("skilas_pendengaran_ya", "SKILAS Pendengaran - Ya"),
    column("skilas_pendengaran_tidak", "SKILAS Pendengaran - Tidak"),
    column("skilas_penglihatan_ya", "SKILAS Penglihatan - Ya"),
    column("skilas_penglihatan_tidak", "SKILAS Penglihatan - Tidak"),
    column("skilas_depresi_ya", "SKILAS Depresi - Ya"),
    column("skilas_depresi_tidak", "SKILAS Depresi - Tidak"),
    column("imunisasi_covid19", "Imunisasi Covid 19"),
    column("mendapatkan_edukasi", "Mendapatkan Edukasi"),
    column("dirujuk", "Jumlah Usia Dewasa dan Lansia Dirujuk"),
  ]),
});

const getNestedValue = (value, path) => path.split(".").reduce((current, key) => current?.[key], value);
const getRekapGroup = (category) => Object.entries(REKAP_GROUPS).find(([, categories]) => categories.includes(category))?.[0] || null;
const getLatestProfile = (profiles = []) => (Array.isArray(profiles) && profiles.length ? [...profiles].sort((left, right) => Number(right.id || 0) - Number(left.id || 0))[0] : null);
const getProfile = (record) => getLatestProfile(record?.kunjungan?.warga?.profileKehamilan || record?.warga?.profileKehamilan || []);
const getDetail = (record, path) => getNestedValue(record?.detail_skrining || {}, path);
const countWhere = (records, predicate) => records.filter(predicate).length || "";
const countTrue = (records, predicate) => countWhere(records, predicate);
const increment = (row, key, value = 1) => {
  if (value) row[key] = (row[key] || 0) + value;
};
const isReferred = (record) => record.is_perlu_rujukan === true || Boolean(record.rujukan);
const tbcTriggered = (record) => getDetail(record, "tbc.is_tbc_terindikasi") === true;
const educationGiven = (record) => typeof record.topik_penyuluhan === "string" && record.topik_penyuluhan.trim().length > 0;
const isMentalLow = (record) => Number.isFinite(Number(getDetail(record, "skrining_kesehatan_jiwa.total_skor_jiwa"))) && Number(getDetail(record, "skrining_kesehatan_jiwa.total_skor_jiwa")) <= 5;
const isMentalHigh = (record) => Number.isFinite(Number(getDetail(record, "skrining_kesehatan_jiwa.total_skor_jiwa"))) && Number(getDetail(record, "skrining_kesehatan_jiwa.total_skor_jiwa")) >= 6;
const periodOf = (record) => {
  const date = new Date(record.tanggal);
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};
const recordCategory = (record) => record?.kategori_sasaran || "";
const recordsForCategory = (records, category) => records.filter((record) => recordCategory(record) === category);
const recordsForGroup = (records, group) => records.filter((record) => REKAP_GROUPS[group].includes(recordCategory(record)));
const hasImmunizationInPeriod = (record, period) => (record?.kunjungan?.warga?.imunisasi || []).some((item) => periodOf({ tanggal: item.tanggal_imunisasi }) === period);
const finishRow = (columns, row) => Object.fromEntries(columns.map(({ key }) => [key, row[key] === undefined ? "" : row[key]]));

const mapPregnancyRow = (records, period) => {
  const bumil = recordsForCategory(records, "bumil");
  const nifasMenyusui = recordsForCategory(records, "busui");
  const row = { bulan_tahun: period };
  row.jumlah_ibu_hamil = bumil.length || "";
  row.jumlah_ibu_nifas_menyusui = nifasMenyusui.length || "";
  row.ibu_hamil_datang = bumil.length || "";
  row.ibu_nifas_menyusui_datang = nifasMenyusui.length || "";
  row.bergejala_tbc = countTrue(records, tbcTriggered);
  row.mendapatkan_edukasi = countTrue(records, educationGiven);
  row.dirujuk_ibu_hamil = countTrue(bumil, isReferred);
  row.dirujuk_ibu_nifas_menyusui = countTrue(nifasMenyusui, isReferred);
  for (const record of bumil) {
    const service = getDetail(record, "pelayanan_kesehatan") || {};
    increment(row, "ibu_hamil_mendapatkan_ttd", Number(service.jumlah_ttd_given) > 0);
    increment(row, "ibu_hamil_ttd_setiap_hari", service.is_rutin_ttd === true);
    increment(row, "ibu_hamil_ttd_tidak_setiap_hari", service.is_rutin_ttd === false);
    increment(row, "ibu_hamil_mendapatkan_pmt_bumil_kek", service.is_mt_kek_given === true);
    increment(row, "ibu_hamil_pmt_setiap_hari", service.is_rutin_mt_kek === true);
    increment(row, "ibu_hamil_pmt_tidak_setiap_hari", service.is_rutin_mt_kek === false);
  }
  for (const record of nifasMenyusui) {
    const service = getDetail(record, "pelayanan_kesehatan") || {};
    increment(row, "ibu_nifas_mendapatkan_vitamin_a_ya", service.is_vit_a_given === true);
    increment(row, "ibu_nifas_mendapatkan_vitamin_a_tidak", service.is_vit_a_given === false);
    increment(row, "ibu_nifas_menyusui_kb_ya", service.is_kb_pasca_persalinan === true);
    increment(row, "ibu_nifas_menyusui_kb_tidak", service.is_kb_pasca_persalinan === false);
  }
  return finishRow(REKAP_EXPORT_COLUMNS.bumil_nifas_menyusui, row);
};

const mapChildRow = (records, period) => {
  const row = { bulan_tahun: period };
  for (const category of ["bayi", "balita", "apras"]) {
    const categoryRecords = recordsForCategory(records, category);
    row[`jumlah_${category}`] = categoryRecords.length || "";
    row[`${category}_datang`] = categoryRecords.length || "";
    row[`dirujuk_${category}`] = countTrue(categoryRecords, isReferred);
  }
  row.bergejala_tbc = countTrue(records, tbcTriggered);
  row.mendapatkan_edukasi = countTrue(records, educationGiven);
  row.asi_eksklusif = countTrue(records, (record) => getDetail(record, "pelayanan_kesehatan.is_asi_eksklusif") === true);
  row.mpasi = countTrue(records, (record) => getDetail(record, "pelayanan_kesehatan.is_mp_asi") === true);
  row.vitamin_a = countTrue(records, (record) => getDetail(record, "pelayanan_kesehatan.is_vit_a_given") === true);
  row.obat_cacing = countTrue(records, (record) => getDetail(record, "pelayanan_kesehatan.is_obat_cacing_given") === true);
  row.pmt_pangan_lokal = countTrue(records, (record) => getDetail(record, "pelayanan_kesehatan.is_pmt_lokal_pemulihan") === true);
  row.imunisasi = countTrue(records, (record) => hasImmunizationInPeriod(record, period));
  return finishRow(REKAP_EXPORT_COLUMNS.bayi_balita_apras, row);
};

const mapSchoolRow = (records, period) => {
  const row = { bulan_tahun: period };
  const school = recordsForCategory(records, "uskrem_6_14");
  const teens = recordsForCategory(records, "uskrem_15_18");
  row.jumlah_usia_sekolah = school.length || "";
  row.jumlah_remaja = teens.length || "";
  row.usia_sekolah_datang = school.length || "";
  row.remaja_datang = teens.length || "";
  row.bergejala_tbc = countTrue(records, tbcTriggered);
  row.skrining_jiwa_le_5 = countTrue(records, isMentalLow);
  row.skrining_jiwa_ge_6 = countTrue(records, isMentalHigh);
  row.mendapatkan_edukasi = countTrue(records, educationGiven);
  row.dirujuk = countTrue(records, isReferred);
  return finishRow(REKAP_EXPORT_COLUMNS.usia_sekolah_remaja, row);
};

const mapAdultRow = (records, period) => {
  const row = { bulan_tahun: period };
  const adults = recordsForCategory(records, "dewasa");
  const elderly = recordsForCategory(records, "lansia");
  row.jumlah_dewasa = adults.length || "";
  row.jumlah_lansia = elderly.length || "";
  row.dewasa_datang = adults.length || "";
  row.lansia_datang = elderly.length || "";
  for (const record of [...adults, ...elderly]) {
    const waist = Number(record.lingkar_perut_cm);
    if (Number.isFinite(waist) && record.kunjungan?.warga?.jenis_kelamin === "L" && waist > 90) increment(row, "lingkar_perut_laki_laki");
    if (Number.isFinite(waist) && record.kunjungan?.warga?.jenis_kelamin === "P" && waist > 80) increment(row, "lingkar_perut_perempuan");
  }
  row.skrining_jiwa_le_5 = countTrue(records, isMentalLow);
  row.skrining_jiwa_ge_6 = countTrue(records, isMentalHigh);
  row.skrining_jiwa_pertanyaan_17_ya = countTrue(records, (record) => getDetail(record, "skrining_kesehatan_jiwa.is_rujukan_jiwa") === true);
  row.puma_normal = countTrue(adults, (record) => getDetail(record, "skrining_ppok_puma.status_risiko_puma") === "risiko_rendah");
  row.puma_tinggi = countTrue(adults, (record) => getDetail(record, "skrining_ppok_puma.status_risiko_puma") === "risiko_tinggi");
  for (const record of elderly) {
    const code = getDetail(record, "aks_aktifitas_harian.kode_aks");
    if (["M", "R", "S", "B", "T"].includes(code)) increment(row, `aks_${code.toLowerCase()}`);
    const skilas = getDetail(record, "skilas") || {};
    const checks = {
      kognitif: Object.values(skilas.kognitif_dan_mobilisasi || {}).some(Boolean),
      gerak: Object.values(skilas.kognitif_dan_mobilisasi || {}).some(Boolean),
      malnutrisi: Object.values(skilas.malnutrisi || {}).some(Boolean),
      pendengaran: Object.values(skilas.gangguan_pendengaran || {}).some(Boolean),
      penglihatan: Object.values(skilas.gangguan_penglihatan || {}).some(Boolean),
      depresi: Object.values(skilas.gejala_depresi || {}).some(Boolean),
    };
    for (const [key, value] of Object.entries(checks)) increment(row, `skilas_${key}_${value ? "ya" : "tidak"}`);
    increment(row, "imunisasi_covid19", skilas.is_imunisasi_covid19 === true);
  }
  row.mendapatkan_edukasi = countTrue(records, educationGiven);
  row.dirujuk = countTrue(records, isReferred);
  return finishRow(REKAP_EXPORT_COLUMNS.dewasa_lansia, row);
};

const mapGroupRow = (records, group, period) => {
  if (group === "bumil_nifas_menyusui") return mapPregnancyRow(records, period);
  if (group === "bayi_balita_apras") return mapChildRow(records, period);
  if (group === "usia_sekolah_remaja") return mapSchoolRow(records, period);
  return mapAdultRow(records, period);
};

const aggregateRekapRows = (records = [], group) => {
  const grouped = new Map();
  for (const record of recordsForGroup(records, group)) {
    const period = periodOf(record);
    if (!period) continue;
    if (!grouped.has(period)) grouped.set(period, []);
    grouped.get(period).push(record);
  }
  return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([period, periodRecords]) => mapGroupRow(periodRecords, group, period));
};

const mapPemeriksaanToRekap = (pemeriksaan = {}, category = pemeriksaan.kategori_sasaran) => {
  const group = getRekapGroup(category);
  return group ? mapGroupRow([{ ...pemeriksaan, kategori_sasaran: category }], group, periodOf(pemeriksaan)) : null;
};

module.exports = { REKAP_GROUPS, REKAP_EXPORT_COLUMNS, aggregateRekapRows, getNestedValue, getRekapGroup, mapPemeriksaanToRekap };
