const express = require("express");
const router = express.Router();
const { validateBin, updateCollectorStatus,} = require("../controllers/collectorController"); // Import from collectorController
const Collector = require("../models/Collector"); 
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// Define route to validate bin (specific to collectors)
router.post("/validate-bin", validateBin);
router.post("/update-status", updateCollectorStatus);

router.get("/available-collectors", auth, adminController.getAvailableCollectors);

module.exports = router;
