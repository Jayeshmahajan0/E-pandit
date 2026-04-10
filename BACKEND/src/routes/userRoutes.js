const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  registerUser,
  registerPandit,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getNearbyPandits,
  toggleOnlineStatus,
} = require("../controllers/userController");

// ── Public ──────────────────────────────────────
router.post("/register", registerUser);
router.post("/register-pandit", registerPandit);
router.post("/login", loginUser);
router.get("/nearby-pandits", getNearbyPandits);

// ── Protected ───────────────────────────────────
router.get("/profile/:id", authMiddleware, getUserProfile);
router.put("/profile/:id", authMiddleware, updateUserProfile);
router.put("/toggle-online/:id", authMiddleware, toggleOnlineStatus);

module.exports = router;
