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
});

module.exports = mongoose.model("User", userSchema);
