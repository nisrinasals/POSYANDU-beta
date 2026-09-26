"use strict";

const fs = require("fs");
const path = require("path");
const { User } = require("../models");
const { Op } = require("sequelize");
const { createAuditLog, AUDIT_ACTIONS } = require("../utils/auditLogHelper");

const SA_ASSIGNABLE_ROLES = ["dinkesAdmin", "dinkes", "puskesmasAdmin", "puskesmas", "kader"];

const rejectSelf = (req, targetId, res) => {
  if (Number(req.user.id) === Number(targetId)) {
    res.status(403).json({ success: false, message: "Admin tidak dapat mengubah akun sendiri." });
    return true;
  }
  return false;
};

const samePuskesmas = (actor, target) => Number(target.puskesmas_id) === Number(actor.puskesmas_id);

const canVerifyUser = (actor, target) => {
  if (actor.role === "sa") return ["dinkes", "puskesmas", "kader"].includes(target.role);
  if (actor.role === "dinkesAdmin") return ["dinkes", "puskesmas"].includes(target.role);
  if (actor.role === "puskesmasAdmin") return samePuskesmas(actor, target) && ["puskesmas", "kader"].includes(target.role);
  return false;
};

const canChangeUserRole = (actor, target, newRole) => {
  if (actor.role !== "sa") return false;
  return Number(actor.id) !== Number(target.id) && target.role !== "sa" && SA_ASSIGNABLE_ROLES.includes(newRole);
};

const canDeactivateUser = (actor, target) => {
  if (Number(actor.id) === Number(target.id)) return false;
  if (actor.role === "sa") return true;
  if (actor.role === "dinkesAdmin") return target.role === "dinkes";
  if (actor.role === "puskesmasAdmin") return samePuskesmas(actor, target) && ["puskesmas", "kader"].includes(target.role);
  return false;
};

const canReplacePuskesmasAdmin = (actor, target) => {
  if (!["sa", "dinkesAdmin"].includes(actor.role)) return false;
  return target.role === "puskesmas" && target.puskesmas_id !== null;
};

const canReplaceDinkesAdmin = (actor, target) => {
  if (!["sa", "dinkesAdmin"].includes(actor.role)) return false;
  return Number(actor.id) !== Number(target.id) && target.role === "dinkes";
};

const userAttributes = { exclude: ["password_hash", "token_version"] };

const getUserScope = (actor) => {
  if (["sa", "dinkesAdmin"].includes(actor.role)) return {};
  if (actor.role === "puskesmasAdmin") return { puskesmas_id: actor.puskesmas_id };
  return { id: actor.id };
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, status, puskesmas_id, posyandu_id } = req.query;
    const where = getUserScope(req.user);
    const offset = (page - 1) * limit;
    if (search) where[Op.or] = [{ nama_lengkap: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }];
    if (role) where.role = role;
    if (status) where.status = status;
    if (puskesmas_id && req.user.role !== "puskesmasAdmin") where.puskesmas_id = puskesmas_id;
    if (posyandu_id) where.posyandu_id = posyandu_id;

    const { count, rows } = await User.findAndCountAll({ where, attributes: userAttributes, limit: Number(limit), offset: Number(offset), order: [["nama_lengkap", "ASC"]] });
    return res
      .status(200)
      .json({ success: true, message: "Berhasil mengambil daftar user.", data: rows, pagination: { total_items: count, total_pages: Math.ceil(count / limit), current_page: Number(page), items_per_page: Number(limit) } });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const target = await User.findOne({ where: { id: req.params.id, ...getUserScope(req.user) }, attributes: userAttributes });
    if (!target) return res.status(404).json({ success: false, message: "User tidak ditemukan atau Anda tidak memiliki hak akses." });
    return res.status(200).json({ success: true, message: "Berhasil mengambil detail user.", data: target });
  } catch (error) {
    next(error);
  }
};

const changeUserRole = async (req, res, next) => {
  try {
    if (rejectSelf(req, req.params.id, res)) return;
    const target = await User.findByPk(req.params.id);
    if (!target || !canChangeUserRole(req.user, target, req.body.role)) return res.status(403).json({ success: false, message: "Hanya SA yang dapat mengubah role ke role di bawahnya." });
    const oldValue = { id: target.id, role: target.role, status: target.status };
    await target.update({ role: req.body.role, token_version: target.token_version + 1 });
    await createAuditLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.USER_ROLE_UPDATE,
      tableName: "users",
      recordId: target.id,
      oldValue,
      newValue: { id: target.id, role: target.role, status: target.status },
    });
    return res.status(200).json({ success: true, message: "Role user berhasil diubah.", data: target });
  } catch (error) {
    next(error);
  }
};

