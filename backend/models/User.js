// don't chage any feild  here  this user field is more specific for RBAC login
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
  isOAuth: { type: Boolean, default: false }, // New field to flag OAuth users
  dateOfBirth: { type: Date, required: false }, // optional field

  //Buyer/Collector-specific fields
  nickname: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  hometown: { type: String },

  // Manufacturer-specific fields
  companyName: { type: String },
  companyLocation: { type: String },
  companyRegNumber: { type: String },
  companyTelephone: { type: String },

  //user profile image
  profilePicture: { type: String }, // base64 string or image URL

  //Task Handler-specific fields
  isActive: { type: Boolean, default: true }, // New field for soft delete

  
});

module.exports = mongoose.model("User", userSchema);
