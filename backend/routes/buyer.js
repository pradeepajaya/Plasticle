const express = require("express");
const router = express.Router();
const buyerController = require("../controllers/buyerController");
const authenticateToken = require("../middleware/auth");

// Validate Bin QR Code
router.post("/validate-bin", buyerController.validateBinQRCode);

// Validate Bottle QR Code
router.post("/validate-bottle", buyerController.validateBottleQRCode);

// buyer profile updating 
router.put("/update-profile", authenticateToken, buyerController.updateProfile);

//update buyer profile image
router.put("/update-profile-picture", authenticateToken, buyerController.updateProfilePicture);

// Get buyer profile picture
router.get('/profile', authenticateToken, buyerController.getProfilepicture);

// Get buyer stats
router.get("/stats", authenticateToken, buyerController.getStats);

module.exports = router;