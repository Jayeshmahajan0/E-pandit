const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { sendBookingNotification, getUserNotifications, markAsRead } = require("../controllers/notificationController");

router.post("/send", authMiddleware, sendBookingNotification);
router.get("/user/:userId", authMiddleware, getUserNotifications);
router.put("/:id/read", authMiddleware, markAsRead);

module.exports = router;
