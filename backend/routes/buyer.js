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


module.exports = router;


