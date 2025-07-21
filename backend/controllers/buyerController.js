const Bottle = require("../models/Bottle");
const Bin = require("../models/Bin");
const Buyer = require("../models/Buyer");
const User = require("../models/User");

// Validate Bin QR Code
const validateBinQRCode = async (req, res) => {
  try {
    const { binId } = req.body;

    // Validate input
    if (!binId) {
      return res.status(400).json({ message: "binId is required." });
    }

    // Find the bin by binId
    const bin = await Bin.findOne({ binId });

    if (!bin) {
      return res.status(404).json({ message: "Bin not found." });
    }

    // Check if the bin is available
    if (bin.status === "inactive" || bin.status === "full") {
      return res.status(400).json({ message: "This bin is not available for use." });
    }

    // Bin found and valid
    return res.status(200).json({ message: "Bin is valid", bin });
  } catch (error) {
    console.error("Error validating bin:", error);
    return res.status(500).json({ message: "Server error while validating bin." });
  }
};

// Validate Bottle QR Code
const validateBottleQRCode = async (req, res) => {
  try {
    const { bottleId, binId, userId } = req.body;

    // Validate input
    if (!bottleId || !binId || !userId) {
      return res.status(400).json({ message: "bottleId, binId, and userId are required." });
    }

    // Find the bottle by bottleId
    const bottle = await Bottle.findOne({ bottleId });

    if (!bottle) {
      return res.status(404).json({ message: "Bottle not found." });
    }

    // Check if the bottle is already used
    if (bottle.status === "used") {
      return res.status(400).json({ message: "This bottle has already been used." });
    }

    // Update the Bottle collection
    bottle.binId = binId;
    bottle.buyerId = userId;
    bottle.status = "used";
    await bottle.save();

   
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;

    await Buyer.findOneAndUpdate(
      { userId: userId },
      {
        $inc: {
          totalBottlesCollected: 1,
          [`monthlyContribution.${currentMonthKey}`]: 1, 
        },
      },
    { upsert: true }
    );

    // Update the Bin collection
    await Bin.findOneAndUpdate(
      { binId: binId },
      { $inc: { currentFill: 1 } },
    );

    // Return success response
    return res.status(200).json({ message: "Bottle added to bin" });
  } catch (error) {
    console.error("Error validating bottle:", error);
    return res.status(500).json({ message: "Server error while validating bottle." });
  }
};

 // update buyer profile  

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, dateOfBirth, gender, district} = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { nickname, dateOfBirth, gender, district },
      { new: true }
    );

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};  

// update buyer profile end 


// update buyer profile image

const updateProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture },
      { new: true }
    );

    res.json({ message: "Profile picture updated", profilePicture: user.profilePicture });
  } catch (err) {
    console.error("Profile picture update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// get profile picture

const getProfilepicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  validateBinQRCode,
  validateBottleQRCode,
  updateProfile,
  updateProfilePicture,
  getProfilepicture,
};