const express = require("express");
const {
  getSamagris,
  addSamagri,
  getVendorSamagris,
  deleteSamagri,
  createOrder,
  getVendorOrders,
  getUserOrders,
  updateOrderStatus,
  cancelOrder
} = require("../controllers/samagriController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getSamagris);

// Vendor routes
router.get("/vendor", auth, getVendorSamagris);
router.post("/vendor", auth, addSamagri);
router.delete("/vendor/:id", auth, deleteSamagri);
router.get("/orders/vendor", auth, getVendorOrders);
router.put("/orders/:id/status", auth, updateOrderStatus);

// User routes
router.post("/orders", auth, createOrder);
router.get("/orders/user", auth, getUserOrders);
router.put("/orders/user/:id/cancel", auth, cancelOrder);

module.exports = router;
