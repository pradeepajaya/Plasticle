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

// oauth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);


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

    user = new User({ username, email, passwordHash, role, verificationToken,  isOAuth:false });
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

// oauth 

exports.googleAuth = async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: "Name, email, and role are required" });
  }

  if (!["buyer", "collector", "manufacturer"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    let user = await User.findOne({ email });

    // If user already exists
    if (user) {
      // Optional: check if role matches
      if (user.role !== role) {
        return res.status(400).json({ message: "User already registered with a different role." });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        user: { id: user._id, username: user.username, role: user.role }
      });
    }

    // Register new user
    const newUser = new User({
      username: name || email.split("@")[0],
      email,
      role,
      isOAuth: true,
      isVerified: true
    });
    await newUser.save();

    // Create role-specific document
    let roleSpecificDoc;
    switch (role) {
      case "buyer":
        roleSpecificDoc = new Buyer({ userId: newUser._id });
        break;
      case "collector":
        roleSpecificDoc = new Collector({ userId: newUser._id });
        break;
      case "manufacturer":
        roleSpecificDoc = new Manufacturer({ userId: newUser._id });
        break;
    }
    if (roleSpecificDoc) await roleSpecificDoc.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username, role: newUser.role }
    });

  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// User Login
/*
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
};*/
// updated login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (user.isOAuth) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please log in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
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
        pass: process.env.EMAIL_PASS, // App Password gmail 
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

// DELETE /user /delete-account / soft -delete user account

exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Overwrite the email (to free it for reuse)
    const timestamp = Date.now();
    const replacedEmail = `deleted_${timestamp}_${user._id}@deleted.com`;

    await User.findByIdAndUpdate(userId, {
      email: replacedEmail,
      passwordHash: null,
      isVerified: false,
      isOAuth: false, // Optional: clear OAuth flag
    });

    res.status(200).json({ message: "Account deleted. You may reuse your email to register again." });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error while deleting account" });
  }
};
