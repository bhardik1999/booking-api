const mongoose = require("mongoose");

const bookingLogSchema = new mongoose.Schema({
  licenseKey: { type: String, required: true },
  username: { type: String, required: true }, // Track who used the key
  bookingTime: { type: Date, default: Date.now },
  details: {
    train: String,
    date: String,
    from: String,
    to: String,
    class: String,
    seat: String,
    insurance: Boolean,
    meal: String,
    paymentMethod: String
  }
});

module.exports = mongoose.model("BookingLog", bookingLogSchema);
