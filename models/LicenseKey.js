const mongoose = require("mongoose");

const LicenseKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["valid", "invalid"],
    default: "valid"
  },
  expiryDate: {
    type: Date
  },
  usageLimit: {
    type: Number
  },
  usageCount: {
    type: Number,
    default: 0
  },
  username: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("LicenseKey", LicenseKeySchema);
