const express = require("express");
const mongoose = require('mongoose');
process.env.SUPPRESS_NO_CONFIG_WARNING = true;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth");
const connectDB = require("./db");
require("dotenv").config();
connectDB();
const deliveryAuthRouter = require("./routes/deliveryAuth");
const assignOrderRoutes = require("./routes/assignOrderRoutes");
const sendOtpEmail = require("./utils/sendEmail");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser()); // ← CRITICAL: without this, req.cookies is undefined
app.use("/api/auth", authRouter);
app.use("/api/delivery-auth", deliveryAuthRouter);
app.use("/api/assign-orders", assignOrderRoutes);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error("MongoDB connection error:", err));