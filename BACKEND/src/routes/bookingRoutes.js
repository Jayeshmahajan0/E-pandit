const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createBooking,
  acceptBooking,
  rejectBooking,
  updateBookingStatus,
  cancelBooking,
  getBooking,
  getUserBookings,
  getPanditBookings,
} = require("../controllers/bookingController");

router.post("/", authMiddleware, createBooking);
router.get("/:id", authMiddleware, getBooking);
router.get("/user/:userId", authMiddleware, getUserBookings);
router.get("/pandit/:panditId", authMiddleware, getPanditBookings);
router.put("/:id/accept", authMiddleware, acceptBooking);
router.put("/:id/reject", authMiddleware, rejectBooking);
router.put("/:id/status", authMiddleware, updateBookingStatus);
router.put("/:id/cancel", authMiddleware, cancelBooking);

module.exports = router;
