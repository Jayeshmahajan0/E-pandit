const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createOrder, verifyPayment, getPaymentByBooking } = require("../controllers/paymentController");

// Create a Razorpay order (requires auth)
router.post("/create-order", authMiddleware, createOrder);

// Verify payment after Razorpay checkout (requires auth)
router.post("/verify", authMiddleware, verifyPayment);

// Get payment details for a booking (requires auth)
router.get("/booking/:bookingId", authMiddleware, getPaymentByBooking);

module.exports = router;
