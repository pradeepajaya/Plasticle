const mongoose = require("mongoose");

const taskHandlerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  region: { type: String },
});

module.exports = mongoose.model("TaskHandler", taskHandlerSchema);
