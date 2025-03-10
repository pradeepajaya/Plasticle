const express = require("express");
const authenticateToken = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/user", authenticateToken, authController.getUser);

module.exports = router;

// code for before creating the controller 04/03/25 tested works fine 

/*const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Buyer = require("../models/Buyer");
const Collector = require("../models/Collector");
const Manufacturer = require("../models/Manufacturer");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

// User Registration (For Buyers, Collectors, Manufacturers)
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    if (!["buyer", "collector", "manufacturer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for registration" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create and save user
    user = new User({ username, email, passwordHash, role });
    await user.save();

    // Create role-specific document
    let roleSpecificDoc;
    switch (role) {
      case "buyer":
        roleSpecificDoc = new Buyer({ userId: user._id }); // Fixed `newUser` to `user`
        break;
      case "collector":
        roleSpecificDoc = new Collector({ userId: user._id });
        break;
      case "manufacturer":
        roleSpecificDoc = new Manufacturer({ userId: user._id });
        break;
      default:
        break;
    }

    if (roleSpecificDoc) {
      await roleSpecificDoc.save();
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err); // Log errors for debugging
    res.status(500).json({ message: "Server error" });
  }
});

// User Login (All Users)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



//new

router.get("/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // FIXED req.user.id
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user }); // Returns { user: { username, email, role } }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

*/


