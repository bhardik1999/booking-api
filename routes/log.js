// routes/log.js
const express = require("express");
const router = express.Router();
const BookingLog = require("../models/BookingLog");

router.post("/", async (req, res) => {
  try {
    const { licenseKey, userAgent, ip, bookingDetails } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ error: "License key is required" });
    }

    const logEntry = new BookingLog({
      licenseKey,
      userAgent,
      ip,
      bookingDetails
    });

    await logEntry.save();
    res.status(201).json({ message: "Booking log saved successfully" });
  } catch (error) {
    console.error("❌ Booking log save failed:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
