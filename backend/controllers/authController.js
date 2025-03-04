// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Buyer = require("../models/Buyer");
const Collector = require("../models/Collector");
const Manufacturer = require("../models/Manufacturer");

// User Registration
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    if (!["buyer", "collector", "manufacturer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for registration" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ username, email, passwordHash, role });
    await user.save();

    let roleSpecificDoc;
    switch (role) {
      case "buyer":
        roleSpecificDoc = new Buyer({ userId: user._id });
        break;
      case "collector":
        roleSpecificDoc = new Collector({ userId: user._id });
        break;
      case "manufacturer":
        roleSpecificDoc = new Manufacturer({ userId: user._id });
        break;
    }

    if (roleSpecificDoc) await roleSpecificDoc.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
