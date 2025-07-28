const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["valid", "invalid"],
    default: "valid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date, // Optional expiration
  },
  usageLimit: {
    type: Number, // Optional max usage
  },
  usageCount: {
    type: Number,
    default: 0,
  }
});

module.exports = mongoose.models.LicenseKey || mongoose.model("LicenseKey", licenseSchema);
