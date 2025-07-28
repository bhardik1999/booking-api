const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection failed:", err.message));

// Routes
const licenseRoutes = require("./routes/license"); // your existing verification route
const adminRoutes = require("./routes/admin");     // the new generate-key route

app.use("/", licenseRoutes); // /verify?key=...
app.use("/admin", adminRoutes); // /admin/generate-key

// Default route for testing
app.get("/", (req, res) => {
  res.send("🚀 Booking API is live");
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
