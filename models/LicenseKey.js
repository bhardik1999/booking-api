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
});

module.exports = mongoose.model("LicenseKey", licenseSchema);
