"use strict";

const referenceTable = require("./reference/referenceTableAdapter");

const normalizeGender = (gender) => (gender === "L" || gender === "laki-laki" || gender === "male" ? "laki-laki" : "perempuan");
const getTable = (index, gender, ageMonths) => {
  const candidates = referenceTable.tables.filter((table) => table.index === index && table.gender === normalizeGender(gender));
  if (index === "IMT/U")
    return candidates.find((table) => table.selectForAge?.(ageMonths) === table) || candidates.find((table) => table.age_range === (ageMonths < 24 ? "0-24 bulan" : ageMonths <= 60 ? "24-60 bulan" : "5-18 tahun")) || null;
  return candidates.find((table) => table.rows.some((row) => Number(row.age_months) === Number(ageMonths))) || candidates[0] || null;
};
const getRow = (index, gender, ageMonths, lookupKey = "age_months", lookupValue = ageMonths) => {
  const table = getTable(index, gender, ageMonths);
  if (!table) return null;
  const rows = table.rows.filter((row) => Number.isFinite(Number(row[lookupKey])));
  const exact = rows.find((row) => Number(row[lookupKey]) === Number(lookupValue));
  if (exact) return exact;
  if (!["BB/PB", "BB/TB"].includes(index)) return null;
  const numericValue = Number(lookupValue);
  if (!Number.isFinite(numericValue) || numericValue < Number(rows[0]?.[lookupKey]) || numericValue > Number(rows[rows.length - 1]?.[lookupKey])) return null;
  return rows.reduce((nearest, candidate) => (Math.abs(Number(candidate[lookupKey]) - numericValue) < Math.abs(Number(nearest[lookupKey]) - numericValue) ? candidate : nearest));
};

const interpolate = (value, lower, upper, lowerZ, upperZ) => {
  if (value === lower) return lowerZ;
  if (value === upper) return upperZ;
  if (upper === lower) return lowerZ;
  return lowerZ + ((value - lower) / (upper - lower)) * (upperZ - lowerZ);
};

const zScoreFromRow = (value, row) => {
  if (!row || value === null || value === undefined || !Number.isFinite(Number(value))) return null;
  const points = [
    [Number(row.sd_minus_3), -3],
    [Number(row.sd_minus_2), -2],
    [Number(row.sd_minus_1), -1],
    [Number(row.median), 0],
    [Number(row.sd_plus_1), 1],
    [Number(row.sd_plus_2), 2],
    [Number(row.sd_plus_3), 3],
  ].filter(([point]) => Number.isFinite(point));
  if (points.length < 2) return null;
  const numericValue = Number(value);
  if (numericValue <= points[0][0]) return interpolate(numericValue, points[0][0], points[1][0], points[0][1], points[1][1]);
  for (let index = 1; index < points.length; index += 1) {
    if (numericValue <= points[index][0]) return interpolate(numericValue, points[index - 1][0], points[index][0], points[index - 1][1], points[index][1]);
  }
  return interpolate(numericValue, points[points.length - 2][0], points[points.length - 1][0], points[points.length - 2][1], points[points.length - 1][1]);
};

const calculateGrowthZScores = ({ bb_kg, tb_cm, tanggal_lahir, tanggal, jenis_kelamin }) => {
  const birth = new Date(`${tanggal_lahir}T00:00:00Z`);
  const reference = new Date(tanggal instanceof Date ? tanggal : `${String(tanggal).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) return {};
  let ageMonths = (reference.getUTCFullYear() - birth.getUTCFullYear()) * 12 + reference.getUTCMonth() - birth.getUTCMonth();
  if (reference.getUTCDate() < birth.getUTCDate()) ageMonths -= 1;
  if (ageMonths < 0) return {};

  const result = {};
  const bbu = ageMonths <= 60 ? getRow("BB/U", jenis_kelamin, ageMonths) : null;
  const pbu = ageMonths < 24 ? getRow("PB/U", jenis_kelamin, ageMonths) : null;
  const tbu = ageMonths >= 24 && ageMonths <= 60 ? getRow("TB/U", jenis_kelamin, ageMonths) : null;
  const sizeIndex = ageMonths < 24 ? "BB/PB" : ageMonths <= 60 ? "BB/TB" : null;
  const sizeKey = sizeIndex === "BB/PB" ? "length_cm" : "height_cm";
  const sizeRow = sizeIndex && tb_cm !== null && tb_cm !== undefined ? getRow(sizeIndex, jenis_kelamin, ageMonths, sizeKey, tb_cm) : null;
  const imtRow = getRow("IMT/U", jenis_kelamin, ageMonths);
  if (bbu) result.zscore_bbu = zScoreFromRow(bb_kg, bbu);
  if (pbu) result.zscore_pbu = zScoreFromRow(tb_cm, pbu);
  if (tbu) result.zscore_tbu = zScoreFromRow(tb_cm, tbu);
  if (sizeIndex === "BB/PB" && sizeRow) result.zscore_bbpb = zScoreFromRow(bb_kg, sizeRow);
  if (sizeIndex === "BB/TB" && sizeRow) result.zscore_bbtb = zScoreFromRow(bb_kg, sizeRow);
  if (imtRow && bb_kg && tb_cm) result.zscore_imtu = zScoreFromRow(Number(bb_kg) / (Number(tb_cm) / 100) ** 2, imtRow);
  return result;
};

module.exports = { calculateGrowthZScores, getRow, zScoreFromRow };
