<<<<<<< HEAD
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Stethoscope, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Info, RefreshCw, User, Users, Search, UserCheck, UserX, Plus, ChevronRight, Clock, Calendar } from "lucide-react";
import { kategoriPemeriksaan } from "../../data/kategoriPemeriksaan";
import { useNotification } from "../../context/NotificationContext";
import { validateNik, formatNikInput, validateMeasurements } from "../../utils/validators";
import GrowthChartPlotter from "../../components/pemeriksaan/GrowthChartPlotter";
import ImunisasiTableHistory from "../../components/pemeriksaan/ImunisasiTableHistory";
import { mapFlatScreeningToBackend } from "../../utils/screeningPayload";
import { pemeriksaanService, kunjunganService, wargaService, sesiService, imunisasiService } from "../../services";
import { emptyImunisasiRows, mergeImunisasiRows } from "../../data/imunisasi";
import { formatDateId } from "../../utils/dataMappers";

// Hitung umur dalam bulan untuk menentukan apakah layanan ASI eksklusif (0-6 bulan) ditampilkan.
const getAgeInMonths = (warga, referenceDate = new Date()) => {
  if (!warga) return null;

  const rawBirthDate = warga.tglLahir || warga.tanggal_lahir || warga._raw?.tanggal_lahir || warga._raw?.tglLahir;

  if (!rawBirthDate) return null;

  let birth;

  const birthString = String(rawBirthDate).trim();

  // Format YYYY-MM-DD / ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(birthString)) {
    const datePart = birthString.slice(0, 10);
    birth = new Date(`${datePart}T00:00:00Z`);
  }
  // Format DD/MM/YYYY
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthString)) {
    const [day, month, year] = birthString.split("/");
    birth = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  } else {
    birth = new Date(birthString);
  }

  if (Number.isNaN(birth.getTime())) return null;

  const reference = new Date(referenceDate);

  if (Number.isNaN(reference.getTime())) return null;

  let months = (reference.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (reference.getUTCMonth() - birth.getUTCMonth());

  if (reference.getUTCDate() < birth.getUTCDate()) {
    months -= 1;
  }

  return Math.max(0, months);
};

// Opsi Langkah 1: Pemeriksaan Sesuai Umur Kehamilan (Ibu Hamil) - Format Buku KIA
const OPSI_UMUR_KEHAMILAN_BUMIL = ["<4 minggu", "4-8 minggu", "8-12 minggu", "12-16 minggu", "16-20 minggu", "20-24 minggu", "24-28 minggu", "28-32 minggu", "32-36 minggu", "36-40 minggu"];

// Opsi Langkah 1: Waktu ke Posyandu (Ibu Nifas & Menyusui) - Format Buku KIA
const OPSI_WAKTU_NIFAS_MENYUSUI = [
  "< 7 hari",
  "7-28 hari",
  "28-42 hari",
  "Bln 2",
  "Bln 3",
  "Bln 4",
  "Bln 5",
  "Bln 6",
  "Bln 7",
  "Bln 8",
  "Bln 9",
  "Bln 10",
  "Bln 11",
  "Bln 12",
  "Bln 13",
  "Bln 14",
  "Bln 15",
  "Bln 16",
  "Bln 17",
  "Bln 18",
  "Bln 19",
  "Bln 20",
  "Bln 21",
  "Bln 22",
  "Bln 23",
  "Bln 24",
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
  const isAnyAnswered = fields.some((f) => f !== "" && f !== undefined && f !== null);
  if (!isAnyAnswered) {
    return { total: 0, kategori: "Belum Diisi", shortCode: "-", perluRujuk: false, isAnswered: false };
  }
  const bab = form.aksBab !== "" && form.aksBab !== undefined && form.aksBab !== null ? Number(form.aksBab) : 0;
  const bak = form.aksBak !== "" && form.aksBak !== undefined && form.aksBak !== null ? Number(form.aksBak) : 0;
  const cuciMuka = form.aksCuciMuka !== "" && form.aksCuciMuka !== undefined && form.aksCuciMuka !== null ? Number(form.aksCuciMuka) : 0;
  const wc = form.aksWc !== "" && form.aksWc !== undefined && form.aksWc !== null ? Number(form.aksWc) : 0;
  const makan = form.aksMakan !== "" && form.aksMakan !== undefined && form.aksMakan !== null ? Number(form.aksMakan) : 0;
  const pindah = form.aksPindah !== "" && form.aksPindah !== undefined && form.aksPindah !== null ? Number(form.aksPindah) : 0;
  const jalan = form.aksJalan !== "" && form.aksJalan !== undefined && form.aksJalan !== null ? Number(form.aksJalan) : 0;
  const pakaian = form.aksPakaian !== "" && form.aksPakaian !== undefined && form.aksPakaian !== null ? Number(form.aksPakaian) : 0;
  const tangga = form.aksTangga !== "" && form.aksTangga !== undefined && form.aksTangga !== null ? Number(form.aksTangga) : 0;
  const mandi = form.aksMandi !== "" && form.aksMandi !== undefined && form.aksMandi !== null ? Number(form.aksMandi) : 0;
  const total = bab + bak + cuciMuka + wc + makan + pindah + jalan + pakaian + tangga + mandi;

  let kategori = "Mandiri (M = 20)";
  let shortCode = "M";
  let perluRujuk = false;

  if (total === 20) {
    kategori = "Mandiri (M = 20)";
    shortCode = "M";
    perluRujuk = false;
  } else if (total >= 12 && total <= 19) {
    kategori = "Ketergantungan Ringan (R = 12-19)";
    shortCode = "R";
    perluRujuk = true;
  } else if (total >= 9 && total <= 11) {
    kategori = "Ketergantungan Sedang (S = 9-11)";
    shortCode = "S";
    perluRujuk = true;
  } else if (total >= 5 && total <= 8) {
    kategori = "Ketergantungan Berat (B = 5-8)";
    shortCode = "B";
    perluRujuk = true;
  } else {
    kategori = "Ketergantungan Total (T = 0-4)";
    shortCode = "T";
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    perluRujuk = true;
  }

  return { total, kategori, shortCode, perluRujuk, isAnswered: true };
};

// Helper: Evaluasi 6 Domain Instrumen SKILAS
export const evaluateSkilas = (form = {}) => {
  const skilasFields = [
<<<<<<< HEAD
    form.skilasOrientasi,
    form.skilasUlangKata,
    form.skilasMobilisasi,
    form.skilasTesKursi,
    form.skilasBbTurun,
    form.skilasNafsuMakan,
    form.skilasLilaKurang,
    form.skilasMasalahMata,
    form.skilasTesLihat,
    form.skilasTesBisik,
    form.skilasPerasaanSedih,
    form.skilasHilangMinat,
  ];
  const isAnyAnswered = skilasFields.some((f) => f !== "" && f !== undefined && f !== null);
  if (!isAnyAnswered) {
    return { adaRisiko: false, statusText: "Belum Diisi", issues: [], isAnswered: false };
  }
  const issues = [];
  if (form.skilasOrientasi === "Tidak") issues.push("Orientasi waktu & tempat");
  if (form.skilasUlangKata === "Tidak") issues.push("Mengulang 3 kata");
  if (form.skilasMobilisasi === "Ya") issues.push("Keterbatasan mobilisasi");
  if (form.skilasTesKursi === "Tidak") issues.push("Tes berdiri dari kursi");
  if (form.skilasBbTurun === "Ya") issues.push("BB turun >3kg / baju longgar");
  if (form.skilasNafsuMakan === "Ya") issues.push("Hilang nafsu makan");
  if (form.skilasLilaKurang === "Ya") issues.push("LiLA < 21 cm");
  if (form.skilasMasalahMata === "Ya") issues.push("Masalah mata / penglihatan");
  if (form.skilasTesLihat === "Tidak") issues.push("Tes melihat");
  if (form.skilasTesBisik === "Tidak") issues.push("Tes berbisik (pendengaran)");
  if (form.skilasPerasaanSedih === "Ya") issues.push("Perasaan sedih / putus asa");
  if (form.skilasHilangMinat === "Ya") issues.push("Kehilangan minat aktivitas");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

  const adaRisiko = issues.length > 0;
  return {
    adaRisiko,
<<<<<<< HEAD
    statusText: adaRisiko ? `Ada Risiko (${issues.length} Domain)` : "Semua Domain Normal",
    issues,
    isAnswered: true,
=======
    statusText: adaRisiko ? `Ada Risiko (${issues.length} Domain)` : 'Semua Domain Normal',
    issues,
    isAnswered: true
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };
};

// Helper: Kalkulasi Skrining Kesehatan Jiwa Dewasa (PHQ-4/SRQ Ringkas)
export const calculateJiwa = (form = {}) => {
  const fields = [form.jiwaQ1, form.jiwaQ2, form.jiwaQ3, form.jiwaQ4];
<<<<<<< HEAD
  const isAnyAnswered = fields.some((f) => f !== "" && f !== undefined && f !== null);
  if (!isAnyAnswered) {
    return { total: 0, kategori: "Belum Diisi", isRisiko: false, isAnswered: false, bulan: form.jiwaBulan || "" };
  }
  const q1 = form.jiwaQ1 !== "" && form.jiwaQ1 !== undefined && form.jiwaQ1 !== null ? Number(form.jiwaQ1) : 0;
  const q2 = form.jiwaQ2 !== "" && form.jiwaQ2 !== undefined && form.jiwaQ2 !== null ? Number(form.jiwaQ2) : 0;
  const q3 = form.jiwaQ3 !== "" && form.jiwaQ3 !== undefined && form.jiwaQ3 !== null ? Number(form.jiwaQ3) : 0;
  const q4 = form.jiwaQ4 !== "" && form.jiwaQ4 !== undefined && form.jiwaQ4 !== null ? Number(form.jiwaQ4) : 0;
  const total = q1 + q2 + q3 + q4;

  const group1 = q1 + q2;
  const group2 = q3 + q4;
  const isRisiko = group1 >= 3 || group2 >= 3;
  const kategori = isRisiko ? "Risiko Masalah Kesehatan Jiwa (kelompok skor ≥ 3)" : "Normal / Sehat Jiwa";

  return {
    total,
    group1,
    group2,
    kategori,
    isRisiko,
    isAnswered: true,
    bulan: form.jiwaBulan || "",
  };
};

const hasAnswer = (value) => value === false || value === 0 || (typeof value === "string" ? value.trim() !== "" : value !== null && value !== undefined);

// Komponen Radio Button Interaktif untuk opsi Ya / Tidak (atau Sudah / Belum)
export function YesNoRadio({ name, value, onChange, className = "", yesLabel = "Ya", noLabel = "Tidak", yesValue = "Ya", noValue = "Tidak" }) {
  const hasValue = value !== "" && value !== null && value !== undefined;
  const isYes = hasValue && (String(value) === String(yesValue) || (yesValue === "Ya" && (value === 1 || value === true)));
  const isNo = hasValue && (String(value) === String(noValue) || (noValue === "Tidak" && (value === 0 || value === false)));
  const isNumeric = typeof value === "number" || (hasValue && !isNaN(Number(value)) && (yesValue === 1 || noValue === 0));
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

  const yaId = `${name}_ya`;
  const tidakId = `${name}_tidak`;

  return (
    <div className={`d-flex align-items-center gap-3 ${className}`}>
      <div className="form-check form-check-inline m-0 d-flex align-items-center gap-1.5">
<<<<<<< HEAD
        <input className="form-check-input m-0 cursor-pointer" type="radio" id={yaId} name={name} checked={isYes} onChange={() => onChange(isNumeric ? 1 : yesValue)} style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer" }} />
        <label className="form-check-label cursor-pointer text-dark small fw-medium mb-0" htmlFor={yaId} style={{ cursor: "pointer", userSelect: "none" }}>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          {yesLabel}
        </label>
      </div>

      <div className="form-check form-check-inline m-0 d-flex align-items-center gap-1.5">
<<<<<<< HEAD
        <input className="form-check-input m-0 cursor-pointer" type="radio" id={tidakId} name={name} checked={isNo} onChange={() => onChange(isNumeric ? 0 : noValue)} style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer" }} />
        <label className="form-check-label cursor-pointer text-dark small fw-medium mb-0" htmlFor={tidakId} style={{ cursor: "pointer", userSelect: "none" }}>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          {noLabel}
        </label>
      </div>
    </div>
  );
}

// Komponen Kotak Pertanyaan Bergaris (Bordered Question Card) untuk opsi Ya / Tidak (atau Sudah / Belum)
<<<<<<< HEAD
export function YesNoCard({ label, name, value, onChange, className = "", yesLabel = "Ya", noLabel = "Tidak", yesValue = "Ya", noValue = "Tidak" }) {
  return (
    <div className={`p-3 rounded-3 border bg-white h-100 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2.5 ${className}`} style={{ borderColor: "#cbd5e1", backgroundColor: "#ffffff" }}>
      <span className="fw-medium text-dark small mb-0">{label}</span>
      <YesNoRadio name={name} value={value} onChange={onChange} className="flex-shrink-0" yesLabel={yesLabel} noLabel={noLabel} yesValue={yesValue} noValue={noValue} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    </div>
  );
}

<<<<<<< HEAD
function PeriodicScreeningPanel({ id, title, description, due, loading, checked, lastCompletedDate, onToggle, children }) {
  if (!due || loading) return null;

  const lastCompletedLabel = lastCompletedDate
    ? formatDateId(lastCompletedDate)
    : "Belum ada riwayat";

  return (
    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">Berkala 1x / 6 Bulan</span>
            <h5 className="fw-bold text-dark mb-0">{title}</h5>
          </div>
          <p className="text-muted small mb-0">{description}</p>
        </div>
        <div className="d-flex align-items-center gap-2 bg-light p-2 px-3 rounded-4 border">
          <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input className="form-check-input" type="checkbox" role="switch" id={id} checked={Boolean(checked)} onChange={(event) => onToggle(event.target.checked)} />
            <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor={id}>
              {checked ? "Lakukan Skrining" : "Tidak Dilakukan"}
            </label>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-3 bg-light border d-flex align-items-center gap-2 mt-3">
        <Clock size={18} className={`flex-shrink-0 ${lastCompletedDate ? "text-success" : "text-secondary"}`} />
        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-bold text-dark small">Riwayat Skrining 6 Bulanan:</span>
            <span className={`badge ${lastCompletedDate ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"} rounded-pill px-2.5 py-1 small fw-bold`}>{lastCompletedLabel}</span>
          </div>
          <div className="text-muted small mt-0.5">{lastCompletedDate ? "Skrining berikutnya dapat dilakukan setelah enam bulan." : "Belum ada riwayat skrining 6 bulanan tercatat."}</div>
        </div>
      </div>

      {!checked && (
        <div className="alert alert-primary-subtle border-0 rounded-3 mt-3 mb-0 d-flex align-items-center gap-2 py-2.5 small">
          <Info size={17} className="text-primary flex-shrink-0" />
          <span>Aktifkan skrining untuk mengisi pemeriksaan penglihatan dan pendengaran.</span>
        </div>
      )}
      <div hidden={!checked} className="mt-3 pt-3 border-top">
        {children}
      </div>
    </div>
  );
}

export default function PemeriksaanPage({ activeSubmenu = "bumil", onNavigate, globalSasaranList = [], setGlobalSasaranList, globalPemeriksaanData = {}, setGlobalPemeriksaanData, activePemeriksaanWargaId, onRefreshData }) {
  const getLocalDateOnly = () => {
    const now = new Date();
    const localMs = now.getTime() - now.getTimezoneOffset() * 60 * 1000;
    return new Date(localMs).toISOString().slice(0, 10);
  };

  const getLocalDateOffset = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const localMs = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
    return new Date(localMs).toISOString().slice(0, 10);
  };

  const getSessionForWarga = async (warga, targetDate = getLocalDateOnly()) => {
    const posyanduId = warga?._raw?.posyandu_id || warga?.posyandu_id;
    if (!posyanduId) {
      throw new Error("Warga belum memiliki Posyandu pada backend.");
    }

    const sesiRes = await sesiService.getSesiList({
      page: 1,
      limit: 100,
      posyandu_id: Number(posyanduId),
      tanggal: targetDate,
    });
    const sessions = Array.isArray(sesiRes?.data) ? sesiRes.data : Array.isArray(sesiRes?.data?.items) ? sesiRes.data.items : [];

    const session = sessions.find((item) => String(item.tanggal_pelaksanaan).slice(0, 10) === targetDate);
    if (!session?.id) {
      throw new Error(`Tidak ada sesi Posyandu pada ${targetDate}. Pilih tanggal sesi yang tersedia.`);
    }

    return session;
  };

  const ensureKunjunganId = async (warga, targetDate = getLocalDateOnly()) => {
    if (!warga?.id) throw new Error("Warga pemeriksaan tidak valid.");

    // Cari kunjungan pada sesi tanggal yang dipilih terlebih dahulu.
    // Jangan memakai /antrean-hari-ini karena endpoint tersebut hanya
    // mengembalikan antrean pemeriksaan yang belum selesai.
    const session = await getSessionForWarga(warga, targetDate);

    const visitRes = await kunjunganService.getKunjunganList({
      page: 1,
      limit: 100,
      sesi_posyandu_id: Number(session.id),
      warga_id: Number(warga.id),
    });
    const visits = Array.isArray(visitRes?.data) ? visitRes.data : Array.isArray(visitRes?.data?.items) ? visitRes.data.items : [];

    const existing = visits.find((item) => Number(item.warga_id || item.warga?.id) === Number(warga.id));
    if (existing?.id) return existing.id;

    const createdRes = await kunjunganService.createKunjungan({
      warga_id: Number(warga.id),
      sesi_posyandu_id: Number(session.id),
    });

    const createdKunjunganId = createdRes?.data?.kunjungan_id || createdRes?.data?.id || createdRes?.kunjungan_id || createdRes?.id;
    if (!createdKunjunganId) {
      throw new Error("Backend tidak mengembalikan ID kunjungan.");
    }

    return createdKunjunganId;
  };

  const { showSuccess, showWarning } = useNotification();
  const currentCategory = kategoriPemeriksaan.find((c) => c.id === activeSubmenu) || kategoriPemeriksaan[0];

  // 1. Mode State: 'per-step' (Pilih Langkah) vs 'sequential' (Bertahap)
  const [examinationMode, setExaminationMode] = useState("per-step");

  // 2. Active Step State (1, 2, 3, 4, 5)
  const [activeStep, setActiveStep] = useState(1);
  const [presensiTanggal, setPresensiTanggal] = useState(getLocalDateOnly);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timer = window.setTimeout(() => setPresensiTanggal(getLocalDateOnly()), nextMidnight.getTime() - now.getTime() + 1000);
    return () => window.clearTimeout(timer);
  }, [presensiTanggal]);
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

  // 3. Preview Modal State for Mode Bertahap
  const [showSequentialPreviewModal, setShowSequentialPreviewModal] = useState(false);

<<<<<<< HEAD
=======
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

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  const currentMonthNum = new Date().getMonth() + 1;
  const isBulanVitA = currentMonthNum === 2 || currentMonthNum === 8;

  // Active citizens in this category
  const activeWargaList = useMemo(() => {
<<<<<<< HEAD
    return (globalSasaranList || []).filter((s) => {
      if (!s) return false;
      if (s.subKategori === activeSubmenu || s.kategori_sasaran === activeSubmenu) return true;
      const katLower = String(s.kategori || "").toLowerCase();
      if (activeSubmenu === "bumil" && katLower.includes("bumil")) return true;
      if (activeSubmenu === "nifas" && (katLower.includes("nifas") || katLower.includes("menyusui") || katLower.includes("busui"))) return true;
      if (activeSubmenu === "bayi-0-11" && katLower.includes("bayi")) return true;
      if (activeSubmenu === "balita-12-59" && katLower.includes("balita")) return true;
      if (activeSubmenu === "apras" && katLower.includes("apras")) return true;
      if (activeSubmenu === "usekrem-6-14" && (katLower.includes("6-14") || katLower.includes("6 - 14") || katLower.includes("sekolah"))) return true;
      if (activeSubmenu === "usekrem-15-18" && (katLower.includes("15-18") || katLower.includes("15 - 18") || katLower.includes("remaja"))) return true;
      if (activeSubmenu === "dewasa" && katLower === "dewasa") return true;
      if (activeSubmenu === "lansia" && katLower === "lansia") return true;
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      return false;
    });
  }, [globalSasaranList, activeSubmenu]);

  // Selected Warga ID for Sequential Mode
