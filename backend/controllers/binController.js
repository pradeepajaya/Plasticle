const QRCode = require("qrcode");
const Bin = require("../models/Bin");

exports.createBin = async (req, res) => {
  try {
    const { location, capacity } = req.body;

    // Create new bin in the database
    const newBin = new Bin({
      location,
      capacity,
      currentFill: 0, // Default value
    });

    await newBin.save();

    // Generate QR code data (binId, location, currentFill)
    const qrData = JSON.stringify({
      binId: newBin._id,
      location: newBin.location,
      currentFill: newBin.currentFill,
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.json({
      binId: newBin._id,
      qrCodeImage,
    });
  } catch (error) {
    console.error("Error creating bin:", error);
    res.status(500).json({ error: "Server error" });
  }
};
