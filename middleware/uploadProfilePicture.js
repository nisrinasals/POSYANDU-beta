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

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return callback(new Error("Foto profil harus berformat JPG, PNG, atau WEBP."));
    callback(null, true);
  },
}).single("profile_picture");

const uploadProfilePicture = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) return next();

    if (!(error instanceof multer.MulterError)) return next(error);

    const response = {
      success: false,
      message: error.code === "LIMIT_FILE_SIZE" ? "Ukuran foto profil melebihi batas maksimum 2 MB." : error.code === "LIMIT_UNEXPECTED_FILE" ? "Field upload tidak diizinkan." : "Upload file tidak valid.",
    };

    return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json(response);
  });
};

module.exports = uploadProfilePicture;
