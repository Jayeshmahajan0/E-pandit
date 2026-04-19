const express = require('express');
const router = express.Router();
const { generateKundli, matchKundli } = require('../controllers/kundliController');

// POST /api/kundli/generate
router.post('/generate', generateKundli);

// POST /api/kundli/match
router.post('/match', matchKundli);

module.exports = router;
