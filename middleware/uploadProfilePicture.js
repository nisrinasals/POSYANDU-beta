"use strict";

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads", "profile");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
    const extension = extensions[file.mimetype] || path.extname(file.originalname).toLowerCase();
    callback(null, `${req.user.id}-${Date.now()}${extension}`);
  },
});

const uploadProfilePicture = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return callback(new Error("Foto profil harus berformat JPG, PNG, atau WEBP."));
    callback(null, true);
  },
}).single("profile_picture");

module.exports = uploadProfilePicture;
