const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  // Bin ID to be used for QR code generation
  binId: { type: String, required: true, unique: true },

  location: { type: String, required: true },

   locationName: { type: String },   
 
   city: { type: String }, 

  capacity: { type: Number, required: true },

  currentFill: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["active", "full", "inactive", "assigned"],
    default: "active",
  },

  collectionDate: { type: Date },

  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "Collector" },


  collected: { type: Boolean, default: false }, // optional, if you want
  
  // Optional: You can add this field if you want to store the QR code URL or data itself
  // qrCode: { type: String }
});

const Bin = mongoose.model("Bin", binSchema);
module.exports = Bin;
