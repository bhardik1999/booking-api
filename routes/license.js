const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const LicenseKey = require("../models/LicenseKey");

// GET /verify?key=YOUR_KEY
router.get("/verify", async (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ valid: false, reason: "Key missing" });
  }

  try {
    const license = await LicenseKey.findOne({ key });

    if (!license || license.status === "invalid") {
      return res.json({ valid: false, reason: "invalid" });
    }

    const now = new Date();

    if (license.expiryDate && new Date(license.expiryDate) < now) {
      return res.json({ valid: false, reason: "expired" });
    }

    return res.json({ valid: true });
  } catch (err) {
    console.error("❌ License verification failed:", err.message);
    return res.status(500).json({ valid: false, reason: "server-error" });
  }
});

// (Optional) POST /generate-key (for internal use or testing)
router.post("/generate-key", async (req, res) => {
  const { expiryDays, usageLimit } = req.body;

  const key = crypto.randomBytes(16).toString("hex");

  const newKey = new LicenseKey({
    key,
    status: "valid",
    expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 86400000) : undefined,
    usageLimit: usageLimit || undefined,
  });

  try {
    await newKey.save();
    return res.json({ status: "success", key });
  } catch (err) {
    console.error("❌ Error creating license key:", err.message);
    return res.status(500).json({ status: "error", message: "Key generation failed" });
  }
});

module.exports = router;
