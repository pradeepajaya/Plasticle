// bin id should store here when taskhandler generate bin qr 
const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  binId: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentFill: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "full", "inactive", "assigned"], default: "active" },
  locationName: { type: String },   
  collectionDate: { type: Date },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "Collector" },
  collected: { type: Boolean, default: false }, 
  vehicleId: { type: String },
  previousFill: { type: Number, default: 0 },
});

const Bin = mongoose.model("Bin", binSchema);
module.exports = Bin;