const express = require("express");
const router = express.Router();
const bottleController = require("../controllers/bottleController");

// POST /api/task-handler/recycle-bottle
router.post("/recycle-bottle", bottleController.recycleBottle);

module.exports = router;

// code beffore creating controller  tested 19/03/25 works fine,


/*
const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");
const Manufacturer = require("../models/Manufacturer");

// POST /api/task-handler/recycle-bottle
router.post("/recycle-bottle", async (req, res) => {
  try {
    const { bottleId, manufacturerId } = req.body; // Extract bottleId and manufacturerId from the request

    // Log the request body for debugging
    console.log("Request Body:", req.body);

    // Validate input
    if (!bottleId || !manufacturerId) {
      return res.status(400).json({ message: "bottleId and manufacturerId are required." });
    }

    // Find the bottle by bottleId
    const bottle = await Bottle.findOne({ bottleId });

    // Log the found bottle (or null if not found)
    console.log("Found bottle:", bottle);

    if (!bottle) {
      return res.status(404).json({ message: "Bottle not found." });
    }

    // Check if the bottle has already been recycled
    if (bottle.status === "recycled") {
      return res.status(400).json({ message: "Bottle already recycled." });
    }

    // Update the bottle status to "recycled"
    const updatedBottle = await Bottle.findOneAndUpdate(
      { bottleId },
      { status: "recycled" }, // Update the bottle's status to "recycled"
      { new: true } // Return the updated bottle document
    );
    console.log("Updated Bottle:", updatedBottle);

    // Update the manufacturer's totalBottlesRecycled using manufacturerId (mapped to userId)
    const manufacturerUpdate = await Manufacturer.findOneAndUpdate(
      { userId: manufacturerId }, // Find manufacturer by userId (mapped from manufacturerId)
      { $inc: { totalBottlesRecycled: 1 } }, // Increment the totalBottlesRecycled count by 1
      { new: true } // Return the updated manufacturer document
    );
    console.log("Updated Manufacturer:", manufacturerUpdate);

    if (!manufacturerUpdate) {
      return res.status(404).json({ message: "Manufacturer not found." });
    }

    // Return success response
    return res.status(200).json({ message: "Bottle added to recycling process" });
  } catch (error) {
    console.error("Error recycling bottle:", error);
    return res.status(500).json({ message: "Server error while recycling bottle." });
  }
});

module.exports = router;

*/