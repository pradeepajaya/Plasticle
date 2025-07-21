// you don't need to add collector id , when user login colloctor id will create and stored here automatically 
const mongoose = require("mongoose");

const collectorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalBinsCollected: { type: Number, default: 0 },
  monthlyBinsCollected: { type: Map, of: Number, default: {} },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  activePersonal: { type: Boolean, default: false },

});
collectorSchema.index({ location: "2dsphere" }); // for geospatial queries

const Collector = mongoose.model("Collector", collectorSchema);
module.exports = Collector;