const changeUserStatus = async (req, res, next) => {
  try {
    if (rejectSelf(req, req.params.id, res)) return;
    const target = await User.findByPk(req.params.id);
    if (!target || !canDeactivateUser(req.user, target)) return res.status(403).json({ success: false, message: "Anda tidak memiliki hak untuk menonaktifkan user ini." });
    const oldValue = { id: target.id, status: target.status };
    await target.update({ status: req.body.status, token_version: target.token_version + 1 });
    await createAuditLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.USER_STATUS_UPDATE,
      tableName: "users",
      recordId: target.id,
      oldValue,
      newValue: { id: target.id, status: target.status },
    });
    return res.status(200).json({ success: true, message: "Status user berhasil diubah.", data: target });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: userAttributes });
    return res.status(200).json({ success: true, message: "Berhasil mengambil profil saya.", data: user });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const payload = Object.fromEntries(Object.entries(req.body).filter(([field]) => ["nama_lengkap", "telepon", "nik"].includes(field)));
    await user.update(payload);
    return res.status(200).json({ success: true, message: "Profil berhasil diperbarui.", data: await User.findByPk(user.id, { attributes: userAttributes }) });
  } catch (error) {
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "File foto profil wajib diunggah." });
    const user = await User.findByPk(req.user.id);
    const previousPicture = user.profile_picture;
    await user.update({ profile_picture: `/uploads/profile/${req.file.filename}` });
    if (previousPicture) {
      const previousPath = path.join(__dirname, "..", previousPicture.replace(/^\//, ""));
      if (previousPath !== req.file.path) fs.rm(previousPath, { force: true }, () => {});
    }
    return res.status(200).json({ success: true, message: "Foto profil berhasil diperbarui.", data: { profile_picture: user.profile_picture } });
  } catch (error) {
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    if (rejectSelf(req, req.params.id, res)) return;
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    if (!canVerifyUser(req.user, target)) {
      return res.status(403).json({ success: false, message: "Anda tidak memiliki hak untuk memverifikasi akun ini." });
    }
    if (target.email_verified !== true) {
      return res.status(400).json({ success: false, message: "Akun belum dapat diaktifkan karena email belum diverifikasi." });
    }
    const oldValue = { id: target.id, status: target.status };
    await target.update({ status: "active", verified_by: req.user.id, verified_at: new Date(), token_version: target.token_version + 1 });
    await createAuditLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.USER_STATUS_UPDATE,
      tableName: "users",
      recordId: target.id,
      oldValue,
      newValue: { id: target.id, status: target.status, verified_by: target.verified_by },
    });
    return res.status(200).json({ success: true, message: "Akun berhasil diverifikasi.", data: target });
  } catch (error) {
    next(error);
  }
};

const replacePuskesmasAdmin = async (req, res, next) => {
  const transaction = await User.sequelize.transaction();
  try {
    if (rejectSelf(req, req.params.id, res)) {
      await transaction.rollback();
      return;
    }
    const replacement = await User.findByPk(req.params.id);
    if (!replacement) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "User pengganti tidak ditemukan." });
    }
    if (!canReplacePuskesmasAdmin(req.user, replacement)) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: "Anda tidak dapat mengganti admin pada Puskesmas ini." });
    }
    if (replacement.email_verified === false) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "User pengganti belum memverifikasi email." });
    }
    const puskesmasId = replacement.puskesmas_id;
    await User.update({ role: "puskesmas", token_version: User.sequelize.literal('"token_version" + 1') }, { where: { puskesmas_id: puskesmasId, role: "puskesmasAdmin" }, transaction });
    await replacement.update({ role: "puskesmasAdmin", status: "active", verified_by: req.user.id, verified_at: new Date(), token_version: replacement.token_version + 1 }, { transaction });
    await transaction.commit();
    return res.status(200).json({ success: true, message: "Admin Puskesmas berhasil diganti.", data: replacement });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const replaceDinkesAdmin = async (req, res, next) => {
  const transaction = await User.sequelize.transaction();
  try {
    if (rejectSelf(req, req.params.id, res)) {
      await transaction.rollback();
      return;
    }

    const replacement = await User.findByPk(req.params.id);
    if (!replacement || !canReplaceDinkesAdmin(req.user, replacement)) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: "Anda tidak dapat mengganti Admin Dinkes dengan target ini." });
    }
    if (replacement.email_verified === false) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "User pengganti belum memverifikasi email." });
    }

    await User.update({ role: "dinkes", token_version: User.sequelize.literal('"token_version" + 1') }, { where: { role: "dinkesAdmin" }, transaction });
    await replacement.update({ role: "dinkesAdmin", status: "active", verified_by: req.user.id, verified_at: new Date(), token_version: replacement.token_version + 1 }, { transaction });
    await transaction.commit();

    return res.status(200).json({ success: true, message: "Admin Dinkes berhasil diganti.", data: replacement });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    if (rejectSelf(req, req.params.id, res)) return;
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    if (!canDeactivateUser(req.user, target)) {
      return res.status(403).json({ success: false, message: "Anda tidak memiliki hak untuk menonaktifkan akun ini." });
    }
    const oldValue = { id: target.id, status: target.status };
    await target.update({ status: "inactive", token_version: target.token_version + 1 });
    await createAuditLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.USER_STATUS_UPDATE,
      tableName: "users",
      recordId: target.id,
      oldValue,
      newValue: { id: target.id, status: target.status },
    });
    return res.status(200).json({ success: true, message: "User berhasil dinonaktifkan.", data: target });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  changeUserRole,
  changeUserStatus,
  verifyUser,
  replacePuskesmasAdmin,
  replaceDinkesAdmin,
  deactivateUser,
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  rejectSelf,
  canVerifyUser,
  canChangeUserRole,
  canDeactivateUser,
  canReplacePuskesmasAdmin,
  canReplaceDinkesAdmin,
};
