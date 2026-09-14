"use strict";

const { body, query } = require("express-validator");
const { positiveId, pagination } = require("./common");

const verifyUser = [positiveId()];
const replacePuskesmasAdmin = [positiveId()];
const replaceDinkesAdmin = [positiveId()];
const deactivateUser = [positiveId()];
const getUsers = [
  ...pagination,
  query("search").optional().trim().isLength({ max: 100 }).withMessage("search maksimal 100 karakter."),
  query("role").optional().isIn(["kader", "puskesmas", "puskesmasAdmin", "dinkes", "dinkesAdmin", "sa"]).withMessage("Role tidak valid."),
  query("status").optional().isIn(["pending_approval", "rejected", "active", "inactive"]).withMessage("Status user tidak valid."),
  query("puskesmas_id").optional().isInt({ min: 1 }).withMessage("puskesmas_id harus berupa ID positif.").toInt(),
  query("posyandu_id").optional().isInt({ min: 1 }).withMessage("posyandu_id harus berupa ID positif.").toInt(),
];
const getUserById = [positiveId()];
const changeUserRole = [positiveId(), body("role").trim().isIn(["kader", "puskesmas", "puskesmasAdmin", "dinkes", "dinkesAdmin", "sa"]).withMessage("Role tidak valid.")];
const changeUserStatus = [positiveId(), body("status").trim().isIn(["pending_approval", "rejected", "active", "inactive"]).withMessage("Status user tidak valid.")];
const updateMyProfile = [
  body("nama_lengkap").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Nama lengkap harus 2 sampai 100 karakter."),
  body("telepon").optional().trim().isLength({ max: 20 }).withMessage("Telepon maksimal 20 karakter."),
  body("nik")
    .optional({ nullable: true })
    .trim()
    .matches(/^\d{16}$/)
    .withMessage("NIK harus terdiri dari 16 digit angka."),
];

module.exports = { getUsers, getUserById, changeUserRole, changeUserStatus, updateMyProfile, verifyUser, replacePuskesmasAdmin, replaceDinkesAdmin, deactivateUser };
