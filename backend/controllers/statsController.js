const Buyer = require("../models/Buyer");
const User = require("../models/User");
const mongoose = require("mongoose");

const getBottleStats = async (req, res) => {
  try {
    const now = new Date();

    // Base pipeline for lookup and age calculation
    const basePipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Filter only docs with valid dateOfBirth
      {
        $match: {
          $and: [
            { "user.dateOfBirth": { $ne: null } },
            {
              $expr: {
                $in: [{ $type: "$user.dateOfBirth" }, ["date", "string"]],
              },
            },
          ],
        },
      },

      // Convert to Date if it's a string
      {
        $addFields: {
          dateOfBirth: {
            $cond: {
              if: { $eq: [{ $type: "$user.dateOfBirth" }, "string"] },
              then: { $toDate: "$user.dateOfBirth" },
              else: "$user.dateOfBirth",
            },
          },
        },
      },

      // Calculate age
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [now, "$dateOfBirth"] },
                1000 * 60 * 60 * 24 * 365.25,
              ],
            },
          },
        },
      },

      // Determine age group
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 18] }, then: "0-17" },
                { case: { $lt: ["$age", 31] }, then: "18-30" },
                { case: { $lt: ["$age", 51] }, then: "31-50" },
              ],
              default: "51+",
            },
          },
        },
      },
    ];

    // Group by Province
    const byProvince = await Buyer.aggregate([
      ...basePipeline,
      {
        $group: {
          _id: "$province",
          totalBottles: { $sum: "$totalBottlesCollected" },
        },
      },
      {
        $project: {
          _id: 0,
          province: "$_id",
          totalBottles: 1,
        },
      },
    ]);

    // Group by Age Group
    const byAgeGroup = await Buyer.aggregate([
      ...basePipeline,
      {
        $group: {
          _id: "$ageGroup",
          totalBottles: { $sum: "$totalBottlesCollected" },
        },
      },
      {
        $project: {
          _id: 0,
          ageGroup: "$_id",
          totalBottles: 1,
        },
      },
    ]);

    // Group by Manufacturer
    const byManufacturer = await Buyer.aggregate([
      ...basePipeline,
      {
        $group: {
          _id: "$manufacturerId",
          totalBottles: { $sum: "$totalBottlesCollected" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      {
        $unwind: { path: "$manufacturer", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          manufacturer: "$manufacturer.username",
          totalBottles: 1,
        },
      },
    ]);

    return res.json({
      byProvince,
      byAgeGroup,
      byManufacturer,
    });
  } catch (error) {
    console.error("Error fetching bottle stats:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getBottleStats,
};
