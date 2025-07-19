const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: String,
  binId: String,
  collectionDate: Date,
  status: {
    type: String,
    enum: ["unread", "accepted", "rejected"],
    default: "unread",
  },
}, { timestamps: true });

// Define the collector schema
const collectorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalBinsCollected: { type: Number, default: 0 },
  monthlyBinsCollected: {
    type: Map,
    of: Number,
    default: {},
  },
  location: {
    lat: Number,
    lng: Number,
  },
  activePersonal: { type: Boolean, default: true },
  preferredBins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bin' }],
  notifications: [notificationSchema],
});

module.exports = mongoose.model('Collector', collectorSchema);
