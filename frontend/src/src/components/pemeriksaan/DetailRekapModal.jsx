import React from 'react';
import { 
  User, 
  Activity, 
  BarChart2, 
  Stethoscope, 
  HeartHandshake, 
  CheckCircle2, 
  Edit3,
  X,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const resolve5StepDetails = (citizen, examData = null) => {
  if (!citizen) return null;

  const exam = examData || citizen.exam || null;
  const isExamined = citizen.statusPemeriksaan === 'Sudah' || citizen.status === 'Sudah' || !!exam;
  const tglPeriksa = (exam && exam.tglPemeriksaan) 
    ? exam.tglPemeriksaan 
    : (citizen.tglPeriksa && citizen.tglPeriksa !== '-' ? citizen.tglPeriksa : (isExamined ? '05-09-2026' : '-'));

  const kat = (citizen.kategori || '').toLowerCase();
  const subKat = (citizen.subKategori || '').toLowerCase();

  // 1. LANGKAH 1: Identitas Sasaran
  const l1 = exam?.langkah1 || {
    nik: citizen.nik || '-',
    nama: citizen.nama || '-',
    tglLahir: citizen.tglLahir || '-',
    gender: citizen.gender || (kat.includes('bumil') || kat.includes('nifas') ? 'Perempuan' : 'Laki-laki'),
    keteranganKeluarga: citizen.keteranganIbuSuami || citizen.namaIbu || citizen.namaAyah || citizen.namaSuami || citizen.namaPasangan || '-',
    alamat: citizen.alamat || 'Wilayah RW 04, Sukamaju'
  };

  // Additional category-specific metadata for Langkah 1 (sesuai field form)
  let categoryMetaL1 = {};
  if (kat.includes('bumil')) {
    categoryMetaL1 = {
      "Status Pernikahan": citizen.statusPernikahan || 'Menikah',
      "Pekerjaan": citizen.pekerjaan || 'Ibu Rumah Tangga',
      "HPHT": citizen.hpht || exam?.langkah1?.hpht || '10-01-2026',
      "HPL (Hari Perkiraan Lahir)": citizen.hpl || exam?.langkah1?.hpl || '17-10-2026',
      "Usia Kehamilan": citizen.usiaKehamilan || exam?.langkah1?.usiaKehamilan || '34 Minggu (Trimester 3)',
      "Jarak Kehamilan": citizen.jarakAnak || exam?.langkah1?.jarakAnak || citizen.ibuHamilDetail?.obstetri?.jarakKehamilan || 'Anak Pertama'
    };
  } else if (kat.includes('nifas')) {
    const rawWaktu = citizen.waktuKunjunganNifas || exam?.langkah1?.waktuKunjunganNifas || 'Bln 2';
    const cleanWaktu = rawWaktu.replace(/\s*\(KF\s*[\d\-]+\)/gi, '').trim();
    categoryMetaL1 = {
      "Status Pernikahan": citizen.statusPernikahan || 'Menikah',
      "Pekerjaan": citizen.pekerjaan || 'Ibu Rumah Tangga',
      "Tanggal Persalinan": citizen.tglPersalinan || '24-07-2026',
      "Status Persalinan": citizen.statusPersalinan || 'Sudah Bersalin (Normal di Puskesmas)',
      "Status Menyusui": citizen.statusMenyusui || 'Masih Menyusui (ASI Eksklusif)',
      "Waktu Kunjungan": cleanWaktu
    };
  } else if (kat.includes('bayi')) {
    categoryMetaL1 = {
      "Berat Badan Lahir (BBL)": citizen.bbl ? (String(citizen.bbl).includes('kg') ? citizen.bbl : `${citizen.bbl} kg`) : '3.2 kg',
      "Panjang Badan Lahir (PBL)": citizen.pbl ? (String(citizen.pbl).includes('cm') ? citizen.pbl : `${citizen.pbl} cm`) : '49.0 cm'
    };
  } else if (kat.includes('balita')) {
    categoryMetaL1 = {
      "Berat Badan Lahir (BBL)": citizen.bbl ? (String(citizen.bbl).includes('kg') ? citizen.bbl : `${citizen.bbl} kg`) : '3.1 kg',
      "Panjang Badan Lahir (PBL)": citizen.pbl ? (String(citizen.pbl).includes('cm') ? citizen.pbl : `${citizen.pbl} cm`) : '48.5 cm'
    };
  } else if (kat.includes('apras')) {
    categoryMetaL1 = {};
  } else if (kat.includes('6-14') || subKat.includes('6-14') || kat.includes('usekrem') || kat.includes('remaja')) {
    categoryMetaL1 = {};
  } else if (kat.includes('dewasa')) {
    categoryMetaL1 = {
      "Pekerjaan": citizen.pekerjaan || 'Karyawan Swasta',
      "Status Pernikahan": citizen.statusPernikahan || 'Menikah'
    };
  } else if (kat.includes('lansia')) {
    categoryMetaL1 = {
      "Pekerjaan": citizen.pekerjaan || 'Pensiunan / Tidak Bekerja',
      "Status Pernikahan": citizen.statusPernikahan || 'Menikah'
    };
  }

  // 2. LANGKAH 2: Skrining Penimbangan & Pengukuran
  let l2 = {};
  if (kat.includes('bumil')) {
    const rawL2 = exam?.langkah2 || {};
    const bbVal = rawL2.bb || citizen.bb || '58.5';
    const tbVal = rawL2.tb || citizen.tb || '158.0';
    let tensiVal = rawL2.tensi || citizen.tensi || (rawL2.tensiSistol && rawL2.tensiDiastol ? `${rawL2.tensiSistol}/${rawL2.tensiDiastol} mmHg` : '118/78 mmHg');
    
    l2 = {
      bb: typeof bbVal === 'string' && bbVal.includes('kg') ? bbVal : `${bbVal} kg`,
      tb: typeof tbVal === 'string' && tbVal.includes('cm') ? tbVal : `${tbVal} cm`,
      tensi: typeof tensiVal === 'string' && tensiVal.includes('mmHg') ? tensiVal : `${tensiVal} mmHg`
    };
  } else if (kat.includes('nifas')) {
    const rawL2 = exam?.langkah2 || {};
    const bbVal = rawL2.bb || citizen.bb || '54.0';
    let tensiVal = rawL2.tensi || citizen.tensi || (rawL2.tensiSistol && rawL2.tensiDiastol ? `${rawL2.tensiSistol}/${rawL2.tensiDiastol} mmHg` : '118/78 mmHg');
    
    l2 = {
      bb: typeof bbVal === 'string' && bbVal.includes('kg') ? bbVal : `${bbVal} kg`,
      tensi: typeof tensiVal === 'string' && tensiVal.includes('mmHg') ? tensiVal : `${tensiVal} mmHg`
    };
  } else if (kat.includes('apras')) {
    const rawL2 = exam?.langkah2 || {};
    const bbVal = rawL2.bb || citizen.bb || '16.0';
    const tbVal = rawL2.tb || citizen.tb || '102.0';
    const lilaVal = rawL2.lila || citizen.lila || '16.5';
    l2 = {
      bb: typeof bbVal === 'string' && bbVal.includes('kg') ? bbVal : `${bbVal} kg`,
      tb: typeof tbVal === 'string' && tbVal.includes('cm') ? tbVal : `${tbVal} cm`,
      lila: typeof lilaVal === 'string' && lilaVal.includes('cm') ? lilaVal : `${lilaVal} cm`
    };
  } else if (kat.includes('6-14') || subKat.includes('6-14')) {
    const rawL2 = exam?.langkah2 || {};
    const bbVal = rawL2.bb || citizen.bb || '34.5';
    const tbVal = rawL2.tb || citizen.tb || '138.0';
    l2 = {
      bb: typeof bbVal === 'string' && bbVal.includes('kg') ? bbVal : `${bbVal} kg`,
      tb: typeof tbVal === 'string' && tbVal.includes('cm') ? tbVal : `${tbVal} cm`
    };
  } else if (kat.includes('dewasa')) {
    const rawL2 = exam?.langkah2 || {};
    const bbVal = rawL2.bb || citizen.bb || '72.0';
    const tbVal = rawL2.tb || citizen.tb || '170.0';
    const lilaVal = rawL2.lila || citizen.lila || '28.5';
    const lpVal = rawL2.lingkarPerut || rawL2.lp || citizen.lingkarPerut || '84';
    let tensiVal = rawL2.tensi || citizen.tensi || (rawL2.tensiSistol && rawL2.tensiDiastol ? `${rawL2.tensiSistol}/${rawL2.tensiDiastol} mmHg` : '120/80 mmHg');

    l2 = {
      bb: typeof bbVal === 'string' && bbVal.includes('kg') ? bbVal : `${bbVal} kg`,
      tb: typeof tbVal === 'string' && tbVal.includes('cm') ? tbVal : `${tbVal} cm`,
      lila: typeof lilaVal === 'string' && lilaVal.includes('cm') ? lilaVal : `${lilaVal} cm`,
      lingkarPerut: typeof lpVal === 'string' && lpVal.includes('cm') ? lpVal : `${lpVal} cm`,
      tensi: typeof tensiVal === 'string' && tensiVal.includes('mmHg') ? tensiVal : `${tensiVal} mmHg`
    };
  } else if (kat.includes('lansia')) {
    const rawL2 = exam?.langkah2 || {};
    const bbVal = rawL2.bb || citizen.bb || '60.0';
    const tbVal = rawL2.tb || citizen.tb || '162.0';
    const lilaVal = rawL2.lila || citizen.lila || '27.0';
    const lpVal = rawL2.lingkarPerut || rawL2.lp || citizen.lingkarPerut || '80';
    let tensiVal = rawL2.tensi || citizen.tensi || (rawL2.tensiSistol && rawL2.tensiDiastol ? `${rawL2.tensiSistol}/${rawL2.tensiDiastol} mmHg` : '140/90 mmHg');

    l2 = {
      bb: typeof bbVal === 'string' && bbVal.includes('kg') ? bbVal : `${bbVal} kg`,
      tb: typeof tbVal === 'string' && tbVal.includes('cm') ? tbVal : `${tbVal} cm`,
      lila: typeof lilaVal === 'string' && lilaVal.includes('cm') ? lilaVal : `${lilaVal} cm`,
      lingkarPerut: typeof lpVal === 'string' && lpVal.includes('cm') ? lpVal : `${lpVal} cm`,
      tensi: typeof tensiVal === 'string' && tensiVal.includes('mmHg') ? tensiVal : `${tensiVal} mmHg`
    };
  } else if (exam?.langkah2) {
    l2 = { ...exam.langkah2 };
  } else if (kat.includes('bayi')) {
    l2 = {
      bb: citizen.bb ? `${citizen.bb} kg` : '7.8 kg',
      tb: citizen.tb ? `${citizen.tb} cm` : (citizen.pb ? `${citizen.pb} cm` : '68.0 cm'),
      lingkarKepala: citizen.lk || '43.0 cm',
      lila: citizen.lila || '14.0 cm'
    };
  } else if (kat.includes('balita')) {
    l2 = {
      bb: citizen.bb ? `${citizen.bb} kg` : '13.2 kg',
      tb: citizen.tb ? `${citizen.tb} cm` : '94.5 cm',
      lingkarKepala: citizen.lk || '48.5 cm',
      lila: citizen.lila || '15.2 cm'
    };
  } else if (kat.includes('usekrem') || kat.includes('remaja')) {
    l2 = {
      bb: citizen.bb ? `${citizen.bb} kg` : '55.0 kg',
      tb: citizen.tb ? `${citizen.tb} cm` : '165.0 cm',
      lingkarPerut: citizen.lingkarPerut || '70 cm',
      tensi: citizen.tensi || '115/75 mmHg'
    };
  } else {
    l2 = {
      bb: citizen.bb ? `${citizen.bb} kg` : '50.0 kg',
      tb: citizen.tb ? `${citizen.tb} cm` : '160.0 cm'
    };
  }

  // 3. LANGKAH 3: Plotting Evaluasi Otomatis & Status Gizi
  let l3 = {};
  if (kat.includes('bumil')) {
    const rawL3 = exam?.langkah3 || {};
    l3 = {
      imtStatus: rawL3.imtStatus || "Normal (IMT 23.4 kg/m²)",
      lilaStatus: rawL3.lilaStatus || "Normal / Bebas KEK (LiLA 24.5 cm ≥ 23.5 cm)",
      tensiStatus: rawL3.tensiStatus || "Normotensi / Normal (< 130/85 mmHg)"
    };
  } else if (kat.includes('nifas')) {
    const rawL3 = exam?.langkah3 || {};
    l3 = {
      imtStatus: rawL3.imtStatus || "Normal (IMT 22.5 kg/m²)",
      tensiStatus: rawL3.tensiStatus || "Normotensi / Normal (< 130/85 mmHg)"
    };
  } else if (kat.includes('bayi')) {
    const rawL3 = exam?.langkah3 || {};
    l3 = {
      bbU: rawL3.bbU || "BB Normal / Naik Sesuai Kurva KIA (N)",
      tbU: rawL3.tbU || "Panjang Badan Normal Sesuai Usia (PB/U)",
      bbTb: rawL3.bbTb || "Gizi Baik Sesuai Standar WHO",
      lingkarKepala: rawL3.lingkarKepala || "Normal (-2SD s.d +2SD)",
      lilaStatus: rawL3.lilaStatus || "Gizi Normal (≥ 12.5 cm)"
    };
  } else if (kat.includes('balita')) {
    const rawL3 = exam?.langkah3 || {};
    l3 = {
      bbU: rawL3.bbU || "BB Normal / Naik (N, -2SD s.d +1SD)",
      tbU: rawL3.tbU || "Normal (N, -2SD s.d +3SD)",
      bbTb: rawL3.bbTb || "Gizi Baik (-2SD s.d +1SD)",
      lingkarKepala: rawL3.lingkarKepala || "Normal (-2SD s.d +2SD)",
      lilaStatus: rawL3.lilaStatus || "Gizi Normal (> 12.5 cm)"
    };
  } else if (kat.includes('apras')) {
    const rawL3 = exam?.langkah3 || {};
    l3 = {
      imtStatus: rawL3.imtStatus || rawL3.imtU || "Gizi Baik (-2 SD s.d +1 SD)",
      lilaStatus: rawL3.lilaStatus || "Gizi Normal (≥ 14 cm)"
    };
  } else if (kat.includes('6-14') || subKat.includes('6-14')) {
    const rawL3 = exam?.langkah3 || {};
    l3 = {
      imtU: rawL3.imtU || rawL3.imtStatus || rawL3.imtUsekremStatus || citizen.statusGizi || "Gizi Baik (-2 SD s.d +1 SD)"
    };
  } else if (kat.includes('dewasa')) {
    const rawL3 = exam?.langkah3 || {};
    const rawL2 = exam?.langkah2 || {};
    const lilaNum = parseFloat(rawL2.lila || citizen.lila || 28.5);
    const lilaEvaluasi = rawL3.lilaStatus || (lilaNum >= 23.5 ? `Normal / Bebas KEK (LiLA ${lilaNum} cm ≥ 23.5 cm)` : `Kurang / Risiko KEK (LiLA ${lilaNum} cm < 23.5 cm)`);

    l3 = {
      imtStatus: rawL3.imtStatus || "Normal (IMT 24.9 kg/m²)",
      lilaStatus: lilaEvaluasi,
      tensiStatus: rawL3.tensiStatus || "Normotensi / Normal (< 130/85 mmHg)",
      lpStatus: rawL3.lpStatus || rawL3.lpPlottingStatus || "Normal (Lingkar Perut 84 cm ≤ 90 cm)"
    };
  } else if (kat.includes('lansia')) {
    const rawL3 = exam?.langkah3 || {};
    const rawL2 = exam?.langkah2 || {};
    const lilaNum = parseFloat(rawL2.lila || citizen.lila || 27.0);
    const lilaEvaluasi = rawL3.lilaStatus || (lilaNum >= 21.5 ? `Normal / Bebas KEK (LiLA ${lilaNum} cm ≥ 21.5 cm)` : `Kurang / Risiko KEK (LiLA ${lilaNum} cm < 21.5 cm)`);

    l3 = {
      imtStatus: rawL3.imtStatus || "Normal (IMT 22.9 kg/m²)",
      lilaStatus: lilaEvaluasi,
      tensiStatus: rawL3.tensiStatus || "Pra-Hipertensi Terkontrol (140/90 mmHg)",
      lpStatus: rawL3.lpStatus || rawL3.lpPlottingStatus || "Normal (Lingkar Perut 80 cm ≤ 90 cm)"
    };
  } else if (exam?.langkah3 && Object.keys(exam.langkah3).length > 0) {
    l3 = { ...exam.langkah3 };
  } else if (kat.includes('usekrem') || kat.includes('remaja')) {
    l3 = {
      imtU: "Normal (IMT 20.2 kg/m²)",
      tensiStatus: "Normal (115/75 mmHg)",
      lpStatus: "Normal / Bebas Obesitas Sentral (≤ 90 cm)"
    };
  } else {
    l3 = {
      imtStatus: isExamined ? 'Normal' : 'Belum Diperiksa',
      statusGizi: isExamined ? 'Gizi Baik' : 'Belum Diperiksa'
    };
  }

  // 4. LANGKAH 4: Skrining PTM, Gejala TBC & Pelayanan Spesifik
  let l4 = {};
  if (kat.includes('bumil')) {
    const rawL4 = exam?.langkah4 || {};
    
    // Evaluasi Skrining Gejala TBC
    let tbcValue = "Tidak Ada Gejala TBC (Normal)";
    if (rawL4.batukTbc || rawL4.demamTbc || rawL4.bbTurunTbc || rawL4.kontakTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.demamTbc, rawL4.bbTurunTbc, rawL4.kontakTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala TBC (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    const ttdNakes = rawL4.pemberianTtd || rawL4.jumlahTtd || 'Sudah';
    const rutinTtdVal = rawL4.rutinTtd || 'Ya';
    const mtKomposisi = rawL4.komposisiMtBumil || 'Biskuit PMT Pangan Lokal (1 Porsi/Hari)';
    const rutinMtVal = rawL4.rutinMtBumil || 'Ya';

    l4 = {
      tbc: tbcValue,
      pemberianTtd: ttdNakes === 'Sudah' ? 'Sudah' : (ttdNakes === 'Belum' ? 'Belum' : ttdNakes),
      rutinTtd: rutinTtdVal === 'Ya' ? 'Ya (1 butir setiap hari selama kehamilan)' : (rutinTtdVal === 'Tidak' ? 'Tidak' : rutinTtdVal),
      komposisiMtBumil: mtKomposisi,
      rutinMtBumil: rutinMtVal === 'Ya' ? 'Ya' : (rutinMtVal === 'Tidak' ? 'Tidak' : rutinMtVal)
    };
  } else if (kat.includes('nifas')) {
    const rawL4 = exam?.langkah4 || {};
    
    // Evaluasi Skrining Gejala TBC
    let tbcValue = "Tidak Ada Gejala TBC (Normal)";
    if (rawL4.batukTbc || rawL4.demamTbc || rawL4.bbTurunTbc || rawL4.kontakTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.demamTbc, rawL4.bbTurunTbc, rawL4.kontakTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala TBC (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    const vitAVal = rawL4.jumlahVitA || 'Sudah';
    const rutinVitVal = rawL4.rutinVitA || 'Ya';
    const menyusuiVal = rawL4.menyusui || 'Ya';
    const kbVal = rawL4.kbPascaPersalinan || 'Ya';

    l4 = {
      tbc: tbcValue,
      jumlahVitA: vitAVal === 'Sudah' ? 'Sudah Diberikan oleh Nakes' : (vitAVal === 'Belum' ? 'Belum Diberikan' : vitAVal),
      rutinVitA: rutinVitVal === 'Ya' ? 'Ya' : (rutinVitVal === 'Tidak' ? 'Tidak' : rutinVitVal),
      menyusui: menyusuiVal === 'Ya' ? 'Ya' : (menyusuiVal === 'Tidak' ? 'Tidak' : menyusuiVal),
      kbPascaPersalinan: kbVal === 'Ya' ? 'Ya' : (kbVal === 'Tidak' ? 'Tidak' : kbVal)
    };
  } else if (kat.includes('bayi')) {
    const rawL4 = exam?.langkah4 || {};
    
    // Evaluasi Skrining Gejala TBC (batukTbc, demamTbc, bbTurunTbc, lesuTbc)
    let tbcValue = "Tidak Ada Gejala TBC (Normal)";
    if (rawL4.batukTbc || rawL4.demamTbc || rawL4.bbTurunTbc || rawL4.lesuTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.demamTbc, rawL4.bbTurunTbc, rawL4.lesuTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala TBC (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    const fmtYesNo = (val, defaultVal = 'Ya') => {
      const v = val !== undefined && val !== '' ? val : defaultVal;
      return v === 'Ya' ? 'Ya' : (v === 'Tidak' ? 'Tidak' : v);
    };

    const tempatImun = rawL4.tempatImunisasi 
      ? (rawL4.namaRsImunisasi ? `${rawL4.tempatImunisasi} (${rawL4.namaRsImunisasi})` : rawL4.tempatImunisasi) 
      : 'Posyandu';
    const jenisImun = rawL4.jenisImunisasi 
      ? (rawL4.jenisImunisasi === 'Lainnya' && rawL4.jenisImunisasiLainnya ? rawL4.jenisImunisasiLainnya : rawL4.jenisImunisasi)
      : null;

    l4 = {
      tempatImunisasi: tempatImun,
      ...(jenisImun ? { jenisImunisasi: jenisImun } : {}),
      asiEksklusif: fmtYesNo(rawL4.asiEksklusif, 'Ya'),
      mpAsi: fmtYesNo(rawL4.mpAsi, 'Ya'),
      tbc: tbcValue,
      pmtPemulihan: fmtYesNo(rawL4.pmtPemulihan, 'Tidak'),
      pmtHabis: fmtYesNo(rawL4.pmtHabis, 'Tidak'),
      vitA: fmtYesNo(rawL4.vitA, 'Ya'),
      ikutKelasBalita: fmtYesNo(rawL4.ikutKelasBalita, 'Ya')
    };
  } else if (kat.includes('balita')) {
    const rawL4 = exam?.langkah4 || {};
    
    // Evaluasi Skrining Gejala TBC (batukTbc, demamTbc, bbTurunTbc, lesuTbc)
    let tbcValue = "Tidak Ada Gejala TBC (Normal)";
    if (rawL4.batukTbc || rawL4.demamTbc || rawL4.bbTurunTbc || rawL4.lesuTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.demamTbc, rawL4.bbTurunTbc, rawL4.lesuTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala TBC (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    const fmtYesNo = (val, defaultVal = 'Ya') => {
      const v = val !== undefined && val !== '' ? val : defaultVal;
      return v === 'Ya' ? 'Ya' : (v === 'Tidak' ? 'Tidak' : v);
    };

    const tempatImun = rawL4.tempatImunisasi 
      ? (rawL4.namaRsImunisasi ? `${rawL4.tempatImunisasi} (${rawL4.namaRsImunisasi})` : rawL4.tempatImunisasi) 
      : 'Posyandu';
    const jenisImun = rawL4.jenisImunisasi 
      ? (rawL4.jenisImunisasi === 'Lainnya' && rawL4.jenisImunisasiLainnya ? rawL4.jenisImunisasiLainnya : rawL4.jenisImunisasi)
      : null;

    l4 = {
      tempatImunisasi: tempatImun,
      ...(jenisImun ? { jenisImunisasi: jenisImun } : {}),
      mpAsi: fmtYesNo(rawL4.mpAsi, 'Ya'),
      tbc: tbcValue,
      pmtPemulihan: fmtYesNo(rawL4.pmtPemulihan, 'Tidak'),
      pmtHabis: fmtYesNo(rawL4.pmtHabis, 'Tidak'),
      vitA: fmtYesNo(rawL4.vitA, 'Ya'),
      obatCacing: fmtYesNo(rawL4.obatCacing, 'Ya'),
      ikutKelasBalita: fmtYesNo(rawL4.ikutKelasBalita, 'Ya')
    };
  } else if (kat.includes('apras')) {
    const rawL4 = exam?.langkah4 || {};

    // Evaluasi Skrining Gejala TBC (batukTbc, demamTbc, bbTurunTbc, lesuTbc)
    let tbcValue = "Tidak Ada Gejala TBC (Normal)";
    if (rawL4.batukTbc || rawL4.demamTbc || rawL4.bbTurunTbc || rawL4.lesuTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.demamTbc, rawL4.bbTurunTbc, rawL4.lesuTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala TBC (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    const fmtYesNo = (val, defaultVal = 'Ya') => {
      const v = val !== undefined && val !== '' ? val : defaultVal;
      return v === 'Ya' ? 'Ya' : (v === 'Tidak' ? 'Tidak' : v);
    };

    l4 = {
      tbc: tbcValue,
      obatCacing: fmtYesNo(rawL4.obatCacing, 'Ya')
    };
  } else if (kat.includes('6-14') || subKat.includes('6-14')) {
    const rawL4 = exam?.langkah4 || {};

    // Evaluasi Skrining Gejala TBC (batukTbc, demamTbc, bbTurunTbc, lesuTbc)
    let tbcValue = "Tidak Ada Gejala TBC (Normal)";
    if (rawL4.batukTbc || rawL4.demamTbc || rawL4.bbTurunTbc || rawL4.lesuTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.demamTbc, rawL4.bbTurunTbc, rawL4.lesuTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala TBC (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    l4 = {
      tbc: tbcValue,
      mataKanan: rawL4.mataKanan || "Normal",
      mataKiri: rawL4.mataKiri || "Normal",
      telingaKanan: rawL4.telingaKanan || "Normal",
      telingaKiri: rawL4.telingaKiri || "Normal",
      skriningJiwa: rawL4.skriningJiwa || "Sudah",
      periksaHb: rawL4.periksaHb || "Sudah"
    };
  } else if (kat.includes('dewasa')) {
    const rawL4 = exam?.langkah4 || {};

    let tbcValue = "Tidak Ada Gejala Batuk > 2 Minggu";
    if (rawL4.batukTbc || rawL4.nafsuMakanTbc || rawL4.bbMenurunTbc || rawL4.lemahLesuTbc || rawL4.berkeringatMalamTbc || rawL4.batukDarahTbc || rawL4.sesakNafasTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.nafsuMakanTbc, rawL4.bbMenurunTbc, rawL4.lemahLesuTbc, rawL4.berkeringatMalamTbc, rawL4.batukDarahTbc, rawL4.sesakNafasTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala TBC (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    let pendengaranVal = "Tes Berbisik (Normal - Kanan & Kiri Baik)";
    if (rawL4.pendengaran) {
      pendengaranVal = rawL4.pendengaran;
    } else if (rawL4.telingaKanan || rawL4.telingaKiri) {
      pendengaranVal = `Kanan: ${rawL4.telingaKanan || 'Normal'} • Kiri: ${rawL4.telingaKiri || 'Normal'}`;
    }

    let penglihatanVal = "Tes Hitung Jari 6/6 (Normal)";
    if (rawL4.penglihatan) {
      penglihatanVal = rawL4.penglihatan;
    } else if (rawL4.mataKanan || rawL4.mataKiri) {
      penglihatanVal = `Kanan: ${rawL4.mataKanan || 'Normal'} • Kiri: ${rawL4.mataKiri || 'Normal'}`;
    }

    l4 = {
      gulaDarah: rawL4.gulaDarah || "110 mg/dL (GDS Normal < 140 mg/dL)",
      kolesterol: rawL4.kolesterol ? (typeof rawL4.kolesterol === 'string' && rawL4.kolesterol.includes('mg/dL') ? rawL4.kolesterol : `${rawL4.kolesterol} mg/dL (Normal < 200 mg/dL)`) : "175 mg/dL (Normal < 200 mg/dL)",
      puma: rawL4.puma || "Skor PUMA Rendah / Risiko PPOK Minimal",
      kontrasepsi: rawL4.alatKontrasepsi || rawL4.kontrasepsi || "KB Mandiri / Pasangan Memakai KB",
      penglihatan: penglihatanVal,
      pendengaran: pendengaranVal,
      tbc: tbcValue
    };
  } else if (kat.includes('lansia')) {
    const rawL4 = exam?.langkah4 || {};

    let tbcValue = "Tidak Ada Gejala Batuk Kronik (Normal)";
    if (rawL4.batukTbc || rawL4.nafsuMakanTbc || rawL4.bbMenurunTbc || rawL4.lemahLesuTbc || rawL4.berkeringatMalamTbc || rawL4.batukDarahTbc || rawL4.sesakNafasTbc) {
      const hasGejala = [rawL4.batukTbc, rawL4.nafsuMakanTbc, rawL4.bbMenurunTbc, rawL4.lemahLesuTbc, rawL4.berkeringatMalamTbc, rawL4.batukDarahTbc, rawL4.sesakNafasTbc].some(v => v === 'Ya');
      tbcValue = hasGejala ? "Berisiko TBC (Ada Gejala Terindikasi)" : "Tidak Ada Gejala Batuk Kronik (Normal)";
    } else if (rawL4.tbc) {
      tbcValue = rawL4.tbc;
    }

    let pendengaranVal = "Tes Berbisik (Normal - Kanan & Kiri Baik)";
    if (rawL4.pendengaran) {
      pendengaranVal = rawL4.pendengaran;
    } else if (rawL4.telingaKanan || rawL4.telingaKiri) {
      pendengaranVal = `Kanan: ${rawL4.telingaKanan || 'Normal'} • Kiri: ${rawL4.telingaKiri || 'Normal'}`;
    }

    let penglihatanVal = "Tes Hitung Jari 6/6 (Normal)";
    if (rawL4.penglihatan) {
      penglihatanVal = rawL4.penglihatan;
    } else if (rawL4.mataKanan || rawL4.mataKiri) {
      penglihatanVal = `Kanan: ${rawL4.mataKanan || 'Normal'} • Kiri: ${rawL4.mataKiri || 'Normal'}`;
    }

    l4 = {
      gulaDarah: rawL4.gulaDarah || "128 mg/dL (GDS Normal < 140 mg/dL)",
      kolesterol: rawL4.kolesterol ? (typeof rawL4.kolesterol === 'string' && rawL4.kolesterol.includes('mg/dL') ? rawL4.kolesterol : `${rawL4.kolesterol} mg/dL (Normal < 200 mg/dL)`) : "185 mg/dL (Normal < 200 mg/dL)",
      tbc: tbcValue,
      penglihatan: penglihatanVal,
      pendengaran: pendengaranVal,
      puma: rawL4.puma || "Skor PUMA Rendah / Risiko PPOK Minimal",
      aksScore: rawL4.aksScore ? (typeof rawL4.aksScore === 'number' ? `${rawL4.aksScore} / 20 (${rawL4.aksKategori || 'Mandiri'})` : rawL4.aksScore) : "20 / 20 (Mandiri Penuh)",
      skilasStatus: rawL4.skilasStatus || "Tidak Ditemukan Penurunan Kapasitas Intrinsik (SKILAS Normal)"
    };
  } else if (exam?.langkah4 && Object.keys(exam.langkah4).length > 0) {
    l4 = { ...exam.langkah4 };
  } else if (kat.includes('usekrem') || kat.includes('remaja')) {
    l4 = {
      hb: "13.8 g/dL (Normal / Bebas Anemia)",
      ttd: citizen.gender === 'Perempuan' ? "Diminum Rutin 1x Seminggu" : "Tidak Diperlukan (Laki-laki)",
      perilaku: "Bebas Rokok & Napza / Gaya Hidup Sehat",
      gigi: "Kesehatan Gigi & Mulut Baik",
      tbc: "Tidak Ada Gejala Batuk Kronik"
    };
  } else {
    l4 = {
      tbc: "Tidak Ada Gejala TBC",
      skriningKesehatan: isExamined ? "Normal / Sesuai Usia" : "Belum Diperiksa"
    };
  }

  // 5. LANGKAH 5: Penyuluhan & Tindak Lanjut Rujukan
  let l5 = {};
  if (exam?.langkah5 && (exam.langkah5.penyuluhan || exam.langkah5.topikPenyuluhan)) {
    l5 = {
      penyuluhan: exam.langkah5.penyuluhan || exam.langkah5.topikPenyuluhan,
      rujukan: exam.langkah5.rujukan || exam.langkah5.statusRujukan || 'Tidak Perlu Rujukan'
    };
  } else if (kat.includes('bumil')) {
    l5 = {
      penyuluhan: "Gizi Seimbang Ibu Hamil, Tanda Bahaya Kehamilan & Kesiapan Persalinan",
      rujukan: "Tidak Perlu Rujukan (Kontrol Rutin ANC Posyandu / Bidan)"
    };
  } else if (kat.includes('nifas')) {
    l5 = {
      penyuluhan: "Perawatan Masa Nifas, Teknik Menyusui yang Baik & Nutrisi Ibu Menyusui",
      rujukan: "Tidak Perlu Rujukan (Kondisi Ibu & Bayi Baik)"
    };
  } else if (kat.includes('bayi')) {
    l5 = {
      penyuluhan: "ASI Eksklusif, Pengenalan MP-ASI Kaya Protein Hewani & Imunisasi Lanjutan",
      rujukan: "Tidak Perlu Rujukan (Tumbuh Kembang Optimal)"
    };
  } else if (kat.includes('balita')) {
    l5 = {
      penyuluhan: "Gizi Seimbang Balita, Pemberian PMT Berprotein & Pencegahan Stunting",
      rujukan: "Tidak Perlu Rujukan (Pemantauan Rutin Bulanan Posyandu)"
    };
  } else if (kat.includes('apras')) {
    l5 = {
      penyuluhan: "Edukasi Kebersihan Diri, Cuci Tangan Pakai Sabun & Gizi Anak Pra Sekolah",
      rujukan: "Tidak Perlu Rujukan (Pertumbuhan Baik)"
    };
  } else if (kat.includes('6-14') || subKat.includes('6-14')) {
    l5 = {
      penyuluhan: exam?.langkah5?.penyuluhan || "Gizi seimbang anak usia sekolah, aktivitas fisik rutin, dan pembatasan screen time.",
      rujukan: exam?.langkah5?.rujukan || "Tidak Perlu Rujukan (Pertumbuhan & Indera Normal)"
    };
  } else if (kat.includes('usekrem') || kat.includes('remaja')) {
    l5 = {
      penyuluhan: "Pencegahan Anemia Remaja, Bahaya Merokok & Pola Hidup Bersih Sehat",
      rujukan: "Tidak Perlu Rujukan (Kondisi Kesehatan Remaja Sangat Baik)"
    };
  } else if (kat.includes('dewasa')) {
    l5 = {
      penyuluhan: "Pengendalian Hipertensi, Skrining PTM Rutin & Batasi Konsumsi Gula Garam",
      rujukan: "Tidak Perlu Rujukan (Skrining PTM Tahunan Posyandu Rutin)"
    };
  } else if (kat.includes('lansia')) {
    l5 = {
      penyuluhan: "Kesehatan Lansia SMART, Diet Rendah Garam, Pencegahan Jatuh & Senam Rutin",
      rujukan: "Tidak Perlu Rujukan (Pemantauan Bulanan Posyandu Lansia)"
    };
  } else {
    l5 = {
      penyuluhan: isExamined ? `Gizi Seimbang & Hidup Bersih Sehat (${citizen.kategori})` : 'Belum Ada Catatan',
      rujukan: isExamined ? 'Tidak Perlu Rujukan' : 'Silakan Lakukan Pemeriksaan'
    };
  }

  return {
    ...citizen,
    tglPeriksa,
    isExamined,
    langkah1: l1,
    categoryMetaL1,
    langkah2: l2,
    langkah3: l3,
    langkah4: l4,
    langkah5: l5
  };
};

export default function DetailRekapModal({ 
  citizen, 
  selectedCitizen,
  onClose, 
  onHide,
  show = true,
  examData = null,
  theme = 'kader', // 'kader' | 'puskesmas' | 'dinkes'
  themeColor = null,
  roleTitle = null,
  onEdit = null 
}) {
  if (show === false) return null;
  const targetCitizen = citizen || selectedCitizen;
  if (!targetCitizen) return null;

  const data = resolve5StepDetails(targetCitizen, examData);
  if (!data) return null;

  const handleClose = onClose || onHide || (() => {});
  const isDinkes = theme === 'dinkes' || (themeColor && themeColor.includes('1e3a8a')) || roleTitle?.toLowerCase().includes('dinas');
  const isPuskesmas = theme === 'puskesmas' || roleTitle?.toLowerCase().includes('puskesmas');
  const primaryColor = themeColor || (isDinkes ? '#1e3a8a' : isPuskesmas ? '#428A75' : '#2b2e4a');
  const accentColor = isDinkes ? '#1e3a8a' : isPuskesmas ? '#428A75' : '#F25B8E';

  // Label dictionaries
  const l2LabelMap = {
    bb: "Berat Badan (BB)",
    tb: "Tinggi Badan (TB)",
    pb: "Panjang Badan (PB)",
    lingkarKepala: "Lingkar Kepala (LK)",
    lila: "Lingkar Lengan Atas (LiLA)",
    lingkarPerut: "Lingkar Perut (LP)",
    tensi: "Tekanan Darah",
    usiaKehamilan: "Usia Kehamilan",
    tfu: "Tinggi Fundus Uteri (TFU)",
    djj: "Denyut Jantung Janin (DJJ)",
    hariNifas: "Hari Nifas",
    suhu: "Suhu Tubuh"
  };

  const l3LabelMap = {
    imtStatus: "Status IMT / Kategori IMT",
    bbU: "Plotting Berat Badan Menurut Usia (BB/U)",
    tbU: "Plotting Tinggi / Panjang Badan Menurut Usia (TB/U)",
    bbTb: "Plotting BB Menurut TB (BB/TB)",
    lingkarKepala: "Plotting Lingkar Kepala",
    stuntingStatus: "Evaluasi Status Stunting",
    lilaStatus: "Plotting LiLA (KEK/Normal)",
    tensiStatus: "Plotting Tekanan Darah",
    lpStatus: "Plotting Lingkar Perut",
    kenaikanBB: "Evaluasi Kenaikan Berat Badan",
    perkembangan: "Status Tumbuh Kembang",
    imtU: "Plotting IMT / U",
    statusGizi: "Status Gizi Klinis"
  };

  const l4LabelMap = {
    hb: "Kadar Hemoglobin (Hb)",
    ttd: "Tablet Tambah Darah (TTD)",
    mataKanan: "Tes Penglihatan (Mata Kanan)",
    mataKiri: "Tes Penglihatan (Mata Kiri)",
    telingaKanan: "Tes Pendengaran (Telinga Kanan)",
    telingaKiri: "Tes Pendengaran (Telinga Kiri)",
    skriningJiwa: "Melakukan Skrining Jiwa",
    periksaHb: "Periksa Kadar Hemoglobin (Hb)",
    pemberianTtd: "Pemberian Tablet Tambah Darah (TTD) / MMS oleh Nakes",
    rutinTtd: "Konsumsi Tablet Tambah Darah (TTD) / MMS Rutin",
    komposisiMtBumil: "Pemberian Makanan Tambahan (MT) Bumil KEK (Komposisi & Porsi)",
    rutinMtBumil: "Rutin Konsumsi Makanan Tambahan (MT) Bumil KEK",
    bukuKia: "Kepemilikan Buku KIA",
    tempatImunisasi: "Tempat Pelaksanaan Imunisasi",
    jenisImunisasi: "Jenis Imunisasi",
    asiEksklusif: "Pemberian ASI Eksklusif",
    mpAsi: "Pemberian Makanan Pendamping ASI (MP ASI)",
    tbc: "Skrining Gejala Tuberkulosis (TBC)",
    pmtPemulihan: "Pemberian Makanan Tambahan (PMT) Pemulihan",
    pmtHabis: "Konsumsi PMT Dihabiskan",
    vitA: "Pemberian Kapsul Vitamin A",
    ikutKelasBalita: "Mengikuti Kelas Ibu Balita",
    obatCacing: "Pemberian Obat Pencegahan Cacingan",
    imunisasi: "Status Imunisasi Dasar Lengkap",
    gulaDarah: "Kadar Gula Darah Sewaktu (GDS)",
    kolesterol: "Kadar Kolesterol Total",
    penglihatan: "Tes Penglihatan (Hitung Jari)",
    pendengaran: "Tes Pendengaran (Tes Berbisik)",
    puma: "Skrining PPOK (Kuesioner PUMA)",
    asi: "Konseling & Edukasi ASI Eksklusif",
    sdidtk: "Stimulasi, Deteksi & Intervensi Dini Tumbuh Kembang (SDIDTK / KPSP)",
    mataTelinga: "Pemeriksaan Kesehatan Mata & Telinga",
    gigi: "Pemeriksaan Kesehatan Gigi & Mulut",
    perilaku: "Skrining Perilaku Hidup Bersih & Sehat (PHBS)",
    kontrasepsi: "Penggunaan Alat Kontrasepsi / Pelayanan KB",
    jumlahVitA: "Pemberian Kapsul Vitamin A oleh Nakes",
    rutinVitA: "Rutin Konsumsi Vitamin A",
    menyusui: "Praktik Menyusui",
    kbPascaPersalinan: "Pelayanan KB Pasca Persalinan",
    vitANifas: "Pemberian Vitamin A Ibu Nifas",
    ttdNifas: "Pemberian Tablet Tambah Darah (TTD) Ibu Nifas",
    tandaBahaya: "Skrining Tanda Bahaya Masa Nifas",
    aksScore: "Total Skor Aktivitas Kehidupan Sehari-hari (AKS Barthel)",
    aksKategori: "Tingkat Kemandirian AKS",
    skilasStatus: "Hasil Skrining Skrining Lansia Sederhana (SKILAS Geriatri)",
    faktorRisiko: "Skrining Faktor Risiko Kehamilan"
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          {/* Modal Header */}
          <div 
            className="modal-header text-white p-3 px-4 d-flex align-items-center justify-content-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-white text-dark fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                  {data.kategori} {data.subText ? `(${data.subText})` : ''}
                </span>
                <span className="badge bg-white bg-opacity-25 text-white px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                  Tanggal Pemeriksaan: {data.tglPeriksa}
                </span>
              </div>
              <h5 className="modal-title fw-bold text-white mb-0">Detail Rekap Pemeriksaan</h5>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label="Tutup"
            ></button>
          </div>

          {/* Single-Page Scrollable Modal Body (All 5 Steps) */}
          <div className="modal-body p-4 bg-light">
            
            {/* SECTION 1: LANGKAH 1 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <User size={18} style={{ color: accentColor }} />
                <span>Langkah 1: Identitas Sasaran ({data.kategori})</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>NIK (16 Digit)</div>
                    <div className="fw-bold font-monospace text-dark fs-6">{data.langkah1.nik}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Nama Lengkap</div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.nama}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Tanggal Lahir</div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.tglLahir}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Jenis Kelamin</div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.gender}</div>
                  </div>
                </div>
                {/* Parent / Spouse Card (Hidden for Dewasa and Lansia) */}
                {!['dewasa', 'lansia', 'usia produktif'].some(k => (data.kategori || '').toLowerCase().includes(k)) && (
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      {(() => {
                        const raw = data.langkah1.ibu || data.langkah1.suami || data.langkah1.keteranganKeluarga || data.keteranganKeluarga || targetCitizen.keteranganIbuSuami || '';
                        let label = 'Nama Orang Tua';
                        let val = raw;

                        const isBumilOrNifas = (data.kategori || '').toLowerCase().includes('bumil') || (data.kategori || '').toLowerCase().includes('nifas');
                        if (isBumilOrNifas) {
                          label = 'Nama Suami';
                          val = targetCitizen.namaSuami || targetCitizen.namaAyah || (raw ? raw.replace(/^(suami|ayah):\s*/i, '').trim() : '-');
                        } else if (targetCitizen.namaIbu || raw.toLowerCase().startsWith('ibu:')) {
                          label = 'Nama Ibu';
                          val = targetCitizen.namaIbu || raw.replace(/^ibu:\s*/i, '').trim();
                        } else if (targetCitizen.namaAyah || raw.toLowerCase().startsWith('ayah:')) {
                          label = 'Nama Ayah';
                          val = targetCitizen.namaAyah || raw.replace(/^ayah:\s*/i, '').trim();
                        } else if (targetCitizen.namaSuami || raw.toLowerCase().startsWith('suami:')) {
                          label = 'Nama Suami';
                          val = targetCitizen.namaSuami || raw.replace(/^suami:\s*/i, '').trim();
                        }

                        return (
                          <>
                            <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                              {label}
                            </div>
                            <div className="fw-bold text-dark fs-6">
                              {val || '-'}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Alamat Domisili</div>
                    <div className="fw-bold text-dark fs-6">{data.langkah1.alamat}</div>
                  </div>
                </div>

                {/* Additional Category Metadata in Langkah 1 */}
                {data.categoryMetaL1 && Object.entries(data.categoryMetaL1).map(([k, v]) => (
                  <div className="col-12 col-md-6" key={k}>
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{k}</div>
                      <div className="fw-bold text-dark fs-6">{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: LANGKAH 2 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Activity size={18} style={{ color: accentColor }} />
                <span>Langkah 2: Skrining Penimbangan &amp; Pengukuran Antropometri</span>
              </h6>
              <div className="row g-3">
                {Object.entries(data.langkah2).map(([key, val]) => (
                  <div className="col-12 col-sm-6 col-md-4" key={key}>
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {l2LabelMap[key] || key}
                      </div>
                      <div className="fs-5 fw-bold text-dark">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: LANGKAH 3 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <BarChart2 size={18} style={{ color: accentColor }} />
                <span>Langkah 3: Plotting Evaluasi Otomatis &amp; Status Gizi</span>
              </h6>
              <div className="row g-3">
                {Object.entries(data.langkah3).map(([key, val]) => (
                  <div className="col-12" key={key}>
                    <div className="p-3 bg-light rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                      <div>
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {l3LabelMap[key] || key}
                        </div>
                        <div className="fw-bold text-dark fs-6">{val}</div>
                      </div>
                      <div>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 small fw-semibold">
                          <CheckCircle2 size={13} /> Evaluasi Terverifikasi
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: LANGKAH 4 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Stethoscope size={18} style={{ color: accentColor }} />
                <span>Langkah 4: Skrining PTM, Gejala TBC &amp; Pelayanan Spesifik ({data.kategori})</span>
              </h6>
              <div className="row g-3">
                {Object.entries(data.langkah4).map(([key, val]) => (
                  <div className="col-12 col-md-6" key={key}>
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {l4LabelMap[key] || key}
                      </div>
                      <div className="fw-bold text-dark fs-6">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: LANGKAH 5 */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <HeartHandshake size={18} style={{ color: accentColor }} />
                <span>Langkah 5: Penyuluhan &amp; Tindak Lanjut Rujukan</span>
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Topik Penyuluhan &amp; Edukasi Kesehatan
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah5.penyuluhan}</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Status Rujukan &amp; Rekomendasi Petugas
                    </div>
                    <div className="fw-bold text-dark fs-6">{data.langkah5.rujukan}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-between align-items-center">
            {!isPuskesmas && onEdit ? (
              <button 
                type="button" 
                className="btn btn-dark-custom btn-sm px-3 rounded-3 d-inline-flex align-items-center gap-1.5 text-white fw-semibold"
                style={{ backgroundColor: '#2b2e4a' }}
                onClick={() => onEdit(data)}
              >
                <Edit3 size={14} /> Edit Data
              </button>
            ) : (
              <div className="text-muted small d-flex align-items-center gap-1.5">
                <ShieldCheck size={16} style={{ color: primaryColor }} />
                <span>Data tersinkronisasi realtime dengan Sistem Posyandu &amp; Puskesmas</span>
              </div>
            )}
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm px-4 rounded-3" 
              onClick={handleClose}
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
