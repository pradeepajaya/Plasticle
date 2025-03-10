const express = require("express");
const { createBin } = require("../controllers/binController"); // Import controller

const router = express.Router();

// Route for creating a bin & generating QR
router.post("/createBin", createBin);

module.exports = router;



// code beffore creating controller  tested 06/03/25 works fine,

/*const express = require("express");
const QRCode = require("qrcode");
const Bin = require("../models/Bin");

const router = express.Router();

// Create Bin & Generate QR
router.post("/createBin", async (req, res) => {
  try {
    const { location, capacity } = req.body;

    // Create new bin
    const newBin = new Bin({
      location,
      capacity,
      currentFill: 0, // Default value
    });

    await newBin.save();

    // Generate QR data (including binId, location, and currentFill)
    const qrData = JSON.stringify({
      binId: newBin._id,
      location: newBin.location,
      currentFill: newBin.currentFill,
    });

    // Generate QR code
    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.json({
      binId: newBin._id,
      qrCodeImage,
    });
  } catch (error) {
    console.error("Error creating bin:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router; */
