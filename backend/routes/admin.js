const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Create Task Handlers (Only Admins)
router.post("/create-task-handler", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access Denied" });

  const { username, email, password, role } = req.body;

  if (role !== "bin_handler" && role !== "scan_handler") {
    return res.status(400).json({ message: "Invalid task handler role" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ username, email, passwordHash, role });
    await user.save();

    res.status(201).json({ message: "Task Handler Created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
