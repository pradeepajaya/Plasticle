// routes/buyer.js (or buyerRoutes.js)
const express = require("express");
const router = express.Router();
const Buyer = require("../models/Buyer");

// GET leaderboard data
router.get("/leaderboard", async (req, res) => {
  try {
    // Fetch buyers, select userId and totalBottlesCollected, and populate username from User model
    const buyers = await Buyer.find()
      .populate("userId", "username") // assuming User schema has username field
      .sort({ totalBottlesCollected: -1 }); // sorted descending

    // Calculate rank with tie handling
    let rank = 1;
    let prevCount = null;
    let skip = 0;

    const leaderboard = buyers.map((buyer, index) => {
      if (buyer.totalBottlesCollected === prevCount) {
        skip++;
      } else {
        rank = index + 1;
        rank += skip;
        skip = 0;
      }
      prevCount = buyer.totalBottlesCollected;

      return {
        rank,
        name: buyer.userId?.username || "Unknown",
        bottles: buyer.totalBottlesCollected,
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