<<<<<<< HEAD
  const [selectedWargaId, setSelectedWargaId] = useState("");

  // Tracking step completion and data per citizen
  // Format: { [wargaId]: { step1: true, step2: bool, step3: bool, step4: bool, step5: bool } }
  const [completedSteps, setCompletedSteps] = useState({});
  const [stepDataByWarga, setStepDataByWarga] = useState({});
  const [kunjunganIdByWarga, setKunjunganIdByWarga] = useState({});
  const [pemeriksaanByWarga, setPemeriksaanByWarga] = useState({});
  const [backendPlottingByWarga, setBackendPlottingByWarga] = useState({});

  // Status penyelesaian step yang sudah tersimpan di backend untuk kunjungan hari ini.
  // Dipakai agar sasaran tidak muncul lagi di antrean step terkait setelah halaman direfresh.
  const [backendStep2CompletedWarga, setBackendStep2CompletedWarga] = useState({});
  const [backendStep4CompletedWarga, setBackendStep4CompletedWarga] = useState({});
  const [backendStep5CompletedWarga, setBackendStep5CompletedWarga] = useState({});

  // Presensi Kehadiran Langkah 1 (Status Kehadiran Hari Ini: { [wargaId]: true/false })
  const [kehadiranWarga, setKehadiranWarga] = useState({});
  const [backendRegisteredWarga, setBackendRegisteredWarga] = useState({});
  const [presensiSesiAktif, setPresensiSesiAktif] = useState(null);
  const [presensiSesiLoading, setPresensiSesiLoading] = useState(true);
  const presensiSesiKeyRef = useRef("");

  // Keterangan Waktu Kunjungan Langkah 1 (Presensi): Minggu (Bumil) / Bulan (Nifas, Bayi, Balita, Apras)
  // Format: { [wargaId]: string }
  const [waktuKunjunganPresensi, setWaktuKunjunganPresensi] = useState({});

  // State pencarian warga di Langkah 1 Presensi
  const [searchWargaQuery, setSearchWargaQuery] = useState("");

  // Step 1: tampilkan semua sasaran kategori secara default.
  // Search hanya digunakan untuk memfilter daftar yang sudah ada.
  const filteredSasaranLangkah1 = useMemo(() => {
    const q = searchWargaQuery.trim().toLowerCase();
    if (!q) return activeWargaList;

    return activeWargaList.filter((w) => (w.nama && w.nama.toLowerCase().includes(q)) || (w.nik && String(w.nik).includes(q)) || (w.alamat && w.alamat.toLowerCase().includes(q)));
  }, [activeWargaList, searchWargaQuery]);

  // Daftar sasaran yang SUDAH HADIR di Langkah 1 untuk kategori ini
  const hadirWargaList = useMemo(() => {
    return activeWargaList.filter((w) => kehadiranWarga[String(w.id)] === true);
  }, [activeWargaList, kehadiranWarga]);

  // Di Langkah 2: hanya tampilkan sasaran yang sudah hadir DAN belum selesai Step 2.
  // Status completion dibaca dari state lokal + status kunjungan backend hari ini.
  const availableWargaStep2 = useMemo(() => {
    return hadirWargaList.filter((w) => {
      const wargaId = String(w.id);
      const localCompleted = completedSteps[wargaId]?.step2 === true;
      const backendCompleted = backendStep2CompletedWarga[wargaId] === true;
      return !localCompleted && !backendCompleted;
    });
  }, [hadirWargaList, completedSteps, backendStep2CompletedWarga]);

  // Langkah 3 tetap menampilkan SEMUA sasaran yang sudah terdaftar sebagai DATANG
  // pada Step 1. Step 3 read-only, jadi warga yang sudah pernah diplot tetap bisa dipilih.
  const availableWargaStep3 = useMemo(() => {
    return hadirWargaList;
  }, [hadirWargaList]);

  // Di Langkah 4: hanya tampilkan sasaran yang hadir DAN belum selesai Step 4.
  // Completion dicek dari state lokal + status kunjungan backend hari ini.
  const availableWargaStep4 = useMemo(() => {
    return hadirWargaList.filter((w) => {
      const wargaId = String(w.id);
      const localCompleted = completedSteps[wargaId]?.step4 === true;
      const backendCompleted = backendStep4CompletedWarga[wargaId] === true;
      return !localCompleted && !backendCompleted;
    });
  }, [hadirWargaList, completedSteps, backendStep4CompletedWarga]);

  // Di Langkah 5: hanya tampilkan sasaran yang hadir DAN belum selesai Step 5.
  const availableWargaStep5 = useMemo(() => {
    return hadirWargaList.filter((w) => {
      const wargaId = String(w.id);
      const localCompleted = completedSteps[wargaId]?.step5 === true;
      const backendCompleted = backendStep5CompletedWarga[wargaId] === true;
      return !localCompleted && !backendCompleted;
    });
  }, [hadirWargaList, completedSteps, backendStep5CompletedWarga]);

  // Selected citizen for each step (Step 2 to 5)
  const [selectedWargaStep2, setSelectedWargaStep2] = useState("");
  const [selectedWargaStep3, setSelectedWargaStep3] = useState("");
  const [selectedWargaStep4, setSelectedWargaStep4] = useState("");
  const [selectedWargaStep5, setSelectedWargaStep5] = useState("");

  // Automatically keep selected citizen in sync with available list
  // Sinkronkan status Step 2 dengan kunjungan backend pada hari berjalan.
  // Backend mengubah status_langkah menjadi langkah_2 setelah Step 2 berhasil disimpan,
  // dan tetap langkah_3/4/5 ketika proses sudah berlanjut.

  useEffect(() => {
    let cancelled = false;

    const loadBackendTodayStatus = async () => {
      if (activeWargaList.length && !cancelled) setPresensiSesiLoading(true);
      try {
        if (!activeWargaList.length) {
          if (!cancelled) {
            setPresensiSesiAktif(null);
            setPresensiSesiLoading(false);
          }
          return;
        }

        const posyanduIds = Array.from(
          new Set(
            activeWargaList
              .map((w) => w?._raw?.posyandu_id || w?.posyandu_id)
              .filter(Boolean)
              .map(Number),
          ),
        );

        const visitGroups = await Promise.all(
          posyanduIds.map(async (posyanduId) => {
            try {
              const sesiRes = await sesiService.getSesiList({
                page: 1,
                limit: 100,
                posyandu_id: posyanduId,
                tanggal: presensiTanggal,
              });

              const sessions = Array.isArray(sesiRes?.data) ? sesiRes.data : Array.isArray(sesiRes?.data?.items) ? sesiRes.data.items : [];
              const session = sessions.find((item) => String(item.tanggal_pelaksanaan).slice(0, 10) === presensiTanggal);

              if (!session?.id) return { posyanduId, session: null, visits: [] };

              const visitRes = await kunjunganService.getKunjunganList({
                page: 1,
                limit: 100,
                sesi_posyandu_id: Number(session.id),
              });

              return {
                posyanduId,
                session,
                visits: Array.isArray(visitRes?.data) ? visitRes.data : Array.isArray(visitRes?.data?.items) ? visitRes.data.items : [],
              };
            } catch (error) {
              console.error(`Gagal mengambil kunjungan sesi Posyandu ${posyanduId}:`, error);
              return { posyanduId, session: null, visits: [] };
            }
          }),
        );

        const sessionKey = visitGroups.map(({ posyanduId, session }) => `${posyanduId}:${session?.id || presensiTanggal}`).join("|") || presensiTanggal;
        const sessionsToday = visitGroups.map((group) => group.session).filter(Boolean);
        const visits = visitGroups.flatMap((group) => group.visits);
        const completedStep2 = {};
        const completedStep4 = {};
        const completedStep5 = {};
        const registeredWarga = {};
        const kunjunganIds = {};

        visits.forEach((visit) => {
          const wargaId = visit?.warga_id || visit?.warga?.id;
          if (!wargaId) return;

          const id = String(wargaId);
          registeredWarga[id] = true;
          if (visit?.id) kunjunganIds[id] = Number(visit.id);

          const status = String(visit?.status_langkah || "")
            .trim()
            .toLowerCase();

          // Step 2 selesai saat status kunjungan sudah melewati langkah 1.
          if (["langkah_2", "langkah_3", "langkah_4", "langkah_5"].includes(status)) {
            completedStep2[id] = true;
          }

          // Step 4 selesai saat status kunjungan sudah langkah 4 atau langkah 5.
          if (["langkah_4", "langkah_5"].includes(status)) {
            completedStep4[id] = true;
          }

          // Step 5 selesai saat status kunjungan sudah langkah 5.
          if (status === "langkah_5") {
            completedStep5[id] = true;
          }
        });

        if (!cancelled) {
          const sessionChanged = presensiSesiKeyRef.current !== sessionKey;
          presensiSesiKeyRef.current = sessionKey;
          setPresensiSesiAktif(sessionsToday[0] || null);
          setPresensiSesiLoading(false);

          if (sessionChanged) {
            setCompletedSteps({});
            setStepDataByWarga({});
            setPemeriksaanByWarga({});
            setBackendPlottingByWarga({});
            setKehadiranWarga(Object.fromEntries(Object.keys(registeredWarga).map((id) => [id, true])));
            setBackendRegisteredWarga(registeredWarga);
            setKunjunganIdByWarga(kunjunganIds);
            setBackendStep2CompletedWarga(completedStep2);
            setBackendStep4CompletedWarga(completedStep4);
            setBackendStep5CompletedWarga(completedStep5);
          } else {
            setKehadiranWarga((prev) => ({ ...prev, ...Object.fromEntries(Object.keys(registeredWarga).map((id) => [id, true])) }));
            setBackendRegisteredWarga((prev) => ({ ...prev, ...registeredWarga }));
            setKunjunganIdByWarga((prev) => ({ ...prev, ...kunjunganIds }));
            setBackendStep2CompletedWarga((prev) => ({ ...prev, ...completedStep2 }));
            setBackendStep4CompletedWarga((prev) => ({ ...prev, ...completedStep4 }));
            setBackendStep5CompletedWarga((prev) => ({ ...prev, ...completedStep5 }));
          }
        }
      } catch (error) {
        console.error("Gagal mengambil status presensi hari ini:", error);
        if (!cancelled) setPresensiSesiLoading(false);
      }
    };

    loadBackendTodayStatus();

    return () => {
      cancelled = true;
    };
  }, [activeSubmenu, activeWargaList, presensiTanggal]);

  useEffect(() => {
    if (availableWargaStep2.length > 0) {
      if (!availableWargaStep2.some((w) => String(w.id) === String(selectedWargaStep2))) {
        setSelectedWargaStep2(String(availableWargaStep2[0].id));
      }
    } else {
      setSelectedWargaStep2("");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }
  }, [availableWargaStep2, selectedWargaStep2]);

  useEffect(() => {
    if (availableWargaStep3.length > 0) {
<<<<<<< HEAD
      if (!availableWargaStep3.some((w) => String(w.id) === String(selectedWargaStep3))) {
        setSelectedWargaStep3(String(availableWargaStep3[0].id));
      }
    } else {
      setSelectedWargaStep3("");
=======
      if (!availableWargaStep3.some(w => String(w.id) === String(selectedWargaStep3))) {
        setSelectedWargaStep3(String(availableWargaStep3[0].id));
      }
    } else {
      setSelectedWargaStep3('');
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }
  }, [availableWargaStep3, selectedWargaStep3]);

  useEffect(() => {
    if (availableWargaStep4.length > 0) {
<<<<<<< HEAD
      if (!availableWargaStep4.some((w) => String(w.id) === String(selectedWargaStep4))) {
        setSelectedWargaStep4(String(availableWargaStep4[0].id));
      }
    } else {
      setSelectedWargaStep4("");
=======
      if (!availableWargaStep4.some(w => String(w.id) === String(selectedWargaStep4))) {
        setSelectedWargaStep4(String(availableWargaStep4[0].id));
      }
    } else {
      setSelectedWargaStep4('');
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }
  }, [availableWargaStep4, selectedWargaStep4]);

  useEffect(() => {
    if (availableWargaStep5.length > 0) {
<<<<<<< HEAD
      if (!availableWargaStep5.some((w) => String(w.id) === String(selectedWargaStep5))) {
        setSelectedWargaStep5(String(availableWargaStep5[0].id));
      }
    } else {
      setSelectedWargaStep5("");
=======
      if (!availableWargaStep5.some(w => String(w.id) === String(selectedWargaStep5))) {
        setSelectedWargaStep5(String(availableWargaStep5[0].id));
      }
    } else {
      setSelectedWargaStep5('');
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }
  }, [availableWargaStep5, selectedWargaStep5]);

  // Keep selected citizen in sync when changing active category
  useEffect(() => {
<<<<<<< HEAD
    setActiveStep(1);
    setSearchWargaQuery("");
    if (hadirWargaList.length > 0) {
      setSelectedWargaId(String(hadirWargaList[0].id));
    } else {
      setSelectedWargaId("");
=======
    setSearchWargaQuery('');
    if (hadirWargaList.length > 0) {
      if (!hadirWargaList.some(w => String(w.id) === String(selectedWargaId))) {
        setSelectedWargaId(String(hadirWargaList[0].id));
      }
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }
  }, [activeSubmenu]);

  // Find active selected citizen record
  const currentSelectedWarga = useMemo(() => {
<<<<<<< HEAD
    return activeWargaList.find((w) => String(w.id) === String(selectedWargaId)) || activeWargaList[0] || null;
  }, [activeWargaList, selectedWargaId]);

  // Find the examination record listed by the backend. Detailed measurements are fetched from Step 3.
  const currentExamListRecord = useMemo(() => {
=======
    return activeWargaList.find(w => String(w.id) === String(selectedWargaId)) || activeWargaList[0] || null;
  }, [activeWargaList, selectedWargaId]);

  // Find active examination data from master dictionary
  const currentExamData = useMemo(() => {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    if (!currentSelectedWarga) return null;
    return (globalPemeriksaanData && (globalPemeriksaanData[currentSelectedWarga.id] || globalPemeriksaanData[String(currentSelectedWarga.id)])) || null;
  }, [globalPemeriksaanData, currentSelectedWarga]);

<<<<<<< HEAD
  const currentBackendPlotting = currentSelectedWarga ? backendPlottingByWarga[String(currentSelectedWarga.id)] || null : null;

  useEffect(() => {
    if (examinationMode !== "per-step" || !selectedWargaStep2) return;

    const targetId = String(selectedWargaStep2);
    const warga = getWargaForId(targetId);

    if (!warga) return;

    const exam = globalPemeriksaanData?.[targetId] || globalPemeriksaanData?.[warga.id] || null;

    const existingPlot = backendPlottingByWarga[targetId];

    const applyStep2Data = (plotData = null) => {
      const measurements = plotData?.pengukuran_step_2 || plotData?.pengukuran || {};

      setLangkah2Form({
        bb: measurements.bb_kg ?? exam?.bb_kg ?? warga?.bb ?? "",
        tb: measurements.tb_cm ?? exam?.tb_cm ?? warga?.tb ?? "",
        lila: measurements.lila_cm ?? exam?.lila_cm ?? "",
        lk: measurements.lingkar_kepala_cm ?? exam?.lingkar_kepala_cm ?? "",
        lp: measurements.lingkar_perut_cm ?? exam?.lingkar_perut_cm ?? "",
        tensiSistol: measurements.td_sistole ?? exam?.td_sistole ?? "",
        tensiDiastol: measurements.td_diastole ?? exam?.td_diastole ?? "",
        gulaDarah: measurements.kadar_gula ?? exam?.kadar_gula ?? "",
      });
    };

    // Kalau plotting untuk warga ini sudah ada, langsung pakai.
    if (existingPlot) {
      applyStep2Data(existingPlot);
      return;
    }

    // Kalau belum ada plotting, ambil dari pemeriksaan backend.
    const examId = exam?.id;
    if (!examId) {
      applyStep2Data();
      return;
    }

    let cancelled = false;

    pemeriksaanService
      .getStep3Plotting(examId)
      .then((res) => {
        if (cancelled) return;

        const data = res?.data || null;

        if (data) {
          setBackendPlottingByWarga((prev) => ({
            ...prev,
            [targetId]: data,
          }));
        }

        applyStep2Data(data);
      })
      .catch(() => {
        if (!cancelled) {
          applyStep2Data();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [examinationMode, selectedWargaStep2, globalPemeriksaanData, backendPlottingByWarga, activeSubmenu]);

  useEffect(() => {
    const warga = currentSelectedWarga;
    const listedExamId = currentExamListRecord?.id;
    if (!warga?.id || !listedExamId) return;

    const existing = backendPlottingByWarga[String(warga.id)];
    if (existing?.pemeriksaan_id === listedExamId) return;

    let cancelled = false;
    pemeriksaanService
      .getStep3Plotting(listedExamId)
      .then((res) => {
        if (cancelled || !res?.data) return;
        setPemeriksaanByWarga((prev) => ({ ...prev, [String(warga.id)]: listedExamId }));
        setBackendPlottingByWarga((prev) => ({ ...prev, [String(warga.id)]: res.data }));
      })
      .catch(() => {
        // An incomplete examination may not yet have Step 3 data. Keep the form empty.
      });

    return () => {
      cancelled = true;
    };
  }, [currentSelectedWarga, currentExamListRecord, backendPlottingByWarga]);

  // Keep legacy list metadata only; detailed clinical values come from backend Step 3.
  const currentExamData = useMemo(() => currentExamListRecord || null, [currentExamListRecord]);

=======
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  // Helper evaluasi riwayat skrining tahunan warga
  const getRiwayatSkriningTahunanInfo = (warga, exam) => {
    if (!warga) {
      return {
        hasHistory: false,
<<<<<<< HEAD
        statusLabel: "Belum Ada Riwayat",
        badgeClass: "bg-secondary-subtle text-secondary",
        detailText: "Belum ada data skrining tahunan tercatat.",
        isCurrentYear: false,
        tglFormatted: "-",
=======
        statusLabel: 'Belum Ada Riwayat',
        badgeClass: 'bg-secondary-subtle text-secondary',
        detailText: 'Belum ada data skrining tahunan tercatat.',
        isCurrentYear: false,
        tglFormatted: '-'
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      };
    }

    const examL4 = exam?.langkah4 || {};
<<<<<<< HEAD
    const backendDetail = exam?.detail_skrining || {};
    const backendRemajaAnnual = backendDetail?.pemeriksaan_tahunan_remaja_putri || {};
    const hasExamAnnual = Boolean(
      exam?.is_skrining_tahunan ||
      backendDetail?.is_skrining_tahunan ||
      backendRemajaAnnual?.is_skrining_jiwa ||
      backendRemajaAnnual?.is_periksa_hb ||
      examL4.isSkriningTahunan ||
      examL4.is_skrining_tahunan ||
      (examL4.jiwaQ1 !== undefined && examL4.jiwaQ1 !== "") ||
      (examL4.aksBab !== undefined && examL4.aksBab !== "") ||
      (examL4.skilasOrientasi !== undefined && examL4.skilasOrientasi !== "") ||
      (examL4.pumaJk !== undefined && examL4.pumaJk !== "") ||
      (examL4.skriningJiwa && examL4.skriningJiwa !== ""),
=======
    const hasExamAnnual = Boolean(
      examL4.isSkriningTahunan ||
      examL4.is_skrining_tahunan ||
      (examL4.jiwaQ1 !== undefined && examL4.jiwaQ1 !== '') ||
      (examL4.aksBab !== undefined && examL4.aksBab !== '') ||
      (examL4.skilasOrientasi !== undefined && examL4.skilasOrientasi !== '') ||
      (examL4.pumaJk !== undefined && examL4.pumaJk !== '') ||
      (examL4.skriningJiwa && examL4.skriningJiwa !== '')
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    );

    let rawDate = null;
    if (hasExamAnnual) {
<<<<<<< HEAD
      rawDate = examL4.tglSkriningTahunan || exam?.tglPemeriksaan || exam?.tanggal || warga.tglSkriningTahunanTerakhir || warga.tglPeriksa;
    } else if (warga.tglSkriningTahunanTerakhir) {
      rawDate = warga.tglSkriningTahunanTerakhir;
    } else if (warga.tglPeriksa && warga.statusPemeriksaan === "Sudah") {
=======
      rawDate = examL4.tglSkriningTahunan || exam?.tglPemeriksaan || warga.tglSkriningTahunanTerakhir || warga.tglPeriksa;
    } else if (warga.tglSkriningTahunanTerakhir) {
      rawDate = warga.tglSkriningTahunanTerakhir;
    } else if (warga.tglPeriksa && warga.statusPemeriksaan === 'Sudah') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      rawDate = warga.tglPeriksa;
    }

    if (!rawDate) {
      return {
        hasHistory: false,
<<<<<<< HEAD
        statusLabel: "Belum Pernah Skrining",
        badgeClass: "bg-secondary-subtle text-secondary",
        detailText: "Warga ini belum memiliki riwayat skrining tahunan.",
        isCurrentYear: false,
        tglFormatted: "-",
=======
        statusLabel: 'Belum Pernah Skrining',
        badgeClass: 'bg-secondary-subtle text-secondary',
        detailText: 'Warga ini belum memiliki riwayat skrining tahunan.',
        isCurrentYear: false,
        tglFormatted: '-'
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      };
    }

    let parsedYear = null;
<<<<<<< HEAD
    const formattedDisplay = formatDateId(rawDate);
    const isoDateMatch = String(rawDate).match(/^(\d{4})-\d{2}-\d{2}/);
    const dayFirstDateMatch = String(rawDate).match(/^\d{1,2}[/-]\d{1,2}[/-](\d{4})$/);
    if (isoDateMatch) parsedYear = Number(isoDateMatch[1]);
    else if (dayFirstDateMatch) parsedYear = Number(dayFirstDateMatch[1]);
    else {
      const parsedDate = new Date(rawDate);
      if (!Number.isNaN(parsedDate.getTime())) parsedYear = parsedDate.getFullYear();
=======
    let formattedDisplay = String(rawDate);

    if (String(rawDate).includes('-')) {
      const parts = String(rawDate).split('-');
      if (parts[0].length === 4) {
        parsedYear = parseInt(parts[0], 10);
        formattedDisplay = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[2].length === 4) {
        parsedYear = parseInt(parts[2], 10);
      }
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    }

    const currentYear = new Date().getFullYear();
    const isCurrentYear = parsedYear === currentYear;

    if (isCurrentYear) {
      return {
        hasHistory: true,
        statusLabel: `Sudah Skrining Tahun Ini (${currentYear})`,
<<<<<<< HEAD
        badgeClass: "bg-success-subtle text-success border border-success-subtle",
        detailText: `Terakhir diisi pada ${formattedDisplay} (Tahun ${parsedYear}). Lengkap untuk tahun ini.`,
        isCurrentYear: true,
        tglFormatted: formattedDisplay,
=======
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        detailText: `Terakhir diisi pada ${formattedDisplay} (Tahun ${parsedYear}). Lengkap untuk tahun ini.`,
        isCurrentYear: true,
        tglFormatted: formattedDisplay
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      };
    } else if (parsedYear) {
      const yearDiff = currentYear - parsedYear;
      return {
        hasHistory: true,
        statusLabel: `Perlu Skrining Tahun Ini (Jadwal ${currentYear})`,
<<<<<<< HEAD
        badgeClass: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
        detailText: `Terakhir diisi pada ${formattedDisplay} (${yearDiff} tahun lalu - ${parsedYear}). Disarankan untuk dijadwalkan skrining ulang.`,
        isCurrentYear: false,
        tglFormatted: formattedDisplay,
=======
        badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
        detailText: `Terakhir diisi pada ${formattedDisplay} (${yearDiff} tahun lalu - ${parsedYear}). Disarankan untuk dijadwalkan skrining ulang.`,
        isCurrentYear: false,
        tglFormatted: formattedDisplay
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      };
    }

    return {
      hasHistory: true,
<<<<<<< HEAD
      statusLabel: "Riwayat Skrining Tercatat",
      badgeClass: "bg-info-subtle text-primary border border-info-subtle",
      detailText: `Terakhir diisi pada ${formattedDisplay}.`,
      isCurrentYear: false,
      tglFormatted: formattedDisplay,
=======
      statusLabel: 'Riwayat Skrining Tercatat',
      badgeClass: 'bg-info-subtle text-primary border border-info-subtle',
      detailText: `Terakhir diisi pada ${formattedDisplay}.`,
      isCurrentYear: false,
      tglFormatted: formattedDisplay
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    };
  };

  // Active citizen for Step 4 (Pelayanan & Skrining) in both modes
  const activeCitizenStep4 = useMemo(() => {
<<<<<<< HEAD
    const targetId = examinationMode === "per-step" ? selectedWargaStep4 : selectedWargaId;
    return activeWargaList.find((w) => String(w.id) === String(targetId)) || currentSelectedWarga || null;
=======
    const targetId = examinationMode === 'per-step' ? selectedWargaStep4 : selectedWargaId;
    return activeWargaList.find(w => String(w.id) === String(targetId)) || currentSelectedWarga || null;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  }, [examinationMode, selectedWargaStep4, selectedWargaId, activeWargaList, currentSelectedWarga]);

  const activeExamDataStep4 = useMemo(() => {
    if (!activeCitizenStep4) return null;
    return (globalPemeriksaanData && (globalPemeriksaanData[activeCitizenStep4.id] || globalPemeriksaanData[String(activeCitizenStep4.id)])) || currentExamData || null;
  }, [activeCitizenStep4, globalPemeriksaanData, currentExamData]);

  const annualScreeningInfo = useMemo(() => {
    return getRiwayatSkriningTahunanInfo(activeCitizenStep4, activeExamDataStep4);
  }, [activeCitizenStep4, activeExamDataStep4]);

<<<<<<< HEAD
  const [periodicScreeningInfo, setPeriodicScreeningInfo] = useState({ loading: true, lastSixMonthDate: "", lastAnnualDate: "" });

  useEffect(() => {
    if (!activeCitizenStep4?.id) {
      setPeriodicScreeningInfo({ loading: false, lastSixMonthDate: "", lastAnnualDate: "" });
      return undefined;
    }

    let cancelled = false;
    setPeriodicScreeningInfo((previous) => ({ ...previous, loading: true }));
    pemeriksaanService
      .getAllPemeriksaan({ warga_id: Number(activeCitizenStep4.id) })
      .then((response) => {
        const records = Array.isArray(response?.data) ? response.data : [];
        const hasSixMonthData = (detail) => detail?.is_skrining_6_bulanan === true;
        const hasAnnualData = (detail) =>
          detail?.is_skrining_tahunan === true ||
          detail?.pemeriksaan_tahunan_remaja_putri?.is_skrining_jiwa === true ||
          detail?.pemeriksaan_tahunan_remaja_putri?.is_periksa_hb === true;
        const getDate = (record) => String(record?.tanggal || record?.kunjungan?.sesiPosyandu?.tanggal_pelaksanaan || "").slice(0, 10);
        const datedRecords = records
          .filter((record) => record?.step4_completed_at && getDate(record))
          .sort((left, right) => getDate(right).localeCompare(getDate(left)));
        const lastSixMonthRecord = datedRecords.find((record) => hasSixMonthData(record.detail_skrining));
        const lastAnnualRecord = datedRecords.find((record) => hasAnnualData(record.detail_skrining));

        if (!cancelled) {
          setPeriodicScreeningInfo({
            loading: false,
            lastSixMonthDate: lastSixMonthRecord ? getDate(lastSixMonthRecord) : "",
            lastAnnualDate: lastAnnualRecord ? getDate(lastAnnualRecord) : "",
          });
        }
      })
      .catch((error) => {
        console.warn("Gagal memuat riwayat skrining berkala:", error);
        if (!cancelled) setPeriodicScreeningInfo({ loading: false, lastSixMonthDate: "", lastAnnualDate: "" });
      });

    return () => {
      cancelled = true;
    };
  }, [activeCitizenStep4?.id]);

  const sixMonthScreeningDue = useMemo(() => {
    if (periodicScreeningInfo.loading || !periodicScreeningInfo.lastSixMonthDate) return !periodicScreeningInfo.loading;
    const referenceDate = new Date(`${presensiTanggal}T00:00:00Z`);
    const dayOfMonth = referenceDate.getUTCDate();
    referenceDate.setUTCDate(1);
    referenceDate.setUTCMonth(referenceDate.getUTCMonth() - 6);
    const lastDayOfMonth = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 0)).getUTCDate();
    referenceDate.setUTCDate(Math.min(dayOfMonth, lastDayOfMonth));
    return periodicScreeningInfo.lastSixMonthDate <= referenceDate.toISOString().slice(0, 10);
  }, [periodicScreeningInfo, presensiTanggal]);

  const annualScreeningDue = useMemo(() => {
    if (!periodicScreeningInfo.lastAnnualDate) return true;
    return periodicScreeningInfo.lastAnnualDate.slice(0, 4) < presensiTanggal.slice(0, 4);
  }, [periodicScreeningInfo.lastAnnualDate, presensiTanggal]);
=======
  const isPutriStep4 = useMemo(() => {
    if (!activeCitizenStep4) return true;
    const g = String(activeCitizenStep4.gender || activeCitizenStep4.jenis_kelamin || activeCitizenStep4.jenisKelamin || '').toLowerCase();
    return g.startsWith('p') || g.includes('perempuan') || g.includes('wanita');
  }, [activeCitizenStep4]);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

  // Helper render riwayat pemeriksaan sebelumnya (ditiadakan sesuai masukan kader)
  const renderRiwayatPemeriksaanTerakhir = () => null;

  // Standard forms state
  const [langkah1Form, setLangkah1Form] = useState({
<<<<<<< HEAD
    nik: "",
    nama: "",
    tglLahir: "",
    gender: "",
    usiaKehamilan: "",
    waktuKunjunganNifas: "",
    usiaBayi: "",
    usiaBalita: "",
    usiaApras: "",
    checklistKia: "",
  });

  const [langkah2Form, setLangkah2Form] = useState({
    bb: "",
    tb: "",
    lila: "",
    lk: "",
    lp: "",
    tensiSistol: "",
    tensiDiastol: "",
    gulaDarah: "",
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  });

  const [langkah4Form, setLangkah4Form] = useState({
    isSkriningTahunan: false,
<<<<<<< HEAD
    isSkrining6Bulanan: false,
    batukTbc: "",
    demamTbc: "",
    bbTurunTbc: "",
    kontakTbc: "",
    lesuTbc: "",
    jumlahTtd: "",
    pemberianTtd: "",
    rutinTtd: "",
    komposisiMtBumil: "",
    rutinMtBumil: "",
    jumlahVitA: "",
    rutinVitA: "",
    menyusui: "",
    kbPascaPersalinan: "",
    asiEksklusif: "",
    mpAsi: "",
    pmtPemulihan: "",
    pmtHabis: "",
    vitA: "",
    obatCacing: "",
    ikutKelasBalita: "",
    perkembanganSdidtk: "",
    imunisasi: "",
    skriningPtm: "",
    mataKanan: "",
    mataKiri: "",
    telingaKanan: "",
    telingaKiri: "",
    skriningJiwa: "",
    periksaHb: "",
    batukBesarTbc: "",
    nafsuMakanTbc: "",
    bbMenurunTbc: "",
    lemahLesuTbc: "",
    berkeringatMalamTbc: "",
    batukDarahTbc: "",
    sesakNafasTbc: "",
    kolesterol: "",
    alatKontrasepsi: "",
    pumaJk: "",
    pumaUsia: "",
    pumaMerokok: "",
    pumaNapasPendek: "",
    pumaDahak: "",
    pumaBatukFlu: "",
    // Skrining Kesehatan Jiwa - Dewasa & Lansia
    jiwaBulan: "",
    jiwaQ1: "",
    jiwaQ2: "",
    jiwaQ3: "",
    jiwaQ4: "",
    // C2. Pemeriksaan Tahunan AKS (Barthel) - Lansia
    aksBab: "",
    aksBak: "",
    aksCuciMuka: "",
    aksWc: "",
    aksMakan: "",
    aksPindah: "",
    aksJalan: "",
    aksPakaian: "",
    aksTangga: "",
    aksMandi: "",
    // C3. Pemeriksaan Tahunan SKILAS - Lansia
    skilasOrientasi: "",
    skilasUlangKata: "",
    skilasMobilisasi: "",
    skilasTesKursi: "",
    skilasBbTurun: "",
    skilasNafsuMakan: "",
    skilasLilaKurang: "",
    skilasMasalahMata: "",
    skilasTesLihat: "",
    skilasTesBisik: "",
    skilasPerasaanSedih: "",
    skilasHilangMinat: "",
    skilasImunisasiCovid: "",
  });

  const [langkah5Form, setLangkah5Form] = useState({
    topikPenyuluhan: "",
    mengikutiKelas: "",
    statusRujukan: "",
    alasanRujukan: "",
  });

  const [imunisasiRowsByWarga, setImunisasiRowsByWarga] = useState({});
  const activeImunisasiWargaId = examinationMode === "per-step" ? selectedWargaStep4 : selectedWargaId;
  const activeImunisasiRows = imunisasiRowsByWarga[String(activeImunisasiWargaId)] || emptyImunisasiRows();

  useEffect(() => {
    if (!activeImunisasiWargaId) return undefined;
    let mounted = true;
    imunisasiService
      .getImunisasiByWarga(activeImunisasiWargaId)
      .then((response) => {
        if (mounted) setImunisasiRowsByWarga((previous) => ({ ...previous, [String(activeImunisasiWargaId)]: mergeImunisasiRows(response?.data) }));
      })
      .catch(() => {
        if (mounted) setImunisasiRowsByWarga((previous) => ({ ...previous, [String(activeImunisasiWargaId)]: emptyImunisasiRows() }));
      });
    return () => {
      mounted = false;
    };
  }, [activeImunisasiWargaId]);

  const updateActiveImunisasiRows = (rows) => {
    if (!activeImunisasiWargaId) return;
    setImunisasiRowsByWarga((previous) => ({ ...previous, [String(activeImunisasiWargaId)]: rows }));
  };

  const saveImunisasiRows = async (wargaId, rows) => {
    const response = await imunisasiService.bulkUpsertImunisasi(
      wargaId,
      rows.map(({ jenis_imunisasi, is_diberikan, tanggal_imunisasi, tempat }) => ({ jenis_imunisasi, is_diberikan, tanggal_imunisasi: tanggal_imunisasi || null, tempat: tempat || null, no_batch: null })),
    );
    setImunisasiRowsByWarga((previous) => ({ ...previous, [String(wargaId)]: mergeImunisasiRows(response?.data) }));
  };

  const [sequentialForm, setSequentialForm] = useState({
    isSkriningTahunan: false,
    isSkrining6Bulanan: false,
    nik: "",
    nama: "",
    tglLahir: "",
    gender: "",
    pekerjaan: "",
    statusPernikahan: "",
    sekolah: "",
    kelas: "",
    usiaKehamilan: "",
    waktuKunjunganNifas: "",
    usiaBayi: "",
    usiaBalita: "",
    usiaApras: "",
    checklistKia: "",
    tb: "",
    bb: "",
    lila: "",
    lk: "",
    lp: "",
    tensiSistol: "",
    tensiDiastol: "",
    gulaDarah: "",
    batukTbc: "",
    demamTbc: "",
    bbTurunTbc: "",
    kontakTbc: "",
    lesuTbc: "",
    jumlahTtd: "",
    pemberianTtd: "",
    rutinTtd: "",
    komposisiMtBumil: "",
    rutinMtBumil: "",
    jumlahVitA: "",
    rutinVitA: "",
    menyusui: "",
    kbPascaPersalinan: "",
    asiEksklusif: "",
    mpAsi: "",
    pmtPemulihan: "",
    pmtHabis: "",
    vitA: "",
    obatCacing: "",
    ikutKelasBalita: "",
    perkembanganSdidtk: "",
    imunisasi: "",
    skriningPtm: "",
    mataKanan: "",
    mataKiri: "",
    telingaKanan: "",
    telingaKiri: "",
    skriningJiwa: "",
    periksaHb: "",
    batukBesarTbc: "",
    nafsuMakanTbc: "",
    bbMenurunTbc: "",
    lemahLesuTbc: "",
    berkeringatMalamTbc: "",
    batukDarahTbc: "",
    sesakNafasTbc: "",
    kolesterol: "",
    alatKontrasepsi: "",
    pumaJk: "",
    pumaUsia: "",
    pumaMerokok: "",
    pumaNapasPendek: "",
    pumaDahak: "",
    pumaBatukFlu: "",
    // Skrining Kesehatan Jiwa - Dewasa & Lansia
    jiwaBulan: "",
    jiwaQ1: "",
    jiwaQ2: "",
    jiwaQ3: "",
    jiwaQ4: "",
    // C2. Pemeriksaan Tahunan AKS (Barthel) - Lansia
    aksBab: "",
    aksBak: "",
    aksCuciMuka: "",
    aksWc: "",
    aksMakan: "",
    aksPindah: "",
    aksJalan: "",
    aksPakaian: "",
    aksTangga: "",
    aksMandi: "",
    // C3. Pemeriksaan Tahunan SKILAS - Lansia
    skilasOrientasi: "",
    skilasUlangKata: "",
    skilasMobilisasi: "",
    skilasTesKursi: "",
    skilasBbTurun: "",
    skilasNafsuMakan: "",
    skilasLilaKurang: "",
    skilasMasalahMata: "",
    skilasTesLihat: "",
    skilasTesBisik: "",
    skilasPerasaanSedih: "",
    skilasHilangMinat: "",
    skilasImunisasiCovid: "",
    topikPenyuluhan: "",
    mengikutiKelas: "",
    statusRujukan: "",
    alasanRujukan: "",
  });

  // Helper setter/getter untuk field Langkah 4 (mendukung kedua mode)
  const updateLangkah4Value = (field, val) => {
    const updates = { [field]: val };
    if (field === "batukTbc") updates.batukBesarTbc = val;
    if (field === "batukBesarTbc") updates.batukTbc = val;
    if (field === "pemberianTtd") updates.jumlahTtd = val;
    if (field === "jumlahTtd") updates.pemberianTtd = val;

    if (examinationMode === "per-step") {
      setLangkah4Form((prev) => {
        const next = { ...prev, ...updates };
        if (activeSubmenu === "lansia") {
          const evalResult = evaluateSkilas(next);
          if (evalResult.adaRisiko) {
            setLangkah5Form((l5) => ({
              ...l5,
              statusRujukan: "Rujuk ke Puskesmas / Pustu",
              topikPenyuluhan: l5.topikPenyuluhan || `Rujukan SKILAS: Domain ${evalResult.issues.join(", ")}`,
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            }));
          }
        }
        return next;
      });
    } else {
<<<<<<< HEAD
      setSequentialForm((prev) => {
        const next = { ...prev, ...updates };
        if (activeSubmenu === "lansia") {
          const evalResult = evaluateSkilas(next);
          if (evalResult.adaRisiko) {
            next.statusRujukan = "Rujuk ke Puskesmas / Pustu";
            if (!next.topikPenyuluhan) {
              next.topikPenyuluhan = `Rujukan SKILAS: Domain ${evalResult.issues.join(", ")}`;
=======
      setSequentialForm(prev => {
        const next = { ...prev, ...updates };
        if (activeSubmenu === 'lansia') {
          const evalResult = evaluateSkilas(next);
          if (evalResult.adaRisiko) {
            next.statusRujukan = 'Rujuk ke Puskesmas / Pustu';
            if (!next.topikPenyuluhan) {
              next.topikPenyuluhan = `Rujukan SKILAS: Domain ${evalResult.issues.join(', ')}`;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
            }
          }
        }
        return next;
      });
    }
  };

<<<<<<< HEAD
  const activeCitizenGender = activeCitizenStep4?.gender || activeCitizenStep4?._raw?.jenis_kelamin || activeCitizenStep4?.jenis_kelamin || "";
  const isRemajaPerempuan = ["perempuan", "p", "wanita", "female"].includes(String(activeCitizenGender).trim().toLowerCase());

  const getLangkah4Value = (field) => {
    const src = examinationMode === "per-step" ? langkah4Form : sequentialForm;
    if (!src) return "";
    if (field === "batukBesarTbc") return src.batukBesarTbc || src.batukTbc || "";
    if (field === "batukTbc") return src.batukTbc || src.batukBesarTbc || "";
    if (field === "pemberianTtd") return src.pemberianTtd || src.jumlahTtd || "";
    if (field === "jumlahTtd") return src.jumlahTtd || src.pemberianTtd || "";
    return src[field] ?? "";
=======
  const getLangkah4Value = (field) => {
    const src = examinationMode === 'per-step' ? langkah4Form : sequentialForm;
    if (!src) return '';
    if (field === 'batukBesarTbc') return src.batukBesarTbc || src.batukTbc || '';
    if (field === 'batukTbc') return src.batukTbc || src.batukBesarTbc || '';
    if (field === 'pemberianTtd') return src.pemberianTtd || src.jumlahTtd || '';
    if (field === 'jumlahTtd') return src.jumlahTtd || src.pemberianTtd || '';
    return src[field] ?? '';
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };

  // Automatically hydrate all 5 steps when a citizen is selected or category changes
  useEffect(() => {
    if (!currentSelectedWarga) return;
<<<<<<< HEAD
    const defaultGen = currentSelectedWarga.gender || "";
    const l1 = currentExamData?.langkah1 || {};
    const l4 = currentExamData?.langkah4 || {};
    const l5 = currentExamData?.langkah5 || {};
    const backendDetail = currentExamData?.detail_skrining || {};
    const backendRemajaAnnual = backendDetail?.pemeriksaan_tahunan_remaja_putri || {};

    setLangkah1Form({
      nik: currentSelectedWarga.nik || l1.nik || "",
      nama: currentSelectedWarga.nama || l1.nama || "",
      tglLahir: currentSelectedWarga.tglLahir || l1.tglLahir || "",
      gender: defaultGen,
      usiaKehamilan: l1.usiaKehamilan || currentSelectedWarga.usiaKehamilan || "",
      waktuKunjunganNifas: l1.waktuKunjunganNifas || "",
      usiaBayi: l1.usiaBayi || "",
      usiaBalita: l1.usiaBalita || "",
      usiaApras: l1.usiaApras || "",
      checklistKia: l1.checklistKia || "",
    });

    // Step 2 selalu dimulai kosong saat sasaran dipilih.
    // Data pengukuran lama tetap dipakai oleh Step 3 melalui backend plotting.
    setLangkah2Form({
      bb: "",
      tb: "",
      lila: "",
      lk: "",
      lp: "",
      tensiSistol: "",
      tensiDiastol: "",
      gulaDarah: "",
    });

    const hasAnnualData = Boolean(
      currentExamData?.is_skrining_tahunan ||
      backendDetail?.is_skrining_tahunan ||
      backendRemajaAnnual?.is_skrining_jiwa ||
      backendRemajaAnnual?.is_periksa_hb ||
      l4.isSkriningTahunan ||
      l4.is_skrining_tahunan ||
      (l4.jiwaQ1 !== undefined && l4.jiwaQ1 !== "") ||
      (l4.aksBab !== undefined && l4.aksBab !== "") ||
      (l4.skilasOrientasi !== undefined && l4.skilasOrientasi !== "") ||
      (l4.pumaJk !== undefined && l4.pumaJk !== "") ||
      (l4.skriningJiwa && l4.skriningJiwa !== ""),
    );
    const hasSixMonthData = backendDetail?.is_skrining_6_bulanan === true || l4.isSkrining6Bulanan === true;

    setLangkah4Form({
      isSkriningTahunan: hasAnnualData,
      isSkrining6Bulanan: hasSixMonthData,
      batukTbc: l4.batukTbc || "",
      demamTbc: l4.demamTbc || "",
      bbTurunTbc: l4.bbTurunTbc || "",
      kontakTbc: l4.kontakTbc || "",
      lesuTbc: l4.lesuTbc || "",
      jumlahTtd: l4.jumlahTtd || "",
      pemberianTtd: l4.pemberianTtd || l4.jumlahTtd || "",
      rutinTtd: l4.rutinTtd || "",
      komposisiMtBumil: l4.komposisiMtBumil || "",
      rutinMtBumil: l4.rutinMtBumil || "",
      jumlahVitA: l4.jumlahVitA || "",
      rutinVitA: l4.rutinVitA || "",
      menyusui: l4.menyusui || "",
      kbPascaPersalinan: l4.kbPascaPersalinan || "",
      asiEksklusif: l4.asiEksklusif || "",
      mpAsi: l4.mpAsi || "",
      pmtPemulihan: l4.pmtPemulihan || "",
      pmtHabis: l4.pmtHabis || "",
      vitA: l4.vitA || "",
      obatCacing: l4.obatCacing || "",
      ikutKelasBalita: l4.ikutKelasBalita || "",
      perkembanganSdidtk: l4.perkembanganSdidtk || "",
      imunisasi: l4.imunisasi || "",
      skriningPtm: l4.skriningPtm || "",
      mataKanan: l4.mataKanan || "",
      mataKiri: l4.mataKiri || "",
      telingaKanan: l4.telingaKanan || "",
      telingaKiri: l4.telingaKiri || "",
      skriningJiwa: l4.skriningJiwa || "",
      periksaHb: l4.periksaHb || "",
      batukBesarTbc: l4.batukBesarTbc || "",
      nafsuMakanTbc: l4.nafsuMakanTbc || "",
      bbMenurunTbc: l4.bbMenurunTbc || "",
      lemahLesuTbc: l4.lemahLesuTbc || "",
      berkeringatMalamTbc: l4.berkeringatMalamTbc || "",
      batukDarahTbc: l4.batukDarahTbc || "",
      sesakNafasTbc: l4.sesakNafasTbc || "",
      kolesterol: l4.kolesterol || "",
      alatKontrasepsi: l4.alatKontrasepsi || "",
      pumaJk: l4.pumaJk !== undefined ? l4.pumaJk : "",
      pumaUsia: l4.pumaUsia !== undefined ? l4.pumaUsia : "",
      pumaMerokok: l4.pumaMerokok !== undefined ? l4.pumaMerokok : "",
      pumaNapasPendek: l4.pumaNapasPendek !== undefined ? l4.pumaNapasPendek : "",
      pumaDahak: l4.pumaDahak !== undefined ? l4.pumaDahak : "",
      pumaBatukFlu: l4.pumaBatukFlu !== undefined ? l4.pumaBatukFlu : "",
      // C2. AKS - Lansia
      aksBab: l4.aksBab !== undefined ? l4.aksBab : "",
      aksBak: l4.aksBak !== undefined ? l4.aksBak : "",
      aksCuciMuka: l4.aksCuciMuka !== undefined ? l4.aksCuciMuka : "",
      aksWc: l4.aksWc !== undefined ? l4.aksWc : "",
      aksMakan: l4.aksMakan !== undefined ? l4.aksMakan : "",
      aksPindah: l4.aksPindah !== undefined ? l4.aksPindah : "",
      aksJalan: l4.aksJalan !== undefined ? l4.aksJalan : "",
      aksPakaian: l4.aksPakaian !== undefined ? l4.aksPakaian : "",
      aksTangga: l4.aksTangga !== undefined ? l4.aksTangga : "",
      aksMandi: l4.aksMandi !== undefined ? l4.aksMandi : "",
      // C3. SKILAS - Lansia
      skilasOrientasi: l4.skilasOrientasi || "",
      skilasUlangKata: l4.skilasUlangKata || "",
      skilasMobilisasi: l4.skilasMobilisasi || "",
      skilasTesKursi: l4.skilasTesKursi || "",
      skilasBbTurun: l4.skilasBbTurun || "",
      skilasNafsuMakan: l4.skilasNafsuMakan || "",
      skilasLilaKurang: l4.skilasLilaKurang || "",
      skilasMasalahMata: l4.skilasMasalahMata || "",
      skilasTesLihat: l4.skilasTesLihat || "",
      skilasTesBisik: l4.skilasTesBisik || "",
      skilasPerasaanSedih: l4.skilasPerasaanSedih || "",
      skilasHilangMinat: l4.skilasHilangMinat || "",
      skilasImunisasiCovid: l4.skilasImunisasiCovid || "",
    });

    setLangkah5Form({
      topikPenyuluhan: l5.topikPenyuluhan || "",
      mengikutiKelas: l5.mengikutiKelas || "",
      statusRujukan: l5.statusRujukan || "",
      alasanRujukan: l5.alasanRujukan || currentExamData?.rujukan?.alasan_rujukan || "",
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    });

    setSequentialForm({
      isSkriningTahunan: hasAnnualData,
<<<<<<< HEAD
      isSkrining6Bulanan: hasSixMonthData,
      nik: currentSelectedWarga.nik || l1.nik || "",
      nama: currentSelectedWarga.nama || l1.nama || "",
      tglLahir: currentSelectedWarga.tglLahir || l1.tglLahir || "",
      gender: defaultGen,
      pekerjaan: currentSelectedWarga.pekerjaan || l1.pekerjaan || "",
      statusPernikahan: currentSelectedWarga.statusPernikahan || l1.statusPernikahan || "",
      sekolah: currentSelectedWarga.sekolah || l1.sekolah || "",
      kelas: currentSelectedWarga.kelas || l1.kelas || "",
      usiaKehamilan: l1.usiaKehamilan || currentSelectedWarga.usiaKehamilan || "",
      waktuKunjunganNifas: l1.waktuKunjunganNifas || "",
      usiaBayi: l1.usiaBayi || "",
      usiaBalita: l1.usiaBalita || "",
      usiaApras: l1.usiaApras || "",
      checklistKia: l1.checklistKia || "",
      tb: "",
      bb: "",
      lila: "",
      lk: "",
      lp: "",
      tensiSistol: "",
      tensiDiastol: "",
      gulaDarah: "",
      batukTbc: l4.batukTbc || "",
      demamTbc: l4.demamTbc || "",
      bbTurunTbc: l4.bbTurunTbc || "",
      kontakTbc: l4.kontakTbc || "",
      lesuTbc: l4.lesuTbc || "",
      jumlahTtd: l4.jumlahTtd || "",
      pemberianTtd: l4.pemberianTtd || l4.jumlahTtd || "",
      rutinTtd: l4.rutinTtd || "",
      komposisiMtBumil: l4.komposisiMtBumil || "",
      rutinMtBumil: l4.rutinMtBumil || "",
      jumlahVitA: l4.jumlahVitA || "",
      rutinVitA: l4.rutinVitA || "",
      menyusui: l4.menyusui || "",
      kbPascaPersalinan: l4.kbPascaPersalinan || "",
      asiEksklusif: l4.asiEksklusif || "",
      mpAsi: l4.mpAsi || "",
      pmtPemulihan: l4.pmtPemulihan || "",
      pmtHabis: l4.pmtHabis || "",
      vitA: l4.vitA || "",
      obatCacing: l4.obatCacing || "",
      ikutKelasBalita: l4.ikutKelasBalita || "",
      perkembanganSdidtk: l4.perkembanganSdidtk || "",
      imunisasi: l4.imunisasi || "",
      skriningPtm: l4.skriningPtm || "",
      mataKanan: l4.mataKanan || "",
      mataKiri: l4.mataKiri || "",
      telingaKanan: l4.telingaKanan || "",
      telingaKiri: l4.telingaKiri || "",
      skriningJiwa: l4.skriningJiwa || "",
      periksaHb: l4.periksaHb || "",
      batukBesarTbc: l4.batukBesarTbc || "",
      nafsuMakanTbc: l4.nafsuMakanTbc || "",
      bbMenurunTbc: l4.bbMenurunTbc || "",
      lemahLesuTbc: l4.lemahLesuTbc || "",
      berkeringatMalamTbc: l4.berkeringatMalamTbc || "",
      batukDarahTbc: l4.batukDarahTbc || "",
      sesakNafasTbc: l4.sesakNafasTbc || "",
      kolesterol: l4.kolesterol || "",
      alatKontrasepsi: l4.alatKontrasepsi || "",
      pumaJk: l4.pumaJk !== undefined ? l4.pumaJk : "",
      pumaUsia: l4.pumaUsia !== undefined ? l4.pumaUsia : "",
      pumaMerokok: l4.pumaMerokok !== undefined ? l4.pumaMerokok : "",
      pumaNapasPendek: l4.pumaNapasPendek !== undefined ? l4.pumaNapasPendek : "",
      pumaDahak: l4.pumaDahak !== undefined ? l4.pumaDahak : "",
      pumaBatukFlu: l4.pumaBatukFlu !== undefined ? l4.pumaBatukFlu : "",
      // C2. AKS - Lansia
      aksBab: l4.aksBab !== undefined ? l4.aksBab : "",
      aksBak: l4.aksBak !== undefined ? l4.aksBak : "",
      aksCuciMuka: l4.aksCuciMuka !== undefined ? l4.aksCuciMuka : "",
      aksWc: l4.aksWc !== undefined ? l4.aksWc : "",
      aksMakan: l4.aksMakan !== undefined ? l4.aksMakan : "",
      aksPindah: l4.aksPindah !== undefined ? l4.aksPindah : "",
      aksJalan: l4.aksJalan !== undefined ? l4.aksJalan : "",
      aksPakaian: l4.aksPakaian !== undefined ? l4.aksPakaian : "",
      aksTangga: l4.aksTangga !== undefined ? l4.aksTangga : "",
      aksMandi: l4.aksMandi !== undefined ? l4.aksMandi : "",
      // C3. SKILAS - Lansia
      skilasOrientasi: l4.skilasOrientasi || "",
      skilasUlangKata: l4.skilasUlangKata || "",
      skilasMobilisasi: l4.skilasMobilisasi || "",
      skilasTesKursi: l4.skilasTesKursi || "",
      skilasBbTurun: l4.skilasBbTurun || "",
      skilasNafsuMakan: l4.skilasNafsuMakan || "",
      skilasLilaKurang: l4.skilasLilaKurang || "",
      skilasMasalahMata: l4.skilasMasalahMata || "",
      skilasTesLihat: l4.skilasTesLihat || "",
      skilasTesBisik: l4.skilasTesBisik || "",
      skilasPerasaanSedih: l4.skilasPerasaanSedih || "",
      skilasHilangMinat: l4.skilasHilangMinat || "",
      skilasImunisasiCovid: l4.skilasImunisasiCovid || "",
      topikPenyuluhan: l5.topikPenyuluhan || "",
      mengikutiKelas: l5.mengikutiKelas || "",
      statusRujukan: l5.statusRujukan || "",
      alasanRujukan: l5.alasanRujukan || currentExamData?.rujukan?.alasan_rujukan || "",
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    });
  }, [currentSelectedWarga, currentExamData, activeSubmenu, currentCategory.label]);

  // Kalkulasi reaktif skor AKS, hasil SKILAS, dan Skrining Jiwa
  const currentAks = useMemo(() => {
<<<<<<< HEAD
    return calculateAks(examinationMode === "per-step" ? langkah4Form : sequentialForm);
  }, [examinationMode, langkah4Form, sequentialForm]);

  const currentSkilas = useMemo(() => {
    return evaluateSkilas(examinationMode === "per-step" ? langkah4Form : sequentialForm);
  }, [examinationMode, langkah4Form, sequentialForm]);

  const currentJiwa = useMemo(() => {
    return calculateJiwa(examinationMode === "per-step" ? langkah4Form : sequentialForm);
=======
    return calculateAks(examinationMode === 'per-step' ? langkah4Form : sequentialForm);
  }, [examinationMode, langkah4Form, sequentialForm]);

  const currentSkilas = useMemo(() => {
    return evaluateSkilas(examinationMode === 'per-step' ? langkah4Form : sequentialForm);
  }, [examinationMode, langkah4Form, sequentialForm]);

  const currentJiwa = useMemo(() => {
    return calculateJiwa(examinationMode === 'per-step' ? langkah4Form : sequentialForm);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  }, [examinationMode, langkah4Form, sequentialForm]);

  // Active data for Step 3 Plotting & Step 2 calculations
  const activeWargaData = useMemo(() => {
    return {
      ...(currentSelectedWarga || {}),
      ...(currentExamData?.langkah1 || {}),
      ...(currentExamData?.langkah2 || {}),
      ...langkah1Form,
<<<<<<< HEAD
      ...langkah2Form,
=======
      ...langkah2Form
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    };
  }, [currentSelectedWarga, currentExamData, langkah1Form, langkah2Form]);

  // Helper fungsi untuk validasi ketat setiap langkah pemeriksaan posyandu
  const validateStepData = (step, data, submenu) => {
    const missing = [];

    if (step === 1) {
<<<<<<< HEAD
      if (!data?.nama || !String(data.nama).trim()) missing.push("Nama Lengkap");
      if (!data?.nik || !String(data.nik).trim()) {
        missing.push("NIK (16 digit)");
=======
      if (!data?.nama || !String(data.nama).trim()) missing.push('Nama Lengkap');
      if (!data?.nik || !String(data.nik).trim()) {
        missing.push('NIK (16 digit)');
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      } else {
        const nikCheck = validateNik(data.nik);
        if (!nikCheck.isValid) missing.push(nikCheck.message);
      }
<<<<<<< HEAD
      if (!data?.tglLahir) missing.push("Tanggal Lahir");
      if (!["Laki-laki", "Perempuan", "L", "P"].includes(data?.gender)) missing.push("Jenis Kelamin");
    }

    if (step === 2) {
      if (!data?.bb || !String(data.bb).trim()) missing.push("Berat Badan (BB)");

      if (["bayi-0-11", "balita-12-59"].includes(submenu)) {
        if (!data?.tb || !String(data.tb).trim()) missing.push("Panjang / Tinggi Badan (PB/TB)");
        if (!data?.lk || !String(data.lk).trim()) missing.push("Lingkar Kepala (LK)");
        if (!data?.lila || !String(data.lila).trim()) missing.push("Lingkar Lengan Atas (LiLA)");
      } else if (submenu === "apras") {
        if (!data?.tb || !String(data.tb).trim()) missing.push("Tinggi Badan (TB)");
        if (!data?.lila || !String(data.lila).trim()) missing.push("Lingkar Lengan Atas (LiLA)");
      } else if (["usekrem-6-14", "usekrem-15-18"].includes(submenu)) {
        if (!data?.tb || !String(data.tb).trim()) missing.push("Tinggi Badan (TB)");
      } else if (submenu === "usekrem-15-18") {
        if (!data?.tb || !String(data.tb).trim()) missing.push("Tinggi Badan (TB)");
        if (!data?.lp || !String(data.lp).trim()) missing.push("Lingkar Perut (LP)");
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push("Tekanan Sistol");
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push("Tekanan Diastol");
      } else if (submenu === "dewasa" || submenu === "lansia") {
        if (!data?.tb || !String(data.tb).trim()) missing.push("Tinggi Badan (TB)");
        if (!data?.lp || !String(data.lp).trim()) missing.push("Lingkar Perut (LP)");
        if (!data?.lila || !String(data.lila).trim()) missing.push("Lingkar Lengan Atas (LiLA)");
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push("Tekanan Sistol");
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push("Tekanan Diastol");
      } else if (submenu === "bumil") {
        if (!data?.lila || !String(data.lila).trim()) missing.push("Lingkar Lengan Atas (LiLA)");
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push("Tekanan Sistol");
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push("Tekanan Diastol");
      } else if (submenu === "nifas") {
        if (!data?.tensiSistol || !String(data.tensiSistol).trim()) missing.push("Tekanan Sistol");
        if (!data?.tensiDiastol || !String(data.tensiDiastol).trim()) missing.push("Tekanan Diastol");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      }

      if (data?.bb) {
        const measureCheck = validateMeasurements({
          bb: data.bb,
          tb: data.tb,
          lila: data.lila,
          sistol: data.tensiSistol,
<<<<<<< HEAD
          diastol: data.tensiDiastol,
        });
        if (!measureCheck.isValid && measureCheck.errors) {
          measureCheck.errors.forEach((err) => missing.push(err));
=======
          diastol: data.tensiDiastol
        });
        if (!measureCheck.isValid && measureCheck.errors) {
          measureCheck.errors.forEach(err => missing.push(err));
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
        }
      }
    }

    if (step === 4) {
<<<<<<< HEAD
      if (["bayi-0-11", "balita-12-59", "apras"].includes(submenu)) {
        if (!hasAnswer(data?.batukTbc) && !hasAnswer(data?.batukBesarTbc)) missing.push("Gejala Batuk TBC");
        if (!hasAnswer(data?.demamTbc)) missing.push("Gejala Demam TBC");
        if (!hasAnswer(data?.bbTurunTbc)) missing.push("Gejala BB Turun TBC");
        if (!hasAnswer(data?.lesuTbc)) missing.push("Gejala Lesu TBC");
      } else if (["bumil", "nifas"].includes(submenu)) {
        if (!hasAnswer(data?.batukTbc) && !hasAnswer(data?.batukBesarTbc)) missing.push("Gejala Batuk TBC");
        if (!hasAnswer(data?.demamTbc)) missing.push("Gejala Demam TBC");
        if (!hasAnswer(data?.bbTurunTbc)) missing.push("Gejala BB Turun TBC");
        if (!hasAnswer(data?.kontakTbc)) missing.push("Kontak Erat Pasien TBC");
      } else if (submenu === "usekrem-6-14") {
        if (!hasAnswer(data?.batukTbc) && !hasAnswer(data?.batukBesarTbc)) missing.push("Gejala Batuk TBC");
        if (!hasAnswer(data?.demamTbc)) missing.push("Gejala Demam TBC");
        if (!hasAnswer(data?.bbTurunTbc)) missing.push("Gejala BB Turun TBC");
        if (!hasAnswer(data?.lesuTbc)) missing.push("Gejala Lesu TBC");
      } else {
        if (!hasAnswer(data?.batukBesarTbc) && !hasAnswer(data?.batukTbc)) missing.push("Batuk Berdahak ≥ 2 Minggu");
        if (!hasAnswer(data?.nafsuMakanTbc)) missing.push("Penurunan Nafsu Makan");
        if (!hasAnswer(data?.bbMenurunTbc)) missing.push("BB Menurun Tanpa Sebab");
        if (!hasAnswer(data?.lemahLesuTbc)) missing.push("Tubuh Lemas / Lesu");
        if (!hasAnswer(data?.berkeringatMalamTbc)) missing.push("Berkeringat Malam");
        if (!hasAnswer(data?.batukDarahTbc)) missing.push("Batuk Berdarah");
        if (!hasAnswer(data?.sesakNafasTbc)) missing.push("Sesak Napas");
      }

      if (submenu === "bumil") {
        if (!hasAnswer(data?.pemberianTtd) && !hasAnswer(data?.jumlahTtd)) missing.push("Pemberian TTD");
        if (!hasAnswer(data?.rutinTtd)) missing.push("Rutin Konsumsi TTD");
      } else if (submenu === "nifas") {
        if (!hasAnswer(data?.jumlahVitA) && !hasAnswer(data?.rutinVitA)) missing.push("Pemberian Kapsul Vitamin A");
        if (!hasAnswer(data?.menyusui)) missing.push("Status Menyusui");
        if (!hasAnswer(data?.kbPascaPersalinan)) missing.push("KB Pasca Persalinan");
      } else if (submenu === "dewasa") {
        if (data?.isSkriningTahunan) {
          if (data?.jiwaQ1 === undefined || data?.jiwaQ1 === "") missing.push("Skrining Jiwa Pertanyaan 1");
          if (data?.jiwaQ2 === undefined || data?.jiwaQ2 === "") missing.push("Skrining Jiwa Pertanyaan 2");
          if (data?.jiwaQ3 === undefined || data?.jiwaQ3 === "") missing.push("Skrining Jiwa Pertanyaan 3");
          if (data?.jiwaQ4 === undefined || data?.jiwaQ4 === "") missing.push("Skrining Jiwa Pertanyaan 4");
        }
      } else if (["usekrem-6-14", "usekrem-15-18"].includes(submenu) && data?.isSkriningTahunan) {
        if (!data?.skriningJiwa) missing.push("Status Skrining Kesehatan Jiwa");
        if (isRemajaPerempuan && !data?.periksaHb) missing.push("Status Pemeriksaan Hb");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      }
    }

    if (step === 5) {
      if (!data?.topikPenyuluhan || !String(data.topikPenyuluhan).trim()) {
<<<<<<< HEAD
        missing.push("Topik Penyuluhan");
      }

      const statusRujukan = String(data?.statusRujukan || "Tidak Perlu Rujukan").trim();

      if (!statusRujukan) {
        missing.push("Status Rujukan");
      }
      if (statusRujukan === "Rujuk ke Puskesmas / Pustu" && !step5AutoReferral.perluRujuk && !String(data?.alasanRujukan || "").trim()) {
        missing.push("Indikasi Rujukan");
      }
    }

    if (step === 4 && data?.isSkrining6Bulanan && sixMonthScreeningDue && ["dewasa", "lansia", "usekrem-6-14", "usekrem-15-18"].includes(submenu)) {
      for (const [field, label] of [["mataKanan", "Mata Kanan"], ["mataKiri", "Mata Kiri"], ["telingaKanan", "Telinga Kanan"], ["telingaKiri", "Telinga Kiri"]]) {
        if (!hasAnswer(data?.[field])) missing.push(`Skrining 6 Bulanan ${label}`);
=======
        missing.push('Topik Penyuluhan');
      }
      if (!data?.statusRujukan || !String(data.statusRujukan).trim()) {
        missing.push('Status Rujukan');
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      }
    }

    return {
      isValid: missing.length === 0,
      missingFields: missing,
<<<<<<< HEAD
      errorMessage: missing.length > 0 ? `Mohon lengkapi isian berikut: ${missing.join(", ")}` : "",
    };
  };

  const getBackendCategory = (submenu) => ({
    nifas: "busui",
    "bayi-0-11": "bayi",
    "balita-12-59": "balita",
    "usekrem-6-14": "uskrem_6_14",
    "usekrem-15-18": "uskrem_15_18",
  }[submenu] || submenu);

  const getWargaForId = (id) => activeWargaList.find((w) => String(w.id) === String(id)) || null;

  const fetchBackendPlottingForWarga = useCallback(async (wargaId, preferredExamId = null) => {
    const targetId = String(wargaId || "");
    const warga = getWargaForId(targetId);
    if (!warga || !targetId) return null;

    let examId = preferredExamId ?? globalPemeriksaanData?.[targetId]?.id ?? globalPemeriksaanData?.[warga.id]?.id ?? null;

    if (!examId) {
      try {
        const session = await getSessionForWarga(warga, presensiTanggal);
        const response = await pemeriksaanService.getAllPemeriksaan({
          page: 1,
          limit: 20,
          warga_id: Number(warga.id),
          sesi_posyandu_id: Number(session.id),
        });
        const items = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.items) ? response.data.items : [];
        examId = items[0]?.id ?? null;
      } catch (error) {
        console.warn("Gagal mencari pemeriksaan backend untuk plotting:", error);
        return null;
      }
    }

    if (!examId) return null;

    try {
      const res = await pemeriksaanService.getStep3Plotting(examId);
      const data = res?.data || null;
      if (data) {
        setBackendPlottingByWarga((prev) => ({ ...prev, [targetId]: data }));
      }
      return data;
    } catch (error) {
      console.warn(`Gagal mengambil plotting untuk warga ${targetId}:`, error);
      return null;
    }
  }, [globalPemeriksaanData, getWargaForId, presensiTanggal]);

  const saveCompleteExamination = async (formData, isFromSequential = false) => {
    const targetId = isFromSequential ? selectedWargaId : selectedWargaStep5;
    const targetWarga = getWargaForId(targetId);
    if (!targetWarga) {
      showWarning("Sasaran Tidak Ditemukan", "Pilih sasaran yang berasal dari data backend terlebih dahulu.");
      return;
    }

=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    const measureVal = validateMeasurements(formData);
    if (!measureVal.isValid) {
      showWarning("Validasi Pengukuran", measureVal.message);
      return;
    }

<<<<<<< HEAD
    try {
      const kunjunganId = kunjunganIdByWarga[String(targetWarga.id)] || (await ensureKunjunganId(targetWarga, presensiTanggal));
      setKunjunganIdByWarga((prev) => ({ ...prev, [String(targetWarga.id)]: kunjunganId }));

      const step2Res = await pemeriksaanService.saveStep2({
        kunjungan_id: Number(kunjunganId),
        bb_kg: formData.bb !== "" ? Number(formData.bb) : undefined,
        tb_cm: formData.tb !== "" ? Number(formData.tb) : undefined,
        lingkar_kepala_cm: formData.lk !== "" ? Number(formData.lk) : undefined,
        lila_cm: formData.lila !== "" ? Number(formData.lila) : undefined,
        lingkar_perut_cm: formData.lp !== "" ? Number(formData.lp) : undefined,
        td_sistole: formData.tensiSistol !== "" ? Number(formData.tensiSistol) : undefined,
        td_diastole: formData.tensiDiastol !== "" ? Number(formData.tensiDiastol) : undefined,
        kadar_gula: formData.gulaDarah !== "" ? Number(formData.gulaDarah) : undefined,
      });
      const pemeriksaanId = step2Res?.data?.id;
      if (!pemeriksaanId) throw new Error("Backend tidak mengembalikan ID pemeriksaan setelah Step 2.");
      setPemeriksaanByWarga((prev) => ({ ...prev, [String(targetWarga.id)]: pemeriksaanId }));

      const screeningForm = ["usekrem-6-14", "usekrem-15-18"].includes(activeSubmenu) && !isRemajaPerempuan ? { ...formData, periksaHb: "" } : formData;

      const screeningPayload = mapFlatScreeningToBackend(getBackendCategory(activeSubmenu), screeningForm);
      const step4Res = await pemeriksaanService.saveStep4({
        kunjungan_id: Number(kunjunganId),
        detail_skrining: screeningPayload,
        is_skrining_tahunan: Boolean(formData.isSkriningTahunan),
        is_skrining_6_bulanan: Boolean(formData.isSkrining6Bulanan) && ["dewasa", "lansia", "uskrem_6_14", "uskrem_15_18"].includes(getBackendCategory(activeSubmenu)),
      });
      if (!step4Res?.data?.id) throw new Error("Backend tidak mengembalikan data pemeriksaan setelah Step 4.");
      setPeriodicScreeningInfo((previous) => ({
        loading: false,
        lastSixMonthDate: formData.isSkrining6Bulanan ? presensiTanggal : previous.lastSixMonthDate,
        lastAnnualDate: formData.isSkriningTahunan ? presensiTanggal : previous.lastAnnualDate,
      }));
      await saveImunisasiRows(targetWarga.id, imunisasiRowsByWarga[String(targetWarga.id)] || emptyImunisasiRows());

      const statusRujukan = String(formData.statusRujukan || "").trim();

      const step5Res = await pemeriksaanService.saveStep5({
        kunjungan_id: Number(kunjunganId),
        topik_penyuluhan: String(formData.topikPenyuluhan || "").trim(),
        is_perlu_rujukan: statusRujukan === "Rujuk ke Puskesmas / Pustu",
        alasan_rujukan: formData.alasanRujukan || undefined,
      });
      if (!step5Res?.data?.id) throw new Error("Backend tidak mengembalikan data pemeriksaan setelah Step 5.");

      const plottingRes = await pemeriksaanService.getStep3Plotting(step5Res.data.id || pemeriksaanId);
      if (plottingRes?.data) {
        setBackendPlottingByWarga((prev) => ({ ...prev, [String(targetWarga.id)]: plottingRes.data }));
      }
      setPemeriksaanByWarga((prev) => ({ ...prev, [String(targetWarga.id)]: step5Res.data.id || pemeriksaanId }));

      setGlobalPemeriksaanData?.((prev) => ({ ...prev, [String(targetWarga.id)]: step5Res.data }));
      setCompletedSteps((prev) => ({ ...prev, [String(targetWarga.id)]: { ...(prev[String(targetWarga.id)] || {}), step1: true, step2: true, step3: true, step4: true, step5: true } }));

      setShowSequentialPreviewModal(false);
      setActiveStep(1);
      showSuccess("Pemeriksaan Tersimpan", `Data pemeriksaan untuk "${targetWarga.nama || "Warga"}" berhasil disimpan ke database.`);
      onRefreshData?.();
    } catch (err) {
      console.error("Gagal menyimpan pemeriksaan:", err);
      showWarning("Gagal Menyimpan Pemeriksaan", err?.message || "Data gagal disimpan ke backend.");
    }
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };

  // Handler presensi kehadiran warga di Langkah 1
  const handleToggleKehadiran = (wargaId, status) => {
<<<<<<< HEAD
    setKehadiranWarga((prev) => ({
      ...prev,
      [String(wargaId)]: status,
    }));
  };

  const handleSavePresensiLangkah1 = async () => {
    try {
      const hadirIds = Object.entries(kehadiranWarga)
        .filter(([id, hadir]) => hadir && !backendRegisteredWarga[id])
        .map(([id]) => id);
      for (const id of hadirIds) {
        const w = getWargaForId(id);
        if (!w) continue;
        const kunjunganId = await ensureKunjunganId(w, presensiTanggal);
        setKunjunganIdByWarga((prev) => ({ ...prev, [String(id)]: kunjunganId }));
        setBackendRegisteredWarga((prev) => ({ ...prev, [String(id)]: true }));
        setKehadiranWarga((prev) => ({ ...prev, [String(id)]: true }));
        setCompletedSteps((prev) => ({ ...prev, [String(id)]: { ...(prev[String(id)] || {}), step1: true } }));
        setStepDataByWarga((prev) => ({
          ...prev,
          [String(id)]: {
            ...(prev[String(id)] || {}),
            warga: w,
            langkah1: {
              ...(prev[String(id)]?.langkah1 || {}),
              nik: w.nik,
              nama: w.nama,
              tglLahir: w.tglLahir,
              gender: w.gender,
              usiaKehamilan: waktuKunjunganPresensi[id] || "",
              waktuKunjunganNifas: waktuKunjunganPresensi[id] || "",
            },
          },
        }));
      }
      showSuccess("Presensi Tersimpan", `Presensi ${hadirIds.length} sasaran berhasil disimpan ke database.`);
      onRefreshData?.();
    } catch (err) {
      showWarning("Gagal Menyimpan Presensi", err?.message || "Presensi gagal disimpan ke backend.");
    }
  };

  // Step handlers for Mode Pilih Langkah
  const handleSaveLangkah1 = async (e) => {
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    e.preventDefault();
    const valResult = validateStepData(1, langkah1Form, activeSubmenu);
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
<<<<<<< HEAD

    if (!user?.posyandu_id) {
      showWarning("Posyandu Belum Terhubung", "Akun kader belum memiliki Posyandu pada backend.");
      return;
    }

    try {
      const res = await wargaService.createWarga({
        nik: langkah1Form.nik.trim(),
        nama_lengkap: langkah1Form.nama.trim(),
        jenis_kelamin: langkah1Form.gender === "Laki-laki" || langkah1Form.gender === "L" ? "L" : "P",
        tanggal_lahir: langkah1Form.tglLahir,
        posyandu_id: Number(user.posyandu_id),
        kategori_sasaran: getBackendCategory(activeSubmenu),
      });
      const created = res?.data;
      if (!created?.id) throw new Error("Backend tidak mengembalikan data warga yang baru dibuat.");
      const mapped = mapBackendWargaToFrontend(created);
      setGlobalSasaranList?.((prev) => [mapped, ...(prev || []).filter((x) => String(x.id) !== String(mapped.id))]);
      setStepDataByWarga((prev) => ({ ...prev, [String(mapped.id)]: { warga: mapped, langkah1: { ...langkah1Form } } }));
      setCompletedSteps((prev) => ({ ...prev, [String(mapped.id)]: { ...(prev[String(mapped.id)] || {}), step1: true } }));
      setSelectedWargaId(String(mapped.id));
      setSelectedWargaStep2(String(mapped.id));
      setSelectedWargaStep3(String(mapped.id));
      setSelectedWargaStep4(String(mapped.id));
      setSelectedWargaStep5(String(mapped.id));
      showSuccess("Sasaran Tersimpan", `Data warga "${mapped.nama}" berhasil disimpan ke database.`);
      onRefreshData?.();
    } catch (err) {
      showWarning("Gagal Menyimpan Sasaran", err?.message || "Data warga gagal disimpan ke backend.");
    }
  };

  const handleSaveLangkah2 = async (e) => {
    e.preventDefault();
    if (!selectedWargaStep2) {
      showWarning("Pilih Sasaran Warga", "Silakan pilih nama warga yang akan diperiksa pada dropdown Langkah 2 terlebih dahulu.");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      return;
    }
    const valResult = validateStepData(2, langkah2Form, activeSubmenu);
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
<<<<<<< HEAD
    const warga = getWargaForId(selectedWargaStep2);
    try {
      const kunjunganId = kunjunganIdByWarga[String(selectedWargaStep2)] || (await ensureKunjunganId(warga, presensiTanggal));
      const res = await pemeriksaanService.saveStep2({
        kunjungan_id: Number(kunjunganId),
        bb_kg: Number(langkah2Form.bb),
        tb_cm: langkah2Form.tb !== "" ? Number(langkah2Form.tb) : undefined,
        lingkar_kepala_cm: langkah2Form.lk !== "" ? Number(langkah2Form.lk) : undefined,
        lila_cm: langkah2Form.lila !== "" ? Number(langkah2Form.lila) : undefined,
        lingkar_perut_cm: langkah2Form.lp !== "" ? Number(langkah2Form.lp) : undefined,
        td_sistole: langkah2Form.tensiSistol !== "" ? Number(langkah2Form.tensiSistol) : undefined,
        td_diastole: langkah2Form.tensiDiastol !== "" ? Number(langkah2Form.tensiDiastol) : undefined,
        kadar_gula: langkah2Form.gulaDarah !== "" ? Number(langkah2Form.gulaDarah) : undefined,
      });
      if (!res?.data?.id) throw new Error("Backend tidak mengembalikan ID pemeriksaan.");
      setKunjunganIdByWarga((prev) => ({ ...prev, [String(selectedWargaStep2)]: kunjunganId }));
      setPemeriksaanByWarga((prev) => ({ ...prev, [String(selectedWargaStep2)]: res.data.id }));
      setStepDataByWarga((prev) => ({ ...prev, [String(selectedWargaStep2)]: { ...(prev[String(selectedWargaStep2)] || {}), warga, langkah2: { ...langkah2Form } } }));
      const savedWargaId = String(selectedWargaStep2);
      setCompletedSteps((prev) => ({ ...prev, [savedWargaId]: { ...(prev[savedWargaId] || {}), step2: true } }));
      setBackendStep2CompletedWarga((prev) => ({ ...prev, [savedWargaId]: true }));
      const plotRes = await pemeriksaanService.getStep3Plotting(res.data.id);
      if (plotRes?.data) setBackendPlottingByWarga((prev) => ({ ...prev, [savedWargaId]: plotRes.data }));

      // Bersihkan form dan pindahkan dropdown ke warga berikutnya.
      const nextWarga = availableWargaStep2.find((item) => String(item.id) !== savedWargaId);
      setLangkah2Form({ bb: "", tb: "", lila: "", lk: "", lp: "", tensiSistol: "", tensiDiastol: "", gulaDarah: "" });
      setSelectedWargaStep2(nextWarga ? String(nextWarga.id) : "");
      await fetchBackendPlottingForWarga(savedWargaId, res.data.id);
      showSuccess("Langkah 2 Tersimpan", `Pengukuran untuk "${warga?.nama || "Warga"}" berhasil disimpan ke database.`);
    } catch (err) {
      showWarning("Gagal Menyimpan Pengukuran", err?.message || "Pengukuran gagal disimpan ke backend.");
    }
  };

  useEffect(() => {
    if (examinationMode !== "per-step" || !selectedWargaStep3) return undefined;

    const targetId = String(selectedWargaStep3);
    if (backendPlottingByWarga[targetId]) return undefined;

    let cancelled = false;

    const hydrateStep3Plotting = async () => {
      const plot = await fetchBackendPlottingForWarga(targetId);
      if (cancelled || !plot) return;
      setSelectedWargaStep3(targetId);
    };

    hydrateStep3Plotting();

    return () => {
      cancelled = true;
    };
  }, [examinationMode, selectedWargaStep3, backendPlottingByWarga, fetchBackendPlottingForWarga]);

  const handleSaveLangkah3 = async (e) => {
    e.preventDefault();
    const targetId = String(selectedWargaStep3 || "");
    const warga = getWargaForId(targetId);
    const plotting = backendPlottingByWarga[targetId];
    if (!warga) {
      showWarning("Pilih Sasaran Warga", "Silakan pilih sasaran dari data backend.");
      return;
    }
    if (!plotting) {
      showWarning("Plotting Belum Tersedia", "Simpan Langkah 2 terlebih dahulu agar hasil plotting dari backend tersedia.");
      return;
    }
    setStepDataByWarga((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] || {}), warga, langkah3: plotting } }));
    setCompletedSteps((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] || {}), step3: true } }));
    showSuccess("Langkah 3 Tersedia", `Hasil plotting untuk "${warga.nama || "Warga"}" diambil dari backend.`);
  };

  const handleSaveLangkah4 = async (e) => {
    e.preventDefault();
    if (!selectedWargaStep4) {
      showWarning("Pilih Sasaran Warga", "Silakan pilih nama warga yang akan diskrining pada dropdown Langkah 4 terlebih dahulu.");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      return;
    }
    const valResult = validateStepData(4, langkah4Form, activeSubmenu);
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
    const targetId = String(selectedWargaStep4);
<<<<<<< HEAD
    const warga = getWargaForId(targetId);
    try {
      const kunjunganId = kunjunganIdByWarga[targetId] || (await ensureKunjunganId(warga, presensiTanggal));
      const screeningForm = ["usekrem-6-14", "usekrem-15-18"].includes(activeSubmenu) && !isRemajaPerempuan ? { ...langkah4Form, periksaHb: "" } : langkah4Form;

      const screeningPayload = mapFlatScreeningToBackend(getBackendCategory(activeSubmenu), screeningForm);
      const res = await pemeriksaanService.saveStep4({
        kunjungan_id: Number(kunjunganId),
        detail_skrining: screeningPayload,
        is_skrining_tahunan: Boolean(langkah4Form.isSkriningTahunan),
        is_skrining_6_bulanan: Boolean(langkah4Form.isSkrining6Bulanan) && ["dewasa", "lansia", "uskrem_6_14", "uskrem_15_18"].includes(getBackendCategory(activeSubmenu)),
      });
      if (!res?.data?.id) throw new Error("Backend tidak mengembalikan data pemeriksaan setelah Step 4.");
      setPeriodicScreeningInfo((previous) => ({
        loading: false,
        lastSixMonthDate: langkah4Form.isSkrining6Bulanan ? presensiTanggal : previous.lastSixMonthDate,
        lastAnnualDate: langkah4Form.isSkriningTahunan ? presensiTanggal : previous.lastAnnualDate,
      }));
      await saveImunisasiRows(targetId, imunisasiRowsByWarga[targetId] || emptyImunisasiRows());
      setKunjunganIdByWarga((prev) => ({ ...prev, [targetId]: kunjunganId }));
      setPemeriksaanByWarga((prev) => ({ ...prev, [targetId]: res.data.id }));
      setStepDataByWarga((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] || {}), warga, langkah4: res.data.detail_skrining || screeningPayload } }));
      setCompletedSteps((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] || {}), step4: true } }));
      setBackendStep4CompletedWarga((prev) => ({ ...prev, [targetId]: true }));
      showSuccess("Langkah 4 Tersimpan", `Skrining untuk "${warga?.nama || "Warga"}" berhasil disimpan ke database.`);
    } catch (err) {
      showWarning("Gagal Menyimpan Skrining", err?.message || "Skrining gagal disimpan ke backend.");
    }
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  };

  const handleSaveLangkah5 = async (e) => {
    e.preventDefault();
    if (!selectedWargaStep5) {
<<<<<<< HEAD
      showWarning("Pilih Sasaran Warga", "Silakan pilih nama warga pada dropdown Langkah 5 terlebih dahulu.");
      return;
    }
    const valResult = validateStepData(5, langkah5Form, activeSubmenu);
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    if (!valResult.isValid) {
      showWarning("Data Belum Lengkap", valResult.errorMessage);
      return;
    }
    const targetId = String(selectedWargaStep5);
<<<<<<< HEAD
    const warga = getWargaForId(targetId);
    try {
      const kunjunganId = kunjunganIdByWarga[targetId] || (await ensureKunjunganId(warga, presensiTanggal));
      const res = await pemeriksaanService.saveStep5({
        kunjungan_id: Number(kunjunganId),
        topik_penyuluhan: String(langkah5Form.topikPenyuluhan || "").trim(),
        is_perlu_rujukan: String(langkah5Form.statusRujukan || "").trim() === "Rujuk ke Puskesmas / Pustu",
        alasan_rujukan: String(langkah5Form.alasanRujukan || "").trim() || undefined,
      });
      if (!res?.data?.id) throw new Error("Backend tidak mengembalikan data pemeriksaan setelah Step 5.");

      const savedRujukanStatus = res?.rujukan || res?.data?.is_perlu_rujukan === true ? "Rujuk ke Puskesmas / Pustu" : "Tidak Perlu Rujukan";
      const savedLangkah5 = {
        ...langkah5Form,
        topikPenyuluhan: res?.data?.topik_penyuluhan ?? langkah5Form.topikPenyuluhan ?? "",
        statusRujukan: savedRujukanStatus,
        alasanRujukan: res?.referral_reasons?.manual || langkah5Form.alasanRujukan || "",
      };

      setKunjunganIdByWarga((prev) => ({ ...prev, [targetId]: kunjunganId }));
      setPemeriksaanByWarga((prev) => ({ ...prev, [targetId]: res.data.id }));
      setGlobalPemeriksaanData?.((prev) => ({ ...prev, [targetId]: res.data }));
      setStepDataByWarga((prev) => ({
        ...prev,
        [targetId]: {
          ...(prev[targetId] || {}),
          warga,
          langkah5: savedLangkah5,
        },
      }));
      setLangkah5Form(savedLangkah5);
      setSequentialForm((prev) => ({ ...prev, ...savedLangkah5 }));
      setCompletedSteps((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] || {}), step5: true } }));
      setBackendStep5CompletedWarga((prev) => ({ ...prev, [targetId]: true }));
      showSuccess("Langkah 5 Tersimpan", `Pemeriksaan untuk "${warga?.nama || "Warga"}" selesai dan tersimpan di database.`);
      onRefreshData?.();
    } catch (err) {
      showWarning("Gagal Menyelesaikan Pemeriksaan", err?.message || "Langkah 5 gagal disimpan ke backend.");
    }
  };

  // Step handlers for Mode Bertahap
  const handleNextSequentialStep = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (activeStep === 1) {
      if (!selectedWargaId) {
        showWarning("Pilih Sasaran Warga", "Silakan pilih sasaran dari database terlebih dahulu.");
        return;
      }
      const w = getWargaForId(selectedWargaId);
      if (w) {
        setKehadiranWarga((prev) => ({ ...prev, [String(w.id)]: true }));
        try {
          const kunjunganId = kunjunganIdByWarga[String(w.id)] || (await ensureKunjunganId(w, presensiTanggal));
          setKunjunganIdByWarga((prev) => ({ ...prev, [String(w.id)]: kunjunganId }));
          setCompletedSteps((prev) => ({ ...prev, [String(w.id)]: { ...(prev[String(w.id)] || {}), step1: true } }));
        } catch (err) {
          showWarning("Gagal Membuka Kunjungan", err?.message || "Kunjungan gagal dibuat.");
          return;
        }
      }
      setActiveStep(2);
      return;
    }
    if (activeStep === 2) {
      const val = validateStepData(2, sequentialForm, activeSubmenu);
      if (!val.isValid) {
        showWarning("Data Belum Lengkap", val.errorMessage);
        return;
      }
      const w = getWargaForId(selectedWargaId);
      try {
        const kunjunganId = kunjunganIdByWarga[String(selectedWargaId)] || (await ensureKunjunganId(w, presensiTanggal));
        const res = await pemeriksaanService.saveStep2({
          kunjungan_id: Number(kunjunganId),
          bb_kg: Number(sequentialForm.bb),
          tb_cm: sequentialForm.tb !== "" ? Number(sequentialForm.tb) : undefined,
          lingkar_kepala_cm: sequentialForm.lk !== "" ? Number(sequentialForm.lk) : undefined,
          lila_cm: sequentialForm.lila !== "" ? Number(sequentialForm.lila) : undefined,
          lingkar_perut_cm: sequentialForm.lp !== "" ? Number(sequentialForm.lp) : undefined,
          td_sistole: sequentialForm.tensiSistol !== "" ? Number(sequentialForm.tensiSistol) : undefined,
          td_diastole: sequentialForm.tensiDiastol !== "" ? Number(sequentialForm.tensiDiastol) : undefined,
          kadar_gula: sequentialForm.gulaDarah !== "" ? Number(sequentialForm.gulaDarah) : undefined,
        });
        if (!res?.data?.id) throw new Error("Backend tidak mengembalikan ID pemeriksaan.");
        setKunjunganIdByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: kunjunganId }));
        setPemeriksaanByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: res.data.id }));
        const plotRes = await pemeriksaanService.getStep3Plotting(res.data.id);
        if (plotRes?.data) setBackendPlottingByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: plotRes.data }));
        setStepDataByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: { ...(prev[String(selectedWargaId)] || {}), warga: w, langkah2: { ...sequentialForm } } }));
        setCompletedSteps((prev) => ({ ...prev, [String(selectedWargaId)]: { ...(prev[String(selectedWargaId)] || {}), step1: true, step2: true } }));
        setActiveStep(3);
      } catch (err) {
        showWarning("Gagal Menyimpan Pengukuran", err?.message || "Pengukuran gagal disimpan ke backend.");
      }
      return;
    }
    if (activeStep === 3) {
      if (!activeBackendPlotting) {
        showWarning("Plotting Belum Tersedia", "Hasil plotting belum tersedia dari backend.");
        return;
      }
      setStepDataByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: { ...(prev[String(selectedWargaId)] || {}), langkah3: activeBackendPlotting } }));
      setCompletedSteps((prev) => ({ ...prev, [String(selectedWargaId)]: { ...(prev[String(selectedWargaId)] || {}), step3: true } }));
      setActiveStep(4);
      return;
    }
    if (activeStep === 4) {
      const val = validateStepData(4, sequentialForm, activeSubmenu);
      if (!val.isValid) {
        showWarning("Data Belum Lengkap", val.errorMessage);
        return;
      }
      try {
        const kunjunganId = kunjunganIdByWarga[String(selectedWargaId)] || (await ensureKunjunganId(getWargaForId(selectedWargaId), presensiTanggal));
        const screeningForm = ["usekrem-6-14", "usekrem-15-18"].includes(activeSubmenu) && !isRemajaPerempuan ? { ...sequentialForm, periksaHb: "" } : sequentialForm;

        const screeningPayload = mapFlatScreeningToBackend(getBackendCategory(activeSubmenu), screeningForm);
        const res = await pemeriksaanService.saveStep4({
          kunjungan_id: Number(kunjunganId),
          detail_skrining: screeningPayload,
          is_skrining_tahunan: Boolean(sequentialForm.isSkriningTahunan),
          is_skrining_6_bulanan: Boolean(sequentialForm.isSkrining6Bulanan) && ["dewasa", "lansia", "uskrem_6_14", "uskrem_15_18"].includes(getBackendCategory(activeSubmenu)),
        });
        if (!res?.data?.id) throw new Error("Backend tidak mengembalikan data pemeriksaan setelah Step 4.");
        setPeriodicScreeningInfo((previous) => ({
          loading: false,
          lastSixMonthDate: sequentialForm.isSkrining6Bulanan ? presensiTanggal : previous.lastSixMonthDate,
          lastAnnualDate: sequentialForm.isSkriningTahunan ? presensiTanggal : previous.lastAnnualDate,
        }));
        await saveImunisasiRows(selectedWargaId, imunisasiRowsByWarga[String(selectedWargaId)] || emptyImunisasiRows());
        setKunjunganIdByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: kunjunganId }));
        setPemeriksaanByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: res.data.id }));
        setStepDataByWarga((prev) => ({ ...prev, [String(selectedWargaId)]: { ...(prev[String(selectedWargaId)] || {}), langkah4: res.data.detail_skrining || screeningPayload } }));
        setCompletedSteps((prev) => ({ ...prev, [String(selectedWargaId)]: { ...(prev[String(selectedWargaId)] || {}), step4: true } }));
        setActiveStep(5);
      } catch (err) {
        showWarning("Gagal Menyimpan Skrining", err?.message || "Skrining gagal disimpan ke backend.");
      }
    }
  };

  const hydrateSequentialStep2FromBackend = async () => {
    const warga = getWargaForId(selectedWargaId);
    if (!warga) return sequentialForm;

    try {
      const session = await getSessionForWarga(warga, presensiTanggal);
      const response = await pemeriksaanService.getAllPemeriksaan({
        page: 1,
        limit: 100,
        warga_id: Number(warga.id),
        sesi_posyandu_id: Number(session.id),
      });
      const records = Array.isArray(response?.data) ? response.data : [];
      const record = records.find((item) => Number(item?.kunjungan?.sesi_posyandu_id || item?.kunjungan?.sesiPosyandu?.id) === Number(session.id)) || records[0];
      if (!record) return sequentialForm;

      const backendMeasurements = {
        bb: record.bb_kg,
        tb: record.tb_cm,
        lila: record.lila_cm,
        lk: record.lingkar_kepala_cm,
        lp: record.lingkar_perut_cm,
        tensiSistol: record.td_sistole,
        tensiDiastol: record.td_diastole,
        gulaDarah: record.kadar_gula,
      };
      const hydratedForm = { ...sequentialForm };
      Object.entries(backendMeasurements).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== "") hydratedForm[field] = String(value);
      });
      setSequentialForm(hydratedForm);
      if (record.id) setPemeriksaanByWarga((prev) => ({ ...prev, [String(warga.id)]: record.id }));
      return hydratedForm;
    } catch (error) {
      console.warn("Gagal memulihkan pengukuran sesi aktif dari backend:", error);
      return sequentialForm;
    }
  };

  const handleTriggerSequentialPreview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const formData = await hydrateSequentialStep2FromBackend();
    for (const s of [1, 2, 4, 5]) {
      const val = validateStepData(s, formData, activeSubmenu);
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      if (!val.isValid) {
        showWarning(`Data Langkah ${s} Belum Lengkap`, val.errorMessage);
        setActiveStep(s);
        return;
      }
    }
    setShowSequentialPreviewModal(true);
  };

