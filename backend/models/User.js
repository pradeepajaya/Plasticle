/*const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);*/
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String }, // No longer required for OAuth users
  role: {
    type: String,
    enum: ["buyer", "collector", "manufacturer", "admin", "taskhandler"],
    required: true,
  },
  isVerified: { type: Boolean, default: false }, // True for OAuth users
  verificationToken: String,
  isOAuth: { type: Boolean, default: false } // New field to flag OAuth users
});

module.exports = mongoose.model("User", userSchema);

