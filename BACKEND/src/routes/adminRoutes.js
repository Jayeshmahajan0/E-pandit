const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  getPendingPandits,
  getAllPandits,
  getPanditDetails,
  verifyPandit,
  getDashboardStats,
} = require("../controllers/adminController");

// All routes here are protected by admin auth
router.use(authMiddleware, adminAuth);

router.get("/pending-pandits", getPendingPandits);
router.get("/all-pandits", getAllPandits);
router.get("/pandit/:id", getPanditDetails);
router.put("/verify/:id", verifyPandit);
router.get("/stats", getDashboardStats);

module.exports = router;
