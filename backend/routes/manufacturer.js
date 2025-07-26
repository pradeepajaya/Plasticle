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

// API to get manufacturer stats (total bottles produced and recycled)
router.get("/stats", authenticateToken, manufacturerController.getStats);

router.get("/monthly-report/:month", authenticateToken, manufacturerController.getManufacturerMonthlyReport);

module.exports = router;