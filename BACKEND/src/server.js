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

// ── App Setup ──────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL 
      ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
      : ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
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
