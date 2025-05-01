 // you don't need to add manufacturer id , when user login manufaturer id will create and stored here automatically 
const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalBottlesProduced: { type: Number, default: 0 },
  monthlyProduction: { type: Map, of: Number, default: {} },
  totalBottlesRecycled: { type: Number, default: 0 },
  monthlyRecycled: { type: Map, of: Number, default: {} },
});

const Manufacturer = mongoose.model("Manufacturer", manufacturerSchema);
module.exports = Manufacturer;