const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '..', 'daftar posyandu 2026.xlsx');
console.log('Reading from:', excelPath);

const wb = xlsx.readFile(excelPath);
console.log('Sheet names:', wb.SheetNames);

wb.SheetNames.forEach(sheetName => {
  const ws = wb.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  console.log(`\n=== SHEET: ${sheetName} (Total Rows: ${rawRows.length}) ===`);
  console.log('Sample rows (first 25):');
  rawRows.slice(0, 25).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, JSON.stringify(row));
  });
});
