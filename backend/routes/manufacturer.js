const express = require("express");
const router = express.Router();
const manufacturerController = require("../controllers/manufacturerController");
const authenticateToken = require("../middleware/auth");

// API to generate QR codes
router.post("/generate-qr", manufacturerController.generateQrCodes);

// API to update manufacturer profile
router.put("/update-profile",authenticateToken,manufacturerController.updateProfile);

//API to generate-pdf
router.post("/generate-pdf", authenticateToken, manufacturerController.generatePdf); 

module.exports = router;

