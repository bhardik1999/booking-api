const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const LicenseKey = require("../models/LicenseKey");

// 🔐 Middleware to protect admin routes
function adminAuth(req, res, next) {
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

// 🚀 POST /admin/generate-key
router.post("/generate-key", adminAuth, async (req, res) => {
  try {
    const newKey = crypto.randomBytes(16).toString("hex");

    const keyDoc = new LicenseKey({
      key: newKey,
      status: "valid", // optional if schema already defaults to 'valid'
    });

    await keyDoc.save();

    res.status(201).json({
      status: "success",
      key: newKey,
    });
  } catch (err) {
    console.error("❌ Error generating key:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
