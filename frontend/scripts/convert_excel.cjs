const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '..', 'daftar posyandu 2026.xlsx');
const wb = xlsx.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rawRows = xlsx.utils.sheet_to_json(ws);

console.log('Total rows:', rawRows.length);

const cleanedList = rawRows.map((r, index) => {
  const no = r['No'] || r['no'] || (index + 1);
  const kecamatan = (r['kecamatan'] || r['Kecamatan'] || '').toString().trim();
  const kelurahan = (r['Kelurahan'] || r['kelurahan'] || '').toString().trim();
  const puskesmas = (r['nama_puskesmas'] || r['puskesmas'] || '').toString().trim();
  const posyandu = (r['nama_posyandu'] || r['posyandu'] || '').toString().trim();
  
  return {
    id: index + 1,
    no: no,
    kecamatan,
    kelurahan,
    puskesmas,
    nama: posyandu,
    label: `${posyandu} (Kel. ${kelurahan}, Pkm. ${puskesmas})`
  };
}).filter(p => p.nama.length > 0);

console.log('Cleaned Posyandu count:', cleanedList.length);

const uniquePuskesmas = [...new Set(cleanedList.map(p => p.puskesmas))].sort();
const uniqueKecamatan = [...new Set(cleanedList.map(p => p.kecamatan))].sort();
const uniqueKelurahan = [...new Set(cleanedList.map(p => p.kelurahan))].sort();
const uniquePosyanduNames = [...new Set(cleanedList.map(p => p.nama))].sort();

console.log('Unique Puskesmas (' + uniquePuskesmas.length + '):', uniquePuskesmas);
console.log('Unique Kecamatan (' + uniqueKecamatan.length + '):', uniqueKecamatan);
console.log('Unique Kelurahan (' + uniqueKelurahan.length + '):', uniqueKelurahan);
console.log('Unique Posyandu Names count:', uniquePosyanduNames.length);

// Save JSON to src/data/daftarPosyandu2026.json
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'daftarPosyandu2026.json');
fs.writeFileSync(jsonPath, JSON.stringify(cleanedList, null, 2), 'utf8');
console.log('Wrote JSON to:', jsonPath);
