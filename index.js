// index.js (Production Ready)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ Rate Limiters
const captchaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 5,                   // 5 requests per minute per IP
  message: { error: "Too many CAPTCHA requests. Try again later." }
});

const verifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: "Too many verify attempts. Please wait a bit." }
});

const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: { error: "Admin access rate limit exceeded. Try again later." }
});

// 🔗 MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err.message));

// Routes
const licenseRoutes = require("./routes/license");
const adminRoutes = require("./routes/admin");
const extensionRoutes = require("./routes/captcha");

// ✅ Mount routes with limiters
app.use("/", verifyLimiter, licenseRoutes);         // /verify?key=...
app.use("/admin", adminLimiter, adminRoutes);       // /admin/generate-key, etc
app.use("/api", captchaLimiter, extensionRoutes);   // /api/solve-captcha

// Default Test Route
app.get("/", (req, res) => {
  res.send("🚀 Booking API is live with rate-limiting enabled");
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
