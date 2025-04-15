// don't change any feild  here , this stored collector related data  you can add fields for your reqiurements but don't delete any feilds 
// you don't need to add collector id , when user login colloctor id will create and stored here automatically 
const mongoose = require("mongoose");

const collectorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalBinsCollected: { type: Number, default: 0 },
  monthlyBinsCollected: { type: Map, of: Number, default: {} },
});

const Collector = mongoose.model("Collector", collectorSchema);
module.exports = Collector;