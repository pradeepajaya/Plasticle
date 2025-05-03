
const express = require("express");
const router = express.Router();
const { validateBin, updateCollectorStatus } = require("../controllers/collectorController"); // Import from collectorController

// Define route to validate bin (specific to collectors)
router.post("/validate-bin", validateBin);
router.post("/update-status", updateCollectorStatus);

module.exports = router;
