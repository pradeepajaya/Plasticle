const Bottle = require("../models/Bottle");
const Bin = require("../models/Bin");
const Collector = require("../models/Collector");
const User = require("../models/User");

const validateBin = async (req, res) => {
  try {
    const { binId, userId } = req.body;

    // Log the request body for debugging
    console.log("Request Body:", req.body);

    // Validate input
    if (!binId || !userId) {
      return res.status(400).json({ message: "binId and userId are required." });
    }

    // Log the binId being searched
    console.log("Searching for bin with ID:", binId);

    // Find the bin by binId
    const bin = await Bin.findOne({ binId });

    console.log("Found bin:", bin);

    if (!bin) {
      return res.status(404).json({ message: "Bin not found." });
    }

    if (bin.status === "inactive") {
      return res.status(400).json({ message: "This bin is not available for collection." });
    }

    if (bin.currentFill === 0) {
      return res.status(400).json({ message: "This bin is already empty and cannot be collected." });
    }

    // Update the Bottle collection 
    const bottles = await Bottle.updateMany(
      { binId: binId },
      { status: "collected" }
    );
    console.log("Bottles updated:", bottles);

    // Update the Collector collection
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // e.g., "2025-04"

    // Fetch the collector document
    const collector = await Collector.findOne({ userId });

if (!collector) {
    return res.status(404).json({ message: "Collector not found." });
}

// Update monthlyBinsCollected
if (!collector.monthlyBinsCollected.has(currentMonth)) {
    collector.monthlyBinsCollected.set(currentMonth, 0);
}
collector.monthlyBinsCollected.set(
    currentMonth,
    collector.monthlyBinsCollected.get(currentMonth) + 1
);

collector.totalBinsCollected += 1;

await collector.save();

    console.log("Updated Collector:", collector);

    // Update the Bin collection 
    const binUpdate = await Bin.findOneAndUpdate(
      { binId: binId },
      { 
        status: "active",  
        currentFill: 0     
      },
      { new: true } 
    );
    console.log("Updated Bin:", binUpdate);

    return res.status(200).json({ message: "Bin successfully collected" });
  } catch (error) {
    console.error("Error validating bin:", error);
    return res.status(500).json({ message: "Server error while validating bin." });
  }
};

const updateCollectorStatus = async (req, res) => {
  try {
    const { userId, latitude, longitude, activePersonal } = req.body;

    if (!userId || latitude == null || longitude == null || activePersonal == null) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const collector = await Collector.findOneAndUpdate(
      { userId },
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        activePersonal,
      },
      { new: true }
    );

    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    res.status(200).json({ message: "Collector status updated", collector });
  } catch (error) {
    console.error("Error updating collector status:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// collector availability toggle status
const toggleAvailabilityStatus = async (req, res) => {
  try {
    const { userId, activePersonal } = req.body;

    if (!userId || activePersonal == null) {
      return res.status(400).json({ message: "Missing userId or activePersonal status" });
    }

    const collector = await Collector.findOneAndUpdate(
      { userId },
      { activePersonal },
      { new: true }
    );

    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    res.status(200).json({ message: "Availability status updated", collector });
  } catch (error) {
    console.error("Error toggling availability status:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// update collector profile information

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, dateOfBirth, gender, district } = req.body;

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



const getCollectorAllocations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the collector by the logged-in user's ID
    const collector = await Collector.findOne({ userId });
    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    // Find bins assigned to this collector with a collection date
    const bins = await Bin.find({
      collectorId: collector._id,
      collectionDate: { $ne: null },
    }).select("binId collectionDate location city locationName");
    
    res.status(200).json(bins);
  } catch (error) {
    console.error("Error fetching collector allocations:", error);
    res.status(500).json({ message: "Failed to fetch collector allocations." });
  }
};


const updateBinCollectionStatus = async (req, res) => {
  try {
    const { binId, vehicleId } = req.body;

    // Find the bin first to get the currentFill before updating
    const bin = await Bin.findOne({ binId });

    if (!bin) {
      return res.status(404).json({ message: "Bin not found" });
    }

    const previousFill = bin.currentFill; //  Save current fill before resetting

    const updatedBin = await Bin.findOneAndUpdate(
      { binId },
      {
        status: "active",
        currentFill: 0,
        collected: true,
        vehicleId: vehicleId || "",
        previousFill, 
      },
      { new: true }
    );

    res.status(200).json({
      message: "Bin marked as collected",
      binId: updatedBin.binId,
      collectionDate: updatedBin.collectionDate,
    });
  } catch (err) {
    console.error("Error in updateBinCollectionStatus:", err);
    res.status(500).json({ message: "Error updating bin" });
  }
};

const getFullBins = async (req, res) => {
  try {
    const fullBins = await Bin.find({ status: "full" }).select("location");
    res.status(200).json(fullBins);
  } catch (error) {
    console.error("Error fetching full bins:", error);
    res.status(500).json({ message: "Failed to fetch full bins." });
  }
};


module.exports = { validateBin, updateCollectorStatus,  toggleAvailabilityStatus, updateProfile, updateProfilePicture, getProfilepicture, getCollectorAllocations, updateBinCollectionStatus, getFullBins, };