<<<<<<< HEAD
  const handleSaveSequentialAll = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const formData = await hydrateSequentialStep2FromBackend();
    for (const s of [1, 2, 4, 5]) {
      const val = validateStepData(s, formData, activeSubmenu);
=======
  const handleSaveSequentialAll = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    for (const s of [1, 2, 4, 5]) {
      const val = validateStepData(s, sequentialForm, activeSubmenu);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
      if (!val.isValid) {
        showWarning(`Data Langkah ${s} Belum Lengkap`, val.errorMessage);
        setActiveStep(s);
        return;
      }
    }
<<<<<<< HEAD
    saveCompleteExamination(formData, true);
  };

  const activeSourceDataL3 = useMemo(() => {
    const targetId = examinationMode === "sequential" ? selectedWargaId : selectedWargaStep3;
    if (!targetId) return null;
    return activeWargaList.find((w) => String(w.id) === String(targetId)) || null;
  }, [examinationMode, selectedWargaId, selectedWargaStep3, activeWargaList]);

  const activeBackendPlotting = useMemo(() => {
    const targetId = examinationMode === "sequential" ? selectedWargaId : selectedWargaStep3;
    return targetId ? backendPlottingByWarga[String(targetId)] || null : null;
  }, [examinationMode, selectedWargaId, selectedWargaStep3, backendPlottingByWarga]);

  const plottingResult = activeBackendPlotting?.hasil_plot || null;

  const activeStep5TargetId = examinationMode === "per-step" ? selectedWargaStep5 : selectedWargaId;
  const activeStep5BackendExam = useMemo(() => {
    if (!activeStep5TargetId) return null;
    return globalPemeriksaanData?.[String(activeStep5TargetId)] || globalPemeriksaanData?.[activeStep5TargetId] || null;
  }, [globalPemeriksaanData, activeStep5TargetId]);

  // Step 5 harus mengambil keputusan rujukan yang sudah tersimpan di backend
  // untuk sesi yang dipilih, bukan mengandalkan default state frontend.
  useEffect(() => {
    if (activeStep !== 5 || !activeStep5TargetId) return undefined;

    let cancelled = false;
    const hydrateStep5FromBackend = async () => {
      try {
        const warga = getWargaForId(activeStep5TargetId);
        if (!warga) return;

        const session = await getSessionForWarga(warga, presensiTanggal);
        const response = await pemeriksaanService.getAllPemeriksaan({
          page: 1,
          limit: 10,
          warga_id: Number(activeStep5TargetId),
          sesi_posyandu_id: Number(session.id),
        });

        const items = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.items) ? response.data.items : [];
        const backendExam = items[0] || activeStep5BackendExam;
        if (!backendExam || cancelled) return;

        if (backendExam.id) {
          const plottingResponse = await pemeriksaanService.getStep3Plotting(backendExam.id);
          if (!cancelled && plottingResponse?.data) {
            setBackendPlottingByWarga((previous) => ({ ...previous, [String(activeStep5TargetId)]: plottingResponse.data }));
          }
        }

        const persistedRujukan = backendExam?.is_perlu_rujukan === true || Boolean(backendExam?.rujukan) ? "Rujuk ke Puskesmas / Pustu" : backendExam?.is_perlu_rujukan === false ? "Tidak Perlu Rujukan" : "";
        const persistedTopik = backendExam?.topik_penyuluhan ?? "";

        setGlobalPemeriksaanData?.((prev) => ({ ...prev, [String(activeStep5TargetId)]: backendExam }));

        if (examinationMode === "per-step") {
          setLangkah5Form((prev) => ({
            ...prev,
            topikPenyuluhan: persistedTopik || prev.topikPenyuluhan || "",
            statusRujukan: persistedRujukan || prev.statusRujukan || "",
          }));
        } else {
          setSequentialForm((prev) => ({
            ...prev,
            topikPenyuluhan: persistedTopik || prev.topikPenyuluhan || "",
            statusRujukan: persistedRujukan || prev.statusRujukan || "",
          }));
        }
      } catch (error) {
        console.error("Gagal mengambil data Step 5 dari backend:", error);
      }
    };

    hydrateStep5FromBackend();
    return () => {
      cancelled = true;
    };
  }, [activeStep, examinationMode, activeStep5TargetId, presensiTanggal]);

  const activeStep5Plotting = useMemo(() => {
    if (!activeStep5TargetId) return null;
    return backendPlottingByWarga[String(activeStep5TargetId)] || null;
  }, [backendPlottingByWarga, activeStep5TargetId]);

  // Step 5 uses the current backend plot and its combined referral reasons.
  const step5AutoReferral = useMemo(() => {
    const plotting = activeStep5Plotting;
    const plotResult = plotting?.hasil_plot || {};
    const reasons = Array.isArray(plotting?.referral_reasons) ? plotting.referral_reasons : [];
    const hasPlotRisk = Boolean(plotResult.is_perlu_rujukan || plotResult.status_plot === "merah" || Object.values(plotResult).some((item) => item?.is_merah === true));

    return {
      perluRujuk: reasons.length > 0 || hasPlotRisk,
      reasons,
    };
  }, [activeStep5Plotting]);

  // Sinkronisasi status rujukan hanya dari hasil backend plotting.
  useEffect(() => {
    if (activeStep !== 5) return;

    const perluRujukan = Boolean(activeStep5Plotting?.hasil_plot?.is_perlu_rujukan || step5AutoReferral?.perluRujuk);

    const effectiveStatus = perluRujukan ? "Rujuk ke Puskesmas / Pustu" : "Tidak Perlu Rujukan";

    if (examinationMode === "per-step") {
      setLangkah5Form((prev) => {
        if (prev.statusRujukan === effectiveStatus) return prev;

        return {
          ...prev,
          statusRujukan: effectiveStatus,
        };
      });
    } else {
      setSequentialForm((prev) => {
        if (prev.statusRujukan === effectiveStatus) return prev;

        return {
          ...prev,
          statusRujukan: effectiveStatus,
        };
      });
    }
  }, [activeStep, activeStep5Plotting, examinationMode, step5AutoReferral]);
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header Card (Original Style with Icon & Title) */}
<<<<<<< HEAD
      <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white rounded-4 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "56px", height: "56px" }}>
              <Stethoscope size={28} />
            </div>
            <div>
              <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill mb-1 small">Form Pemeriksaan 5 Langkah</span>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              <h2 className="fw-bold text-dark mb-1">{currentCategory.label}</h2>
              <p className="text-secondary small mb-0">Alur pencatatan dan evaluasi kesehatan berkala per-langkah</p>
            </div>
          </div>

          {/* Top Right Header Buttons: Segmented [Pilih Langkah] [Bertahap] & Kembali Button */}
          <div className="d-flex align-items-center gap-2">
