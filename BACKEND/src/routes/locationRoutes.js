const express = require("express");
const router = express.Router();
const {
  getStates,
  getDistrictsByState,
  getPriestsByDistrict,
} = require("../controllers/locationController");

// ── Public Routes ──────────────────────────────
router.get("/states", getStates);
router.get("/districts/:state", getDistrictsByState);
router.get("/priests/:district", getPriestsByDistrict);

module.exports = router;
