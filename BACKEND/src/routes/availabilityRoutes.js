const express = require('express');
const router = express.Router();
const { getPanditAvailability, updatePanditAvailability } = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/auth');

// GET /api/availability/pandit/:panditId
router.get('/pandit/:panditId', getPanditAvailability);

// POST /api/availability/pandit
router.post('/pandit', authMiddleware, updatePanditAvailability);

module.exports = router;
