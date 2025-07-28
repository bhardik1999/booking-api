const mongoose = require('mongoose');
const LicenseKeySchema = new mongoose.Schema({
  key: { type: String, unique: true },
  status: { type: String, default: 'active' },
  issuedTo: String,
  issuedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('LicenseKey', LicenseKeySchema);
