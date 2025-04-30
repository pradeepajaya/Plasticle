
const express = require("express");
const router = express.Router();
const { validateBin, updateCollectorStatus } = require("../controllers/collectorController"); // Import from collectorController

// Define route to validate bin (specific to collectors)
router.post("/validate-bin", validateBin);
router.post("/update-status", updateCollectorStatus);

module.exports = router;


//code beffore creating controller  tested 18/03/25 works fine,

/*
const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");
const Bin = require("../models/Bin");
const Collector = require("../models/Collector");

router.post("/validate-bin", async (req, res) => {
  try {
    const { binId, userId } = req.body;

    // Log the request body for debugging
    console.log("Request Body:", req.body);

    // Validate input
    if (!binId || !userId) {
      return res.status(400).json({ message: "binId and userId are required." });
    }

    // Log the binId being searched
    console.log("Searching for bin with ID:", binId);

    // Find the bin by binId
    const bin = await Bin.findOne({ binId });

    // Log the found bin (or null if not found)
    console.log("Found bin:", bin);

    if (!bin) {
      return res.status(404).json({ message: "Bin not found." });
    }

    // Check if the bin is inactive
    if (bin.status === "inactive") {
      return res.status(400).json({ message: "This bin is not available for collection." });
    }

    // Update the Bottle collection (mark the bottles in the bin as "collected")
    const bottles = await Bottle.updateMany(
      { binId: binId },
      { status: "collected" }
    );
    console.log("Bottles updated:", bottles);

    // Update the Collector collection
    const currentMonth = new Date().toLocaleString("default", { month: "long" }); // e.g., "March"
    const collectorUpdate = await Collector.findOneAndUpdate(
      { userId: userId }, // Query by userId
      {
        $inc: {
          totalBinsCollected: 1,
          [`monthlyBinsCollected.${currentMonth}`]: 1, // Increment the current month's collection
        },
      },
      { new: true } // Return the updated document
    );
    console.log("Updated Collector:", collectorUpdate);

    // Update the Bin collection (mark the bin as "active" and reset the currentFill to 0)
    const binUpdate = await Bin.findOneAndUpdate(
      { binId: binId },
      { 
        status: "active",  // Set status to active
        currentFill: 0     // Reset the bin's fill count
      },
      { new: true } // Return the updated document
    );
    console.log("Updated Bin:", binUpdate);

    // Return success response
    return res.status(200).json({ message: "Bin successfully collected" });
  } catch (error) {
    console.error("Error validating bin:", error);
    return res.status(500).json({ message: "Server error while validating bin." });
  }
});

module.exports = router;

*/