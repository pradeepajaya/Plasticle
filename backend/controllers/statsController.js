const Buyer = require("../models/Buyer");

const getBottleStats = async (req, res) => {
  try {
    const now = new Date();

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Filter only docs with a non-null dateOfBirth of type string or date
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ["$user.dateOfBirth", null] },
              {
                $or: [
                  { $eq: [{ $type: "$user.dateOfBirth" }, "date"] },
                  { $eq: [{ $type: "$user.dateOfBirth" }, "string"] },
                ],
              },
            ],
          },
        },
      },

      // Convert dateOfBirth to Date if it's string, else keep as date
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

      // Calculate age in years
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

      // Calculate ageGroup string
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 18] }, then: "Under 18" },
                { case: { $lt: ["$age", 30] }, then: "18-29" },
                { case: { $lt: ["$age", 45] }, then: "30-44" },
                { case: { $lt: ["$age", 60] }, then: "45-59" },
              ],
              default: "60+",
            },
          },
        },
      },

      // Group by province, manufacturerId, ageGroup
      {
        $group: {
          _id: {
            province: "$province",
            manufacturerId: "$manufacturerId",
            ageGroup: "$ageGroup",
          },
          totalBottles: { $sum: "$totalBottlesCollected" },
          countBuyers: { $sum: 1 },
        },
      },

      // Lookup manufacturer username
      {
        $lookup: {
          from: "users",
          localField: "_id.manufacturerId",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      {
        $unwind: {
          path: "$manufacturer",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Final projection
      {
        $project: {
          _id: 0,
          province: "$_id.province",
          manufacturer: "$manufacturer.username",
          ageGroup: "$_id.ageGroup",
          totalBottles: 1,
          countBuyers: 1,
        },
      },
    ];

    const results = await Buyer.aggregate(pipeline);

    return res.json(results);
  } catch (error) {
    console.error("Error fetching bottle stats:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getBottleStats };