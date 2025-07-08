const express = require("express");
const router = express.Router();
const buyerController = require("../controllers/buyerController");

// Validate Bin QR Code
router.post("/validate-bin", buyerController.validateBinQRCode);

// Validate Bottle QR Code
router.post("/validate-bottle", buyerController.validateBottleQRCode);

module.exports = router;


