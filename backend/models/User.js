const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["buyer", "collector", "manufacturer", "admin", "taskhandler" ],
    required: true,
  },
  // verify user 
  isVerified: { type: Boolean, default: false },
  verificationToken: String
});

module.exports = mongoose.model("User", userSchema);
