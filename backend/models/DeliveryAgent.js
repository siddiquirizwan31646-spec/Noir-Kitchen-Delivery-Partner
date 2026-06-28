// models/DeliveryAgent.js
const mongoose = require("mongoose");

const deliveryAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  vehicleType: { type: String, enum: ["Bike", "Scooter", "Bicycle", "Car"], default: "Bike" },
  vehicleNumber: String,
  status: { type: String, enum: ["Available", "On Delivery", "Offline"], default: "Offline" },
  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  isActive: { type: Boolean, default: true },

  // ── Added for email + OTP login ──
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
}, { timestamps: true });

module.exports = mongoose.model("DeliveryAgent", deliveryAgentSchema);