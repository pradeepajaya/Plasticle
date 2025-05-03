const express = require("express");
const router = express.Router();
const manufacturerController = require("../controllers/manufacturerController");

// API to generate QR codes
router.post("/generate-qr", manufacturerController.generateQrCodes);

module.exports = router;

