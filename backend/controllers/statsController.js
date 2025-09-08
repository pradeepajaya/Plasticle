const Bottle = require("../models/Bottle");
const Buyer = require("../models/Buyer");

// Original buyer-based stats (keep your existing functionality)
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
      
      // Filter buyers that have a valid dateOfBirth
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

      // Convert dateOfBirth to Date if it's a string
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

      // Create age group
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

      // Group by province and age group
      {
        $group: {
          _id: {
            province: "$user.province",
            ageGroup: "$ageGroup",
          },
          totalBottles: { $sum: "$totalBottlesCollected" },
          countBuyers: { $sum: 1 },
        },
      },

      // Project clean output
      {
        $project: {
          _id: 0,
          province: "$_id.province",
          ageGroup: "$_id.ageGroup",
          totalBottles: 1,
          countBuyers: 1,
          // Add manufacturer field for compatibility (will be "Unknown" for buyer data)
          manufacturer: { $literal: "Various" },
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

// New function: Get detailed buyer bottle collection stats by province, month, year, and manufacturer
const getBuyerBottleStats = async (req, res) => {
  try {
    const pipeline = [
      // Only include bottles that have been collected/used by buyers
      {
        $match: {
          status: { $in: ["used", "collected", "recycled"] },
          buyerId: { $ne: null }
        },
      },

      // Lookup buyer information
      {
        $lookup: {
          from: "buyers",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      { $unwind: "$buyer" },

      // Lookup user information for buyer
      {
        $lookup: {
          from: "users",
          localField: "buyer.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Lookup manufacturer information
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer",
        },
      },

      // Add computed fields
      {
        $addFields: {
          manufacturerName: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown Manufacturer"
            ]
          },
          buyerName: {
            $concat: [
              { $ifNull: ["$user.firstName", ""] },
              " ",
              { $ifNull: ["$user.lastName", ""] }
            ]
          },
          buyerEmail: "$user.email",
          province: "$buyer.province",
          collectionMonth: { $month: "$generatedAt" },
          collectionYear: { $year: "$generatedAt" },
        },
      },

      // Group by buyer, province, month, year, and manufacturer
      {
        $group: {
          _id: {
            buyerId: "$buyerId",
            buyerName: "$buyerName",
            buyerEmail: "$buyerEmail",
            province: "$province",
            manufacturer: "$manufacturerName",
            month: "$collectionMonth",
            year: "$collectionYear",
          },
          bottleCount: { $sum: 1 },
          bottleStatuses: { $push: "$status" },
          recycledCount: {
            $sum: { $cond: [{ $eq: ["$status", "recycled"] }, 1, 0] }
          },
          collectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "collected"] }, 1, 0] }
          },
          usedCount: {
            $sum: { $cond: [{ $eq: ["$status", "used"] }, 1, 0] }
          },
        },
      },

      // Project clean output
      {
        $project: {
          _id: 0,
          buyerId: "$_id.buyerId",
          buyerName: "$_id.buyerName",
          buyerEmail: "$_id.buyerEmail",
          province: "$_id.province",
          manufacturer: "$_id.manufacturer",
          month: "$_id.month",
          year: "$_id.year",
          monthName: {
            $arrayElemAt: [
              ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              "$_id.month"
            ]
          },
          totalBottles: "$bottleCount",
          recycledBottles: "$recycledCount",
          collectedBottles: "$collectedCount",
          usedBottles: "$usedCount",
          recyclingRate: {
            $round: [
              { $multiply: [{ $divide: ["$recycledCount", "$bottleCount"] }, 100] },
              1
            ]
          }
        },
      },

      // Sort by year, month, province, and buyer name
      { 
        $sort: { 
          year: -1, 
          month: -1, 
          province: 1, 
          buyerName: 1,
          manufacturer: 1 
        } 
      },
    ];

    const results = await Bottle.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error("Error fetching buyer bottle stats:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Summary stats for buyers by province and time period
const getBuyerSummaryStats = async (req, res) => {
  try {
    const pipeline = [
      // Only include bottles that have been collected/used by buyers
      {
        $match: {
          status: { $in: ["used", "collected", "recycled"] },
          buyerId: { $ne: null }
        },
      },

      // Lookup buyer and user information
      {
        $lookup: {
          from: "buyers",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      { $unwind: "$buyer" },

      {
        $lookup: {
          from: "users",
          localField: "buyer.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Add computed fields
      {
        $addFields: {
          province: "$buyer.province",
          collectionMonth: { $month: "$generatedAt" },
          collectionYear: { $year: "$generatedAt" },
        },
      },

      // Group by province, month, and year
      {
        $group: {
          _id: {
            province: "$province",
            month: "$collectionMonth",
            year: "$collectionYear",
          },
          totalBottles: { $sum: 1 },
          uniqueBuyers: { $addToSet: "$buyerId" },
          recycledBottles: {
            $sum: { $cond: [{ $eq: ["$status", "recycled"] }, 1, 0] }
          },
          collectedBottles: {
            $sum: { $cond: [{ $eq: ["$status", "collected"] }, 1, 0] }
          },
        },
      },

      // Project clean output
      {
        $project: {
          _id: 0,
          province: "$_id.province",
          month: "$_id.month",
          year: "$_id.year",
          monthName: {
            $arrayElemAt: [
              ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              "$_id.month"
            ]
          },
          totalBottles: 1,
          buyerCount: { $size: "$uniqueBuyers" },
          recycledBottles: 1,
          collectedBottles: 1,
          recyclingRate: {
            $round: [
              { $multiply: [{ $divide: ["$recycledBottles", "$totalBottles"] }, 100] },
              1
            ]
          }
        },
      },

      // Sort by year, month, and province
      { $sort: { year: -1, month: -1, province: 1 } },
    ];

    const results = await Bottle.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error("Error fetching buyer summary stats:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { 
  getBottleStats,
  getBuyerBottleStats,
  getBuyerSummaryStats,
  getBottleDisposalStats,
  getMonthlyDisposalStats,
  getYearlyDisposalStats,
  getManufacturerStats,
  getCollectedByMonth,
  getCollectedByYear,
  getCollectedByManufacturer,
  getCollectedByProvince,
  getBottleSummary
};

// New bottle-based disposal stats
const getBottleDisposalStats = async (req, res) => {
  try {
    const pipeline = [
      // Lookup manufacturer info
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      
      // Only include bottles that have been used/collected (not just generated)
      {
        $match: {
          status: { $in: ["used", "collected", "recycled"] },
          buyerId: { $ne: null }
        },
      },

      // Add computed fields
      {
        $addFields: {
          manufacturerName: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown Manufacturer"
            ]
          },
          disposalMonth: { $month: "$generatedAt" },
          disposalYear: { $year: "$generatedAt" },
        },
      },

      // Group by manufacturer and disposal time
      {
        $group: {
          _id: {
            manufacturer: "$manufacturerName",
            month: "$disposalMonth",
            year: "$disposalYear",
            status: "$status"
          },
          bottleCount: { $sum: 1 },
        },
      },

      // Project clean output
      {
        $project: {
          _id: 0,
          manufacturer: "$_id.manufacturer",
          month: "$_id.month",
          year: "$_id.year",
          status: "$_id.status",
          bottleCount: 1,
        },
      },

      // Sort by year and month
      { $sort: { year: -1, month: -1 } },
    ];

    const results = await Bottle.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error("Error fetching bottle disposal stats:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Monthly disposal statistics
const getMonthlyDisposalStats = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          status: { $in: ["collected", "recycled"] },
          buyerId: { $ne: null }
        },
      },

      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer",
        },
      },

      {
        $addFields: {
          manufacturerName: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown"
            ]
          },
          month: { $month: "$generatedAt" },
          year: { $year: "$generatedAt" },
        },
      },

      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          totalBottles: { $sum: 1 },
          recycledBottles: {
            $sum: { $cond: [{ $eq: ["$status", "recycled"] }, 1, 0] }
          },
          collectedBottles: {
            $sum: { $cond: [{ $eq: ["$status", "collected"] }, 1, 0] }
          },
          manufacturers: { $addToSet: "$manufacturerName" },
        },
      },

      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          monthName: {
            $arrayElemAt: [
              ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              "$_id.month"
            ]
          },
          totalBottles: 1,
          recycledBottles: 1,
          collectedBottles: 1,
          manufacturerCount: { $size: "$manufacturers" },
          recyclingRate: {
            $round: [
              { $multiply: [{ $divide: ["$recycledBottles", "$totalBottles"] }, 100] },
              1
            ]
          }
        },
      },

      { $sort: { year: 1, month: 1 } },
    ];

    const results = await Bottle.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error("Error fetching monthly disposal stats:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Yearly disposal statistics
const getYearlyDisposalStats = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          status: { $in: ["collected", "recycled"] },
          buyerId: { $ne: null }
        },
      },

      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer",
        },
      },

      {
        $addFields: {
          manufacturerName: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown"
            ]
          },
          year: { $year: "$generatedAt" },
        },
      },

      {
        $group: {
          _id: { year: "$year" },
          totalBottles: { $sum: 1 },
          recycledBottles: {
            $sum: { $cond: [{ $eq: ["$status", "recycled"] }, 1, 0] }
          },
          collectedBottles: {
            $sum: { $cond: [{ $eq: ["$status", "collected"] }, 1, 0] }
          },
          manufacturers: { $addToSet: "$manufacturerName" },
        },
      },

      {
        $project: {
          _id: 0,
          year: "$_id.year",
          totalBottles: 1,
          recycledBottles: 1,
          collectedBottles: 1,
          manufacturerCount: { $size: "$manufacturers" },
          recyclingRate: {
            $round: [
              { $multiply: [{ $divide: ["$recycledBottles", "$totalBottles"] }, 100] },
              1
            ]
          }
        },
      },

      { $sort: { year: 1 } },
    ];

    const results = await Bottle.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error("Error fetching yearly disposal stats:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get manufacturer performance stats
const getManufacturerStats = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer",
        },
      },

      {
        $match: {
          status: { $in: ["used", "collected", "recycled"] },
        },
      },

      {
        $addFields: {
          manufacturerName: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown Manufacturer"
            ]
          },
        },
      },

      {
        $group: {
          _id: "$manufacturerName",
          totalGenerated: { $sum: 1 },
          usedBottles: {
            $sum: { $cond: [{ $eq: ["$status", "used"] }, 1, 0] }
          },
          collectedBottles: {
            $sum: { $cond: [{ $eq: ["$status", "collected"] }, 1, 0] }
          },
          recycledBottles: {
            $sum: { $cond: [{ $eq: ["$status", "recycled"] }, 1, 0] }
          },
        },
      },

      {
        $project: {
          _id: 0,
          manufacturer: "$_id",
          totalGenerated: 1,
          usedBottles: 1,
          collectedBottles: 1,
          recycledBottles: 1,
          usageRate: {
            $round: [
              { $multiply: [{ $divide: ["$usedBottles", "$totalGenerated"] }, 100] },
              1
            ]
          },
          recyclingRate: {
            $round: [
              { $multiply: [{ $divide: ["$recycledBottles", "$totalGenerated"] }, 100] },
              1
            ]
          }
        },
      },

      { $sort: { totalGenerated: -1 } },
    ];

    const results = await Bottle.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error("Error fetching manufacturer stats:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Bottles collected by month
const getCollectedByMonth = async (req, res) => {
  try {
    const results = await Bottle.aggregate([
      { $match: { status: { $in: ["collected", "recycled"] } } },
      {
        $group: {
          _id: {
            year: { $year: "$generatedAt" },
            month: { $month: "$generatedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching bottles collected by month:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Bottles collected by year
const getCollectedByYear = async (req, res) => {
  try {
    const results = await Bottle.aggregate([
      { $match: { status: { $in: ["collected", "recycled"] } } },
      {
        $group: {
          _id: { year: { $year: "$generatedAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          count: 1
        }
      },
      { $sort: { year: 1 } }
    ]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching bottles collected by year:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Bottles collected by manufacturer
const getCollectedByManufacturer = async (req, res) => {
  try {
    const results = await Bottle.aggregate([
      { $match: { status: { $in: ["collected", "recycled"] } } },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer"
        }
      },
      {
        $addFields: {
          manufacturerName: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$manufacturerName",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          manufacturer: "$_id",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching bottles collected by manufacturer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Bottles collected by province
const getCollectedByProvince = async (req, res) => {
  try {
    const results = await Bottle.aggregate([
      { $match: { status: { $in: ["collected", "recycled"] } } },
      {
        $lookup: {
          from: "buyers",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer"
        }
      },
      { $unwind: "$buyer" },
      {
        $group: {
          _id: "$buyer.province",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          province: "$_id",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching bottles collected by province:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// API endpoint for bottle summary by province, manufacturer, year, month, and status
const getBottleSummary = async (req, res) => {
  try {
    // Bottles manufactured per month/year/manufacturer
    const manufactured = await Bottle.aggregate([
      {
        $addFields: {
          year: { $year: "$generatedAt" },
          month: { $month: "$generatedAt" }
        }
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer"
        }
      },
      {
        $addFields: {
          manufacturer: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown"
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            manufacturer: "$manufacturer",
            year: "$year",
            month: "$month"
          },
          manufacturedCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          manufacturer: "$_id.manufacturer",
          year: "$_id.year",
          month: "$_id.month",
          manufacturedCount: 1
        }
      },
      { $sort: { year: 1, month: 1, manufacturer: 1 } }
    ]);

    // Bottles collected per month/year/province/manufacturer
    const collected = await Bottle.aggregate([
      {
        $match: {
          status: { $in: ["collected", "recycled"] },
          buyerId: { $ne: null }
        }
      },
      {
        $addFields: {
          year: { $year: "$generatedAt" },
          month: { $month: "$generatedAt" }
        }
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer"
        }
      },
      {
        $addFields: {
          manufacturer: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown"
            ]
          }
        }
      },
      {
        $lookup: {
          from: "buyers",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer"
        }
      },
      { $unwind: "$buyer" },
      {
        $addFields: {
          province: "$buyer.province"
        }
      },
      {
        $group: {
          _id: {
            province: "$province",
            manufacturer: "$manufacturer",
            year: "$year",
            month: "$month"
          },
          collectedCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          province: "$_id.province",
          manufacturer: "$_id.manufacturer",
          year: "$_id.year",
          month: "$_id.month",
          collectedCount: 1
        }
      },
      { $sort: { year: 1, month: 1, province: 1, manufacturer: 1 } }
    ]);

    // Bottles recycled per month/year/manufacturer
    const recycled = await Bottle.aggregate([
      {
        $match: {
          status: "recycled"
        }
      },
      {
        $addFields: {
          year: { $year: "$generatedAt" },
          month: { $month: "$generatedAt" }
        }
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturerId",
          foreignField: "_id",
          as: "manufacturer"
        }
      },
      {
        $addFields: {
          manufacturer: {
            $ifNull: [
              { $arrayElemAt: ["$manufacturer.name", 0] },
              "Unknown"
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            manufacturer: "$manufacturer",
            year: "$year",
            month: "$month"
          },
          recycledCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          manufacturer: "$_id.manufacturer",
          year: "$_id.year",
          month: "$_id.month",
          recycledCount: 1
        }
      },
      { $sort: { year: 1, month: 1, manufacturer: 1 } }
    ]);

    res.json({
      manufactured,
      collected,
      recycled
    });
  } catch (error) {
    console.error("Error fetching bottle summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};