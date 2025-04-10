// don't chage any feild  here  , you can add fields for your reqiurements but don't delete any feilds 
// bottle id should generate and store here when manufacturer print qr 
const mongoose = require("mongoose");

const bottleSchema = new mongoose.Schema({
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: "Manufacturer", required: true },
  bottleId: { type: String, required: true, unique: true }, // Unique bottle ID
  buyerId: { type: String, default: null },
  binId: { type: String, default: null },
  status: { type: String, enum: ["unused", "used", "collected", "recycled"], default: "unused" },
});

const Bottle = mongoose.model("Bottle", bottleSchema);
module.exports = Bottle;