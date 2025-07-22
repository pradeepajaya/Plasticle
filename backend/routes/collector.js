const express = require("express");
const router = express.Router();
const { validateBin, updateCollectorStatus, updatePreferredBins } = require("../controllers/collectorController"); // Import from collectorController
const authenticateToken = require("../middleware/auth");
const collectorController = require("../controllers/collectorController");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

// Define route to validate bin (specific to collectors)
router.post("/validate-bin", validateBin);
router.post("/update-status", updateCollectorStatus);

// update collector information 
router.put("/update-profile",authenticateToken, collectorController.updateProfile);

// get collection counts
router.get("/collection-count", authenticateToken, collectorController.getCollectionCount);

//update collector profile image
router.put("/update-profile-picture", authenticateToken, collectorController.updateProfilePicture);

// Get collector  profile picture
router.get('/profile', authenticateToken, collectorController.getProfilepicture);

// New route for collectors to fetch their allocated bins
router.get("/allocations", auth, collectorController.getCollectorAllocations);
router.post("/update-bin-status", auth, collectorController.updateBinCollectionStatus);
router.post('/update-preferred-bins', updatePreferredBins);
router.get("/full-bin-locations", auth, collectorController.getFullBins);

module.exports = router;
