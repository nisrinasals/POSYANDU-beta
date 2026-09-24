import React, { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  User, 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Plus, 
  ChevronRight,
  Clock,
  Calendar
} from 'lucide-react';
import { kategoriPemeriksaan } from '../../data/mockData';
import { useNotification } from '../../context/NotificationContext';
import { validateNik, formatNikInput, validateMeasurements } from '../../utils/validators';
import GrowthChartPlotter from '../../components/pemeriksaan/GrowthChartPlotter';
import { pemeriksaanService, kunjunganService } from '../../services';

// Opsi Langkah 1: Pemeriksaan Sesuai Umur Kehamilan (Ibu Hamil) - Format Buku KIA
const OPSI_UMUR_KEHAMILAN_BUMIL = [
  '<4 minggu',
  '4-8 minggu',
  '8-12 minggu',
  '12-16 minggu',
  '16-20 minggu',
  '20-24 minggu',
  '24-28 minggu',
  '28-32 minggu',
  '32-36 minggu',
  '36-40 minggu'
];

// Opsi Langkah 1: Waktu ke Posyandu (Ibu Nifas & Menyusui) - Format Buku KIA
const OPSI_WAKTU_NIFAS_MENYUSUI = [
  '< 7 hari',
  '7-28 hari',
  '28-42 hari',
  'Bln 2',
  'Bln 3',
  'Bln 4',
  'Bln 5',
  'Bln 6',
  'Bln 7',
  'Bln 8',
  'Bln 9',
  'Bln 10',
  'Bln 11',
  'Bln 12',
  'Bln 13',
  'Bln 14',
  'Bln 15',
  'Bln 16',
  'Bln 17',
  'Bln 18',
  'Bln 19',
  'Bln 20',
  'Bln 21',
  'Bln 22',
  'Bln 23',
  'Bln 24'
];

// Opsi Langkah 1: Pemeriksaan Sesuai Umur Sasaran Bayi 0–11 Bln
const OPSI_UMUR_BAYI_0_11 = Array.from({ length: 12 }, (_, i) => `${i} Bln`);

// Opsi Langkah 1: Pemeriksaan Sesuai Umur Sasaran Balita 12–59 Bln
const OPSI_UMUR_BALITA_12_59 = Array.from({ length: 48 }, (_, i) => `${i + 12} Bln`);

// Opsi Langkah 1: Pemeriksaan Sesuai Umur Sasaran Apras 60–72 Bln
const OPSI_UMUR_APRAS_60_72 = Array.from({ length: 13 }, (_, i) => `${i + 60} Bln`);

// Helper: Kalkulasi Tingkat Ketergantungan AKS (Barthel Index)
const calculateAks = (form = {}) => {
  const fields = [form.aksBab, form.aksBak, form.aksCuciMuka, form.aksWc, form.aksMakan, form.aksPindah, form.aksJalan, form.aksPakaian, form.aksTangga, form.aksMandi];
  const isAnyAnswered = fields.some(f => f !== '' && f !== undefined && f !== null);
  if (!isAnyAnswered) {
    return { total: 0, kategori: 'Belum Diisi', shortCode: '-', perluRujuk: false, isAnswered: false };
  }
  const bab = form.aksBab !== '' && form.aksBab !== undefined && form.aksBab !== null ? Number(form.aksBab) : 0;
  const bak = form.aksBak !== '' && form.aksBak !== undefined && form.aksBak !== null ? Number(form.aksBak) : 0;
  const cuciMuka = form.aksCuciMuka !== '' && form.aksCuciMuka !== undefined && form.aksCuciMuka !== null ? Number(form.aksCuciMuka) : 0;
  const wc = form.aksWc !== '' && form.aksWc !== undefined && form.aksWc !== null ? Number(form.aksWc) : 0;
  const makan = form.aksMakan !== '' && form.aksMakan !== undefined && form.aksMakan !== null ? Number(form.aksMakan) : 0;
  const pindah = form.aksPindah !== '' && form.aksPindah !== undefined && form.aksPindah !== null ? Number(form.aksPindah) : 0;
  const jalan = form.aksJalan !== '' && form.aksJalan !== undefined && form.aksJalan !== null ? Number(form.aksJalan) : 0;
  const pakaian = form.aksPakaian !== '' && form.aksPakaian !== undefined && form.aksPakaian !== null ? Number(form.aksPakaian) : 0;
  const tangga = form.aksTangga !== '' && form.aksTangga !== undefined && form.aksTangga !== null ? Number(form.aksTangga) : 0;
  const mandi = form.aksMandi !== '' && form.aksMandi !== undefined && form.aksMandi !== null ? Number(form.aksMandi) : 0;
  const total = bab + bak + cuciMuka + wc + makan + pindah + jalan + pakaian + tangga + mandi;

  let kategori = 'Mandiri (M = 20)';
  let shortCode = 'M';
  let perluRujuk = false;

  if (total === 20) {
    kategori = 'Mandiri (M = 20)';
    shortCode = 'M';
    perluRujuk = false;
  } else if (total >= 12 && total <= 19) {
    kategori = 'Ketergantungan Ringan (R = 12-19)';
    shortCode = 'R';
    perluRujuk = true;
  } else if (total >= 9 && total <= 11) {
    kategori = 'Ketergantungan Sedang (S = 9-11)';
    shortCode = 'S';
    perluRujuk = true;
  } else if (total >= 5 && total <= 8) {
    kategori = 'Ketergantungan Berat (B = 5-8)';
    shortCode = 'B';
    perluRujuk = true;
  } else {
    kategori = 'Ketergantungan Total (T = 0-4)';
    shortCode = 'T';
    perluRujuk = true;
  }

  return { total, kategori, shortCode, perluRujuk, isAnswered: true };
};

// Helper: Evaluasi 6 Domain Instrumen SKILAS
export const evaluateSkilas = (form = {}) => {
  const skilasFields = [
    form.skilasOrientasi, form.skilasUlangKata, form.skilasTesKursi, form.skilasBbTurun,
    form.skilasNafsuMakan, form.skilasLilaKurang, form.skilasMasalahMata, form.skilasTesLihat,
    form.skilasTesBisik, form.skilasPerasaanSedih, form.skilasHilangMinat
  ];
  const isAnyAnswered = skilasFields.some(f => f !== '' && f !== undefined && f !== null);
  if (!isAnyAnswered) {
    return { adaRisiko: false, statusText: 'Belum Diisi', issues: [], isAnswered: false };
  }
  const issues = [];
  if (form.skilasOrientasi === 'Tidak') issues.push('Orientasi waktu & tempat');
  if (form.skilasUlangKata === 'Tidak') issues.push('Mengulang 3 kata');
  if (form.skilasTesKursi === 'Tidak') issues.push('Tes berdiri dari kursi');
  if (form.skilasBbTurun === 'Ya') issues.push('BB turun >3kg / baju longgar');
  if (form.skilasNafsuMakan === 'Ya') issues.push('Hilang nafsu makan');
  if (form.skilasLilaKurang === 'Ya') issues.push('LiLA < 21 cm');
  if (form.skilasMasalahMata === 'Ya') issues.push('Masalah mata / penglihatan');
  if (form.skilasTesLihat === 'Tidak') issues.push('Tes melihat');
  if (form.skilasTesBisik === 'Tidak') issues.push('Tes berbisik (pendengaran)');
  if (form.skilasPerasaanSedih === 'Ya') issues.push('Perasaan sedih / putus asa');
  if (form.skilasHilangMinat === 'Ya') issues.push('Kehilangan minat aktivitas');

  const adaRisiko = issues.length > 0;
  return {
    adaRisiko,
    statusText: adaRisiko ? `Ada Risiko (${issues.length} Domain)` : 'Semua Domain Normal',
    issues,
    isAnswered: true
  };
};

// Helper: Kalkulasi Skrining Kesehatan Jiwa Dewasa (PHQ-4/SRQ Ringkas)
export const calculateJiwa = (form = {}) => {
  const fields = [form.jiwaQ1, form.jiwaQ2, form.jiwaQ3, form.jiwaQ4];
  const isAnyAnswered = fields.some(f => f !== '' && f !== undefined && f !== null);
  if (!isAnyAnswered) {
    return { total: 0, kategori: 'Belum Diisi', isRisiko: false, isAnswered: false, bulan: form.jiwaBulan || 'September' };
  }
  const q1 = form.jiwaQ1 !== '' && form.jiwaQ1 !== undefined && form.jiwaQ1 !== null ? Number(form.jiwaQ1) : 0;
  const q2 = form.jiwaQ2 !== '' && form.jiwaQ2 !== undefined && form.jiwaQ2 !== null ? Number(form.jiwaQ2) : 0;
  const q3 = form.jiwaQ3 !== '' && form.jiwaQ3 !== undefined && form.jiwaQ3 !== null ? Number(form.jiwaQ3) : 0;
  const q4 = form.jiwaQ4 !== '' && form.jiwaQ4 !== undefined && form.jiwaQ4 !== null ? Number(form.jiwaQ4) : 0;
  const total = q1 + q2 + q3 + q4;

  const isRisiko = total >= 6;
  const kategori = isRisiko 
    ? 'Risiko Masalah Kesehatan Jiwa (≥ 6: Perlu Konseling/Rujukan)' 
    : 'Normal / Sehat Jiwa (< 6)';

  return {
    total,
    kategori,
    isRisiko,
    isAnswered: true,
    bulan: form.jiwaBulan || 'September'
  };
};

// Komponen Radio Button Interaktif untuk opsi Ya / Tidak (atau Sudah / Belum)
export function YesNoRadio({
  name,
  value,
  onChange,
  className = "",
  yesLabel = "Ya",
  noLabel = "Tidak",
  yesValue = "Ya",
  noValue = "Tidak"
}) {
  const hasValue = value !== '' && value !== null && value !== undefined;
  const isYes = hasValue && (String(value) === String(yesValue) || (yesValue === "Ya" && (value === 1 || value === true)));
  const isNo = hasValue && (String(value) === String(noValue) || (noValue === "Tidak" && (value === 0 || value === false)));
  const isNumeric = typeof value === 'number' || (hasValue && !isNaN(Number(value)) && (yesValue === 1 || noValue === 0));

  const yaId = `${name}_ya`;
  const tidakId = `${name}_tidak`;

  return (
    <div className={`d-flex align-items-center gap-3 ${className}`}>
      <div className="form-check form-check-inline m-0 d-flex align-items-center gap-1.5">
        <input
          className="form-check-input m-0 cursor-pointer"
          type="radio"
          id={yaId}
          name={name}
          checked={isYes}
          onChange={() => onChange(isNumeric ? 1 : yesValue)}
          style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
        />
        <label 
          className="form-check-label cursor-pointer text-dark small fw-medium mb-0" 
          htmlFor={yaId}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          {yesLabel}
        </label>
      </div>

      <div className="form-check form-check-inline m-0 d-flex align-items-center gap-1.5">
        <input
          className="form-check-input m-0 cursor-pointer"
          type="radio"
          id={tidakId}
          name={name}
          checked={isNo}
          onChange={() => onChange(isNumeric ? 0 : noValue)}
          style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
        />
        <label 
          className="form-check-label cursor-pointer text-dark small fw-medium mb-0" 
          htmlFor={tidakId}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          {noLabel}
        </label>
      </div>
    </div>
  );
}

// Komponen Kotak Pertanyaan Bergaris (Bordered Question Card) untuk opsi Ya / Tidak (atau Sudah / Belum)
export function YesNoCard({
  label,
  name,
  value,
  onChange,
  className = "",
  yesLabel = "Ya",
  noLabel = "Tidak",
  yesValue = "Ya",
  noValue = "Tidak"
}) {
  return (
    <div 
      className={`p-3 rounded-3 border bg-white h-100 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2.5 ${className}`}
      style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
    >
      <span className="fw-medium text-dark small mb-0">
        {label}
      </span>
      <YesNoRadio
        name={name}
        value={value}
        onChange={onChange}
        className="flex-shrink-0"
        yesLabel={yesLabel}
        noLabel={noLabel}
        yesValue={yesValue}
        noValue={noValue}
      />
    </div>
  );
}

