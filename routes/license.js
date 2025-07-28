const express = require("express");
const router = express.Router();
const LicenseKey = require("../models/LicenseKey");

// GET /verify?key=XXXX
router.get("/verify", async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ status: "error", message: "Key is required" });
  }

  try {
    const found = await LicenseKey.findOne({ key });

    if (!found || found.status !== "valid") {
      return res.json({ status: "invalid", message: "Key not valid" });
    }

    // Check if expired
    if (found.expiresAt && new Date() > found.expiresAt) {
      return res.json({ status: "invalid", message: "Key expired" });
    }

    // Check usage limit
    if (found.usageLimit && found.usageCount >= found.usageLimit) {
      return res.json({ status: "invalid", message: "Usage limit exceeded" });
    }

    // Increment usage
    found.usageCount += 1;
    await found.save();

    res.json({ status: "valid" });

  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
