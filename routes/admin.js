// routes/admin.js

const express = require("express");
const router = express.Router();
const LicenseKey = require("../models/LicenseKey");
const crypto = require("crypto");

// Admin secret for authentication
const ADMIN_SECRET = process.env.ADMIN_SECRET || "supersecureadminkey";

// Middleware: Verify admin authentication using secret key
function verifyAdmin(req, res, next) {
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== ADMIN_SECRET) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid admin secret",
    });
  }
  next();
}

// ✅ Generate License Key: POST /admin/generate-key
router.post("/generate-key", verifyAdmin, async (req, res) => {
  const { expiryDays = 30, usageLimit, username } = req.body;

  // Validate inputs
  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Username is required and must be a non-empty string",
    });
  }

  if (typeof expiryDays !== "number" || expiryDays <= 0) {
    return res.status(400).json({
      status: "error",
      message: "expiryDays must be a positive number",
    });
  }

  if (usageLimit !== undefined && (typeof usageLimit !== "number" || usageLimit <= 0)) {
    return res.status(400).json({
      status: "error",
      message: "usageLimit must be a positive number (if provided)",
    });
  }

  const key = crypto.randomBytes(16).toString("hex");

  const newKey = new LicenseKey({
    key,
    username: username.trim(),
    status: "valid",
    expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
    usageLimit: usageLimit || undefined,
  });

  try {
    await newKey.save();
    res.json({ status: "success", key });
  } catch (err) {
    console.error("Key generation failed:", err.message);
    res.status(500).json({ status: "error", message: "Failed to generate key" });
  }
});

// ✅ List All License Keys: GET /admin/list-keys
router.get("/list-keys", verifyAdmin, async (req, res) => {
  try {
    const keys = await LicenseKey.find().sort({ createdAt: -1 });
    const now = new Date();

    // Auto-expire old keys
    for (const key of keys) {
      if (key.expiryDate && key.expiryDate < now && key.status === "valid") {
        key.status = "invalid";
        await key.save();
      }
    }

    res.json({ status: "success", data: keys });
  } catch (err) {
    console.error("List keys failed:", err.message);
    res.status(500).json({ status: "error", message: "Failed to fetch keys" });
  }
});

// ✅ Revoke a License Key: POST /admin/revoke-key
router.post("/revoke-key", verifyAdmin, async (req, res) => {
  const { key } = req.body;

  if (!key || typeof key !== "string") {
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

    res.json({ status: "success", message: "Key successfully revoked" });
  } catch (err) {
    console.error("Revoke key failed:", err.message);
    res.status(500).json({ status: "error", message: "Failed to revoke key" });
  }
});

module.exports = router;
