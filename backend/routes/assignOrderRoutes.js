const express = require("express");
const router = express.Router();
const AssignOrder = require("../models/AssignOrder");
const DeliveryAgent = require("../models/DeliveryAgent");
const { protectDeliveryAgent } = require("../middleware/deliveryAuth");

// ── Import Order directly from mongoose to avoid wrong-model issues ──────────
// This queries the "orders" collection regardless of which model file is loaded
const mongoose = require("mongoose");
const getOrderCollection = () => mongoose.connection.collection("orders");

const isOwner = (assignOrder, agent) =>
  assignOrder.deliveryPartnerDetails.phone === agent.phone &&
  assignOrder.deliveryPartnerDetails.email === agent.email &&
  assignOrder.deliveryPartnerDetails.vehicleNumber === agent.vehicleNumber;

/* ── verify OTP directly from the orders collection ─────────────────────── */
async function verifyDeliveryOtp(orderId, enteredOtp) {
  const col = getOrderCollection();
  const order = await col.findOne(
    { _id: new mongoose.Types.ObjectId(String(orderId)) },
    { projection: { deliveryOtp: 1 } }
  );

  console.log("[OTP] orderId:", orderId, "| found:", !!order, "| deliveryOtp:", order?.deliveryOtp);

  if (!order)               return "Original order not found";
  if (!order.deliveryOtp)   return "No delivery OTP set on this order";

  const stored  = String(order.deliveryOtp).trim();
  const entered = String(enteredOtp ?? "").trim();

  if (!entered)          return "OTP is required";
  if (stored !== entered) return "Incorrect OTP";

  return null; // ✅
}

/* ── sync orderStatus in orders collection ───────────────────────────────── */
async function syncOrderStatus(orderId, status, extra = {}) {
  const col = getOrderCollection();
  await col.updateOne(
    { _id: new mongoose.Types.ObjectId(String(orderId)) },
    { $set: { orderStatus: status, ...extra, updatedAt: new Date() } }
  );
}

/* ── GET /my ─────────────────────────────────────────────────────────────── */
router.get("/my", protectDeliveryAgent, async (req, res) => {
  try {
    const list = await AssignOrder.find({
      "deliveryPartnerDetails.phone":         req.agent.phone,
      "deliveryPartnerDetails.email":         req.agent.email,
      "deliveryPartnerDetails.vehicleNumber": req.agent.vehicleNumber,
    }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── PATCH /:id/status ───────────────────────────────────────────────────── */
router.patch("/:id/status", protectDeliveryAgent, async (req, res) => {
  try {
    const { status, otp } = req.body;
    const allowed = ["Picked Up", "Out for Delivery", "Delivered"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status. Use /cancel for cancellations." });

    const assignOrder = await AssignOrder.findById(req.params.id);
    if (!assignOrder) return res.status(404).json({ message: "Not found" });
    if (!isOwner(assignOrder, req.agent)) return res.status(403).json({ message: "Not your order" });
    if (["Delivered", "Cancelled"].includes(assignOrder.status))
      return res.status(400).json({ message: "Order already completed" });

    if (status === "Delivered") {
      const err = await verifyDeliveryOtp(assignOrder.order, otp);
      if (err) return res.status(400).json({ message: err });
    }

    assignOrder.status = status;
    if (status === "Picked Up")  assignOrder.pickedUpAt  = new Date();
    if (status === "Delivered")  assignOrder.deliveredAt = new Date();
    await assignOrder.save();

    const orderStatusMap = {
      "Picked Up":        "Out for Delivery",
      "Out for Delivery": "Out for Delivery",
      "Delivered":        "Delivered",
    };
    if (orderStatusMap[status])
      await syncOrderStatus(assignOrder.order, orderStatusMap[status]);

    if (status === "Delivered")
      await DeliveryAgent.findByIdAndUpdate(assignOrder.agent, { status: "Available" });

    res.json(assignOrder);
  } catch (err) {
    console.error("[status] error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ── PATCH /:id/cancel ───────────────────────────────────────────────────── */
router.patch("/:id/cancel", protectDeliveryAgent, async (req, res) => {
  try {
    const { cancelledBy, cancelReason, otp } = req.body;

    if (!["partner", "customer"].includes(cancelledBy))
      return res.status(400).json({ message: "cancelledBy must be 'partner' or 'customer'" });
    if (!cancelReason?.trim())
      return res.status(400).json({ message: "cancelReason is required" });

    const assignOrder = await AssignOrder.findById(req.params.id);
    if (!assignOrder) return res.status(404).json({ message: "Assigned order not found" });
    if (!isOwner(assignOrder, req.agent)) return res.status(403).json({ message: "Not your order" });
    if (["Delivered", "Cancelled"].includes(assignOrder.status))
      return res.status(400).json({ message: "Order already completed or cancelled" });

    if (cancelledBy === "customer") {
      const err = await verifyDeliveryOtp(assignOrder.order, otp);
      if (err) return res.status(400).json({ message: err });
    }

    assignOrder.status       = "Cancelled";
    assignOrder.cancelledBy  = cancelledBy;
    assignOrder.cancelReason = cancelReason.trim();
    assignOrder.cancelledAt  = new Date();
    await assignOrder.save();

    await syncOrderStatus(assignOrder.order, "Cancelled", {
      cancelledBy,
      cancelReason: cancelReason.trim(),
    });

    await DeliveryAgent.findByIdAndUpdate(assignOrder.agent, { status: "Available" });

    res.json({ message: "Order cancelled successfully", assignOrder });
  } catch (err) {
    console.error("[cancel] error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;