export default function PemeriksaanPage({ 
  activeSubmenu = 'bumil', 
  onNavigate,
  globalSasaranList = [],
  setGlobalSasaranList,
  globalPemeriksaanData = {},
  setGlobalPemeriksaanData,
  activePemeriksaanWargaId,
  onRefreshData
}) {

  const ensureKunjunganId = async (warga) => {
    if (!warga?.id) throw new Error('Warga pemeriksaan tidak valid.');

    // Reuse today's queue entry when one already exists.
    try {
      const queueRes = await kunjunganService.getAntreanHariIni();
      const queue = Array.isArray(queueRes?.data) ? queueRes.data : [];
      const existing = queue.find((item) =>
        Number(item.warga_id || item.warga?.id) === Number(warga.id)
      );
      if (existing?.id) return existing.id;
    } catch (error) {
      // Continue by looking for an open session.
    }

    const posyanduId = warga?._raw?.posyandu_id || warga?.posyandu_id;
    if (!posyanduId) {
      throw new Error('Warga belum memiliki Posyandu pada backend.');
    }

    const sesiRes = await sesiService.getSesiList({
      page: 1,
      limit: 100,
      posyandu_id: posyanduId,
      status: 'open'
    });
    const sessions = Array.isArray(sesiRes?.data) ? sesiRes.data : [];
    const today = new Date().toISOString().slice(0, 10);
    const session =
      sessions.find((item) => String(item.tanggal_pelaksanaan).slice(0, 10) === today) ||
      sessions[0];

    if (!session?.id) {
      throw new Error('Tidak ada sesi Posyandu terbuka. Buat atau buka sesi Posyandu terlebih dahulu.');
    }

    const visitRes = await kunjunganService.createKunjungan({
      warga_id: Number(warga.id),
      sesi_posyandu_id: Number(session.id)
    });

    if (!visitRes?.data?.id) {
      throw new Error('Backend tidak mengembalikan ID kunjungan.');
    }
    return visitRes.data.id;
  };

  const { showSuccess, showWarning } = useNotification();
  const currentCategory = kategoriPemeriksaan.find(c => c.id === activeSubmenu) || kategoriPemeriksaan[0];

  // 1. Mode State: 'per-step' (Pilih Langkah) vs 'sequential' (Bertahap)
  const [examinationMode, setExaminationMode] = useState('per-step');

  // 2. Active Step State (1, 2, 3, 4, 5)
  const [activeStep, setActiveStep] = useState(1);

  // 3. Preview Modal State for Mode Bertahap
  const [showSequentialPreviewModal, setShowSequentialPreviewModal] = useState(false);

  // Helper to determine baby/child age in months
  const getAgeInMonths = (warga) => {
    if (!warga) return 0;
    if (warga.usia && typeof warga.usia === 'string' && warga.usia.toLowerCase().includes('bulan')) {
      const parsed = parseInt(warga.usia);
      if (!isNaN(parsed)) return parsed;
    }
    if (warga.tglLahir) {
      try {
        const birth = new Date(warga.tglLahir);
        const now = new Date();
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        return Math.max(0, months);
      } catch {
        return 0;
      }
    }
    return 0;
  };

  const currentMonthNum = new Date().getMonth() + 1;
  const isBulanVitA = currentMonthNum === 2 || currentMonthNum === 8;

  // Active citizens in this category
  const activeWargaList = useMemo(() => {
    return (globalSasaranList || []).filter(s => {
      if (!s) return false;
      if (s.subKategori === activeSubmenu || s.kategori_sasaran === activeSubmenu) return true;
      const katLower = String(s.kategori || '').toLowerCase();
      if (activeSubmenu === 'bumil' && katLower.includes('bumil')) return true;
      if (activeSubmenu === 'nifas' && (katLower.includes('nifas') || katLower.includes('menyusui') || katLower.includes('busui'))) return true;
      if (activeSubmenu === 'bayi-0-11' && katLower.includes('bayi')) return true;
      if (activeSubmenu === 'balita-12-59' && katLower.includes('balita')) return true;
      if (activeSubmenu === 'apras' && katLower.includes('apras')) return true;
      if (activeSubmenu === 'usekrem-6-14' && (katLower.includes('6-14') || katLower.includes('6 - 14') || katLower.includes('sekolah'))) return true;
      if (activeSubmenu === 'usekrem-15-18' && (katLower.includes('15-18') || katLower.includes('15 - 18') || katLower.includes('remaja'))) return true;
      if (activeSubmenu === 'dewasa' && katLower === 'dewasa') return true;
      if (activeSubmenu === 'lansia' && katLower === 'lansia') return true;
      return false;
    });
  }, [globalSasaranList, activeSubmenu]);

  // Selected Warga ID for Sequential Mode
  const [selectedWargaId, setSelectedWargaId] = useState('');

  // Tracking step completion and data per citizen
  // Format: { [wargaId]: { step1: true, step2: bool, step3: bool, step4: bool, step5: bool } }
  const [completedSteps, setCompletedSteps] = useState({});
  const [stepDataByWarga, setStepDataByWarga] = useState({});

  // Presensi Kehadiran Langkah 1 (Status Kehadiran Hari Ini: { [wargaId]: true/false })
  const [kehadiranWarga, setKehadiranWarga] = useState({});

  // Keterangan Waktu Kunjungan Langkah 1 (Presensi): Minggu (Bumil) / Bulan (Nifas, Bayi, Balita, Apras)
  // Format: { [wargaId]: string }
  const [waktuKunjunganPresensi, setWaktuKunjunganPresensi] = useState({});

  // State pencarian warga di Langkah 1 Presensi
  const [searchWargaQuery, setSearchWargaQuery] = useState('');

  // Sesuai permintaan: Jika belum di-search, data tidak langsung muncul semua.
  // Hanya muncul jika dicari, atau jika sudah ditandai presensinya hari ini.
  const filteredSasaranLangkah1 = useMemo(() => {
    const q = searchWargaQuery.trim().toLowerCase();
    if (q) {
      return activeWargaList.filter(w => 
        (w.nama && w.nama.toLowerCase().includes(q)) || 
        (w.nik && String(w.nik).includes(q)) ||
        (w.alamat && w.alamat.toLowerCase().includes(q))
      );
    }
    // Jika tidak ada kata kunci pencarian, hanya tampilkan yang sudah ditandai presensi (Datang / Tidak Datang)
    return activeWargaList.filter(w => kehadiranWarga[String(w.id)] !== undefined);
  }, [activeWargaList, searchWargaQuery, kehadiranWarga]);

  // Daftar sasaran yang SUDAH HADIR di Langkah 1 untuk kategori ini
  const hadirWargaList = useMemo(() => {
    return activeWargaList.filter(w => kehadiranWarga[String(w.id)] === true);
  }, [activeWargaList, kehadiranWarga]);

  // Di Langkah 2 s/d 5: HANYA menampilkan sasaran yang SUDAH HADIR di Langkah 1
  const availableWargaStep2 = useMemo(() => {
    return hadirWargaList.filter(w => !completedSteps[String(w.id)]?.step2);
  }, [hadirWargaList, completedSteps]);

  const availableWargaStep3 = useMemo(() => {
    return hadirWargaList.filter(w => !completedSteps[String(w.id)]?.step3);
  }, [hadirWargaList, completedSteps]);

  const availableWargaStep4 = useMemo(() => {
    return hadirWargaList.filter(w => !completedSteps[String(w.id)]?.step4);
  }, [hadirWargaList, completedSteps]);

  const availableWargaStep5 = useMemo(() => {
    return hadirWargaList.filter(w => !completedSteps[String(w.id)]?.step5);
  }, [hadirWargaList, completedSteps]);

  // Selected citizen for each step (Step 2 to 5)
  const [selectedWargaStep2, setSelectedWargaStep2] = useState('');
  const [selectedWargaStep3, setSelectedWargaStep3] = useState('');
  const [selectedWargaStep4, setSelectedWargaStep4] = useState('');
  const [selectedWargaStep5, setSelectedWargaStep5] = useState('');

  // Automatically keep selected citizen in sync with available list
  useEffect(() => {
    if (availableWargaStep2.length > 0) {
      if (!availableWargaStep2.some(w => String(w.id) === String(selectedWargaStep2))) {
        setSelectedWargaStep2(String(availableWargaStep2[0].id));
      }
    } else {
      setSelectedWargaStep2('');
    }
  }, [availableWargaStep2, selectedWargaStep2]);

  useEffect(() => {
    if (availableWargaStep3.length > 0) {
      if (!availableWargaStep3.some(w => String(w.id) === String(selectedWargaStep3))) {
        setSelectedWargaStep3(String(availableWargaStep3[0].id));
      }
    } else {
      setSelectedWargaStep3('');
    }
  }, [availableWargaStep3, selectedWargaStep3]);

  useEffect(() => {
    if (availableWargaStep4.length > 0) {
      if (!availableWargaStep4.some(w => String(w.id) === String(selectedWargaStep4))) {
        setSelectedWargaStep4(String(availableWargaStep4[0].id));
      }
    } else {
      setSelectedWargaStep4('');
    }
  }, [availableWargaStep4, selectedWargaStep4]);

  useEffect(() => {
    if (availableWargaStep5.length > 0) {
      if (!availableWargaStep5.some(w => String(w.id) === String(selectedWargaStep5))) {
        setSelectedWargaStep5(String(availableWargaStep5[0].id));
      }
    } else {
      setSelectedWargaStep5('');
    }
  }, [availableWargaStep5, selectedWargaStep5]);

  // Keep selected citizen in sync when changing active category
  useEffect(() => {
    setActiveStep(1);
    setSearchWargaQuery('');
    if (hadirWargaList.length > 0) {
      setSelectedWargaId(String(hadirWargaList[0].id));
    } else {
      setSelectedWargaId('');
    }
  }, [activeSubmenu]);

  // Find active selected citizen record
  const currentSelectedWarga = useMemo(() => {
    return activeWargaList.find(w => String(w.id) === String(selectedWargaId)) || activeWargaList[0] || null;
  }, [activeWargaList, selectedWargaId]);

  // Find active examination data from master dictionary
  const currentExamData = useMemo(() => {
    if (!currentSelectedWarga) return null;
    return (globalPemeriksaanData && (globalPemeriksaanData[currentSelectedWarga.id] || globalPemeriksaanData[String(currentSelectedWarga.id)])) || null;
  }, [globalPemeriksaanData, currentSelectedWarga]);

  // Helper evaluasi riwayat skrining tahunan warga
  const getRiwayatSkriningTahunanInfo = (warga, exam) => {
    if (!warga) {
      return {
        hasHistory: false,
        statusLabel: 'Belum Ada Riwayat',
        badgeClass: 'bg-secondary-subtle text-secondary',
        detailText: 'Belum ada data skrining tahunan tercatat.',
        isCurrentYear: false,
        tglFormatted: '-'
      };
    }

    const examL4 = exam?.langkah4 || {};
    const hasExamAnnual = Boolean(
      examL4.isSkriningTahunan ||
      examL4.is_skrining_tahunan ||
      (examL4.jiwaQ1 !== undefined && examL4.jiwaQ1 !== '') ||
      (examL4.aksBab !== undefined && examL4.aksBab !== '') ||
      (examL4.skilasOrientasi !== undefined && examL4.skilasOrientasi !== '') ||
      (examL4.pumaJk !== undefined && examL4.pumaJk !== '') ||
      (examL4.skriningJiwa && examL4.skriningJiwa !== '')
    );

    let rawDate = null;
    if (hasExamAnnual) {
      rawDate = examL4.tglSkriningTahunan || exam?.tglPemeriksaan || warga.tglSkriningTahunanTerakhir || warga.tglPeriksa;
    } else if (warga.tglSkriningTahunanTerakhir) {
      rawDate = warga.tglSkriningTahunanTerakhir;
    } else if (warga.tglPeriksa && warga.statusPemeriksaan === 'Sudah') {
      rawDate = warga.tglPeriksa;
    }

    if (!rawDate) {
      return {
        hasHistory: false,
        statusLabel: 'Belum Pernah Skrining',
        badgeClass: 'bg-secondary-subtle text-secondary',
        detailText: 'Warga ini belum memiliki riwayat skrining tahunan.',
        isCurrentYear: false,
        tglFormatted: '-'
      };
    }

    let parsedYear = null;
    let formattedDisplay = String(rawDate);

    if (String(rawDate).includes('-')) {
      const parts = String(rawDate).split('-');
      if (parts[0].length === 4) {
        parsedYear = parseInt(parts[0], 10);
        formattedDisplay = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[2].length === 4) {
        parsedYear = parseInt(parts[2], 10);
      }
    }

    const currentYear = new Date().getFullYear();
    const isCurrentYear = parsedYear === currentYear;

    if (isCurrentYear) {
      return {
        hasHistory: true,
        statusLabel: `Sudah Skrining Tahun Ini (${currentYear})`,
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        detailText: `Terakhir diisi pada ${formattedDisplay} (Tahun ${parsedYear}). Lengkap untuk tahun ini.`,
        isCurrentYear: true,
        tglFormatted: formattedDisplay
      };
    } else if (parsedYear) {
      const yearDiff = currentYear - parsedYear;
      return {
        hasHistory: true,
        statusLabel: `Perlu Skrining Tahun Ini (Jadwal ${currentYear})`,
        badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
        detailText: `Terakhir diisi pada ${formattedDisplay} (${yearDiff} tahun lalu - ${parsedYear}). Disarankan untuk dijadwalkan skrining ulang.`,
        isCurrentYear: false,
        tglFormatted: formattedDisplay
      };
    }

    return {
      hasHistory: true,
      statusLabel: 'Riwayat Skrining Tercatat',
      badgeClass: 'bg-info-subtle text-primary border border-info-subtle',
      detailText: `Terakhir diisi pada ${formattedDisplay}.`,
      isCurrentYear: false,
      tglFormatted: formattedDisplay
    };
  };

  // Active citizen for Step 4 (Pelayanan & Skrining) in both modes
  const activeCitizenStep4 = useMemo(() => {
    const targetId = examinationMode === 'per-step' ? selectedWargaStep4 : selectedWargaId;
    return activeWargaList.find(w => String(w.id) === String(targetId)) || currentSelectedWarga || null;
  }, [examinationMode, selectedWargaStep4, selectedWargaId, activeWargaList, currentSelectedWarga]);

  const activeExamDataStep4 = useMemo(() => {
    if (!activeCitizenStep4) return null;
    return (globalPemeriksaanData && (globalPemeriksaanData[activeCitizenStep4.id] || globalPemeriksaanData[String(activeCitizenStep4.id)])) || currentExamData || null;
  }, [activeCitizenStep4, globalPemeriksaanData, currentExamData]);

  const annualScreeningInfo = useMemo(() => {
    return getRiwayatSkriningTahunanInfo(activeCitizenStep4, activeExamDataStep4);
  }, [activeCitizenStep4, activeExamDataStep4]);

  // Helper render riwayat pemeriksaan sebelumnya (ditiadakan sesuai masukan kader)
  const renderRiwayatPemeriksaanTerakhir = () => null;

  // Standard forms state
  const [langkah1Form, setLangkah1Form] = useState({
    nik: '',
    nama: '',
    tglLahir: '',
    gender: '',
    usiaKehamilan: '',
    waktuKunjunganNifas: '',
    usiaBayi: '',
    usiaBalita: '',
    usiaApras: '',
    checklistKia: ''
  });

  const [langkah2Form, setLangkah2Form] = useState({
    bb: '',
    tb: '',
    lila: '',
    lk: '',
    lp: '',
    tensiSistol: '',
    tensiDiastol: '',
    gulaDarah: ''
  });

  const [langkah4Form, setLangkah4Form] = useState({
    isSkriningTahunan: false,
    batukTbc: '',
    demamTbc: '',
    bbTurunTbc: '',
    kontakTbc: '',
    lesuTbc: '',
    jumlahTtd: '',
    pemberianTtd: '',
    rutinTtd: '',
    komposisiMtBumil: '',
    rutinMtBumil: '',
    jumlahVitA: '',
    rutinVitA: '',
    menyusui: '',
    kbPascaPersalinan: '',
    tempatImunisasi: '',
    namaRsImunisasi: '',
    jenisImunisasi: '',
    jenisImunisasiLainnya: '',
    asiEksklusif: '',
    mpAsi: '',
    pmtPemulihan: '',
    pmtHabis: '',
    vitA: '',
    obatCacing: '',
    ikutKelasBalita: '',
    perkembanganSdidtk: '',
    imunisasi: '',
    skriningPtm: '',
    mataKanan: '',
    mataKiri: '',
    telingaKanan: '',
    telingaKiri: '',
    skriningJiwa: '',
    periksaHb: '',
    batukBesarTbc: '',
    nafsuMakanTbc: '',
    bbMenurunTbc: '',
    lemahLesuTbc: '',
    berkeringatMalamTbc: '',
    batukDarahTbc: '',
    sesakNafasTbc: '',
    kolesterol: '',
    alatKontrasepsi: '',
    pumaJk: '',
    pumaUsia: '',
    pumaMerokok: '',
    pumaNapasPendek: '',
    pumaDahak: '',
    pumaBatukFlu: '',
    // Skrining Kesehatan Jiwa - Dewasa & Lansia
    jiwaBulan: 'September',
    jiwaQ1: '',
    jiwaQ2: '',
    jiwaQ3: '',
    jiwaQ4: '',
    // C2. Pemeriksaan Tahunan AKS (Barthel) - Lansia
    aksBab: '',
    aksBak: '',
    aksCuciMuka: '',
    aksWc: '',
    aksMakan: '',
    aksPindah: '',
    aksJalan: '',
    aksPakaian: '',
    aksTangga: '',
    aksMandi: '',
    // C3. Pemeriksaan Tahunan SKILAS - Lansia
    skilasOrientasi: '',
    skilasUlangKata: '',
    skilasTesKursi: '',
    skilasBbTurun: '',
    skilasNafsuMakan: '',
    skilasLilaKurang: '',
    skilasMasalahMata: '',
    skilasTesLihat: '',
    skilasTesBisik: '',
    skilasPerasaanSedih: '',
    skilasHilangMinat: '',
    skilasImunisasiCovid: ''
  });

  const [langkah5Form, setLangkah5Form] = useState({
    topikPenyuluhan: '',
    mengikutiKelas: '',
    statusRujukan: ''
  });

  const [sequentialForm, setSequentialForm] = useState({
    isSkriningTahunan: false,
    nik: '',
    nama: '',
    tglLahir: '',
    gender: '',
    pekerjaan: '',
    statusPernikahan: '',
    sekolah: '',
    kelas: '',
    usiaKehamilan: '',
    waktuKunjunganNifas: '',
    usiaBayi: '',
    usiaBalita: '',
    usiaApras: '',
    checklistKia: '',
    tb: '',
    bb: '',
    lila: '',
    lk: '',
    lp: '',
    tensiSistol: '',
    tensiDiastol: '',
    gulaDarah: '',
    batukTbc: '',
    demamTbc: '',
    bbTurunTbc: '',
    kontakTbc: '',
    lesuTbc: '',
    jumlahTtd: '',
    pemberianTtd: '',
    rutinTtd: '',
    komposisiMtBumil: '',
    rutinMtBumil: '',
    jumlahVitA: '',
    rutinVitA: '',
    menyusui: '',
    kbPascaPersalinan: '',
    tempatImunisasi: '',
    namaRsImunisasi: '',
    jenisImunisasi: '',
    jenisImunisasiLainnya: '',
    asiEksklusif: '',
    mpAsi: '',
    pmtPemulihan: '',
    pmtHabis: '',
    vitA: '',
    obatCacing: '',
    ikutKelasBalita: '',
    perkembanganSdidtk: '',
    imunisasi: '',
    skriningPtm: '',
    mataKanan: '',
    mataKiri: '',
    telingaKanan: '',
    telingaKiri: '',
    skriningJiwa: '',
    periksaHb: '',
    batukBesarTbc: '',
    nafsuMakanTbc: '',
    bbMenurunTbc: '',
    lemahLesuTbc: '',
    berkeringatMalamTbc: '',
    batukDarahTbc: '',
    sesakNafasTbc: '',
    kolesterol: '',
    alatKontrasepsi: '',
    pumaJk: '',
    pumaUsia: '',
    pumaMerokok: '',
    pumaNapasPendek: '',
    pumaDahak: '',
    pumaBatukFlu: '',
    // Skrining Kesehatan Jiwa - Dewasa & Lansia
    jiwaBulan: 'September',
    jiwaQ1: '',
    jiwaQ2: '',
    jiwaQ3: '',
    jiwaQ4: '',
    // C2. Pemeriksaan Tahunan AKS (Barthel) - Lansia
    aksBab: '',
    aksBak: '',
    aksCuciMuka: '',
    aksWc: '',
    aksMakan: '',
    aksPindah: '',
    aksJalan: '',
    aksPakaian: '',
    aksTangga: '',
    aksMandi: '',
    // C3. Pemeriksaan Tahunan SKILAS - Lansia
    skilasOrientasi: '',
    skilasUlangKata: '',
    skilasTesKursi: '',
    skilasBbTurun: '',
    skilasNafsuMakan: '',
    skilasLilaKurang: '',
    skilasMasalahMata: '',
    skilasTesLihat: '',
    skilasTesBisik: '',
    skilasPerasaanSedih: '',
    skilasHilangMinat: '',
    skilasImunisasiCovid: '',
    topikPenyuluhan: '',
    mengikutiKelas: '',
    statusRujukan: ''
  });

  // Helper setter/getter untuk field Langkah 4 (mendukung kedua mode)
  const updateLangkah4Value = (field, val) => {
    const updates = { [field]: val };
    if (field === 'batukTbc') updates.batukBesarTbc = val;
    if (field === 'batukBesarTbc') updates.batukTbc = val;
    if (field === 'pemberianTtd') updates.jumlahTtd = val;
    if (field === 'jumlahTtd') updates.pemberianTtd = val;

    if (examinationMode === 'per-step') {
      setLangkah4Form(prev => {
        const next = { ...prev, ...updates };
        if (activeSubmenu === 'lansia') {
          const evalResult = evaluateSkilas(next);
          if (evalResult.adaRisiko) {
            setLangkah5Form(l5 => ({
              ...l5,
              statusRujukan: 'Rujuk ke Puskesmas / Pustu',
              topikPenyuluhan: l5.topikPenyuluhan || `Rujukan SKILAS: Domain ${evalResult.issues.join(', ')}`
            }));
          }
        }
        return next;
      });
    } else {
      setSequentialForm(prev => {
        const next = { ...prev, ...updates };
        if (activeSubmenu === 'lansia') {
          const evalResult = evaluateSkilas(next);
          if (evalResult.adaRisiko) {
            next.statusRujukan = 'Rujuk ke Puskesmas / Pustu';
            if (!next.topikPenyuluhan) {
              next.topikPenyuluhan = `Rujukan SKILAS: Domain ${evalResult.issues.join(', ')}`;
            }
          }
        }
        return next;
      });
    }
  };

  const getLangkah4Value = (field) => {
    const src = examinationMode === 'per-step' ? langkah4Form : sequentialForm;
    if (!src) return '';
    if (field === 'batukBesarTbc') return src.batukBesarTbc || src.batukTbc || '';
    if (field === 'batukTbc') return src.batukTbc || src.batukBesarTbc || '';
    if (field === 'pemberianTtd') return src.pemberianTtd || src.jumlahTtd || '';
    if (field === 'jumlahTtd') return src.jumlahTtd || src.pemberianTtd || '';
    return src[field] ?? '';
  };

  // Automatically hydrate all 5 steps when a citizen is selected or category changes
  useEffect(() => {
    if (!currentSelectedWarga) return;
    const defaultGen = ['bumil', 'nifas'].includes(activeSubmenu) ? 'Perempuan' : (currentSelectedWarga.gender || '');
    const l1 = currentExamData?.langkah1 || {};
    const l2 = currentExamData?.langkah2 || {};
    const l4 = currentExamData?.langkah4 || {};
    const l5 = currentExamData?.langkah5 || {};

    const defaultTb = currentSelectedWarga.tb || l2.tb || '';
    const defaultBb = currentSelectedWarga.bb || l2.bb || '';

    setLangkah1Form({
      nik: currentSelectedWarga.nik || l1.nik || '',
      nama: currentSelectedWarga.nama || l1.nama || '',
      tglLahir: currentSelectedWarga.tglLahir || l1.tglLahir || '',
      gender: defaultGen,
      usiaKehamilan: l1.usiaKehamilan || currentSelectedWarga.usiaKehamilan || '',
      waktuKunjunganNifas: l1.waktuKunjunganNifas || '',
      usiaBayi: l1.usiaBayi || '',
      usiaBalita: l1.usiaBalita || '',
      usiaApras: l1.usiaApras || '',
      checklistKia: l1.checklistKia || ''
    });

    setLangkah2Form({
      bb: defaultBb,
      tb: defaultTb,
      lila: l2.lila || '',
      lk: l2.lk || '',
      lp: l2.lp || '',
      tensiSistol: l2.tensiSistol || '',
      tensiDiastol: l2.tensiDiastol || '',
      gulaDarah: l2.gulaDarah || ''
    });

    const hasAnnualData = Boolean(
      l4.isSkriningTahunan || 
      l4.is_skrining_tahunan || 
      (l4.jiwaQ1 !== undefined && l4.jiwaQ1 !== '') || 
      (l4.aksBab !== undefined && l4.aksBab !== '') || 
      (l4.skilasOrientasi !== undefined && l4.skilasOrientasi !== '') ||
      (l4.pumaJk !== undefined && l4.pumaJk !== '') ||
      (l4.skriningJiwa && l4.skriningJiwa !== '')
    );

    setLangkah4Form({
      isSkriningTahunan: hasAnnualData,
      batukTbc: l4.batukTbc || '',
      demamTbc: l4.demamTbc || '',
      bbTurunTbc: l4.bbTurunTbc || '',
      kontakTbc: l4.kontakTbc || '',
      lesuTbc: l4.lesuTbc || '',
      jumlahTtd: l4.jumlahTtd || '',
      pemberianTtd: l4.pemberianTtd || l4.jumlahTtd || '',
      rutinTtd: l4.rutinTtd || '',
      komposisiMtBumil: l4.komposisiMtBumil || '',
      rutinMtBumil: l4.rutinMtBumil || '',
      jumlahVitA: l4.jumlahVitA || '',
      rutinVitA: l4.rutinVitA || '',
      menyusui: l4.menyusui || '',
      kbPascaPersalinan: l4.kbPascaPersalinan || '',
      tempatImunisasi: l4.tempatImunisasi || '',
      namaRsImunisasi: l4.namaRsImunisasi || '',
      jenisImunisasi: l4.jenisImunisasi || '',
      jenisImunisasiLainnya: l4.jenisImunisasiLainnya || '',
      asiEksklusif: l4.asiEksklusif || '',
      mpAsi: l4.mpAsi || '',
      pmtPemulihan: l4.pmtPemulihan || '',
      pmtHabis: l4.pmtHabis || '',
      vitA: l4.vitA || '',
      obatCacing: l4.obatCacing || '',
      ikutKelasBalita: l4.ikutKelasBalita || '',
      perkembanganSdidtk: l4.perkembanganSdidtk || '',
      imunisasi: l4.imunisasi || '',
      skriningPtm: l4.skriningPtm || '',
      mataKanan: l4.mataKanan || '',
      mataKiri: l4.mataKiri || '',
      telingaKanan: l4.telingaKanan || '',
      telingaKiri: l4.telingaKiri || '',
      skriningJiwa: l4.skriningJiwa || '',
      periksaHb: l4.periksaHb || '',
      batukBesarTbc: l4.batukBesarTbc || '',
      nafsuMakanTbc: l4.nafsuMakanTbc || '',
      bbMenurunTbc: l4.bbMenurunTbc || '',
      lemahLesuTbc: l4.lemahLesuTbc || '',
      berkeringatMalamTbc: l4.berkeringatMalamTbc || '',
      batukDarahTbc: l4.batukDarahTbc || '',
      sesakNafasTbc: l4.sesakNafasTbc || '',
      kolesterol: l4.kolesterol || '',
      alatKontrasepsi: l4.alatKontrasepsi || '',
      pumaJk: l4.pumaJk !== undefined ? l4.pumaJk : '',
      pumaUsia: l4.pumaUsia !== undefined ? l4.pumaUsia : '',
      pumaMerokok: l4.pumaMerokok !== undefined ? l4.pumaMerokok : '',
      pumaNapasPendek: l4.pumaNapasPendek !== undefined ? l4.pumaNapasPendek : '',
      pumaDahak: l4.pumaDahak !== undefined ? l4.pumaDahak : '',
      pumaBatukFlu: l4.pumaBatukFlu !== undefined ? l4.pumaBatukFlu : '',
      // C2. AKS - Lansia
      aksBab: l4.aksBab !== undefined ? l4.aksBab : '',
      aksBak: l4.aksBak !== undefined ? l4.aksBak : '',
      aksCuciMuka: l4.aksCuciMuka !== undefined ? l4.aksCuciMuka : '',
      aksWc: l4.aksWc !== undefined ? l4.aksWc : '',
      aksMakan: l4.aksMakan !== undefined ? l4.aksMakan : '',
      aksPindah: l4.aksPindah !== undefined ? l4.aksPindah : '',
      aksJalan: l4.aksJalan !== undefined ? l4.aksJalan : '',
      aksPakaian: l4.aksPakaian !== undefined ? l4.aksPakaian : '',
      aksTangga: l4.aksTangga !== undefined ? l4.aksTangga : '',
      aksMandi: l4.aksMandi !== undefined ? l4.aksMandi : '',
      // C3. SKILAS - Lansia
      skilasOrientasi: l4.skilasOrientasi || '',
      skilasUlangKata: l4.skilasUlangKata || '',
      skilasTesKursi: l4.skilasTesKursi || '',
      skilasBbTurun: l4.skilasBbTurun || '',
      skilasNafsuMakan: l4.skilasNafsuMakan || '',
      skilasLilaKurang: l4.skilasLilaKurang || '',
      skilasMasalahMata: l4.skilasMasalahMata || '',
      skilasTesLihat: l4.skilasTesLihat || '',
      skilasTesBisik: l4.skilasTesBisik || '',
      skilasPerasaanSedih: l4.skilasPerasaanSedih || '',
      skilasHilangMinat: l4.skilasHilangMinat || '',
      skilasImunisasiCovid: l4.skilasImunisasiCovid || ''
    });

    setLangkah5Form({
      topikPenyuluhan: l5.topikPenyuluhan || '',
      mengikutiKelas: l5.mengikutiKelas || '',
      statusRujukan: l5.statusRujukan || ''
    });

    setSequentialForm({
      isSkriningTahunan: hasAnnualData,
      nik: currentSelectedWarga.nik || l1.nik || '',
      nama: currentSelectedWarga.nama || l1.nama || '',
      tglLahir: currentSelectedWarga.tglLahir || l1.tglLahir || '',
      gender: defaultGen,
      pekerjaan: currentSelectedWarga.pekerjaan || l1.pekerjaan || '',
      statusPernikahan: currentSelectedWarga.statusPernikahan || l1.statusPernikahan || '',
      sekolah: currentSelectedWarga.sekolah || l1.sekolah || '',
      kelas: currentSelectedWarga.kelas || l1.kelas || '',
      usiaKehamilan: l1.usiaKehamilan || currentSelectedWarga.usiaKehamilan || '',
      waktuKunjunganNifas: l1.waktuKunjunganNifas || '',
      usiaBayi: l1.usiaBayi || '',
      usiaBalita: l1.usiaBalita || '',
      usiaApras: l1.usiaApras || '',
      checklistKia: l1.checklistKia || '',
      tb: defaultTb,
      bb: defaultBb,
      lila: l2.lila || '',
      lk: l2.lk || '',
      lp: l2.lp || '',
      tensiSistol: l2.tensiSistol || '',
      tensiDiastol: l2.tensiDiastol || '',
      gulaDarah: l2.gulaDarah || '',
      batukTbc: l4.batukTbc || '',
      demamTbc: l4.demamTbc || '',
      bbTurunTbc: l4.bbTurunTbc || '',
      kontakTbc: l4.kontakTbc || '',
      lesuTbc: l4.lesuTbc || '',
      jumlahTtd: l4.jumlahTtd || '',
      pemberianTtd: l4.pemberianTtd || l4.jumlahTtd || '',
      rutinTtd: l4.rutinTtd || '',
      komposisiMtBumil: l4.komposisiMtBumil || '',
      rutinMtBumil: l4.rutinMtBumil || '',
      jumlahVitA: l4.jumlahVitA || '',
      rutinVitA: l4.rutinVitA || '',
      menyusui: l4.menyusui || '',
      kbPascaPersalinan: l4.kbPascaPersalinan || '',
      tempatImunisasi: l4.tempatImunisasi || '',
      namaRsImunisasi: l4.namaRsImunisasi || '',
      jenisImunisasi: l4.jenisImunisasi || '',
      jenisImunisasiLainnya: l4.jenisImunisasiLainnya || '',
      asiEksklusif: l4.asiEksklusif || '',
      mpAsi: l4.mpAsi || '',
      pmtPemulihan: l4.pmtPemulihan || '',
      pmtHabis: l4.pmtHabis || '',
      vitA: l4.vitA || '',
      obatCacing: l4.obatCacing || '',
      ikutKelasBalita: l4.ikutKelasBalita || '',
      perkembanganSdidtk: l4.perkembanganSdidtk || '',
      imunisasi: l4.imunisasi || '',
      skriningPtm: l4.skriningPtm || '',
      mataKanan: l4.mataKanan || '',
      mataKiri: l4.mataKiri || '',
      telingaKanan: l4.telingaKanan || '',
      telingaKiri: l4.telingaKiri || '',
      skriningJiwa: l4.skriningJiwa || '',
      periksaHb: l4.periksaHb || '',
      batukBesarTbc: l4.batukBesarTbc || '',
      nafsuMakanTbc: l4.nafsuMakanTbc || '',
      bbMenurunTbc: l4.bbMenurunTbc || '',
      lemahLesuTbc: l4.lemahLesuTbc || '',
      berkeringatMalamTbc: l4.berkeringatMalamTbc || '',
      batukDarahTbc: l4.batukDarahTbc || '',
      sesakNafasTbc: l4.sesakNafasTbc || '',
      kolesterol: l4.kolesterol || '',
      alatKontrasepsi: l4.alatKontrasepsi || '',
      pumaJk: l4.pumaJk !== undefined ? l4.pumaJk : '',
      pumaUsia: l4.pumaUsia !== undefined ? l4.pumaUsia : '',
      pumaMerokok: l4.pumaMerokok !== undefined ? l4.pumaMerokok : '',
      pumaNapasPendek: l4.pumaNapasPendek !== undefined ? l4.pumaNapasPendek : '',
      pumaDahak: l4.pumaDahak !== undefined ? l4.pumaDahak : '',
      pumaBatukFlu: l4.pumaBatukFlu !== undefined ? l4.pumaBatukFlu : '',
      // C2. AKS - Lansia
      aksBab: l4.aksBab !== undefined ? l4.aksBab : '',
      aksBak: l4.aksBak !== undefined ? l4.aksBak : '',
      aksCuciMuka: l4.aksCuciMuka !== undefined ? l4.aksCuciMuka : '',
      aksWc: l4.aksWc !== undefined ? l4.aksWc : '',
      aksMakan: l4.aksMakan !== undefined ? l4.aksMakan : '',
      aksPindah: l4.aksPindah !== undefined ? l4.aksPindah : '',
      aksJalan: l4.aksJalan !== undefined ? l4.aksJalan : '',
      aksPakaian: l4.aksPakaian !== undefined ? l4.aksPakaian : '',
      aksTangga: l4.aksTangga !== undefined ? l4.aksTangga : '',
      aksMandi: l4.aksMandi !== undefined ? l4.aksMandi : '',
      // C3. SKILAS - Lansia
      skilasOrientasi: l4.skilasOrientasi || '',
      skilasUlangKata: l4.skilasUlangKata || '',
      skilasTesKursi: l4.skilasTesKursi || '',
      skilasBbTurun: l4.skilasBbTurun || '',
      skilasNafsuMakan: l4.skilasNafsuMakan || '',
      skilasLilaKurang: l4.skilasLilaKurang || '',
      skilasMasalahMata: l4.skilasMasalahMata || '',
      skilasTesLihat: l4.skilasTesLihat || '',
      skilasTesBisik: l4.skilasTesBisik || '',
      skilasPerasaanSedih: l4.skilasPerasaanSedih || '',
      skilasHilangMinat: l4.skilasHilangMinat || '',
      skilasImunisasiCovid: l4.skilasImunisasiCovid || '',
      topikPenyuluhan: l5.topikPenyuluhan || '',
      mengikutiKelas: l5.mengikutiKelas || '',
      statusRujukan: l5.statusRujukan || ''
    });
  }, [currentSelectedWarga, currentExamData, activeSubmenu, currentCategory.label]);

  // Kalkulasi reaktif skor AKS, hasil SKILAS, dan Skrining Jiwa
  const currentAks = useMemo(() => {
    return calculateAks(examinationMode === 'per-step' ? langkah4Form : sequentialForm);
  }, [examinationMode, langkah4Form, sequentialForm]);

  const currentSkilas = useMemo(() => {
    return evaluateSkilas(examinationMode === 'per-step' ? langkah4Form : sequentialForm);
  }, [examinationMode, langkah4Form, sequentialForm]);

  const currentJiwa = useMemo(() => {
    return calculateJiwa(examinationMode === 'per-step' ? langkah4Form : sequentialForm);
  }, [examinationMode, langkah4Form, sequentialForm]);

  // Active data for Step 3 Plotting & Step 2 calculations
  const activeWargaData = useMemo(() => {
    return {
      ...(currentSelectedWarga || {}),
      ...(currentExamData?.langkah1 || {}),
      ...(currentExamData?.langkah2 || {}),
      ...langkah1Form,
      ...langkah2Form
    };
  }, [currentSelectedWarga, currentExamData, langkah1Form, langkah2Form]);

  // Helper fungsi untuk validasi ketat setiap langkah pemeriksaan posyandu
  const validateStepData = (step, data, submenu) => {
    const missing = [];

    if (step === 1) {
      if (!data?.nama || !String(data.nama).trim()) missing.push('Nama Lengkap');
      if (!data?.nik || !String(data.nik).trim()) {
        missing.push('NIK (16 digit)');
      } else {
        const nikCheck = validateNik(data.nik);
        if (!nikCheck.isValid) missing.push(nikCheck.message);
      }
      if (!data?.tglLahir) missing.push('Tanggal Lahir');
      if (!data?.gender) missing.push('Jenis Kelamin');
    }

    if (step === 2) {
      if (!data?.bb || !String(data.bb).trim()) missing.push('Berat Badan (BB)');

      if (['bayi-0-11', 'balita-12-59'].includes(submenu)) {
        if (!data?.tb || !String(data.tb).trim()) missing.push('Panjang / Tinggi Badan (PB/TB)');
        if (!data?.lk || !String(data.lk).trim()) missing.push('Lingkar Kepala (LK)');
        if (!data?.lila || !String(data.lila).trim()) missing.push('Lingkar Lengan Atas (LiLA)');
      } else if (submenu === 'apras') {
        if (!data?.tb || !String(data.tb).trim()) missing.push('Tinggi Badan (TB)');
        if (!data?.lila || !String(data.lila).trim()) missing.push('Lingkar Lengan Atas (LiLA)');
      } else if (submenu === 'usekrem-6-14') {
        if (!data?.tb || !String(data.tb).trim()) missing.push('Tinggi Badan (TB)');
      } else if (submenu === 'usekrem-15-18') {
        if (!data?.tb || !String(data.tb).trim()) missing.push('Tinggi Badan (TB)');
        if (!data?.lp || !String(data.lp).trim()) missing.push('Lingkar Perut (LP)');
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push('Tekanan Sistol');
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push('Tekanan Diastol');
      } else if (submenu === 'dewasa' || submenu === 'lansia') {
        if (!data?.tb || !String(data.tb).trim()) missing.push('Tinggi Badan (TB)');
        if (!data?.lp || !String(data.lp).trim()) missing.push('Lingkar Perut (LP)');
        if (!data?.lila || !String(data.lila).trim()) missing.push('Lingkar Lengan Atas (LiLA)');
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push('Tekanan Sistol');
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push('Tekanan Diastol');
      } else if (submenu === 'bumil') {
        if (!data?.lila || !String(data.lila).trim()) missing.push('Lingkar Lengan Atas (LiLA)');
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push('Tekanan Sistol');
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push('Tekanan Diastol');
      } else if (submenu === 'nifas') {
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push('Tekanan Sistol');
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push('Tekanan Diastol');
      }

      if (data?.bb) {
        const measureCheck = validateMeasurements({
          bb: data.bb,
          tb: data.tb,
          lila: data.lila,
          sistol: data.tensiSistol,
          diastol: data.tensiDiastol
        });
        if (!measureCheck.isValid && measureCheck.errors) {
          measureCheck.errors.forEach(err => missing.push(err));
        }
      }
    }

    if (step === 4) {
      if (['bayi-0-11', 'balita-12-59', 'apras'].includes(submenu)) {
        if (!data?.batukTbc && !data?.batukBesarTbc) missing.push('Gejala Batuk TBC');
        if (!data?.demamTbc) missing.push('Gejala Demam TBC');
        if (!data?.bbTurunTbc) missing.push('Gejala BB Turun TBC');
        if (!data?.lesuTbc) missing.push('Gejala Lesu TBC');
      } else if (['bumil', 'nifas'].includes(submenu)) {
        if (!data?.batukTbc && !data?.batukBesarTbc) missing.push('Gejala Batuk TBC');
        if (!data?.demamTbc) missing.push('Gejala Demam TBC');
        if (!data?.bbTurunTbc) missing.push('Gejala BB Turun TBC');
        if (!data?.kontakTbc) missing.push('Kontak Erat Pasien TBC');
      } else if (submenu === 'usekrem-6-14') {
        if (!data?.batukTbc && !data?.batukBesarTbc) missing.push('Gejala Batuk TBC');
        if (!data?.demamTbc) missing.push('Gejala Demam TBC');
        if (!data?.bbTurunTbc) missing.push('Gejala BB Turun TBC');
        if (!data?.lesuTbc) missing.push('Gejala Lesu TBC');
      } else {
        if (!data?.batukBesarTbc && !data?.batukTbc) missing.push('Batuk Berdahak ≥ 2 Minggu');
        if (!data?.nafsuMakanTbc) missing.push('Penurunan Nafsu Makan');
        if (!data?.bbMenurunTbc) missing.push('BB Menurun Tanpa Sebab');
        if (!data?.lemahLesuTbc) missing.push('Tubuh Lemas / Lesu');
        if (!data?.berkeringatMalamTbc) missing.push('Berkeringat Malam');
        if (!data?.batukDarahTbc) missing.push('Batuk Berdarah');
        if (!data?.sesakNafasTbc) missing.push('Sesak Napas');
      }

      if (submenu === 'bumil') {
        if (!data?.pemberianTtd && !data?.jumlahTtd) missing.push('Pemberian TTD');
        if (!data?.rutinTtd) missing.push('Rutin Konsumsi TTD');
      } else if (submenu === 'nifas') {
        if (!data?.jumlahVitA && !data?.rutinVitA) missing.push('Pemberian Kapsul Vitamin A');
        if (!data?.menyusui) missing.push('Status Menyusui');
        if (!data?.kbPascaPersalinan) missing.push('KB Pasca Persalinan');
      } else if (submenu === 'dewasa') {
        if (data?.isSkriningTahunan) {
          if (data?.jiwaQ1 === undefined || data?.jiwaQ1 === '') missing.push('Skrining Jiwa Pertanyaan 1');
          if (data?.jiwaQ2 === undefined || data?.jiwaQ2 === '') missing.push('Skrining Jiwa Pertanyaan 2');
          if (data?.jiwaQ3 === undefined || data?.jiwaQ3 === '') missing.push('Skrining Jiwa Pertanyaan 3');
          if (data?.jiwaQ4 === undefined || data?.jiwaQ4 === '') missing.push('Skrining Jiwa Pertanyaan 4');
        }
      }
    }

    if (step === 5) {
      if (!data?.topikPenyuluhan || !String(data.topikPenyuluhan).trim()) {
        missing.push('Topik Penyuluhan');
      }
      if (!data?.statusRujukan || !String(data.statusRujukan).trim()) {
        missing.push('Status Rujukan');
      }
    }

    return {
      isValid: missing.length === 0,
      missingFields: missing,
      errorMessage: missing.length > 0 ? `Mohon lengkapi isian berikut: ${missing.join(', ')}` : ''
    };
  };

  // Master Save Handler that updates global data and syncs both Rekap and Sasaran
  const saveCompleteExamination = async (formData, isFromSequential = false) => {
    if (formData.nik) {
      const nikVal = validateNik(formData.nik);
      if (!nikVal.isValid) {
        showWarning("Validasi NIK", nikVal.message);
        return;
      }
    }
    const measureVal = validateMeasurements(formData);
    if (!measureVal.isValid) {
      showWarning("Validasi Pengukuran", measureVal.message);
      return;
    }

    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    let targetWarga = currentSelectedWarga;
    
    // If user is adding a new citizen
    if (!targetWarga || selectedWargaId === 'new') {
      const newId = Date.now();
      targetWarga = {
        id: newId,
        idSasaran: `PSY-${String(newId).slice(-3)}`,
        nama: formData.nama || `Warga Baru (${currentCategory.label})`,
        nik: formData.nik || `320101010100${String(newId).slice(-4)}`,
        tglLahir: formData.tglLahir || '2023-01-01',
        gender: formData.gender || initialDefaultGender,
        kategori: currentCategory.label,
        subKategori: activeSubmenu,
        status: 'Aktif',
        statusPemeriksaan: 'Sudah',
        tglPeriksa: todayFormatted,
        posyandu: 'Posyandu Melati RW 04 — Sukamaju',
        rw: 'RW 04',
        noHp: '081234567890',
        alamat: 'Wilayah RW 04, Sukamaju',
        bb: formData.bb || '50.0',
        tb: formData.tb || '155.0'
      };

      if (setGlobalSasaranList) {
        setGlobalSasaranList(prev => [targetWarga, ...prev]);
      }
      setSelectedWargaId(String(targetWarga.id));
    } else {
      // Update existing citizen's status to 'Sudah' and update BB/TB
      if (setGlobalSasaranList) {
        setGlobalSasaranList(prev => prev.map(s => {
          if (String(s.id) === String(targetWarga.id)) {
            return {
              ...s,
              statusPemeriksaan: 'Sudah',
              tglPeriksa: todayFormatted,
              bb: formData.bb || s.bb,
              tb: formData.tb || s.tb,
              ...(formData.isSkriningTahunan ? { tglSkriningTahunanTerakhir: todayFormatted } : {})
            };
          }
          return s;
        }));
      }
    }

    // Build unified 5-step examination record
    const examinationRecord = {
      idPemeriksaan: currentExamData?.idPemeriksaan || `PEM-2026-${String(targetWarga.id).padStart(3, '0')}`,
      sasaranId: targetWarga.id,
      idSasaran: targetWarga.idSasaran || `PSY-${String(targetWarga.id).padStart(3, '0')}`,
      nama: formData.nama || targetWarga.nama,
      nik: formData.nik || targetWarga.nik,
      kategori: targetWarga.kategori || currentCategory.label,
      subKategori: activeSubmenu,
      tglPemeriksaan: todayFormatted,
      petugasPemeriksa: 'Dzakiyah Al Zahrani (Kader)',
      langkah1: {
        nik: formData.nik || targetWarga.nik,
        nama: formData.nama || targetWarga.nama,
        tglLahir: formData.tglLahir || targetWarga.tglLahir,
        gender: formData.gender || targetWarga.gender,
        namaIbu: targetWarga.namaIbu || targetWarga.keteranganIbuSuami || '',
        alamat: targetWarga.alamat || 'Jl. Melati RW 04',
        checklistKia: formData.checklistKia || 'Ya',
        usiaKehamilan: formData.usiaKehamilan || (activeSubmenu === 'bumil' ? '32-36 minggu' : ''),
        waktuKunjunganNifas: formData.waktuKunjunganNifas || (activeSubmenu === 'nifas' ? 'Bulan 2' : '')
      },
      langkah2: {
        bb: formData.bb || targetWarga.bb || '',
        tb: formData.tb || targetWarga.tb || '',
        lila: formData.lila || '',
        lk: formData.lk || '',
        lp: formData.lp || '',
        tensiSistol: formData.tensiSistol || '',
        tensiDiastol: formData.tensiDiastol || '',
        gulaDarah: formData.gulaDarah || ''
      },
      langkah3: {
        imt: formData.bb && formData.tb ? (parseFloat(formData.bb) / Math.pow(parseFloat(formData.tb)/100, 2)).toFixed(1) : 'Normal',
        imtStatus: 'Normal (Sesuai Kurva KIA)',
        bbUStatus: 'BB Normal / Naik (N, -2SD s.d +1SD)',
        pbUStatus: 'Normal (N, -2SD s.d +3SD)',
        bbPbStatus: 'Gizi Baik (-2SD s.d +1SD)',
        lkStatus: 'Normal (-2SD s.d +2SD)',
        lilaStatus: 'Normal / Gizi Baik'
      },
      langkah4: {
        ...formData,
        is_skrining_tahunan: Boolean(formData.isSkriningTahunan),
        isSkriningTahunan: Boolean(formData.isSkriningTahunan),
        tglSkriningTahunan: formData.isSkriningTahunan ? todayFormatted : (targetWarga.tglSkriningTahunanTerakhir || null),
        batukTbc: formData.batukTbc || '',
        demamTbc: formData.demamTbc || '',
        bbTurunTbc: formData.bbTurunTbc || '',
        kontakTbc: formData.kontakTbc || '',
        vitA: formData.vitA || '',
        imunisasi: formData.imunisasi || '',
        obatCacing: formData.obatCacing || '',
        skriningPtm: formData.skriningPtm || '',
        ...(formData.isSkriningTahunan && activeSubmenu === 'dewasa' ? {
          jiwaTotal: calculateJiwa(formData).total,
          jiwaKategori: calculateJiwa(formData).kategori,
          jiwaIsRisiko: calculateJiwa(formData).isRisiko,
          jiwaBulan: calculateJiwa(formData).bulan
        } : {}),
        ...(formData.isSkriningTahunan && activeSubmenu === 'lansia' ? {
          aksScore: calculateAks(formData).total,
          aksKategori: calculateAks(formData).kategori,
          aksPerluRujuk: calculateAks(formData).perluRujuk ? 'Ya (Rujuk Puskesmas/Pustu)' : 'Tidak',
          skilasStatus: evaluateSkilas(formData).statusText,
          skilasAdaRisiko: evaluateSkilas(formData).adaRisiko ? 'Ya' : 'Tidak'
        } : {})
      },
      langkah5: {
        topikPenyuluhan: formData.topikPenyuluhan || `Edukasi & Konseling Kesehatan ${currentCategory.label}`,
        statusRujukan: formData.statusRujukan || 'Tidak Perlu Rujukan',
        mengikutiKelas: formData.mengikutiKelas || 'Ya'
      }
    };

    try {
      const kunjunganId = await ensureKunjunganId(targetWarga);
      await pemeriksaanService.createPemeriksaan({
        kunjungan_id: Number(kunjunganId),
        tanggal: new Date().toISOString().split('T')[0],
        kategori_sasaran: mapFrontendCategoryToBackend(activeSubmenu),
        bb_kg: parseFloat(formData.bb) || undefined,
        tb_cm: parseFloat(formData.tb) || undefined,
        lingkar_kepala_cm: parseFloat(formData.lk) || undefined,
        lila_cm: parseFloat(formData.lila) || undefined,
        lingkar_perut_cm: parseFloat(formData.lp) || undefined,
        td_sistole: parseInt(formData.tensiSistol) || undefined,
        td_diastole: parseInt(formData.tensiDiastol) || undefined,
        kadar_gula: parseInt(formData.gulaDarah) || undefined,
        topik_penyuluhan: formData.topikPenyuluhan || `Edukasi & Konseling Kesehatan ${currentCategory.label}`,
        is_perlu_rujukan: formData.statusRujukan?.includes('Rujuk') || false,
        detail_skrining: formData
      });
    } catch (err) {
      console.error('Gagal menyimpan pemeriksaan ke backend:', err);
      const message = err?.message || 'Gagal menyimpan pemeriksaan ke server.';
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('app:toast-error', { detail: message }));
      return;
    }

    if (setGlobalPemeriksaanData) {
      setGlobalPemeriksaanData(prev => ({
        ...prev,
        [targetWarga.id]: examinationRecord,
        [String(targetWarga.id)]: examinationRecord
      }));
    }

    setShowSequentialPreviewModal(false);
    setActiveStep(1);
    showSuccess(
      "Pemeriksaan Selesai & Tersinkronisasi",
      `Data pemeriksaan lengkap (Langkah 1 s/d 5) untuk "${examinationRecord.nama}" berhasil disimpan dan otomatis disinkronkan ke Rekapitulasi & Puskesmas!`
    );
    onRefreshData?.();
  };

  // Handler presensi kehadiran warga di Langkah 1
  const handleToggleKehadiran = (wargaId, status) => {
    setKehadiranWarga(prev => ({
      ...prev,
      [String(wargaId)]: status
    }));
  };

  const handleSavePresensiLangkah1 = () => {
    // Tandai step1 selesai untuk semua warga yang hadir
    const newCompleted = { ...completedSteps };
    const hadirCount = Object.entries(kehadiranWarga).filter(([id, isHadir]) => isHadir && activeWargaList.some(w => String(w.id) === String(id))).length;
    
    Object.entries(kehadiranWarga).forEach(([id, isHadir]) => {
      if (isHadir) {
        newCompleted[id] = { ...(newCompleted[id] || {}), step1: true };
        const w = activeWargaList.find(item => String(item.id) === String(id));
        setStepDataByWarga(prev => ({
          ...prev,
          [id]: {
            ...(prev[id] || {}),
            warga: w || prev[id]?.warga,
            langkah1: {
              ...(prev[id]?.langkah1 || {}),
              nik: w?.nik,
              nama: w?.nama,
              tglLahir: w?.tglLahir,
              gender: w?.gender,
              usiaKehamilan: waktuKunjunganPresensi[id] || (activeSubmenu === 'bumil' ? '32-36 minggu' : ''),
              waktuKunjunganNifas: waktuKunjunganPresensi[id] || (activeSubmenu === 'nifas' ? 'Bulan 2' : '')
            }
          }
        }));
      }
    });
    setCompletedSteps(newCompleted);

    showSuccess(
      "Presensi Langkah 1 Tersimpan",
      `Presensi kehadiran berhasil disimpan! Sebanyak ${hadirCount} sasaran terdaftar hadir dan siap melanjutkan pemeriksaan.`
    );
  };

  // Step handlers for Mode Pilih Langkah
  const handleSaveLangkah1 = (e) => {
    e.preventDefault();
    const valResult = validateStepData(1, langkah1Form, activeSubmenu);
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const newId = Date.now();
    const newSasaran = {
      id: newId,
      idSasaran: `PSY-${String(newId).slice(-3)}`,
      nama: langkah1Form.nama,
      nik: langkah1Form.nik,
      tglLahir: langkah1Form.tglLahir,
      gender: langkah1Form.gender,
      kategori: currentCategory.label,
      subKategori: activeSubmenu,
      status: 'Aktif',
      statusPemeriksaan: 'Belum',
      tglPeriksa: todayFormatted,
      alamat: 'Wilayah RW 04, Sukamaju',
      usiaKehamilan: langkah1Form.usiaKehamilan || '',
      waktuKunjunganNifas: langkah1Form.waktuKunjunganNifas || '',
      usiaBayi: langkah1Form.usiaBayi || '',
      usiaBalita: langkah1Form.usiaBalita || '',
      usiaApras: langkah1Form.usiaApras || '',
      checklistKia: langkah1Form.checklistKia || 'Ya'
    };

    if (setGlobalSasaranList) {
      setGlobalSasaranList(prev => [newSasaran, ...prev]);
    }

    setStepDataByWarga(prev => ({
      ...prev,
      [String(newId)]: {
        warga: newSasaran,
        langkah1: { ...langkah1Form }
      }
    }));

    setCompletedSteps(prev => ({
      ...prev,
      [String(newId)]: { step1: true }
    }));

    // Auto-select on next steps
    setSelectedWargaStep2(String(newId));
    setSelectedWargaStep3(String(newId));
    setSelectedWargaStep4(String(newId));
    setSelectedWargaStep5(String(newId));

    showSuccess(
      "Langkah 1: Identitas Tersimpan",
      `Identitas [Langkah 1] untuk "${newSasaran.nama}" berhasil disimpan! Data warga kini siap diperiksa di Langkah 2 s/d 5.`
    );
  };

  const handleSaveLangkah2 = (e) => {
    e.preventDefault();
    if (!selectedWargaStep2) {
      showWarning(
        "Pilih Sasaran Warga",
        "Silakan pilih nama warga yang akan diperiksa pada dropdown Langkah 2 terlebih dahulu."
      );
      return;
    }
    const valResult = validateStepData(2, langkah2Form, activeSubmenu);
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
    const targetId = String(selectedWargaStep2);
    const warga = activeWargaList.find(w => String(w.id) === targetId);

    if (setGlobalSasaranList) {
      setGlobalSasaranList(prev => prev.map(s => {
        if (String(s.id) === targetId) {
          return {
            ...s,
            bb: langkah2Form.bb || s.bb,
            tb: langkah2Form.tb || s.tb
          };
        }
        return s;
      }));
    }

    setStepDataByWarga(prev => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] || {}),
        warga: warga || prev[targetId]?.warga,
        langkah2: { ...langkah2Form }
      }
    }));

    // Warga selesai mengisi step 2 -> namanya hilang dari dropdown Langkah 2
    setCompletedSteps(prev => ({
      ...prev,
      [targetId]: { ...(prev[targetId] || {}), step2: true }
    }));

    // Refresh formulir Langkah 2 untuk input warga berikutnya
    setLangkah2Form({
      bb: '',
      tb: '',
      lila: '',
      lk: '',
      lp: '',
      tensiSistol: '',
      tensiDiastol: '',
      gulaDarah: ''
    });

    showSuccess(
      "Langkah 2: Pengukuran Tersimpan",
      `Hasil Pengukuran & Skrining [Langkah 2] untuk "${warga?.nama || 'Warga'}" berhasil disimpan!`
    );
  };

  const handleSaveLangkah3 = (e) => {
    e.preventDefault();
    if (!selectedWargaStep3) {
      showWarning(
        "Pilih Sasaran Warga",
        "Silakan pilih nama warga yang akan dievaluasi pada dropdown Langkah 3 terlebih dahulu."
      );
      return;
    }
    const targetId = String(selectedWargaStep3);
    const warga = activeWargaList.find(w => String(w.id) === targetId);

    setStepDataByWarga(prev => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] || {}),
        langkah3: { ...(plottingResult || {}) }
      }
    }));

    // Warga selesai mengisi step 3 -> namanya hilang dari dropdown Langkah 3
    setCompletedSteps(prev => ({
      ...prev,
      [targetId]: { ...(prev[targetId] || {}), step3: true }
    }));

    showSuccess(
      "Langkah 3: Plotting Kurva Tersimpan",
      `Plotting Evaluasi Kurva Pertumbuhan & Perkembangan [Langkah 3] untuk "${warga?.nama || 'Warga'}" berhasil disimpan!`
    );
  };

  const handleSaveLangkah4 = (e) => {
    e.preventDefault();
    if (!selectedWargaStep4) {
      showWarning(
        "Pilih Sasaran Warga",
        "Silakan pilih nama warga yang akan diskrining pada dropdown Langkah 4 terlebih dahulu."
      );
      return;
    }
    const valResult = validateStepData(4, langkah4Form, activeSubmenu);
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
    const targetId = String(selectedWargaStep4);
    const warga = activeWargaList.find(w => String(w.id) === targetId);

    const aksCalc = calculateAks(langkah4Form);
    const skilasCalc = evaluateSkilas(langkah4Form);
    const jiwaCalc = calculateJiwa(langkah4Form);

    setStepDataByWarga(prev => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] || {}),
        langkah4: { 
          ...langkah4Form,
          ...(activeSubmenu === 'dewasa' ? {
            jiwaTotal: jiwaCalc.total,
            jiwaKategori: jiwaCalc.kategori,
            jiwaIsRisiko: jiwaCalc.isRisiko,
            jiwaBulan: jiwaCalc.bulan
          } : {}),
          ...(activeSubmenu === 'lansia' ? {
            aksScore: aksCalc.total,
            aksKategori: aksCalc.kategori,
            aksPerluRujuk: aksCalc.perluRujuk ? 'Ya (Rujuk Puskesmas/Pustu)' : 'Tidak',
            skilasStatus: skilasCalc.statusText,
            skilasAdaRisiko: skilasCalc.adaRisiko ? 'Ya' : 'Tidak'
          } : {})
        }
      }
    }));

    // Warga selesai mengisi step 4 -> namanya hilang dari dropdown Langkah 4
    setCompletedSteps(prev => ({
      ...prev,
      [targetId]: { ...(prev[targetId] || {}), step4: true }
    }));

    // Refresh formulir Langkah 4
    setLangkah4Form({
      batukTbc: '',
      demamTbc: '',
      bbTurunTbc: '',
      kontakTbc: '',
      lesuTbc: '',
      jumlahTtd: '',
      pemberianTtd: '',
      rutinTtd: '',
      komposisiMtBumil: '',
      rutinMtBumil: '',
      jumlahVitA: '',
      rutinVitA: '',
      menyusui: '',
      kbPascaPersalinan: '',
      tempatImunisasi: '',
      namaRsImunisasi: '',
      jenisImunisasi: '',
      jenisImunisasiLainnya: '',
      asiEksklusif: '',
      mpAsi: '',
      pmtPemulihan: '',
      pmtHabis: '',
      vitA: '',
      obatCacing: '',
      ikutKelasBalita: '',
      perkembanganSdidtk: '',
      imunisasi: '',
      skriningPtm: '',
      mataKanan: '',
      mataKiri: '',
      telingaKanan: '',
      telingaKiri: '',
      skriningJiwa: '',
      periksaHb: '',
      batukBesarTbc: '',
      nafsuMakanTbc: '',
      bbMenurunTbc: '',
      lemahLesuTbc: '',
      berkeringatMalamTbc: '',
      batukDarahTbc: '',
      sesakNafasTbc: '',
      kolesterol: '',
      alatKontrasepsi: '',
      pumaJk: '',
      pumaUsia: '',
      pumaMerokok: '',
      pumaNapasPendek: '',
      pumaDahak: '',
      pumaBatukFlu: '',
      // Skrining Kesehatan Jiwa - Dewasa
      jiwaBulan: 'September',
      jiwaQ1: '',
      jiwaQ2: '',
      jiwaQ3: '',
      jiwaQ4: '',
      // C2. AKS - Lansia
      aksBab: '',
      aksBak: '',
      aksCuciMuka: '',
      aksWc: '',
      aksMakan: '',
      aksPindah: '',
      aksJalan: '',
      aksPakaian: '',
      aksTangga: '',
      aksMandi: '',
      // C3. SKILAS - Lansia
      skilasOrientasi: '',
      skilasUlangKata: '',
      skilasTesKursi: '',
      skilasBbTurun: '',
      skilasNafsuMakan: '',
      skilasLilaKurang: '',
      skilasMasalahMata: '',
      skilasTesLihat: '',
      skilasTesBisik: '',
      skilasPerasaanSedih: '',
      skilasHilangMinat: '',
      skilasImunisasiCovid: ''
    });

    showSuccess(
      "Langkah 4: Skrining Tersimpan",
      `Skrining Kesehatan, TBC & Faktor Risiko [Langkah 4] untuk "${warga?.nama || 'Warga'}" berhasil disimpan!`
    );
  };

  const handleSaveLangkah5 = async (e) => {
    e.preventDefault();
    if (!selectedWargaStep5) {
      showWarning(
        "Pilih Sasaran Warga",
        "Silakan pilih nama warga pada dropdown Langkah 5 terlebih dahulu."
      );
      return;
    }
    const valResult = validateStepData(5, {
      ...langkah5Form,
      statusRujukan: langkah5Form.statusRujukan || 'Tidak Perlu Rujukan'
    }, activeSubmenu);
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
    const targetId = String(selectedWargaStep5);
    const warga = activeWargaList.find(w => String(w.id) === targetId);
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

    const savedWargaData = stepDataByWarga[targetId] || {};
    const currentCompleted = completedSteps[targetId] || {};
    const l1 = savedWargaData.langkah1 || (warga ? { nik: warga.nik, nama: warga.nama, tglLahir: warga.tglLahir, gender: warga.gender } : null);
    const l2 = savedWargaData.langkah2 || (warga && (warga.bb || warga.tb) ? { bb: warga.bb, tb: warga.tb } : null);
    const l3 = savedWargaData.langkah3 || null;
    const l4 = savedWargaData.langkah4 || null;

    // Pastikan seluruh 4 langkah sebelumnya telah diisi dan disimpan
    const missingSteps = [];
    if (!currentCompleted.step1 && !l1) missingSteps.push('Langkah 1 (Identitas / Presensi)');
    if (!currentCompleted.step2 && !l2) missingSteps.push('Langkah 2 (Pengukuran & Penimbangan)');
    if (!currentCompleted.step3 && !l3) missingSteps.push('Langkah 3 (Plotting Evaluasi Kurva)');
    if (!currentCompleted.step4 && !l4) missingSteps.push('Langkah 4 (Pelayanan Kesehatan & Skrining TBC)');

    if (missingSteps.length > 0) {
      showWarning(
        "Tahapan Pemeriksaan Belum Lengkap",
        `Sasaran "${warga?.nama || 'Warga'}" belum menyelesaikan: ${missingSteps.join(', ')}. Seluruh 5 langkah pemeriksaan harus diisi lengkap sebelum data dapat disimpan dan muncul di Rekapitulasi.`
      );
      return;
    }

    const examinationRecord = {
      idPemeriksaan: `PEM-2026-${String(targetId).padStart(3, '0')}`,
      sasaranId: targetId,
      idSasaran: warga?.idSasaran || `PSY-${String(targetId).padStart(3, '0')}`,
      nama: warga?.nama || l1.nama,
      nik: warga?.nik || l1.nik,
      kategori: warga?.kategori || currentCategory.label,
      subKategori: activeSubmenu,
      tglPemeriksaan: todayFormatted,
      petugasPemeriksa: 'Dzakiyah Al Zahrani (Kader)',
      langkah1: {
        nik: warga?.nik || l1.nik,
        nama: warga?.nama || l1.nama,
        tglLahir: warga?.tglLahir || l1.tglLahir,
        gender: warga?.gender || l1.gender,
        namaIbu: warga?.namaIbu || '',
        alamat: warga?.alamat || 'Wilayah RW 04, Sukamaju',
        checklistKia: l1.checklistKia || 'Ya',
        usiaKehamilan: l1.usiaKehamilan || waktuKunjunganPresensi[targetId] || (activeSubmenu === 'bumil' ? '32-36 minggu' : ''),
        waktuKunjunganNifas: l1.waktuKunjunganNifas || waktuKunjunganPresensi[targetId] || (activeSubmenu === 'nifas' ? 'Bulan 2' : '')
      },
      langkah2: {
        bb: l2.bb || warga?.bb || '',
        tb: l2.tb || warga?.tb || '',
        lila: l2.lila || '',
        lk: l2.lk || '',
        lp: l2.lp || '',
        tensiSistol: l2.tensiSistol || '',
        tensiDiastol: l2.tensiDiastol || '',
        gulaDarah: l2.gulaDarah || ''
      },
      langkah3: {
        imt: l3.imt || 'Normal',
        imtStatus: l3.imtStatus || 'Normal (Sesuai Kurva KIA)',
        bbUStatus: 'BB Normal / Naik (N, -2SD s.d +1SD)',
        pbUStatus: 'Normal (N, -2SD s.d +3SD)',
        bbPbStatus: 'Gizi Baik (-2SD s.d +1SD)',
        lkStatus: 'Normal (-2SD s.d +2SD)',
        lilaStatus: 'Normal / Gizi Baik'
      },
      langkah4: {
        ...l4,
        is_skrining_tahunan: Boolean(l4.isSkriningTahunan),
        isSkriningTahunan: Boolean(l4.isSkriningTahunan),
        tglSkriningTahunan: l4.isSkriningTahunan ? todayFormatted : (warga?.tglSkriningTahunanTerakhir || null),
        batukTbc: l4.batukTbc || '',
        demamTbc: l4.demamTbc || '',
        bbTurunTbc: l4.bbTurunTbc || '',
        kontakTbc: l4.kontakTbc || '',
        vitA: l4.vitA || '',
        imunisasi: l4.imunisasi || '',
        obatCacing: l4.obatCacing || '',
        skriningPtm: l4.skriningPtm || ''
      },
      langkah5: {
        topikPenyuluhan: langkah5Form.topikPenyuluhan || `Edukasi & Konseling Kesehatan ${currentCategory.label}`,
        statusRujukan: langkah5Form.statusRujukan || 'Tidak Perlu Rujukan',
        mengikutiKelas: langkah5Form.mengikutiKelas || 'Ya'
      }
    };

    try {
      const targetForExam = activeWargaList.find((w) => String(w.id) === String(targetId));
      const kunjunganId = await ensureKunjunganId(targetForExam);
      await pemeriksaanService.createPemeriksaan({
        kunjungan_id: Number(kunjunganId),
        tanggal: new Date().toISOString().split('T')[0],
        kategori_sasaran: mapFrontendCategoryToBackend(activeSubmenu),
        bb_kg: parseFloat(l2.bb) || undefined,
        tb_cm: parseFloat(l2.tb) || undefined,
        lingkar_kepala_cm: parseFloat(l2.lk) || undefined,
        lila_cm: parseFloat(l2.lila) || undefined,
        lingkar_perut_cm: parseFloat(l2.lp) || undefined,
        td_sistole: parseInt(l2.tensiSistol) || undefined,
        td_diastole: parseInt(l2.tensiDiastol) || undefined,
        kadar_gula: parseInt(l2.gulaDarah) || undefined,
        topik_penyuluhan: langkah5Form.topikPenyuluhan || `Edukasi & Konseling Kesehatan ${currentCategory.label}`,
        is_perlu_rujukan: langkah5Form.statusRujukan?.includes('Rujuk') || false,
        detail_skrining: { ...l1, ...l2, ...l4, ...langkah5Form }
      });
    } catch (err) {
      console.info('Backend create pemeriksaan step-5 notice:', err);
    }

    if (setGlobalPemeriksaanData) {
      setGlobalPemeriksaanData(prev => ({
        ...prev,
        [targetId]: examinationRecord,
        [String(targetId)]: examinationRecord
      }));
    }

    if (setGlobalSasaranList) {
      setGlobalSasaranList(prev => prev.map(s => {
        if (String(s.id) === targetId) {
          return {
            ...s,
            statusPemeriksaan: 'Sudah',
            tglPeriksa: todayFormatted,
            ...(l4.isSkriningTahunan ? { tglSkriningTahunanTerakhir: todayFormatted } : {})
          };
        }
        return s;
      }));
    }

    // Warga selesai mengisi step 5 -> namanya hilang dari dropdown Langkah 5
    setCompletedSteps(prev => ({
      ...prev,
      [targetId]: { ...(prev[targetId] || {}), step5: true }
    }));

    // Refresh formulir Langkah 5
    setLangkah5Form({
      topikPenyuluhan: '',
      mengikutiKelas: 'Ya',
      statusRujukan: 'Tidak Perlu Rujukan'
    });

    showSuccess(
      "Langkah 5: Konseling & Rekap Selesai",
      `Pelayanan & Konseling [Langkah 5] untuk "${warga?.nama || 'Warga'}" berhasil disimpan! Seluruh tahapan pemeriksaan posyandu selesai dan data otomatis masuk ke Rekapitulasi.`
    );
    onRefreshData?.();
  };

  // Step handlers for Mode Bertahap
  const handleNextSequentialStep = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (activeStep === 1 || activeStep === 2 || activeStep === 4) {
      const val = validateStepData(activeStep, sequentialForm, activeSubmenu);
      if (!val.isValid) {
        showWarning("Data Belum Lengkap", val.errorMessage);
        return;
      }
    }
    if (activeStep < 5) setActiveStep(activeStep + 1);
  };

  const handleTriggerSequentialPreview = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    for (const s of [1, 2, 4, 5]) {
      const val = validateStepData(s, sequentialForm, activeSubmenu);
      if (!val.isValid) {
        showWarning(`Data Langkah ${s} Belum Lengkap`, val.errorMessage);
        setActiveStep(s);
        return;
      }
    }
    setShowSequentialPreviewModal(true);
  };

  const handleSaveSequentialAll = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    for (const s of [1, 2, 4, 5]) {
      const val = validateStepData(s, sequentialForm, activeSubmenu);
      if (!val.isValid) {
        showWarning(`Data Langkah ${s} Belum Lengkap`, val.errorMessage);
        setActiveStep(s);
        return;
      }
    }
    saveCompleteExamination(sequentialForm, true);
  };

