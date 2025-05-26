// bottle id should generate and store here when manufacturer generate qr 
const mongoose = require("mongoose");

const bottleSchema = new mongoose.Schema({
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: "Manufacturer", required: true },
  bottleId: { type: String, required: true, unique: true },
  buyerId: { type: String, default: null },
  binId: { type: String, default: null },
  status: { type: String, enum: ["unused", "used", "collected", "recycled"], default: "unused" },
  generatedAt: { type: Date, default: Date.now },
});

const Bottle = mongoose.model("Bottle", bottleSchema);
module.exports = Bottle;