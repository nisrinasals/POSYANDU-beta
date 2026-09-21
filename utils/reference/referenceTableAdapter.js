"use strict";

const source = require("./referenceTable.json");

const sheetToIndex = (sheetName) => {
  if (sheetName.includes("BBU")) return "BB/U";
  if (sheetName.includes("PBU")) return "PB/U";
  if (sheetName.includes("TBU")) return "TB/U";
  if (sheetName.includes("BBPB")) return sheetName.includes("0-24") ? "BB/PB" : "BB/TB";
  if (sheetName.includes("IMTU")) return "IMT/U";
  return null;
};

const getGender = (sheetName) => (sheetName.startsWith("M(") ? "laki-laki" : "perempuan");
const getAgeRange = (sheetName) => {
  const match = sheetName.match(/\(([^)]+)\)/);
  if (!match) return null;
  if (match[1] === "0-24") return "0-24 bulan";
  if (match[1] === "24-60") return "24-60 bulan";
  return match[1];
};

const getRows = (sheet) => {
  const [, header, ...data] = sheet.rows;
  const index = sheetToIndex(sheet.sheet_name);
  const isFiveToEighteen = sheet.sheet_name.includes("5-18 tahun");
  return data
    .filter((row) => row && row.length)
    .map((row) => {
      const ageMonths = isFiveToEighteen ? Number(row[0]) * 12 + Number(row[1]) : Number(row[0]);
      const values = isFiveToEighteen ? row.slice(2) : row.slice(1);
      const result = {
        age_months: ageMonths,
        sd_minus_3: values[0],
        sd_minus_2: values[1],
        sd_minus_1: values[2],
        median: values[3],
        sd_plus_1: values[4],
        sd_plus_2: values[5],
        sd_plus_3: values[6],
      };
      if (index === "BB/PB") result.length_cm = row[0];
      if (index === "BB/TB") result.height_cm = row[0];
      return result;
    });
};

const tables = source.sheets.map((sheet) => ({
  index: sheetToIndex(sheet.sheet_name),
  gender: getGender(sheet.sheet_name),
  age_range: getAgeRange(sheet.sheet_name),
  rows: getRows(sheet),
}));

module.exports = { source, tables };
