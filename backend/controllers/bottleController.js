const Bottle = require("../models/Bottle");
const Manufacturer = require("../models/Manufacturer");

// Recycle Bottle
const recycleBottle = async (req, res) => {
  try {
    const { bottleId, manufacturerId } = req.body;

    console.log("Request Body:", req.body);

    if (!bottleId || !manufacturerId) {
      return res.status(400).json({ message: "bottleId and manufacturerId are required." });
    }

    const bottle = await Bottle.findOne({ bottleId });
    console.log("Found bottle:", bottle);

    if (!bottle) {
      return res.status(404).json({ message: "Bottle not found." });
    }

    if (bottle.status === "recycled") {
      return res.status(400).json({ message: "Bottle already recycled." });
    }

    const updatedBottle = await Bottle.findOneAndUpdate(
      { bottleId },
      { status: "recycled" },
      { new: true }
    );
    console.log("Updated Bottle:", updatedBottle);

    const manufacturer = await Manufacturer.findOne({ userId: manufacturerId });
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found." });
    }

    manufacturer.totalBottlesRecycled += 1;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; 

    if (!manufacturer.monthlyRecycled) {
      manufacturer.monthlyRecycled = new Map();
    }

    const currentMonthCount = manufacturer.monthlyRecycled.get(monthKey) || 0;
    manufacturer.monthlyRecycled.set(monthKey, currentMonthCount + 1);

    await manufacturer.save();

    console.log("Updated Manufacturer:", manufacturer);

    return res.status(200).json({ message: "Bottle added to recycling process" });
  } catch (error) {
    console.error("Error recycling bottle:", error);
    return res.status(500).json({ message: "Server error while recycling bottle." });
  }
};

module.exports = {
  recycleBottle,
};
