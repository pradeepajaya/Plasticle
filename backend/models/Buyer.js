// don't chage any feild  here  , this stores consumer related data, you can add fields for your reqiurements but don't delete any feilds 
// you don't need to add buyer(consumer) id , when user login buyer id will create and stored here automatically 
const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalBottlesCollected: { type: Number, default: 0 },
  monthlyContribution: { type: Map, of: Number, default: {} },
  leaderboardRank: { type: Number, default: null },
});

const Buyer = mongoose.model("Buyer", buyerSchema);
module.exports = Buyer;