<<<<<<< HEAD
            <div className="d-inline-flex align-items-center bg-light p-1 rounded-pill border shadow-xs" style={{ borderColor: "#cbd5e1" }}>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all ${examinationMode === "per-step" ? "bg-white text-dark shadow-sm border" : "text-secondary border-0"}`}
                style={{ fontSize: "0.825rem" }}
                onClick={() => {
                  const targetId = String(selectedWargaId || selectedWargaStep4 || "");
                  setSelectedWargaStep2(targetId);
                  setSelectedWargaStep3(targetId);
                  setSelectedWargaStep4(targetId);
                  setSelectedWargaStep5(targetId);
                  setLangkah1Form((previous) => ({ ...previous, ...sequentialForm }));
                  setLangkah2Form((previous) => ({ ...previous, ...sequentialForm }));
                  setLangkah4Form((previous) => ({ ...previous, ...sequentialForm }));
                  setLangkah5Form((previous) => ({ ...previous, ...sequentialForm }));
                  setExaminationMode("per-step");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                }}
              >
                Pilih Langkah
              </button>
<<<<<<< HEAD
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all ${examinationMode === "sequential" ? "text-white shadow-sm border-0" : "text-secondary border-0"}`}
                style={{
                  backgroundColor: examinationMode === "sequential" ? "#2b2e4a" : "transparent",
                  fontSize: "0.825rem",
                }}
                onClick={() => {
                  const targetId = String(selectedWargaStep4 || selectedWargaStep2 || selectedWargaStep3 || selectedWargaStep5 || selectedWargaId || "");
                  if (targetId) setSelectedWargaId(targetId);
                  setSequentialForm((previous) => ({ ...previous, ...langkah1Form, ...langkah2Form, ...langkah4Form, ...langkah5Form }));
                  setExaminationMode("sequential");
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                }}
              >
                Bertahap
              </button>
            </div>

<<<<<<< HEAD
            <button className="btn btn-outline-secondary rounded-3 py-2 px-3 d-flex align-items-center gap-2 shadow-sm" style={{ fontSize: "0.875rem" }} onClick={() => onNavigate("data-sasaran")}>
=======
            <button 
              className="btn btn-outline-secondary rounded-3 py-2 px-3 d-flex align-items-center gap-2 shadow-sm"
              style={{ fontSize: '0.875rem' }}
              onClick={() => onNavigate('data-sasaran')}
            >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              <ArrowLeft size={15} />
              <span>Kembali ke Data Sasaran</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Examination Card Container */}
