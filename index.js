const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // For .env configs

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB model
const LicenseKey = require("./models/LicenseKey");

// ✅ Verify License Key API
app.get("/verify", async (req, res) => {
  const key = req.query.key;

  if (!key) {
    return res.status(400).json({ status: "error", message: "Key is missing" });
  }

  try {
    const match = await LicenseKey.findOne({ key });

    if (match && match.status === "valid") {
      return res.json({ status: "valid" });
    } else {
      return res.json({ status: "invalid" });
    }
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

// ✅ Default test route
app.get("/", (req, res) => {
  res.send("🚀 Booking API Live");
});

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ DB Connected");
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
});
