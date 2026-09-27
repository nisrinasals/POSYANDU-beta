"use strict";

const assert = require("assert");
const { canAccessPosyandu } = require("../utils/posyanduAccessHelper");

const destination = { id: 7, puskesmas_id: 3 };
assert.strictEqual(canAccessPosyandu({ role: "kader", posyandu_id: 7 }, destination), true);
assert.strictEqual(canAccessPosyandu({ role: "kader", posyandu_id: 8 }, destination), false);
assert.strictEqual(canAccessPosyandu({ role: "puskesmas", puskesmas_id: 3 }, destination), true);
assert.strictEqual(canAccessPosyandu({ role: "puskesmas", puskesmas_id: 4 }, destination), false);
assert.strictEqual(canAccessPosyandu({ role: "dinkes" }, destination), true);
assert.strictEqual(canAccessPosyandu({ role: "sa" }, destination), true);

console.log("warga mutasi destination scope tests passed");
