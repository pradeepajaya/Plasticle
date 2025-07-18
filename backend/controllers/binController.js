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


// Get bins grouped by city, and flag full + uncollected bins
exports.getDueLocations = async (req, res) => {
  try {
    const allBins = await Bin.find({});
    const grouped = {};

    for (const bin of allBins) {
      const city = bin.city || "Unknown";
      const isFull = bin.status === "full";
      const notCollected = bin.collected === undefined || bin.collected === false;
      const isCritical = isFull && notCollected;

      const areaName = bin.locationName || bin.location || "Unknown Area";

      if (!grouped[city]) grouped[city] = [];

      grouped[city].push({
        binId: bin.binId,
        area: areaName,
        isCritical,
      });
    }

    res.status(200).json(grouped);
  } catch (error) {
    console.error("Error in getDueLocations:", error);
    res.status(500).json({ message: "Error fetching due locations", error });
  }
};
