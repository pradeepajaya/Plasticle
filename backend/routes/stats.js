const express = require('express');
const router = express.Router();
const Buyer = require('../models/Buyer'); // where bottle collection is recorded
const User = require('../models/User'); // to access district info (if stored)
const Manufacturer = require('../models/Manufacturer'); // if needed

// Utility function to extract year/month from date
const getDateParts = (date) => {
  const d = new Date(date);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

// Endpoint: /api/stats/bottles-summary
router.get('/bottles-summary', async (req, res) => {
  try {
    const data = await Buyer.aggregate([
      {
        $project: {
          totalBottlesCollected: 1,
          district: "$district", // assuming this field exists
          manufacturerId: "$manufacturerId", // assuming stored
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
            year: "$year",
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
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
