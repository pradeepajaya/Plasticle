// don't chage any feild  here  , you can add fields for your reqiurements but don't delete any feilds 
// bin id should store here when taskhandler generate bin qr 
const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  binId: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentFill: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "full", "inactive"], default: "active" },
});

const Bin = mongoose.model("Bin", binSchema);
module.exports = Bin;