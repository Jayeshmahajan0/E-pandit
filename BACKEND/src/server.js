require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

// ── Route Imports ──────────────────────────────
const userRoutes = require("./routes/userRoutes");
const locationRoutes = require("./routes/locationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const panchangRoutes = require("./routes/panchangRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// ── App Setup ──────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true, // This automatically reflects any incoming origin (e.g. your Vercel frontend URL)
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (dev) ───────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Health Check ───────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "  E-Pandit API v2.0 — Real-time Pandit Booking Platform",
    version: "2.0.0",
    endpoints: {
      users: "/api/users",
      bookings: "/api/bookings",
      reviews: "/api/reviews",
      notifications: "/api/notifications",
      locations: "/api/locations",
      panchang: "/api/panchang",
      payments: "/api/payments",
      admin: "/api/admin",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "healthy", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/panchang", panchangRoutes);
app.use("/api/payments", paymentRoutes);

// ── 404 Handler ────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Error Handler ──────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`\n  E-Pandit Backend Server v2.0`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`📦 Routes: users, bookings, reviews, notifications, locations`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
}

module.exports = app;