// =========================================================================
// HELPER PEMETAAN WARNA STATUS PLOTTING
// Kurus / Kurang = Merah
// Gemuk / Lebih = Oren
// Obesitas / Hipertensi = Oren Gelap / Merah
// Normal / Baik = Hijau (Ijo)
// =========================================================================
const getPlottingColorStyle = (statusKey) => {
  switch (statusKey) {
    case 'sangat-kurus':
    case 'kurus':
    case 'kurang':
    case 'buruk':
    case 'kek':
    case 'merah':
    case 'ht2':
    case 'ht3':
    case 'hst':
      return {
        badgeBg: '#fee2e2',
        badgeColor: '#dc2626',
        badgeBorder: '#fca5a5',
        activeRowBg: '#fef2f2',
        activeRowBorder: '#f87171',
        activeText: '#b91c1c',
        indicatorBg: '#dc2626',
        labelColor: '#dc2626'
      };
    case 'gemuk':
    case 'lebih':
    case 'oren':
    case 'pra-ht':
      return {
        badgeBg: '#ffedd5',
        badgeColor: '#ea580c',
        badgeBorder: '#fdba74',
        activeRowBg: '#fff7ed',
        activeRowBorder: '#fb923c',
        activeText: '#c2410c',
        indicatorBg: '#ea580c',
        labelColor: '#ea580c'
      };
    case 'obesitas':
    case 'oren-gelap':
    case 'ht1':
    case 'berisiko':
      return {
        badgeBg: '#ffedd5',
        badgeColor: '#c2410c',
        badgeBorder: '#f97316',
        activeRowBg: '#fff1f2',
        activeRowBorder: '#ea580c',
        activeText: '#991b1b',
        indicatorBg: '#c2410c',
        labelColor: '#c2410c'
      };
    case 'normal':
    case 'baik':
    case 'hijau':
    default:
      return {
        badgeBg: '#dcfce7',
        badgeColor: '#15803d',
        badgeBorder: '#86efac',
        activeRowBg: '#f0fdf4',
        activeRowBorder: '#4ade80',
        activeText: '#15803d',
        indicatorBg: '#16a34a',
        labelColor: '#16a34a'
      };
  }
};

  // =========================================================================
  // CALCULATOR PLOTTING DYNAMIC FOR ALL CATEGORIES
  // =========================================================================
  const calculateCategoryPlotting = (sourceData) => {
    if (!sourceData) return null;

    const rawBb = parseFloat(sourceData.bb);
    const hasBb = !isNaN(rawBb) && rawBb > 0;
    const rawTb = parseFloat(sourceData.tb);
    const hasTb = !isNaN(rawTb) && rawTb > 0;

    // Jika BB dan TB belum ada/kosong, jangan lakukan kalkulasi plotting semu
    if (!hasBb && !hasTb) return null;

    const bb = hasBb ? rawBb : (['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? 12.0 : 55.0);
    const tb = hasTb ? rawTb : (['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? 88 : 155);

    const lk = parseFloat(sourceData.lk || 47);
    const lila = parseFloat(sourceData.lila || 15);
    const lp = parseFloat(sourceData.lp || 0);

    const imtInMeters = (tb > 0 ? tb : 155) / 100;
    const imt = (bb / (imtInMeters * imtInMeters)).toFixed(1);

    let imtStatus = 'Normal 18.5 – 24.9 kg/m²';
    let isImtRisiko = false;
    let imtKey = 'normal';
    if (imt < 18.5) {
      isImtRisiko = true;
      imtStatus = 'Risiko Gizi Kurang (< 18.5 kg/m²)';
      imtKey = 'kurus';
    } else if (imt > 27.0) {
      isImtRisiko = true;
      imtStatus = 'Risiko Obesitas (> 27 kg/m²)';
      imtKey = 'obesitas';
    } else if (imt > 24.9) {
      isImtRisiko = true;
      imtStatus = 'Risiko Kelebihan BB (> 25 kg/m²)';
      imtKey = 'gemuk';
    } else {
      imtStatus = 'Normal 18.5 – 24.9 kg/m²';
      imtKey = 'normal';
    }

    const isLilaKek = lila > 0 && lila < 23.5;
    const lilaStatus = isLilaKek ? 'Risiko KEK (< 23.5 cm)' : 'Normal (> 23.5 cm)';

    const sistol = parseInt(sourceData.tensiSistol || 118);
    const diastol = parseInt(sourceData.tensiDiastol || 78);
    const isTensiRisiko = sistol >= 130 || diastol >= 85;
    const tensiStatus = isTensiRisiko ? 'Risiko Hipertensi (≥ 130/85 mmHg)' : 'Normal (< 130/85 mmHg)';
    let tensiAdultKey = 'normal';
    if (sistol >= 140 || diastol >= 90) {
      tensiAdultKey = 'ht1';
    } else if (sistol >= 130 || diastol >= 85) {
      tensiAdultKey = 'pra-ht';
    } else {
      tensiAdultKey = 'normal';
    }

    const gula = parseInt(sourceData.gulaDarah || 100);
    const isGulaRisiko = gula >= 140;
    const gulaStatus = isGulaRisiko ? 'Risiko Hiperglikemia (≥ 140 mg/dL)' : 'Normal (< 140 mg/dL)';

    // Plotting Specific for Bayi / Balita WHO Standards
    const bbUStatus = 'BB Normal / Naik (N, -2SD s.d +1SD)';
    const pbUStatus = 'Normal (N, -2SD s.d +3SD)';
    const bbPbStatus = 'Gizi Baik (-2SD s.d +1SD)';
    const lkStatus = 'Normal (-2SD s.d +2SD)';
    
    // Threshold LiLA
    let lilaBayiStatus = 'Gizi Normal (> 12.5 cm)';
    let lilaBayiKey = 'normal';
    if (activeSubmenu === 'bayi-0-11') {
      if (lila >= 12.5) {
        lilaBayiStatus = 'Gizi Normal (≥ 12.5 cm)';
        lilaBayiKey = 'normal';
      } else if (lila >= 11.1) {
        lilaBayiStatus = 'Gizi Kurang (11.1 - 12.4 cm)';
        lilaBayiKey = 'kurus';
      } else {
        lilaBayiStatus = 'Gizi Buruk (< 11.0 cm)';
        lilaBayiKey = 'sangat-kurus';
      }
    } else {
      if (lila > 12.5) {
        lilaBayiStatus = 'Gizi Normal (> 12.5 cm)';
        lilaBayiKey = 'normal';
      } else if (lila >= 11.5) {
        lilaBayiStatus = 'Gizi Kurang (11.5 - 12.5 cm)';
        lilaBayiKey = 'kurus';
      } else {
        lilaBayiStatus = 'Gizi Buruk (< 11.5 cm)';
        lilaBayiKey = 'sangat-kurus';
      }
    }

    // Apras 60-72 Bulan WHO / KIA standards
    let imtAprasStatus = 'Gizi Baik (-2 SD s.d +1 SD)';
    let imtAprasKey = 'normal';
    if (imt < 14) {
      imtAprasStatus = 'Gizi Kurang (-3 SD s.d -2 SD)';
      imtAprasKey = 'kurus';
    } else if (imt <= 17) {
      imtAprasStatus = 'Gizi Baik (-2 SD s.d +1 SD)';
      imtAprasKey = 'normal';
    } else if (imt <= 19) {
      imtAprasStatus = 'Gizi Lebih (+1 SD s.d +2 SD)';
      imtAprasKey = 'gemuk';
    } else {
      imtAprasStatus = 'Obesitas (> +2 SD)';
      imtAprasKey = 'obesitas';
    }

    let lilaAprasStatus = 'Gizi Normal (≥ 14 cm)';
    let lilaAprasKey = 'normal';
    if (lila < 12.8) {
      lilaAprasStatus = 'Gizi Buruk (< 12.8 cm)';
      lilaAprasKey = 'sangat-kurus';
    } else if (lila < 14) {
      lilaAprasStatus = 'Gizi Kurang (12.8 cm - 14 cm)';
      lilaAprasKey = 'kurus';
    } else {
      lilaAprasStatus = 'Gizi Normal (≥ 14 cm)';
      lilaAprasKey = 'normal';
    }

    // Usia Sekolah & Remaja 6-14 Tahun WHO standards
    let imtUsekremStatus = 'Gizi Baik (GB)';
    let imtUsekremKey = 'normal';
    if (imt < 15) {
      imtUsekremStatus = 'Gizi Kurang (GK)';
      imtUsekremKey = 'kurus';
    } else if (imt <= 21) {
      imtUsekremStatus = 'Gizi Baik (GB)';
      imtUsekremKey = 'normal';
    } else if (imt <= 24) {
      imtUsekremStatus = 'Gizi Lebih (GL)';
      imtUsekremKey = 'gemuk';
    } else {
      imtUsekremStatus = 'Obesitas (O)';
      imtUsekremKey = 'obesitas';
    }

    // Plotting Tekanan Darah Remaja 15-18 Tahun Sesuai Wireframe
    let tensiRemajaStatus = 'Normal 120-129/80-84 (N)';
    let tensiKey = 'normal';
    if (sistol > 140 && diastol < 90) {
      tensiRemajaStatus = 'Hipertensi Sistolik Terisolasi >140/<90 (HST)';
      tensiKey = 'hst';
    } else if (sistol > 180 || diastol > 110) {
      tensiRemajaStatus = 'Hipertensi tingkat 3 >180/110 (Ht 3)';
      tensiKey = 'ht3';
    } else if (sistol >= 160 || diastol >= 100) {
      tensiRemajaStatus = 'Hipertensi tingkat 2 160-179/100-109 (Ht 2)';
      tensiKey = 'ht2';
    } else if (sistol >= 140 || diastol >= 90) {
      tensiRemajaStatus = 'Hipertensi tingkat 1 140-159/90-99 (Ht 1)';
      tensiKey = 'ht1';
    } else if (sistol >= 130 || diastol >= 85) {
      tensiRemajaStatus = 'Pra hipertensi 130-139/85-89 (Pra HT)';
      tensiKey = 'pra-ht';
    } else {
      tensiRemajaStatus = 'Normal 120-129/80-84 (N)';
      tensiKey = 'normal';
    }

    // Dewasa & Lansia IMT Plotting
    let imtDewasaStatus = 'Normal (N)';
    let imtDewasaKey = 'normal';
    if (imt < 17) {
      imtDewasaStatus = 'Sangat Kurus (SK)';
      imtDewasaKey = 'sangat-kurus';
    } else if (imt < 18.5) {
      imtDewasaStatus = 'Kurus (K)';
      imtDewasaKey = 'kurus';
    } else if (imt <= 25) {
      imtDewasaStatus = 'Normal (N)';
      imtDewasaKey = 'normal';
    } else if (imt <= 27) {
      imtDewasaStatus = 'Gemuk (G)';
      imtDewasaKey = 'gemuk';
    } else {
      imtDewasaStatus = 'Obesitas (O)';
      imtDewasaKey = 'obesitas';
    }

    // Dewasa & Lansia LP Plotting
    const isGenderMale = (sourceData.gender || 'Laki-laki') === 'Laki-laki';
    const lpVal = parseFloat(sourceData.lp || 0);
    let lpPlottingStatus = 'Normal';
    let lpPlottingKey = 'normal';
    if (isGenderMale) {
      const isNorm = lpVal > 0 && lpVal <= 90;
      lpPlottingStatus = isNorm ? 'Normal (≤ 90 cm)' : 'Berisiko (> 90 cm)';
      lpPlottingKey = isNorm ? 'normal' : 'berisiko';
    } else {
      const isNorm = lpVal > 0 && lpVal <= 80;
      lpPlottingStatus = isNorm ? 'Normal (≤ 80 cm)' : 'Berisiko (> 80 cm)';
      lpPlottingKey = isNorm ? 'normal' : 'berisiko';
    }

    // Dewasa vs Lansia LiLA Plotting
    let lilaDewasaStatus = lila >= 23.5 ? 'Normal (≥ 23.5 cm)' : 'Kurang (< 23.5 cm)';
    let lilaDewasaKey = lila >= 23.5 ? 'normal' : 'kurus';
    let lilaLansiaStatus = lila >= 21.5 ? 'Normal (≥ 21.5 cm)' : 'Kurang (< 21.5 cm)';
    let lilaLansiaKey = lila >= 21.5 ? 'normal' : 'kurus';

    return { 
      hasBb,
      imt, imtStatus, isImtRisiko, imtKey, lila, lilaStatus, isLilaKek, 
      sistol, diastol, tensiStatus, isTensiRisiko, tensiAdultKey, gula, gulaStatus, isGulaRisiko,
      bb, tb, lk, bbUStatus, pbUStatus, bbPbStatus, lkStatus, lilaBayiStatus, lilaBayiKey,
      imtAprasStatus, imtAprasKey, lilaAprasStatus, lilaAprasKey, 
      imtUsekremStatus, imtUsekremKey, tensiRemajaStatus, tensiKey,
      imtDewasaStatus, imtDewasaKey, lpPlottingStatus, lpPlottingKey, 
      lilaDewasaStatus, lilaDewasaKey, lilaLansiaStatus, lilaLansiaKey
    };
  };

  const activeSourceDataL3 = useMemo(() => {
    if (examinationMode === 'sequential') {
      return sequentialForm;
    }
    if (!selectedWargaStep3) {
      return null;
    }
    const targetWarga = activeWargaList.find(w => String(w.id) === String(selectedWargaStep3));
    if (!targetWarga) return null;
    const savedL2 = stepDataByWarga[String(selectedWargaStep3)]?.langkah2;
    const globalExamL2 = (globalPemeriksaanData && globalPemeriksaanData[String(selectedWargaStep3)])?.langkah2;
    return {
      bb: savedL2?.bb || globalExamL2?.bb || targetWarga?.bb || '',
      tb: savedL2?.tb || globalExamL2?.tb || targetWarga?.tb || '',
      lila: savedL2?.lila || globalExamL2?.lila || '',
      lk: savedL2?.lk || globalExamL2?.lk || '',
      lp: savedL2?.lp || globalExamL2?.lp || '',
      tensiSistol: savedL2?.tensiSistol || globalExamL2?.tensiSistol || '',
      tensiDiastol: savedL2?.tensiDiastol || globalExamL2?.tensiDiastol || '',
      gulaDarah: savedL2?.gulaDarah || globalExamL2?.gulaDarah || '',
      gender: targetWarga?.gender || 'Perempuan',
      nama: targetWarga?.nama || 'Anak',
      tglLahir: targetWarga?.tglLahir || targetWarga?.tanggalLahir || '',
      usia: targetWarga?.usia || targetWarga?.umur || ''
    };
  }, [examinationMode, sequentialForm, selectedWargaStep3, activeWargaList, stepDataByWarga, globalPemeriksaanData]);

  const childAgeMonths = useMemo(() => {
    const warga = activeSourceDataL3;
    if (warga?.tglLahir) {
      const dob = new Date(warga.tglLahir);
      if (!isNaN(dob.getTime())) {
        const now = new Date();
        const diffMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
        if (diffMonths >= 0 && diffMonths <= 216) return diffMonths;
      }
    }
    if (warga?.usia) {
      const str = String(warga.usia).toLowerCase();
      if (str.includes('bln') || str.includes('bulan')) {
        const m = parseInt(str);
        if (!isNaN(m)) return m;
      }
      if (str.includes('thn') || str.includes('tahun')) {
        const y = parseInt(str);
        if (!isNaN(y)) return y * 12;
      }
      const num = parseFloat(str);
      if (!isNaN(num)) {
        if (num < 10 && ['bayi-0-11', 'balita-12-59'].includes(activeSubmenu)) return Math.round(num * 12);
        return Math.round(num);
      }
    }
    return 12;
  }, [activeSourceDataL3, activeSubmenu]);

  const plottingResult = calculateCategoryPlotting(activeSourceDataL3);

  // Auto-sinkronisasi statusRujukan ke form state berdasarkan hasil skrining & plotting
  // Ini memastikan saat data disimpan, nilai rujukan sudah benar di form state
  useEffect(() => {
    if (activeStep !== 5) return;
    const form4 = examinationMode === 'per-step' ? langkah4Form : sequentialForm;
    const tbcFields = ['batukTbc','demamTbc','bbTurunTbc','kontakTbc','lesuTbc',
      'batukBesarTbc','nafsuMakanTbc','bbMenurunTbc','lemahLesuTbc','berkeringatMalamTbc','batukDarahTbc','sesakNafasTbc'];
    const tbcRisiko = tbcFields.some(f => form4[f] === 'Ya');
    const pr = plottingResult;
    const imtRisiko = pr && pr.imtKey !== 'normal';
    const lilaRisiko = pr && (
      activeSubmenu === 'lansia' ? pr.lilaLansiaKey !== 'normal' :
      (activeSubmenu === 'dewasa' || activeSubmenu === 'bumil' || activeSubmenu === 'nifas') ? pr.lilaDewasaKey !== 'normal' :
      ['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? pr.lilaBayiKey !== 'normal' :
      activeSubmenu === 'apras' ? pr.lilaAprasKey !== 'normal' : false
    );
    const tensiRisiko = pr && pr.tensiAdultKey !== 'normal';
    const gulaRisiko = pr && pr.isGulaRisiko;
    const lpRisiko = pr && pr.lpPlottingKey !== 'normal';
    const aksRisiko = activeSubmenu === 'lansia' && currentAks.perluRujuk;
    const skilasRisiko = activeSubmenu === 'lansia' && currentSkilas.adaRisiko;
    const jiwaRisiko = activeSubmenu === 'dewasa' && currentJiwa.isRisiko;
    const isPerlu = tbcRisiko || imtRisiko || lilaRisiko || tensiRisiko || gulaRisiko || lpRisiko || aksRisiko || skilasRisiko || jiwaRisiko;
    if (isPerlu) {
      if (examinationMode === 'per-step') {
        setLangkah5Form(prev => prev.statusRujukan === 'Rujuk ke Puskesmas / Pustu' ? prev : { ...prev, statusRujukan: 'Rujuk ke Puskesmas / Pustu' });
      } else {
        setSequentialForm(prev => prev.statusRujukan === 'Rujuk ke Puskesmas / Pustu' ? prev : { ...prev, statusRujukan: 'Rujuk ke Puskesmas / Pustu' });
      }
    }
  }, [activeStep, examinationMode, langkah4Form, sequentialForm, plottingResult, activeSubmenu, currentAks, currentSkilas, currentJiwa]);

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header Card (Original Style with Icon & Title) */}
      <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '20px' }}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white rounded-4 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px' }}>
              <Stethoscope size={28} />
            </div>
            <div>
              <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill mb-1 small">
                Form Pemeriksaan 5 Langkah
              </span>
              <h2 className="fw-bold text-dark mb-1">{currentCategory.label}</h2>
              <p className="text-secondary small mb-0">Alur pencatatan dan evaluasi kesehatan berkala per-langkah</p>
            </div>
          </div>

          {/* Top Right Header Buttons: Segmented [Pilih Langkah] [Bertahap] & Kembali Button */}
          <div className="d-flex align-items-center gap-2">
            <div className="d-inline-flex align-items-center bg-light p-1 rounded-pill border shadow-xs" style={{ borderColor: '#cbd5e1' }}>
              <button 
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all ${
                  examinationMode === 'per-step' 
                    ? 'bg-white text-dark shadow-sm border' 
                    : 'text-secondary border-0'
                }`}
                style={{ fontSize: '0.825rem' }}
                onClick={() => {
                  setExaminationMode('per-step');
                }}
              >
                Pilih Langkah
              </button>
              <button 
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all ${
                  examinationMode === 'sequential' 
                    ? 'text-white shadow-sm border-0' 
                    : 'text-secondary border-0'
                }`}
                style={{ 
                  backgroundColor: examinationMode === 'sequential' ? '#2b2e4a' : 'transparent',
                  fontSize: '0.825rem' 
                }}
                onClick={() => {
                  setExaminationMode('sequential');
                }}
              >
                Bertahap
              </button>
            </div>

            <button 
              className="btn btn-outline-secondary rounded-3 py-2 px-3 d-flex align-items-center gap-2 shadow-sm"
              style={{ fontSize: '0.875rem' }}
              onClick={() => onNavigate('data-sasaran')}
            >
              <ArrowLeft size={15} />
              <span>Kembali ke Data Sasaran</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Examination Card Container */}
      <div className="card card-custom bg-white border-0 shadow-sm overflow-hidden" style={{ borderRadius: '20px' }}>
        
        {/* ========================================================================= */}
        {/* MODE 2 (BERTAHAP): STEPPER LINGKARAN (1) -> (2) -> (3) -> (4) -> (5) */}
        {/* ========================================================================= */}
        {examinationMode === 'sequential' ? (
          <div className="d-flex align-items-center justify-content-center my-4 py-3">
            {[1, 2, 3, 4, 5].map((stepNum, idx) => (
              <React.Fragment key={stepNum}>
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold transition-all shadow-sm ${
                    activeStep === stepNum 
                      ? 'bg-dark text-white' 
                      : activeStep > stepNum 
                        ? 'bg-secondary text-white' 
                        : 'bg-light text-secondary border'
                  }`}
                  style={{ 
                    width: '58px', 
                    height: '58px', 
                    fontSize: '1.35rem',
                    backgroundColor: activeStep === stepNum ? '#2b2e4a' : activeStep > stepNum ? '#475569' : '#e2e8f0',
                    color: activeStep === stepNum || activeStep > stepNum ? '#ffffff' : '#64748b',
                    cursor: 'default',
                    userSelect: 'none'
                  }}
                  title={`Langkah ${stepNum}`}
                >
                  {stepNum}
                </div>

                {idx < 4 && (
                  <div className="mx-2 mx-md-4 text-muted d-flex align-items-center">
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#94a3b8' }}>&rarr;</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          /* ========================================================================= */
          /* MODE 1 (PILIH LANGKAH): TABS ASLI LANGKAH 1 - 5 */
          /* ========================================================================= */
          <div className="d-flex border-bottom overflow-x-auto bg-light p-3 gap-3">
            {[1, 2, 3, 4, 5].map((stepNum) => {
              const isActive = activeStep === stepNum;
              return (
                <button
                  key={stepNum}
                  type="button"
                  className={`py-3 px-4.5 rounded-3 fw-bold text-nowrap transition-all border ${
                    isActive 
                      ? 'bg-white text-primary border-2 border-primary shadow-sm' 
                      : 'bg-white text-secondary border-light-subtle shadow-xs'
                  }`}
                  style={{ 
                    fontSize: '1.1rem', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: isActive ? '#F25B8E' : '#334155',
                    borderColor: isActive ? '#F25B8E' : '#cbd5e1',
                    boxShadow: isActive ? '0 4px 14px rgba(242, 91, 142, 0.45)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => setActiveStep(stepNum)}
                  title={`Buka Langkah ${stepNum}`}
                >
                  Langkah {stepNum}
                </button>
              );
            })}
          </div>
        )}

        {/* Gray Container Form Area */}
        <div className="p-4 p-md-5" style={{ backgroundColor: '#cbd5e1' }}>

          {/* ========================================================================= */}
          {/* LANGKAH 1: PENDAFTARAN & PRESENSI KEHADIRAN SASARAN */}
          {/* ========================================================================= */}
          {activeStep === 1 && (
            <div>
              {/* Header Langkah 1 */}
              <div className="mb-4">
                <h3 className="fw-bold text-dark mb-1">Pendaftaran &amp; Presensi Sasaran</h3>
              </div>

              {/* =================================================================== */}
              {/* KONTEN UTAMA LANGKAH 1: DAFTAR PRESENSI & IDENTITAS SASARAN */}
              {/* =================================================================== */}
              <div className="card bg-white border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <Users size={20} className="text-primary" />
                      <span>Daftar Presensi Sasaran Hari Ini</span>
                    </h5>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Search size={14} />
                      </span>
                      <input 
                        type="text" 
                        className="form-control border-start-0 ps-0" 
                        placeholder="Cari nama atau NIK..." 
                        value={searchWargaQuery}
                        onChange={(e) => setSearchWargaQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-light">
                      <tr className="text-muted fw-bold">
                        <th className="py-2.5 px-3 text-center" style={{ width: '45px' }}>No</th>
                        <th className="py-2.5 px-3" style={{ minWidth: '180px' }}>Nama Lengkap / NIK</th>
                        <th className="py-2.5 px-3" style={{ minWidth: '130px' }}>Tanggal Lahir / Usia</th>
                        <th className="py-2.5 px-3 text-center" style={{ minWidth: '100px' }}>Jenis Kelamin</th>
                        {activeSubmenu === 'bumil' && (
                          <th className="py-2.5 px-3 text-center" style={{ minWidth: '150px' }}>Usia Kehamilan</th>
                        )}
                        {activeSubmenu === 'nifas' && (
                          <th className="py-2.5 px-3 text-center" style={{ minWidth: '170px' }}>Waktu Kunjungan</th>
                        )}
                        <th className="py-2.5 px-3 text-center" style={{ minWidth: '150px' }}>Alamat</th>
                        <th className="py-2.5 px-3 text-center" style={{ minWidth: '160px', width: '160px' }}>Status Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSasaranLangkah1.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-5 text-muted">
                            {searchWargaQuery.trim() ? (
                              <div className="py-2">
                                <div className="fw-semibold text-dark mb-1">Sasaran Tidak Ditemukan</div>
                                <p className="text-muted small mb-0">
                                  Tidak ada sasaran <strong>{currentCategory.label}</strong> yang cocok dengan kata kunci "<strong>{searchWargaQuery}</strong>".
                                </p>
                              </div>
                            ) : (
                              <div className="d-flex flex-column align-items-center justify-content-center py-3">
                                <div className="p-3 bg-light rounded-circle mb-2 text-primary">
                                  <Search size={24} />
                                </div>
                                <div className="fw-bold text-dark fs-6 mb-1">Cari Sasaran {currentCategory.label}</div>
                                <p className="text-muted small mb-0" style={{ maxWidth: '440px' }}>
                                  Ketik nama lengkap atau NIK pada kolom pencarian di atas untuk menampilkan data sasaran kategori <strong>{currentCategory.label}</strong> dan menandai kehadiran presensi hari ini.
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredSasaranLangkah1.map((warga, idx) => {
                          const wId = String(warga.id);
                          const presenceStatus = kehadiranWarga[wId]; // true | false | undefined
                          const isHadir = presenceStatus === true;
                          const isTidakHadir = presenceStatus === false;
                          const isSelectedSequential = examinationMode === 'sequential' && selectedWargaId === wId;

                          // Perhitungan umur dan format tanggal lahir yang akurat tanpa NaN
                          let displayTgl = warga.tglLahir || '-';
                          let displayUsia = warga.usia || '';
                          if (warga.tglLahir && warga.tglLahir.includes('-')) {
                            const parts = warga.tglLahir.split('-');
                            if (parts[0].length === 4) {
                              displayTgl = `${parts[2]}-${parts[1]}-${parts[0]}`;
                              if (!displayUsia) {
                                const diffY = new Date().getFullYear() - parseInt(parts[0]);
                                displayUsia = `${diffY} Thn`;
                              }
                            } else if (parts[2].length === 4) {
                              displayTgl = warga.tglLahir;
                              if (!displayUsia) {
                                const diffY = new Date().getFullYear() - parseInt(parts[2]);
                                displayUsia = `${diffY} Thn`;
                              }
                            }
                          }

                          return (
                            <tr 
                              key={warga.id} 
                              className={isSelectedSequential ? 'table-primary bg-opacity-25' : ''}
                              style={{ cursor: examinationMode === 'sequential' ? 'pointer' : 'default' }}
                              onClick={() => {
                                if (examinationMode === 'sequential') {
                                  setSelectedWargaId(wId);
                                  setSequentialForm(prev => ({
                                    ...prev,
                                    nik: warga.nik || '',
                                    nama: warga.nama || '',
                                    tglLahir: warga.tglLahir || '',
                                    gender: warga.gender || (['bumil', 'nifas'].includes(activeSubmenu) ? 'Perempuan' : 'Laki-laki'),
                                    pekerjaan: warga.pekerjaan || prev.pekerjaan || '',
                                    statusPernikahan: warga.statusPernikahan || prev.statusPernikahan || '',
                                    sekolah: warga.sekolah || prev.sekolah || '',
                                    kelas: warga.kelas || prev.kelas || '',
                                    tb: warga.tb || prev.tb,
                                    bb: warga.bb || prev.bb
                                  }));
                                }
                              }}
                            >
                              <td className="text-center fw-semibold text-muted px-3">{idx + 1}</td>
                              <td className="px-3">
                                <div className="fw-bold text-dark">{warga.nama}</div>
                                <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{warga.nik}</div>
                              </td>
                              <td className="px-3">
                                <div className="text-dark fw-medium">{displayTgl}</div>
                                {displayUsia && (
                                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>{displayUsia}</div>
                                )}
                              </td>
                              <td className="text-center px-3 text-dark fw-medium">
                                {warga.gender || (['bumil', 'nifas'].includes(activeSubmenu) ? 'Perempuan' : 'Laki-laki')}
                              </td>

                              {/* Kolom Opsi Khusus Bumil */}
                              {activeSubmenu === 'bumil' && (
                                <td className="px-3">
                                  <select 
                                    className="form-select form-select-sm bg-white border text-dark py-1"
                                    style={{ fontSize: '0.82rem' }}
                                    value={waktuKunjunganPresensi[wId] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWaktuKunjunganPresensi(prev => ({ ...prev, [wId]: val }));
                                      if (examinationMode === 'sequential' && selectedWargaId === wId) {
                                        setSequentialForm(prev => ({ ...prev, usiaKehamilan: val }));
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="">-- Pilih --</option>
                                    {OPSI_UMUR_KEHAMILAN_BUMIL.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                </td>
                              )}

                              {/* Kolom Opsi Khusus Nifas */}
                              {activeSubmenu === 'nifas' && (
                                <td className="px-3">
                                  <select 
                                    className="form-select form-select-sm bg-white border text-dark py-1 mb-1"
                                    style={{ fontSize: '0.82rem' }}
                                    value={waktuKunjunganPresensi[wId] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWaktuKunjunganPresensi(prev => ({ ...prev, [wId]: val }));
                                      if (examinationMode === 'sequential' && selectedWargaId === wId) {
                                        setSequentialForm(prev => ({ ...prev, waktuKunjunganNifas: val }));
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="">-- Pilih --</option>
                                    <optgroup label="Masa Nifas">
                                      {OPSI_WAKTU_NIFAS_MENYUSUI.slice(0, 3).map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Masa Menyusui (Tahun 1: Bln 2 - 12)">
                                      {OPSI_WAKTU_NIFAS_MENYUSUI.slice(3, 14).map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Masa Menyusui (Tahun 2: Bln 13 - 24)">
                                      {OPSI_WAKTU_NIFAS_MENYUSUI.slice(14).map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </optgroup>
                                  </select>
                                  <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
                                    <span>Lahir Bayi:</span>
                                    <span className="fw-semibold text-dark">{warga.tglPersalinan || warga.tglLahirBayi || '01-01-2026'}</span>
                                  </div>
                                </td>
                              )}

                              <td className="px-3 text-secondary">{warga.alamat || 'Jl. Melati RW 04'}</td>

                              <td className="text-center px-2">
                                <div className="btn-group btn-group-sm" role="group" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    type="button" 
                                    className={`btn px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 ${
                                      isHadir 
                                        ? 'shadow-xs' 
                                        : 'bg-white text-secondary'
                                    }`}
                                    style={{ 
                                      fontSize: '0.76rem',
                                      ...(isHadir 
                                        ? { backgroundColor: '#e8f5e9', borderColor: '#81c784', color: '#1e6b37' } 
                                        : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#475569' })
                                    }}
                                    onClick={() => {
                                      handleToggleKehadiran(wId, true);
                                      if (examinationMode === 'sequential') {
                                        setSelectedWargaId(wId);
                                        setSequentialForm(prev => ({
                                          ...prev,
                                          nik: warga.nik || '',
                                          nama: warga.nama || '',
                                          tglLahir: warga.tglLahir || '',
                                          gender: warga.gender || (['bumil', 'nifas'].includes(activeSubmenu) ? 'Perempuan' : 'Laki-laki'),
                                          pekerjaan: warga.pekerjaan || prev.pekerjaan || '',
                                          statusPernikahan: warga.statusPernikahan || prev.statusPernikahan || '',
                                          sekolah: warga.sekolah || prev.sekolah || '',
                                          kelas: warga.kelas || prev.kelas || '',
                                          tb: warga.tb || prev.tb,
                                          bb: warga.bb || prev.bb
                                        }));
                                      }
                                    }}
                                  >
                                    <UserCheck size={12.5} />
                                    <span>Datang</span>
                                  </button>
                                  <button 
                                    type="button" 
                                    className={`btn px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 ${
                                      isTidakHadir 
                                        ? 'shadow-xs' 
                                        : 'bg-white text-secondary'
                                    }`}
                                    style={{ 
                                      fontSize: '0.76rem',
                                      ...(isTidakHadir 
                                        ? { backgroundColor: '#ffebee', borderColor: '#ef9a9a', color: '#b71c1c' } 
                                        : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#475569' })
                                    }}
                                    onClick={() => handleToggleKehadiran(wId, false)}
                                  >
                                    <UserX size={12.5} />
                                    <span>Tidak Datang</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Presensi Langkah 1 */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pt-3 mt-3 border-top">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold">
                      {Object.entries(kehadiranWarga).filter(([id, status]) => status === true && activeWargaList.some(w => String(w.id) === String(id))).length} Sasaran Datang
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill fw-semibold">
                      {Object.entries(kehadiranWarga).filter(([id, status]) => status === false && activeWargaList.some(w => String(w.id) === String(id))).length} Tidak Datang
                    </span>
                  </div>

                  <div>
                    {examinationMode === 'per-step' ? (
                      <button 
                        type="button" 
                        className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                        style={{ backgroundColor: '#2b2e4a' }}
                        onClick={handleSavePresensiLangkah1}
                      >
                        <UserCheck size={16} />
                        <span>Simpan</span>
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                        style={{ backgroundColor: '#2b2e4a' }}
                        onClick={handleNextSequentialStep}
                      >
                        <span>Lanjut ke Langkah 2</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LANGKAH 2: SKRINING PENIMBANGAN DAN PENGUKURAN */}
          {/* ========================================================================= */}
          {activeStep === 2 && (
            <form onSubmit={examinationMode === 'per-step' ? handleSaveLangkah2 : handleNextSequentialStep}>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Skrining Penimbangan dan Pengukuran</h3>
                </div>

                {examinationMode === 'per-step' && (
                  <div className="bg-white px-3 py-2 rounded-3 border-0 shadow-sm d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                    <select 
                      className="form-select form-select-sm border-0 fw-semibold text-dark"
                      style={{ minWidth: '220px' }}
                      value={selectedWargaStep2}
                      onChange={(e) => {
                        const wId = e.target.value;
                        setSelectedWargaStep2(wId);
                        const saved = stepDataByWarga[wId]?.langkah2;
                        if (saved) {
                          setLangkah2Form({ ...saved });
                        } else {
                          setLangkah2Form({
                            bb: '', tb: '', lila: '', lk: '', lp: '', tensiSistol: '', tensiDiastol: '', gulaDarah: ''
                          });
                        }
                      }}
                    >
                      {availableWargaStep2.length === 0 ? (
                        <option value="">{hadirWargaList.length === 0 ? '-- Belum ada sasaran hadir di Langkah 1 --' : '-- Semua sasaran telah diperiksa di Langkah 2 --'}</option>
                      ) : (
                        availableWargaStep2.map(w => (
                          <option key={w.id} value={String(w.id)}>{w.nama} - NIK {String(w.nik).slice(-4)}</option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              {examinationMode === 'per-step' && hadirWargaList.length === 0 && (
                <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span className="small">
                    Belum ada sasaran <strong>{currentCategory.label}</strong> yang ditandai <strong>Datang</strong> pada Langkah 1. Silakan cari dan tandai kehadiran di <strong>Langkah 1 (Presensi)</strong> terlebih dahulu.
                  </span>
                </div>
              )}

              <div className="row g-4 mb-4">
                {/* BB (Berat Badan) */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark small mb-1">BB (kg)</label>
                  <div className="input-group">
                    <input 
                      type="number" step="0.1" 
                      className="form-control form-control-custom bg-white border-0 py-3"
                      placeholder="Masukkan berat badan"
                      value={examinationMode === 'per-step' ? langkah2Form.bb : sequentialForm.bb}
                      onChange={(e) => {
                        if (examinationMode === 'per-step') {
                          setLangkah2Form({ ...langkah2Form, bb: e.target.value });
                        } else {
                          setSequentialForm({ ...sequentialForm, bb: e.target.value });
                        }
                      }}
                      required 
                    />
                    <span className="input-group-text bg-white border-0 fw-semibold text-muted">kg</span>
                  </div>
                </div>

                {/* Tekanan Darah (mm/Hg) - Nifas/Menyusui, Bumil, Dewasa, Lansia */}
                {['bumil', 'nifas', 'usekrem-15-18', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Tekanan darah (mm/Hg)</label>
                    <div className="d-flex align-items-center gap-2">
                      <div className="input-group">
                        <input 
                          type="number" 
                          className="form-control form-control-custom bg-white border-0 py-3"
                          placeholder="120"
                          value={examinationMode === 'per-step' ? langkah2Form.tensiSistol : sequentialForm.tensiSistol}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah2Form({ ...langkah2Form, tensiSistol: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, tensiSistol: e.target.value });
                            }
                          }}
                        />
                        <span className="input-group-text bg-white border-0 text-muted">mm</span>
                      </div>
                      <div className="input-group">
                        <input 
                          type="number" 
                          className="form-control form-control-custom bg-white border-0 py-3"
                          placeholder="80"
                          value={examinationMode === 'per-step' ? langkah2Form.tensiDiastol : sequentialForm.tensiDiastol}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah2Form({ ...langkah2Form, tensiDiastol: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, tensiDiastol: e.target.value });
                            }
                          }}
                        />
                        <span className="input-group-text bg-white border-0 text-muted">Hg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TB / PB (TB Bumil Dihapus sesuai permintaan, hanya untuk anak-anak & dewasa/lansia) */}
                {['bayi-0-11', 'balita-12-59', 'apras', 'usekrem-6-14', 'usekrem-15-18', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">
                      {['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? 'Panjang / Tinggi Badan (PB/TB)' : 'Tinggi Badan (TB)'}
                    </label>
                    <div className="input-group">
                      <input 
                        type="number" step="0.1" 
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder={['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? "Masukkan panjang / tinggi badan" : "Masukkan tinggi badan"}
                        value={examinationMode === 'per-step' ? langkah2Form.tb : sequentialForm.tb}
                        onChange={(e) => {
                          if (examinationMode === 'per-step') {
                            setLangkah2Form({ ...langkah2Form, tb: e.target.value });
                          } else {
                            setSequentialForm({ ...sequentialForm, tb: e.target.value });
                          }
                        }}
                      />
                      <span className="input-group-text bg-white border-0 fw-semibold text-muted">cm</span>
                    </div>
                  </div>
                )}

                {/* Lingkar Kepala (cm) - Bayi & Balita 12-59 Bulan */}
                {['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Lingkar Kepala (cm)</label>
                    <div className="input-group">
                      <input 
                        type="number" step="0.1" 
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder="Masukkan lingkar kepala"
                        value={examinationMode === 'per-step' ? langkah2Form.lk : sequentialForm.lk}
                        onChange={(e) => {
                          if (examinationMode === 'per-step') {
                            setLangkah2Form({ ...langkah2Form, lk: e.target.value });
                          } else {
                            setSequentialForm({ ...sequentialForm, lk: e.target.value });
                          }
                        }}
                      />
                      <span className="input-group-text bg-white border-0 fw-semibold text-muted">cm</span>
                    </div>
                  </div>
                )}

                {/* LiLA (Lingkar Lengan Atas) - Bumil, Bayi/Balita/Apras, Dewasa, & Lansia */}
                {['bumil', 'bayi-0-11', 'balita-12-59', 'apras', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Lingkar Lengan Atas (LiLA)</label>
                    <div className="input-group">
                      <input 
                        type="number" step="0.1" 
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder="Masukkan LiLA"
                        value={examinationMode === 'per-step' ? langkah2Form.lila : sequentialForm.lila}
                        onChange={(e) => {
                          if (examinationMode === 'per-step') {
                            setLangkah2Form({ ...langkah2Form, lila: e.target.value });
                          } else {
                            setSequentialForm({ ...sequentialForm, lila: e.target.value });
                          }
                        }}
                      />
                      <span className="input-group-text bg-white border-0 fw-semibold text-muted">cm</span>
                    </div>
                  </div>
                )}

                {/* Lingkar Perut (cm) - Usekrem 15-18, Dewasa, Lansia */}
                {['usekrem-15-18', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Lingkar Perut (cm)</label>
                    <div className="input-group">
                      <input 
                        type="number" step="0.1" 
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder="Masukkan lingkar perut"
                        value={examinationMode === 'per-step' ? langkah2Form.lp : sequentialForm.lp}
                        onChange={(e) => {
                          if (examinationMode === 'per-step') {
                            setLangkah2Form({ ...langkah2Form, lp: e.target.value });
                          } else {
                            setSequentialForm({ ...sequentialForm, lp: e.target.value });
                          }
                        }}
                      />
                      <span className="input-group-text bg-white border-0 fw-semibold text-muted">cm</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end pt-3 gap-2">
                {examinationMode === 'per-step' ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
                    <span>Simpan</span>
                  </button>
                ) : (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={() => setActiveStep(1)}>
                      <ArrowLeft size={15} />
                      <span>Kembali</span>
                    </button>
                    <button type="submit" className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
                      <span>Lanjut ke Langkah 3</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* LANGKAH 3: PLOTTING EVALUASI KURVA WHO / KIA */}
          {/* ========================================================================= */}
          {activeStep === 3 && (
            <form onSubmit={examinationMode === 'per-step' ? handleSaveLangkah3 : handleNextSequentialStep}>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Plotting</h3>
                </div>

                {examinationMode === 'per-step' && (
                  <div className="bg-white px-3 py-2 rounded-3 border-0 shadow-sm d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                    <select 
                      className="form-select form-select-sm border-0 fw-semibold text-dark"
                      style={{ minWidth: '220px' }}
                      value={selectedWargaStep3}
                      onChange={(e) => setSelectedWargaStep3(e.target.value)}
                    >
                      {availableWargaStep3.length === 0 ? (
                        <option value="">{hadirWargaList.length === 0 ? '-- Belum ada sasaran hadir di Langkah 1 --' : '-- Semua sasaran telah dievaluasi di Langkah 3 --'}</option>
                      ) : (
                        availableWargaStep3.map(w => (
                          <option key={w.id} value={String(w.id)}>{w.nama} - NIK {String(w.nik).slice(-4)}</option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              {examinationMode === 'per-step' && !selectedWargaStep3 ? (
                <div className="p-4 bg-white rounded-4 border-0 shadow-sm text-center my-4">
                  {hadirWargaList.length === 0 ? (
                    <>
                      <AlertCircle size={44} className="text-warning mb-2.5" />
                      <h5 className="fw-bold text-dark mb-1">Belum Ada Sasaran Hadir</h5>
                      <p className="text-muted small mb-3">
                        Belum ada sasaran <strong>{currentCategory.label}</strong> yang ditandai hadir di Langkah 1. Silakan tandai kehadiran warga di <strong>Langkah 1 (Presensi)</strong> terlebih dahulu.
                      </p>
                      <button type="button" className="btn btn-outline-primary btn-sm px-4 rounded-3" onClick={() => setActiveStep(1)}>
                        &larr; Buka Langkah 1
                      </button>
                    </>
                  ) : availableWargaStep3.length === 0 ? (
                    <>
                      <CheckCircle2 size={44} className="text-success mb-2.5" />
                      <h5 className="fw-bold text-dark mb-1">Semua Sasaran Telah Dievaluasi</h5>
                      <p className="text-muted small mb-0">
                        Seluruh sasaran warga kategori <strong>{currentCategory.label}</strong> yang hadir telah selesai dievaluasi pada Langkah 3.
                      </p>
                    </>
                  ) : (
                    <>
                      <Info size={44} className="text-primary mb-2.5" />
                      <h5 className="fw-bold text-dark mb-1">Pilih Sasaran Warga</h5>
                      <p className="text-muted small mb-0">
                        Silakan pilih nama sasaran warga pada dropdown <strong>Pilih Nama Lengkap / NIK</strong> di atas untuk melihat hasil evaluasi plotting.
                      </p>
                    </>
                  )}
                </div>
              ) : !plottingResult ? (
                <div className="p-4 bg-white rounded-4 border border-warning-subtle text-center my-4 shadow-sm">
                  <AlertCircle size={40} className="text-warning mb-2" />
                  <h5 className="fw-bold text-dark mb-1">Data Pengukuran Belum Diisi</h5>
                  <p className="text-muted small mb-3">
                    Belum ada data penimbangan/pengukuran (BB &amp; TB). Silakan lengkapi pengukuran di <strong>Langkah 2</strong> terlebih dahulu.
                  </p>
                  <button type="button" className="btn btn-outline-primary btn-sm px-4 rounded-3" onClick={() => setActiveStep(2)}>
                    &larr; Buka Langkah 2
                  </button>
                </div>
              ) : ['dewasa', 'lansia'].includes(activeSubmenu) ? (
                /* Plotting Kategori Dewasa & Lansia Sesuai Wireframe */
                <div className="row g-3 mb-4">
                  {/* 1. Plotting IMT */}
                  {(() => {
                    const imtStyle = getPlottingColorStyle(plottingResult?.imtDewasaKey);
                    const imtItems = [
                      { label: 'Sangat Kurus < 17', code: 'SK', key: 'sangat-kurus' },
                      { label: 'Kurus 17 - 18.4 (Lansia 17-18.5)', code: 'K', key: 'kurus' },
                      { label: 'Normal 18.5 - 25.0', code: 'N', key: 'normal' },
                      { label: 'Gemuk 25.1 - 27.0', code: 'G', key: 'gemuk' },
                      { label: 'Obesitas > 27.0', code: 'O', key: 'obesitas' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="card border-0 bg-white p-4 rounded-4 shadow-xs">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">Plotting IMT</h6>
                              <span className="badge bg-light text-muted small fw-normal">Indeks Massa Tubuh</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: imtStyle.activeRowBg,
                                border: `2px solid ${imtStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: imtStyle.badgeColor }}>
                                  {plottingResult?.imtDewasaStatus}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil IMT:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {plottingResult?.imt} <span className="small text-muted fw-normal">kg/m²</span>
                                </span>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  ({plottingResult?.bb} kg / {plottingResult?.tb} cm)
                                </div>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar IMT:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {imtItems.map((item, idx) => {
                                const isCurrent = plottingResult?.imtDewasaKey === item.key;
                                const itemStyle = getPlottingColorStyle(item.key);
                                return (
                                  <div 
                                    key={idx}
                                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                      border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                      fontSize: '0.85rem'
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2.5">
                                      {isCurrent ? (
                                        <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                      ) : (
                                        <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                      )}
                                      <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                        {item.label}
                                      </span>
                                    </div>
                                    <span 
                                      className="badge fw-bold px-2.5 py-1 rounded-pill"
                                      style={{ 
                                        backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0', 
                                        color: isCurrent ? itemStyle.badgeColor : '#475569',
                                        border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                        fontSize: '0.78rem'
                                      }}
                                    >
                                      {item.code}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. Plotting Lingkar Perut */}
                  {(() => {
                    const lpStyle = getPlottingColorStyle(plottingResult?.lpPlottingKey);
                    const isGenderMale = (activeSourceDataL3.gender || 'Laki-laki') === 'Laki-laki';
                    const isNormal = plottingResult?.lpPlottingKey === 'normal';
                    return (
                      <div className="col-12">
                        <div className="card border-0 bg-white p-4 rounded-4 shadow-xs">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">Plotting Lingkar Perut</h6>
                              <span className="badge bg-light text-muted small fw-normal">Batas Gender</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: lpStyle.activeRowBg,
                                border: `2px solid ${lpStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: lpStyle.badgeColor }}>
                                  {plottingResult?.lpPlottingStatus}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil Ukur:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {activeSourceDataL3.lp || 0} <span className="small text-muted fw-normal">cm</span>
                                </span>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar Lingkar Perut:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {/* Opsi Normal */}
                              <div 
                                className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                style={{
                                  backgroundColor: isNormal ? '#f0fdf4' : '#f8fafc',
                                  border: isNormal ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <div className="d-flex align-items-center gap-2.5">
                                  {isNormal ? (
                                    <span className="fw-bold fs-6 text-success">✓</span>
                                  ) : (
                                    <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                  )}
                                  <span className={isNormal ? 'fw-bold text-success' : 'text-secondary'} style={{ lineHeight: '1.4' }}>
                                    {isGenderMale ? 'Laki-laki: ≤ 90 cm' : 'Perempuan: ≤ 80 cm'} (Normal)
                                  </span>
                                </div>
                                <span className={`badge fw-bold px-2.5 py-1 rounded-pill ${isNormal ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted'}`}>
                                  N
                                </span>
                              </div>

                              {/* Opsi Berisiko */}
                              <div 
                                className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                style={{
                                  backgroundColor: !isNormal ? '#fff1f2' : '#f8fafc',
                                  border: !isNormal ? '1.5px solid #f87171' : '1px solid #e2e8f0',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <div className="d-flex align-items-center gap-2.5">
                                  {!isNormal ? (
                                    <span className="fw-bold fs-6 text-danger">✓</span>
                                  ) : (
                                    <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                  )}
                                  <span className={!isNormal ? 'fw-bold text-danger' : 'text-secondary'} style={{ lineHeight: '1.4' }}>
                                    {isGenderMale ? 'Laki-laki: > 90 cm' : 'Perempuan: > 80 cm'} (Berisiko / Obesitas Sentral)
                                  </span>
                                </div>
                                <span className={`badge fw-bold px-2.5 py-1 rounded-pill ${!isNormal ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-light text-muted'}`}>
                                  Risiko
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. Plotting LiLA */}
                  {(() => {
                    const lilaKey = activeSubmenu === 'lansia' ? plottingResult?.lilaLansiaKey : plottingResult?.lilaDewasaKey;
                    const lilaStatusText = activeSubmenu === 'lansia' ? plottingResult?.lilaLansiaStatus : plottingResult?.lilaDewasaStatus;
                    const lilaStyle = getPlottingColorStyle(lilaKey);
                    const isNormal = lilaKey === 'normal';
                    const threshold = activeSubmenu === 'lansia' ? 21.5 : 23.5;
                    return (
                      <div className="col-12">
                        <div className="card border-0 bg-white p-4 rounded-4 shadow-xs">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">Plotting LiLA</h6>
                              <span className="badge bg-light text-muted small fw-normal">Pita Pengukur LiLA</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: lilaStyle.activeRowBg,
                                border: `2px solid ${lilaStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: lilaStyle.badgeColor }}>
                                  {lilaStatusText}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil LiLA:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {plottingResult?.lila} <span className="small text-muted fw-normal">cm</span>
                                </span>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar LiLA:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {/* Kurang */}
                              <div 
                                className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                style={{
                                  backgroundColor: !isNormal ? '#fef2f2' : '#f8fafc',
                                  border: !isNormal ? '1.5px solid #f87171' : '1px solid #e2e8f0',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <div className="d-flex align-items-center gap-2.5">
                                  {!isNormal ? (
                                    <span className="fw-bold fs-6 text-danger">✓</span>
                                  ) : (
                                    <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                  )}
                                  <span className={!isNormal ? 'fw-bold text-danger' : 'text-secondary'} style={{ lineHeight: '1.4' }}>
                                    Kurang &lt; {threshold} cm (Risiko KEK / Gizi Kurang)
                                  </span>
                                </div>
                                <span className={`badge fw-bold px-2.5 py-1 rounded-pill ${!isNormal ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-light text-muted'}`}>
                                  Kurang
                                </span>
                              </div>

                              {/* Normal */}
                              <div 
                                className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                style={{
                                  backgroundColor: isNormal ? '#f0fdf4' : '#f8fafc',
                                  border: isNormal ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <div className="d-flex align-items-center gap-2.5">
                                  {isNormal ? (
                                    <span className="fw-bold fs-6 text-success">✓</span>
                                  ) : (
                                    <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                  )}
                                  <span className={isNormal ? 'fw-bold text-success' : 'text-secondary'} style={{ lineHeight: '1.4' }}>
                                    Normal ≥ {threshold} cm (Gizi Cukup)
                                  </span>
                                </div>
                                <span className={`badge fw-bold px-2.5 py-1 rounded-pill ${isNormal ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted'}`}>
                                  Normal
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. Plotting Tekanan Darah */}
                  {(() => {
                    const tensiStyle = getPlottingColorStyle(plottingResult?.tensiKey);
                    const tensiItems = [
                      { label: 'Normal (120-129 / 80-84 mmHg)', code: 'N', key: 'normal' },
                      { label: 'Pra hipertensi (130-139 / 85-89 mmHg)', code: 'Pra HT', key: 'pra-ht' },
                      { label: 'Hipertensi tingkat 1 (140-159 / 90-99 mmHg)', code: 'Ht 1', key: 'ht1' },
                      { label: 'Hipertensi tingkat 2 (160-179 / 100-109 mmHg)', code: 'Ht 2', key: 'ht2' },
                      { label: 'Hipertensi Sistolik Terisolasi (>140 / <90 mmHg)', code: 'HST', key: 'hst' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="card border-0 bg-white p-4 rounded-4 shadow-xs">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">Plotting Tekanan Darah</h6>
                              <span className="badge bg-light text-muted small fw-normal">Tensimeter Digital</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: tensiStyle.activeRowBg,
                                border: `2px solid ${tensiStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: tensiStyle.badgeColor }}>
                                  {plottingResult?.tensiStatus || 'Normal'}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil Tensi:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {plottingResult?.sistol || 120} / {plottingResult?.diastol || 80} <span className="small text-muted fw-normal">mmHg</span>
                                </span>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar Tekanan Darah:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {tensiItems.map((item, idx) => {
                                const isCurrent = plottingResult?.tensiKey === item.key;
                                const itemStyle = getPlottingColorStyle(item.key);
                                return (
                                  <div 
                                    key={idx}
                                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                      border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                      fontSize: '0.85rem'
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2.5">
                                      {isCurrent ? (
                                        <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                      ) : (
                                        <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                      )}
                                      <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                        {item.label}
                                      </span>
                                    </div>
                                    <span 
                                      className="badge fw-bold px-2.5 py-1 rounded-pill"
                                      style={{ 
                                        backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0', 
                                        color: isCurrent ? itemStyle.badgeColor : '#475569',
                                        border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                        fontSize: '0.78rem'
                                      }}
                                    >
                                      {item.code}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : activeSubmenu === 'usekrem-15-18' ? (
                /* Plotting Kategori Remaja 15-18 Tahun Sesuai Wireframe */
                <div className="row g-3 mb-4">
                  {/* Plotting IMT / U */}
                  {(() => {
                    const imtStyle = getPlottingColorStyle(plottingResult?.imtUsekremKey);
                    const imtItems = [
                      { label: 'Gizi Kurang -3 SD s.d < -2 SD', code: 'GK', key: 'kurus' },
                      { label: 'Gizi Baik -2 SD s.d +1 SD', code: 'GB', key: 'normal' },
                      { label: 'Gizi Lebih +1 SD s.d +2 SD', code: 'GL', key: 'gemuk' },
                      { label: 'Obesitas > +2 SD', code: 'O', key: 'obesitas' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="card border-0 bg-white p-4 rounded-4 shadow-xs">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">Plotting IMT / U</h6>
                              <span className="badge bg-light text-muted small fw-normal">Standar WHO Remaja</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: imtStyle.activeRowBg,
                                border: `2px solid ${imtStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: imtStyle.badgeColor }}>
                                  {plottingResult?.imtUsekremStatus}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil IMT/U:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {plottingResult?.imt} <span className="small text-muted fw-normal">kg/m²</span>
                                </span>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  ({plottingResult?.bb} kg / {plottingResult?.tb} cm)
                                </div>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar IMT:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {imtItems.map((item, idx) => {
                                const isCurrent = plottingResult?.imtUsekremKey === item.key;
                                const itemStyle = getPlottingColorStyle(item.key);
                                return (
                                  <div 
                                    key={idx}
                                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                      border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                      fontSize: '0.85rem'
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2.5">
                                      {isCurrent ? (
                                        <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                      ) : (
                                        <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                      )}
                                      <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                        {item.label}
                                      </span>
                                    </div>
                                    <span 
                                      className="badge fw-bold px-2.5 py-1 rounded-pill"
                                      style={{ 
                                        backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0', 
                                        color: isCurrent ? itemStyle.badgeColor : '#475569',
                                        border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                        fontSize: '0.78rem'
                                      }}
                                    >
                                      {item.code}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Plotting Tekanan Darah */}
                  {(() => {
                    const tensiStyle = getPlottingColorStyle(plottingResult?.tensiKey);
                    const tensiItems = [
                      { label: 'Normal (120-129 / 80-84 mmHg)', code: 'N', key: 'normal' },
                      { label: 'Pra hipertensi (130-139 / 85-89 mmHg)', code: 'Pra HT', key: 'pra-ht' },
                      { label: 'Hipertensi tingkat 1 (140-159 / 90-99 mmHg)', code: 'Ht 1', key: 'ht1' },
                      { label: 'Hipertensi tingkat 2 (160-179 / 100-109 mmHg)', code: 'Ht 2', key: 'ht2' },
                      { label: 'Hipertensi tingkat 3 (>180 / >110 mmHg)', code: 'Ht 3', key: 'ht3' },
                      { label: 'Hipertensi Sistolik Terisolasi (>140 / <90 mmHg)', code: 'HST', key: 'hst' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="card border-0 bg-white p-4 rounded-4 shadow-xs">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">Plotting Tekanan Darah</h6>
                              <span className="badge bg-light text-muted small fw-normal">Tensimeter Remaja</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: tensiStyle.activeRowBg,
                                border: `2px solid ${tensiStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: tensiStyle.badgeColor }}>
                                  {plottingResult?.tensiRemajaStatus}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil Tensi:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {plottingResult?.sistol} / {plottingResult?.diastol} <span className="small text-muted fw-normal">mmHg</span>
                                </span>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar Tekanan Darah:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {tensiItems.map((item, idx) => {
                                const isCurrent = plottingResult?.tensiKey === item.key;
                                const itemStyle = getPlottingColorStyle(item.key);
                                return (
                                  <div 
                                    key={idx}
                                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                      border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                      fontSize: '0.85rem'
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2.5">
                                      {isCurrent ? (
                                        <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                      ) : (
                                        <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                      )}
                                      <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                        {item.label}
                                      </span>
                                    </div>
                                    <span 
                                      className="badge fw-bold px-2.5 py-1 rounded-pill"
                                      style={{ 
                                        backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0', 
                                        color: isCurrent ? itemStyle.badgeColor : '#475569',
                                        border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                        fontSize: '0.78rem'
                                      }}
                                    >
                                      {item.code}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : activeSubmenu === 'usekrem-6-14' ? (
                /* Plotting Kategori Usia Sekolah 6-14 Tahun Sesuai Wireframe */
                <div className="row g-3 mb-4">
                  {(() => {
                    const imtStyle = getPlottingColorStyle(plottingResult?.imtUsekremKey);
                    const imtItems = [
                      { label: 'Gizi Kurang (-3 SD s.d < -2 SD)', code: 'GK', key: 'kurus' },
                      { label: 'Gizi Baik (-2 SD s.d +1 SD)', code: 'GB', key: 'normal' },
                      { label: 'Gizi Lebih (+1 SD s.d +2 SD)', code: 'GL', key: 'gemuk' },
                      { label: 'Obesitas (> +2 SD)', code: 'O', key: 'obesitas' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-bold text-dark mb-0">Plotting IMT / U</h6>
                            <span className="badge bg-light text-muted small fw-normal">Usia 6 - 14 Tahun</span>
                          </div>

                          {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                          <div 
                            className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                            style={{
                              backgroundColor: imtStyle.activeRowBg,
                              border: `2px solid ${imtStyle.activeRowBorder}`,
                            }}
                          >
                            <div>
                              <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                              <span className="fs-5 fw-bold" style={{ color: imtStyle.badgeColor }}>
                                {plottingResult?.imtUsekremStatus}
                              </span>
                            </div>
                            <div className="text-end">
                              <span className="text-muted small fw-medium d-block">Hasil IMT/U:</span>
                              <span className="fs-6 fw-bold text-dark">
                                {plottingResult?.imt} <span className="small text-muted fw-normal">kg/m²</span>
                              </span>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                ({plottingResult?.bb} kg / {plottingResult?.tb} cm)
                              </div>
                            </div>
                          </div>

                          {/* KATEGORI ACUAN STANDAR */}
                          <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                            Kategori Acuan Standar IMT:
                          </div>
                          <div className="d-flex flex-column gap-2 small">
                            {imtItems.map((item, idx) => {
                              const isCurrent = plottingResult?.imtUsekremKey === item.key;
                              const itemStyle = getPlottingColorStyle(item.key);
                              return (
                                <div 
                                  key={idx}
                                  className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                  style={{
                                    backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                    border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-2.5">
                                    {isCurrent ? (
                                      <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                    ) : (
                                      <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                    )}
                                    <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                      {item.label}
                                    </span>
                                  </div>
                                  <span 
                                    className="badge fw-bold px-2.5 py-1 rounded-pill"
                                    style={{ 
                                      backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0', 
                                      color: isCurrent ? itemStyle.badgeColor : '#475569',
                                      border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                      fontSize: '0.78rem'
                                    }}
                                  >
                                    {item.code}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : activeSubmenu === 'apras' ? (
                /* Plotting Kategori Apras (60-72 Bulan) Sesuai Wireframe */
                <div className="row g-3 mb-4">
                  {/* 3.1 Plotting Penimbangan Pengukuran IMT/U */}
                  {(() => {
                    const imtStyle = getPlottingColorStyle(plottingResult?.imtAprasKey);
                    const imtItems = [
                      { label: 'Gizi Kurang (-3 SD s.d -2 SD)', code: 'GiKur', key: 'kurus' },
                      { label: 'Gizi Baik (-2 SD s.d +1 SD)', code: 'Baik', key: 'normal' },
                      { label: 'Gizi Lebih (+1 SD s.d +2 SD)', code: 'GL', key: 'gemuk' },
                      { label: 'Obesitas (> +2 SD)', code: 'Obes', key: 'obesitas' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="bg-white p-4 rounded-3 border-0 shadow-sm h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">3.1 Plotting IMT / U</h6>
                              <span className="badge bg-light text-muted small fw-normal">Anak Prasekolah</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: imtStyle.activeRowBg,
                                border: `2px solid ${imtStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: imtStyle.badgeColor }}>
                                  {plottingResult?.imtAprasStatus}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil IMT/U:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {plottingResult?.imt} <span className="small text-muted fw-normal">kg/m²</span>
                                </span>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  ({plottingResult?.bb} kg / {plottingResult?.tb} cm)
                                </div>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar IMT:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {imtItems.map((item, idx) => {
                                const isCurrent = plottingResult?.imtAprasKey === item.key;
                                const itemStyle = getPlottingColorStyle(item.key);
                                return (
                                  <div 
                                    key={idx}
                                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                      border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                      fontSize: '0.85rem'
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2.5">
                                      {isCurrent ? (
                                        <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                      ) : (
                                        <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                      )}
                                      <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                        {item.label}
                                      </span>
                                    </div>
                                    <span 
                                      className="badge fw-bold px-2.5 py-1 rounded-pill"
                                      style={{ 
                                        backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0', 
                                        color: isCurrent ? itemStyle.badgeColor : '#475569',
                                        border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                        fontSize: '0.78rem'
                                      }}
                                    >
                                      {item.code}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3.2 Plotting LiLA */}
                  {(() => {
                    const lilaStyle = getPlottingColorStyle(plottingResult?.lilaAprasKey);
                    const lilaItems = [
                      { label: 'Gizi Buruk (< 12.8 cm, < -3 SD)', code: 'GiBur', key: 'sangat-kurus' },
                      { label: 'Gizi Kurang (12.8 cm - 14 cm, < -2 SD s.d -3 SD)', code: 'GiKur', key: 'kurus' },
                      { label: 'Gizi Normal (≥ 14 cm, ≥ -2 SD s.d +2 SD)', code: 'N', key: 'normal' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="bg-white p-4 rounded-3 border-0 shadow-sm h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-dark mb-0">3.2 Plotting LiLA</h6>
                              <span className="badge bg-light text-muted small fw-normal">Pita LiLA Apras</span>
                            </div>

                            {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                            <div 
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                              style={{
                                backgroundColor: lilaStyle.activeRowBg,
                                border: `2px solid ${lilaStyle.activeRowBorder}`,
                              }}
                            >
                              <div>
                                <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                                <span className="fs-5 fw-bold" style={{ color: lilaStyle.badgeColor }}>
                                  {plottingResult?.lilaAprasStatus}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small fw-medium d-block">Hasil LiLA:</span>
                                <span className="fs-6 fw-bold text-dark">
                                  {plottingResult?.lila} <span className="small text-muted fw-normal">cm</span>
                                </span>
                              </div>
                            </div>

                            {/* KATEGORI ACUAN STANDAR */}
                            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                              Kategori Acuan Standar LiLA:
                            </div>
                            <div className="d-flex flex-column gap-2 small">
                              {lilaItems.map((item, idx) => {
                                const isCurrent = plottingResult?.lilaAprasKey === item.key;
                                const itemStyle = getPlottingColorStyle(item.key);
                                return (
                                  <div 
                                    key={idx}
                                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                      border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                      fontSize: '0.85rem'
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2.5">
                                      {isCurrent ? (
                                        <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                      ) : (
                                        <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                      )}
                                      <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                        {item.label}
                                      </span>
                                    </div>
                                    <span 
                                      className="badge fw-bold px-2.5 py-1 rounded-pill"
                                      style={{ 
                                        backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0', 
                                        color: isCurrent ? itemStyle.badgeColor : '#475569',
                                        border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                        fontSize: '0.78rem'
                                      }}
                                    >
                                      {item.code}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : ['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? (
                /* Plotting 5 Kategori Sesuai Tabel Wireframe Bayi & Balita */
                <div className="row g-3 mb-4">
                  {/* 3.1 Plotting Penimbangan (BB/U) */}
                  <div className="col-12">
                    <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="fw-bold text-dark mb-0">3.1 Plotting Penimbangan (BB/U)</h6>
                        <span 
                          className="badge px-3 py-1.5 rounded-pill fw-bold"
                          style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                        >
                          N (BB Normal)
                        </span>
                      </div>
                      <p className="text-muted small mb-0">• BB Naik Normal (N, -2SD s.d +1SD) | <span className="fw-semibold text-success">BB: {plottingResult?.bb} kg</span></p>
                    </div>
                  </div>

                  {/* 3.2 Plotting Pengukuran TB (PB/U atau TB/U) */}
                  <div className="col-12">
                    <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="fw-bold text-dark mb-0">3.2 Plotting Pengukuran TB (PB/U atau TB/U)</h6>
                        <span 
                          className="badge px-3 py-1.5 rounded-pill fw-bold"
                          style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                        >
                          N (Normal)
                        </span>
                      </div>
                      <p className="text-muted small mb-0">• Normal (-2SD s.d +3SD) | <span className="fw-semibold text-success">PB/TB: {plottingResult?.tb} cm</span></p>
                    </div>
                  </div>

                  {/* 3.3 Plotting Penimbangan Pengukuran BB/PB atau BB/TB */}
                  <div className="col-12">
                    <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="fw-bold text-dark mb-0">3.3 Plotting BB/PB atau BB/TB</h6>
                        <span 
                          className="badge px-3 py-1.5 rounded-pill fw-bold"
                          style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                        >
                          Baik (Gizi Baik)
                        </span>
                      </div>
                      <p className="text-muted small mb-0">• Gizi Baik (-2SD s.d +1SD)</p>
                    </div>
                  </div>

                  {/* 3.4 Plotting Lingkar Kepala */}
                  <div className="col-12">
                    <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="fw-bold text-dark mb-0">3.4 Plotting Lingkar Kepala</h6>
                        <span 
                          className="badge px-3 py-1.5 rounded-pill fw-bold"
                          style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                        >
                          N (Normal)
                        </span>
                      </div>
                      <p className="text-muted small mb-0">• Normal (-2SD s.d +2SD) | <span className="fw-semibold text-success">LK: {plottingResult?.lk} cm</span></p>
                    </div>
                  </div>

                  {/* 3.5 Plotting LiLA */}
                  {(() => {
                    const lilaStyle = getPlottingColorStyle(plottingResult?.lilaBayiKey);
                    return (
                      <div className="col-12">
                        <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h6 className="fw-bold text-dark mb-0">3.5 Plotting LiLA</h6>
                            <span 
                              className="badge px-3 py-1.5 rounded-pill fw-bold"
                              style={{ 
                                backgroundColor: lilaStyle.badgeBg, 
                                color: lilaStyle.badgeColor, 
                                border: `1px solid ${lilaStyle.badgeBorder}` 
                              }}
                            >
                              {plottingResult?.lilaBayiStatus}
                            </span>
                          </div>
                          <p className="text-muted small mb-0">
                            {activeSubmenu === 'bayi-0-11' 
                              ? `• Standar Normal (≥ 12.5 cm) | `
                              : `• Standar Normal (> 12.5 cm) | `
                            }
                            <span className="fw-semibold" style={{ color: lilaStyle.labelColor }}>
                              LiLA: {plottingResult?.lila} cm
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Standard Adult / Bumil / Nifas Plotting */
                <div className="row g-3 mb-4">
                  {/* Plotting IMT */}
                  {(() => {
                    const imtStyle = getPlottingColorStyle(plottingResult?.imtKey);
                    const imtItems = [
                      { label: 'Sangat Kurus (< 17.0 kg/m²)', code: 'SK', key: 'sangat-kurus' },
                      { label: 'Kurus (17.0 - 18.4 kg/m²)', code: 'K', key: 'kurus' },
                      { label: 'Normal (18.5 - 25.0 kg/m²)', code: 'N', key: 'normal' },
                      { label: 'Gemuk (25.1 - 27.0 kg/m²)', code: 'G', key: 'gemuk' },
                      { label: 'Obesitas (> 27.0 kg/m²)', code: 'O', key: 'obesitas' },
                    ];
                    return (
                      <div className="col-12">
                        <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-bold text-dark mb-0">Plotting IMT (Indeks Massa Tubuh)</h6>
                            <span className="badge bg-light text-muted small fw-normal">Kurva Buku KIA</span>
                          </div>

                          {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                          <div
                            className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                            style={{ backgroundColor: imtStyle.activeRowBg, border: `2px solid ${imtStyle.activeRowBorder}` }}
                          >
                            <div>
                              <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                              <span className="fs-5 fw-bold" style={{ color: imtStyle.badgeColor }}>{plottingResult?.imtStatus}</span>
                            </div>
                            <div className="text-end">
                              <span className="text-muted small fw-medium d-block">Hasil IMT:</span>
                              <span className="fs-5 fw-bold text-dark">{plottingResult?.imt} <span className="small text-muted fw-normal">kg/m²</span></span>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                ({plottingResult?.bb} kg / {plottingResult?.tb} cm)
                              </div>
                            </div>
                          </div>

                          {/* KATEGORI ACUAN STANDAR */}
                          <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                            Kategori Acuan Standar IMT:
                          </div>
                          <div className="d-flex flex-column gap-2 small">
                            {imtItems.map((item, idx) => {
                              const isCurrent = plottingResult?.imtKey === item.key;
                              const itemStyle = getPlottingColorStyle(item.key);
                              return (
                                <div
                                  key={idx}
                                  className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                  style={{
                                    backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                    border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-2.5">
                                    {isCurrent ? (
                                      <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                    ) : (
                                      <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                    )}
                                    <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                      {item.label}
                                    </span>
                                  </div>
                                  <span
                                    className="badge fw-bold px-2.5 py-1 rounded-pill"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0',
                                      color: isCurrent ? itemStyle.badgeColor : '#475569',
                                      border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                      fontSize: '0.78rem'
                                    }}
                                  >
                                    {item.code}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Plotting LiLA (Hanya untuk Bumil / Kategori Lain, Nifas tidak menggunakan LiLA) */}
                  {activeSubmenu !== 'nifas' && (() => {
                    const isKek = plottingResult?.isLilaKek || (parseFloat(plottingResult?.lila) > 0 && parseFloat(plottingResult?.lila) < 23.5);
                    const lilaStyle = getPlottingColorStyle(isKek ? 'kek' : 'normal');
                    const lilaStatusText = isKek ? 'Risiko KEK (< 23.5 cm)' : 'Normal (≥ 23.5 cm)';
                    return (
                      <div className="col-12">
                        <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-bold text-dark mb-0">Plotting LiLA (Lingkar Lengan Atas)</h6>
                            <span className="badge bg-light text-muted small fw-normal">Pita LiLA Bumil</span>
                          </div>

                          {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                          <div
                            className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                            style={{ backgroundColor: lilaStyle.activeRowBg, border: `2px solid ${lilaStyle.activeRowBorder}` }}
                          >
                            <div>
                              <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                              <span className="fs-5 fw-bold" style={{ color: lilaStyle.badgeColor }}>
                                {plottingResult?.lila ? lilaStatusText : 'Normal (≥ 23.5 cm)'}
                              </span>
                            </div>
                            <div className="text-end">
                              <span className="text-muted small fw-medium d-block">Hasil LiLA:</span>
                              <span className="fs-5 fw-bold text-dark">{plottingResult?.lila || '—'} <span className="small text-muted fw-normal">cm</span></span>
                            </div>
                          </div>

                          {/* KATEGORI ACUAN STANDAR */}
                          <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                            Kategori Acuan Standar LiLA Ibu Hamil:
                          </div>
                          <div className="d-flex flex-column gap-2 small">
                            <div
                              className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                              style={{
                                backgroundColor: isKek ? '#fef2f2' : '#f8fafc',
                                border: isKek ? '1.5px solid #f87171' : '1px solid #e2e8f0',
                                fontSize: '0.85rem'
                              }}
                            >
                              <div className="d-flex align-items-center gap-2.5">
                                {isKek ? (
                                  <span className="fw-bold fs-6 text-danger">✓</span>
                                ) : (
                                  <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                )}
                                <span className={isKek ? 'fw-bold text-danger' : 'text-secondary'} style={{ lineHeight: '1.4' }}>
                                  Kurang Energi Kronis / KEK (&lt; 23.5 cm)
                                </span>
                              </div>
                              <span className={`badge fw-bold px-2.5 py-1 rounded-pill ${isKek ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-light text-muted'}`}>
                                Merah / KEK
                              </span>
                            </div>
                            <div
                              className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                              style={{
                                backgroundColor: !isKek ? '#f0fdf4' : '#f8fafc',
                                border: !isKek ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                                fontSize: '0.85rem'
                              }}
                            >
                              <div className="d-flex align-items-center gap-2.5">
                                {!isKek ? (
                                  <span className="fw-bold fs-6 text-success">✓</span>
                                ) : (
                                  <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                )}
                                <span className={!isKek ? 'fw-bold text-success' : 'text-secondary'} style={{ lineHeight: '1.4' }}>
                                  Normal (≥ 23.5 cm)
                                </span>
                              </div>
                              <span className={`badge fw-bold px-2.5 py-1 rounded-pill ${!isKek ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted'}`}>
                                Hijau / Normal
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Plotting Tekanan Darah */}
                  {(() => {
                    const tensiStyle = getPlottingColorStyle(plottingResult?.tensiAdultKey);
                    const tdItems = [
                      { label: 'Normal (< 130 / 85 mmHg)', code: 'N', key: 'normal' },
                      { label: 'Pra Hipertensi (130-139 / 85-89 mmHg)', code: 'Pra HT', key: 'pra-ht' },
                      { label: 'Hipertensi tingkat 1 (140-159 / 90-99 mmHg)', code: 'Ht 1', key: 'ht1' },
                      { label: 'Hipertensi tingkat 2 (≥ 160 / ≥ 100 mmHg)', code: 'Ht 2', key: 'ht2' }
                    ];
                    return (
                      <div className="col-12">
                        <div className="bg-white p-4 rounded-3 border-0 shadow-sm">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-bold text-dark mb-0">Plotting Tekanan Darah</h6>
                            <span className="badge bg-light text-muted small fw-normal">Tensimeter Digital KIA</span>
                          </div>

                          {/* BANNER STATUS EVALUASI BESAR & JELAS */}
                          <div
                            className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                            style={{ backgroundColor: tensiStyle.activeRowBg, border: `2px solid ${tensiStyle.activeRowBorder}` }}
                          >
                            <div>
                              <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
                              <span className="fs-5 fw-bold" style={{ color: tensiStyle.badgeColor }}>{plottingResult?.tensiStatus}</span>
                            </div>
                            <div className="text-end">
                              <span className="text-muted small fw-medium d-block">Hasil Tensi:</span>
                              <span className="fs-5 fw-bold text-dark">{plottingResult?.sistol}/{plottingResult?.diastol} <span className="small text-muted fw-normal">mmHg</span></span>
                            </div>
                          </div>

                          {/* KATEGORI ACUAN STANDAR */}
                          <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
                            Kategori Acuan Standar Tekanan Darah:
                          </div>
                          <div className="d-flex flex-column gap-2 small">
                            {tdItems.map((item, idx) => {
                              const isCurrent = plottingResult?.tensiAdultKey === item.key;
                              const itemStyle = getPlottingColorStyle(item.key);
                              return (
                                <div
                                  key={idx}
                                  className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                                  style={{
                                    backgroundColor: isCurrent ? itemStyle.activeRowBg : '#f8fafc',
                                    border: isCurrent ? `1.5px solid ${itemStyle.activeRowBorder}` : '1px solid #e2e8f0',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-2.5">
                                    {isCurrent ? (
                                      <span className="fw-bold fs-6" style={{ color: itemStyle.indicatorBg }}>✓</span>
                                    ) : (
                                      <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                                    )}
                                    <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? itemStyle.activeText : undefined, lineHeight: '1.4' }}>
                                      {item.label}
                                    </span>
                                  </div>
                                  <span
                                    className="badge fw-bold px-2.5 py-1 rounded-pill"
                                    style={{
                                      backgroundColor: isCurrent ? itemStyle.badgeBg : '#e2e8f0',
                                      color: isCurrent ? itemStyle.badgeColor : '#475569',
                                      border: isCurrent ? `1px solid ${itemStyle.badgeBorder}` : '1px solid transparent',
                                      fontSize: '0.78rem'
                                    }}
                                  >
                                    {item.code}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Interactive WHO / Permenkes Growth Curve Plotter for Children (Diletakkan di bawah hasil plotting) */}
              {['bayi-0-11', 'balita-12-59', 'apras', 'usekrem-6-14', 'usekrem-15-18'].includes(activeSubmenu) && plottingResult && activeSourceDataL3 && (
                <div className="mt-4 mb-3">
                  <GrowthChartPlotter
                    gender={activeSourceDataL3.gender}
                    ageInMonths={childAgeMonths}
                    weight={activeSourceDataL3.bb}
                    height={activeSourceDataL3.tb}
                    category={activeSubmenu}
                    childName={activeSourceDataL3.nama || 'Anak'}
                  />
                </div>
              )}

              <div className="d-flex justify-content-end pt-3 gap-2">
                {examinationMode === 'per-step' ? (
                  <button 
                    type="submit" 
                    className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                    style={{ backgroundColor: '#2b2e4a' }}
                    disabled={!selectedWargaStep3 || !plottingResult}
                  >
                    <span>Simpan</span>
                  </button>
                ) : (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={() => setActiveStep(2)}>
                      <ArrowLeft size={15} />
                      <span>Kembali</span>
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                      style={{ backgroundColor: '#2b2e4a' }}
                    >
                      <span>Lanjut ke Langkah 4</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* LANGKAH 4: SKRINING GEJALA TBC & PELAYANAN KESEHATAN */}
          {/* ========================================================================= */}
          {activeStep === 4 && (
            <form onSubmit={examinationMode === 'per-step' ? handleSaveLangkah4 : handleNextSequentialStep}>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Pelayanan Kesehatan &amp; Skrining TBC</h3>
                </div>

                {examinationMode === 'per-step' && (
                  <div className="bg-white px-3 py-2 rounded-3 border-0 shadow-sm d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                    <select
                      className="form-select form-select-sm border-0 fw-semibold text-dark"
                      style={{ minWidth: '220px' }}
                      value={selectedWargaStep4}
                      onChange={(e) => {
                        const wId = e.target.value;
                        setSelectedWargaStep4(wId);
                        const saved = stepDataByWarga[wId]?.langkah4;
                        if (saved) {
                          setLangkah4Form({ ...saved });
                        }
                      }}
                    >
                      {availableWargaStep4.length === 0 ? (
                        <option value="">{hadirWargaList.length === 0 ? '-- Belum ada sasaran hadir di Langkah 1 --' : '-- Semua sasaran telah diskrining di Langkah 4 --'}</option>
                      ) : (
                        availableWargaStep4.map(w => (
                          <option key={w.id} value={String(w.id)}>{w.nama} - NIK {String(w.nik).slice(-4)}</option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              {examinationMode === 'per-step' && hadirWargaList.length === 0 && (
                <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span className="small">
                    Belum ada sasaran <strong>{currentCategory.label}</strong> yang ditandai <strong>Datang</strong> pada Langkah 1. Silakan cari dan tandai kehadiran di <strong>Langkah 1 (Presensi)</strong> terlebih dahulu.
                  </span>
                </div>
              )}

              {/* Tampilkan Riwayat Pemeriksaan Terakhir Sebelumnya */}
              {renderRiwayatPemeriksaanTerakhir(examinationMode === 'per-step' ? selectedWargaStep4 : selectedWargaId)}

              {['dewasa', 'lansia'].includes(activeSubmenu) ? (
                <>
                  {/* Kadar Gula Darah, Kolesterol & Kontrasepsi */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining PTM: Gula Darah &amp; Kolesterol</h5>

                    <div className="row g-3">
                      {/* 1. Kadar Gula Darah (mg/dl) */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Kadar gula darah (mg/dl)</label>
                        <div className="input-group">
                          <input 
                            type="number" 
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 110"
                            value={examinationMode === 'per-step' ? (langkah2Form.gulaDarah || '') : (sequentialForm.gulaDarah || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah2Form({ ...langkah2Form, gulaDarah: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, gulaDarah: e.target.value });
                              }
                            }}
                          />
                          <span className="input-group-text bg-light border-0 text-muted">mg/dl</span>
                        </div>
                      </div>

                      {/* 2. Ploting gula darah */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Ploting gula darah</label>
                        <div className="bg-light p-2 px-3 rounded-3 border-0 d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>
                          <span className="fw-semibold text-dark small">
                            {(() => {
                              const gdVal = examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah;
                              if (!gdVal || gdVal === '') return <span className="text-muted fw-normal">Belum Diisi</span>;
                              const gdNum = parseInt(gdVal);
                              if (isNaN(gdNum)) return <span className="text-muted fw-normal">Belum Diisi</span>;
                              if (gdNum >= 200) return <span className="text-danger fw-bold">Diabetisi (D) &bull; ≥ 200 mg/dl</span>;
                              if (gdNum >= 140) return <span className="text-warning-emphasis fw-bold">Prediabetisi (Pd) &bull; 140–199 mg/dl</span>;
                              return <span className="text-success fw-bold">Normal (N) &bull; 80–140 mg/dl</span>;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* 3. Kadar Kolesterol (mg/dl) */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Kadar Kolesterol (mg/dl)</label>
                        <div className="input-group">
                          <input 
                            type="number" 
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 180"
                            value={examinationMode === 'per-step' ? (langkah4Form.kolesterol || '') : (sequentialForm.kolesterol || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah4Form({ ...langkah4Form, kolesterol: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, kolesterol: e.target.value });
                              }
                            }}
                          />
                          <span className="input-group-text bg-light border-0 text-muted">mg/dl</span>
                        </div>
                      </div>

                      {/* 4. Ploting Kolesterol */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Ploting Kolesterol</label>
                        <div className="bg-light p-2 px-3 rounded-3 border-0 d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>
                          <span className="fw-semibold text-dark small">
                            {(() => {
                              const kolVal = examinationMode === 'per-step' ? langkah4Form.kolesterol : sequentialForm.kolesterol;
                              if (!kolVal || kolVal === '') return <span className="text-muted fw-normal">Belum Diisi</span>;
                              const kolNum = parseInt(kolVal);
                              if (isNaN(kolNum)) return <span className="text-muted fw-normal">Belum Diisi</span>;
                              if (kolNum >= 200) return <span className="text-danger fw-bold">Tinggi (T) &bull; ≥ 200 mg/dl</span>;
                              return <span className="text-success fw-bold">Normal (N) &bull; &lt; 200 mg/dl</span>;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* 5. Menggunakan alat kontrasepsi (Khusus Dewasa) */}
                      {activeSubmenu === 'dewasa' && (
                        <div className="col-12 col-md-6">
                          <YesNoCard
                            label="Menggunakan alat kontrasepsi"
                            name={`alatKontrasepsi_${examinationMode}`}
                            value={getLangkah4Value('alatKontrasepsi')}
                            onChange={(val) => updateLangkah4Value('alatKontrasepsi', val)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skrining Gejala TBC */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <YesNoCard
                          label="Batuk ≥ 2 minggu"
                          name={`batukTbc_dewasa_${examinationMode}`}
                          value={getLangkah4Value('batukTbc')}
                          onChange={(val) => updateLangkah4Value('batukTbc', val)}
                        />
                      </div>

                      <div className="col-12 mt-2">
                        <div className="p-2 px-3 rounded-2 bg-light fw-bold text-dark small border-start border-primary border-3">
                          Batuk &lt; 2 minggu dengan tambahan:
                        </div>
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="a. Nafsu makan menurun"
                          name={`nafsuMakanTbc_dewasa_${examinationMode}`}
                          value={getLangkah4Value('nafsuMakanTbc')}
                          onChange={(val) => updateLangkah4Value('nafsuMakanTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="b. Berat badan menurun"
                          name={`bbMenurunTbc_dewasa_${examinationMode}`}
                          value={getLangkah4Value('bbMenurunTbc')}
                          onChange={(val) => updateLangkah4Value('bbMenurunTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="c. Lemah, letih, lesu"
                          name={`lemahLesuTbc_dewasa_${examinationMode}`}
                          value={getLangkah4Value('lemahLesuTbc')}
                          onChange={(val) => updateLangkah4Value('lemahLesuTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="d. Berkeringat malam hari tanpa kegiatan fisik"
                          name={`berkeringatMalamTbc_dewasa_${examinationMode}`}
                          value={getLangkah4Value('berkeringatMalamTbc')}
                          onChange={(val) => updateLangkah4Value('berkeringatMalamTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="e. Batuk darah"
                          name={`batukDarahTbc_dewasa_${examinationMode}`}
                          value={getLangkah4Value('batukDarahTbc')}
                          onChange={(val) => updateLangkah4Value('batukDarahTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="f. Sesak nafas"
                          name={`sesakNafasTbc_dewasa_${examinationMode}`}
                          value={getLangkah4Value('sesakNafasTbc')}
                          onChange={(val) => updateLangkah4Value('sesakNafasTbc', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* B. Pemeriksaan 6 Bulan Sekali */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">B. Pemeriksaan 6 Bulan Sekali</h5>

                    <h6 className="fw-bold text-primary mb-2">Tes Penglihatan (Hitung Jari)</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kanan</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKanan || '') : (sequentialForm.mataKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, mataKanan: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, mataKanan: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kiri</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKiri || '') : (sequentialForm.mataKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, mataKiri: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, mataKiri: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>
                    </div>

                    <h6 className="fw-bold text-primary mb-2">Tes Pendengaran (Berbisik)</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Telinga Kanan</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKanan || '') : (sequentialForm.telingaKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, telingaKanan: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, telingaKanan: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Telinga Kiri</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKiri || '') : (sequentialForm.telingaKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, telingaKiri: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, telingaKiri: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* C. PEMERIKSAAN TAHUNAN */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">Berkala 1x / Tahun</span>
                          <h5 className="fw-bold text-dark mb-0">C. Pemeriksaan Tahunan</h5>
                        </div>
                        <p className="text-muted small mb-0">
                          Skrining komprehensif tahunan ({activeSubmenu === 'lansia' ? 'PUMA, Jiwa, AKS Barthel & SKILAS' : 'PUMA & Kesehatan Jiwa SRQ-20'}). Hanya perlu diisi 1 tahun sekali.
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-3 bg-light p-2.5 px-3 rounded-4 border">
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            role="switch"
                            id="toggleSkriningTahunan"
                            style={{ width: '2.4em', height: '1.2em', cursor: 'pointer' }}
                            checked={Boolean(getLangkah4Value('isSkriningTahunan'))}
                            onChange={(e) => updateLangkah4Value('isSkriningTahunan', e.target.checked)}
                          />
                          <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor="toggleSkriningTahunan">
                            {getLangkah4Value('isSkriningTahunan') ? 'Lakukan Skrining' : 'Tidak Dilakukan'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Banner Riwayat Terakhir Skrining Tahunan */}
                    <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mt-3 mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? 'text-success' : annualScreeningInfo.hasHistory ? 'text-warning' : 'text-secondary'}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>
                              {annualScreeningInfo.statusLabel}
                            </span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: '0.82rem' }}>
                            {annualScreeningInfo.detailText}
                          </div>
                        </div>
                      </div>

                      {annualScreeningInfo.tglFormatted !== '-' && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: '0.8rem' }}>
                          <span className="d-block text-secondary fw-semibold">Terakhir Diisi:</span>
                          <span className="badge bg-white text-dark border px-2 py-1 font-monospace">{annualScreeningInfo.tglFormatted}</span>
                        </div>
                      )}
                    </div>

                    {!getLangkah4Value('isSkriningTahunan') && (
                      <div className="alert alert-primary-subtle border-0 rounded-3 mt-2 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2.5">
                        <div className="d-flex align-items-center gap-2 small text-primary-emphasis">
                          <Info size={18} className="flex-shrink-0 text-primary" />
                          <span>Pemeriksaan tahunan tidak dilakukan pada kunjungan ini. Anda dapat langsung menyimpan data langkah 4 tanpa instrumen tahunan.</span>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                          onClick={() => updateLangkah4Value('isSkriningTahunan', true)}
                        >
                          Aktifkan Skrining
                        </button>
                      </div>
                    )}
                  </div>

                  {Boolean(getLangkah4Value('isSkriningTahunan')) && (
                    <>

                  {/* C1. Skrining PPOK PUMA (Khusus Usia ≥ 40 Tahun / Lansia) */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C1</span>
                        <h5 className="fw-bold text-dark mb-0">C.1 Skrining PPOK PUMA (Khusus Usia &gt; 40 Tahun / Lansia)</h5>
                      </div>
                      {(() => {
                        const jk = examinationMode === 'per-step' ? langkah4Form.pumaJk : sequentialForm.pumaJk;
                        const usia = examinationMode === 'per-step' ? langkah4Form.pumaUsia : sequentialForm.pumaUsia;
                        const rokok = examinationMode === 'per-step' ? langkah4Form.pumaMerokok : sequentialForm.pumaMerokok;
                        const np = examinationMode === 'per-step' ? langkah4Form.pumaNapasPendek : sequentialForm.pumaNapasPendek;
                        const dh = examinationMode === 'per-step' ? langkah4Form.pumaDahak : sequentialForm.pumaDahak;
                        const bt = examinationMode === 'per-step' ? langkah4Form.pumaBatukFlu : sequentialForm.pumaBatukFlu;

                        const isAny = [jk, usia, rokok, np, dh, bt].some(v => v !== '' && v !== undefined && v !== null);
                        if (!isAny) {
                          return (
                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fw-bold">
                              Skor PUMA: - (Belum Diisi)
                            </span>
                          );
                        }
                        const score = (jk !== '' && jk !== undefined ? Number(jk) : 0) +
                          (usia !== '' && usia !== undefined ? Number(usia) : 0) +
                          (rokok !== '' && rokok !== undefined ? Number(rokok) : 0) +
                          (np === 'Ya' || np === 1 ? 1 : 0) +
                          (dh === 'Ya' || dh === 1 ? 1 : 0) +
                          (bt === 'Ya' || bt === 1 ? 1 : 0);
                        const isRisiko = score >= 6;
                        return (
                          <span className={`badge ${isRisiko ? 'bg-danger text-white' : 'bg-success-subtle text-success'} px-3 py-2 rounded-pill fw-bold`}>
                            Skor PUMA: {score} ({isRisiko ? 'Risiko Tinggi PPOK' : 'Risiko Rendah PPOK'})
                          </span>
                        );
                      })()}
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">1. Jenis Kelamin</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.pumaJk ?? '') : (sequentialForm.pumaJk ?? '')}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : parseInt(e.target.value);
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, pumaJk: val });
                            } else {
                              setSequentialForm({ ...sequentialForm, pumaJk: val });
                            }
                          }}
                        >
                          <option value="">-- Pilih Jenis Kelamin --</option>
                          <option value={0}>Perempuan (Skor 0)</option>
                          <option value={1}>Laki-laki (Skor 1)</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">2. Usia</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.pumaUsia ?? '') : (sequentialForm.pumaUsia ?? '')}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : parseInt(e.target.value);
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, pumaUsia: val });
                            } else {
                              setSequentialForm({ ...sequentialForm, pumaUsia: val });
                            }
                          }}
                        >
                          <option value="">-- Pilih Kelompok Usia --</option>
                          <option value={0}>40-49 Tahun (Skor 0)</option>
                          <option value={1}>50-59 Tahun (Skor 1)</option>
                          <option value={2}>≥ 60 Tahun (Skor 2)</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">3. Kebiasaan Merokok</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.pumaMerokok ?? '') : (sequentialForm.pumaMerokok ?? '')}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : parseInt(e.target.value);
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, pumaMerokok: val });
                            } else {
                              setSequentialForm({ ...sequentialForm, pumaMerokok: val });
                            }
                          }}
                        >
                          <option value="">-- Pilih Riwayat Merokok --</option>
                          <option value={0}>Tidak Merokok / &lt; 20 bks/th (Skor 0)</option>
                          <option value={1}>20 - 30 bks/th (Skor 1)</option>
                          <option value={2}>&gt; 30 bks/th (Skor 2)</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="4. Napas pendek saat jalan cepat/menanjak?"
                          name={`pumaNapasPendek_${examinationMode}`}
                          value={getLangkah4Value('pumaNapasPendek')}
                          onChange={(val) => updateLangkah4Value('pumaNapasPendek', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="5. Mempunyai dahak saat tidak menderita flu?"
                          name={`pumaDahak_${examinationMode}`}
                          value={getLangkah4Value('pumaDahak')}
                          onChange={(val) => updateLangkah4Value('pumaDahak', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="6. Batuk walau tidak flu / tes spirometri?"
                          name={`pumaBatukFlu_${examinationMode}`}
                          value={getLangkah4Value('pumaBatukFlu')}
                          onChange={(val) => updateLangkah4Value('pumaBatukFlu', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* C2. SKRINING KESEHATAN JIWA (DEWASA) SESUAI FORMAT BUKU KIA / KEMENKES */}
                  {(activeSubmenu === 'dewasa' || activeSubmenu === 'lansia') && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C2</span>
                            <h5 className="fw-bold text-dark mb-0">C.2 Skrining Kesehatan Jiwa</h5>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-pill fw-bold small ${
                            !currentJiwa.isAnswered
                              ? 'bg-secondary-subtle text-secondary border border-secondary-subtle'
                              : currentJiwa.isRisiko
                                ? 'bg-danger-subtle text-danger border border-danger-subtle'
                                : 'bg-success-subtle text-success border border-success-subtle'
                          }`}>
                            Total Skor: {!currentJiwa.isAnswered ? '-' : currentJiwa.total} / 12 &bull; {currentJiwa.kategori}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Bulan Skrining */}
                      <div className="row align-items-center mb-3 g-2">
                        <div className="col-auto">
                          <label className="form-label fw-semibold text-dark small mb-0">
                            Skrining Kesehatan Jiwa dilakukan pada bulan :
                          </label>
                        </div>
                        <div className="col-auto">
                          <select
                            className="form-select form-select-sm bg-light border-0 py-1.5 px-3 fw-medium"
                            style={{ minWidth: '160px' }}
                            value={examinationMode === 'per-step' ? (langkah4Form.jiwaBulan || 'September') : (sequentialForm.jiwaBulan || 'September')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah4Form({ ...langkah4Form, jiwaBulan: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, jiwaBulan: e.target.value });
                              }
                            }}
                          >
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Tabel 4 Pertanyaan Skrining Kesehatan Jiwa */}
                      <div className="table-responsive border rounded-3 mb-3">
                        <table className="table table-bordered align-middle mb-0 text-center" style={{ borderColor: '#cbd5e1' }}>
                          <thead style={{ backgroundColor: '#dbeafe', color: '#1e3a8a' }}>
                            <tr style={{ fontSize: '0.82rem' }}>
                              <th style={{ width: '45px' }} className="py-2.5 px-2 fw-bold text-center">No</th>
                              <th style={{ minWidth: '240px' }} className="py-2.5 px-3 fw-bold text-start">Pertanyaan</th>
                              <th style={{ width: '110px' }} className="py-2.5 px-2 fw-bold">Tidak sama sekali (0)</th>
                              <th style={{ width: '130px' }} className="py-2.5 px-2 fw-bold">Kurang dari 1 (satu) minggu (1)</th>
                              <th style={{ width: '130px' }} className="py-2.5 px-2 fw-bold">Lebih dari 1 (satu) minggu (2)</th>
                              <th style={{ width: '120px' }} className="py-2.5 px-2 fw-bold">Hampir setiap hari (3)</th>
                              <th style={{ width: '90px', backgroundColor: '#e2e8f0', color: '#334155' }} className="py-2.5 px-2 fw-bold text-center">Total skor</th>
                            </tr>
                          </thead>
                          <tbody style={{ fontSize: '0.84rem' }}>
                            {[
                              {
                                no: 1,
                                field: 'jiwaQ1',
                                q: 'Dalam 2 minggu terakhir, seberapa sering anda kurang/tidak bersemangat dalam melakukan kegiatan sehari/hari?'
                              },
                              {
                                no: 2,
                                field: 'jiwaQ2',
                                q: 'Dalam 2 minggu terakhir, seberapa sering anda merasa murung, tertekan, atau putus asa?'
                              },
                              {
                                no: 3,
                                field: 'jiwaQ3',
                                q: 'Dalam 2 minggu terakhir, seberapa sering anda merasa gugup, cemas, atau gelisah?'
                              },
                              {
                                no: 4,
                                field: 'jiwaQ4',
                                q: 'Dalam 2 minggu terakhir, seberapa sering anda tidak mampu mengendalikan rasa khawatir?'
                              }
                            ].map((item) => {
                              const val = examinationMode === 'per-step' ? langkah4Form[item.field] : sequentialForm[item.field];
                              const numVal = val !== '' && val !== undefined && val !== null ? Number(val) : null;
                              return (
                                <tr key={item.no}>
                                  <td className="fw-bold text-dark text-center">{item.no}</td>
                                  <td className="text-start px-3 py-2.5 text-dark fw-medium">{item.q}</td>
                                  {[0, 1, 2, 3].map((optionScore) => (
                                    <td key={optionScore} className="text-center py-2">
                                      <input
                                        type="radio"
                                        className="form-check-input cursor-pointer"
                                        name={`${item.field}_${examinationMode}`}
                                        checked={numVal === optionScore}
                                        onChange={() => {
                                          if (examinationMode === 'per-step') {
                                            setLangkah4Form({ ...langkah4Form, [item.field]: optionScore });
                                          } else {
                                            setSequentialForm({ ...sequentialForm, [item.field]: optionScore });
                                          }
                                        }}
                                        style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer' }}
                                      />
                                    </td>
                                  ))}
                                  <td className="text-center fw-bold py-2" style={{ backgroundColor: '#f8fafc', color: numVal !== null ? '#1e3a8a' : '#94a3b8' }}>
                                    {numVal !== null ? numVal : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                              <td colSpan="6" className="text-end fw-bold py-2.5 px-3 text-dark">
                                Total Skor Skrining Kesehatan Jiwa :
                              </td>
                              <td className="text-center fw-bold py-2.5 px-2 fs-6" style={{ color: currentJiwa.isRisiko ? '#dc2626' : '#16a34a' }}>
                                {currentJiwa.isAnswered ? currentJiwa.total : '—'}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Panduan Interpretasi & Keterangan */}
                      <div className="p-3 rounded-3 bg-light border">
                        <div className="d-flex flex-column gap-1 text-muted small mb-2">
                          <div><strong>Interpretasi Skor:</strong> Skor &lt; 6 = Normal / Sehat Jiwa; Skor &ge; 6 = Risiko Masalah Kesehatan Jiwa (Perlu Konseling/Rujukan ke Puskesmas).</div>
                        </div>
                        {!currentJiwa.isAnswered ? (
                          <div className="alert alert-light text-muted d-flex align-items-center gap-2 mb-0 py-2 small border">
                            <Info size={16} className="flex-shrink-0 text-primary" />
                            <div>
                              Silakan isi 4 pertanyaan di atas untuk mengevaluasi skrining kesehatan jiwa sasaran.
                            </div>
                          </div>
                        ) : currentJiwa.isRisiko ? (
                          <div className="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 small">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <div>
                              <strong>Indikasi Masalah Kesehatan Jiwa:</strong> Total skor ({currentJiwa.total}) &ge; 6 menunjukkan adanya risiko kecemasan / depresi &rarr; Status rujukan otomatis disinkronkan ke <strong>"Rujuk ke Puskesmas / Pustu"</strong> untuk konseling lebih lanjut.
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-success d-flex align-items-center gap-2 mb-0 py-2 small">
                            <CheckCircle2 size={16} className="flex-shrink-0" />
                            <div>
                              <strong>Hasil Normal:</strong> Total skor ({currentJiwa.total}) &lt; 6, kondisi kesehatan mental dan emosional sasaran dalam batas baik dan stabil.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* KHUSUS LANSIA: C2 AKS & C3 SKILAS SESUAI FORMAT JUKNIS KEMENKES */}
                  {activeSubmenu === 'lansia' && (
                    <>
                      {/* C2. PEMERIKSAAN TAHUNAN SKRINING AKTIFITAS KEHIDUPAN SEHARI-HARI (AKS) */}
                      <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C2</span>
                              <h5 className="fw-bold text-dark mb-0">C2. Pemeriksaan Tahunan Skrining Aktifitas Kehidupan Sehari-hari (AKS)</h5>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-pill fw-bold small ${
                              !currentAks.isAnswered
                                ? 'bg-secondary-subtle text-secondary border border-secondary-subtle'
                                : currentAks.total === 20 
                                  ? 'bg-success-subtle text-success border border-success-subtle' 
                                  : currentAks.total >= 12 
                                    ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' 
                                    : 'bg-danger-subtle text-danger border border-danger-subtle'
                            }`}>
                              Total Skor: {!currentAks.isAnswered ? '-' : currentAks.total} / 20 &bull; {currentAks.kategori}
                            </span>
                          </div>
                        </div>

                        <div className="table-responsive mb-3">
                          <table className="table table-bordered align-middle mb-0" style={{ borderColor: '#e2e8f0' }}>
                            <thead style={{ backgroundColor: '#fed7aa', color: '#7c2d12' }}>
                              <tr>
                                <th style={{ width: '50%' }} className="py-2.5 px-3 fw-bold text-dark">Pertanyaan</th>
                                <th style={{ width: '50%' }} className="py-2.5 px-3 fw-bold text-dark">Waktu ke Posyandu (Skor &amp; Kondisi)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* 1. BAB */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  1. Mengendalikan rangsang Buang Air Besar (BAB)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksBab ?? '') : (sequentialForm.aksBab ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksBab: val });
                                      else setSequentialForm({ ...sequentialForm, aksBab: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tidak terkendali/ tak teratur (perlu pencahar)</option>
                                    <option value={1}>Skor 1 : Kadang-kadang tak terkendali (1x /minggu)</option>
                                    <option value={2}>Skor 2 : Terkendali teratur</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 2. BAK */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  2. Mengendalikan rangsang Buang Air Kecil (BAK)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksBak ?? '') : (sequentialForm.aksBak ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksBak: val });
                                      else setSequentialForm({ ...sequentialForm, aksBak: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tidak terkendali atau pakai kateter</option>
                                    <option value={1}>Skor 1 : Kadang-kadang tak terkendali (1x/24 jam)</option>
                                    <option value={2}>Skor 2 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 3. Membersihkan Diri */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  3. Membersihkan diri (mencuci wajah, menyikat rambut, mencukur kumis, sikat gigi)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksCuciMuka ?? '') : (sequentialForm.aksCuciMuka ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksCuciMuka: val });
                                      else setSequentialForm({ ...sequentialForm, aksCuciMuka: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Butuh pertolongan orang lain</option>
                                    <option value={1}>Skor 1 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 4. Penggunaan WC */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  4. Penggunaan WC (keluar masuk WC, melepas/memakai celana, cebok, menyiram)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksWc ?? '') : (sequentialForm.aksWc ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksWc: val });
                                      else setSequentialForm({ ...sequentialForm, aksWc: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tergantung pertolongan orang lain</option>
                                    <option value={1}>Skor 1 : Perlu pertolongan pada beberapa kegiatan tetapi dapat</option>
                                    <option value={2}>Skor 2 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 5. Makan Minum */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  5. Makan minum (Jika makan harus berupa potongan, dianggap dibantu)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksMakan ?? '') : (sequentialForm.aksMakan ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksMakan: val });
                                      else setSequentialForm({ ...sequentialForm, aksMakan: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tidak mampu</option>
                                    <option value={1}>Skor 1 : Perlu ditolong memotong makanan</option>
                                    <option value={2}>Skor 2 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 6. Bergerak dari kursi roda */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  6. Bergerak dari kursi roda ke tempat tidur dan sebaliknya (termasuk duduk di tempat tidur)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksPindah ?? '') : (sequentialForm.aksPindah ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksPindah: val });
                                      else setSequentialForm({ ...sequentialForm, aksPindah: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tidak mampu</option>
                                    <option value={1}>Skor 1 : Perlu bantuan untuk bisa duduk (2 org)</option>
                                    <option value={2}>Skor 2 : Bantuan minimal 1 org</option>
                                    <option value={3}>Skor 3 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 7. Berjalan di tempat rata */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  7. Berjalan di tempat rata (atau jika tidak bisa berjalan, menjalankan kursi roda)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksJalan ?? '') : (sequentialForm.aksJalan ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksJalan: val });
                                      else setSequentialForm({ ...sequentialForm, aksJalan: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tidak mampu</option>
                                    <option value={1}>Skor 1 : bisa (pindah) dengan kursi roda</option>
                                    <option value={2}>Skor 2 : Berjalan dengan bantuan 1 org</option>
                                    <option value={3}>Skor 3 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 8. Berpakaian */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  8. Berpakaian (termasuk memasang tali sepatu, mengencangkan sabuk)
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksPakaian ?? '') : (sequentialForm.aksPakaian ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksPakaian: val });
                                      else setSequentialForm({ ...sequentialForm, aksPakaian: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tergantung orang lain</option>
                                    <option value={1}>Skor 1 : Sebagian dibantu misal mengancing baju</option>
                                    <option value={2}>Skor 2 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 9. Naik turun tangga */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  9. Naik turun tangga
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksTangga ?? '') : (sequentialForm.aksTangga ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksTangga: val });
                                      else setSequentialForm({ ...sequentialForm, aksTangga: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tidak mampu</option>
                                    <option value={1}>Skor 1 : Butuh pertolongan</option>
                                    <option value={2}>Skor 2 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>

                              {/* 10. Mandi */}
                              <tr>
                                <td className="px-3 py-2 fw-semibold text-dark">
                                  10. Mandi
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    className="form-select form-select-sm bg-light border-0 py-2"
                                    value={examinationMode === 'per-step' ? (langkah4Form.aksMandi ?? '') : (sequentialForm.aksMandi ?? '')}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                      if (examinationMode === 'per-step') setLangkah4Form({ ...langkah4Form, aksMandi: val });
                                      else setSequentialForm({ ...sequentialForm, aksMandi: val });
                                    }}
                                  >
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value={0}>Skor 0 : Tergantung orang lain</option>
                                    <option value={1}>Skor 1 : Mandiri</option>
                                  </select>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Catatan Ketergantungan & Rujukan AKS */}
                        <div className="p-3 rounded-3 bg-light border">
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                            <span className="fw-bold text-dark small">Tingkat Ketergantungan:</span>
                            <div className="d-flex flex-wrap gap-1.5 small">
                              <span className={`badge ${currentAks.shortCode === 'M' ? 'bg-success text-white' : 'bg-secondary-subtle text-secondary'}`}>Mandiri (M=20)</span>
                              <span className={`badge ${currentAks.shortCode === 'R' ? 'bg-warning text-dark' : 'bg-secondary-subtle text-secondary'}`}>Ringan (R=12-19)</span>
                              <span className={`badge ${currentAks.shortCode === 'S' ? 'bg-warning text-dark' : 'bg-secondary-subtle text-secondary'}`}>Sedang (S=9-11)</span>
                              <span className={`badge ${currentAks.shortCode === 'B' ? 'bg-danger text-white' : 'bg-secondary-subtle text-secondary'}`}>Berat (B=5-8)</span>
                              <span className={`badge ${currentAks.shortCode === 'T' ? 'bg-danger text-white' : 'bg-secondary-subtle text-secondary'}`}>Total (T=0-4)</span>
                            </div>
                          </div>
                          {!currentAks.isAnswered ? (
                            <div className="alert alert-light text-muted d-flex align-items-center gap-2 mb-0 py-2 small border">
                              <Info size={16} className="flex-shrink-0 text-primary" />
                              <div>
                                Silakan lengkapi instrumen 10 pertanyaan di atas untuk menghitung Indeks Barthel (AKS) lansia.
                              </div>
                            </div>
                          ) : currentAks.perluRujuk ? (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 small">
                              <AlertCircle size={16} className="flex-shrink-0" />
                              <div>
                                <strong>Rujukan*:</strong> Skor perhitungan AKS = {currentAks.total} (&lt; 20). Termasuk kelompok <strong>{currentAks.kategori}</strong>, maka dilakukan rujuk ke Pustu/Puskesmas.
                              </div>
                            </div>
                          ) : (
                            <div className="alert alert-success d-flex align-items-center gap-2 mb-0 py-2 small">
                              <CheckCircle2 size={16} className="flex-shrink-0" />
                              <div>
                                <strong>Status Mandiri (Skor 20):</strong> Pasien mandiri dalam seluruh aktifitas kehidupan sehari-hari, tidak perlu rujukan ketergantungan.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* C3. PEMERIKSAAN TAHUNAN SKILAS */}
                      <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C3</span>
                              <h5 className="fw-bold text-dark mb-0">C3. Pemeriksaan Tahunan SKILAS</h5>
                            </div>
                          </div>
                          <div>
                            <span className={`px-3 py-1.5 rounded-pill fw-bold small ${
                              !currentSkilas.isAnswered
                                ? 'bg-secondary-subtle text-secondary border border-secondary-subtle'
                                : currentSkilas.adaRisiko 
                                  ? 'bg-danger-subtle text-danger border border-danger-subtle' 
                                  : 'bg-success-subtle text-success border border-success-subtle'
                            }`}>
                              {!currentSkilas.isAnswered ? 'Belum Diisi' : currentSkilas.adaRisiko ? '⚠️ Ada Indikasi Risiko SKILAS' : '✓ Semua Domain Terpenuhi Normal'}
                            </span>
                          </div>
                        </div>

                        <div className="table-responsive mb-3">
                          <table className="table table-bordered align-middle mb-0" style={{ borderColor: '#e2e8f0' }}>
                            <thead style={{ backgroundColor: '#fed7aa', color: '#7c2d12' }}>
                              <tr>
                                <th style={{ width: '60%' }} className="py-2.5 px-3 fw-bold text-dark">Pertanyaan</th>
                                <th style={{ width: '40%' }} className="py-2.5 px-3 fw-bold text-dark">Waktu Wawancara</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* 1. PENURUNAN KOGNITIF */}
                              <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                  Penurunan Kognitif
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Orientasi waktu dan tempat
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasOrientasi_${examinationMode}`}
                                    value={getLangkah4Value('skilasOrientasi')}
                                    onChange={(val) => updateLangkah4Value('skilasOrientasi', val)}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Mengulang ketiga kata
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasUlangKata_${examinationMode}`}
                                    value={getLangkah4Value('skilasUlangKata')}
                                    onChange={(val) => updateLangkah4Value('skilasUlangKata', val)}
                                  />
                                </td>
                              </tr>

                              {/* 2. KETERBATASAN MOBILISASI */}
                              <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                  Keterbatasan Mobilisasi
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Tes berdiri dari kursi
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasTesKursi_${examinationMode}`}
                                    value={getLangkah4Value('skilasTesKursi')}
                                    onChange={(val) => updateLangkah4Value('skilasTesKursi', val)}
                                  />
                                </td>
                              </tr>

                              {/* 3. MALNUTRISI */}
                              <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                  Malnutrisi
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; BB berkurang &gt;3kg dalam 3 bulan terakhir atau pakaian jadi lebih longgar
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasBbTurun_${examinationMode}`}
                                    value={getLangkah4Value('skilasBbTurun')}
                                    onChange={(val) => updateLangkah4Value('skilasBbTurun', val)}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Hilang nafsu makan/kesulitan makan
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasNafsuMakan_${examinationMode}`}
                                    value={getLangkah4Value('skilasNafsuMakan')}
                                    onChange={(val) => updateLangkah4Value('skilasNafsuMakan', val)}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; LILA &lt;21 cm
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasLilaKurang_${examinationMode}`}
                                    value={getLangkah4Value('skilasLilaKurang')}
                                    onChange={(val) => updateLangkah4Value('skilasLilaKurang', val)}
                                  />
                                </td>
                              </tr>

                              {/* 4. GANGGUAN PENGLIHATAN */}
                              <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                  Gangguan Penglihatan
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Masalah pada mata (sulit lihat jauh, membaca, penyakit mata, sedang dalam pengobatan Hipertensi/Diabetes)
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasMasalahMata_${examinationMode}`}
                                    value={getLangkah4Value('skilasMasalahMata')}
                                    onChange={(val) => updateLangkah4Value('skilasMasalahMata', val)}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Tes Melihat
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasTesLihat_${examinationMode}`}
                                    value={getLangkah4Value('skilasTesLihat')}
                                    onChange={(val) => updateLangkah4Value('skilasTesLihat', val)}
                                  />
                                </td>
                              </tr>

                              {/* 5. GANGGUAN PENDENGARAN */}
                              <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                  Gangguan Pendengaran
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Tes Berbisik
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasTesBisik_${examinationMode}`}
                                    value={getLangkah4Value('skilasTesBisik')}
                                    onChange={(val) => updateLangkah4Value('skilasTesBisik', val)}
                                  />
                                </td>
                              </tr>

                              {/* 6. GEJALA DEPRESI */}
                              <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                  Gejala Depresi (dalam 2 minggu terakhir)
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Perasaan sedih, tertekan, atau putus asa
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasPerasaanSedih_${examinationMode}`}
                                    value={getLangkah4Value('skilasPerasaanSedih')}
                                    onChange={(val) => updateLangkah4Value('skilasPerasaanSedih', val)}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 small text-dark ps-4">
                                  &bull; Sedikit minat atau kesenangan dalam melakukan sesuatu
                                </td>
                                <td className="px-3 py-2">
                                  <YesNoRadio
                                    name={`skilasHilangMinat_${examinationMode}`}
                                    value={getLangkah4Value('skilasHilangMinat')}
                                    onChange={(val) => updateLangkah4Value('skilasHilangMinat', val)}
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Catatan Penyuluhan & Rujukan SKILAS */}
                        <div className="p-3 rounded-3 bg-light border">
                          <div className="d-flex flex-column gap-1 text-muted small mb-2">
                            <div><strong>Penyuluhan*:</strong> Tema edukasi yang diberikan disesuaikan dengan domain risiko skrining.</div>
                            <div><strong>Rujukan*:</strong> Rujuk puskesmas atau pustu bila ada indikasi resiko hasil pemeriksaan dan skrining.</div>
                          </div>
                          {!currentSkilas.isAnswered ? (
                            <div className="alert alert-light text-muted d-flex align-items-center gap-2 mb-0 py-2 small border">
                              <Info size={16} className="flex-shrink-0 text-primary" />
                              <div>
                                Silakan jawab instrumen skrining SKILAS di atas untuk mengevaluasi 6 domain kapasitas fungsional lansia.
                              </div>
                            </div>
                          ) : currentSkilas.adaRisiko ? (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 small">
                              <AlertCircle size={16} className="flex-shrink-0" />
                              <div>
                                <strong>Indikasi Rujukan Otomatis SKILAS:</strong> Ditemukan indikasi risiko pada domain: <em>{currentSkilas.issues.join(', ')}</em> &rarr; Status rujukan otomatis diset ke <strong>"Rujuk ke Puskesmas / Pustu"</strong>.
                              </div>
                            </div>
                          ) : (
                            <div className="alert alert-success d-flex align-items-center gap-2 mb-0 py-2 small">
                              <CheckCircle2 size={16} className="flex-shrink-0" />
                              <div>
                                <strong>Hasil SKILAS Baik:</strong> Seluruh domain kognitif, mobilisasi, nutrisi, sensorik, dan psikologis lansia terpantau dalam batas aman.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                    </>
                  )}
                </>
              ) : activeSubmenu === 'usekrem-15-18' ? (
                <>
                  {/* Kadar Gula Darah & Plotting Gula Darah */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Kadar Gula Darah &amp; Plotting</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Kadar Gula Darah (mg/dl)</label>
                        <div className="input-group">
                          <input 
                            type="number"
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 110"
                            value={examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah2Form({ ...langkah2Form, gulaDarah: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, gulaDarah: e.target.value });
                              }
                            }}
                          />
                          <span className="input-group-text bg-light border-0 text-muted">mg/dl</span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Plotting Gula Darah</label>
                        <div className="bg-light p-2 rounded-3 border-0 fw-bold text-dark d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>
                          <span>
                            {parseInt(examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah) >= 200 
                              ? 'Diabetisi (D) - ≥ 200 mg/dl'
                              : parseInt(examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah) >= 140
                                ? 'Prediabetisi (Pd) - 140-199 mg/dl'
                                : 'Normal (N) - 80-140 mg/dl'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skrining Gejala TBC */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <YesNoCard
                          label="Batuk > 2 minggu"
                          name={`batukBesarTbc_u1518_${examinationMode}`}
                          value={getLangkah4Value('batukBesarTbc')}
                          onChange={(val) => updateLangkah4Value('batukBesarTbc', val)}
                        />
                      </div>

                      <div className="col-12 mt-2">
                        <div className="p-2 px-3 rounded-2 bg-light fw-bold text-dark small border-start border-primary border-3">
                          Batuk &lt; 2 minggu dengan tambahan:
                        </div>
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="a. Nafsu makan menurun"
                          name={`nafsuMakanTbc_u1518_${examinationMode}`}
                          value={getLangkah4Value('nafsuMakanTbc')}
                          onChange={(val) => updateLangkah4Value('nafsuMakanTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="b. Berat badan menurun"
                          name={`bbMenurunTbc_u1518_${examinationMode}`}
                          value={getLangkah4Value('bbMenurunTbc')}
                          onChange={(val) => updateLangkah4Value('bbMenurunTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="c. Lemah, letih, lesu"
                          name={`lemahLesuTbc_u1518_${examinationMode}`}
                          value={getLangkah4Value('lemahLesuTbc')}
                          onChange={(val) => updateLangkah4Value('lemahLesuTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="d. Berkeringat malam hari tanpa kegiatan fisik"
                          name={`berkeringatMalamTbc_u1518_${examinationMode}`}
                          value={getLangkah4Value('berkeringatMalamTbc')}
                          onChange={(val) => updateLangkah4Value('berkeringatMalamTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="e. Batuk darah"
                          name={`batukDarahTbc_u1518_${examinationMode}`}
                          value={getLangkah4Value('batukDarahTbc')}
                          onChange={(val) => updateLangkah4Value('batukDarahTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="f. Sesak nafas"
                          name={`sesakNafasTbc_u1518_${examinationMode}`}
                          value={getLangkah4Value('sesakNafasTbc')}
                          onChange={(val) => updateLangkah4Value('sesakNafasTbc', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* B. Pemeriksaan 6 Bulan Sekali */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">B. Pemeriksaan 6 Bulan Sekali</h5>

                    <h6 className="fw-bold text-primary mb-2">Tes Penglihatan (Hitung Jari)</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kanan</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKanan || '') : (sequentialForm.mataKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, mataKanan: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, mataKanan: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kiri</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKiri || '') : (sequentialForm.mataKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, mataKiri: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, mataKiri: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>
                    </div>

                    <h6 className="fw-bold text-primary mb-2">Tes Pendengaran (Berbisik)</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Telinga Kanan</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKanan || '') : (sequentialForm.telingaKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, telingaKanan: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, telingaKanan: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Telinga Kiri</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKiri || '') : (sequentialForm.telingaKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, telingaKiri: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, telingaKiri: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* C. Pemeriksaan Tahunan Remaja Putri */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">1x / Tahun</span>
                          <h5 className="fw-bold text-dark mb-0">C. Pemeriksaan Tahunan Remaja Putri</h5>
                        </div>
                        <p className="text-muted small mb-0">
                          Skrining Kesehatan Jiwa &amp; Pemeriksaan Anemia (Hb) berkala tahunan.
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-3 bg-light p-2 px-3 rounded-4 border">
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            role="switch"
                            id="toggleSkriningTahunanRemaja15"
                            style={{ width: '2.4em', height: '1.2em', cursor: 'pointer' }}
                            checked={Boolean(getLangkah4Value('isSkriningTahunan'))}
                            onChange={(e) => updateLangkah4Value('isSkriningTahunan', e.target.checked)}
                          />
                          <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor="toggleSkriningTahunanRemaja15">
                            {getLangkah4Value('isSkriningTahunan') ? 'Lakukan Skrining' : 'Tidak Dilakukan'}
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* Banner Riwayat Terakhir Skrining Tahunan Remaja */}
                    <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? 'text-success' : annualScreeningInfo.hasHistory ? 'text-warning' : 'text-secondary'}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>
                              {annualScreeningInfo.statusLabel}
                            </span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: '0.82rem' }}>
                            {annualScreeningInfo.detailText}
                          </div>
                        </div>
                      </div>

                      {annualScreeningInfo.tglFormatted !== '-' && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: '0.8rem' }}>
                          <span className="d-block text-secondary fw-semibold">Terakhir Diisi:</span>
                          <span className="badge bg-white text-dark border px-2 py-1 font-monospace">{annualScreeningInfo.tglFormatted}</span>
                        </div>
                      )}
                    </div>

                    {!getLangkah4Value('isSkriningTahunan') ? (
                      <div className="alert alert-light border rounded-3 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 small">
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <Info size={16} className="text-primary flex-shrink-0" />
                          <span>Pemeriksaan tahunan tidak dilakukan pada kunjungan ini. Anda dapat langsung menyimpan data langkah 4 tanpa instrumen tahunan.</span>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => updateLangkah4Value('isSkriningTahunan', true)}
                        >
                          Isi Pemeriksaan
                        </button>
                      </div>
                    ) : (
                      <div className="row g-3 pt-2 border-top">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Melakukan skrining jiwa</label>
                          <select 
                            className="form-select bg-light border-0 py-2"
                            value={examinationMode === 'per-step' ? (langkah4Form.skriningJiwa || '') : (sequentialForm.skriningJiwa || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah4Form({ ...langkah4Form, skriningJiwa: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, skriningJiwa: e.target.value });
                              }
                            }}
                          >
                            <option value="">-- Pilih Status --</option>
                            <option value="Sudah">Sudah</option>
                            <option value="Belum">Belum</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Periksa Hb</label>
                          <select 
                            className="form-select bg-light border-0 py-2"
                            value={examinationMode === 'per-step' ? (langkah4Form.periksaHb || '') : (sequentialForm.periksaHb || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah4Form({ ...langkah4Form, periksaHb: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, periksaHb: e.target.value });
                              }
                            }}
                          >
                            <option value="">-- Pilih Status --</option>
                            <option value="Sudah">Sudah</option>
                            <option value="Belum">Belum</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : activeSubmenu === 'usekrem-6-14' ? (
                <>
                  {/* Skrining Gejala TBC */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <YesNoCard
                          label="Batuk ≥ 2 minggu"
                          name={`batukTbc_u614_${examinationMode}`}
                          value={getLangkah4Value('batukTbc')}
                          onChange={(val) => updateLangkah4Value('batukTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="Demam hilang timbul > 2 minggu"
                          name={`demamTbc_u614_${examinationMode}`}
                          value={getLangkah4Value('demamTbc')}
                          onChange={(val) => updateLangkah4Value('demamTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="Berat badan turun/tidak naik dalam 2 bulan"
                          name={`bbTurunTbc_u614_${examinationMode}`}
                          value={getLangkah4Value('bbTurunTbc')}
                          onChange={(val) => updateLangkah4Value('bbTurunTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="Lesu / malaise"
                          name={`lesuTbc_u614_${examinationMode}`}
                          value={getLangkah4Value('lesuTbc')}
                          onChange={(val) => updateLangkah4Value('lesuTbc', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* B. Pemeriksaan 6 Bulan Sekali */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">B. Pemeriksaan 6 Bulan Sekali</h5>

                    <h6 className="fw-bold text-primary mb-2">Tes Penglihatan (Hitung Jari)</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kanan</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKanan || '') : (sequentialForm.mataKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, mataKanan: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, mataKanan: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kiri</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKiri || '') : (sequentialForm.mataKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, mataKiri: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, mataKiri: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>
                    </div>

                    <h6 className="fw-bold text-primary mb-2">Tes Pendengaran (Berbisik)</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Telinga Kanan</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKanan || '') : (sequentialForm.telingaKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, telingaKanan: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, telingaKanan: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Telinga Kiri</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKiri || '') : (sequentialForm.telingaKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, telingaKiri: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, telingaKiri: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Hasil --</option>
                          <option value="Normal">Normal</option>
                          <option value="Ada Gangguan">Ada Gangguan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* C. Pemeriksaan Tahunan Remaja Putri */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">1x / Tahun</span>
                          <h5 className="fw-bold text-dark mb-0">C. Pemeriksaan Tahunan Remaja Putri</h5>
                        </div>
                        <p className="text-muted small mb-0">
                          Skrining Kesehatan Jiwa &amp; Pemeriksaan Anemia (Hb) berkala tahunan.
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-3 bg-light p-2 px-3 rounded-4 border">
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            role="switch"
                            id="toggleSkriningTahunanRemaja6"
                            style={{ width: '2.4em', height: '1.2em', cursor: 'pointer' }}
                            checked={Boolean(getLangkah4Value('isSkriningTahunan'))}
                            onChange={(e) => updateLangkah4Value('isSkriningTahunan', e.target.checked)}
                          />
                          <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor="toggleSkriningTahunanRemaja6">
                            {getLangkah4Value('isSkriningTahunan') ? 'Lakukan Skrining' : 'Tidak Dilakukan'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Banner Riwayat Terakhir Skrining Tahunan Remaja */}
                    <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? 'text-success' : annualScreeningInfo.hasHistory ? 'text-warning' : 'text-secondary'}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>
                              {annualScreeningInfo.statusLabel}
                            </span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: '0.82rem' }}>
                            {annualScreeningInfo.detailText}
                          </div>
                        </div>
                      </div>

                      {annualScreeningInfo.tglFormatted !== '-' && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: '0.8rem' }}>
                          <span className="d-block text-secondary fw-semibold">Terakhir Diisi:</span>
                          <span className="badge bg-white text-dark border px-2 py-1 font-monospace">{annualScreeningInfo.tglFormatted}</span>
                        </div>
                      )}
                    </div>

                    {!getLangkah4Value('isSkriningTahunan') ? (
                      <div className="alert alert-light border rounded-3 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 small">
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <Info size={16} className="text-primary flex-shrink-0" />
                          <span>Pemeriksaan tahunan tidak dilakukan pada kunjungan ini. Anda dapat langsung menyimpan data langkah 4 tanpa instrumen tahunan.</span>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => updateLangkah4Value('isSkriningTahunan', true)}
                        >
                          Isi Pemeriksaan
                        </button>
                      </div>
                    ) : (
                      <div className="row g-3 pt-2 border-top">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Melakukan skrining jiwa</label>
                          <select 
                            className="form-select bg-light border-0 py-2"
                            value={examinationMode === 'per-step' ? (langkah4Form.skriningJiwa || '') : (sequentialForm.skriningJiwa || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah4Form({ ...langkah4Form, skriningJiwa: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, skriningJiwa: e.target.value });
                              }
                            }}
                          >
                            <option value="">-- Pilih Status --</option>
                            <option value="Sudah">Sudah</option>
                            <option value="Belum">Belum</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Periksa Hb</label>
                          <select 
                            className="form-select bg-light border-0 py-2"
                            value={examinationMode === 'per-step' ? (langkah4Form.periksaHb || '') : (sequentialForm.periksaHb || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah4Form({ ...langkah4Form, periksaHb: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, periksaHb: e.target.value });
                              }
                            }}
                          >
                            <option value="">-- Pilih Status --</option>
                            <option value="Sudah">Sudah</option>
                            <option value="Belum">Belum</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : ['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? (
                <>
                  {/* 1. Imunisasi */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Imunisasi</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Tempat Imunisasi</label>
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.tempatImunisasi || '') : (sequentialForm.tempatImunisasi || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, tempatImunisasi: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, tempatImunisasi: e.target.value });
                            }
                          }}
                        >
                          <option value="">-- Pilih Tempat Imunisasi --</option>
                          <option value="Posyandu">Posyandu</option>
                          <option value="Puskesmas">Puskesmas</option>
                          <option value="Rumah Sakit">Rumah Sakit</option>
                          <option value="Klinik / Praktik Mandiri">Klinik / Praktik Mandiri</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      {/* Pertanyaan Jika di Rumah Sakit / Faskes Luar: Rumah Sakit mana */}
                      {['Rumah Sakit', 'Klinik / Praktik Mandiri', 'Lainnya'].includes(
                        examinationMode === 'per-step' ? (langkah4Form.tempatImunisasi || '') : (sequentialForm.tempatImunisasi || '')
                      ) && (
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small mb-1">
                            {((examinationMode === 'per-step' ? langkah4Form.tempatImunisasi : sequentialForm.tempatImunisasi) === 'Rumah Sakit')
                              ? 'Nama Rumah Sakit'
                              : 'Nama Faskes / Tempat Pelayanan'}
                          </label>
                          <input
                            type="text"
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: RSUD Cibinong, RS Hermina, dll..."
                            value={examinationMode === 'per-step' ? (langkah4Form.namaRsImunisasi || '') : (sequentialForm.namaRsImunisasi || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
                                setLangkah4Form({ ...langkah4Form, namaRsImunisasi: e.target.value });
                              } else {
                                setSequentialForm({ ...sequentialForm, namaRsImunisasi: e.target.value });
                              }
                            }}
                          />
                        </div>
                      )}

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Jenis Imunisasi yang Diberikan</label>
                        <input 
                          type="text"
                          className="form-control bg-light border-0 py-2"
                          placeholder="Masukkan jenis imunisasi yang diberikan (misal: DPT, Polio, Campak, dll)..."
                          value={examinationMode === 'per-step' ? (langkah4Form.jenisImunisasi || '') : (sequentialForm.jenisImunisasi || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
                              setLangkah4Form({ ...langkah4Form, jenisImunisasi: e.target.value });
                            } else {
                              setSequentialForm({ ...sequentialForm, jenisImunisasi: e.target.value });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Pemberian ASI & MP-ASI (Dipisah di bawah Imunisasi) */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Pemberian ASI &amp; MP-ASI</h5>

                    <div className="row g-3">
                      {/* ASI Eksklusif: Otomatis hanya untuk bayi usia 0 - 6 bulan */}
                      {activeSubmenu === 'bayi-0-11' && (() => {
                        const targetW = activeWargaList.find(w => String(w.id) === String(examinationMode === 'per-step' ? selectedWargaStep4 : selectedWargaId));
                        const ageMos = getAgeInMonths(targetW);
                        if (ageMos > 6) return null;
                        return (
                          <div className="col-md-6">
                            <YesNoCard
                              label="ASI Eksklusif (0-6 Bulan)"
                              name={`asiEksklusif_${examinationMode}`}
                              value={getLangkah4Value('asiEksklusif')}
                              onChange={(val) => updateLangkah4Value('asiEksklusif', val)}
                            />
                          </div>
                        );
                      })()}

                      <div className="col-md-6">
                        <YesNoCard
                          label="MP ASI (Komposisi, jenis sesuai umur)"
                          name={`mpAsi_${examinationMode}`}
                          value={getLangkah4Value('mpAsi')}
                          onChange={(val) => updateLangkah4Value('mpAsi', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skrining Gejala TBC Bayi / Balita */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <YesNoCard
                          label="a. Batuk ≥ 2 minggu"
                          name={`batukTbc_bayi_${examinationMode}`}
                          value={getLangkah4Value('batukTbc')}
                          onChange={(val) => updateLangkah4Value('batukTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="b. Demam hilang dan timbul > 2 minggu"
                          name={`demamTbc_bayi_${examinationMode}`}
                          value={getLangkah4Value('demamTbc')}
                          onChange={(val) => updateLangkah4Value('demamTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="c. Berat badan turun/tidak naik dalam 2 bulan"
                          name={`bbTurunTbc_bayi_${examinationMode}`}
                          value={getLangkah4Value('bbTurunTbc')}
                          onChange={(val) => updateLangkah4Value('bbTurunTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="d. Lesu / malaise"
                          name={`lesuTbc_bayi_${examinationMode}`}
                          value={getLangkah4Value('lesuTbc')}
                          onChange={(val) => updateLangkah4Value('lesuTbc', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Balita / Bayi Mendapatkan Layanan Kesehatan */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Layanan Kesehatan Tambahan &amp; Vitamin</h5>

                    <div className="row g-3">
                      {/* 1. PMT lokal pemulihan (+ Sub-pertanyaan Konsumsi PMT habis di dalamnya secara stabil) */}
                      <div className="col-md-6">
                        <div 
                          className="p-3.5 rounded-3 border bg-white h-100 d-flex flex-column justify-content-center"
                          style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff', minHeight: '58px' }}
                        >
                          <div className="d-flex align-items-center justify-content-between gap-3">
                            <span className="fw-medium text-dark small mb-0">PMT lokal pemulihan</span>
                            <div className="d-flex align-items-center gap-4 flex-shrink-0">
                              <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`pmtPemulihan_${examinationMode}`}
                                  value="Ya"
                                  checked={getLangkah4Value('pmtPemulihan') === 'Ya'}
                                  onChange={() => updateLangkah4Value('pmtPemulihan', 'Ya')}
                                  className="form-check-input m-0 cursor-pointer"
                                  style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
                                />
                                <span>Ya</span>
                              </label>
                              <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`pmtPemulihan_${examinationMode}`}
                                  value="Tidak"
                                  checked={getLangkah4Value('pmtPemulihan') === 'Tidak'}
                                  onChange={() => {
                                    updateLangkah4Value('pmtPemulihan', 'Tidak');
                                    updateLangkah4Value('pmtHabis', '');
                                  }}
                                  className="form-check-input m-0 cursor-pointer"
                                  style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
                                />
                                <span>Tidak</span>
                              </label>
                            </div>
                          </div>

                          {/* 2. Konsumsi PMT habis: Terbuka secara konsisten di dalam slot PMT tanpa menggeser kartu lain */}
                          {getLangkah4Value('pmtPemulihan') === 'Ya' && (
                            <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between gap-3">
                              <span className="small fw-semibold text-primary mb-0">&bull; Konsumsi PMT habis?</span>
                              <div className="d-flex align-items-center gap-4 flex-shrink-0">
                                <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name={`pmtHabis_${examinationMode}`}
                                    value="Ya"
                                    checked={getLangkah4Value('pmtHabis') === 'Ya'}
                                    onChange={() => updateLangkah4Value('pmtHabis', 'Ya')}
                                    className="form-check-input m-0 cursor-pointer"
                                    style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
                                  />
                                  <span>Ya</span>
                                </label>
                                <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name={`pmtHabis_${examinationMode}`}
                                    value="Tidak"
                                    checked={getLangkah4Value('pmtHabis') === 'Tidak'}
                                    onChange={() => updateLangkah4Value('pmtHabis', 'Tidak')}
                                    className="form-check-input m-0 cursor-pointer"
                                    style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
                                  />
                                  <span>Tidak</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Vitamin A: Hanya muncul di bulan Februari (2) dan Agustus (8) */}
                      {isBulanVitA && (
                        <div className="col-md-6">
                          <YesNoCard
                            label="Vitamin A (Bulan Feb &amp; Ags)"
                            name={`vitA_${examinationMode}`}
                            value={getLangkah4Value('vitA')}
                            onChange={(val) => updateLangkah4Value('vitA', val)}
                          />
                        </div>
                      )}

                      {/* 4. Obat Cacing - Balita 12-59 Bulan */}
                      {activeSubmenu === 'balita-12-59' && (
                        <div className="col-md-6">
                          <YesNoCard
                            label="Obat Cacing"
                            name={`obatCacing_${examinationMode}`}
                            value={getLangkah4Value('obatCacing')}
                            onChange={(val) => updateLangkah4Value('obatCacing', val)}
                          />
                        </div>
                      )}

                      {/* 5. Ikut kelas balita: Posisi tetap konsisten dan tidak berpindah baris */}
                      <div className="col-md-6">
                        <YesNoCard
                          label="Ikut kelas balita"
                          name={`ikutKelasBalita_${examinationMode}`}
                          value={getLangkah4Value('ikutKelasBalita')}
                          onChange={(val) => updateLangkah4Value('ikutKelasBalita', val)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : activeSubmenu === 'apras' ? (
                /* Apras 60-72 Bln: Skrining Gejala TBC & Obat Cacing (Y/T) */
                <>
                  {/* Skrining Gejala TBC */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <YesNoCard
                          label="a. Batuk ≥ 2 minggu"
                          name={`batukTbc_apras_${examinationMode}`}
                          value={getLangkah4Value('batukTbc')}
                          onChange={(val) => updateLangkah4Value('batukTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="b. Demam hilang dan timbul > 2 minggu"
                          name={`demamTbc_apras_${examinationMode}`}
                          value={getLangkah4Value('demamTbc')}
                          onChange={(val) => updateLangkah4Value('demamTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="c. Berat badan turun/tidak naik dalam 2 bulan"
                          name={`bbTurunTbc_apras_${examinationMode}`}
                          value={getLangkah4Value('bbTurunTbc')}
                          onChange={(val) => updateLangkah4Value('bbTurunTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="d. Lesu / malaise"
                          name={`lesuTbc_apras_${examinationMode}`}
                          value={getLangkah4Value('lesuTbc')}
                          onChange={(val) => updateLangkah4Value('lesuTbc', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Obat Cacing (Y/T) */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Pemberian Obat Cacing</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <YesNoCard
                          label="Obat Cacing (Y/T)"
                          name={`obatCacing_apras_${examinationMode}`}
                          value={getLangkah4Value('obatCacing')}
                          onChange={(val) => updateLangkah4Value('obatCacing', val)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Standard TBC & Pelayanan Kesehatan for Bumil/Nifas/Adults */
                <>
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <YesNoCard
                          label="Batuk terus menerus"
                          name={`batukTbc_bumil_${examinationMode}`}
                          value={getLangkah4Value('batukTbc')}
                          onChange={(val) => updateLangkah4Value('batukTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="Demam ≥ 2 minggu"
                          name={`demamTbc_bumil_${examinationMode}`}
                          value={getLangkah4Value('demamTbc')}
                          onChange={(val) => updateLangkah4Value('demamTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="BB tidak naik atau turun dalam 2 bulan berturut-turut"
                          name={`bbTurunTbc_bumil_${examinationMode}`}
                          value={getLangkah4Value('bbTurunTbc')}
                          onChange={(val) => updateLangkah4Value('bbTurunTbc', val)}
                        />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="Kontak erat Pasien TBC"
                          name={`kontakTbc_bumil_${examinationMode}`}
                          value={getLangkah4Value('kontakTbc')}
                          onChange={(val) => updateLangkah4Value('kontakTbc', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pelayanan Kesehatan khusus Ibu Hamil */}
                  {activeSubmenu === 'bumil' && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                      <h5 className="fw-bold text-dark mb-3">Pelayanan Kesehatan</h5>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <YesNoCard
                            label="Pemberian TTD/MMS"
                            name={`pemberianTtd_bumil_${examinationMode}`}
                            value={getLangkah4Value('pemberianTtd') || getLangkah4Value('jumlahTtd')}
                            onChange={(val) => {
                              updateLangkah4Value('pemberianTtd', val);
                              updateLangkah4Value('jumlahTtd', val);
                            }}
                            yesLabel="Sudah"
                            noLabel="Belum"
                            yesValue="Sudah"
                            noValue="Belum"
                          />
                        </div>

                        <div className="col-md-6">
                          <YesNoCard
                            label="Konsumsi TTD/MMS rutin (1 butir setiap hari selama kehamilan)"
                            name={`rutinTtd_bumil_${examinationMode}`}
                            value={getLangkah4Value('rutinTtd')}
                            onChange={(val) => updateLangkah4Value('rutinTtd', val)}
                          />
                        </div>

                        <div className="col-md-6">
                          <div className="p-3 bg-light border border-light-subtle rounded-3 h-100">
                            <label className="form-label text-dark fw-semibold small mb-1.5">
                              Jika mendapatkan MT Bumil KEK, tuliskan komposisi dan jumlah porsi
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm bg-white border"
                              placeholder="Contoh: Biskuit PMT, 1 Bungkus / Hari"
                              value={getLangkah4Value('komposisiMtBumil') || ''}
                              onChange={(e) => updateLangkah4Value('komposisiMtBumil', e.target.value)}
                              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <YesNoCard
                            label="Rutin konsumsi MT Bumil KEK"
                            name={`rutinMtBumil_bumil_${examinationMode}`}
                            value={getLangkah4Value('rutinMtBumil')}
                            onChange={(val) => updateLangkah4Value('rutinMtBumil', val)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pelayanan Kesehatan khusus Ibu Nifas / Menyusui */}
                  {activeSubmenu === 'nifas' && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                      <h5 className="fw-bold text-dark mb-3">Pelayanan Kesehatan</h5>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <YesNoCard
                            label="Pemberian kapsul vitamin A"
                            name={`jumlahVitA_${examinationMode}`}
                            value={getLangkah4Value('jumlahVitA')}
                            onChange={(val) => updateLangkah4Value('jumlahVitA', val)}
                            yesLabel="Sudah"
                            noLabel="Belum"
                            yesValue="Sudah"
                            noValue="Belum"
                          />
                        </div>

                        <div className="col-md-6">
                          <YesNoCard
                            label="Rutin konsumsi vitamin A"
                            name={`rutinVitA_${examinationMode}`}
                            value={getLangkah4Value('rutinVitA')}
                            onChange={(val) => updateLangkah4Value('rutinVitA', val)}
                          />
                        </div>

                        <div className="col-md-6">
                          <YesNoCard
                            label="Menyusui"
                            name={`menyusui_${examinationMode}`}
                            value={getLangkah4Value('menyusui')}
                            onChange={(val) => updateLangkah4Value('menyusui', val)}
                          />
                        </div>

                        <div className="col-md-6">
                          <YesNoCard
                            label="KB pasca persalinan"
                            name={`kbPascaPersalinan_${examinationMode}`}
                            value={getLangkah4Value('kbPascaPersalinan')}
                            onChange={(val) => updateLangkah4Value('kbPascaPersalinan', val)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skrining Kesehatan Jiwa khusus Usia Dewasa (PHQ-4) */}
                  {activeSubmenu === 'dewasa' && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-3 gap-2">
                        <div>
                          <h5 className="fw-bold text-dark mb-1">Skrining Kesehatan Jiwa</h5>
                          <span className="text-muted small">Pemeriksaan skrining kesehatan jiwa berkala untuk sasaran usia dewasa (PHQ-4)</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <label className="text-muted small fw-semibold mb-0 text-nowrap">Bulan Pelaksanaan:</label>
                          <select
                            className="form-select form-select-sm bg-light border-0 fw-semibold"
                            style={{ width: '130px' }}
                            value={getLangkah4Value('bulanSkriningJiwa') || 'Januari'}
                            onChange={(e) => updateLangkah4Value('bulanSkriningJiwa', e.target.value)}
                          >
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="table-responsive border rounded-3 mb-2">
                        <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                          <thead className="table-light text-center" style={{ fontSize: '0.80rem' }}>
                            <tr>
                              <th style={{ width: '45px', verticalAlign: 'middle' }}>No</th>
                              <th style={{ verticalAlign: 'middle' }}>Pertanyaan</th>
                              <th style={{ width: '125px', verticalAlign: 'middle' }}>Tidak sama sekali<br/><span className="text-muted small fw-normal">(0)</span></th>
                              <th style={{ width: '135px', verticalAlign: 'middle' }}>Kurang dari 1 minggu<br/><span className="text-muted small fw-normal">(1)</span></th>
                              <th style={{ width: '135px', verticalAlign: 'middle' }}>Lebih dari 1 minggu<br/><span className="text-muted small fw-normal">(2)</span></th>
                              <th style={{ width: '135px', verticalAlign: 'middle' }}>Hampir setiap hari<br/><span className="text-muted small fw-normal">(3)</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { id: 'jiwaQ1', no: 1, text: 'Kurang berminat atau bergairah dalam melakukan kegiatan?' },
                              { id: 'jiwaQ2', no: 2, text: 'Merasa sedih, muram, depresi atau putus asa?' },
                              { id: 'jiwaQ3', no: 3, text: 'Merasa gugup, cemas, gelisah, tegang, atau mudah marah?' },
                              { id: 'jiwaQ4', no: 4, text: 'Merasa tidak mampu menghentikan atau mengendalikan rasa khawatir?' },
                            ].map((q) => {
                              const currentVal = getLangkah4Value(q.id);
                              return (
                                <tr key={q.id}>
                                  <td className="text-center fw-bold text-muted">{q.no}</td>
                                  <td className="fw-medium text-dark">{q.text}</td>
                                  {[0, 1, 2, 3].map((score) => (
                                    <td key={score} className="text-center">
                                      <label className="w-100 h-100 d-flex align-items-center justify-content-center cursor-pointer m-0 py-1" style={{ cursor: 'pointer' }}>
                                        <input
                                          type="radio"
                                          name={`${q.id}_${examinationMode}`}
                                          value={String(score)}
                                          checked={String(currentVal) === String(score)}
                                          onChange={() => {
                                            updateLangkah4Value(q.id, String(score));
                                            const v1 = q.id === 'jiwaQ1' ? score : (Number(getLangkah4Value('jiwaQ1')) || 0);
                                            const v2 = q.id === 'jiwaQ2' ? score : (Number(getLangkah4Value('jiwaQ2')) || 0);
                                            const v3 = q.id === 'jiwaQ3' ? score : (Number(getLangkah4Value('jiwaQ3')) || 0);
                                            const v4 = q.id === 'jiwaQ4' ? score : (Number(getLangkah4Value('jiwaQ4')) || 0);
                                            const tot = v1 + v2 + v3 + v4;
                                            updateLangkah4Value('totalSkorJiwa', String(tot));
                                            updateLangkah4Value('skriningJiwa', tot >= 3 ? `Skor: ${tot} (Perlu Rujukan)` : `Skor: ${tot} (Normal)`);
                                          }}
                                          className="form-check-input m-0 cursor-pointer"
                                          style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
                                        />
                                      </label>
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="table-light">
                            {(() => {
                              const v1 = Number(getLangkah4Value('jiwaQ1')) || 0;
                              const v2 = Number(getLangkah4Value('jiwaQ2')) || 0;
                              const v3 = Number(getLangkah4Value('jiwaQ3')) || 0;
                              const v4 = Number(getLangkah4Value('jiwaQ4')) || 0;
                              const isFilled = getLangkah4Value('jiwaQ1') !== undefined && getLangkah4Value('jiwaQ1') !== '' &&
                                               getLangkah4Value('jiwaQ2') !== undefined && getLangkah4Value('jiwaQ2') !== '' &&
                                               getLangkah4Value('jiwaQ3') !== undefined && getLangkah4Value('jiwaQ3') !== '' &&
                                               getLangkah4Value('jiwaQ4') !== undefined && getLangkah4Value('jiwaQ4') !== '';
                              const total = v1 + v2 + v3 + v4;
                              const isRisk = total >= 3;
                              return (
                                <tr>
                                  <td colSpan="2" className="fw-bold text-dark text-end pe-3">Total Skor:</td>
                                  <td colSpan="4" className="fw-bold text-center">
                                    {isFilled ? (
                                      <div className="d-flex align-items-center justify-content-center gap-2">
                                        <span className="fs-6 fw-bold text-dark">{total}</span>
                                        <span className={`badge ${isRisk ? 'bg-danger text-white' : 'bg-success text-white'} px-2.5 py-1 rounded-pill small`}>
                                          {isRisk ? 'Skor ≥ 3: Indikasi Gangguan Emosional (Perlu Rujukan / Konseling)' : 'Skor < 3: Normal / Tidak Ada Indikasi'}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted small fw-normal fst-italic">Pilih jawaban pada seluruh pertanyaan di atas (Skor 0 - 12)</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })()}
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="d-flex justify-content-end pt-3 gap-2">
                {examinationMode === 'per-step' ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
                    <span>Simpan</span>
                  </button>
                ) : (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={() => setActiveStep(3)}>
                      <ArrowLeft size={15} />
                      <span>Kembali</span>
                    </button>
                    <button type="submit" className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
                      <span>Lanjut ke Langkah 5</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* LANGKAH 5: PENYULUHANA* & RUJUKAN* */}
          {/* ========================================================================= */}
          {activeStep === 5 && (() => {
            // ======= AUTO-RUJUKAN LOGIC =======
            // Hitung apakah ada indikasi rujukan berdasarkan skrining & plotting
            const form5 = examinationMode === 'per-step' ? langkah5Form : sequentialForm;
            const form4 = examinationMode === 'per-step' ? langkah4Form : sequentialForm;

            // 1. TBC Skrining: jika salah satu jawaban 'Ya' => risiko TBC
            const tbcFields = ['batukTbc','demamTbc','bbTurunTbc','kontakTbc','lesuTbc',
              'batukBesarTbc','nafsuMakanTbc','bbMenurunTbc','lemahLesuTbc','berkeringatMalamTbc','batukDarahTbc','sesakNafasTbc'];
            const tbcRisiko = tbcFields.some(f => form4[f] === 'Ya');

            // 2. Plotting hasil pengukuran
            const pr = plottingResult;
            const imtRisiko = pr && pr.imtKey !== 'normal';
            const lilaRisiko = pr && (
              activeSubmenu === 'lansia' ? pr.lilaLansiaKey !== 'normal' :
              activeSubmenu === 'dewasa' || activeSubmenu === 'bumil' || activeSubmenu === 'nifas' ? pr.lilaDewasaKey !== 'normal' :
              ['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? pr.lilaBayiKey !== 'normal' :
              activeSubmenu === 'apras' ? pr.lilaAprasKey !== 'normal' : false
            );
            const tensiRisiko = pr && pr.tensiAdultKey !== 'normal';
            const gulaRisiko = pr && pr.isGulaRisiko;
            const lpRisiko = pr && pr.lpPlottingKey !== 'normal';

            // 3. Lansia: AKS dan SKILAS
            const aksRisiko = activeSubmenu === 'lansia' && currentAks.perluRujuk;
            const skilasRisiko = activeSubmenu === 'lansia' && currentSkilas.adaRisiko;

            // Gabungan: apakah perlu dirujuk berdasarkan skrining
            const isPerluRujukFromSkrining = tbcRisiko || imtRisiko || lilaRisiko || tensiRisiko || gulaRisiko || lpRisiko || aksRisiko || skilasRisiko;

            // Daftar alasan rujukan untuk ditampilkan
            const alasanRujukan = [];
            if (tbcRisiko) alasanRujukan.push('Gejala TBC Positif');
            if (imtRisiko) alasanRujukan.push(`IMT: ${pr?.imtDewasaStatus || pr?.imtAprasStatus || pr?.imtUsekremStatus || pr?.imtStatus}`);
            if (lilaRisiko) alasanRujukan.push('LiLA Berisiko / KEK');
            if (tensiRisiko) alasanRujukan.push(`Tensi: ${pr?.tensiStatus || pr?.tensiRemajaStatus}`);
            if (gulaRisiko) alasanRujukan.push('Gula Darah Risiko');
            if (lpRisiko) alasanRujukan.push('Lingkar Perut Berisiko');
            if (aksRisiko) alasanRujukan.push(`AKS: ${currentAks.kategori}`);
            if (skilasRisiko) alasanRujukan.push(`SKILAS: ${currentSkilas.issues.join(', ')}`);

            // Auto-set: gunakan nilai terkomputasi langsung (tidak setState di dalam render)
            // State rujukan tetap bisa diupdate melalui useEffect atau onChange
            const effectiveRujukan = isPerluRujukFromSkrining
              ? 'Rujuk ke Puskesmas / Pustu'
              : (examinationMode === 'per-step' ? langkah5Form.statusRujukan : sequentialForm.statusRujukan);

            return (
            <form onSubmit={examinationMode === 'per-step' ? handleSaveLangkah5 : handleSaveSequentialAll}>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Penyuluhan* &amp; Rujukan*</h3>
                </div>

                {examinationMode === 'per-step' && (
                  <div className="bg-white px-3 py-2 rounded-3 border-0 shadow-sm d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                    <select 
                      className="form-select form-select-sm border-0 fw-semibold text-dark"
                      style={{ minWidth: '220px' }}
                      value={selectedWargaStep5}
                      onChange={(e) => {
                        const wId = e.target.value;
                        setSelectedWargaStep5(wId);
                        const saved = stepDataByWarga[wId]?.langkah5;
                        if (saved) {
                          setLangkah5Form({ ...saved });
                        }
                      }}
                    >
                      {availableWargaStep5.length === 0 ? (
                        <option value="">{hadirWargaList.length === 0 ? '-- Belum ada sasaran hadir di Langkah 1 --' : '-- Semua sasaran telah selesai di Langkah 5 --'}</option>
                      ) : (
                        availableWargaStep5.map(w => (
                          <option key={w.id} value={String(w.id)}>{w.nama} - NIK {String(w.nik).slice(-4)}</option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              {examinationMode === 'per-step' && hadirWargaList.length === 0 && (
                <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span className="small">
                    Belum ada sasaran <strong>{currentCategory.label}</strong> yang ditandai <strong>Datang</strong> pada Langkah 1. Silakan cari dan tandai kehadiran di <strong>Langkah 1 (Presensi)</strong> terlebih dahulu.
                  </span>
                </div>
              )}

              <div className="row g-4 mb-4">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small mb-1">Topik Penyuluhan*</label>
                  <textarea 
                    rows="3" 
                    className="form-control form-control-custom bg-white border-0 py-3" 
                    placeholder="Tulis topik edukasi yang diberikan (Contoh: Gizi Seimbang Balita &amp; Pencegahan Stunting)" 
                    value={examinationMode === 'per-step' ? langkah5Form.topikPenyuluhan : sequentialForm.topikPenyuluhan} 
                    required
                    onChange={(e) => {
                      if (examinationMode === 'per-step') {
                        setLangkah5Form({ ...langkah5Form, topikPenyuluhan: e.target.value });
                      } else {
                        setSequentialForm({ ...sequentialForm, topikPenyuluhan: e.target.value });
                      }
                    }} 
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-dark small mb-1">Rujukan* (Puskesmas / Pustu)</label>
                  <select 
                    className="form-select form-select-custom bg-white border-0 py-3" 
                    value={effectiveRujukan}
                    disabled={isPerluRujukFromSkrining}
                    onChange={(e) => {
                      if (!isPerluRujukFromSkrining) {
                        if (examinationMode === 'per-step') {
                          setLangkah5Form({ ...langkah5Form, statusRujukan: e.target.value });
                        } else {
                          setSequentialForm({ ...sequentialForm, statusRujukan: e.target.value });
                        }
                      }
                    }}
                  >
                    <option value="Tidak Perlu Rujukan">Tidak Perlu Rujukan</option>
                    <option value="Rujuk ke Puskesmas / Pustu">Rujuk Puskesmas atau Pustu (Bila ada indikasi medis hasil pemeriksaan &amp; skrining)</option>
                  </select>
                  <div className="form-text text-muted">Rujuk puskesmas atau pustu bila ada indikasi medis hasil pemeriksaan dan skrining.</div>
                </div>
              </div>

              <div className="d-flex justify-content-end pt-3 gap-2">
                {examinationMode === 'per-step' ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
                    <span>Simpan</span>
                  </button>
                ) : (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={() => setActiveStep(4)}>
                      <ArrowLeft size={15} />
                      <span>Kembali</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                      style={{ backgroundColor: '#2b2e4a' }}
                      onClick={handleTriggerSequentialPreview}
                    >
                      <span>Review &amp; Simpan Pemeriksaan</span>
                      <CheckCircle2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </form>
            );
          })()}

        </div>
      </div>

      {/* MODAL PREVIEW MODE BERTAHAP (SEBELUM DISIMPAN) */}
      {showSequentialPreviewModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white p-3 px-4">
                <div>
                  <span className="badge bg-warning text-dark fw-bold mb-1">PREVIEW HASIL PEMERIKSAAN BERTAHAP (LANGKAH 1 - 5)</span>
                  <h4 className="modal-title fw-bold text-white mb-0">Konfirmasi Simpan Data</h4>
                  <div className="text-white-50 small">Kategori: {currentCategory.label}</div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSequentialPreviewModal(false)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="alert bg-white border border-warning-subtle text-dark rounded-3 p-3 mb-4 shadow-xs">
                  <strong>ⓘ Mohon periksa kembali ringkasan data dari Langkah 1 s/d Langkah 5 sebelum menekan Konfirmasi Simpan.</strong>
                </div>

                {(() => {
                  const previewWarga = activeWargaList.find(w => String(w.id) === String(selectedWargaId)) || {};

                  // PUMA evaluation
                  const pumaEvaluation = (() => {
                    const jk = sequentialForm.pumaJk;
                    const usia = sequentialForm.pumaUsia;
                    const rokok = sequentialForm.pumaMerokok;
                    const np = sequentialForm.pumaNapasPendek;
                    const dh = sequentialForm.pumaDahak;
                    const bt = sequentialForm.pumaBatukFlu;

                    const isAny = [jk, usia, rokok, np, dh, bt].some(v => v !== '' && v !== undefined && v !== null);
                    if (!isAny) {
                      return { score: '-', text: 'Belum Diisi', isRisiko: false };
                    }
                    const score = (jk !== '' && jk !== undefined ? Number(jk) : 0) +
                      (usia !== '' && usia !== undefined ? Number(usia) : 0) +
                      (rokok !== '' && rokok !== undefined ? Number(rokok) : 0) +
                      (np === 'Ya' || np === 1 ? 1 : 0) +
                      (dh === 'Ya' || dh === 1 ? 1 : 0) +
                      (bt === 'Ya' || bt === 1 ? 1 : 0);
                    const isRisiko = score >= 6;
                    return {
                      score,
                      text: `${score} (${isRisiko ? 'Risiko Tinggi PPOK' : 'Risiko Rendah PPOK'})`,
                      isRisiko
                    };
                  })();

                  // Kolesterol evaluation
                  const kolesterolEval = (() => {
                    if (!sequentialForm.kolesterol) return '-';
                    const kNum = parseInt(sequentialForm.kolesterol);
                    if (isNaN(kNum)) return sequentialForm.kolesterol;
                    if (kNum >= 200) return `${kNum} mg/dL (Tinggi ≥ 200 mg/dL)`;
                    return `${kNum} mg/dL (Normal < 200 mg/dL)`;
                  })();

                  // Gula Darah evaluation
                  const gulaDarahEval = (() => {
                    if (!sequentialForm.gulaDarah) return '-';
                    const gNum = parseInt(sequentialForm.gulaDarah);
                    if (isNaN(gNum)) return sequentialForm.gulaDarah;
                    if (gNum >= 200) return `${gNum} mg/dL (Diabetisi ≥ 200 mg/dL)`;
                    if (gNum >= 140) return `${gNum} mg/dL (Prediabetisi 140–199 mg/dL)`;
                    return `${gNum} mg/dL (Normal < 140 mg/dL)`;
                  })();

                  // TBC Gejala for Dewasa & Lansia
                  const tbcAdultGejala = (() => {
                    const batukVal = sequentialForm.batukBesarTbc || sequentialForm.batukTbc;
                    const flags = [
                      batukVal === 'Ya' ? 'Batuk Berdahak ≥ 2 Minggu' : null,
                      sequentialForm.nafsuMakanTbc === 'Ya' ? 'Nafsu Makan Turun' : null,
                      sequentialForm.bbMenurunTbc === 'Ya' ? 'BB Menurun' : null,
                      sequentialForm.lemahLesuTbc === 'Ya' ? 'Lemah / Lesu' : null,
                      sequentialForm.berkeringatMalamTbc === 'Ya' ? 'Keringat Malam' : null,
                      sequentialForm.batukDarahTbc === 'Ya' ? 'Batuk Berdarah' : null,
                      sequentialForm.sesakNafasTbc === 'Ya' ? 'Sesak Nafas' : null
                    ].filter(Boolean);

                    const isFilled = [
                      batukVal, sequentialForm.nafsuMakanTbc, sequentialForm.bbMenurunTbc,
                      sequentialForm.lemahLesuTbc, sequentialForm.berkeringatMalamTbc, sequentialForm.batukDarahTbc, sequentialForm.sesakNafasTbc
                    ].some(v => v !== '' && v !== undefined);

                    if (flags.length > 0) return { text: `Berisiko TBC (${flags.join(', ')})`, isRisiko: true };
                    if (isFilled) return { text: 'Tidak Ada Gejala TBC (Normal)', isRisiko: false };
                    return { text: 'Tidak Ada Gejala TBC (Normal)', isRisiko: false };
                  })();

                  // TBC Gejala for Children & Maternal
                  const tbcChildGejala = (() => {
                    const batukVal = sequentialForm.batukTbc || sequentialForm.batukBesarTbc;
                    const flags = [
                      batukVal === 'Ya' ? 'Batuk ≥ 2 mgg' : null,
                      sequentialForm.demamTbc === 'Ya' ? 'Demam > 2 mgg' : null,
                      sequentialForm.bbTurunTbc === 'Ya' ? 'BB Turun / Tidak Naik' : null,
                      sequentialForm.kontakTbc === 'Ya' ? 'Kontak Pasien TBC' : null,
                      sequentialForm.lesuTbc === 'Ya' ? 'Lesu / Lemas' : null
                    ].filter(Boolean);

                    const isFilled = [
                      batukVal, sequentialForm.demamTbc, sequentialForm.bbTurunTbc,
                      sequentialForm.kontakTbc, sequentialForm.lesuTbc
                    ].some(v => v !== '' && v !== undefined);

                    if (flags.length > 0) return { text: `Berisiko TBC (${flags.join(', ')})`, isRisiko: true };
                    if (isFilled) return { text: 'Tidak Ada Gejala TBC (Normal)', isRisiko: false };
                    return { text: 'Tidak Ada Gejala TBC (Normal)', isRisiko: false };
                  })();

                  return (
                    <>
                      {/* LANGKAH 1 */}
                      <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                          <h6 className="fw-bold text-primary mb-0">Langkah 1: Identitas Sasaran</h6>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">Pendaftaran</span>
                        </div>
                        <div className="row g-2 small">
                          <div className="col-6"><strong>NIK:</strong> {sequentialForm.nik || previewWarga.nik || '(Diisi Otomatis)'}</div>
                          <div className="col-6"><strong>Nama Lengkap:</strong> {sequentialForm.nama || previewWarga.nama || '(Nama Baru)'}</div>
                          <div className="col-6"><strong>Tanggal Lahir:</strong> {sequentialForm.tglLahir || previewWarga.tglLahir || '-'}</div>
                          <div className="col-6"><strong>Jenis Kelamin:</strong> {['bumil', 'nifas'].includes(activeSubmenu) ? 'Perempuan' : (sequentialForm.gender || previewWarga.gender || 'Laki-laki')}</div>
                          
                          {['dewasa', 'lansia'].includes(activeSubmenu) && (
                            <>
                              <div className="col-6"><strong>Pekerjaan:</strong> {sequentialForm.pekerjaan || previewWarga.pekerjaan || (activeSubmenu === 'lansia' ? 'Pensiunan' : 'Karyawan Swasta')}</div>
                              <div className="col-6"><strong>Status Pernikahan:</strong> {sequentialForm.statusPernikahan || previewWarga.statusPernikahan || 'Menikah'}</div>
                            </>
                          )}

                          {['usekrem-6-14', 'usekrem-15-18'].includes(activeSubmenu) && (
                            <>
                              <div className="col-6"><strong>Sekolah:</strong> {sequentialForm.sekolah || previewWarga.sekolah || (activeSubmenu === 'usekrem-6-14' ? 'SDN Sukamaju 02' : 'SMAN 1 Sukamaju')}</div>
                              <div className="col-6"><strong>Kelas:</strong> {sequentialForm.kelas || previewWarga.kelas || (activeSubmenu === 'usekrem-6-14' ? 'Kelas 5' : 'Kelas 11')}</div>
                            </>
                          )}

                          {activeSubmenu === 'bumil' && (
                            <div className="col-12 mt-2 pt-1 border-top">
                              <strong>Usia Kehamilan:</strong>{' '}
                              <span className="badge bg-light text-dark border fw-medium px-2 py-1 ms-1">
                                {sequentialForm.usiaKehamilan || '-'}
                              </span>
                            </div>
                          )}
                          {activeSubmenu === 'nifas' && (
                            <div className="col-12 mt-2 pt-1 border-top">
                              <strong>Waktu Kunjungan:</strong>{' '}
                              <span className="badge bg-light text-dark border fw-medium px-2 py-1 ms-1">
                                {sequentialForm.waktuKunjunganNifas || '-'}
                              </span>
                            </div>
                          )}
                          {['bayi-0-11', 'balita-12-59', 'apras'].includes(activeSubmenu) && (
                            <div className="col-12 mt-2 pt-1 border-top">
                              <strong>{activeSubmenu === 'bayi-0-11' ? 'Umur Bayi:' : activeSubmenu === 'balita-12-59' ? 'Umur Balita:' : 'Umur Apras:'}</strong>{' '}
                              <span className="badge bg-light text-dark border fw-medium px-2 py-1 ms-1">
                                {(activeSubmenu === 'bayi-0-11' ? sequentialForm.usiaBayi : activeSubmenu === 'balita-12-59' ? sequentialForm.usiaBalita : sequentialForm.usiaApras) || '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 2 */}
                      <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                          <h6 className="fw-bold text-primary mb-0">Langkah 2: Skrining Penimbangan &amp; Pengukuran</h6>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">Pengukuran Fisik</span>
                        </div>
                        <div className="row g-2 small">
                          <div className="col-6"><strong>Berat Badan (BB):</strong> {sequentialForm.bb ? `${sequentialForm.bb} kg` : '-'}</div>
                          {activeSubmenu !== 'nifas' && (
                            <div className="col-6"><strong>{['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? 'Panjang / Tinggi Badan (PB/TB):' : 'Tinggi Badan (TB):'}</strong> {sequentialForm.tb ? `${sequentialForm.tb} cm` : '-'}</div>
                          )}
                          {['bumil', 'bayi-0-11', 'balita-12-59', 'apras', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                            <div className="col-6"><strong>Lingkar Lengan (LiLA):</strong> {sequentialForm.lila ? `${sequentialForm.lila} cm` : '-'}</div>
                          )}
                          {['usekrem-15-18', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                            <div className="col-6"><strong>Lingkar Perut (LP):</strong> {sequentialForm.lp ? `${sequentialForm.lp} cm` : '-'}</div>
                          )}
                          {['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) && (
                            <div className="col-6"><strong>Lingkar Kepala (LK):</strong> {sequentialForm.lk ? `${sequentialForm.lk} cm` : '-'}</div>
                          )}
                          {['bumil', 'nifas', 'usekrem-15-18', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                            <div className="col-6"><strong>Tekanan Darah:</strong> {sequentialForm.tensiSistol && sequentialForm.tensiDiastol ? `${sequentialForm.tensiSistol}/${sequentialForm.tensiDiastol} mmHg` : '-'}</div>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 3 */}
                      <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                          <h6 className="fw-bold text-primary mb-0">Langkah 3: Plotting Evaluasi Otomatis</h6>
                          <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold">Hasil Plotting Sistem</span>
                        </div>
                        <div className="row g-2 small">
                          {['dewasa', 'lansia'].includes(activeSubmenu) && (
                            <>
                              <div className="col-6">
                                <strong>Plotting IMT:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.imtDewasaStatus || 'Normal (N)'}</span>{' '}
                                <span className="text-muted">({plottingResult?.imt || '-'} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Plotting LiLA:</strong>{' '}
                                <span className="fw-semibold text-dark">{activeSubmenu === 'lansia' ? (plottingResult?.lilaLansiaStatus || 'Normal (≥ 21.5 cm)') : (plottingResult?.lilaDewasaStatus || 'Normal (≥ 23.5 cm)')}</span>
                              </div>
                              <div className="col-6">
                                <strong>Tekanan Darah:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.tensiStatus || 'Normal (< 130/85 mmHg)'}</span>
                              </div>
                              <div className="col-6">
                                <strong>Lingkar Perut:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.lpPlottingStatus || 'Normal (≤ 90 cm)'}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'usekrem-15-18' && (
                            <>
                              <div className="col-6">
                                <strong>Plotting IMT:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.imtUsekremStatus || 'Gizi Baik (GB)'}</span>{' '}
                                <span className="text-muted">({plottingResult?.imt || '-'} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Tekanan Darah:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.tensiRemajaStatus || 'Normal (N)'}</span>
                              </div>
                              <div className="col-6">
                                <strong>Lingkar Perut:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.lpPlottingStatus || 'Normal'}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'usekrem-6-14' && (
                            <div className="col-12">
                              <strong>Plotting IMT/U:</strong>{' '}
                              <span className="fw-semibold text-dark">{plottingResult?.imtUsekremStatus || 'Gizi Baik (GB)'}</span>{' '}
                              <span className="text-muted">({plottingResult?.imt || '-'} kg/m²)</span>
                            </div>
                          )}

                          {activeSubmenu === 'apras' && (
                            <>
                              <div className="col-6">
                                <strong>Plotting IMT/U:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.imtAprasStatus || 'Gizi Baik (-2 SD s.d +1 SD)'}</span>{' '}
                                <span className="text-muted">({plottingResult?.imt || '-'} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Plotting LiLA:</strong>{' '}
                                <span className="fw-semibold text-dark">{plottingResult?.lilaAprasStatus || 'Gizi Normal (≥ 14 cm)'}</span>
                              </div>
                            </>
                          )}

                          {['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) && (
                            <>
                              <div className="col-6"><strong>BB / Usia (BB/U):</strong> <span className="fw-semibold text-dark">{plottingResult?.bbUStatus || 'BB Normal / Naik (N)'}</span></div>
                              <div className="col-6"><strong>PB/TB / Usia:</strong> <span className="fw-semibold text-dark">{plottingResult?.pbUStatus || 'Normal (N)'}</span></div>
                              <div className="col-6"><strong>BB / PB (TB):</strong> <span className="fw-semibold text-dark">{plottingResult?.bbPbStatus || 'Gizi Baik (-2SD s.d +1SD)'}</span></div>
                              <div className="col-6"><strong>Lingkar Kepala:</strong> <span className="fw-semibold text-dark">{plottingResult?.lkStatus || 'Normal (-2SD s.d +2SD)'}</span></div>
                              <div className="col-12"><strong>Status LiLA:</strong> <span className="fw-semibold text-dark">{plottingResult?.lilaBayiStatus || 'Gizi Normal (> 12.5 cm)'}</span></div>
                            </>
                          )}

                          {activeSubmenu === 'bumil' && (
                            <>
                              <div className="col-6"><strong>Status IMT:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtStatus || 'Normal'}</span> <span className="text-muted">({plottingResult?.imt || '-'} kg/m²)</span></div>
                              <div className="col-6"><strong>Status LiLA:</strong> <span className="fw-semibold text-dark">{plottingResult?.lilaStatus || 'Normal'}</span></div>
                              <div className="col-12"><strong>Tekanan Darah:</strong> <span className="fw-semibold text-dark">{plottingResult?.tensiStatus || 'Normal'}</span></div>
                            </>
                          )}

                          {activeSubmenu === 'nifas' && (
                            <>
                              <div className="col-6"><strong>Status IMT:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtStatus || 'Normal'}</span> <span className="text-muted">({plottingResult?.imt || '-'} kg/m²)</span></div>
                              <div className="col-6"><strong>Tekanan Darah:</strong> <span className="fw-semibold text-dark">{plottingResult?.tensiStatus || 'Normal'}</span></div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 4 */}
                      <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                          <h6 className="fw-bold text-primary mb-0">Langkah 4: Skrining PTM, TBC &amp; Kesehatan</h6>
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold">Pelayanan Kesehatan</span>
                        </div>
                        <div className="row g-2 small">
                          {activeSubmenu === 'lansia' && (
                            <>
                              <div className="col-6"><strong>Kadar Gula Darah:</strong> {gulaDarahEval}</div>
                              <div className="col-6"><strong>Kadar Kolesterol:</strong> {kolesterolEval}</div>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcAdultGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcAdultGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>Tes Penglihatan (Hitung Jari):</strong> Kanan: {sequentialForm.mataKanan || 'Normal'} • Kiri: {sequentialForm.mataKiri || 'Normal'}</div>
                              <div className="col-6"><strong>Tes Pendengaran (Berbisik):</strong> Kanan: {sequentialForm.telingaKanan || 'Normal'} • Kiri: {sequentialForm.telingaKiri || 'Normal'}</div>
                              <div className="col-12 pt-2 border-top">
                                <strong>C.1 Skrining PPOK (PUMA):</strong>{' '}
                                <span className={`badge ${pumaEvaluation.isRisiko ? 'bg-danger text-white' : 'bg-success-subtle text-success'} px-2 py-1 ms-1`}>
                                  {pumaEvaluation.text}
                                </span>
                              </div>
                              <div className="col-12">
                                <strong>C.2 Skor AKS (Barthel):</strong>{' '}
                                <span className="fw-semibold text-dark">{currentAks.total}/20 ({currentAks.kategori})</span>
                              </div>
                              <div className="col-12">
                                <strong>C.3 Status SKILAS:</strong>{' '}
                                <span className="fw-semibold text-dark">{currentSkilas.statusText}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'dewasa' && (
                            <>
                              <div className="col-6"><strong>Kadar Gula Darah:</strong> {gulaDarahEval}</div>
                              <div className="col-6"><strong>Kadar Kolesterol:</strong> {kolesterolEval}</div>
                              <div className="col-6"><strong>Alat Kontrasepsi:</strong> {sequentialForm.alatKontrasepsi || '-'}</div>
                              <div className="col-6">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcAdultGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcAdultGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>Tes Penglihatan (Hitung Jari):</strong> Kanan: {sequentialForm.mataKanan || 'Normal'} • Kiri: {sequentialForm.mataKiri || 'Normal'}</div>
                              <div className="col-6"><strong>Tes Pendengaran (Berbisik):</strong> Kanan: {sequentialForm.telingaKanan || 'Normal'} • Kiri: {sequentialForm.telingaKiri || 'Normal'}</div>
                              <div className="col-12 pt-2 border-top">
                                <strong>C.1 Skrining PPOK (PUMA):</strong>{' '}
                                <span className={`badge ${pumaEvaluation.isRisiko ? 'bg-danger text-white' : 'bg-success-subtle text-success'} px-2 py-1 ms-1`}>
                                  {pumaEvaluation.text}
                                </span>
                              </div>
                            </>
                          )}

                          {['usekrem-6-14', 'usekrem-15-18'].includes(activeSubmenu) && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>Skrining Penglihatan:</strong> Kanan: {sequentialForm.mataKanan || 'Normal'} • Kiri: {sequentialForm.mataKiri || 'Normal'}</div>
                              <div className="col-6"><strong>Skrining Pendengaran:</strong> Kanan: {sequentialForm.telingaKanan || 'Normal'} • Kiri: {sequentialForm.telingaKiri || 'Normal'}</div>
                              <div className="col-6"><strong>Skrining Jiwa:</strong> {sequentialForm.skriningJiwa || 'Sudah / Normal'}</div>
                              <div className="col-6"><strong>Skrining Anemia / Periksa Hb:</strong> {sequentialForm.periksaHb || 'Sudah / Normal'}</div>
                            </>
                          )}

                          {activeSubmenu === 'apras' && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>Pemberian Obat Cacing:</strong> {sequentialForm.obatCacing || 'Ya'}</div>
                            </>
                          )}

                          {activeSubmenu === 'balita-12-59' && (
                            <>
                              <div className="col-6">
                                <strong>Tempat Imunisasi:</strong> {sequentialForm.tempatImunisasi || 'Posyandu'}
                                {sequentialForm.namaRsImunisasi ? ` (${sequentialForm.namaRsImunisasi})` : ''}
                              </div>
                              <div className="col-6">
                                <strong>Jenis Imunisasi:</strong> {sequentialForm.jenisImunisasi === 'Lainnya' ? (sequentialForm.jenisImunisasiLainnya || 'Lainnya') : (sequentialForm.jenisImunisasi || '-')}
                              </div>
                              <div className="col-6"><strong>Pemberian MP-ASI:</strong> {sequentialForm.mpAsi || 'Ya'}</div>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>PMT Pemulihan:</strong> {sequentialForm.pmtPemulihan || 'Tidak'} (Dihabiskan: {sequentialForm.pmtHabis || 'Tidak'})</div>
                              <div className="col-6"><strong>Kapsul Vitamin A:</strong> {sequentialForm.vitA || 'Ya'}</div>
                              <div className="col-6"><strong>Obat Cacing:</strong> {sequentialForm.obatCacing || 'Ya'}</div>
                              <div className="col-6"><strong>Mengikuti Kelas Ibu Balita:</strong> {sequentialForm.ikutKelasBalita || 'Ya'}</div>
                            </>
                          )}

                          {activeSubmenu === 'bayi-0-11' && (
                            <>
                              <div className="col-6">
                                <strong>Tempat Imunisasi:</strong> {sequentialForm.tempatImunisasi || 'Posyandu'}
                                {sequentialForm.namaRsImunisasi ? ` (${sequentialForm.namaRsImunisasi})` : ''}
                              </div>
                              <div className="col-6">
                                <strong>Jenis Imunisasi:</strong> {sequentialForm.jenisImunisasi === 'Lainnya' ? (sequentialForm.jenisImunisasiLainnya || 'Lainnya') : (sequentialForm.jenisImunisasi || '-')}
                              </div>
                              <div className="col-6"><strong>Pemberian ASI Eksklusif:</strong> {sequentialForm.asiEksklusif || 'Ya'}</div>
                              <div className="col-6"><strong>Pemberian MP-ASI:</strong> {sequentialForm.mpAsi || 'Ya'}</div>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>PMT Pemulihan:</strong> {sequentialForm.pmtPemulihan || 'Tidak'} (Dihabiskan: {sequentialForm.pmtHabis || 'Tidak'})</div>
                              <div className="col-6"><strong>Kapsul Vitamin A:</strong> {sequentialForm.vitA || 'Ya'}</div>
                              <div className="col-6"><strong>Mengikuti Kelas Ibu Balita:</strong> {sequentialForm.ikutKelasBalita || 'Ya'}</div>
                            </>
                          )}

                          {activeSubmenu === 'bumil' && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>Pemberian TTD:</strong> {sequentialForm.pemberianTtd || sequentialForm.jumlahTtd || 'Sudah'}</div>
                              <div className="col-6"><strong>Rutin Minum TTD:</strong> {sequentialForm.rutinTtd || 'Ya'}</div>
                              <div className="col-6"><strong>Komposisi MT Bumil:</strong> {sequentialForm.komposisiMtBumil || 'Biskuit PMT Pangan Lokal'}</div>
                              <div className="col-6"><strong>Rutin Konsumsi MT:</strong> {sequentialForm.rutinMtBumil || 'Ya'}</div>
                            </>
                          )}

                          {activeSubmenu === 'nifas' && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong>{' '}
                                <span className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark'}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6"><strong>Pemberian Vitamin A:</strong> {sequentialForm.jumlahVitA || 'Sudah'}</div>
                              <div className="col-6"><strong>Rutin Minum Vitamin A:</strong> {sequentialForm.rutinVitA || 'Ya'}</div>
                              <div className="col-6"><strong>Pelayanan KB Pasca Persalinan:</strong> {sequentialForm.kbPascaPersalinan || 'Ya'}</div>
                              <div className="col-6"><strong>Menjaga Kondisi ASI / Menyusui:</strong> {sequentialForm.menyusui || 'Ya'}</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 5 */}
                      <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                          <h6 className="fw-bold text-primary mb-0">Langkah 5: Penyuluhan &amp; Rujukan</h6>
                          <span className="badge bg-secondary-subtle text-secondary border fw-semibold">Tindak Lanjut</span>
                        </div>
                        <div className="row g-2 small">
                          <div className="col-12"><strong>Topik Penyuluhan:</strong> {sequentialForm.topikPenyuluhan || `Penyuluhan Gizi & Kesehatan ${currentCategory.label}`}</div>
                          <div className="col-6"><strong>Mengikuti Kelas Posyandu:</strong> {sequentialForm.mengikutiKelas || 'Ya'}</div>
                          <div className="col-6"><strong>Status Rujukan:</strong> <span className="badge bg-light text-dark border fw-semibold">{sequentialForm.statusRujukan || 'Tidak Perlu Rujukan'}</span></div>
                        </div>
                      </div>
                    </>
                  );
                })()}

              </div>

              <div className="modal-footer bg-white p-3 px-4 justify-content-between">
                <button type="button" className="btn btn-outline-secondary btn-sm px-4 rounded-3" onClick={() => setShowSequentialPreviewModal(false)}>
                  &larr; Edit Data
                </button>
                <button type="button" className="btn btn-dark-custom btn-sm px-4 rounded-3 text-white fw-bold" style={{ backgroundColor: '#2b2e4a' }} onClick={handleSaveSequentialAll}>
                  ✓ Konfirmasi &amp; Simpan Pemeriksaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
