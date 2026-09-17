"use strict";

const { calculateAge, getExportAgeCategory, getExportCategory, getPregnancyExportCategory, getPregnancyExportIndicators } = require("./kategoriExportHelper");

const SASARAN_EXPORT_COLUMNS = Object.freeze([
  { key: "no", label: "No" },
  { key: "nik", label: "NIK" },
  { key: "nama_lengkap", label: "Nama Lengkap" },
  { key: "jenis_kelamin", label: "Jenis Kelamin" },
  { key: "tanggal_lahir", label: "Tanggal Lahir" },
  { key: "usia", label: "Usia" },
  { key: "kategori", label: "Kategori Sasaran" },
  { key: "bumil", label: "Bumil" },
  { key: "nifas", label: "Nifas" },
  { key: "menyusui", label: "Menyusui" },
  { key: "bayi", label: "Bayi (0-11 bln)" },
  { key: "balita", label: "Balita (12-59 bln)" },
  { key: "apras", label: "Apras (60-72 bln)" },
  { key: "usia_sekolah", label: "Usia Sekolah (6-14 th)" },
  { key: "remaja", label: "Remaja (15-18 th)" },
  { key: "dewasa", label: "Dewasa (19-59 th)" },
  { key: "lansia", label: "Lansia (60+ th)" },
  { key: "alamat", label: "Alamat" },
  { key: "rt", label: "RT" },
  { key: "rw", label: "RW" },
  { key: "telepon", label: "Telepon" },
  { key: "nama_ibu", label: "Nama Ibu" },
  { key: "nama_ayah", label: "Nama Ayah" },
  { key: "status_perkawinan", label: "Status Perkawinan" },
  { key: "pekerjaan", label: "Pekerjaan" },
  { key: "status_domisili", label: "Status Domisili" },
]);

const getLatestProfile = (profiles = []) => {
  if (!Array.isArray(profiles) || profiles.length === 0) return null;
  return [...profiles].sort((left, right) => Number(right.id || 0) - Number(left.id || 0))[0];
};

const getCategoryResult = (warga = {}, referenceDate = new Date()) => {
  const profile = getLatestProfile(warga.profileKehamilan);
  const pregnancyCategory = getPregnancyExportCategory(profile);
  if (pregnancyCategory) return pregnancyCategory;

  const age = calculateAge(warga.tanggal_lahir, referenceDate);
  const backendCategory = getExportAgeCategory(age.totalMonths);
  return getExportCategory(backendCategory);
};

const getExportIndicators = (warga = {}, referenceDate = new Date()) => {
  const profile = getLatestProfile(warga.profileKehamilan);
  const ageCategory = getCategoryResult({ ...warga, profileKehamilan: [] }, referenceDate);
  const pregnancyIndicators = getPregnancyExportIndicators(profile);
  const indicators = {
    ...Object.fromEntries(["bumil", "nifas", "menyusui"].map((key) => [key, pregnancyIndicators[key]])),
    ...Object.fromEntries(["bayi", "balita", "apras", "usia_sekolah", "remaja", "dewasa", "lansia"].map((key) => [key, ageCategory?.column === key])),
  };
  return indicators;
};

const formatSasaranRow = (warga = {}, index = 0, referenceDate = new Date()) => {
  const age = calculateAge(warga.tanggal_lahir, referenceDate);
  const category = getCategoryResult(warga, referenceDate);
  const flags = Object.fromEntries(Object.entries(getExportIndicators(warga, referenceDate)).map(([key, value]) => [key, value ? "X" : ""]));

  return {
    no: index + 1,
    nik: warga.nik || "",
    nama_lengkap: warga.nama_lengkap || "",
    jenis_kelamin: warga.jenis_kelamin || "",
    tanggal_lahir: warga.tanggal_lahir || "",
    usia: age.years === null ? "" : `${age.years} tahun ${Math.max(age.months % 12, 0)} bulan`,
    kategori: category?.label || "",
    ...flags,
    alamat: warga.alamat || "",
    rt: warga.rt || "",
    rw: warga.rw || "",
    telepon: warga.telepon || "",
    nama_ibu: warga.nama_ibu || "",
    nama_ayah: warga.nama_ayah || "",
    status_perkawinan: warga.status_perkawinan || "",
    pekerjaan: warga.pekerjaan === "lainnya" ? warga.pekerjaan_lainnya || "" : warga.pekerjaan || "",
    status_domisili: warga.status_domisili || "",
  };
};

module.exports = { SASARAN_EXPORT_COLUMNS, formatSasaranRow, getCategoryResult, getExportIndicators, getLatestProfile };
