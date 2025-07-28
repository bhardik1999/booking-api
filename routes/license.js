const express = require("express");
const router = express.Router();
const LicenseKey = require("../models/LicenseKey");

router.get("/verify", async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ status: "error", message: "Key is required" });
  }

  try {
    const found = await LicenseKey.findOne({ key, status: "valid" });
    if (found) {
      res.json({ status: "valid" });
    } else {
      res.json({ status: "invalid" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