<<<<<<< HEAD
      <div className="card card-custom bg-white border-0 shadow-sm overflow-hidden" style={{ borderRadius: "20px" }}>
        {/* ========================================================================= */}
        {/* MODE 2 (BERTAHAP): STEPPER LINGKARAN (1) -> (2) -> (3) -> (4) -> (5) */}
        {/* ========================================================================= */}
        {examinationMode === "sequential" ? (
          <div className="d-flex align-items-center justify-content-center my-4 py-3">
            {[1, 2, 3, 4, 5].map((stepNum, idx) => (
              <React.Fragment key={stepNum}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold transition-all shadow-sm ${
                    activeStep === stepNum ? "bg-dark text-white" : activeStep > stepNum ? "bg-secondary text-white" : "bg-light text-secondary border"
                  }`}
                  style={{
                    width: "58px",
                    height: "58px",
                    fontSize: "1.35rem",
                    backgroundColor: activeStep === stepNum ? "#2b2e4a" : activeStep > stepNum ? "#475569" : "#e2e8f0",
                    color: activeStep === stepNum || activeStep > stepNum ? "#ffffff" : "#64748b",
                    cursor: "default",
                    userSelect: "none",
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                  }}
                  title={`Langkah ${stepNum}`}
                >
                  {stepNum}
                </div>

                {idx < 4 && (
                  <div className="mx-2 mx-md-4 text-muted d-flex align-items-center">
<<<<<<< HEAD
                    <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#94a3b8" }}>&rarr;</span>
=======
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#94a3b8' }}>&rarr;</span>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                  className={`py-3 px-4.5 rounded-3 fw-bold text-nowrap transition-all border ${isActive ? "bg-white text-primary border-2 border-primary shadow-sm" : "bg-white text-secondary border-light-subtle shadow-xs"}`}
                  style={{
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: isActive ? "#F25B8E" : "#334155",
                    borderColor: isActive ? "#F25B8E" : "#cbd5e1",
                    boxShadow: isActive ? "0 4px 14px rgba(242, 91, 142, 0.45)" : "0 1px 3px rgba(0,0,0,0.05)",
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
        <div className="p-4 p-md-5" style={{ backgroundColor: "#cbd5e1" }}>
=======
        <div className="p-4 p-md-5" style={{ backgroundColor: '#cbd5e1' }}>

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
          {/* ========================================================================= */}
          {/* LANGKAH 1: PENDAFTARAN & PRESENSI KEHADIRAN SASARAN */}
          {/* ========================================================================= */}
          {activeStep === 1 && (
            <div>
              {/* Header Langkah 1 */}
              <div className="mb-4">
                <h3 className="fw-bold text-dark mb-1">Pendaftaran &amp; Presensi Sasaran</h3>
<<<<<<< HEAD
                    <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mt-2 text-dark">
                  <Calendar size={17} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="small text-muted">Sesi Presensi</div>
                    {presensiSesiLoading ? (
                      <div className="small fw-semibold">Memuat sesi Posyandu...</div>
                    ) : presensiSesiAktif ? (
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="small fw-semibold">
                          {formatDateId(presensiSesiAktif.tanggal_pelaksanaan)}
                          {presensiSesiAktif.lokasi ? ` · ${presensiSesiAktif.lokasi}` : ""}
                        </span>
                        <span className={`badge ${presensiSesiAktif.status === "open" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                          {presensiSesiAktif.status === "open" ? "Dibuka" : "Ditutup"}
                        </span>
                      </div>
                      ) : (
                      <div className="small fw-semibold text-danger">Belum ada sesi Posyandu pada tanggal ini</div>
                    )}
                  </div>
                      <div>
                        <label className="form-label small text-muted mb-1" htmlFor="presensi-session-date">Tanggal sesi (maksimal 7 hari)</label>
                        <input
                          id="presensi-session-date"
                          type="date"
                          className="form-control form-control-sm"
                          min={getLocalDateOffset(-6)}
                          max={getLocalDateOnly()}
                          value={presensiTanggal}
                          onChange={(event) => setPresensiTanggal(event.target.value)}
                        />
                      </div>
                </div>
                    <div className="small text-muted mt-2">Sesi berstatus Dibuka dapat diproses pada hari pelaksanaan sampai enam hari setelahnya. Sesi Ditutup tidak dapat diubah.</div>
=======
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              </div>

              {/* =================================================================== */}
              {/* KONTEN UTAMA LANGKAH 1: DAFTAR PRESENSI & IDENTITAS SASARAN */}
              {/* =================================================================== */}
              <div className="card bg-white border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <Users size={20} className="text-primary" />
<<<<<<< HEAD
                      <span>Daftar Presensi Sasaran</span>
                    </h5>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm" style={{ maxWidth: "280px" }}>
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Search size={14} />
                      </span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="Cari nama atau NIK..." value={searchWargaQuery} onChange={(e) => setSearchWargaQuery(e.target.value)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
<<<<<<< HEAD
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                    <thead className="table-light">
                      <tr className="text-muted fw-bold">
                        <th className="py-2.5 px-3 text-center" style={{ width: "45px" }}>
                          No
                        </th>
                        <th className="py-2.5 px-3" style={{ minWidth: "180px" }}>
                          Nama Lengkap / NIK
                        </th>
                        <th className="py-2.5 px-3" style={{ minWidth: "130px" }}>
                          Tanggal Lahir / Usia
                        </th>
                        <th className="py-2.5 px-3 text-center" style={{ minWidth: "100px" }}>
                          Jenis Kelamin
                        </th>
                        {activeSubmenu === "bumil" && (
                          <th className="py-2.5 px-3 text-center" style={{ minWidth: "150px" }}>
                            Usia Kehamilan
                          </th>
                        )}
                        {activeSubmenu === "nifas" && (
                          <th className="py-2.5 px-3 text-center" style={{ minWidth: "170px" }}>
                            Waktu Kunjungan
                          </th>
                        )}
                        <th className="py-2.5 px-3 text-center" style={{ minWidth: "150px" }}>
                          Alamat
                        </th>
                        <th className="py-2.5 px-3 text-center" style={{ minWidth: "160px", width: "160px" }}>
                          Status Kehadiran
                        </th>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSasaranLangkah1.length === 0 ? (
                        <tr>
<<<<<<< HEAD
                          <td colSpan={activeSubmenu === "bumil" || activeSubmenu === "nifas" ? 8 : 7} className="text-center py-5 text-muted">
=======
                          <td colSpan={8} className="text-center py-5 text-muted">
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                                <p className="text-muted small mb-0" style={{ maxWidth: "440px" }}>
=======
                                <p className="text-muted small mb-0" style={{ maxWidth: '440px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                  Ketik nama lengkap atau NIK pada kolom pencarian di atas untuk menampilkan data sasaran kategori <strong>{currentCategory.label}</strong> dan menandai kehadiran presensi hari ini.
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredSasaranLangkah1.map((warga, idx) => {
                          const wId = String(warga.id);
<<<<<<< HEAD

                          const presenceStatus = kehadiranWarga[wId];
                          const isAlreadyRegistered = backendRegisteredWarga[wId] === true;
                          const isHadir = presenceStatus === true;
                          const isTidakHadir = presenceStatus === false;
                              const isBelumDatang = !isAlreadyRegistered && presenceStatus === undefined;
                              const canMarkAttendance = presensiSesiAktif?.status === "open";
                          const isSelectedSequential = examinationMode === "sequential" && selectedWargaId === wId;
                          const rawTglLahir = warga.tglLahir || warga.tanggal_lahir || warga._raw?.tanggal_lahir || warga._raw?.tglLahir || "";
                          const displayTgl = rawTglLahir ? String(rawTglLahir).slice(0, 10) : "-";
                          const ageInMonths = getAgeInMonths(warga);
                          const displayUsia = ageInMonths === null ? "-" : ageInMonths < 12 ? `${ageInMonths} bulan` : `${Math.floor(ageInMonths / 12)} tahun${ageInMonths % 12 !== 0 ? ` ${ageInMonths % 12} bulan` : ""}`;
                          return (
                            <tr
                              key={warga.id}
                              className={isSelectedSequential ? "table-primary bg-opacity-25" : ""}
                              style={{ cursor: examinationMode === "sequential" ? "pointer" : "default" }}
                              onClick={() => {
                                if (examinationMode === "sequential") {
                                  setSelectedWargaId(wId);
                                  setSequentialForm((prev) => ({
                                    ...prev,
                                    nik: warga.nik || "",
                                    nama: warga.nama || "",
                                    tglLahir: warga.tglLahir || "",
                                    gender: warga.gender || "",
                                    pekerjaan: warga.pekerjaan || prev.pekerjaan || "",
                                    statusPernikahan: warga.statusPernikahan || prev.statusPernikahan || "",
                                    sekolah: warga.sekolah || prev.sekolah || "",
                                    kelas: warga.kelas || prev.kelas || "",
                                    tb: warga.tb || prev.tb,
                                    bb: warga.bb || prev.bb,
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                  }));
                                }
                              }}
                            >
                              <td className="text-center fw-semibold text-muted px-3">{idx + 1}</td>
                              <td className="px-3">
                                <div className="fw-bold text-dark">{warga.nama}</div>
<<<<<<< HEAD
                                <div className="text-muted font-monospace" style={{ fontSize: "0.78rem" }}>
                                  {warga.nik}
                                </div>
=======
                                <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{warga.nik}</div>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              </td>
                              <td className="px-3">
                                <div className="text-dark fw-medium">{displayTgl}</div>
                                {displayUsia && (
<<<<<<< HEAD
                                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                                    {displayUsia}
                                  </div>
                                )}
                              </td>
                              <td className="text-center px-3 text-dark fw-medium">{warga.gender || ""}</td>

                              {/* Kolom Opsi Khusus Bumil */}
                              {activeSubmenu === "bumil" && (
                                <td className="px-3">
                                  <select
                                    className="form-select form-select-sm bg-white border text-dark py-1"
                                    style={{ fontSize: "0.82rem" }}
                                    value={waktuKunjunganPresensi[wId] || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWaktuKunjunganPresensi((prev) => ({ ...prev, [wId]: val }));
                                      if (examinationMode === "sequential" && selectedWargaId === wId) {
                                        setSequentialForm((prev) => ({ ...prev, usiaKehamilan: val }));
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="">-- Pilih --</option>
                                    {OPSI_UMUR_KEHAMILAN_BUMIL.map((opt) => (
<<<<<<< HEAD
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
=======
                                      <option key={opt} value={opt}>{opt}</option>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                    ))}
                                  </select>
                                </td>
                              )}

                              {/* Kolom Opsi Khusus Nifas */}
<<<<<<< HEAD
                              {activeSubmenu === "nifas" && (
                                <td className="px-3">
                                  <select
                                    className="form-select form-select-sm bg-white border text-dark py-1 mb-1"
                                    style={{ fontSize: "0.82rem" }}
                                    value={waktuKunjunganPresensi[wId] || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWaktuKunjunganPresensi((prev) => ({ ...prev, [wId]: val }));
                                      if (examinationMode === "sequential" && selectedWargaId === wId) {
                                        setSequentialForm((prev) => ({ ...prev, waktuKunjunganNifas: val }));
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="">-- Pilih --</option>
                                    <optgroup label="Masa Nifas">
                                      {OPSI_WAKTU_NIFAS_MENYUSUI.slice(0, 3).map((opt) => (
<<<<<<< HEAD
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
=======
                                        <option key={opt} value={opt}>{opt}</option>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                      ))}
                                    </optgroup>
                                    <optgroup label="Masa Menyusui (Tahun 1: Bln 2 - 12)">
                                      {OPSI_WAKTU_NIFAS_MENYUSUI.slice(3, 14).map((opt) => (
<<<<<<< HEAD
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
=======
                                        <option key={opt} value={opt}>{opt}</option>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                      ))}
                                    </optgroup>
                                    <optgroup label="Masa Menyusui (Tahun 2: Bln 13 - 24)">
                                      {OPSI_WAKTU_NIFAS_MENYUSUI.slice(14).map((opt) => (
<<<<<<< HEAD
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </optgroup>
                                  </select>
                                  <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: "0.74rem" }}>
                                    <span>Lahir Bayi:</span>
                                    <span className="fw-semibold text-dark">{formatDateId(warga.tglPersalinan || warga.tglLahirBayi)}</span>
=======
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </optgroup>
                                  </select>
                                  <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
                                    <span>Lahir Bayi:</span>
                                    <span className="fw-semibold text-dark">{warga.tglPersalinan || warga.tglLahirBayi || '01-01-2026'}</span>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                  </div>
                                </td>
                              )}

<<<<<<< HEAD
                              <td className="px-3 text-secondary">{warga.alamat || ""}</td>

                              <td className="text-center px-2">
                                {isAlreadyRegistered ? (
                                  <span
                                    className="badge rounded-pill px-3 py-2 fw-semibold"
                                    style={{
                                      backgroundColor: "#e8f5e9",
                                      color: "#1e6b37",
                                      border: "1px solid #81c784",
                                    }}
                                  >
                                    <UserCheck size={12} className="me-1" />
                                    Sudah Datang
                                  </span>
                                ) : !canMarkAttendance ? (
                                  <span className="badge rounded-pill px-3 py-2 fw-semibold bg-secondary-subtle text-secondary border">
                                    Sesi belum dibuka
                                  </span>
                                ) : (
                                  <div className="d-flex flex-column align-items-center gap-1.5">
                                    {isBelumDatang && (
                                      <span
                                        className="badge rounded-pill px-2.5 py-1 fw-medium"
                                        style={{
                                          backgroundColor: "#f1f5f9",
                                          color: "#64748b",
                                          border: "1px solid #cbd5e1",
                                          fontSize: "0.7rem",
                                        }}
                                      >
                                        Belum Datang
                                      </span>
                                    )}

                                    <div className="btn-group btn-group-sm" role="group" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        className={`btn px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 ${isHadir ? "shadow-xs" : "bg-white text-secondary"}`}
                                        style={{
                                          fontSize: "0.76rem",
                                          ...(isHadir
                                            ? {
                                                backgroundColor: "#e8f5e9",
                                                borderColor: "#81c784",
                                                color: "#1e6b37",
                                              }
                                            : {
                                                backgroundColor: "#ffffff",
                                                borderColor: "#cbd5e1",
                                                color: "#475569",
                                              }),
                                        }}
                                        onClick={() => {
                                          handleToggleKehadiran(wId, true);

                                          if (examinationMode === "sequential") {
                                            setSelectedWargaId(wId);
                                            setSequentialForm((prev) => ({
                                              ...prev,
                                              nik: warga.nik || "",
                                              nama: warga.nama || "",
                                              tglLahir: warga.tglLahir || "",
                                              gender: warga.gender || "",
                                              pekerjaan: warga.pekerjaan || prev.pekerjaan || "",
                                              statusPernikahan: warga.statusPernikahan || prev.statusPernikahan || "",
                                              sekolah: warga.sekolah || prev.sekolah || "",
                                              kelas: warga.kelas || prev.kelas || "",
                                              tb: warga.tb || prev.tb,
                                              bb: warga.bb || prev.bb,
                                            }));
                                          }
                                        }}
                                      >
                                        <UserCheck size={12.5} />
                                        <span>Datang</span>
                                      </button>

                                      <button
                                        type="button"
                                        className={`btn px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 ${isTidakHadir ? "shadow-xs" : "bg-white text-secondary"}`}
                                        style={{
                                          fontSize: "0.76rem",
                                          ...(isTidakHadir
                                            ? {
                                                backgroundColor: "#ffebee",
                                                borderColor: "#ef9a9a",
                                                color: "#b71c1c",
                                              }
                                            : {
                                                backgroundColor: "#ffffff",
                                                borderColor: "#cbd5e1",
                                                color: "#475569",
                                              }),
                                        }}
                                        onClick={() => handleToggleKehadiran(wId, false)}
                                      >
                                        <UserX size={12.5} />
                                        <span>Tidak Datang</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                      {Object.entries(kehadiranWarga).filter(([id, status]) => status === true && activeWargaList.some((w) => String(w.id) === String(id))).length} Sasaran Datang
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill fw-semibold">
                      {Object.entries(kehadiranWarga).filter(([id, status]) => status === false && activeWargaList.some((w) => String(w.id) === String(id))).length} Tidak Datang
=======
                      {Object.entries(kehadiranWarga).filter(([id, status]) => status === true && activeWargaList.some(w => String(w.id) === String(id))).length} Sasaran Datang
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill fw-semibold">
                      {Object.entries(kehadiranWarga).filter(([id, status]) => status === false && activeWargaList.some(w => String(w.id) === String(id))).length} Tidak Datang
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    </span>
                  </div>

                  <div>
<<<<<<< HEAD
                    {examinationMode === "per-step" ? (
                      <button
                        type="button"
                        className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5"
                        style={{ backgroundColor: "#2b2e4a" }}
                        onClick={handleSavePresensiLangkah1}
                        disabled={presensiSesiAktif?.status !== "open"}
=======
                    {examinationMode === 'per-step' ? (
                      <button 
                        type="button" 
                        className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                        style={{ backgroundColor: '#2b2e4a' }}
                        onClick={handleSavePresensiLangkah1}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      >
                        <UserCheck size={16} />
                        <span>Simpan</span>
                      </button>
                    ) : (
<<<<<<< HEAD
                      <button type="button" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: "#2b2e4a" }} onClick={handleNextSequentialStep} disabled={presensiSesiAktif?.status !== "open"}>
=======
                      <button 
                        type="button" 
                        className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                        style={{ backgroundColor: '#2b2e4a' }}
                        onClick={handleNextSequentialStep}
                      >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
            <form onSubmit={examinationMode === "per-step" ? handleSaveLangkah2 : handleNextSequentialStep}>
=======
            <form onSubmit={examinationMode === 'per-step' ? handleSaveLangkah2 : handleNextSequentialStep}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Skrining Penimbangan dan Pengukuran</h3>
                </div>

<<<<<<< HEAD
                {examinationMode === "per-step" && (
                  <div className="bg-white px-3 py-2 rounded-3 border-0 shadow-sm d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                    <select
                      className="form-select form-select-sm border-0 fw-semibold text-dark"
                      style={{ minWidth: "220px" }}
                      value={selectedWargaStep2}
                      onChange={(e) => {
                        setSelectedWargaStep2(e.target.value);
                      }}
                    >
                      {availableWargaStep2.length === 0 ? (
                        <option value="">{hadirWargaList.length === 0 ? "-- Belum ada sasaran hadir di Langkah 1 --" : "-- Semua sasaran telah diperiksa di Langkah 2 --"}</option>
                      ) : (
                        availableWargaStep2.map((w) => (
                          <option key={w.id} value={String(w.id)}>
                            {w.nama} - NIK {String(w.nik).slice(-4)}
                          </option>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {examinationMode === "per-step" && hadirWargaList.length === 0 && (
=======
              {examinationMode === 'per-step' && hadirWargaList.length === 0 && (
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-custom bg-white border-0 py-3"
                      placeholder="Masukkan berat badan"
                      value={examinationMode === "per-step" ? langkah2Form.bb : sequentialForm.bb}
                      onChange={(e) => {
                        if (examinationMode === "per-step") {
=======
                    <input 
                      type="number" step="0.1" 
                      className="form-control form-control-custom bg-white border-0 py-3"
                      placeholder="Masukkan berat badan"
                      value={examinationMode === 'per-step' ? langkah2Form.bb : sequentialForm.bb}
                      onChange={(e) => {
                        if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          setLangkah2Form({ ...langkah2Form, bb: e.target.value });
                        } else {
                          setSequentialForm({ ...sequentialForm, bb: e.target.value });
                        }
                      }}
<<<<<<< HEAD
                      required
=======
                      required 
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    />
                    <span className="input-group-text bg-white border-0 fw-semibold text-muted">kg</span>
                  </div>
                </div>

                {/* Tekanan Darah (mm/Hg) - Nifas/Menyusui, Bumil, Dewasa, Lansia */}
<<<<<<< HEAD
                {["bumil", "nifas", "usekrem-15-18", "dewasa", "lansia"].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Tekanan darah (mm/Hg)</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="number"
                        className="form-control form-control-custom bg-white border-0 py-3 text-center"
                        style={{ width: "85px", flex: "none" }}
                        placeholder="120"
                        value={examinationMode === "per-step" ? langkah2Form.tensiSistol : sequentialForm.tensiSistol}
                        onChange={(e) => {
                          if (examinationMode === "per-step") {
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            setLangkah2Form({ ...langkah2Form, tensiSistol: e.target.value });
                          } else {
                            setSequentialForm({ ...sequentialForm, tensiSistol: e.target.value });
                          }
                        }}
                      />
<<<<<<< HEAD
                      <span className="fw-bold text-muted px-1" style={{ fontSize: "1.4rem", lineHeight: "1", userSelect: "none" }}>
                        /
                      </span>
                      <input
                        type="number"
                        className="form-control form-control-custom bg-white border-0 py-3 text-center"
                        style={{ width: "85px", flex: "none" }}
                        placeholder="80"
                        value={examinationMode === "per-step" ? langkah2Form.tensiDiastol : sequentialForm.tensiDiastol}
                        onChange={(e) => {
                          if (examinationMode === "per-step") {
=======
                      <span className="fw-bold text-muted px-1" style={{ fontSize: '1.4rem', lineHeight: '1', userSelect: 'none' }}>/</span>
                      <input 
                        type="number" 
                        className="form-control form-control-custom bg-white border-0 py-3 text-center"
                        style={{ width: '85px', flex: 'none' }}
                        placeholder="80"
                        value={examinationMode === 'per-step' ? langkah2Form.tensiDiastol : sequentialForm.tensiDiastol}
                        onChange={(e) => {
                          if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            setLangkah2Form({ ...langkah2Form, tensiDiastol: e.target.value });
                          } else {
                            setSequentialForm({ ...sequentialForm, tensiDiastol: e.target.value });
                          }
                        }}
                      />
<<<<<<< HEAD
                      <span className="fw-semibold text-muted ms-1" style={{ fontSize: "0.95rem" }}>
                        mm/Hg
                      </span>
=======
                      <span className="fw-semibold text-muted ms-1" style={{ fontSize: '0.95rem' }}>mm/Hg</span>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    </div>
                  </div>
                )}

                {/* TB / PB (TB Bumil Dihapus sesuai permintaan, hanya untuk anak-anak & dewasa/lansia) */}
<<<<<<< HEAD
                {["bayi-0-11", "balita-12-59", "apras", "usekrem-6-14", "usekrem-15-18", "dewasa", "lansia"].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">{["bayi-0-11", "balita-12-59"].includes(activeSubmenu) ? "Panjang / Tinggi Badan (PB/TB)" : "Tinggi Badan (TB)"}</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder={["bayi-0-11", "balita-12-59"].includes(activeSubmenu) ? "Masukkan panjang / tinggi badan" : "Masukkan tinggi badan"}
                        value={examinationMode === "per-step" ? langkah2Form.tb : sequentialForm.tb}
                        onChange={(e) => {
                          if (examinationMode === "per-step") {
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                {["bayi-0-11", "balita-12-59"].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Lingkar Kepala (cm)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder="Masukkan lingkar kepala"
                        value={examinationMode === "per-step" ? langkah2Form.lk : sequentialForm.lk}
                        onChange={(e) => {
                          if (examinationMode === "per-step") {
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                {["bumil", "bayi-0-11", "balita-12-59", "apras", "dewasa", "lansia"].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Lingkar Lengan Atas (LiLA)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder="Masukkan LiLA"
                        value={examinationMode === "per-step" ? langkah2Form.lila : sequentialForm.lila}
                        onChange={(e) => {
                          if (examinationMode === "per-step") {
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                {["usekrem-15-18", "dewasa", "lansia"].includes(activeSubmenu) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">Lingkar Perut (cm)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder="Masukkan lingkar perut"
                        value={examinationMode === "per-step" ? langkah2Form.lp : sequentialForm.lp}
                        onChange={(e) => {
                          if (examinationMode === "per-step") {
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                {examinationMode === "per-step" ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: "#2b2e4a" }}>
=======
                {examinationMode === 'per-step' ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <span>Simpan</span>
                  </button>
                ) : (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={() => setActiveStep(1)}>
                      <ArrowLeft size={15} />
                      <span>Kembali</span>
                    </button>
<<<<<<< HEAD
                    <button type="submit" className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: "#2b2e4a" }}>
=======
                    <button type="submit" className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      <span>Lanjut ke Langkah 3</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* ========================================================================= */}
<<<<<<< HEAD
          {/* LANGKAH 3: PLOTTING DARI BACKEND */}
          {/* ========================================================================= */}
          {activeStep === 3 && (
            <form onSubmit={examinationMode === "per-step" ? handleSaveLangkah3 : handleNextSequentialStep}>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Plotting</h3>
                  <p className="text-secondary small mb-0">Seluruh hasil plotting dibaca dari backend.</p>
                </div>

                {examinationMode === "per-step" && (
                  <div className="bg-white px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                    <select className="form-select form-select-sm border-0 fw-semibold text-dark" style={{ minWidth: "220px" }} value={selectedWargaStep3} onChange={(e) => setSelectedWargaStep3(e.target.value)}>
                      {availableWargaStep3.length === 0 ? (
                        <option value="">{hadirWargaList.length === 0 ? "-- Belum ada sasaran hadir di Langkah 1 --" : "-- Semua sasaran telah dievaluasi di Langkah 3 --"}</option>
                      ) : (
                        availableWargaStep3.map((w) => (
                          <option key={w.id} value={String(w.id)}>
                            {w.nama} - NIK {String(w.nik || "").slice(-4)}
                          </option>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {!activeBackendPlotting ? (
                <div className="p-4 bg-white rounded-4 border border-warning-subtle text-center my-4 shadow-sm">
                  <AlertCircle size={40} className="text-warning mb-2" />
                  <h5 className="fw-bold text-dark mb-1">Hasil Plotting Belum Tersedia</h5>
                  <p className="text-muted small mb-0">Simpan Langkah 2 terlebih dahulu agar plotting dapat dihitung.</p>
                </div>
              ) : (
                <div className="mb-3">
                  <GrowthChartPlotter plottingData={activeBackendPlotting} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                </div>
              )}

              <div className="d-flex justify-content-end pt-3 gap-2">
<<<<<<< HEAD
                {examinationMode === "per-step" ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium" style={{ backgroundColor: "#2b2e4a" }} disabled={!selectedWargaStep3 || !activeBackendPlotting}>
=======
                {examinationMode === 'per-step' ? (
                  <button 
                    type="submit" 
                    className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                    style={{ backgroundColor: '#2b2e4a' }}
                    disabled={!selectedWargaStep3 || !plottingResult}
                  >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <span>Simpan</span>
                  </button>
                ) : (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={() => setActiveStep(2)}>
                      <ArrowLeft size={15} />
                      <span>Kembali</span>
                    </button>
<<<<<<< HEAD
                    <button type="submit" className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: "#2b2e4a" }} disabled={!activeBackendPlotting}>
=======
                    <button 
                      type="submit" 
                      className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" 
                      style={{ backgroundColor: '#2b2e4a' }}
                    >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
            <form onSubmit={examinationMode === "per-step" ? handleSaveLangkah4 : handleNextSequentialStep}>
=======
            <form onSubmit={examinationMode === 'per-step' ? handleSaveLangkah4 : handleNextSequentialStep}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Pelayanan Kesehatan &amp; Skrining TBC</h3>
                </div>

<<<<<<< HEAD
                {examinationMode === "per-step" && (
=======
                {examinationMode === 'per-step' && (
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                  <div className="bg-white px-3 py-2 rounded-3 border-0 shadow-sm d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                    <select
                      className="form-select form-select-sm border-0 fw-semibold text-dark"
<<<<<<< HEAD
                      style={{ minWidth: "220px" }}
=======
                      style={{ minWidth: '220px' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <option value="">{hadirWargaList.length === 0 ? "-- Belum ada sasaran hadir di Langkah 1 --" : "-- Semua sasaran telah diskrining di Langkah 4 --"}</option>
                      ) : (
                        availableWargaStep4.map((w) => (
                          <option key={w.id} value={String(w.id)}>
                            {w.nama} - NIK {String(w.nik).slice(-4)}
                          </option>
=======
                        <option value="">{hadirWargaList.length === 0 ? '-- Belum ada sasaran hadir di Langkah 1 --' : '-- Semua sasaran telah diskrining di Langkah 4 --'}</option>
                      ) : (
                        availableWargaStep4.map(w => (
                          <option key={w.id} value={String(w.id)}>{w.nama} - NIK {String(w.nik).slice(-4)}</option>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {examinationMode === "per-step" && hadirWargaList.length === 0 && (
=======
              {examinationMode === 'per-step' && hadirWargaList.length === 0 && (
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span className="small">
                    Belum ada sasaran <strong>{currentCategory.label}</strong> yang ditandai <strong>Datang</strong> pada Langkah 1. Silakan cari dan tandai kehadiran di <strong>Langkah 1 (Presensi)</strong> terlebih dahulu.
                  </span>
                </div>
              )}

              {/* Tampilkan Riwayat Pemeriksaan Terakhir Sebelumnya */}
<<<<<<< HEAD
              {renderRiwayatPemeriksaanTerakhir(examinationMode === "per-step" ? selectedWargaStep4 : selectedWargaId)}

              {["dewasa", "lansia"].includes(activeSubmenu) ? (
                <>
                  {/* Kadar Gula Darah, Kolesterol & Kontrasepsi */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
              {renderRiwayatPemeriksaanTerakhir(examinationMode === 'per-step' ? selectedWargaStep4 : selectedWargaId)}

              {['dewasa', 'lansia'].includes(activeSubmenu) ? (
                <>
                  {/* Kadar Gula Darah, Kolesterol & Kontrasepsi */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Skrining PTM: Gula Darah &amp; Kolesterol</h5>

                    <div className="row g-3">
                      {/* 1. Kadar Gula Darah (mg/dl) */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Kadar gula darah (mg/dl)</label>
                        <div className="input-group">
<<<<<<< HEAD
                          <input
                            type="number"
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 110"
                            value={examinationMode === "per-step" ? langkah2Form.gulaDarah || "" : sequentialForm.gulaDarah || ""}
                            onChange={(e) => {
                              if (examinationMode === "per-step") {
=======
                          <input 
                            type="number" 
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 110"
                            value={examinationMode === 'per-step' ? (langkah2Form.gulaDarah || '') : (sequentialForm.gulaDarah || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <div className="bg-light p-2 px-3 rounded-3 border-0 d-flex align-items-center justify-content-between" style={{ minHeight: "38px" }}>
                          <span className="fw-semibold text-dark small">
                            {(() => {
                              const gdVal = examinationMode === "per-step" ? langkah2Form.gulaDarah : sequentialForm.gulaDarah;
                              if (!gdVal || gdVal === "") return <span className="text-muted fw-normal">Belum Diisi</span>;
=======
                        <div className="bg-light p-2 px-3 rounded-3 border-0 d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>
                          <span className="fw-semibold text-dark small">
                            {(() => {
                              const gdVal = examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah;
                              if (!gdVal || gdVal === '') return <span className="text-muted fw-normal">Belum Diisi</span>;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                          <input
                            type="number"
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 180"
                            value={examinationMode === "per-step" ? langkah4Form.kolesterol || "" : sequentialForm.kolesterol || ""}
                            onChange={(e) => {
                              if (examinationMode === "per-step") {
=======
                          <input 
                            type="number" 
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 180"
                            value={examinationMode === 'per-step' ? (langkah4Form.kolesterol || '') : (sequentialForm.kolesterol || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <div className="bg-light p-2 px-3 rounded-3 border-0 d-flex align-items-center justify-content-between" style={{ minHeight: "38px" }}>
                          <span className="fw-semibold text-dark small">
                            {(() => {
                              const kolVal = examinationMode === "per-step" ? langkah4Form.kolesterol : sequentialForm.kolesterol;
                              if (!kolVal || kolVal === "") return <span className="text-muted fw-normal">Belum Diisi</span>;
=======
                        <div className="bg-light p-2 px-3 rounded-3 border-0 d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>
                          <span className="fw-semibold text-dark small">
                            {(() => {
                              const kolVal = examinationMode === 'per-step' ? langkah4Form.kolesterol : sequentialForm.kolesterol;
                              if (!kolVal || kolVal === '') return <span className="text-muted fw-normal">Belum Diisi</span>;
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              const kolNum = parseInt(kolVal);
                              if (isNaN(kolNum)) return <span className="text-muted fw-normal">Belum Diisi</span>;
                              if (kolNum >= 200) return <span className="text-danger fw-bold">Tinggi (T) &bull; ≥ 200 mg/dl</span>;
                              return <span className="text-success fw-bold">Normal (N) &bull; &lt; 200 mg/dl</span>;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* 5. Menggunakan alat kontrasepsi (Khusus Dewasa) */}
<<<<<<< HEAD
                      {activeSubmenu === "dewasa" && (
                        <div className="col-12 col-md-6">
                          <YesNoCard label="Menggunakan alat kontrasepsi" name={`alatKontrasepsi_${examinationMode}`} value={getLangkah4Value("alatKontrasepsi")} onChange={(val) => updateLangkah4Value("alatKontrasepsi", val)} />
=======
                      {activeSubmenu === 'dewasa' && (
                        <div className="col-12 col-md-6">
                          <YesNoCard
                            label="Menggunakan alat kontrasepsi"
                            name={`alatKontrasepsi_${examinationMode}`}
                            value={getLangkah4Value('alatKontrasepsi')}
                            onChange={(val) => updateLangkah4Value('alatKontrasepsi', val)}
                          />
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skrining Gejala TBC */}
<<<<<<< HEAD
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="Batuk ≥ 2 minggu" name={`batukTbc_dewasa_${examinationMode}`} value={getLangkah4Value("batukTbc")} onChange={(val) => updateLangkah4Value("batukTbc", val)} />
                      </div>

                      <div className="col-12 mt-2">
                        <div className="p-2 px-3 rounded-2 bg-light fw-bold text-dark small border-start border-primary border-3">Batuk &lt; 2 minggu dengan tambahan:</div>
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="a. Nafsu makan menurun" name={`nafsuMakanTbc_dewasa_${examinationMode}`} value={getLangkah4Value("nafsuMakanTbc")} onChange={(val) => updateLangkah4Value("nafsuMakanTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="b. Berat badan menurun" name={`bbMenurunTbc_dewasa_${examinationMode}`} value={getLangkah4Value("bbMenurunTbc")} onChange={(val) => updateLangkah4Value("bbMenurunTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="c. Lemah, letih, lesu" name={`lemahLesuTbc_dewasa_${examinationMode}`} value={getLangkah4Value("lemahLesuTbc")} onChange={(val) => updateLangkah4Value("lemahLesuTbc", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="d. Berkeringat malam hari tanpa kegiatan fisik"
                          name={`berkeringatMalamTbc_dewasa_${examinationMode}`}
<<<<<<< HEAD
                          value={getLangkah4Value("berkeringatMalamTbc")}
                          onChange={(val) => updateLangkah4Value("berkeringatMalamTbc", val)}
=======
                          value={getLangkah4Value('berkeringatMalamTbc')}
                          onChange={(val) => updateLangkah4Value('berkeringatMalamTbc', val)}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        />
                      </div>

                      <div className="col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="e. Batuk darah" name={`batukDarahTbc_dewasa_${examinationMode}`} value={getLangkah4Value("batukDarahTbc")} onChange={(val) => updateLangkah4Value("batukDarahTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="f. Sesak nafas" name={`sesakNafasTbc_dewasa_${examinationMode}`} value={getLangkah4Value("sesakNafasTbc")} onChange={(val) => updateLangkah4Value("sesakNafasTbc", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>

                  {/* B. Pemeriksaan 6 Bulan Sekali */}
<<<<<<< HEAD
                  <PeriodicScreeningPanel
                    id={`screening-6-month-${activeSubmenu}`}
                    title="B. Pemeriksaan 6 Bulan Sekali"
                    description="Pemeriksaan penglihatan dan pendengaran yang dilakukan setiap enam bulan bila sudah jatuh tempo."
                    due={sixMonthScreeningDue}
                    loading={periodicScreeningInfo.loading}
                    checked={getLangkah4Value("isSkrining6Bulanan")}
                    lastCompletedDate={periodicScreeningInfo.lastSixMonthDate}
                    onToggle={(checked) => updateLangkah4Value("isSkrining6Bulanan", checked)}
                  >
=======
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">B. Pemeriksaan 6 Bulan Sekali</h5>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

                    <h6 className="fw-bold text-primary mb-2">Tes Penglihatan (Hitung Jari)</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kanan</label>
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.mataKanan || "" : sequentialForm.mataKanan || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKanan || '') : (sequentialForm.mataKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.mataKiri || "" : sequentialForm.mataKiri || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKiri || '') : (sequentialForm.mataKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.telingaKanan || "" : sequentialForm.telingaKanan || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKanan || '') : (sequentialForm.telingaKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.telingaKiri || "" : sequentialForm.telingaKiri || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKiri || '') : (sequentialForm.telingaKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                  </PeriodicScreeningPanel>

                  {/* C. PEMERIKSAAN TAHUNAN */}
                  <div hidden={!annualScreeningDue || periodicScreeningInfo.loading} className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  </div>

                  {/* C. PEMERIKSAAN TAHUNAN */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">Berkala 1x / Tahun</span>
                          <h5 className="fw-bold text-dark mb-0">C. Pemeriksaan Tahunan</h5>
                        </div>
<<<<<<< HEAD
                        <p className="text-muted small mb-0">Skrining komprehensif tahunan ({activeSubmenu === "lansia" ? "PUMA, Jiwa, AKS Barthel & SKILAS" : "PUMA & Kesehatan Jiwa SRQ-20"}). Hanya perlu diisi 1 tahun sekali.</p>
                      </div>
                      <div className="d-flex align-items-center gap-3 bg-light p-2.5 px-3 rounded-4 border">
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="toggleSkriningTahunan"
                            style={{ width: "2.4em", height: "1.2em", cursor: "pointer" }}
                            checked={Boolean(getLangkah4Value("isSkriningTahunan"))}
                            onChange={(e) => updateLangkah4Value("isSkriningTahunan", e.target.checked)}
                          />
                          <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor="toggleSkriningTahunan">
                            {getLangkah4Value("isSkriningTahunan") ? "Lakukan Skrining" : "Tidak Dilakukan"}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Banner Riwayat Terakhir Skrining Tahunan */}
                    <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mt-3 mb-1">
                      <div className="d-flex align-items-center gap-2">
<<<<<<< HEAD
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? "text-success" : annualScreeningInfo.hasHistory ? "text-warning" : "text-secondary"}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>{annualScreeningInfo.statusLabel}</span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: "0.82rem" }}>
=======
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? 'text-success' : annualScreeningInfo.hasHistory ? 'text-warning' : 'text-secondary'}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>
                              {annualScreeningInfo.statusLabel}
                            </span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: '0.82rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            {annualScreeningInfo.detailText}
                          </div>
                        </div>
                      </div>

<<<<<<< HEAD
                      {annualScreeningInfo.tglFormatted !== "-" && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: "0.8rem" }}>
=======
                      {annualScreeningInfo.tglFormatted !== '-' && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: '0.8rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          <span className="d-block text-secondary fw-semibold">Terakhir Diisi:</span>
                          <span className="badge bg-white text-dark border px-2 py-1 font-monospace">{annualScreeningInfo.tglFormatted}</span>
                        </div>
                      )}
                    </div>

<<<<<<< HEAD
                    {!getLangkah4Value("isSkriningTahunan") && (
=======
                    {!getLangkah4Value('isSkriningTahunan') && (
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      <div className="alert alert-primary-subtle border-0 rounded-3 mt-2 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2.5">
                        <div className="d-flex align-items-center gap-2 small text-primary-emphasis">
                          <Info size={18} className="flex-shrink-0 text-primary" />
                          <span>Pemeriksaan tahunan tidak dilakukan pada kunjungan ini. Anda dapat langsung menyimpan data langkah 4 tanpa instrumen tahunan.</span>
                        </div>
<<<<<<< HEAD
                        <button type="button" className="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onClick={() => updateLangkah4Value("isSkriningTahunan", true)}>
=======
                        <button 
                          type="button" 
                          className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                          onClick={() => updateLangkah4Value('isSkriningTahunan', true)}
                        >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          Aktifkan Skrining
                        </button>
                      </div>
                    )}
                  </div>

<<<<<<< HEAD
                  {Boolean(getLangkah4Value("isSkriningTahunan")) && annualScreeningDue && !periodicScreeningInfo.loading && (
                    <>
                      {/* C1. Skrining PPOK PUMA (Khusus Usia ≥ 40 Tahun / Lansia) */}
                      <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C1</span>
                            <h5 className="fw-bold text-dark mb-0">C.1 Skrining PPOK PUMA (Khusus Usia &gt; 40 Tahun / Lansia)</h5>
                          </div>
                          {(() => {
                            const jk = examinationMode === "per-step" ? langkah4Form.pumaJk : sequentialForm.pumaJk;
                            const usia = examinationMode === "per-step" ? langkah4Form.pumaUsia : sequentialForm.pumaUsia;
                            const rokok = examinationMode === "per-step" ? langkah4Form.pumaMerokok : sequentialForm.pumaMerokok;
                            const np = examinationMode === "per-step" ? langkah4Form.pumaNapasPendek : sequentialForm.pumaNapasPendek;
                            const dh = examinationMode === "per-step" ? langkah4Form.pumaDahak : sequentialForm.pumaDahak;
                            const bt = examinationMode === "per-step" ? langkah4Form.pumaBatukFlu : sequentialForm.pumaBatukFlu;

                            const isAny = [jk, usia, rokok, np, dh, bt].some((v) => v !== "" && v !== undefined && v !== null);
                            if (!isAny) {
                              return <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fw-bold">Skor PUMA: - (Belum Diisi)</span>;
                            }
                            const score =
                              (jk !== "" && jk !== undefined ? Number(jk) : 0) +
                              (usia !== "" && usia !== undefined ? Number(usia) : 0) +
                              (rokok !== "" && rokok !== undefined ? Number(rokok) : 0) +
                              (np === "Ya" || np === 1 ? 1 : 0) +
                              (dh === "Ya" || dh === 1 ? 1 : 0) +
                              (bt === "Ya" || bt === 1 ? 1 : 0);
                            const isRisiko = score > 6;
                            const statusText = score === 6 ? "Skor Ambigu" : isRisiko ? "Risiko Tinggi PPOK" : "Risiko Rendah PPOK";
                            const badgeClass = score === 6 ? "bg-warning-subtle text-warning-emphasis" : isRisiko ? "bg-danger text-white" : "bg-success-subtle text-success";
                            return (
                              <span className={`badge ${badgeClass} px-3 py-2 rounded-pill fw-bold`}>
                                Skor PUMA: {score} ({statusText})
                              </span>
                            );
                          })()}
                        </div>

                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-dark small mb-1">1. Jenis Kelamin</label>
                            <select
                              className="form-select bg-light border-0 py-2"
                              value={examinationMode === "per-step" ? (langkah4Form.pumaJk ?? "") : (sequentialForm.pumaJk ?? "")}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                if (examinationMode === "per-step") {
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
                              value={examinationMode === "per-step" ? (langkah4Form.pumaUsia ?? "") : (sequentialForm.pumaUsia ?? "")}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                if (examinationMode === "per-step") {
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
                              value={examinationMode === "per-step" ? (langkah4Form.pumaMerokok ?? "") : (sequentialForm.pumaMerokok ?? "")}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                if (examinationMode === "per-step") {
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
                              value={getLangkah4Value("pumaNapasPendek")}
                              onChange={(val) => updateLangkah4Value("pumaNapasPendek", val)}
                            />
                          </div>

                          <div className="col-md-6">
                            <YesNoCard label="5. Mempunyai dahak saat tidak menderita flu?" name={`pumaDahak_${examinationMode}`} value={getLangkah4Value("pumaDahak")} onChange={(val) => updateLangkah4Value("pumaDahak", val)} />
                          </div>

                          <div className="col-md-6">
                            <YesNoCard label="6. Batuk walau tidak flu / tes spirometri?" name={`pumaBatukFlu_${examinationMode}`} value={getLangkah4Value("pumaBatukFlu")} onChange={(val) => updateLangkah4Value("pumaBatukFlu", val)} />
                          </div>
                        </div>
                      </div>

                      {/* C2. SKRINING KESEHATAN JIWA (DEWASA) SESUAI FORMAT BUKU KIA / KEMENKES */}
                      {activeSubmenu === "dewasa" && (
                        <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C2</span>
                                <h5 className="fw-bold text-dark mb-0">C.2 Skrining Kesehatan Jiwa</h5>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className={`px-3 py-1.5 rounded-pill fw-bold small ${
                                  !currentJiwa.isAnswered
                                    ? "bg-secondary-subtle text-secondary border border-secondary-subtle"
                                    : currentJiwa.isRisiko
                                      ? "bg-danger-subtle text-danger border border-danger-subtle"
                                      : "bg-success-subtle text-success border border-success-subtle"
                                }`}
                              >
                                Total Skor: {!currentJiwa.isAnswered ? "-" : currentJiwa.total} / 12 &bull; {currentJiwa.kategori}
                              </span>
                            </div>
                          </div>

                          {/* Dropdown Bulan Skrining */}
                          <div className="row align-items-center mb-3 g-2">
                            <div className="col-auto">
                              <label className="form-label fw-semibold text-dark small mb-0">Skrining Kesehatan Jiwa dilakukan pada bulan :</label>
                            </div>
                            <div className="col-auto">
                              <select
                                className="form-select form-select-sm bg-light border-0 py-1.5 px-3 fw-medium"
                                style={{ minWidth: "160px" }}
                                value={examinationMode === "per-step" ? langkah4Form.jiwaBulan || "" : sequentialForm.jiwaBulan || ""}
                                onChange={(e) => {
                                  if (examinationMode === "per-step") {
                                    setLangkah4Form({ ...langkah4Form, jiwaBulan: e.target.value });
                                  } else {
                                    setSequentialForm({ ...sequentialForm, jiwaBulan: e.target.value });
                                  }
                                }}
                              >
                                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Tabel 4 Pertanyaan Skrining Kesehatan Jiwa */}
                          <div className="table-responsive border rounded-3 mb-3">
                            <table className="table table-bordered align-middle mb-0 text-center" style={{ borderColor: "#cbd5e1" }}>
                              <thead style={{ backgroundColor: "#dbeafe", color: "#1e3a8a" }}>
                                <tr style={{ fontSize: "0.82rem" }}>
                                  <th style={{ width: "45px" }} className="py-2.5 px-2 fw-bold text-center">
                                    No
                                  </th>
                                  <th style={{ minWidth: "240px" }} className="py-2.5 px-3 fw-bold text-start">
                                    Pertanyaan
                                  </th>
                                  <th style={{ width: "110px" }} className="py-2.5 px-2 fw-bold">
                                    Tidak sama sekali (0)
                                  </th>
                                  <th style={{ width: "130px" }} className="py-2.5 px-2 fw-bold">
                                    Kurang dari 1 (satu) minggu (1)
                                  </th>
                                  <th style={{ width: "130px" }} className="py-2.5 px-2 fw-bold">
                                    Lebih dari 1 (satu) minggu (2)
                                  </th>
                                  <th style={{ width: "120px" }} className="py-2.5 px-2 fw-bold">
                                    Hampir setiap hari (3)
                                  </th>
                                  <th style={{ width: "90px", backgroundColor: "#e2e8f0", color: "#334155" }} className="py-2.5 px-2 fw-bold text-center">
                                    Total skor
                                  </th>
                                </tr>
                              </thead>
                              <tbody style={{ fontSize: "0.84rem" }}>
                                {[
                                  {
                                    no: 1,
                                    field: "jiwaQ1",
                                    q: "Dalam 2 minggu terakhir, seberapa sering anda kurang/tidak bersemangat dalam melakukan kegiatan sehari/hari?",
                                  },
                                  {
                                    no: 2,
                                    field: "jiwaQ2",
                                    q: "Dalam 2 minggu terakhir, seberapa sering anda merasa murung, tertekan, atau putus asa?",
                                  },
                                  {
                                    no: 3,
                                    field: "jiwaQ3",
                                    q: "Dalam 2 minggu terakhir, seberapa sering anda merasa gugup, cemas, atau gelisah?",
                                  },
                                  {
                                    no: 4,
                                    field: "jiwaQ4",
                                    q: "Dalam 2 minggu terakhir, seberapa sering anda tidak mampu mengendalikan rasa khawatir?",
                                  },
                                ].map((item) => {
                                  const val = examinationMode === "per-step" ? langkah4Form[item.field] : sequentialForm[item.field];
                                  const numVal = val !== "" && val !== undefined && val !== null ? Number(val) : null;
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
                                              if (examinationMode === "per-step") {
                                                setLangkah4Form({ ...langkah4Form, [item.field]: optionScore });
                                              } else {
                                                setSequentialForm({ ...sequentialForm, [item.field]: optionScore });
                                              }
                                            }}
                                            style={{ width: "1.15rem", height: "1.15rem", cursor: "pointer" }}
                                          />
                                        </td>
                                      ))}
                                      <td className="text-center fw-bold py-2" style={{ backgroundColor: "#f8fafc", color: numVal !== null ? "#1e3a8a" : "#94a3b8" }}>
                                        {numVal !== null ? numVal : "—"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot style={{ backgroundColor: "#f1f5f9" }}>
                                <tr>
                                  <td colSpan="6" className="text-end fw-bold py-2.5 px-3 text-dark">
                                    Total Skor Skrining Kesehatan Jiwa :
                                  </td>
                                  <td className="text-center fw-bold py-2.5 px-2 fs-6" style={{ color: currentJiwa.isRisiko ? "#dc2626" : "#16a34a" }}>
                                    {currentJiwa.isAnswered ? currentJiwa.total : "—"}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          {/* Panduan Interpretasi & Keterangan */}
                          <div className="p-3 rounded-3 bg-light border">
                            <div className="d-flex flex-column gap-1 text-muted small mb-2">
                              <div>
                                <strong>Interpretasi Skor:</strong> Skor &lt; 6 = Normal / Sehat Jiwa; Skor &ge; 6 = Risiko Masalah Kesehatan Jiwa (Perlu Konseling/Rujukan ke Puskesmas).
                              </div>
                            </div>
                            {!currentJiwa.isAnswered ? (
                              <div className="alert alert-light text-muted d-flex align-items-center gap-2 mb-0 py-2 small border">
                                <Info size={16} className="flex-shrink-0 text-primary" />
                                <div>Silakan isi 4 pertanyaan di atas untuk mengevaluasi skrining kesehatan jiwa sasaran.</div>
                              </div>
                            ) : currentJiwa.isRisiko ? (
                              <div className="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 small">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <div>
                                  <strong>Indikasi Masalah Kesehatan Jiwa:</strong> Total skor ({currentJiwa.total}) &ge; 6 menunjukkan adanya risiko kecemasan / depresi &rarr; Status rujukan otomatis disinkronkan ke{" "}
                                  <strong>"Rujuk ke Puskesmas / Pustu"</strong> untuk konseling lebih lanjut.
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
                      {activeSubmenu === "lansia" && (
                        <>
                          {/* C2. PEMERIKSAAN TAHUNAN SKRINING AKTIFITAS KEHIDUPAN SEHARI-HARI (AKS) */}
                          <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C2</span>
                                  <h5 className="fw-bold text-dark mb-0">C2. Pemeriksaan Tahunan Skrining Aktifitas Kehidupan Sehari-hari (AKS)</h5>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className={`px-3 py-1.5 rounded-pill fw-bold small ${
                                    !currentAks.isAnswered
                                      ? "bg-secondary-subtle text-secondary border border-secondary-subtle"
                                      : currentAks.total === 20
                                        ? "bg-success-subtle text-success border border-success-subtle"
                                        : currentAks.total >= 12
                                          ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                                          : "bg-danger-subtle text-danger border border-danger-subtle"
                                  }`}
                                >
                                  Total Skor: {!currentAks.isAnswered ? "-" : currentAks.total} / 20 &bull; {currentAks.kategori}
                                </span>
                              </div>
                            </div>

                            <div className="table-responsive mb-3">
                              <table className="table table-bordered align-middle mb-0" style={{ borderColor: "#e2e8f0" }}>
                                <thead style={{ backgroundColor: "#fed7aa", color: "#7c2d12" }}>
                                  <tr>
                                    <th style={{ width: "50%" }} className="py-2.5 px-3 fw-bold text-dark">
                                      Pertanyaan
                                    </th>
                                    <th style={{ width: "50%" }} className="py-2.5 px-3 fw-bold text-dark">
                                      Waktu ke Posyandu (Skor &amp; Kondisi)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* 1. BAB */}
                                  <tr>
                                    <td className="px-3 py-2 fw-semibold text-dark">1. Mengendalikan rangsang Buang Air Besar (BAB)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksBab ?? "") : (sequentialForm.aksBab ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksBab: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">2. Mengendalikan rangsang Buang Air Kecil (BAK)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksBak ?? "") : (sequentialForm.aksBak ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksBak: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">3. Membersihkan diri (mencuci wajah, menyikat rambut, mencukur kumis, sikat gigi)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksCuciMuka ?? "") : (sequentialForm.aksCuciMuka ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksCuciMuka: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">4. Penggunaan WC (keluar masuk WC, melepas/memakai celana, cebok, menyiram)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksWc ?? "") : (sequentialForm.aksWc ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksWc: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">5. Makan minum (Jika makan harus berupa potongan, dianggap dibantu)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksMakan ?? "") : (sequentialForm.aksMakan ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksMakan: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">6. Bergerak dari kursi roda ke tempat tidur dan sebaliknya (termasuk duduk di tempat tidur)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksPindah ?? "") : (sequentialForm.aksPindah ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksPindah: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">7. Berjalan di tempat rata (atau jika tidak bisa berjalan, menjalankan kursi roda)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksJalan ?? "") : (sequentialForm.aksJalan ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksJalan: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">8. Berpakaian (termasuk memasang tali sepatu, mengencangkan sabuk)</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksPakaian ?? "") : (sequentialForm.aksPakaian ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksPakaian: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">9. Naik turun tangga</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksTangga ?? "") : (sequentialForm.aksTangga ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksTangga: val });
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
                                    <td className="px-3 py-2 fw-semibold text-dark">10. Mandi</td>
                                    <td className="px-3 py-2">
                                      <select
                                        className="form-select form-select-sm bg-light border-0 py-2"
                                        value={examinationMode === "per-step" ? (langkah4Form.aksMandi ?? "") : (sequentialForm.aksMandi ?? "")}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                          if (examinationMode === "per-step") setLangkah4Form({ ...langkah4Form, aksMandi: val });
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
                                  <span className={`badge ${currentAks.shortCode === "M" ? "bg-success text-white" : "bg-secondary-subtle text-secondary"}`}>Mandiri (M=20)</span>
                                  <span className={`badge ${currentAks.shortCode === "R" ? "bg-warning text-dark" : "bg-secondary-subtle text-secondary"}`}>Ringan (R=12-19)</span>
                                  <span className={`badge ${currentAks.shortCode === "S" ? "bg-warning text-dark" : "bg-secondary-subtle text-secondary"}`}>Sedang (S=9-11)</span>
                                  <span className={`badge ${currentAks.shortCode === "B" ? "bg-danger text-white" : "bg-secondary-subtle text-secondary"}`}>Berat (B=5-8)</span>
                                  <span className={`badge ${currentAks.shortCode === "T" ? "bg-danger text-white" : "bg-secondary-subtle text-secondary"}`}>Total (T=0-4)</span>
                                </div>
                              </div>
                              {!currentAks.isAnswered ? (
                                <div className="alert alert-light text-muted d-flex align-items-center gap-2 mb-0 py-2 small border">
                                  <Info size={16} className="flex-shrink-0 text-primary" />
                                  <div>Silakan lengkapi instrumen 10 pertanyaan di atas untuk menghitung Indeks Barthel (AKS) lansia.</div>
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
                          <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-2 border-bottom gap-2">
                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-primary text-white fw-bold px-2.5 py-1 rounded-pill">C3</span>
                                  <h5 className="fw-bold text-dark mb-0">C3. Pemeriksaan Tahunan SKILAS</h5>
                                </div>
                              </div>
                              <div>
                                <span
                                  className={`px-3 py-1.5 rounded-pill fw-bold small ${
                                    !currentSkilas.isAnswered
                                      ? "bg-secondary-subtle text-secondary border border-secondary-subtle"
                                      : currentSkilas.adaRisiko
                                        ? "bg-danger-subtle text-danger border border-danger-subtle"
                                        : "bg-success-subtle text-success border border-success-subtle"
                                  }`}
                                >
                                  {!currentSkilas.isAnswered ? "Belum Diisi" : currentSkilas.adaRisiko ? "⚠️ Ada Indikasi Risiko SKILAS" : "✓ Semua Domain Terpenuhi Normal"}
                                </span>
                              </div>
                            </div>

                            <div className="table-responsive mb-3">
                              <table className="table table-bordered align-middle mb-0" style={{ borderColor: "#e2e8f0" }}>
                                <thead style={{ backgroundColor: "#fed7aa", color: "#7c2d12" }}>
                                  <tr>
                                    <th style={{ width: "60%" }} className="py-2.5 px-3 fw-bold text-dark">
                                      Pertanyaan
                                    </th>
                                    <th style={{ width: "40%" }} className="py-2.5 px-3 fw-bold text-dark">
                                      Waktu Wawancara
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* 1. PENURUNAN KOGNITIF */}
                                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                                    <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                      Penurunan Kognitif
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Orientasi waktu dan tempat</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasOrientasi_${examinationMode}`} value={getLangkah4Value("skilasOrientasi")} onChange={(val) => updateLangkah4Value("skilasOrientasi", val)} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Mengulang ketiga kata</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasUlangKata_${examinationMode}`} value={getLangkah4Value("skilasUlangKata")} onChange={(val) => updateLangkah4Value("skilasUlangKata", val)} />
                                    </td>
                                  </tr>

                                  {/* 2. KETERBATASAN MOBILISASI */}
                                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                                    <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                      Keterbatasan Mobilisasi
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Ada keterbatasan mobilisasi</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasMobilisasi_${examinationMode}`} value={getLangkah4Value("skilasMobilisasi")} onChange={(val) => updateLangkah4Value("skilasMobilisasi", val)} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Tes berdiri dari kursi</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasTesKursi_${examinationMode}`} value={getLangkah4Value("skilasTesKursi")} onChange={(val) => updateLangkah4Value("skilasTesKursi", val)} />
                                    </td>
                                  </tr>

                                  {/* 3. MALNUTRISI */}
                                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                                    <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                      Malnutrisi
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; BB berkurang &gt;3kg dalam 3 bulan terakhir atau pakaian jadi lebih longgar</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasBbTurun_${examinationMode}`} value={getLangkah4Value("skilasBbTurun")} onChange={(val) => updateLangkah4Value("skilasBbTurun", val)} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Hilang nafsu makan/kesulitan makan</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasNafsuMakan_${examinationMode}`} value={getLangkah4Value("skilasNafsuMakan")} onChange={(val) => updateLangkah4Value("skilasNafsuMakan", val)} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; LILA &lt;21 cm</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasLilaKurang_${examinationMode}`} value={getLangkah4Value("skilasLilaKurang")} onChange={(val) => updateLangkah4Value("skilasLilaKurang", val)} />
                                    </td>
                                  </tr>

                                  {/* 4. GANGGUAN PENGLIHATAN */}
                                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                                    <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                      Gangguan Penglihatan
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Masalah pada mata (sulit lihat jauh, membaca, penyakit mata, sedang dalam pengobatan Hipertensi/Diabetes)</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasMasalahMata_${examinationMode}`} value={getLangkah4Value("skilasMasalahMata")} onChange={(val) => updateLangkah4Value("skilasMasalahMata", val)} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Tes Melihat</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasTesLihat_${examinationMode}`} value={getLangkah4Value("skilasTesLihat")} onChange={(val) => updateLangkah4Value("skilasTesLihat", val)} />
                                    </td>
                                  </tr>

                                  {/* 5. GANGGUAN PENDENGARAN */}
                                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                                    <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                      Gangguan Pendengaran
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Tes Berbisik</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasTesBisik_${examinationMode}`} value={getLangkah4Value("skilasTesBisik")} onChange={(val) => updateLangkah4Value("skilasTesBisik", val)} />
                                    </td>
                                  </tr>

                                  {/* 6. GEJALA DEPRESI */}
                                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                                    <td colSpan="2" className="px-3 py-1.5 fw-bold text-dark small">
                                      Gejala Depresi (dalam 2 minggu terakhir)
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Perasaan sedih, tertekan, atau putus asa</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasPerasaanSedih_${examinationMode}`} value={getLangkah4Value("skilasPerasaanSedih")} onChange={(val) => updateLangkah4Value("skilasPerasaanSedih", val)} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 small text-dark ps-4">&bull; Sedikit minat atau kesenangan dalam melakukan sesuatu</td>
                                    <td className="px-3 py-2">
                                      <YesNoRadio name={`skilasHilangMinat_${examinationMode}`} value={getLangkah4Value("skilasHilangMinat")} onChange={(val) => updateLangkah4Value("skilasHilangMinat", val)} />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Catatan Penyuluhan & Rujukan SKILAS */}
                            <div className="p-3 rounded-3 bg-light border">
                              <div className="d-flex flex-column gap-1 text-muted small mb-2">
                                <div>
                                  <strong>Penyuluhan*:</strong> Tema edukasi yang diberikan disesuaikan dengan domain risiko skrining.
                                </div>
                                <div>
                                  <strong>Rujukan*:</strong> Rujuk puskesmas atau pustu bila ada indikasi resiko hasil pemeriksaan dan skrining.
                                </div>
                              </div>
                              {!currentSkilas.isAnswered ? (
                                <div className="alert alert-light text-muted d-flex align-items-center gap-2 mb-0 py-2 small border">
                                  <Info size={16} className="flex-shrink-0 text-primary" />
                                  <div>Silakan jawab instrumen skrining SKILAS di atas untuk mengevaluasi 6 domain kapasitas fungsional lansia.</div>
                                </div>
                              ) : currentSkilas.adaRisiko ? (
                                <div className="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 small">
                                  <AlertCircle size={16} className="flex-shrink-0" />
                                  <div>
                                    <strong>Indikasi Rujukan Otomatis SKILAS:</strong> Ditemukan indikasi risiko pada domain: <em>{currentSkilas.issues.join(", ")}</em> &rarr; Status rujukan otomatis diset ke{" "}
                                    <strong>"Rujuk ke Puskesmas / Pustu"</strong>.
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
              ) : activeSubmenu === "usekrem-15-18" ? (
                <>
                  {/* Kadar Gula Darah & Plotting Gula Darah */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Kadar Gula Darah &amp; Plotting</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Kadar Gula Darah (mg/dl)</label>
                        <div className="input-group">
<<<<<<< HEAD
                          <input
                            type="number"
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 110"
                            value={examinationMode === "per-step" ? langkah2Form.gulaDarah : sequentialForm.gulaDarah}
                            onChange={(e) => {
                              if (examinationMode === "per-step") {
=======
                          <input 
                            type="number"
                            className="form-control bg-light border-0 py-2"
                            placeholder="Contoh: 110"
                            value={examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <div className="bg-light p-2 rounded-3 border-0 fw-bold text-dark d-flex align-items-center justify-content-between" style={{ minHeight: "38px" }}>
                          <span>
                            {parseInt(examinationMode === "per-step" ? langkah2Form.gulaDarah : sequentialForm.gulaDarah) >= 200
                              ? "Diabetisi (D) - ≥ 200 mg/dl"
                              : parseInt(examinationMode === "per-step" ? langkah2Form.gulaDarah : sequentialForm.gulaDarah) >= 140
                                ? "Prediabetisi (Pd) - 140-199 mg/dl"
                                : "Normal (N) - 80-140 mg/dl"}
=======
                        <div className="bg-light p-2 rounded-3 border-0 fw-bold text-dark d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>
                          <span>
                            {parseInt(examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah) >= 200 
                              ? 'Diabetisi (D) - ≥ 200 mg/dl'
                              : parseInt(examinationMode === 'per-step' ? langkah2Form.gulaDarah : sequentialForm.gulaDarah) >= 140
                                ? 'Prediabetisi (Pd) - 140-199 mg/dl'
                                : 'Normal (N) - 80-140 mg/dl'}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skrining Gejala TBC */}
<<<<<<< HEAD
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <YesNoCard label="Batuk ≥ 2 minggu" name={`batukTbc_u1518_${examinationMode}`} value={getLangkah4Value("batukTbc")} onChange={(val) => updateLangkah4Value("batukTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="Demam hilang timbul &gt; 2 minggu" name={`demamTbc_u1518_${examinationMode}`} value={getLangkah4Value("demamTbc")} onChange={(val) => updateLangkah4Value("demamTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="Berat badan turun/tidak naik dalam 2 bulan" name={`bbTurunTbc_u1518_${examinationMode}`} value={getLangkah4Value("bbTurunTbc")} onChange={(val) => updateLangkah4Value("bbTurunTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="Lesu / malaise" name={`lesuTbc_u1518_${examinationMode}`} value={getLangkah4Value("lesuTbc")} onChange={(val) => updateLangkah4Value("lesuTbc", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>

                  {/* B. Pemeriksaan 6 Bulan Sekali */}
<<<<<<< HEAD
                  <PeriodicScreeningPanel
                    id={`screening-6-month-${activeSubmenu}`}
                    title="B. Pemeriksaan 6 Bulan Sekali"
                    description="Pemeriksaan penglihatan dan pendengaran yang dilakukan setiap enam bulan bila sudah jatuh tempo."
                    due={sixMonthScreeningDue}
                    loading={periodicScreeningInfo.loading}
                    checked={getLangkah4Value("isSkrining6Bulanan")}
                    lastCompletedDate={periodicScreeningInfo.lastSixMonthDate}
                    onToggle={(checked) => updateLangkah4Value("isSkrining6Bulanan", checked)}
                  >
=======
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold text-dark mb-3">B. Pemeriksaan 6 Bulan Sekali</h5>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

                    <h6 className="fw-bold text-primary mb-2">Tes Penglihatan (Hitung Jari)</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kanan</label>
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.mataKanan || "" : sequentialForm.mataKanan || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKanan || '') : (sequentialForm.mataKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.mataKiri || "" : sequentialForm.mataKiri || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.mataKiri || '') : (sequentialForm.mataKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.telingaKanan || "" : sequentialForm.telingaKanan || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKanan || '') : (sequentialForm.telingaKanan || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.telingaKiri || "" : sequentialForm.telingaKiri || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
=======
                        <select 
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === 'per-step' ? (langkah4Form.telingaKiri || '') : (sequentialForm.telingaKiri || '')}
                          onChange={(e) => {
                            if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                  </PeriodicScreeningPanel>

                  {/* C. Skrining Remaja */}
                  <div hidden={!annualScreeningDue || periodicScreeningInfo.loading} className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  </div>

                  {/* C. Pemeriksaan Tahunan Remaja */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">1x / Tahun</span>
<<<<<<< HEAD
                          <h5 className="fw-bold text-dark mb-0">Skrining Remaja</h5>
                        </div>
                        <p className="text-muted small mb-0">Skrining Kesehatan Jiwa &amp; Pemeriksaan Anemia (Hb) berkala tahunan.</p>
                      </div>
                      <div className="d-flex align-items-center gap-3 bg-light p-2 px-3 rounded-4 border">
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="toggleSkriningTahunanRemaja15"
                            style={{ width: "2.4em", height: "1.2em", cursor: "pointer" }}
                            checked={Boolean(getLangkah4Value("isSkriningTahunan"))}
                            onChange={(e) => updateLangkah4Value("isSkriningTahunan", e.target.checked)}
                          />
                          <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor="toggleSkriningTahunanRemaja15">
                            {getLangkah4Value("isSkriningTahunan") ? "Lakukan Skrining" : "Tidak Dilakukan"}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* Banner Riwayat Terakhir Skrining Tahunan Remaja */}
                    <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
                      <div className="d-flex align-items-center gap-2">
<<<<<<< HEAD
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? "text-success" : annualScreeningInfo.hasHistory ? "text-warning" : "text-secondary"}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>{annualScreeningInfo.statusLabel}</span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: "0.82rem" }}>
=======
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? 'text-success' : annualScreeningInfo.hasHistory ? 'text-warning' : 'text-secondary'}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>
                              {annualScreeningInfo.statusLabel}
                            </span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: '0.82rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            {annualScreeningInfo.detailText}
                          </div>
                        </div>
                      </div>

<<<<<<< HEAD
                      {annualScreeningInfo.tglFormatted !== "-" && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: "0.8rem" }}>
=======
                      {annualScreeningInfo.tglFormatted !== '-' && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: '0.8rem' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          <span className="d-block text-secondary fw-semibold">Terakhir Diisi:</span>
                          <span className="badge bg-white text-dark border px-2 py-1 font-monospace">{annualScreeningInfo.tglFormatted}</span>
                        </div>
                      )}
                    </div>

<<<<<<< HEAD
                    {!getLangkah4Value("isSkriningTahunan") ? (
=======
                    {!getLangkah4Value('isSkriningTahunan') ? (
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      <div className="alert alert-light border rounded-3 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 small">
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <Info size={16} className="text-primary flex-shrink-0" />
                          <span>Pemeriksaan tahunan tidak dilakukan pada kunjungan ini. Anda dapat langsung menyimpan data langkah 4 tanpa instrumen tahunan.</span>
                        </div>
<<<<<<< HEAD
                        <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => updateLangkah4Value("isSkriningTahunan", true)}>
=======
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => updateLangkah4Value('isSkriningTahunan', true)}
                        >
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          Isi Pemeriksaan
                        </button>
                      </div>
                    ) : (
                      <div className="row g-3 pt-2 border-top">
<<<<<<< HEAD
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Melakukan skrining jiwa</label>
                          <select
                            className="form-select bg-light border-0 py-2"
                            value={examinationMode === "per-step" ? langkah4Form.skriningJiwa || "" : sequentialForm.skriningJiwa || ""}
                            onChange={(e) => {
                              if (examinationMode === "per-step") {
=======
                        <div className={isPutriStep4 ? "col-md-6" : "col-12"}>
                          <label className="form-label fw-semibold text-dark small mb-1">Melakukan skrining jiwa</label>
                          <select 
                            className="form-select bg-light border-0 py-2"
                            value={examinationMode === 'per-step' ? (langkah4Form.skriningJiwa || '') : (sequentialForm.skriningJiwa || '')}
                            onChange={(e) => {
                              if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                        {isRemajaPerempuan && (
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-dark small mb-1">Periksa Hb</label>

                            <select
                              className="form-select bg-light border-0 py-2"
                              value={examinationMode === "per-step" ? langkah4Form.periksaHb || "" : sequentialForm.periksaHb || ""}
                              onChange={(e) => {
                                if (examinationMode === "per-step") {
                                  setLangkah4Form({
                                    ...langkah4Form,
                                    periksaHb: e.target.value,
                                  });
                                } else {
                                  setSequentialForm({
                                    ...sequentialForm,
                                    periksaHb: e.target.value,
                                  });
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
              ) : activeSubmenu === "usekrem-6-14" ? (
                <>
                  {/* Skrining Gejala TBC */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <YesNoCard label="Batuk ≥ 2 minggu" name={`batukTbc_u614_${examinationMode}`} value={getLangkah4Value("batukTbc")} onChange={(val) => updateLangkah4Value("batukTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="Demam hilang timbul > 2 minggu" name={`demamTbc_u614_${examinationMode}`} value={getLangkah4Value("demamTbc")} onChange={(val) => updateLangkah4Value("demamTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="Berat badan turun/tidak naik dalam 2 bulan" name={`bbTurunTbc_u614_${examinationMode}`} value={getLangkah4Value("bbTurunTbc")} onChange={(val) => updateLangkah4Value("bbTurunTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="Lesu / malaise" name={`lesuTbc_u614_${examinationMode}`} value={getLangkah4Value("lesuTbc")} onChange={(val) => updateLangkah4Value("lesuTbc", val)} />
                      </div>
                    </div>
                  </div>

                  {/* B. Pemeriksaan 6 Bulan Sekali */}
                  <PeriodicScreeningPanel
                    id={`screening-6-month-${activeSubmenu}`}
                    title="B. Pemeriksaan 6 Bulan Sekali"
                    description="Pemeriksaan penglihatan dan pendengaran yang dilakukan setiap enam bulan bila sudah jatuh tempo."
                    due={sixMonthScreeningDue}
                    loading={periodicScreeningInfo.loading}
                    checked={getLangkah4Value("isSkrining6Bulanan")}
                    lastCompletedDate={periodicScreeningInfo.lastSixMonthDate}
                    onToggle={(checked) => updateLangkah4Value("isSkrining6Bulanan", checked)}
                  >

                    <h6 className="fw-bold text-primary mb-2">Tes Penglihatan (Hitung Jari)</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small mb-1">Mata Kanan</label>
                        <select
                          className="form-select bg-light border-0 py-2"
                          value={examinationMode === "per-step" ? langkah4Form.mataKanan || "" : sequentialForm.mataKanan || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
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
                          value={examinationMode === "per-step" ? langkah4Form.mataKiri || "" : sequentialForm.mataKiri || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
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
                          value={examinationMode === "per-step" ? langkah4Form.telingaKanan || "" : sequentialForm.telingaKanan || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
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
                          value={examinationMode === "per-step" ? langkah4Form.telingaKiri || "" : sequentialForm.telingaKiri || ""}
                          onChange={(e) => {
                            if (examinationMode === "per-step") {
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
                  </PeriodicScreeningPanel>

                  {/* C. Skrining Remaja */}
                  <div hidden={!annualScreeningDue || periodicScreeningInfo.loading} className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">1x / Tahun</span>
                          <h5 className="fw-bold text-dark mb-0">Skrining Remaja</h5>
                        </div>
                        <p className="text-muted small mb-0">Skrining Kesehatan Jiwa &amp; Pemeriksaan Anemia (Hb) berkala tahunan.</p>
                      </div>
                      <div className="d-flex align-items-center gap-3 bg-light p-2 px-3 rounded-4 border">
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="toggleSkriningTahunanRemaja6"
                            style={{ width: "2.4em", height: "1.2em", cursor: "pointer" }}
                            checked={Boolean(getLangkah4Value("isSkriningTahunan"))}
                            onChange={(e) => updateLangkah4Value("isSkriningTahunan", e.target.checked)}
                          />
                          <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor="toggleSkriningTahunanRemaja6">
                            {getLangkah4Value("isSkriningTahunan") ? "Lakukan Skrining" : "Tidak Dilakukan"}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Banner Riwayat Terakhir Skrining Tahunan Remaja */}
                    <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={18} className={`flex-shrink-0 ${annualScreeningInfo.isCurrentYear ? "text-success" : annualScreeningInfo.hasHistory ? "text-warning" : "text-secondary"}`} />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark small">Riwayat Skrining Tahunan:</span>
                            <span className={`badge ${annualScreeningInfo.badgeClass} rounded-pill px-2.5 py-1 small fw-bold`}>{annualScreeningInfo.statusLabel}</span>
                          </div>
                          <div className="text-muted small mt-0.5" style={{ fontSize: "0.82rem" }}>
                            {annualScreeningInfo.detailText}
                          </div>
                        </div>
                      </div>

                      {annualScreeningInfo.tglFormatted !== "-" && (
                        <div className="text-md-end text-muted small ps-md-3 border-md-start" style={{ fontSize: "0.8rem" }}>
                          <span className="d-block text-secondary fw-semibold">Terakhir Diisi:</span>
                          <span className="badge bg-white text-dark border px-2 py-1 font-monospace">{annualScreeningInfo.tglFormatted}</span>
                        </div>
                      )}
                    </div>

                    {!getLangkah4Value("isSkriningTahunan") ? (
                      <div className="alert alert-light border rounded-3 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 small">
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <Info size={16} className="text-primary flex-shrink-0" />
                          <span>Pemeriksaan tahunan tidak dilakukan pada kunjungan ini. Anda dapat langsung menyimpan data langkah 4 tanpa instrumen tahunan.</span>
                        </div>
                        <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => updateLangkah4Value("isSkriningTahunan", true)}>
                          Isi Pemeriksaan
                        </button>
                      </div>
                    ) : (
                      <div className="row g-3 pt-2 border-top">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Melakukan skrining jiwa</label>
                          <select
                            className="form-select bg-light border-0 py-2"
                            value={examinationMode === "per-step" ? langkah4Form.skriningJiwa || "" : sequentialForm.skriningJiwa || ""}
                            onChange={(e) => {
                              if (examinationMode === "per-step") {
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
                        {isRemajaPerempuan && (
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-dark small mb-1">Periksa Hb</label>
                            <select
                              className="form-select bg-light border-0 py-2"
                              value={examinationMode === "per-step" ? langkah4Form.periksaHb || "" : sequentialForm.periksaHb || ""}
                              onChange={(e) => {
                                if (examinationMode === "per-step") {
=======

                        {isPutriStep4 && (
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-dark small mb-1">Periksa Hb</label>
                            <select 
                              className="form-select bg-light border-0 py-2"
                              value={examinationMode === 'per-step' ? (langkah4Form.periksaHb || '') : (sequentialForm.periksaHb || '')}
                              onChange={(e) => {
                                if (examinationMode === 'per-step') {
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
              ) : ["bayi-0-11", "balita-12-59"].includes(activeSubmenu) ? (
                <>
                  {/* 1. Imunisasi */}
                  <ImunisasiTableHistory rows={activeImunisasiRows} onChange={updateActiveImunisasiRows} />

                  {/* 2. Pemberian ASI & MP-ASI (Dipisah di bawah Imunisasi) */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Pemberian ASI &amp; MP-ASI</h5>

                    <div className="row g-3">
                      {/* ASI Eksklusif: Otomatis hanya untuk bayi usia 0 - 6 bulan */}
<<<<<<< HEAD
                      {activeSubmenu === "bayi-0-11" &&
                        (() => {
                          const targetW = activeWargaList.find((w) => String(w.id) === String(examinationMode === "per-step" ? selectedWargaStep4 : selectedWargaId));
                          const ageMos = getAgeInMonths(targetW);
                          if (ageMos > 6) return null;
                          return (
                            <div className="col-md-6">
                              <YesNoCard label="ASI Eksklusif (0-6 Bulan)" name={`asiEksklusif_${examinationMode}`} value={getLangkah4Value("asiEksklusif")} onChange={(val) => updateLangkah4Value("asiEksklusif", val)} />
                            </div>
                          );
                        })()}

                      <div className="col-md-6">
                        <YesNoCard label="MP ASI (Komposisi, jenis sesuai umur)" name={`mpAsi_${examinationMode}`} value={getLangkah4Value("mpAsi")} onChange={(val) => updateLangkah4Value("mpAsi", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>

                  {/* Skrining Gejala TBC Bayi / Balita */}
<<<<<<< HEAD
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="a. Batuk ≥ 2 minggu" name={`batukTbc_bayi_${examinationMode}`} value={getLangkah4Value("batukTbc")} onChange={(val) => updateLangkah4Value("batukTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="b. Demam hilang dan timbul > 2 minggu" name={`demamTbc_bayi_${examinationMode}`} value={getLangkah4Value("demamTbc")} onChange={(val) => updateLangkah4Value("demamTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="c. Berat badan turun/tidak naik dalam 2 bulan" name={`bbTurunTbc_bayi_${examinationMode}`} value={getLangkah4Value("bbTurunTbc")} onChange={(val) => updateLangkah4Value("bbTurunTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="d. Lesu / malaise" name={`lesuTbc_bayi_${examinationMode}`} value={getLangkah4Value("lesuTbc")} onChange={(val) => updateLangkah4Value("lesuTbc", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>

                  {/* Balita / Bayi Mendapatkan Layanan Kesehatan */}
<<<<<<< HEAD
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Layanan Kesehatan Tambahan &amp; Vitamin</h5>

                    <div className="row g-3">
                      {/* 1. PMT lokal pemulihan (+ Sub-pertanyaan Konsumsi PMT habis di dalamnya secara stabil) */}
                      <div className="col-md-6">
<<<<<<< HEAD
                        <div className="p-3.5 rounded-3 border bg-white h-100 d-flex flex-column justify-content-center" style={{ borderColor: "#cbd5e1", backgroundColor: "#ffffff", minHeight: "58px" }}>
                          <div className="d-flex align-items-center justify-content-between gap-3">
                            <span className="fw-medium text-dark small mb-0">PMT lokal pemulihan</span>
                            <div className="d-flex align-items-center gap-4 flex-shrink-0">
                              <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: "pointer" }}>
=======
                        <div 
                          className="p-3.5 rounded-3 border bg-white h-100 d-flex flex-column justify-content-center"
                          style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff', minHeight: '58px' }}
                        >
                          <div className="d-flex align-items-center justify-content-between gap-3">
                            <span className="fw-medium text-dark small mb-0">PMT lokal pemulihan</span>
                            <div className="d-flex align-items-center gap-4 flex-shrink-0">
                              <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                <input
                                  type="radio"
                                  name={`pmtPemulihan_${examinationMode}`}
                                  value="Ya"
<<<<<<< HEAD
                                  checked={getLangkah4Value("pmtPemulihan") === "Ya"}
                                  onChange={() => updateLangkah4Value("pmtPemulihan", "Ya")}
                                  className="form-check-input m-0 cursor-pointer"
                                  style={{ width: "1.15rem", height: "1.15rem", cursor: "pointer", accentColor: "#F25B8E" }}
                                />
                                <span>Ya</span>
                              </label>
                              <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: "pointer" }}>
=======
                                  checked={getLangkah4Value('pmtPemulihan') === 'Ya'}
                                  onChange={() => updateLangkah4Value('pmtPemulihan', 'Ya')}
                                  className="form-check-input m-0 cursor-pointer"
                                  style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
                                />
                                <span>Ya</span>
                              </label>
                              <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                <input
                                  type="radio"
                                  name={`pmtPemulihan_${examinationMode}`}
                                  value="Tidak"
<<<<<<< HEAD
                                  checked={getLangkah4Value("pmtPemulihan") === "Tidak"}
                                  onChange={() => {
                                    updateLangkah4Value("pmtPemulihan", "Tidak");
                                    updateLangkah4Value("pmtHabis", "");
                                  }}
                                  className="form-check-input m-0 cursor-pointer"
                                  style={{ width: "1.15rem", height: "1.15rem", cursor: "pointer", accentColor: "#F25B8E" }}
=======
                                  checked={getLangkah4Value('pmtPemulihan') === 'Tidak'}
                                  onChange={() => {
                                    updateLangkah4Value('pmtPemulihan', 'Tidak');
                                    updateLangkah4Value('pmtHabis', '');
                                  }}
                                  className="form-check-input m-0 cursor-pointer"
                                  style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                />
                                <span>Tidak</span>
                              </label>
                            </div>
                          </div>

                          {/* 2. Konsumsi PMT habis: Terbuka secara konsisten di dalam slot PMT tanpa menggeser kartu lain */}
<<<<<<< HEAD
                          {getLangkah4Value("pmtPemulihan") === "Ya" && (
                            <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between gap-3">
                              <span className="small fw-semibold text-primary mb-0">&bull; Apakah PMT lokal yang diberikan dihabiskan?</span>
                              <div className="d-flex align-items-center gap-4 flex-shrink-0">
                                <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: "pointer" }}>
=======
                          {getLangkah4Value('pmtPemulihan') === 'Ya' && (
                            <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between gap-3">
                              <span className="small fw-semibold text-primary mb-0">&bull; Apakah PMT lokal yang diberikan dihabiskan?</span>
                              <div className="d-flex align-items-center gap-4 flex-shrink-0">
                                <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                  <input
                                    type="radio"
                                    name={`pmtHabis_${examinationMode}`}
                                    value="Ya"
<<<<<<< HEAD
                                    checked={getLangkah4Value("pmtHabis") === "Ya"}
                                    onChange={() => updateLangkah4Value("pmtHabis", "Ya")}
                                    className="form-check-input m-0 cursor-pointer"
                                    style={{ width: "1.15rem", height: "1.15rem", cursor: "pointer", accentColor: "#F25B8E" }}
                                  />
                                  <span>Ya</span>
                                </label>
                                <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: "pointer" }}>
=======
                                    checked={getLangkah4Value('pmtHabis') === 'Ya'}
                                    onChange={() => updateLangkah4Value('pmtHabis', 'Ya')}
                                    className="form-check-input m-0 cursor-pointer"
                                    style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
                                  />
                                  <span>Ya</span>
                                </label>
                                <label className="d-flex align-items-center gap-2 cursor-pointer small fw-medium text-dark mb-0" style={{ cursor: 'pointer' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                  <input
                                    type="radio"
                                    name={`pmtHabis_${examinationMode}`}
                                    value="Tidak"
<<<<<<< HEAD
                                    checked={getLangkah4Value("pmtHabis") === "Tidak"}
                                    onChange={() => updateLangkah4Value("pmtHabis", "Tidak")}
                                    className="form-check-input m-0 cursor-pointer"
                                    style={{ width: "1.15rem", height: "1.15rem", cursor: "pointer", accentColor: "#F25B8E" }}
=======
                                    checked={getLangkah4Value('pmtHabis') === 'Tidak'}
                                    onChange={() => updateLangkah4Value('pmtHabis', 'Tidak')}
                                    className="form-check-input m-0 cursor-pointer"
                                    style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: '#F25B8E' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                          <YesNoCard label="Vitamin A (Bulan Feb &amp; Ags)" name={`vitA_${examinationMode}`} value={getLangkah4Value("vitA")} onChange={(val) => updateLangkah4Value("vitA", val)} />
=======
                          <YesNoCard
                            label="Vitamin A (Bulan Feb &amp; Ags)"
                            name={`vitA_${examinationMode}`}
                            value={getLangkah4Value('vitA')}
                            onChange={(val) => updateLangkah4Value('vitA', val)}
                          />
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        </div>
                      )}

                      {/* 4. Obat Cacing - Balita 12-59 Bulan */}
<<<<<<< HEAD
                      {activeSubmenu === "balita-12-59" && (
                        <div className="col-md-6">
                          <YesNoCard label="Obat Cacing" name={`obatCacing_${examinationMode}`} value={getLangkah4Value("obatCacing")} onChange={(val) => updateLangkah4Value("obatCacing", val)} />
=======
                      {activeSubmenu === 'balita-12-59' && (
                        <div className="col-md-6">
                          <YesNoCard
                            label="Obat Cacing"
                            name={`obatCacing_${examinationMode}`}
                            value={getLangkah4Value('obatCacing')}
                            onChange={(val) => updateLangkah4Value('obatCacing', val)}
                          />
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        </div>
                      )}

                      {/* 5. Ikut kelas balita: Posisi tetap konsisten dan tidak berpindah baris */}
                      <div className="col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="Ikut kelas balita" name={`ikutKelasBalita_${examinationMode}`} value={getLangkah4Value("ikutKelasBalita")} onChange={(val) => updateLangkah4Value("ikutKelasBalita", val)} />
=======
                        <YesNoCard
                          label="Ikut kelas balita"
                          name={`ikutKelasBalita_${examinationMode}`}
                          value={getLangkah4Value('ikutKelasBalita')}
                          onChange={(val) => updateLangkah4Value('ikutKelasBalita', val)}
                        />
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>
                </>
<<<<<<< HEAD
              ) : activeSubmenu === "apras" ? (
                /* Apras 60-72 Bln: Skrining Gejala TBC & Obat Cacing (Y/T) */
                <>
                  {/* Skrining Gejala TBC */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
              ) : activeSubmenu === 'apras' ? (
                /* Apras 60-72 Bln: Skrining Gejala TBC & Obat Cacing (Y/T) */
                <>
                  {/* Skrining Gejala TBC */}
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="a. Batuk ≥ 2 minggu" name={`batukTbc_apras_${examinationMode}`} value={getLangkah4Value("batukTbc")} onChange={(val) => updateLangkah4Value("batukTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="b. Demam hilang dan timbul > 2 minggu" name={`demamTbc_apras_${examinationMode}`} value={getLangkah4Value("demamTbc")} onChange={(val) => updateLangkah4Value("demamTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="c. Berat badan turun/tidak naik dalam 2 bulan" name={`bbTurunTbc_apras_${examinationMode}`} value={getLangkah4Value("bbTurunTbc")} onChange={(val) => updateLangkah4Value("bbTurunTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="d. Lesu / malaise" name={`lesuTbc_apras_${examinationMode}`} value={getLangkah4Value("lesuTbc")} onChange={(val) => updateLangkah4Value("lesuTbc", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>

                  {/* Obat Cacing (Y/T) */}
<<<<<<< HEAD
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Pemberian Obat Cacing</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="Obat Cacing (Y/T)" name={`obatCacing_apras_${examinationMode}`} value={getLangkah4Value("obatCacing")} onChange={(val) => updateLangkah4Value("obatCacing", val)} />
=======
                        <YesNoCard
                          label="Obat Cacing (Y/T)"
                          name={`obatCacing_apras_${examinationMode}`}
                          value={getLangkah4Value('obatCacing')}
                          onChange={(val) => updateLangkah4Value('obatCacing', val)}
                        />
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Standard TBC & Pelayanan Kesehatan for Bumil/Nifas/Adults */
                <>
<<<<<<< HEAD
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <h5 className="fw-bold text-dark mb-3">Skrining Gejala TBC</h5>

                    <div className="row g-3">
                      <div className="col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="Batuk terus menerus" name={`batukTbc_bumil_${examinationMode}`} value={getLangkah4Value("batukTbc")} onChange={(val) => updateLangkah4Value("batukTbc", val)} />
                      </div>

                      <div className="col-md-6">
                        <YesNoCard label="Demam ≥ 2 minggu" name={`demamTbc_bumil_${examinationMode}`} value={getLangkah4Value("demamTbc")} onChange={(val) => updateLangkah4Value("demamTbc", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>

                      <div className="col-md-6">
                        <YesNoCard
                          label="BB tidak naik atau turun dalam 2 bulan berturut-turut"
                          name={`bbTurunTbc_bumil_${examinationMode}`}
<<<<<<< HEAD
                          value={getLangkah4Value("bbTurunTbc")}
                          onChange={(val) => updateLangkah4Value("bbTurunTbc", val)}
=======
                          value={getLangkah4Value('bbTurunTbc')}
                          onChange={(val) => updateLangkah4Value('bbTurunTbc', val)}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        />
                      </div>

                      <div className="col-md-6">
<<<<<<< HEAD
                        <YesNoCard label="Kontak erat Pasien TBC" name={`kontakTbc_bumil_${examinationMode}`} value={getLangkah4Value("kontakTbc")} onChange={(val) => updateLangkah4Value("kontakTbc", val)} />
=======
                        <YesNoCard
                          label="Kontak erat Pasien TBC"
                          name={`kontakTbc_bumil_${examinationMode}`}
                          value={getLangkah4Value('kontakTbc')}
                          onChange={(val) => updateLangkah4Value('kontakTbc', val)}
                        />
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      </div>
                    </div>
                  </div>

                  {/* Pelayanan Kesehatan khusus Ibu Hamil */}
<<<<<<< HEAD
                  {activeSubmenu === "bumil" && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  {activeSubmenu === 'bumil' && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      <h5 className="fw-bold text-dark mb-3">Pelayanan Kesehatan</h5>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <YesNoCard
                            label="Pemberian TTD/MMS"
                            name={`pemberianTtd_bumil_${examinationMode}`}
<<<<<<< HEAD
                            value={getLangkah4Value("pemberianTtd") || getLangkah4Value("jumlahTtd")}
                            onChange={(val) => {
                              updateLangkah4Value("pemberianTtd", val);
                              updateLangkah4Value("jumlahTtd", val);
=======
                            value={getLangkah4Value('pemberianTtd') || getLangkah4Value('jumlahTtd')}
                            onChange={(val) => {
                              updateLangkah4Value('pemberianTtd', val);
                              updateLangkah4Value('jumlahTtd', val);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                            value={getLangkah4Value("rutinTtd")}
                            onChange={(val) => updateLangkah4Value("rutinTtd", val)}
=======
                            value={getLangkah4Value('rutinTtd')}
                            onChange={(val) => updateLangkah4Value('rutinTtd', val)}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                          />
                        </div>

                        <div className="col-md-6">
                          <div className="p-3 bg-light border border-light-subtle rounded-3 h-100">
<<<<<<< HEAD
                            <label className="form-label text-dark fw-semibold small mb-1.5">Jika mendapatkan MT Bumil KEK, tuliskan komposisi dan jumlah porsi</label>
=======
                            <label className="form-label text-dark fw-semibold small mb-1.5">
                              Jika mendapatkan MT Bumil KEK, tuliskan komposisi dan jumlah porsi
                            </label>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            <input
                              type="text"
                              className="form-control form-control-sm bg-white border"
                              placeholder="Contoh: Biskuit PMT, 1 Bungkus / Hari"
<<<<<<< HEAD
                              value={getLangkah4Value("komposisiMtBumil") || ""}
                              onChange={(e) => updateLangkah4Value("komposisiMtBumil", e.target.value)}
                              style={{ borderRadius: "8px", fontSize: "0.85rem" }}
=======
                              value={getLangkah4Value('komposisiMtBumil') || ''}
                              onChange={(e) => updateLangkah4Value('komposisiMtBumil', e.target.value)}
                              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
<<<<<<< HEAD
                          <YesNoCard label="Rutin konsumsi MT Bumil KEK" name={`rutinMtBumil_bumil_${examinationMode}`} value={getLangkah4Value("rutinMtBumil")} onChange={(val) => updateLangkah4Value("rutinMtBumil", val)} />
=======
                          <YesNoCard
                            label="Rutin konsumsi MT Bumil KEK"
                            name={`rutinMtBumil_bumil_${examinationMode}`}
                            value={getLangkah4Value('rutinMtBumil')}
                            onChange={(val) => updateLangkah4Value('rutinMtBumil', val)}
                          />
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pelayanan Kesehatan khusus Ibu Nifas / Menyusui */}
<<<<<<< HEAD
                  {activeSubmenu === "nifas" && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  {activeSubmenu === 'nifas' && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      <h5 className="fw-bold text-dark mb-3">Pelayanan Kesehatan</h5>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <YesNoCard
                            label="Pemberian kapsul vitamin A"
                            name={`jumlahVitA_${examinationMode}`}
<<<<<<< HEAD
                            value={getLangkah4Value("jumlahVitA")}
                            onChange={(val) => updateLangkah4Value("jumlahVitA", val)}
=======
                            value={getLangkah4Value('jumlahVitA')}
                            onChange={(val) => updateLangkah4Value('jumlahVitA', val)}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            yesLabel="Sudah"
                            noLabel="Belum"
                            yesValue="Sudah"
                            noValue="Belum"
                          />
                        </div>

                        <div className="col-md-6">
<<<<<<< HEAD
                          <YesNoCard label="Rutin konsumsi vitamin A" name={`rutinVitA_${examinationMode}`} value={getLangkah4Value("rutinVitA")} onChange={(val) => updateLangkah4Value("rutinVitA", val)} />
                        </div>

                        <div className="col-md-6">
                          <YesNoCard label="Menyusui" name={`menyusui_${examinationMode}`} value={getLangkah4Value("menyusui")} onChange={(val) => updateLangkah4Value("menyusui", val)} />
                        </div>

                        <div className="col-md-6">
                          <YesNoCard label="KB pasca persalinan" name={`kbPascaPersalinan_${examinationMode}`} value={getLangkah4Value("kbPascaPersalinan")} onChange={(val) => updateLangkah4Value("kbPascaPersalinan", val)} />
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skrining Kesehatan Jiwa khusus Usia Dewasa (PHQ-4) */}
<<<<<<< HEAD
                  {activeSubmenu === "dewasa" && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
=======
                  {activeSubmenu === 'dewasa' && (
                    <div className="card card-custom p-4 bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-3 gap-2">
                        <div>
                          <h5 className="fw-bold text-dark mb-1">Skrining Kesehatan Jiwa</h5>
                          <span className="text-muted small">Pemeriksaan skrining kesehatan jiwa berkala untuk sasaran usia dewasa (PHQ-4)</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <label className="text-muted small fw-semibold mb-0 text-nowrap">Bulan Pelaksanaan:</label>
                          <select
                            className="form-select form-select-sm bg-light border-0 fw-semibold"
<<<<<<< HEAD
                            style={{ width: "130px" }}
                            value={getLangkah4Value("bulanSkriningJiwa") || ""}
                            onChange={(e) => updateLangkah4Value("bulanSkriningJiwa", e.target.value)}
                          >
                            {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
=======
                            style={{ width: '130px' }}
                            value={getLangkah4Value('bulanSkriningJiwa') || 'Januari'}
                            onChange={(e) => updateLangkah4Value('bulanSkriningJiwa', e.target.value)}
                          >
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                              <option key={m} value={m}>{m}</option>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="table-responsive border rounded-3 mb-2">
<<<<<<< HEAD
                        <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                          <thead className="table-light text-center" style={{ fontSize: "0.80rem" }}>
                            <tr>
                              <th style={{ width: "45px", verticalAlign: "middle" }}>No</th>
                              <th style={{ verticalAlign: "middle" }}>Pertanyaan</th>
                              <th style={{ width: "125px", verticalAlign: "middle" }}>
                                Tidak sama sekali
                                <br />
                                <span className="text-muted small fw-normal">(0)</span>
                              </th>
                              <th style={{ width: "135px", verticalAlign: "middle" }}>
                                Kurang dari 1 minggu
                                <br />
                                <span className="text-muted small fw-normal">(1)</span>
                              </th>
                              <th style={{ width: "135px", verticalAlign: "middle" }}>
                                Lebih dari 1 minggu
                                <br />
                                <span className="text-muted small fw-normal">(2)</span>
                              </th>
                              <th style={{ width: "135px", verticalAlign: "middle" }}>
                                Hampir setiap hari
                                <br />
                                <span className="text-muted small fw-normal">(3)</span>
                              </th>
=======
                        <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                          <thead className="table-light text-center" style={{ fontSize: '0.80rem' }}>
                            <tr>
                              <th style={{ width: '45px', verticalAlign: 'middle' }}>No</th>
                              <th style={{ verticalAlign: 'middle' }}>Pertanyaan</th>
                              <th style={{ width: '125px', verticalAlign: 'middle' }}>Tidak sama sekali<br/><span className="text-muted small fw-normal">(0)</span></th>
                              <th style={{ width: '135px', verticalAlign: 'middle' }}>Kurang dari 1 minggu<br/><span className="text-muted small fw-normal">(1)</span></th>
                              <th style={{ width: '135px', verticalAlign: 'middle' }}>Lebih dari 1 minggu<br/><span className="text-muted small fw-normal">(2)</span></th>
                              <th style={{ width: '135px', verticalAlign: 'middle' }}>Hampir setiap hari<br/><span className="text-muted small fw-normal">(3)</span></th>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            </tr>
                          </thead>
                          <tbody>
                            {[
<<<<<<< HEAD
                              { id: "jiwaQ1", no: 1, text: "Kurang berminat atau bergairah dalam melakukan kegiatan?" },
                              { id: "jiwaQ2", no: 2, text: "Merasa sedih, muram, depresi atau putus asa?" },
                              { id: "jiwaQ3", no: 3, text: "Merasa gugup, cemas, gelisah, tegang, atau mudah marah?" },
                              { id: "jiwaQ4", no: 4, text: "Merasa tidak mampu menghentikan atau mengendalikan rasa khawatir?" },
=======
                              { id: 'jiwaQ1', no: 1, text: 'Kurang berminat atau bergairah dalam melakukan kegiatan?' },
                              { id: 'jiwaQ2', no: 2, text: 'Merasa sedih, muram, depresi atau putus asa?' },
                              { id: 'jiwaQ3', no: 3, text: 'Merasa gugup, cemas, gelisah, tegang, atau mudah marah?' },
                              { id: 'jiwaQ4', no: 4, text: 'Merasa tidak mampu menghentikan atau mengendalikan rasa khawatir?' },
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                            ].map((q) => {
                              const currentVal = getLangkah4Value(q.id);
                              return (
                                <tr key={q.id}>
                                  <td className="text-center fw-bold text-muted">{q.no}</td>
                                  <td className="fw-medium text-dark">{q.text}</td>
                                  {[0, 1, 2, 3].map((score) => (
                                    <td key={score} className="text-center">
<<<<<<< HEAD
                                      <label className="w-100 h-100 d-flex align-items-center justify-content-center cursor-pointer m-0 py-1" style={{ cursor: "pointer" }}>
=======
                                      <label className="w-100 h-100 d-flex align-items-center justify-content-center cursor-pointer m-0 py-1" style={{ cursor: 'pointer' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                        <input
                                          type="radio"
                                          name={`${q.id}_${examinationMode}`}
                                          value={String(score)}
                                          checked={String(currentVal) === String(score)}
                                          onChange={() => {
                                            updateLangkah4Value(q.id, String(score));
<<<<<<< HEAD
                                            const v1 = q.id === "jiwaQ1" ? score : Number(getLangkah4Value("jiwaQ1")) || 0;
                                            const v2 = q.id === "jiwaQ2" ? score : Number(getLangkah4Value("jiwaQ2")) || 0;
                                            const v3 = q.id === "jiwaQ3" ? score : Number(getLangkah4Value("jiwaQ3")) || 0;
                                            const v4 = q.id === "jiwaQ4" ? score : Number(getLangkah4Value("jiwaQ4")) || 0;
                                            const tot = v1 + v2 + v3 + v4;
                                            updateLangkah4Value("totalSkorJiwa", String(tot));
                                            updateLangkah4Value("skriningJiwa", tot >= 3 ? `Skor: ${tot} (Perlu Rujukan)` : `Skor: ${tot} (Normal)`);
                                          }}
                                          className="form-check-input m-0 cursor-pointer"
                                          style={{ width: "1.15rem", height: "1.15rem", cursor: "pointer", accentColor: "#F25B8E" }}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                              const v1 = Number(getLangkah4Value("jiwaQ1")) || 0;
                              const v2 = Number(getLangkah4Value("jiwaQ2")) || 0;
                              const v3 = Number(getLangkah4Value("jiwaQ3")) || 0;
                              const v4 = Number(getLangkah4Value("jiwaQ4")) || 0;
                              const isFilled =
                                getLangkah4Value("jiwaQ1") !== undefined &&
                                getLangkah4Value("jiwaQ1") !== "" &&
                                getLangkah4Value("jiwaQ2") !== undefined &&
                                getLangkah4Value("jiwaQ2") !== "" &&
                                getLangkah4Value("jiwaQ3") !== undefined &&
                                getLangkah4Value("jiwaQ3") !== "" &&
                                getLangkah4Value("jiwaQ4") !== undefined &&
                                getLangkah4Value("jiwaQ4") !== "";
=======
                              const v1 = Number(getLangkah4Value('jiwaQ1')) || 0;
                              const v2 = Number(getLangkah4Value('jiwaQ2')) || 0;
                              const v3 = Number(getLangkah4Value('jiwaQ3')) || 0;
                              const v4 = Number(getLangkah4Value('jiwaQ4')) || 0;
                              const isFilled = getLangkah4Value('jiwaQ1') !== undefined && getLangkah4Value('jiwaQ1') !== '' &&
                                               getLangkah4Value('jiwaQ2') !== undefined && getLangkah4Value('jiwaQ2') !== '' &&
                                               getLangkah4Value('jiwaQ3') !== undefined && getLangkah4Value('jiwaQ3') !== '' &&
                                               getLangkah4Value('jiwaQ4') !== undefined && getLangkah4Value('jiwaQ4') !== '';
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              const total = v1 + v2 + v3 + v4;
                              const isRisk = total >= 3;
                              return (
                                <tr>
<<<<<<< HEAD
                                  <td colSpan="2" className="fw-bold text-dark text-end pe-3">
                                    Total Skor:
                                  </td>
=======
                                  <td colSpan="2" className="fw-bold text-dark text-end pe-3">Total Skor:</td>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                                  <td colSpan="4" className="fw-bold text-center">
                                    {isFilled ? (
                                      <div className="d-flex align-items-center justify-content-center gap-2">
                                        <span className="fs-6 fw-bold text-dark">{total}</span>
<<<<<<< HEAD
                                        <span className={`badge ${isRisk ? "bg-danger text-white" : "bg-success text-white"} px-2.5 py-1 rounded-pill small`}>
                                          {isRisk ? "Skor ≥ 3: Indikasi Gangguan Emosional (Perlu Rujukan / Konseling)" : "Skor < 3: Normal / Tidak Ada Indikasi"}
=======
                                        <span className={`badge ${isRisk ? 'bg-danger text-white' : 'bg-success text-white'} px-2.5 py-1 rounded-pill small`}>
                                          {isRisk ? 'Skor ≥ 3: Indikasi Gangguan Emosional (Perlu Rujukan / Konseling)' : 'Skor < 3: Normal / Tidak Ada Indikasi'}
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                {examinationMode === "per-step" ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: "#2b2e4a" }}>
=======
                {examinationMode === 'per-step' ? (
                  <button type="submit" className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    <span>Simpan</span>
                  </button>
                ) : (
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={() => setActiveStep(3)}>
                      <ArrowLeft size={15} />
                      <span>Kembali</span>
                    </button>
<<<<<<< HEAD
                    <button type="submit" className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: "#2b2e4a" }}>
=======
                    <button type="submit" className="btn btn-dark-custom btn-sm px-3.5 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#2b2e4a' }}>
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
          {activeStep === 5 &&
            (() => {
              const backendPersistedRujukan = activeStep5BackendExam?.is_perlu_rujukan === true || Boolean(activeStep5BackendExam?.rujukan);
              const effectiveRujukan = step5AutoReferral.perluRujuk || backendPersistedRujukan ? "Rujuk ke Puskesmas / Pustu" : examinationMode === "per-step" ? langkah5Form.statusRujukan : sequentialForm.statusRujukan;

              return (
                <form onSubmit={examinationMode === "per-step" ? handleSaveLangkah5 : handleSaveSequentialAll}>
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                    <div>
                      <h3 className="fw-bold text-dark mb-1">Penyuluhan* &amp; Rujukan*</h3>
                    </div>

                    {examinationMode === "per-step" && (
                      <div className="bg-white px-3 py-2 rounded-3 border-0 shadow-sm d-flex align-items-center gap-2">
                        <label className="fw-bold text-dark small mb-0 text-nowrap">Pilih Nama Lengkap / NIK:</label>
                        <select
                          className="form-select form-select-sm border-0 fw-semibold text-dark"
                          style={{ minWidth: "220px" }}
                          value={selectedWargaStep5}
                          onChange={(e) => {
                            const wId = e.target.value;
                            setSelectedWargaStep5(wId);
                            setLangkah5Form({ topikPenyuluhan: "", mengikutiKelas: "", statusRujukan: "", alasanRujukan: "" });
                          }}
                        >
                          {availableWargaStep5.length === 0 ? (
                            <option value="">{hadirWargaList.length === 0 ? "-- Belum ada sasaran hadir di Langkah 1 --" : "-- Semua sasaran telah selesai di Langkah 5 --"}</option>
                          ) : (
                            availableWargaStep5.map((w) => (
                              <option key={w.id} value={String(w.id)}>
                                {w.nama} - NIK {String(w.nik).slice(-4)}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                  </div>

                  {examinationMode === "per-step" && hadirWargaList.length === 0 && (
                    <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3">
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <span className="small">
                        Belum ada sasaran <strong>{currentCategory.label}</strong> yang ditandai <strong>Datang</strong> pada Langkah 1. Silakan cari dan tandai kehadiran di <strong>Langkah 1 (Presensi)</strong> terlebih dahulu.
                      </span>
                      <button type="button" className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1.5 ms-auto" onClick={() => setActiveStep(1)}>
                        <ArrowLeft size={14} />
                        Ke Langkah 1
                      </button>
                    </div>
                  )}

                  <div className="row g-4 mb-4">
                    <div className="col-12">
                      <label className="form-label fw-bold text-dark small mb-1">Topik Penyuluhan*</label>
                      <textarea
                        rows="3"
                        className="form-control form-control-custom bg-white border-0 py-3"
                        placeholder="Tulis topik edukasi yang diberikan (Contoh: Gizi Seimbang Balita &amp; Pencegahan Stunting)"
                        value={examinationMode === "per-step" ? langkah5Form.topikPenyuluhan : sequentialForm.topikPenyuluhan}
                        required
                        onChange={(e) => {
                          if (examinationMode === "per-step") {
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
                        disabled={step5AutoReferral.perluRujuk || backendPersistedRujukan}
                        onChange={(e) => {
                          if (!step5AutoReferral.perluRujuk && !backendPersistedRujukan) {
                            if (examinationMode === "per-step") {
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

                    {step5AutoReferral.reasons.length > 0 && (
                      <div className="col-12">
                        <div className="border border-warning-subtle rounded-3 bg-light p-3">
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div className="fw-semibold small text-dark">Indikasi rujukan otomatis</div>
                            <span className="badge bg-danger-subtle text-danger">Rujuk ke Puskesmas / Pustu</span>
                          </div>
                          <ul className="small text-secondary mb-0 mt-2 ps-3">
                            {step5AutoReferral.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    {effectiveRujukan === "Rujuk ke Puskesmas / Pustu" && (
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark small mb-1" htmlFor="referral-reason">
                          {step5AutoReferral.perluRujuk ? "Indikasi tambahan dari kader (opsional)" : "Indikasi Rujukan dari Kader*"}
                        </label>
                        <textarea
                          id="referral-reason"
                          rows="2"
                          maxLength={1000}
                          className="form-control form-control-custom bg-white border-0 py-3"
                          placeholder="Tuliskan indikasi rujukan manual jika tidak muncul dari skrining otomatis"
                          value={examinationMode === "per-step" ? langkah5Form.alasanRujukan || "" : sequentialForm.alasanRujukan || ""}
                          onChange={(event) => {
                            if (examinationMode === "per-step") {
                              setLangkah5Form((previous) => ({ ...previous, alasanRujukan: event.target.value }));
                            } else {
                              setSequentialForm((previous) => ({ ...previous, alasanRujukan: event.target.value }));
                            }
                          }}
                          required={!step5AutoReferral.perluRujuk}
                        />
                        <div className="form-text text-muted"></div>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-end pt-3 gap-2">
                    {examinationMode === "per-step" ? (
                      <button type="submit" disabled={!selectedWargaStep5} className="btn btn-dark-custom btn-sm px-4 py-2 rounded-3 text-white fw-medium d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: "#2b2e4a" }}>
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
                          style={{ backgroundColor: "#2b2e4a" }}
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
=======
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

>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
        </div>
      </div>

      {/* MODAL PREVIEW MODE BERTAHAP (SEBELUM DISIMPAN) */}
      {showSequentialPreviewModal && (
<<<<<<< HEAD
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }} tabIndex="-1">
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
                  const previewWarga = activeWargaList.find((w) => String(w.id) === String(selectedWargaId)) || {};
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

                  // PUMA evaluation
                  const pumaEvaluation = (() => {
                    const jk = sequentialForm.pumaJk;
                    const usia = sequentialForm.pumaUsia;
                    const rokok = sequentialForm.pumaMerokok;
                    const np = sequentialForm.pumaNapasPendek;
                    const dh = sequentialForm.pumaDahak;
                    const bt = sequentialForm.pumaBatukFlu;

<<<<<<< HEAD
                    const isAny = [jk, usia, rokok, np, dh, bt].some((v) => v !== "" && v !== undefined && v !== null);
                    if (!isAny) {
                      return { score: "-", text: "Belum Diisi", isRisiko: false };
                    }
                    const score =
                      (jk !== "" && jk !== undefined ? Number(jk) : 0) +
                      (usia !== "" && usia !== undefined ? Number(usia) : 0) +
                      (rokok !== "" && rokok !== undefined ? Number(rokok) : 0) +
                      (np === "Ya" || np === 1 ? 1 : 0) +
                      (dh === "Ya" || dh === 1 ? 1 : 0) +
                      (bt === "Ya" || bt === 1 ? 1 : 0);
                    const isRisiko = score > 6;
                    const statusText = score === 6 ? "Skor Ambigu" : isRisiko ? "Risiko Tinggi PPOK" : "Risiko Rendah PPOK";
                    return {
                      score,
                      text: `${score} (${statusText})`,
                      isRisiko,
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    };
                  })();

                  // Kolesterol evaluation
                  const kolesterolEval = (() => {
<<<<<<< HEAD
                    if (!sequentialForm.kolesterol) return "-";
=======
                    if (!sequentialForm.kolesterol) return '-';
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                    const kNum = parseInt(sequentialForm.kolesterol);
                    if (isNaN(kNum)) return sequentialForm.kolesterol;
                    if (kNum >= 200) return `${kNum} mg/dL (Tinggi ≥ 200 mg/dL)`;
                    return `${kNum} mg/dL (Normal < 200 mg/dL)`;
                  })();

                  // Gula Darah evaluation
                  const gulaDarahEval = (() => {
<<<<<<< HEAD
                    if (!sequentialForm.gulaDarah) return "-";
=======
                    if (!sequentialForm.gulaDarah) return '-';
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
                      batukVal === "Ya" ? "Batuk Berdahak ≥ 2 Minggu" : null,
                      sequentialForm.nafsuMakanTbc === "Ya" ? "Nafsu Makan Turun" : null,
                      sequentialForm.bbMenurunTbc === "Ya" ? "BB Menurun" : null,
                      sequentialForm.lemahLesuTbc === "Ya" ? "Lemah / Lesu" : null,
                      sequentialForm.berkeringatMalamTbc === "Ya" ? "Keringat Malam" : null,
                      sequentialForm.batukDarahTbc === "Ya" ? "Batuk Berdarah" : null,
                      sequentialForm.sesakNafasTbc === "Ya" ? "Sesak Nafas" : null,
                    ].filter(Boolean);

                    const isFilled = [batukVal, sequentialForm.nafsuMakanTbc, sequentialForm.bbMenurunTbc, sequentialForm.lemahLesuTbc, sequentialForm.berkeringatMalamTbc, sequentialForm.batukDarahTbc, sequentialForm.sesakNafasTbc].some(
                      (v) => v !== "" && v !== undefined,
                    );

                    if (flags.length > 0) return { text: `Berisiko TBC (${flags.join(", ")})`, isRisiko: true };
                    if (isFilled) return { text: "Tidak Ada Gejala TBC (Normal)", isRisiko: false };
                    return { text: "Tidak Ada Gejala TBC (Normal)", isRisiko: false };
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                  })();

                  // TBC Gejala for Children & Maternal
                  const tbcChildGejala = (() => {
                    const batukVal = sequentialForm.batukTbc || sequentialForm.batukBesarTbc;
                    const flags = [
<<<<<<< HEAD
                      batukVal === "Ya" ? "Batuk ≥ 2 mgg" : null,
                      sequentialForm.demamTbc === "Ya" ? "Demam > 2 mgg" : null,
                      sequentialForm.bbTurunTbc === "Ya" ? "BB Turun / Tidak Naik" : null,
                      sequentialForm.kontakTbc === "Ya" ? "Kontak Pasien TBC" : null,
                      sequentialForm.lesuTbc === "Ya" ? "Lesu / Lemas" : null,
                    ].filter(Boolean);

                    const isFilled = [batukVal, sequentialForm.demamTbc, sequentialForm.bbTurunTbc, sequentialForm.kontakTbc, sequentialForm.lesuTbc].some((v) => v !== "" && v !== undefined);

                    if (flags.length > 0) return { text: `Berisiko TBC (${flags.join(", ")})`, isRisiko: true };
                    if (isFilled) return { text: "Tidak Ada Gejala TBC (Normal)", isRisiko: false };
                    return { text: "Tidak Ada Gejala TBC (Normal)", isRisiko: false };
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
                          <div className="col-6">
                            <strong>NIK:</strong> {sequentialForm.nik || previewWarga.nik || ""}
                          </div>
                          <div className="col-6">
                            <strong>Nama Lengkap:</strong> {sequentialForm.nama || previewWarga.nama || ""}
                          </div>
                          <div className="col-6">
                            <strong>Tanggal Lahir:</strong> {formatDateId(sequentialForm.tglLahir || previewWarga.tglLahir)}
                          </div>
                          <div className="col-6">
                            <strong>Jenis Kelamin:</strong> {["bumil", "nifas"].includes(activeSubmenu) ? "Perempuan" : sequentialForm.gender || previewWarga.gender || ""}
                          </div>

                          {["dewasa", "lansia"].includes(activeSubmenu) && (
                            <>
                              <div className="col-6">
                                <strong>Pekerjaan:</strong> {sequentialForm.pekerjaan || previewWarga.pekerjaan || ""}
                              </div>
                              <div className="col-6">
                                <strong>Status Pernikahan:</strong> {sequentialForm.statusPernikahan || previewWarga.statusPernikahan || ""}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              </div>
                            </>
                          )}

<<<<<<< HEAD
                          {["usekrem-6-14", "usekrem-15-18"].includes(activeSubmenu) && (
                            <>
                              <div className="col-6">
                                <strong>Sekolah:</strong> {sequentialForm.sekolah || previewWarga.sekolah || ""}
                              </div>
                              <div className="col-6">
                                <strong>Kelas:</strong> {sequentialForm.kelas || previewWarga.kelas || ""}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              </div>
                            </>
                          )}

<<<<<<< HEAD
                          {activeSubmenu === "bumil" && (
                            <div className="col-12 mt-2 pt-1 border-top">
                              <strong>Usia Kehamilan:</strong> <span className="badge bg-light text-dark border fw-medium px-2 py-1 ms-1">{sequentialForm.usiaKehamilan || ""}</span>
                            </div>
                          )}
                          {activeSubmenu === "nifas" && (
                            <div className="col-12 mt-2 pt-1 border-top">
                              <strong>Waktu Kunjungan:</strong> <span className="badge bg-light text-dark border fw-medium px-2 py-1 ms-1">{sequentialForm.waktuKunjunganNifas || ""}</span>
                            </div>
                          )}
                          {["bayi-0-11", "balita-12-59", "apras"].includes(activeSubmenu) && (
                            <div className="col-12 mt-2 pt-1 border-top">
                              <strong>{activeSubmenu === "bayi-0-11" ? "Umur Bayi:" : activeSubmenu === "balita-12-59" ? "Umur Balita:" : "Umur Apras:"}</strong>{" "}
                              <span className="badge bg-light text-dark border fw-medium px-2 py-1 ms-1">
                                {(activeSubmenu === "bayi-0-11" ? sequentialForm.usiaBayi : activeSubmenu === "balita-12-59" ? sequentialForm.usiaBalita : sequentialForm.usiaApras) || ""}
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
                          <div className="col-6">
                            <strong>Berat Badan (BB):</strong> {sequentialForm.bb ? `${sequentialForm.bb} kg` : "-"}
                          </div>
                          {activeSubmenu !== "nifas" && (
                            <div className="col-6">
                              <strong>{["bayi-0-11", "balita-12-59"].includes(activeSubmenu) ? "Panjang / Tinggi Badan (PB/TB):" : "Tinggi Badan (TB):"}</strong> {sequentialForm.tb ? `${sequentialForm.tb} cm` : "-"}
                            </div>
                          )}
                          {["bumil", "bayi-0-11", "balita-12-59", "apras", "dewasa", "lansia"].includes(activeSubmenu) && (
                            <div className="col-6">
                              <strong>Lingkar Lengan (LiLA):</strong> {sequentialForm.lila ? `${sequentialForm.lila} cm` : "-"}
                            </div>
                          )}
                          {["usekrem-15-18", "dewasa", "lansia"].includes(activeSubmenu) && (
                            <div className="col-6">
                              <strong>Lingkar Perut (LP):</strong> {sequentialForm.lp ? `${sequentialForm.lp} cm` : "-"}
                            </div>
                          )}
                          {["bayi-0-11", "balita-12-59"].includes(activeSubmenu) && (
                            <div className="col-6">
                              <strong>Lingkar Kepala (LK):</strong> {sequentialForm.lk ? `${sequentialForm.lk} cm` : "-"}
                            </div>
                          )}
                          {["bumil", "nifas", "usekrem-15-18", "dewasa", "lansia"].includes(activeSubmenu) && (
                            <div className="col-6">
                              <strong>Tekanan Darah:</strong> {sequentialForm.tensiSistol && sequentialForm.tensiDiastol ? `${sequentialForm.tensiSistol}/${sequentialForm.tensiDiastol} mmHg` : "-"}
                            </div>
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
                          {["dewasa", "lansia"].includes(activeSubmenu) && (
                            <>
                              <div className="col-6">
                                <strong>Plotting IMT:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtDewasaStatus || ""}</span> <span className="text-muted">({plottingResult?.imt ?? ""} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Plotting LiLA:</strong> <span className="fw-semibold text-dark">{activeSubmenu === "lansia" ? plottingResult?.lilaLansiaStatus || "" : plottingResult?.lilaDewasaStatus || ""}</span>
                              </div>
                              <div className="col-6">
                                <strong>Tekanan Darah:</strong> <span className="fw-semibold text-dark">{plottingResult?.tensiStatus || ""}</span>
                              </div>
                              <div className="col-6">
                                <strong>Lingkar Perut:</strong> <span className="fw-semibold text-dark">{plottingResult?.lpPlottingStatus || ""}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === "usekrem-15-18" && (
                            <>
                              <div className="col-6">
                                <strong>Plotting IMT:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtUsekremStatus || ""}</span> <span className="text-muted">({plottingResult?.imt ?? ""} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Tekanan Darah:</strong> <span className="fw-semibold text-dark">{plottingResult?.tensiRemajaStatus || ""}</span>
                              </div>
                              <div className="col-6">
                                <strong>Lingkar Perut:</strong> <span className="fw-semibold text-dark">{plottingResult?.lpPlottingStatus || ""}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === "usekrem-6-14" && (
                            <div className="col-12">
                              <strong>Plotting IMT/U:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtUsekremStatus || ""}</span> <span className="text-muted">({plottingResult?.imt ?? ""} kg/m²)</span>
                            </div>
                          )}

                          {activeSubmenu === "apras" && (
                            <>
                              <div className="col-6">
                                <strong>Plotting IMT/U:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtAprasStatus || ""}</span> <span className="text-muted">({plottingResult?.imt ?? ""} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Plotting LiLA:</strong> <span className="fw-semibold text-dark">{plottingResult?.lilaAprasStatus || ""}</span>
                              </div>
                            </>
                          )}

                          {["bayi-0-11", "balita-12-59"].includes(activeSubmenu) && (
                            <>
                              <div className="col-6">
                                <strong>BB / Usia (BB/U):</strong> <span className="fw-semibold text-dark">{plottingResult?.bbUStatus || ""}</span>
                              </div>
                              <div className="col-6">
                                <strong>PB/TB / Usia:</strong> <span className="fw-semibold text-dark">{plottingResult?.pbUStatus || ""}</span>
                              </div>
                              <div className="col-6">
                                <strong>BB / PB (TB):</strong> <span className="fw-semibold text-dark">{plottingResult?.bbPbStatus || ""}</span>
                              </div>
                              <div className="col-6">
                                <strong>Lingkar Kepala:</strong> <span className="fw-semibold text-dark">{plottingResult?.lkStatus || ""}</span>
                              </div>
                              <div className="col-12">
                                <strong>Status LiLA:</strong> <span className="fw-semibold text-dark">{plottingResult?.lilaBayiStatus || ""}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === "bumil" && (
                            <>
                              <div className="col-6">
                                <strong>Status IMT:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtStatus || ""}</span> <span className="text-muted">({plottingResult?.imt ?? ""} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Status LiLA:</strong> <span className="fw-semibold text-dark">{plottingResult?.lilaStatus || ""}</span>
                              </div>
                              <div className="col-12">
                                <strong>Tekanan Darah:</strong> <span className="fw-semibold text-dark">{plottingResult?.tensiStatus || ""}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === "nifas" && (
                            <>
                              <div className="col-6">
                                <strong>Status IMT:</strong> <span className="fw-semibold text-dark">{plottingResult?.imtStatus || ""}</span> <span className="text-muted">({plottingResult?.imt ?? ""} kg/m²)</span>
                              </div>
                              <div className="col-6">
                                <strong>Tekanan Darah:</strong> <span className="fw-semibold text-dark">{plottingResult?.tensiStatus || ""}</span>
                              </div>
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
                          {activeSubmenu === "lansia" && (
                            <>
                              <div className="col-6">
                                <strong>Kadar Gula Darah:</strong> {gulaDarahEval}
                              </div>
                              <div className="col-6">
                                <strong>Kadar Kolesterol:</strong> {kolesterolEval}
                              </div>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcAdultGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcAdultGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>Tes Penglihatan (Hitung Jari):</strong> Kanan: {sequentialForm.mataKanan || ""} • Kiri: {sequentialForm.mataKiri || ""}
                              </div>
                              <div className="col-6">
                                <strong>Tes Pendengaran (Berbisik):</strong> Kanan: {sequentialForm.telingaKanan || ""} • Kiri: {sequentialForm.telingaKiri || ""}
                              </div>
                              <div className="col-12 pt-2 border-top">
                                <strong>C.1 Skrining PPOK (PUMA):</strong> <span className={`badge ${pumaEvaluation.isRisiko ? "bg-danger text-white" : "bg-success-subtle text-success"} px-2 py-1 ms-1`}>{pumaEvaluation.text}</span>
                              </div>
                              <div className="col-12">
                                <strong>C.2 Skor AKS (Barthel):</strong>{" "}
                                <span className="fw-semibold text-dark">
                                  {currentAks.total}/20 ({currentAks.kategori})
                                </span>
                              </div>
                              <div className="col-12">
                                <strong>C.3 Status SKILAS:</strong> <span className="fw-semibold text-dark">{currentSkilas.statusText}</span>
                              </div>
                            </>
                          )}

                          {activeSubmenu === "dewasa" && (
                            <>
                              <div className="col-6">
                                <strong>Kadar Gula Darah:</strong> {gulaDarahEval}
                              </div>
                              <div className="col-6">
                                <strong>Kadar Kolesterol:</strong> {kolesterolEval}
                              </div>
                              <div className="col-6">
                                <strong>Alat Kontrasepsi:</strong> {sequentialForm.alatKontrasepsi || ""}
                              </div>
                              <div className="col-6">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcAdultGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcAdultGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>Tes Penglihatan (Hitung Jari):</strong> Kanan: {sequentialForm.mataKanan || ""} • Kiri: {sequentialForm.mataKiri || ""}
                              </div>
                              <div className="col-6">
                                <strong>Tes Pendengaran (Berbisik):</strong> Kanan: {sequentialForm.telingaKanan || ""} • Kiri: {sequentialForm.telingaKiri || ""}
                              </div>
                              <div className="col-12 pt-2 border-top">
                                <strong>C.1 Skrining PPOK (PUMA):</strong> <span className={`badge ${pumaEvaluation.isRisiko ? "bg-danger text-white" : "bg-success-subtle text-success"} px-2 py-1 ms-1`}>{pumaEvaluation.text}</span>
                              </div>
                            </>
                          )}

                          {["usekrem-6-14", "usekrem-15-18"].includes(activeSubmenu) && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcChildGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>Skrining Penglihatan:</strong> Kanan: {sequentialForm.mataKanan || ""} • Kiri: {sequentialForm.mataKiri || ""}
                              </div>
                              <div className="col-6">
                                <strong>Skrining Pendengaran:</strong> Kanan: {sequentialForm.telingaKanan || ""} • Kiri: {sequentialForm.telingaKiri || ""}
                              </div>
                              <div className="col-6">
                                <strong>Skrining Jiwa:</strong> {sequentialForm.skriningJiwa || ""}
                              </div>
                              <div className="col-6">
                                <strong>Skrining Anemia / Periksa Hb:</strong> {sequentialForm.periksaHb || ""}
                              </div>
                            </>
                          )}

                          {activeSubmenu === "apras" && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcChildGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>Pemberian Obat Cacing:</strong> {sequentialForm.obatCacing || ""}
                              </div>
                            </>
                          )}

                          {activeSubmenu === "balita-12-59" && (
                            <>
                              <div className="col-12">
                                <strong>Imunisasi:</strong>
                                <div className="table-responsive mt-2">
                                  <table className="table table-sm align-middle mb-0">
                                    <thead>
                                      <tr>
                                        <th>Jenis</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                        <th>Tempat</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {activeImunisasiRows.map((row) => (
                                        <tr key={row.jenis_imunisasi}>
                                          <td>{row.jenis_imunisasi}</td>
                                          <td>{row.is_diberikan ? "Diberikan" : "Belum diberikan"}</td>
                                          <td>{row.is_diberikan ? formatDateId(row.tanggal_imunisasi) || "-" : "-"}</td>
                                          <td>{row.is_diberikan ? row.tempat || "-" : "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div className="col-6">
                                <strong>Pemberian MP-ASI:</strong> {sequentialForm.mpAsi || ""}
                              </div>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcChildGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>PMT Pemulihan:</strong> {sequentialForm.pmtPemulihan || ""} (Dihabiskan: {sequentialForm.pmtHabis || ""})
                              </div>
                              <div className="col-6">
                                <strong>Kapsul Vitamin A:</strong> {sequentialForm.vitA || ""}
                              </div>
                              <div className="col-6">
                                <strong>Obat Cacing:</strong> {sequentialForm.obatCacing || ""}
                              </div>
                              <div className="col-6">
                                <strong>Mengikuti Kelas Ibu Balita:</strong> {sequentialForm.ikutKelasBalita || ""}
                              </div>
                            </>
                          )}

                          {activeSubmenu === "bayi-0-11" && (
                            <>
                              <div className="col-12">
                                <strong>Imunisasi:</strong>
                                <div className="table-responsive mt-2">
                                  <table className="table table-sm align-middle mb-0">
                                    <thead>
                                      <tr>
                                        <th>Jenis</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                        <th>Tempat</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {activeImunisasiRows.map((row) => (
                                        <tr key={row.jenis_imunisasi}>
                                          <td>{row.jenis_imunisasi}</td>
                                          <td>{row.is_diberikan ? "Diberikan" : "Belum diberikan"}</td>
                                          <td>{row.is_diberikan ? formatDateId(row.tanggal_imunisasi) || "-" : "-"}</td>
                                          <td>{row.is_diberikan ? row.tempat || "-" : "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div className="col-6">
                                <strong>Pemberian ASI Eksklusif:</strong> {sequentialForm.asiEksklusif || ""}
                              </div>
                              <div className="col-6">
                                <strong>Pemberian MP-ASI:</strong> {sequentialForm.mpAsi || ""}
                              </div>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcChildGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>PMT Pemulihan:</strong> {sequentialForm.pmtPemulihan || ""} (Dihabiskan: {sequentialForm.pmtHabis || ""})
                              </div>
                              <div className="col-6">
                                <strong>Kapsul Vitamin A:</strong> {sequentialForm.vitA || ""}
                              </div>
                              <div className="col-6">
                                <strong>Mengikuti Kelas Ibu Balita:</strong> {sequentialForm.ikutKelasBalita || ""}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              </div>
                            </>
                          )}

<<<<<<< HEAD
                          {activeSubmenu === "bumil" && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcChildGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>Pemberian TTD:</strong> {sequentialForm.pemberianTtd || sequentialForm.jumlahTtd || ""}
                              </div>
                              <div className="col-6">
                                <strong>Rutin Minum TTD:</strong> {sequentialForm.rutinTtd || ""}
                              </div>
                              <div className="col-6">
                                <strong>Komposisi MT Bumil:</strong> {sequentialForm.komposisiMtBumil || ""}
                              </div>
                              <div className="col-6">
                                <strong>Rutin Konsumsi MT:</strong> {sequentialForm.rutinMtBumil || ""}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              </div>
                            </>
                          )}

<<<<<<< HEAD
                          {activeSubmenu === "nifas" && (
                            <>
                              <div className="col-12">
                                <strong>Evaluasi Gejala TBC:</strong> <span className={tbcChildGejala.isRisiko ? "text-danger fw-bold" : "text-dark"}>{tbcChildGejala.text}</span>
                              </div>
                              <div className="col-6">
                                <strong>Pemberian Vitamin A:</strong> {sequentialForm.jumlahVitA || ""}
                              </div>
                              <div className="col-6">
                                <strong>Rutin Minum Vitamin A:</strong> {sequentialForm.rutinVitA || ""}
                              </div>
                              <div className="col-6">
                                <strong>Pelayanan KB Pasca Persalinan:</strong> {sequentialForm.kbPascaPersalinan || ""}
                              </div>
                              <div className="col-6">
                                <strong>Menjaga Kondisi ASI / Menyusui:</strong> {sequentialForm.menyusui || ""}
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                              </div>
                            </>
                          )}
                        </div>
                      </div>

<<<<<<< HEAD
                      {/* LANGKAH 5 */}
                      <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                          <h6 className="fw-bold text-primary mb-0">Langkah 5: Penyuluhan &amp; Rujukan</h6>
                          <span className="badge bg-secondary-subtle text-secondary border fw-semibold">Tindak Lanjut</span>
                        </div>
                        <div className="row g-2 small">
                          <div className="col-12">
                            <strong>Topik Penyuluhan:</strong> {sequentialForm.topikPenyuluhan || ""}
                          </div>
                          <div className="col-6">
                            <strong>Mengikuti Kelas Posyandu:</strong> {sequentialForm.mengikutiKelas || ""}
                          </div>
                          <div className="col-6">
                            <strong>Status Rujukan:</strong> <span className="badge bg-light text-dark border fw-semibold">{sequentialForm.statusRujukan || ""}</span>
                          </div>
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
                <button type="button" className="btn btn-dark-custom btn-sm px-4 rounded-3 text-white fw-bold" style={{ backgroundColor: "#2b2e4a" }} onClick={handleSaveSequentialAll}>
                  ✓ Konfirmasi &amp; Simpan Pemeriksaan
=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
