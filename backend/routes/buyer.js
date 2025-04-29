const express = require("express");
const router = express.Router();
const buyerController = require("../controllers/buyerController");

// Validate Bin QR Code
router.post("/validate-bin", buyerController.validateBinQRCode);

// Validate Bottle QR Code
router.post("/validate-bottle", buyerController.validateBottleQRCode);

module.exports = router;



// code before creating controller  tested 15/03/25 works fine,

{/*
const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");
const Bin = require("../models/Bin");
const Buyer = require("../models/Buyer"); 

router.post("/validate-bottle", async (req, res) => {
  try {
    const { bottleId, binId, userId } = req.body;

    // Log the request body
    console.log("Request Body:", req.body);

    // Validate input
    if (!bottleId || !binId || !userId) {
      return res.status(400).json({ message: "bottleId, binId, and userId are required." });
    }

    // Find the bottle by bottleId
    console.log("Searching for bottle with ID:", bottleId);
    const bottle = await Bottle.findOne({ bottleId });
    console.log("Found bottle:", bottle);

    if (!bottle) {
      return res.status(404).json({ message: "Bottle not found." });
    }

    // Check if the bottle is already used
    if (bottle.status === "used") {
      return res.status(400).json({ message: "This bottle has already been used." });
    }

    // Update the Bottle collection
    console.log("Updating bottle with binId and userId...");
    bottle.binId = binId;
    bottle.buyerId = userId;
    bottle.status = "used";
    await bottle.save();
    console.log("Bottle updated successfully.");

    // Update the Buyer collection
    console.log("Updating buyer with ID:", userId);
    const currentMonth = new Date().toLocaleString("default", { month: "long" }); // e.g., "March"
    const buyerUpdate = await Buyer.findOneAndUpdate(
      { userId: userId }, // Query by userId
      {
        $inc: {
          totalBottlesCollected: 1,
          [`monthlyContribution.${currentMonth}`]: 1, // Increment the current month's contribution
        },
      },
      { new: true } // Return the updated document
    );
    console.log("Updated Buyer:", buyerUpdate);

    // Update the Bin collection
    console.log("Updating bin with ID:", binId);
    const binUpdate = await Bin.findOneAndUpdate(
      { binId: binId }, // Query by binId (string)
      { $inc: { currentFill: 1 } },
      { new: true } // Return the updated document
    );
    console.log("Updated Bin:", binUpdate);

    // Return success response
    return res.status(200).json({ message: "Bottle added to bin" });
  } catch (error) {
    console.error("Error validating bottle:", error);
    return res.status(500).json({ message: "Server error while validating bottle." });
  }
});
// Validate Bin QR Code
router.post("/validate-bin", async (req, res) => {
  try {
    const { binId } = req.body;  // Extract binId from the request body

    // Find bin by binId
    const bin = await Bin.findOne({ binId });

    if (!bin) {
      return res.status(404).json({ message: "Bin not found" });
    }

    if (bin.status === "inactive" || bin.status === "full") {
      return res.status(400).json({ message: "This bin is not available for use." });
    }

    // Bin found and valid
    return res.status(200).json({ message: "Bin is valid", bin });
  } catch (error) {
    console.error("Error validating bin:", error);
    return res.status(500).json({ message: "Server error while validating bin." });
  }
});

module.exports = router;
*/}