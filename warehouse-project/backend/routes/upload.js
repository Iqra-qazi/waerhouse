const express = require("express");
const multer = require("multer");
const ImageKit = require("imagekit");
const { authenticate } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      return callback(error(400, "Only JPEG, PNG, WebP and GIF images are allowed", "VALIDATION_ERROR"));
    }
    callback(null, true);
  },
});

router.post("/", authenticate, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw error(400, "An image file is required", "VALIDATION_ERROR");
    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;
    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      throw error(503, "Image upload is not configured", "UPLOAD_NOT_CONFIGURED");
    }
    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
    const uploaded = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      folder: "/warehouse",
    });
    return success(res, 201, "Image uploaded", { url: uploaded.url, fileId: uploaded.fileId, name: uploaded.name });
  } catch (err) { next(err); }
});

module.exports = router;