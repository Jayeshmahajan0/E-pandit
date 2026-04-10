const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createReview, getPanditReviews } = require("../controllers/reviewController");

router.post("/", authMiddleware, createReview);
router.get("/pandit/:panditId", getPanditReviews);

module.exports = router;
