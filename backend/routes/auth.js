const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim())
  : [];

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Google Login
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Missing credential" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const email = ticket.getPayload()?.email;
    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ message: "This email is not authorized as admin" });
    }

    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("adminToken", token, cookieOpts);
    res.json({ message: "Logged in", email });
  } catch {
    res.status(401).json({ message: "Google verification failed" });
  }
});

// Email/Password Login (simple hardcoded for now)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("adminToken", token, cookieOpts);
    return res.json({ message: "Logged in", email });
  }
  res.status(401).json({ message: "Invalid email or password" });
});

module.exports = router;