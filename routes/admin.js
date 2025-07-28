const express = require("express");
const router = express.Router();
const LicenseKey = require("../models/Licensekey");
const crypto = require("crypto");

// Admin secret
const ADMIN_SECRET = process.env.ADMIN_SECRET || "supersecureadminkey";

// Middleware to validate admin
function verifyAdmin(req, res, next) {
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== ADMIN_SECRET) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  next();
}

// POST /admin/generate-key
router.post("/generate-key", verifyAdmin, async (req, res) => {
  const { expiryDays, usageLimit } = req.body;

  const key = crypto.randomBytes(16).toString("hex");

  const newKey = new LicenseKey({
    key,
    status: "valid",
    expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined,
    usageLimit: usageLimit || undefined
  });

  try {
    await newKey.save();
    res.json({ status: "success", key });
  } catch (err) {
    console.error("❌ Key save failed:", err);
    res.status(500).json({ status: "error", message: "Failed to generate key" });
  }
});

// GET /admin/list-keys
router.get("/list-keys", verifyAdmin, async (req, res) => {
  try {
    const keys = await LicenseKey.find().sort({ createdAt: -1 });
    res.json({ status: "success", data: keys });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to fetch keys" });
  }
});

// POST /admin/revoke-key
router.post("/revoke-key", verifyAdmin, async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ status: "error", message: "Key is required" });
  }

  try {
    const updated = await LicenseKey.findOneAndUpdate(
      { key },
      { status: "invalid" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: "error", message: "Key not found" });
    }

    res.json({ status: "success", message: "Key revoked" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to revoke key" });
  }
});

module.exports = router;
