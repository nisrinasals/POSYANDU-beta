"use strict";

const { Posyandu } = require("../models");

const getPosyanduScope = (user) => {
  if (["dinkes", "dinkesAdmin", "sa"].includes(user?.role)) return {};
  if (user?.role === "kader") return { id: user.posyandu_id };
  if (["puskesmas", "puskesmasAdmin"].includes(user?.role)) return { puskesmas_id: user.puskesmas_id };
  return { id: null };
};

const getPosyanduInclude = (user, options = {}) => ({
  model: Posyandu,
  as: "posyandu",
  where: getPosyanduScope(user),
  required: true,
  ...options,
});

const canAccessPosyandu = (user, posyandu) => {
  if (!posyandu) return false;
  const scope = getPosyanduScope(user);
  if (scope.id !== undefined) return Number(posyandu.id) === Number(scope.id);
  if (scope.puskesmas_id !== undefined) return Number(posyandu.puskesmas_id) === Number(scope.puskesmas_id);
  return Object.keys(scope).length === 0;
};

module.exports = { getPosyanduScope, getPosyanduInclude, canAccessPosyandu };
