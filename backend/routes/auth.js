const express = require("express");
const authenticateToken = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/user", authenticateToken, authController.getUser);

// new 
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
//verify user gmail
router.get("/verify-email", authController.verifyEmail);

// OAuth login
router.post("/google", authController.googleAuth);

// delete user account
router.delete("/delete-account", authenticateToken, authController.deleteUserAccount);


module.exports = router;
