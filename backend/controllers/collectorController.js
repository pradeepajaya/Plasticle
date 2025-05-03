const Bottle = require("../models/Bottle");
const Bin = require("../models/Bin");
const Collector = require("../models/Collector");

const validateBin = async (req, res) => {
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

    console.log("Found bin:", bin);

    if (!bin) {
      return res.status(404).json({ message: "Bin not found." });
    }

    if (bin.status === "inactive") {
      return res.status(400).json({ message: "This bin is not available for collection." });
    }

    if (bin.currentFill === 0) {
      return res.status(400).json({ message: "This bin is already empty and cannot be collected." });
    }

    // Update the Bottle collection 
    const bottles = await Bottle.updateMany(
      { binId: binId },
      { status: "collected" }
    );
    console.log("Bottles updated:", bottles);

    // Update the Collector collection
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // e.g., "2025-04"

    // Fetch the collector document
    const collector = await Collector.findOne({ userId });

if (!collector) {
    return res.status(404).json({ message: "Collector not found." });
}

// Update monthlyBinsCollected
if (!collector.monthlyBinsCollected.has(currentMonth)) {
    collector.monthlyBinsCollected.set(currentMonth, 0);
}
collector.monthlyBinsCollected.set(
    currentMonth,
    collector.monthlyBinsCollected.get(currentMonth) + 1
);

collector.totalBinsCollected += 1;

await collector.save();

    console.log("Updated Collector:", collector);

    // Update the Bin collection 
    const binUpdate = await Bin.findOneAndUpdate(
      { binId: binId },
      { 
        status: "active",  
        currentFill: 0     
      },
      { new: true } 
    );
    console.log("Updated Bin:", binUpdate);

    return res.status(200).json({ message: "Bin successfully collected" });
  } catch (error) {
    console.error("Error validating bin:", error);
    return res.status(500).json({ message: "Server error while validating bin." });
  }
};

const updateCollectorStatus = async (req, res) => {
  try {
    const { userId, latitude, longitude, activePersonal } = req.body;

    if (!userId || latitude == null || longitude == null || activePersonal == null) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const collector = await Collector.findOneAndUpdate(
      { userId },
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        activePersonal,
      },
      { new: true }
    );

    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    res.status(200).json({ message: "Collector status updated", collector });
  } catch (error) {
    console.error("Error updating collector status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { validateBin, updateCollectorStatus };
