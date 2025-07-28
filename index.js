const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static HTML/admin panel (e.g. /admin.html)
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection failed:", err.message));

// Routes
const licenseRoutes = require("./routes/license"); // /verify
const adminRoutes = require("./routes/admin");     // /admin/*

app.use("/", licenseRoutes);
app.use("/admin", adminRoutes);

// Default test route
app.get("/", (req, res) => {
  res.send("🚀 Booking API is live");
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
