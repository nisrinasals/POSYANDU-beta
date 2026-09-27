"use strict";

const assert = require("assert");
const { canAccessPosyandu, getPosyanduScope } = require("../utils/posyanduAccessHelper");

const posyanduA = { id: 10, puskesmas_id: 1 };
const posyanduB = { id: 20, puskesmas_id: 2 };

assert.strictEqual(canAccessPosyandu({ role: "kader", posyandu_id: 10 }, posyanduA), true);
assert.strictEqual(canAccessPosyandu({ role: "kader", posyandu_id: 10 }, posyanduB), false);
assert.strictEqual(canAccessPosyandu({ role: "puskesmas", puskesmas_id: 1 }, posyanduA), true);
assert.strictEqual(canAccessPosyandu({ role: "puskesmasAdmin", puskesmas_id: 1 }, posyanduB), false);
assert.strictEqual(canAccessPosyandu({ role: "dinkes" }, posyanduB), true);
assert.strictEqual(canAccessPosyandu({ role: "sa" }, posyanduB), true);
assert.deepStrictEqual(getPosyanduScope({ role: "kader", posyandu_id: 10 }), { id: 10 });
assert.deepStrictEqual(getPosyanduScope({ role: "puskesmas", puskesmas_id: 1 }), { puskesmas_id: 1 });

console.log("kunjungan scope authorization tests passed");
