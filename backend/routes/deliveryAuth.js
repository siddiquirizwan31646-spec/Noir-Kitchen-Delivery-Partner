const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const DeliveryAgent = require("../models/DeliveryAgent");
const { protectDeliveryAgent } = require("../middleware/deliveryAuth");
const sendOtpEmail = require("../utils/sendEmail");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const generateOtp = () => crypto.randomInt(100000, 999999).toString();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* ── Google login: frontend sends { credential } ID token ── */
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Missing credential" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const email = ticket.getPayload()?.email;
    if (!email) return res.status(400).json({ message: "Google token missing email" });

    const agent = await DeliveryAgent.findOne({ email });
    if (!agent) {
      return res.status(403).json({ message: "This email is not registered as a delivery partner" });
    }

    agent.status = "Available";
    await agent.save();

    const token = signToken(agent._id);
    res.cookie("deliveryToken", token, cookieOpts);
    res.json({ message: "Logged in", agent, token });
  } catch (err) {
    res.status(401).json({ message: "Google verification failed", error: err.message });
  }
});

/* ── Step 1: request an OTP by email ── */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const agent = await DeliveryAgent.findOne({ email });
    if (!agent) {
      return res.status(403).json({ message: "This email is not registered as a delivery partner" });
    }

    const otp = generateOtp();
    agent.otp = otp;
    agent.otpExpiry = Date.now() + OTP_TTL_MS;
    await agent.save();

    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("send-otp error:", err.message);
    res.status(500).json({ message: "Failed to send OTP, please try again" });
  }
});

/* ── Step 2: verify the OTP and log in ── */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const agent = await DeliveryAgent.findOne({ email }).select("+otp +otpExpiry");
    if (!agent) {
      return res.status(403).json({ message: "This email is not registered as a delivery partner" });
    }
    if (!agent.otp || agent.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    if (agent.otpExpiry < Date.now()) {
      return res.status(401).json({ message: "OTP expired, please request a new one" });
    }

    agent.otp = undefined;
    agent.otpExpiry = undefined;
    agent.status = "Available";
    await agent.save();

    const token = signToken(agent._id);
    res.cookie("deliveryToken", token, cookieOpts);
    res.json({ message: "Logged in", agent, token });
  } catch (err) {
    console.error("verify-otp error:", err.message);
    res.status(401).json({ message: "OTP verification failed" });
  }
});

router.get("/me", protectDeliveryAgent, (req, res) => res.json({ agent: req.agent }));

router.post("/logout", protectDeliveryAgent, async (req, res) => {
  req.agent.status = "Offline";
  await req.agent.save();
  res.clearCookie("deliveryToken", cookieOpts);
  res.json({ message: "Logged out" });
});

router.patch("/status", protectDeliveryAgent, async (req, res) => {
  const { status } = req.body;
  if (!["Available", "On Delivery", "Offline"].includes(status))
    return res.status(400).json({ message: "Invalid status" });
  req.agent.status = status;
  await req.agent.save();
  res.json({ agent: req.agent });
});

module.exports = router;