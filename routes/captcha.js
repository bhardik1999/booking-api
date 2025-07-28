// routes/captcha.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

const LICENSE_KEY_HEADER = "x-license-key";
const CAPMONSTER_API_KEY = process.env.CAPMONSTER_API_KEY;

// Optional: Middleware to enforce license header
router.use((req, res, next) => {
  const licenseKey = req.headers[LICENSE_KEY_HEADER];
  if (!licenseKey) return res.status(401).json({ error: "License key missing" });
  next();
});

// POST /api/solve-captcha
router.post("/solve-captcha", async (req, res) => {
  const { image } = req.body;

  if (!CAPMONSTER_API_KEY) {
    return res.status(500).json({ error: "CapMonster API key not configured" });
  }

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    // Step 1: Create task on CapMonster
    const { data: createRes } = await axios.post("https://api.capmonster.cloud/createTask", {
      clientKey: CAPMONSTER_API_KEY,
      task: {
        type: "ImageToTextTask",
        body: image,
        phrase: false,
        case: false,
        numeric: false,
        math: 0,
        minLength: 4,
        maxLength: 6
      }
    });

    const taskId = createRes.taskId;
    if (!taskId) return res.status(500).json({ error: "Failed to create CAPTCHA task" });

    // Step 2: Poll task result
    let solution = null;
    for (let i = 0; i < 15; i++) {
      await new Promise(res => setTimeout(res, 2000));

      const { data: result } = await axios.post("https://api.capmonster.cloud/getTaskResult", {
        clientKey: CAPMONSTER_API_KEY,
        taskId
      });

      if (result.status === "ready") {
        solution = result.solution.text;
        break;
      }
    }

    if (!solution) {
      return res.status(408).json({ error: "CAPTCHA solving timed out" });
    }

    return res.json({ text: solution });
  } catch (err) {
    console.error("❌ CAPTCHA solving error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
