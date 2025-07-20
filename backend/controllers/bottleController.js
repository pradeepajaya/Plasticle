const Bottle = require("../models/Bottle");
const Manufacturer = require("../models/Manufacturer");
const Buyer = require("../models/Buyer");

// ♻️ Recycle Bottle
const recycleBottle = async (req, res) => {
  try {
    const { bottleId, manufacturerId } = req.body;

    if (!bottleId || !manufacturerId) {
      return res.status(400).json({ message: "bottleId and manufacturerId are required." });
    }

    const bottle = await Bottle.findOne({ bottleId });
    if (!bottle) return res.status(404).json({ message: "Bottle not found." });
    if (bottle.status === "recycled") return res.status(400).json({ message: "Already recycled." });

    await Bottle.findOneAndUpdate({ bottleId }, { status: "recycled" }, { new: true });

    const manufacturer = await Manufacturer.findOne({ userId: manufacturerId });
    if (!manufacturer) return res.status(404).json({ message: "Manufacturer not found." });

    manufacturer.totalBottlesRecycled += 1;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (!manufacturer.monthlyRecycled) manufacturer.monthlyRecycled = new Map();

    const current = manufacturer.monthlyRecycled.get(monthKey) || 0;
    manufacturer.monthlyRecycled.set(monthKey, current + 1);

    await manufacturer.save();

    return res.status(200).json({ message: "Bottle added to recycling process" });
  } catch (error) {
    console.error("Error recycling bottle:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 📊 Get Bottle Summary (moved from stats.js)
const getBottleSummary = async (req, res) => {
  try {
    const data = await Buyer.aggregate([
      {
        $project: {
          totalBottlesCollected: 1,
          district: "$district", // must exist in Buyer schema
          manufacturerId: "$manufacturerId", // must exist
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            district: "$district",
            manufacturerId: "$manufacturerId",
          },
          total: { $sum: "$totalBottlesCollected" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Error fetching bottle summary:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  recycleBottle,
  getBottleSummary, // 👈 export it
};
