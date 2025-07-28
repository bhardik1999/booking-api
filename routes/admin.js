const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const LicenseKey = require("../models/LicenseKey");

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const clientSecret = req.headers["x-admin-secret"];
  if (!clientSecret || clientSecret !== adminSecret) {
    return res.status(403).json({ status: "unauthorized" });
  }
  next();
};

// 🔑 Generate new key
router.post("/generate-key", adminAuth, async (req, res) => {
  const key = crypto.randomBytes(16).toString("hex");

  try {
    const newKey = new LicenseKey({ key });
    await newKey.save();
    res.json({ status: "success", key });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// 📋 List all keys
router.get("/list-keys", adminAuth, async (req, res) => {
  try {
    const keys = await LicenseKey.find().sort({ createdAt: -1 });
    res.json({ status: "success", data: keys });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ❌ Revoke a key
router.post("/revoke-key", adminAuth, async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ status: "error", message: "Key is required" });

  try {
    const updated = await LicenseKey.findOneAndUpdate(
      { key },
      { status: "invalid" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: "error", message: "Key not found" });
    }

    res.json({ status: "success", message: "Key revoked", key: updated });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
