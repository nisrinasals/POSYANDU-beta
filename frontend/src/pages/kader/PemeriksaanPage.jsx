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
import Langkah3PlottingView from '../../components/pemeriksaan/Langkah3PlottingView';
import ImunisasiTableHistory from '../../components/pemeriksaan/ImunisasiTableHistory';
import { pemeriksaanService, kunjunganService, imunisasiService } from '../../services';
import { formatIndoDate } from '../../utils/dataMappers';
import { 
  STANDAR_PLOT, 
  evaluasiIMT, 
  evaluasiTekananDarah, 
  evaluasiLila, 
  evaluasiLingkarPerut, 
  evaluasiBBU, 
  evaluasiTBU, 
  evaluasiIMTU, 
  evaluateWeightForSize, 
  kalkulasiAntropometriAnak, 
  evaluasiPemeriksaan, 
  hitungUsiaBulan 
} from '../../utils/plotHelper';

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

const STORAGE_KEY = 'POSYANDU_PEMERIKSAAN_SESSION';

const loadSavedSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved pemeriksaan session', e);
  }
  return null;
};

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
  const { showSuccess, showWarning } = useNotification();
  const currentCategory = kategoriPemeriksaan.find(c => c.id === activeSubmenu) || kategoriPemeriksaan[0];

  const initialSession = useMemo(() => loadSavedSession(), []);

  // 1. Mode State: 'per-step' (Pilih Langkah) vs 'sequential' (Bertahap)
  const [examinationMode, setExaminationMode] = useState(() => initialSession?.examinationMode || 'per-step');

  // 2. Active Step State (1, 2, 3, 4, 5)
  const [activeStep, setActiveStep] = useState(() => initialSession?.activeStep || 1);

  // 3. Preview Modal State for Mode Bertahap
  const [showSequentialPreviewModal, setShowSequentialPreviewModal] = useState(false);

  // Fallback template citizens for categories
  const fallbackTemplates = useMemo(() => ({
    'bumil': [{ id: 2, idSasaran: 'PSY-002', nama: 'Ny. Siti Rahmawati', nik: '32010101010002', tglLahir: '1996-06-14', gender: 'Perempuan', tb: '158', bb: '58.5', statusPemeriksaan: 'Sudah', alamat: 'Jl. Mawar No. 04, RW 04', tglSkriningTahunanTerakhir: '12-05-2025' }],
    'nifas': [{ id: 6, idSasaran: 'PSY-006', nama: 'Ny. Nurul Fadilah', nik: '32010101010006', tglLahir: '1998-02-10', gender: 'Perempuan', tb: '155', bb: '54.0', statusPemeriksaan: 'Sudah', alamat: 'Jl. Dahlia No. 19, RW 04', tglSkriningTahunanTerakhir: '18-08-2025' }],
    'bayi-0-11': [{ id: 8, idSasaran: 'PSY-008', nama: 'Rayyan Al-Ghifari', nik: '32010101010008', tglLahir: '2026-02-10', gender: 'Laki-laki', tb: '68', bb: '7.8', statusPemeriksaan: 'Sudah', alamat: 'Jl. Melati No. 08, RW 04', usia: '6 Bulan' }],
    'balita-12-59': [{ id: 1, idSasaran: 'PSY-001', nama: 'Andini Putri', nik: '32010101010201', tglLahir: '2023-05-12', gender: 'Perempuan', tb: '94.5', bb: '13.2', statusPemeriksaan: 'Sudah', alamat: 'Jl. Melati No. 12, RW 04', usia: '24 Bulan' }],
    'apras': [{ id: 9, idSasaran: 'PSY-009', nama: 'Sinta Maharani', nik: '32010101010009', tglLahir: '2021-01-15', gender: 'Perempuan', tb: '102', bb: '16.0', statusPemeriksaan: 'Sudah', alamat: 'Jl. Kenanga No. 09, RW 04', usia: '60 Bulan' }],
    'usekrem-6-14': [{ id: 7, idSasaran: 'PSY-007', nama: 'Bima Pratama', nik: '32010101010007', tglLahir: '2015-06-07', gender: 'Laki-laki', tb: '138', bb: '34.5', statusPemeriksaan: 'Sudah', alamat: 'Jl. Flamboyan No. 07, RW 04', tglSkriningTahunanTerakhir: '10-09-2025' }],
    'usekrem-15-18': [{ id: 3, idSasaran: 'PSY-003', nama: 'Farhan Anugrah', nik: '32010101010003', tglLahir: '2008-09-15', gender: 'Laki-laki', tb: '165', bb: '55.0', statusPemeriksaan: 'Sudah', alamat: 'Jl. Anggrek No. 03, RW 04', tglSkriningTahunanTerakhir: '15-09-2025' }],
    'dewasa': [{ id: 4, idSasaran: 'PSY-004', nama: 'Bpk. Daffa Arif', nik: '32010101010004', tglLahir: '1988-11-21', gender: 'Laki-laki', tb: '170', bb: '72.0', statusPemeriksaan: 'Sudah', alamat: 'Jl. Kamboja No. 04, RW 04', tglSkriningTahunanTerakhir: '20-11-2025' }],
    'lansia': [{ id: 5, idSasaran: 'PSY-005', nama: 'Bpk. Soepardi', nik: '32010101010005', tglLahir: '1955-08-06', gender: 'Laki-laki', tb: '162', bb: '60.0', statusPemeriksaan: 'Sudah', alamat: 'Jl. Dahlia No. 05, RW 04', tglSkriningTahunanTerakhir: '14-08-2025' }]
  }), []);

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
  const [selectedWargaId, setSelectedWargaId] = useState(() => initialSession?.selectedWargaId || '');

  // Tracking step completion and data per citizen
  // Format: { [wargaId]: { step1: true, step2: bool, step3: bool, step4: bool, step5: bool } }
  const [completedSteps, setCompletedSteps] = useState(() => initialSession?.completedSteps || {});
  const [stepDataByWarga, setStepDataByWarga] = useState(() => initialSession?.stepDataByWarga || {});

  // Presensi Kehadiran Langkah 1 (Status Kehadiran Hari Ini: { [wargaId]: true/false })
  const [kehadiranWarga, setKehadiranWarga] = useState(() => initialSession?.kehadiranWarga || {});

  // Keterangan Waktu Kunjungan Langkah 1 (Presensi): Minggu (Bumil) / Bulan (Nifas, Bayi, Balita, Apras)
  // Format: { [wargaId]: string }
  const [waktuKunjunganPresensi, setWaktuKunjunganPresensi] = useState(() => initialSession?.waktuKunjunganPresensi || {});

  // State pencarian warga di Langkah 1 Presensi
  const [searchWargaQuery, setSearchWargaQuery] = useState('');

  // Sesuai permintaan: Sasaran yang sudah ditandai 'Datang' TETAP STAY NEMPEL di Langkah 1
  // sampai seluruh tahapan 5 langkah selesai.
  const filteredSasaranLangkah1 = useMemo(() => {
    const q = searchWargaQuery.trim().toLowerCase();
    
    // Sasaran dalam kategori aktif yang sudah ditandai presensi (Datang / Tidak Datang) dan BELUM selesai Langkah 5
    const activePresentWarga = activeWargaList.filter(w => {
      const wId = String(w.id);
      const isPresent = kehadiranWarga[wId] !== undefined;
      const isDone = completedSteps[wId]?.step5;
      return isPresent && !isDone;
    });

    if (q) {
      const searchMatches = activeWargaList.filter(w => 
        (w.nama && w.nama.toLowerCase().includes(q)) || 
        (w.nik && String(w.nik).includes(q)) ||
        (w.alamat && w.alamat.toLowerCase().includes(q))
      );
      const combined = [...activePresentWarga];
      searchMatches.forEach(item => {
        if (!combined.some(c => String(c.id) === String(item.id))) {
          combined.push(item);
        }
      });
      return combined;
    }
    
    // Jika search query kosong, tampilkan seluruh sasaran yang sudah ditandai presensi (Datang)
    return activePresentWarga;
  }, [activeWargaList, searchWargaQuery, kehadiranWarga, completedSteps]);

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
  const [selectedWargaStep2, setSelectedWargaStep2] = useState(() => initialSession?.selectedWargaStep2 || '');
  const [selectedWargaStep3, setSelectedWargaStep3] = useState(() => initialSession?.selectedWargaStep3 || '');
  const [selectedWargaStep4, setSelectedWargaStep4] = useState(() => initialSession?.selectedWargaStep4 || '');
  const [selectedWargaStep5, setSelectedWargaStep5] = useState(() => initialSession?.selectedWargaStep5 || '');

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
    setSearchWargaQuery('');
    if (hadirWargaList.length > 0) {
      if (!hadirWargaList.some(w => String(w.id) === String(selectedWargaId))) {
        setSelectedWargaId(String(hadirWargaList[0].id));
      }
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

  const isPutriStep4 = useMemo(() => {
    if (!activeCitizenStep4) return true;
    const g = String(activeCitizenStep4.gender || activeCitizenStep4.jenis_kelamin || activeCitizenStep4.jenisKelamin || '').toLowerCase();
    return g.startsWith('p') || g.includes('perempuan') || g.includes('wanita');
  }, [activeCitizenStep4]);

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
    tempatImunisasi: 'Posyandu',
    namaRsImunisasi: '',
    jenisImunisasi: '',
    jenisImunisasiLainnya: '',
    imunisasiList: [],
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
    tempatImunisasi: 'Posyandu',
    namaRsImunisasi: '',
    jenisImunisasi: '',
    jenisImunisasiLainnya: '',
    imunisasiList: [],
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

  // Autosave examination session state to localStorage (after all states are initialized)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        examinationMode,
        activeStep,
        selectedWargaId,
        completedSteps,
        stepDataByWarga,
        kehadiranWarga,
        waktuKunjunganPresensi,
        selectedWargaStep2,
        selectedWargaStep3,
        selectedWargaStep4,
        selectedWargaStep5,
        sequentialForm,
        langkah1Form,
        langkah2Form,
        langkah4Form,
        langkah5Form
      }));
    } catch (e) {
      console.error('Failed to sync pemeriksaan session to localStorage', e);
    }
  }, [
    examinationMode,
    activeStep,
    selectedWargaId,
    completedSteps,
    stepDataByWarga,
    kehadiranWarga,
    waktuKunjunganPresensi,
    selectedWargaStep2,
    selectedWargaStep3,
    selectedWargaStep4,
    selectedWargaStep5,
    sequentialForm,
    langkah1Form,
    langkah2Form,
    langkah4Form,
    langkah5Form
  ]);

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
      tempatImunisasi: l4.tempatImunisasi || 'Posyandu',
      namaRsImunisasi: l4.namaRsImunisasi || '',
      jenisImunisasi: l4.jenisImunisasi || '',
      jenisImunisasiLainnya: l4.jenisImunisasiLainnya || '',
      imunisasiList: l4.imunisasiList || [],
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
      tempatImunisasi: l4.tempatImunisasi || 'Posyandu',
      namaRsImunisasi: l4.namaRsImunisasi || '',
      jenisImunisasi: l4.jenisImunisasi || '',
      jenisImunisasiLainnya: l4.jenisImunisasiLainnya || '',
      imunisasiList: l4.imunisasiList || [],
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
      if (submenu === 'bumil' && (!data?.usiaKehamilan || !String(data.usiaKehamilan).trim() || data?.usiaKehamilan === '-- Pilih --')) {
        missing.push('Usia Kehamilan');
      }
      if (submenu === 'nifas' && (!data?.waktuKunjunganNifas || !String(data.waktuKunjunganNifas).trim() || data?.waktuKunjunganNifas === '-- Pilih --')) {
        missing.push('Waktu Kunjungan Nifas/Menyusui');
      }
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
    }

    const targetId = String(targetWarga.id);

    const l1 = {
      nik: formData.nik || targetWarga.nik,
      nama: formData.nama || targetWarga.nama,
      tglLahir: formData.tglLahir || targetWarga.tglLahir,
      gender: formData.gender || targetWarga.gender,
      namaIbu: targetWarga.namaIbu || targetWarga.keteranganIbuSuami || '',
      pekerjaan: formData.pekerjaan || targetWarga.pekerjaan || '',
      statusPernikahan: formData.statusPernikahan || targetWarga.statusPernikahan || '',
      sekolah: formData.sekolah || targetWarga.sekolah || '',
      kelas: formData.kelas || targetWarga.kelas || '',
      alamat: targetWarga.alamat || 'Jl. Melati RW 04',
      checklistKia: formData.checklistKia || 'Ya',
      usiaKehamilan: formData.usiaKehamilan || (activeSubmenu === 'bumil' ? '32-36 minggu' : ''),
      waktuKunjunganNifas: formData.waktuKunjunganNifas || (activeSubmenu === 'nifas' ? 'Bulan 2' : ''),
      usiaBayi: formData.usiaBayi || '',
      usiaBalita: formData.usiaBalita || '',
      usiaApras: formData.usiaApras || ''
    };

    const l2 = {
      bb: formData.bb || targetWarga.bb || '',
      tb: formData.tb || targetWarga.tb || '',
      lila: formData.lila || '',
      lk: formData.lk || '',
      lp: formData.lp || '',
      tensiSistol: formData.tensiSistol || '',
      tensiDiastol: formData.tensiDiastol || '',
      tensi: formData.tensiSistol && formData.tensiDiastol ? `${formData.tensiSistol}/${formData.tensiDiastol}` : '',
      gulaDarah: formData.gulaDarah || '',
      kolesterol: formData.kolesterol || ''
    };

    const pr = plottingResult || {};
    const l3 = { ...pr };

    const l4 = {
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
    };

    const l5 = {
      topikPenyuluhan: formData.topikPenyuluhan || `Edukasi & Konseling Kesehatan ${currentCategory.label}`,
      statusRujukan: formData.statusRujukan || 'Tidak Perlu Rujukan',
      mengikutiKelas: formData.mengikutiKelas || 'Ya'
    };

    const combinedDetailSkrining = {
      ...l1,
      ...l2,
      ...l4,
      ...l5,
      asiEksklusif: l4.asiEksklusif || '',
      mpAsi: l4.mpAsi || '',
      pmtPemulihan: l4.pmtPemulihan || '',
      pmtHabis: l4.pmtHabis || '',
      vitA: l4.vitA || '',
      obatCacing: l4.obatCacing || '',
      ikutKelasBalita: l4.ikutKelasBalita || '',
      tempatImunisasi: l4.tempatImunisasi || '',
      namaRsImunisasi: l4.namaRsImunisasi || '',
      jenisImunisasi: l4.jenisImunisasi || '',
      jenisImunisasiLainnya: l4.jenisImunisasiLainnya || '',
      imunisasiList: l4.imunisasiList || [],
      pemberianTtd: l4.pemberianTtd || l4.jumlahTtd || '',
      jumlahTtd: l4.jumlahTtd || l4.pemberianTtd || '',
      rutinTtd: l4.rutinTtd || '',
      komposisiMtBumil: l4.komposisiMtBumil || '',
      rutinMtBumil: l4.rutinMtBumil || '',
      pemberianVitA: l4.pemberianVitA || l4.jumlahVitA || '',
      jumlahVitA: l4.jumlahVitA || l4.pemberianVitA || '',
      rutinVitA: l4.rutinVitA || '',
      kbPascaPersalinan: l4.kbPascaPersalinan || '',
      menyusui: l4.menyusui || '',
      alatKontrasepsi: l4.alatKontrasepsi || '',
      gulaDarah: l2.gulaDarah || l4.gulaDarah || '',
      kolesterol: l2.kolesterol || l4.kolesterol || '',
      mataKanan: l4.mataKanan || '',
      mataKiri: l4.mataKiri || '',
      telingaKanan: l4.telingaKanan || '',
      telingaKiri: l4.telingaKiri || '',
      skriningJiwa: l4.skriningJiwa || '',
      periksaHb: l4.periksaHb || '',
      pumaScore: l4.pumaScore || pumaEvaluation?.score || '',
      pumaRisiko: l4.pumaRisiko || pumaEvaluation?.isRisiko || false,
      aksScore: l4.aksScore || currentAks?.total || '',
      aksKategori: l4.aksKategori || currentAks?.kategori || '',
      skilasStatus: l4.skilasStatus || currentSkilas?.statusText || '',
      topikPenyuluhan: l5.topikPenyuluhan || '',
      statusRujukan: l5.statusRujukan || 'Tidak Perlu Rujukan'
    };

    const pelKesObj = {
      is_asi_eksklusif: l4.asiEksklusif === 'Ya',
      is_mp_asi: l4.mpAsi === 'Ya',
      is_vit_a_given: l4.vitA === 'Ya' || l4.vitA === 'Sudah' || Boolean(l4.jumlahVitA),
      is_obat_cacing_given: l4.obatCacing === 'Ya' || l4.obatCacing === 'Sudah',
      is_pmt_lokal_pemulihan: l4.pmtPemulihan === 'Ya' || l4.pmtPemulihan === 'Diberikan',
      is_ikut_kelas_balita: l4.ikutKelasBalita === 'Ya',
      tempat_imunisasi: l4.tempatImunisasi || '',
      jenis_imunisasi: l4.jenisImunisasi || l4.imunisasi || '',
      jumlah_ttd_given: parseInt(l4.jumlahTtd || l4.pemberianTtd, 10) || undefined,
      is_rutin_ttd: l4.rutinTtd === 'Ya',
      komposisi_mt_kek: l4.komposisiMtBumil || '',
      is_rutin_mt_kek: l4.rutinMtBumil === 'Ya',
      is_kb_pasca_persalinan: l4.kbPascaPersalinan === 'Ya',
      is_menyusui: l4.menyusui === 'Ya'
    };

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
      tglPeriksa: todayFormatted,
      statusPemeriksaan: 'Sudah',
      status: 'Sudah',
      petugasPemeriksa: 'Dzakiyah Al Zahrani (Kader)',
      langkah1: l1,
      langkah2: l2,
      langkah3: l3,
      langkah4: l4,
      langkah5: l5,
      detail_skrining: combinedDetailSkrining,
      pelayanan_kesehatan: pelKesObj,
      rawDetail: combinedDetailSkrining,
      ...combinedDetailSkrining
    };

    try {
      await pemeriksaanService.createPemeriksaan({
        warga_id: targetWarga.id,
        sesi_id: 1,
        tanggal: new Date().toISOString().split('T')[0],
        kategori_sasaran: activeSubmenu,
        bb_kg: parseFloat(formData.bb) || undefined,
        tb_cm: parseFloat(formData.tb) || undefined,
        lingkar_kepala_cm: parseFloat(formData.lk) || undefined,
        lila_cm: parseFloat(formData.lila) || undefined,
        lingkar_perut_cm: parseFloat(formData.lp) || undefined,
        td_sistole: parseInt(formData.tensiSistol, 10) || undefined,
        td_diastole: parseInt(formData.tensiDiastol, 10) || undefined,
        kadar_gula: parseInt(formData.gulaDarah, 10) || undefined,
        kadar_kolesterol: parseInt(formData.kolesterol, 10) || undefined,
        topik_penyuluhan: formData.topikPenyuluhan || `Edukasi & Konseling Kesehatan ${currentCategory.label}`,
        is_perlu_rujukan: formData.statusRujukan?.includes('Rujuk') || false,
        detail_skrining: combinedDetailSkrining
      });
    } catch (err) {
      console.info('Backend create pemeriksaan notice:', err);
    }

    if (setGlobalPemeriksaanData) {
      setGlobalPemeriksaanData(prev => ({
        ...prev,
        [targetWarga.id]: examinationRecord,
        [String(targetWarga.id)]: examinationRecord,
        ...(targetWarga.nik ? { [targetWarga.nik]: examinationRecord } : {}),
        [`exam_${targetWarga.id}`]: examinationRecord
      }));
    }

    // Update existing citizen's status to 'Sudah' and update BB/TB and attach exam
    if (setGlobalSasaranList) {
      setGlobalSasaranList(prev => prev.map(s => {
        if (String(s.id) === String(targetWarga.id) || (targetWarga.nik && s.nik === targetWarga.nik)) {
          return {
            ...s,
            statusPemeriksaan: 'Sudah',
            status: 'Sudah',
            tglPeriksa: todayFormatted,
            bb: formData.bb || s.bb,
            tb: formData.tb || s.tb,
            exam: examinationRecord,
            pemeriksaan: examinationRecord,
            ...(formData.isSkriningTahunan ? { tglSkriningTahunanTerakhir: todayFormatted } : {})
          };
        }
        return s;
      }));
    }

    // Tandai seluruh 5 langkah selesai dan hapus dari antrian presensi aktif
    setCompletedSteps(prev => ({
      ...prev,
      [String(targetWarga.id)]: { step1: true, step2: true, step3: true, step4: true, step5: true }
    }));

    setKehadiranWarga(prev => {
      const copy = { ...prev };
      delete copy[String(targetWarga.id)];
      return copy;
    });

    if (isFromSequential) {
      setSequentialForm({
        isSkriningTahunan: false,
        nik: '', nama: '', tglLahir: '', gender: '', pekerjaan: '', statusPernikahan: '',
        sekolah: '', kelas: '', usiaKehamilan: '', waktuKunjunganNifas: '', usiaBayi: '',
        usiaBalita: '', usiaApras: '', checklistKia: '', tb: '', bb: '', lila: '', lk: '',
        lp: '', tensiSistol: '', tensiDiastol: '', gulaDarah: '', batukTbc: '', demamTbc: '',
        bbTurunTbc: '', kontakTbc: '', lesuTbc: '', jumlahTtd: '', pemberianTtd: '', rutinTtd: '',
        komposisiMtBumil: '', rutinMtBumil: '', jumlahVitA: '', rutinVitA: '', menyusui: '',
        kbPascaPersalinan: '', tempatImunisasi: '', namaRsImunisasi: '', jenisImunisasi: '',
        jenisImunisasiLainnya: '', asiEksklusif: '', mpAsi: '', pmtPemulihan: '', pmtHabis: '',
        vitA: '', obatCacing: '', ikutKelasBalita: '', perkembanganSdidtk: '', imunisasi: '',
        skriningPtm: '', mataKanan: '', mataKiri: '', telingaKanan: '', telingaKiri: '',
        skriningJiwa: '', periksaHb: '', batukBesarTbc: '', nafsuMakanTbc: '', bbMenurunTbc: '',
        lemahLesuTbc: '', berkeringatMalamTbc: '', batukDarahTbc: '', sesakNafasTbc: '',
        kolesterol: '', alatKontrasepsi: '', pumaJk: '', pumaUsia: '', pumaMerokok: '',
        pumaNapasPendek: '', pumaDahak: '', pumaBatukFlu: '', jiwaBulan: 'September',
        jiwaQ1: '', jiwaQ2: '', jiwaQ3: '', jiwaQ4: '', aksBab: '', aksBak: '', aksCuciMuka: '',
        aksWc: '', aksMakan: '', aksPindah: '', aksJalan: '', aksPakaian: '', aksTangga: '',
        aksMandi: '', skilasOrientasi: '', skilasUlangKata: '', skilasTesKursi: '',
        skilasBbTurun: '', skilasNafsuMakan: '', skilasLilaKurang: '', skilasMasalahMata: '',
        skilasTesLihat: '', skilasTesBisik: '', skilasPerasaanSedih: '', skilasHilangMinat: '',
        skilasImunisasiCovid: '', topikPenyuluhan: '', statusRujukan: 'Tidak Perlu Rujukan', mengikutiKelas: 'Ya'
      });
      setSelectedWargaId('');
      setShowSequentialPreviewModal(false);
      setActiveStep(1);
    }

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
    const hadirEntries = Object.entries(kehadiranWarga).filter(([id, isHadir]) => isHadir && activeWargaList.some(w => String(w.id) === String(id)));
    const tidakHadirEntries = Object.entries(kehadiranWarga).filter(([id, isHadir]) => isHadir === false && activeWargaList.some(w => String(w.id) === String(id)));

    if (hadirEntries.length === 0 && tidakHadirEntries.length === 0) {
      showWarning(
        "Presensi Belum Dipilih",
        "Silakan tentukan status kehadiran sasaran (Datang / Tidak Datang) terlebih dahulu sebelum menyimpan."
      );
      return;
    }

    if (hadirEntries.length === 0) {
      showWarning(
        "Tidak Ada Sasaran Hadir",
        "Tidak ada sasaran yang ditandai 'Datang'. Pastikan ada sasaran yang hadir untuk dapat melanjutkan pemeriksaan."
      );
      return;
    }

    // Validasi Usia Kehamilan (Bumil) / Waktu Kunjungan (Nifas) untuk setiap sasaran yang hadir
    for (const [id] of hadirEntries) {
      const w = activeWargaList.find(item => String(item.id) === String(id));
      const waktuVal = waktuKunjunganPresensi[id];

      if (activeSubmenu === 'bumil') {
        if (!waktuVal || !String(waktuVal).trim() || waktuVal === '-- Pilih --') {
          showWarning(
            "Usia Kehamilan Belum Dipilih",
            `Silakan pilih Usia Kehamilan / Bulan untuk sasaran "${w?.nama || 'Ibu Hamil'}" yang hadir terlebih dahulu sebelum menyimpan presensi.`
          );
          return;
        }
      }

      if (activeSubmenu === 'nifas') {
        if (!waktuVal || !String(waktuVal).trim() || waktuVal === '-- Pilih --') {
          showWarning(
            "Waktu Kunjungan Belum Dipilih",
            `Silakan pilih Waktu Kunjungan (Masa Nifas/Menyusui) untuk sasaran "${w?.nama || 'Ibu Nifas'}" yang hadir terlebih dahulu sebelum menyimpan presensi.`
          );
          return;
        }
      }
    }

    // Tandai step1 selesai untuk semua warga yang hadir
    const newCompleted = { ...completedSteps };
    const hadirCount = hadirEntries.length;
    
    hadirEntries.forEach(([id]) => {
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
            usiaKehamilan: waktuKunjunganPresensi[id] || '',
            waktuKunjunganNifas: waktuKunjunganPresensi[id] || ''
          }
        }
      }));
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

    // Simpan riwayat imunisasi baru ke backend jika ada vaksin yang diberikan hari ini
    const imuList = langkah4Form.imunisasiList || [];
    if (imuList.length > 0 && targetId) {
      imuList.forEach(async (im) => {
        try {
          await imunisasiService.createImunisasi({
            warga_id: parseInt(targetId, 10),
            jenis_imunisasi: typeof im === 'string' ? im : im.name,
            tanggal_imunisasi: (typeof im === 'object' && im.tanggal) ? im.tanggal : new Date().toISOString().split('T')[0]
          });
        } catch (err) {
          console.info('Backend create imunisasi notice:', err);
        }
      });
    }

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
        usiaKehamilan: l1.usiaKehamilan || waktuKunjunganPresensi[targetId] || '',
        waktuKunjunganNifas: l1.waktuKunjunganNifas || waktuKunjunganPresensi[targetId] || ''
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
      await pemeriksaanService.createPemeriksaan({
        warga_id: parseInt(targetId, 10) || undefined,
        sesi_id: 1,
        tanggal: new Date().toISOString().split('T')[0],
        kategori_sasaran: activeSubmenu,
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

    // Warga selesai mengisi step 5 -> seluruh 5 langkah selesai
    setCompletedSteps(prev => ({
      ...prev,
      [targetId]: { ...(prev[targetId] || {}), step1: true, step2: true, step3: true, step4: true, step5: true }
    }));

    // Hapus dari antrian presensi aktif Langkah 1 agar sasaran selesai tidak tertahan
    setKehadiranWarga(prev => {
      const copy = { ...prev };
      delete copy[String(targetId)];
      return copy;
    });

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
  // CALCULATOR PLOTTING DYNAMIC FOR ALL CATEGORIES (EXACT PERMENKES WHO STANDARDS)
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

    const lk = parseFloat(sourceData.lk || 0);
    const lila = parseFloat(sourceData.lila || 0);
    const lp = parseFloat(sourceData.lp || 0);
    const sistol = parseInt(sourceData.tensiSistol || 0);
    const diastol = parseInt(sourceData.tensiDiastol || 0);
    const gender = sourceData.gender || 'Perempuan';
    const tglLahir = sourceData.tglLahir;
    const usiaBulan = hitungUsiaBulan(tglLahir);

    // Call evaluasiPemeriksaan from plotHelper
    const evalResult = evaluasiPemeriksaan({
      kategori_sasaran: activeSubmenu,
      bb_kg: bb,
      tb_cm: tb,
      td_sistole: sistol,
      td_diastole: diastol,
      lila_cm: lila,
      lingkar_perut_cm: lp,
      jenis_kelamin: gender,
      tanggal_lahir: tglLahir
    });

    // Individual category evaluators
    const evalImtBumil = evaluasiIMT(bb, tb, 'bumil');
    const evalLilaBumil = evaluasiLila(lila, 'bumil');
    const evalTensiBumil = evaluasiTekananDarah(sistol, diastol, 'bumil');

    const evalImtBusui = evaluasiIMT(bb, tb, 'busui');
    const evalTensiBusui = evaluasiTekananDarah(sistol, diastol, 'busui');

    const evalImtDewasa = evaluasiIMT(bb, tb, 'dewasa');
    const evalLpDewasa = evaluasiLingkarPerut(lp, gender);
    const evalLilaDewasa = evaluasiLila(lila, 'dewasa');
    const evalTensiDewasa = evaluasiTekananDarah(sistol, diastol, 'dewasa');

    const evalImtLansia = evaluasiIMT(bb, tb, 'lansia');
    const evalLpLansia = evaluasiLingkarPerut(lp, gender);
    const evalLilaLansia = evaluasiLila(lila, 'lansia');
    const evalTensiLansia = evaluasiTekananDarah(sistol, diastol, 'lansia');

    const evalImtUsekrem1518 = evaluasiIMTU(bb, tb, usiaBulan, gender);
    const evalTensiUsekrem1518 = evaluasiTekananDarah(sistol, diastol, 'uskrem_15_18');

    const evalImtUsekrem614 = evaluasiIMTU(bb, tb, usiaBulan, gender);
    const evalImtApras = evaluasiIMTU(bb, tb, usiaBulan, gender);
    const evalLilaApras = evaluasiLila(lila, 'apras');

    const evalBBU = evaluasiBBU(bb, usiaBulan, gender);
    const evalTBU = evaluasiTBU(tb, usiaBulan, gender);
    const evalBBTB = evaluateWeightForSize(bb, tb, usiaBulan, gender);

    // LK standard (-2 SD s.d +2 SD)
    let lkStatus = 'Normal (-2 SD s.d +2 SD)';
    let lkCode = 'N';
    let isLkMerah = false;
    if (lk > 0) {
      if (lk > 49) {
        lkStatus = 'Melebihi normal (> +2 SD)';
        lkCode = 'L';
        isLkMerah = true;
      } else if (lk < 44) {
        lkStatus = 'Kurang dari normal (< -2 SD)';
        lkCode = 'K';
        isLkMerah = true;
      } else {
        lkStatus = 'Normal (-2 SD s.d +2 SD)';
        lkCode = 'N';
        isLkMerah = false;
      }
    }

    const evalLilaBayi = evaluasiLila(lila, activeSubmenu === 'bayi-0-11' ? 'bayi' : 'balita');

    const tbM = tb / 100;
    const imtVal = tbM > 0 ? (bb / (tbM * tbM)).toFixed(1) : '-';

    return { 
      hasBb,
      hasTb,
      bb,
      tb,
      lk,
      lila,
      lp,
      sistol,
      diastol,
      imt: imtVal,
      usiaBulan,
      gender,
      evalResult,
      // Bumil
      evalImtBumil,
      evalLilaBumil,
      evalTensiBumil,
      // Busui
      evalImtBusui,
      evalTensiBusui,
      // Dewasa & Lansia
      evalImtDewasa,
      evalLpDewasa,
      evalLilaDewasa,
      evalTensiDewasa,
      evalImtLansia,
      evalLpLansia,
      evalLilaLansia,
      evalTensiLansia,
      // Remaja
      evalImtUsekrem1518,
      evalTensiUsekrem1518,
      evalImtUsekrem614,
      // Apras
      evalImtApras,
      evalLilaApras,
      // Bayi & Balita
      evalBBU,
      evalTBU,
      evalBBTB,
      lkStatus,
      lkCode,
      isLkMerah,
      evalLilaBayi
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
                      <input 
                        type="number" 
                        className="form-control form-control-custom bg-white border-0 py-3 text-center"
                        style={{ width: '85px', flex: 'none' }}
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
                      <span className="fw-bold text-muted px-1" style={{ fontSize: '1.4rem', lineHeight: '1', userSelect: 'none' }}>/</span>
                      <input 
                        type="number" 
                        className="form-control form-control-custom bg-white border-0 py-3 text-center"
                        style={{ width: '85px', flex: 'none' }}
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
                      <span className="fw-semibold text-muted ms-1" style={{ fontSize: '0.95rem' }}>mm/Hg</span>
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
              ) : (
                <Langkah3PlottingView 
                  activeSubmenu={activeSubmenu} 
                  plottingResult={plottingResult} 
                />
              )}

              {/* Interactive WHO / Permenkes Growth Curve Plotter for Children (Diletakkan di bawah hasil plotting) */}
              {['bayi-0-11', 'balita-12-59', 'apras', 'usekrem-6-14', 'usekrem-15-18'].includes(activeSubmenu) && plottingResult && activeSourceDataL3 && (
                <div className="mt-4 mb-3">
                  <GrowthChartPlotter
                    gender={activeSourceDataL3.gender}
                    umurBulan={childAgeMonths}
                    ageInMonths={childAgeMonths}
                    bb={activeSourceDataL3.bb}
                    weight={activeSourceDataL3.bb}
                    tb={activeSourceDataL3.tb}
                    height={activeSourceDataL3.tb}
                    activeCategory={activeSubmenu}
                    category={activeSubmenu}
                    namaAnak={activeSourceDataL3.nama || 'Anak'}
                    childName={activeSourceDataL3.nama || 'Anak'}
                    riwayatPemeriksaan={activeSourceDataL3.riwayatPemeriksaan || activeSourceDataL3.growth_history || activeSourceDataL3.historis || []}
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

                  {/* C. Pemeriksaan Tahunan Remaja */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">1x / Tahun</span>
                          <h5 className="fw-bold text-dark mb-0">C. Pemeriksaan Tahunan Remaja</h5>
                        </div>
                        <p className="text-muted small mb-0">
                          {isPutriStep4 
                            ? 'Skrining Kesehatan Jiwa & Pemeriksaan Anemia (Hb) berkala tahunan.'
                            : 'Skrining Kesehatan Jiwa berkala tahunan.'}
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
                        <div className={isPutriStep4 ? "col-md-6" : "col-12"}>
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

                        {isPutriStep4 && (
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
                        )}
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

                  {/* C. Pemeriksaan Tahunan Remaja */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">1x / Tahun</span>
                          <h5 className="fw-bold text-dark mb-0">C. Pemeriksaan Tahunan Remaja</h5>
                        </div>
                        <p className="text-muted small mb-0">
                          {isPutriStep4 
                            ? 'Skrining Kesehatan Jiwa & Pemeriksaan Anemia (Hb) berkala tahunan.'
                            : 'Skrining Kesehatan Jiwa berkala tahunan.'}
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
                        <div className={isPutriStep4 ? "col-md-6" : "col-12"}>
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

                        {isPutriStep4 && (
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
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : ['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? (
                <>
                  {/* 1. Imunisasi (Tabel Matriks & Riwayat Buku KIA Kemenkes RI) */}
                  {(() => {
                    const currentWargaId = examinationMode === 'per-step' ? selectedWargaStep4 : selectedWargaId;
                    const targetChild = activeWargaList.find(w => String(w.id) === String(currentWargaId));
                    const childAge = targetChild ? getAgeInMonths(targetChild) : 0;
                    const currentImunisasiList = examinationMode === 'per-step' 
                      ? (langkah4Form.imunisasiList || []) 
                      : (sequentialForm.imunisasiList || []);

                    return (
                      <ImunisasiTableHistory
                        wargaId={currentWargaId}
                        childAgeMonths={childAge}
                        tempatImunisasi={examinationMode === 'per-step' ? (langkah4Form.tempatImunisasi || 'Posyandu') : (sequentialForm.tempatImunisasi || 'Posyandu')}
                        namaRsImunisasi={examinationMode === 'per-step' ? (langkah4Form.namaRsImunisasi || '') : (sequentialForm.namaRsImunisasi || '')}
                        onChangeTempat={(val) => {
                          if (examinationMode === 'per-step') {
                            setLangkah4Form({ ...langkah4Form, tempatImunisasi: val });
                          } else {
                            setSequentialForm({ ...sequentialForm, tempatImunisasi: val });
                          }
                        }}
                        onChangeNamaRs={(val) => {
                          if (examinationMode === 'per-step') {
                            setLangkah4Form({ ...langkah4Form, namaRsImunisasi: val });
                          } else {
                            setSequentialForm({ ...sequentialForm, namaRsImunisasi: val });
                          }
                        }}
                        selectedImunisasiList={currentImunisasiList}
                        onUpdateImunisasiList={(updatedList) => {
                          const strNames = updatedList.map(item => (typeof item === 'string' ? item : item.name)).join(', ');
                          if (examinationMode === 'per-step') {
                            setLangkah4Form({ 
                              ...langkah4Form, 
                              imunisasiList: updatedList,
                              jenisImunisasi: strNames
                            });
                          } else {
                            setSequentialForm({ 
                              ...sequentialForm, 
                              imunisasiList: updatedList,
                              jenisImunisasi: strNames
                            });
                          }
                        }}
                      />
                    );
                  })()}

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
                              <span className="small fw-semibold text-primary mb-0">&bull; Apakah PMT lokal yang diberikan dihabiskan?</span>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060, backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
              <div 
                className="modal-header text-white p-3.5 px-4 d-flex align-items-center justify-content-between"
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-3 bg-white bg-opacity-10 d-flex align-items-center justify-content-center">
                    <CheckCircle2 size={22} className="text-warning" />
                  </div>
                  <div>
                    <div className="mb-0.5">
                      <span className="badge bg-warning text-dark fw-bold px-2.5 py-0.5 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        PREVIEW LENGKAP
                      </span>
                    </div>
                    <h6 className="modal-title fw-bold text-white mb-0">Ringkasan &amp; Konfirmasi Pemeriksaan</h6>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  aria-label="Close"
                  onClick={() => setShowSequentialPreviewModal(false)}
                ></button>
              </div>

              <div className="modal-body p-3.5 p-md-4 bg-light" style={{ maxHeight: '75vh', overflowY: 'auto' }}>

                {(() => {
                  const previewWarga = activeWargaList.find(w => String(w.id) === String(selectedWargaId)) || {};
                  const isPutriPreview = (() => {
                    const g = String(sequentialForm.gender || previewWarga.gender || previewWarga.jenis_kelamin || '').toLowerCase();
                    return g.startsWith('p') || g.includes('perempuan') || g.includes('wanita');
                  })();

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
                      return { score: '-', text: '-', isRisiko: false };
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
                    ].some(v => v !== '' && v !== undefined && v !== null);

                    if (flags.length > 0) return { text: `Berisiko TBC (${flags.join(', ')})`, isRisiko: true };
                    if (isFilled) return { text: 'Tidak Ada Gejala TBC (Normal)', isRisiko: false };
                    return { text: '-', isRisiko: false };
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
                    ].some(v => v !== '' && v !== undefined && v !== null);

                    if (flags.length > 0) return { text: `Berisiko TBC (${flags.join(', ')})`, isRisiko: true };
                    if (isFilled) return { text: 'Tidak Ada Gejala TBC (Normal)', isRisiko: false };
                    return { text: '-', isRisiko: false };
                  })();

                  // Measurement presence flags for Langkah 3 plotting
                  const hasBbTb = Boolean(sequentialForm.bb && sequentialForm.tb);
                  const hasLila = Boolean(sequentialForm.lila);
                  const hasTensi = Boolean(sequentialForm.tensiSistol && sequentialForm.tensiDiastol);
                  const hasLp = Boolean(sequentialForm.lp);
                  const hasLk = Boolean(sequentialForm.lk);

                  // Helper render Imunisasi
                  const renderImunisasi = () => {
                    if (Array.isArray(sequentialForm.imunisasiList) && sequentialForm.imunisasiList.length > 0) {
                      return sequentialForm.imunisasiList.join(', ');
                    }
                    if (sequentialForm.jenisImunisasi) {
                      return sequentialForm.jenisImunisasi === 'Lainnya'
                        ? (sequentialForm.jenisImunisasiLainnya || 'Lainnya')
                        : sequentialForm.jenisImunisasi;
                    }
                    return '-';
                  };

                  const citizenName = sequentialForm.nama || previewWarga.nama || '-';
                  const citizenNik = sequentialForm.nik || previewWarga.nik || '-';
                  const citizenGender = ['bumil', 'nifas'].includes(activeSubmenu) ? 'Perempuan' : (sequentialForm.gender || previewWarga.gender || (previewWarga.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki') || '-');
                  const citizenTglLahir = formatIndoDate(sequentialForm.tglLahir || previewWarga.tglLahir);

                  return (
                    <div className="d-flex flex-column gap-3">
                      {/* LANGKAH 1: IDENTITAS SASARAN */}
                      <div className="card border-0 shadow-sm rounded-4 bg-white p-3.5 p-md-4">
                        <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>1</span>
                            <h6 className="fw-bold text-dark mb-0">Identitas &amp; Pendaftaran Sasaran</h6>
                          </div>
                          <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                            Langkah 1
                          </span>
                        </div>

                        <div className="row g-3">
                          <div className="col-12 col-md-6 col-lg-3">
                            <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                              <div className="text-muted small mb-1 fw-medium">NIK</div>
                              <div className="fw-bold text-dark text-break">{citizenNik}</div>
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-lg-3">
                            <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                              <div className="text-muted small mb-1 fw-medium">Nama Lengkap</div>
                              <div className="fw-bold text-dark text-break">{citizenName}</div>
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-lg-3">
                            <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                              <div className="text-muted small mb-1 fw-medium">Tanggal Lahir</div>
                              <div className="fw-bold text-dark">{citizenTglLahir}</div>
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-lg-3">
                            <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                              <div className="text-muted small mb-1 fw-medium">Jenis Kelamin</div>
                              <div className="fw-bold text-dark">{citizenGender}</div>
                            </div>
                          </div>

                          {['dewasa', 'lansia'].includes(activeSubmenu) && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Pekerjaan</div>
                                  <div className="fw-bold text-dark">{sequentialForm.pekerjaan || previewWarga.pekerjaan || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Status Pernikahan</div>
                                  <div className="fw-bold text-dark">{sequentialForm.statusPernikahan || previewWarga.statusPernikahan || '-'}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {['usekrem-6-14', 'usekrem-15-18'].includes(activeSubmenu) && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Nama Sekolah</div>
                                  <div className="fw-bold text-dark">{sequentialForm.sekolah || previewWarga.sekolah || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Kelas</div>
                                  <div className="fw-bold text-dark">{sequentialForm.kelas || previewWarga.kelas || '-'}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'bumil' && (
                            <div className="col-12">
                              <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-center justify-content-between">
                                <span className="text-dark fw-medium">Usia Kehamilan</span>
                                <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill fs-6 fw-bold">
                                  {sequentialForm.usiaKehamilan || '-'}
                                </span>
                              </div>
                            </div>
                          )}

                          {activeSubmenu === 'nifas' && (
                            <div className="col-12">
                              <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-center justify-content-between">
                                <span className="text-dark fw-medium">Waktu Kunjungan Nifas</span>
                                <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill fs-6 fw-bold">
                                  {sequentialForm.waktuKunjunganNifas || '-'}
                                </span>
                              </div>
                            </div>
                          )}

                          {['bayi-0-11', 'balita-12-59', 'apras'].includes(activeSubmenu) && (
                            <div className="col-12">
                              <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-center justify-content-between">
                                <span className="text-dark fw-medium">
                                  {activeSubmenu === 'bayi-0-11' ? 'Umur Bayi' : activeSubmenu === 'balita-12-59' ? 'Umur Balita' : 'Umur Apras'}
                                </span>
                                <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill fs-6 fw-bold">
                                  {(activeSubmenu === 'bayi-0-11' ? sequentialForm.usiaBayi : activeSubmenu === 'balita-12-59' ? sequentialForm.usiaBalita : sequentialForm.usiaApras) || '-'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 2: PENGUKURAN FISIK */}
                      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-info text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>2</span>
                            <h6 className="fw-bold text-dark mb-0">Skrining Penimbangan &amp; Pengukuran Fisik</h6>
                          </div>
                          <span className="badge bg-info-subtle text-info-emphasis rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                            Langkah 2
                          </span>
                        </div>

                        <div className="row g-3">
                          <div className="col-6 col-md-4 col-lg-3">
                            <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                              <div className="text-muted small mb-1 fw-medium">Berat Badan (BB)</div>
                              <div className="fs-5 fw-bold text-dark">
                                {sequentialForm.bb ? `${sequentialForm.bb}` : '-'} <span className="fs-6 fw-normal text-muted">{sequentialForm.bb ? 'kg' : ''}</span>
                              </div>
                            </div>
                          </div>

                          {activeSubmenu !== 'nifas' && (
                            <div className="col-6 col-md-4 col-lg-3">
                              <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                <div className="text-muted small mb-1 fw-medium">
                                  {['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) ? 'Panjang / TB' : 'Tinggi Badan (TB)'}
                                </div>
                                <div className="fs-5 fw-bold text-dark">
                                  {sequentialForm.tb ? `${sequentialForm.tb}` : '-'} <span className="fs-6 fw-normal text-muted">{sequentialForm.tb ? 'cm' : ''}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {['bumil', 'bayi-0-11', 'balita-12-59', 'apras', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                            <div className="col-6 col-md-4 col-lg-3">
                              <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                <div className="text-muted small mb-1 fw-medium">Lingkar Lengan (LiLA)</div>
                                <div className="fs-5 fw-bold text-dark">
                                  {sequentialForm.lila ? `${sequentialForm.lila}` : '-'} <span className="fs-6 fw-normal text-muted">{sequentialForm.lila ? 'cm' : ''}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {['usekrem-15-18', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                            <div className="col-6 col-md-4 col-lg-3">
                              <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                <div className="text-muted small mb-1 fw-medium">Lingkar Perut (LP)</div>
                                <div className="fs-5 fw-bold text-dark">
                                  {sequentialForm.lp ? `${sequentialForm.lp}` : '-'} <span className="fs-6 fw-normal text-muted">{sequentialForm.lp ? 'cm' : ''}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) && (
                            <div className="col-6 col-md-4 col-lg-3">
                              <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                <div className="text-muted small mb-1 fw-medium">Lingkar Kepala (LK)</div>
                                <div className="fs-5 fw-bold text-dark">
                                  {sequentialForm.lk ? `${sequentialForm.lk}` : '-'} <span className="fs-6 fw-normal text-muted">{sequentialForm.lk ? 'cm' : ''}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {['bumil', 'nifas', 'usekrem-15-18', 'dewasa', 'lansia'].includes(activeSubmenu) && (
                            <div className="col-12 col-md-4 col-lg-3">
                              <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                <div className="text-muted small mb-1 fw-medium">Tekanan Darah (Tensi)</div>
                                <div className="fs-5 fw-bold text-dark">
                                  {sequentialForm.tensiSistol && sequentialForm.tensiDiastol ? `${sequentialForm.tensiSistol}/${sequentialForm.tensiDiastol}` : '-'} <span className="fs-6 fw-normal text-muted">{sequentialForm.tensiSistol ? 'mmHg' : ''}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 3: HASIL PLOTTING & EVALUASI SISTEM */}
                      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>3</span>
                            <h6 className="fw-bold text-dark mb-0">Hasil Plotting &amp; Evaluasi Otomatis</h6>
                          </div>
                          <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                            Langkah 3
                          </span>
                        </div>

                        <div className="row g-3">
                          {['dewasa', 'lansia'].includes(activeSubmenu) && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                                  <div className="text-muted small mb-1 fw-medium">Plotting IMT (Status Berat Badan)</div>
                                  <div className="mt-1">
                                    {hasBbTb ? (
                                      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                          {plottingResult?.imtDewasaStatus || 'Normal (N)'}
                                        </span>
                                        <span className="text-muted small fw-medium">{plottingResult?.imt || '-'} kg/m²</span>
                                      </div>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                                  <div className="text-muted small mb-1 fw-medium">Plotting LiLA (Lingkar Lengan Atas)</div>
                                  <div className="mt-1">
                                    {hasLila ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {activeSubmenu === 'lansia' ? (plottingResult?.lilaLansiaStatus || 'Normal (≥ 21.5 cm)') : (plottingResult?.lilaDewasaStatus || 'Normal (≥ 23.5 cm)')}
                                      </span>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Tekanan Darah</div>
                                  <div className="mt-1">
                                    {hasTensi ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.tensiStatus || 'Normal (< 130/85 mmHg)'}
                                      </span>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Lingkar Perut</div>
                                  <div className="mt-1">
                                    {hasLp ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.lpPlottingStatus || 'Normal (≤ 90 cm)'}
                                      </span>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'usekrem-15-18' && (
                            <>
                              <div className="col-12 col-md-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting IMT</div>
                                  <div className="mt-1">
                                    {hasBbTb ? (
                                      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                          {plottingResult?.imtUsekremStatus || 'Gizi Baik (GB)'}
                                        </span>
                                        <span className="text-muted small fw-medium">{plottingResult?.imt || '-'} kg/m²</span>
                                      </div>
                                    ) : <span className="text-muted">-</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Tekanan Darah</div>
                                  <div className="mt-1">
                                    {hasTensi ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.tensiRemajaStatus || 'Normal (N)'}
                                      </span>
                                    ) : <span className="text-muted">-</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Lingkar Perut</div>
                                  <div className="mt-1">
                                    {hasLp ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.lpPlottingStatus || 'Normal'}
                                      </span>
                                    ) : <span className="text-muted">-</span>}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'usekrem-6-14' && (
                            <div className="col-12">
                              <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                <div className="text-muted small mb-1 fw-medium">Plotting IMT/U</div>
                                <div className="mt-1">
                                  {hasBbTb ? (
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.imtUsekremStatus || 'Gizi Baik (GB)'}
                                      </span>
                                      <span className="text-muted small fw-medium">{plottingResult?.imt || '-'} kg/m²</span>
                                    </div>
                                  ) : <span className="text-muted">-</span>}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeSubmenu === 'apras' && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting IMT/U</div>
                                  <div className="mt-1">
                                    {hasBbTb ? (
                                      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                          {plottingResult?.imtAprasStatus || 'Gizi Baik (-2 SD s.d +1 SD)'}
                                        </span>
                                        <span className="text-muted small fw-medium">{plottingResult?.imt || '-'} kg/m²</span>
                                      </div>
                                    ) : <span className="text-muted">-</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting LiLA</div>
                                  <div className="mt-1">
                                    {hasLila ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.lilaAprasStatus || 'Gizi Normal (≥ 14 cm)'}
                                      </span>
                                    ) : <span className="text-muted">-</span>}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {['bayi-0-11', 'balita-12-59'].includes(activeSubmenu) && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting Penimbangan (BB/U)</div>
                                  <div className="fw-bold text-dark mt-1">
                                    {sequentialForm.bb ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.evalBBU?.kategori ? `${plottingResult.evalBBU.kategori} (${plottingResult.evalBBU.sd_position || '-2 SD s.d +1 SD'})` : (plottingResult?.bbUStatus || 'BB Normal (-2 SD s.d +1 SD)')}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting {activeSubmenu === 'bayi-0-11' ? 'Panjang Badan (PB/U)' : 'Tinggi Badan (TB/U)'}</div>
                                  <div className="fw-bold text-dark mt-1">
                                    {sequentialForm.tb ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.evalTBU?.kategori ? `${plottingResult.evalTBU.kategori} (${plottingResult.evalTBU.sd_position || '-2 SD s.d +3 SD'})` : (plottingResult?.pbUStatus || 'Normal (-2 SD s.d +3 SD)')}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting {activeSubmenu === 'bayi-0-11' ? 'BB/PB' : 'BB/TB'}</div>
                                  <div className="fw-bold text-dark mt-1">
                                    {hasBbTb ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.evalBBTB?.kategori ? `${plottingResult.evalBBTB.kategori} (${plottingResult.evalBBTB.sd_position || '-2 SD s.d +1 SD'})` : (plottingResult?.bbPbStatus || 'Gizi Baik (-2 SD s.d +1 SD)')}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting Lingkar Kepala</div>
                                  <div className="fw-bold text-dark mt-1">
                                    {hasLk ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.lkStatus || 'Normal (-2 SD s.d +2 SD)'}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting LiLA</div>
                                  <div className="fw-bold text-dark mt-1">
                                    {hasLila ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.evalLilaBayi ? `${plottingResult.evalLilaBayi.kategori} (${plottingResult.evalLilaBayi.batas})` : (plottingResult?.lilaBayiStatus || 'Gizi Normal (≥ 12.5 cm)')}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'bumil' && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting IMT Sebelum Hamil</div>
                                  <div className="mt-1">
                                    {hasBbTb ? (
                                      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                          {plottingResult?.evalImtBumil ? `${plottingResult.evalImtBumil.kategori} (${plottingResult.evalImtBumil.batas})` : (plottingResult?.imtStatus || 'Normal (18.5 - 24.9 kg/m²)')}
                                        </span>
                                        <span className="text-muted small fw-medium">{plottingResult?.imt || '-'} kg/m²</span>
                                      </div>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting LiLA</div>
                                  <div className="mt-1">
                                    {hasLila ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.evalLilaBumil ? `${plottingResult.evalLilaBumil.kategori === 'KEK' ? 'Kurang Energi Kronis / KEK' : 'Normal'} (${plottingResult.evalLilaBumil.batas})` : (plottingResult?.lilaStatus || 'Normal (≥ 23.5 cm)')}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting Tekanan Darah</div>
                                  <div className="mt-1">
                                    {hasTensi ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.evalTensiBumil ? `${plottingResult.evalTensiBumil.kategori === 'Normal' ? 'Normal' : 'Risiko Hipertensi'} (${plottingResult.evalTensiBumil.batas} mmHg)` : (plottingResult?.tensiStatus || 'Normal (< 130/85 mmHg)')}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'nifas' && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting IMT</div>
                                  <div className="mt-1">
                                    {hasBbTb ? (
                                      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                          {plottingResult?.evalImtBusui ? `${plottingResult.evalImtBusui.kategori} (${plottingResult.evalImtBusui.batas})` : (plottingResult?.imtStatus || 'Normal (18.5 - 24.9)')}
                                        </span>
                                        <span className="text-muted small fw-medium">{plottingResult?.imt || '-'} kg/m²</span>
                                      </div>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Plotting Tekanan Darah</div>
                                  <div className="mt-1">
                                    {hasTensi ? (
                                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-3 fw-bold">
                                        {plottingResult?.evalTensiBusui ? `${plottingResult.evalTensiBusui.kategori === 'Normal' ? 'Normal' : 'Risiko Hipertensi'} (${plottingResult.evalTensiBusui.batas} mmHg)` : (plottingResult?.tensiStatus || 'Normal (< 130/85 mmHg)')}
                                      </span>
                                    ) : '-'}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 4: SKRINING & PELAYANAN KESEHATAN */}
                      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-warning text-dark rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>4</span>
                            <h6 className="fw-bold text-dark mb-0">Skrining PTM, TBC &amp; Pelayanan Kesehatan</h6>
                          </div>
                          <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                            Langkah 4
                          </span>
                        </div>

                        <div className="row g-3">
                          {activeSubmenu === 'lansia' && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Kadar Gula Darah</div>
                                  <div className="fw-bold text-dark">{gulaDarahEval}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Kadar Kolesterol</div>
                                  <div className="fw-bold text-dark">{kolesterolEval}</div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcAdultGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcAdultGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Tes Penglihatan (Hitung Jari)</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.mataKanan || sequentialForm.mataKiri ? `Kanan: ${sequentialForm.mataKanan || '-'} • Kiri: ${sequentialForm.mataKiri || '-'}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Tes Pendengaran (Berbisik)</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.telingaKanan || sequentialForm.telingaKiri ? `Kanan: ${sequentialForm.telingaKanan || '-'} • Kiri: ${sequentialForm.telingaKiri || '-'}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">C.1 Skrining PPOK (PUMA)</div>
                                  <div className="mt-1">
                                    {pumaEvaluation.score !== '-' ? (
                                      <span className={`badge ${pumaEvaluation.isRisiko ? 'bg-danger text-white' : 'bg-success-subtle text-success border border-success-subtle'} px-2.5 py-1.5 rounded-3 fw-bold`}>
                                        {pumaEvaluation.text}
                                      </span>
                                    ) : <span className="text-muted">-</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">C.2 Skor AKS (Barthel)</div>
                                  <div className="fw-bold text-dark mt-1">
                                    {currentAks.isAnswered ? `${currentAks.total}/20 (${currentAks.kategori})` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">C.3 Status SKILAS</div>
                                  <div className="fw-bold text-dark mt-1">
                                    {currentSkilas.isAnswered ? currentSkilas.statusText : '-'}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'dewasa' && (
                            <>
                              <div className="col-12 col-md-6 col-lg-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Kadar Gula Darah</div>
                                  <div className="fw-bold text-dark">{gulaDarahEval}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Kadar Kolesterol</div>
                                  <div className="fw-bold text-dark">{kolesterolEval}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-4">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Alat Kontrasepsi</div>
                                  <div className="fw-bold text-dark">{sequentialForm.alatKontrasepsi || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcAdultGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcAdultGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Tes Penglihatan (Hitung Jari)</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.mataKanan || sequentialForm.mataKiri ? `Kanan: ${sequentialForm.mataKanan || '-'} • Kiri: ${sequentialForm.mataKiri || '-'}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Tes Pendengaran (Berbisik)</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.telingaKanan || sequentialForm.telingaKiri ? `Kanan: ${sequentialForm.telingaKanan || '-'} • Kiri: ${sequentialForm.telingaKiri || '-'}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">C.1 Skrining PPOK (PUMA)</div>
                                  <div className="mt-1">
                                    {pumaEvaluation.score !== '-' ? (
                                      <span className={`badge ${pumaEvaluation.isRisiko ? 'bg-danger text-white' : 'bg-success-subtle text-success border border-success-subtle'} px-2.5 py-1.5 rounded-3 fw-bold`}>
                                        {pumaEvaluation.text}
                                      </span>
                                    ) : <span className="text-muted">-</span>}
                                  </div>
                                </div>
                              </div>
                              {currentJiwa.isAnswered && (
                                <div className="col-12 col-md-6">
                                  <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                    <div className="text-muted small mb-1 fw-medium">C.2 Skrining Kesehatan Jiwa (SRQ-20)</div>
                                    <div className="fw-bold text-dark mt-1">
                                      Total Skor: {currentJiwa.total}/12 • <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">{currentJiwa.kategori}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {['usekrem-6-14', 'usekrem-15-18'].includes(activeSubmenu) && (
                            <>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcChildGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Skrining Penglihatan</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.mataKanan || sequentialForm.mataKiri ? `Kanan: ${sequentialForm.mataKanan || '-'} • Kiri: ${sequentialForm.mataKiri || '-'}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Skrining Pendengaran</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.telingaKanan || sequentialForm.telingaKiri ? `Kanan: ${sequentialForm.telingaKanan || '-'} • Kiri: ${sequentialForm.telingaKiri || '-'}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className={isPutriPreview ? "col-12 col-md-6" : "col-12"}>
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Skrining Kesehatan Jiwa</div>
                                  <div className="fw-bold text-dark">{sequentialForm.skriningJiwa || '-'}</div>
                                </div>
                              </div>
                              {isPutriPreview && (
                                <div className="col-12 col-md-6">
                                  <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                    <div className="text-muted small mb-1 fw-medium">Skrining Anemia (Kadar Hb)</div>
                                    <div className="fw-bold text-dark">{sequentialForm.periksaHb ? `${sequentialForm.periksaHb} g/dL` : '-'}</div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {activeSubmenu === 'apras' && (
                            <>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcChildGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Pemberian Obat Cacing</div>
                                  <div className="fw-bold text-dark">{sequentialForm.obatCacing || '-'}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'balita-12-59' && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Tempat Imunisasi</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.tempatImunisasi || '-'}
                                    {sequentialForm.namaRsImunisasi ? ` (${sequentialForm.namaRsImunisasi})` : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Jenis Imunisasi</div>
                                  <div className="fw-bold text-primary">{renderImunisasi()}</div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcChildGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Pemberian MP-ASI</div>
                                  <div className="fw-bold text-dark">{sequentialForm.mpAsi || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">PMT Pemulihan</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.pmtPemulihan ? `${sequentialForm.pmtPemulihan}${sequentialForm.pmtHabis ? ` (Dihabiskan: ${sequentialForm.pmtHabis})` : ''}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Kapsul Vitamin A</div>
                                  <div className="fw-bold text-dark">{sequentialForm.vitA || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Obat Cacing</div>
                                  <div className="fw-bold text-dark">{sequentialForm.obatCacing || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Mengikuti Kelas Ibu Balita</div>
                                  <div className="fw-bold text-dark">{sequentialForm.ikutKelasBalita || '-'}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'bayi-0-11' && (
                            <>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Tempat Imunisasi</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.tempatImunisasi || '-'}
                                    {sequentialForm.namaRsImunisasi ? ` (${sequentialForm.namaRsImunisasi})` : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Jenis Imunisasi</div>
                                  <div className="fw-bold text-primary">{renderImunisasi()}</div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcChildGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">ASI Eksklusif</div>
                                  <div className="fw-bold text-dark">{sequentialForm.asiEksklusif || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Pemberian MP-ASI</div>
                                  <div className="fw-bold text-dark">{sequentialForm.mpAsi || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">PMT Pemulihan</div>
                                  <div className="fw-bold text-dark">
                                    {sequentialForm.pmtPemulihan ? `${sequentialForm.pmtPemulihan}${sequentialForm.pmtHabis ? ` (Dihabiskan: ${sequentialForm.pmtHabis})` : ''}` : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Kapsul Vitamin A</div>
                                  <div className="fw-bold text-dark">{sequentialForm.vitA || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Mengikuti Kelas Ibu Balita</div>
                                  <div className="fw-bold text-dark">{sequentialForm.ikutKelasBalita || '-'}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'bumil' && (
                            <>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcChildGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Pemberian TTD</div>
                                  <div className="fw-bold text-dark">{sequentialForm.pemberianTtd || sequentialForm.jumlahTtd || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Rutin Minum TTD</div>
                                  <div className="fw-bold text-dark">{sequentialForm.rutinTtd || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Komposisi MT Bumil</div>
                                  <div className="fw-bold text-dark">{sequentialForm.komposisiMtBumil || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Rutin Konsumsi MT</div>
                                  <div className="fw-bold text-dark">{sequentialForm.rutinMtBumil || '-'}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeSubmenu === 'nifas' && (
                            <>
                              <div className="col-12">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Evaluasi Gejala TBC</div>
                                  <div className={tbcChildGejala.isRisiko ? 'text-danger fw-bold' : 'text-dark fw-medium'}>
                                    {tbcChildGejala.text}
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Pemberian Vitamin A</div>
                                  <div className="fw-bold text-dark">{sequentialForm.jumlahVitA || sequentialForm.pemberianVitA || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Rutin Minum Vitamin A</div>
                                  <div className="fw-bold text-dark">{sequentialForm.rutinVitA || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Pelayanan KB Pasca Persalinan</div>
                                  <div className="fw-bold text-dark">{sequentialForm.kbPascaPersalinan || '-'}</div>
                                </div>
                              </div>
                              <div className="col-12 col-md-6">
                                <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                                  <div className="text-muted small mb-1 fw-medium">Menjaga Kondisi ASI / Menyusui</div>
                                  <div className="fw-bold text-dark">{sequentialForm.menyusui || '-'}</div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 5: PENYULUHAN & RUJUKAN */}
                      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-secondary text-white rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>5</span>
                            <h6 className="fw-bold text-dark mb-0">Penyuluhan &amp; Rujukan</h6>
                          </div>
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>
                            Langkah 5
                          </span>
                        </div>

                        <div className="row g-3">
                          <div className="col-12 col-lg-8">
                            <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle">
                              <div className="text-muted small mb-1 fw-medium">Topik Penyuluhan &amp; Edukasi</div>
                              <div className="fw-semibold text-dark">
                                {sequentialForm.topikPenyuluhan ? (
                                  <span>{sequentialForm.topikPenyuluhan}</span>
                                ) : (
                                  <span className="text-muted font-monospace">Tidak ada catatan penyuluhan</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-12 col-lg-4">
                            <div className="p-3 rounded-3 bg-light bg-opacity-75 h-100 border border-light-subtle d-flex flex-column justify-content-between">
                              <div className="text-muted small mb-1 fw-medium">Status Rujukan</div>
                              <div className="mt-2">
                                <span className={`badge ${sequentialForm.statusRujukan && sequentialForm.statusRujukan !== 'Tidak Perlu Rujukan' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-3 py-2 rounded-pill fw-bold fs-6`}>
                                  {sequentialForm.statusRujukan || 'Tidak Perlu Rujukan'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>

              <div className="modal-footer bg-white p-3 px-4 justify-content-between border-top">
                <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-medium" onClick={() => setShowSequentialPreviewModal(false)}>
                  &larr; Kembali / Edit Data
                </button>
                <button type="button" className="btn btn-primary px-4 py-2 rounded-3 text-white fw-bold shadow-sm d-flex align-items-center gap-2" onClick={handleSaveSequentialAll}>
                  <CheckCircle2 size={18} />
                  <span>Konfirmasi &amp; Simpan Pemeriksaan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
