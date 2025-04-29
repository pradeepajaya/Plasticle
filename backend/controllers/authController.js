// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Buyer = require("../models/Buyer");
const Collector = require("../models/Collector");
const Manufacturer = require("../models/Manufacturer");
// verify 
const crypto = require("crypto");

// new
const nodemailer = require("nodemailer");

const API_URL = process.env.API_BASE_URL;
const Front_API_URL=process.env.Reset_frontendpage_API_URL;


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
    // verify 
    const verificationToken = crypto.randomBytes(32).toString("hex");

    user = new User({ username, email, passwordHash, role, verificationToken });
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

    // Send Verification Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use Gmail App Password
      }
    });

    const verificationUrl = `${API_URL}/api/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Hi ${username},</p><p>Please <a href="${verificationUrl}">click here</a> to verify your email address.</p>`
    });

    // end verify 


    res.status(201).json({ message: "User registered successfully Check your email to verify." });
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
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials1" });

    //  Email not verified check
  
    if ( !user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }
  

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


// forgot-password

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate a password reset token (valid for 15 minutes)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Web-based password reset link
    const resetLink = `${Front_API_URL}/reset-password?token=${resetToken}`;


    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password, not your real Gmail password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>
             <p>If you did not request this, ignore this email.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// reset password 

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Invalid or expired token" });
  }
};

// verify user by gmail

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};