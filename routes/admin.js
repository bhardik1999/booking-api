// routes/admin.js
const express = require("express");
const router = express.Router();
const LicenseKey = require("../models/LicenseKey");
const crypto = require("crypto");

// Admin secret for auth
const ADMIN_SECRET = process.env.ADMIN_SECRET || "supersecureadminkey";

// Middleware: validate admin auth
function verifyAdmin(req, res, next) {
  const adminSecret = req.headers["x-admin-secret"];
  console.log("Received:", adminSecret);
  console.log("Expected:", ADMIN_SECRET)
  if (adminSecret !== ADMIN_SECRET) {
    return res.status(401).json({ status: "error", message: "Unauthorized: Invalid admin secret" });
  }
  next();
}

// ✅ Generate new key: POST /admin/generate-key
router.post("/generate-key", verifyAdmin, async (req, res) => {
  const { expiryDays = 30, usageLimit } = req.body;

  // Validate inputs
  if (expiryDays && typeof expiryDays !== "number") {
    return res.status(400).json({ status: "error", message: "expiryDays must be a number" });
  }

  if (usageLimit && typeof usageLimit !== "number") {
    return res.status(400).json({ status: "error", message: "usageLimit must be a number" });
  }

  const key = crypto.randomBytes(16).toString("hex");

  const newKey = new LicenseKey({
    key,
    status: "valid",
    expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
    usageLimit: usageLimit || undefined,
  });

  try {
    await newKey.save();
    res.json({ status: "success", key });
  } catch (err) {
    console.error("❌ Key generation failed:", err.message);
    res.status(500).json({ status: "error", message: "Failed to generate key" });
  }
});

// ✅ List all keys: GET /admin/list-keys
router.get("/list-keys", verifyAdmin, async (req, res) => {
  try {
    const keys = await LicenseKey.find().sort({ createdAt: -1 });

    // Auto-expire keys that are past expiryDate and still marked valid
    const now = new Date();
    for (const key of keys) {
      if (key.expiryDate && key.expiryDate < now && key.status === "valid") {
        key.status = "invalid";
        await key.save(); // auto-mark expired
      }
    }

    res.json({ status: "success", data: keys });
  } catch (err) {
    console.error("❌ Failed to list keys:", err.message);
    res.status(500).json({ status: "error", message: "Failed to fetch keys" });
  }
});

// ✅ Revoke a key: POST /admin/revoke-key
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

    res.json({ status: "success", message: "Key successfully revoked" });
  } catch (err) {
    console.error("❌ Revoke failed:", err.message);
    res.status(500).json({ status: "error", message: "Failed to revoke key" });
  }
});

module.exports = router;
