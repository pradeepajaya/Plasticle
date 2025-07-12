
const express = require("express");
const router = express.Router();
const { validateBin, updateCollectorStatus } = require("../controllers/collectorController"); // Import from collectorController
const authenticateToken = require("../middleware/auth");
const collectorController = require("../controllers/collectorController");

// Define route to validate bin (specific to collectors)
router.post("/validate-bin", validateBin);
router.post("/update-status", updateCollectorStatus);

// update collector information 

router.put("/update-profile",authenticateToken, collectorController.updateProfile);


module.exports = router;
