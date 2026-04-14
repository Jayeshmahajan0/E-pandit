const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { uploadImage, uploadDocument } = require("../controllers/uploadController");

// Public upload routes for registration
router.post("/image", uploadImage);
router.post("/document", uploadDocument);

module.exports = router;
