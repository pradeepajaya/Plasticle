// don't chage any feild  here  , you can add fields for your reqiurements but don't delete any feilds 
// bottle id should generate and store here when manufacturer print qr 
const mongoose = require("mongoose");

const bottleSchema = new mongoose.Schema({
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: "Manufacturer", required: true },
  bottleId: { type: String, required: true, unique: true }, // Unique bottle ID
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer", default: null },
  binId: { type: mongoose.Schema.Types.ObjectId, ref: "Bin", default: null },
  status: { type: String, enum: ["unused", "collected", "recycled"], default: "unused" },
});

const Bottle = mongoose.model("Bottle", bottleSchema);
module.exports = Bottle;