const express = require('express');
const router = express.Router();
const { getPanchangForDate } = require('../controllers/panchangController');

// Provide panchang data based on query params: ?date=YYYY-MM-DD
router.get('/', getPanchangForDate);

module.exports = router;
