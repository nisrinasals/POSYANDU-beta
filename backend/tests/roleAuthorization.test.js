"use strict";

const assert = require("assert");
const { canAccessPosyandu, getPosyanduScope } = require("../utils/posyanduAccessHelper");
const userController = require("../controllers/userController");

const posyanduA = { id: 10, puskesmas_id: 1 };
const posyanduB = { id: 20, puskesmas_id: 2 };

assert.strictEqual(canAccessPosyandu({ role: "kader", posyandu_id: 10 }, posyanduA), true);
assert.strictEqual(canAccessPosyandu({ role: "kader", posyandu_id: 10 }, posyanduB), false);
assert.strictEqual(canAccessPosyandu({ role: "puskesmas", puskesmas_id: 1 }, posyanduA), true);
assert.strictEqual(canAccessPosyandu({ role: "puskesmasAdmin", puskesmas_id: 1 }, posyanduB), false);
assert.strictEqual(canAccessPosyandu({ role: "dinkes" }, posyanduB), true);
assert.strictEqual(canAccessPosyandu({ role: "dinkesAdmin" }, posyanduB), true);
assert.strictEqual(canAccessPosyandu({ role: "sa" }, posyanduB), true);
assert.deepStrictEqual(getPosyanduScope({ role: "kader", posyandu_id: 10 }), { id: 10 });
assert.deepStrictEqual(getPosyanduScope({ role: "puskesmas", puskesmas_id: 1 }), { puskesmas_id: 1 });

const sa = { id: 1, role: "sa" };
const dinkesAdmin = { id: 2, role: "dinkesAdmin" };
const puskesmasAdminA = { id: 3, role: "puskesmasAdmin", puskesmas_id: 1 };
const dinkes = { id: 4, role: "dinkes" };
const puskesmasA = { id: 5, role: "puskesmas", puskesmas_id: 1 };
const puskesmasB = { id: 6, role: "puskesmas", puskesmas_id: 2 };
const kaderA = { id: 7, role: "kader", puskesmas_id: 1 };
const kaderB = { id: 8, role: "kader", puskesmas_id: 2 };

for (const target of [dinkes, puskesmasA, kaderA]) assert.strictEqual(userController.canVerifyUser(sa, target), true);
for (const target of [dinkesAdmin, puskesmasAdminA]) assert.strictEqual(userController.canVerifyUser(sa, target), false);
for (const target of [dinkes, puskesmasA]) assert.strictEqual(userController.canVerifyUser(dinkesAdmin, target), true);
for (const target of [kaderA, dinkesAdmin, puskesmasAdminA]) assert.strictEqual(userController.canVerifyUser(dinkesAdmin, target), false);
assert.strictEqual(userController.canVerifyUser(puskesmasAdminA, puskesmasA), true);
assert.strictEqual(userController.canVerifyUser(puskesmasAdminA, kaderA), true);
for (const target of [dinkes, dinkesAdmin, puskesmasAdminA]) assert.strictEqual(userController.canVerifyUser(puskesmasAdminA, target), false);
for (const actor of [{ role: "dinkes" }, { role: "puskesmas" }, { role: "kader" }]) assert.strictEqual(userController.canVerifyUser(actor, kaderA), false);

assert.strictEqual(userController.canChangeUserRole(sa, dinkes, "dinkesAdmin"), true);
assert.strictEqual(userController.canChangeUserRole(sa, puskesmasA, "kader"), true);
assert.strictEqual(userController.canChangeUserRole(sa, sa, "dinkes"), false);
assert.strictEqual(userController.canChangeUserRole(sa, dinkes, "sa"), false);
assert.strictEqual(userController.canChangeUserRole(dinkesAdmin, kaderA, "puskesmas"), false);
assert.strictEqual(userController.canChangeUserRole(puskesmasAdminA, kaderA, "puskesmas"), false);
assert.strictEqual(userController.canChangeUserRole(kaderA, kaderB, "puskesmas"), false);

assert.strictEqual(userController.canDeactivateUser(dinkesAdmin, dinkes), true);
assert.strictEqual(userController.canDeactivateUser(dinkesAdmin, kaderA), false);
assert.strictEqual(userController.canDeactivateUser(dinkesAdmin, puskesmasAdminA), false);
assert.strictEqual(userController.canDeactivateUser(puskesmasAdminA, kaderA), true);
assert.strictEqual(userController.canDeactivateUser(puskesmasAdminA, puskesmasA), true);
assert.strictEqual(userController.canDeactivateUser(puskesmasAdminA, kaderB), false);
assert.strictEqual(userController.canDeactivateUser(sa, puskesmasB), true);
for (const actor of [sa, dinkesAdmin, puskesmasAdminA]) assert.strictEqual(userController.canDeactivateUser(actor, actor), false);

assert.strictEqual(userController.canReplacePuskesmasAdmin(dinkesAdmin, puskesmasA), true);
assert.strictEqual(userController.canReplacePuskesmasAdmin(sa, puskesmasB), true);
assert.strictEqual(userController.canReplacePuskesmasAdmin(puskesmasAdminA, puskesmasA), false);
assert.strictEqual(userController.canReplaceDinkesAdmin(dinkesAdmin, dinkes), true);
assert.strictEqual(userController.canReplaceDinkesAdmin(sa, dinkes), true);
assert.strictEqual(userController.canReplaceDinkesAdmin(dinkesAdmin, dinkesAdmin), false);
assert.strictEqual(userController.canReplaceDinkesAdmin(puskesmasAdminA, dinkes), false);

const selfResponse = {
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
};
assert.strictEqual(userController.rejectSelf({ user: { id: 5 } }, 5, selfResponse), true);
assert.strictEqual(selfResponse.statusCode, 403);

console.log("role and authorization acceptance tests passed");
