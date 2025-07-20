const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalBottlesCollected: { type: Number, default: 0 },
  monthlyContribution: { type: Map, of: Number, default: {} },
  leaderboardRank: { type: Number, default: null },
  
  // Optional fields for analytics
  province: { type: String },
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: "Manufacturer" },
  username: { type: String },
});

const Buyer = mongoose.model("Buyer", buyerSchema);
module.exports = Buyer;
