import daftarPosyandu2026Json from './daftarPosyandu2026.json';

// Master List Data Posyandu 2026 dari Excel
export const daftarPosyandu2026 = daftarPosyandu2026Json;

// Format label lengkap untuk dropdown: "Nama Posyandu — Kel. [Kelurahan], Pkm. [Puskesmas]"
export const posyanduListFormatted = daftarPosyandu2026.map(
  (p) => `${p.nama} — Kel. ${p.kelurahan} (Pkm. ${p.puskesmas})`
);

// Format nama posyandu ringkas
export const posyanduNamaList = [...new Set(daftarPosyandu2026.map((p) => p.nama))];

// Standar list untuk kompatibilitas dropdown umum
export const posyanduList = posyanduListFormatted;

// Daftar 18 Puskesmas Se-Kota dari Data 2026
export const puskesmasList = [
  'Danurejan I',
  'Danurejan II',
  'Gedongtengen',
  'Gondokusuman I',
  'Gondokusuman II',
  'Gondomanan',
  'Jetis',
  'Kotagede I',
  'Kotagede II',
  'Kraton',
  'Mantrijeron',
  'Mergangsan',
  'Ngampilan',
  'Pakualaman',
  'Tegalrejo',
  'Umbulharjo I',
  'Umbulharjo II',
  'Wirobrajan'
];

// Daftar 14 Kecamatan dari Data 2026
export const kecamatanList = [
  'Danurejan',
  'Gedong Tengen',
  'Gondokusuman',
  'Gondomanan',
  'Jetis',
  'Kotagede',
  'Kraton',
  'Mantrijeron',
  'Mergangsan',
  'Ngampilan',
  'Pakualaman',
  'Tegalrejo',
  'Umbulharjo',
  'Wirobrajan'
];

// Helper cari posyandu berdasarkan Puskesmas
export const getPosyanduByPuskesmas = (puskesmasName) => {
  if (!puskesmasName || puskesmasName === 'Semua') return daftarPosyandu2026;
  const pkmLower = puskesmasName.toLowerCase();
  return daftarPosyandu2026.filter((p) => p.puskesmas.toLowerCase().includes(pkmLower));
};

// Helper cari posyandu berdasarkan Kelurahan
export const getPosyanduByKelurahan = (kelurahanName) => {
  if (!kelurahanName || kelurahanName === 'Semua') return daftarPosyandu2026;
  const kelLower = kelurahanName.toLowerCase();
  return daftarPosyandu2026.filter((p) => p.kelurahan.toLowerCase().includes(kelLower));
};

export default daftarPosyandu2026;
