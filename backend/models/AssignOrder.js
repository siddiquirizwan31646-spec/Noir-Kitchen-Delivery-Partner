const mongoose = require("mongoose");

const assignOrderSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryAgent", required: true },

  customerDetails: {
    fullName: String,
    mobile: String,
    email: String,
    deliveryAddress: String,
    latitude: Number,
    longitude: Number,
    houseNo: String,
    areaName: String,
    areaNo: String,
    city: String,
    pinCode: String,
  },

  deliveryPartnerDetails: {
    name: String,
    phone: String,
    email: String,
    vehicleType: String,
    vehicleNumber: String,
  },

  foodDetails: {
    itemName: String,
    variant: String,
    addons: String,
    quantity: Number,
    specialInstructions: String,
    baseAmount: Number,
    addonTotal: Number,
    gstAmount: Number,
    totalAmount: Number,
    paymentMethod: String,
  },

  status: {
    type: String,
    enum: ["Assigned", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Assigned",
  },

  // Cancel fields
  cancelledBy:  { type: String, enum: ["partner", "customer"] },
  cancelReason: { type: String },
  cancelledAt:  { type: Date },

  assignedAt:  { type: Date, default: Date.now },
  pickedUpAt:  Date,
  deliveredAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("AssignOrder", assignOrderSchema);