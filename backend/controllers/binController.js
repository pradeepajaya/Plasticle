const QRCode = require("qrcode");
const Bin = require("../models/Bin");
const { v4: uuidv4 } = require('uuid');  
exports.createBin = async (req, res) => {
  try {
    const { location, capacity } = req.body;

    // Generate a unique binId using uuid
    const binId = uuidv4(); 

    // Create new bin in the database with generated binId
    const newBin = new Bin({
      binId,  
      location,
      capacity,
      currentFill: 0, 
    });

    // Save the new bin document
    await newBin.save();

    // Generate QR code data (binId, location, currentFill)
    const qrData = JSON.stringify({
      binId: newBin.binId,  
      location: newBin.location,
      currentFill: newBin.currentFill,
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.json({
      binId: newBin.binId, 
      qrCodeImage,
    });
  } catch (error) {
    console.error("Error creating bin:", error);
    res.status(500).json({ error: "Server error" });
  }
};
