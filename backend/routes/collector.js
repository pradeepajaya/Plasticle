const express = require("express");
const router = express.Router();
const {
  validateBin,
  updateCollectorStatus,
  getCollectorAllocations,
} = require("../controllers/collectorController"); // Import from collectorController
const Collector = require("../models/Collector"); 
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// Define route to validate bin (specific to collectors)
router.post("/validate-bin", validateBin);

// Route to update collector status (e.g., location, availability)
router.post("/update-status", updateCollectorStatus);

// Route for admin to get available collectors
router.get("/available-collectors", auth, adminController.getAvailableCollectors);

// New route for collectors to fetch their allocated bins
router.get("/allocations", auth, getCollectorAllocations);

module.exports = router;
