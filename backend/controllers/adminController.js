const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Bin = require('../models/Bin');
const Collector = require('../models/Collector');

// Create Task Handler (Only Admins)
exports.createTaskHandler = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied" });
  }

  const { username, email, password } = req.body;
  const role = "taskhandler";

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ username, email, passwordHash, role, isVerified: true });
    await user.save();

    res.status(201).json({ message: "Task Handler Created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch Existing Task Handlers
exports.getTaskHandlers = async (req, res) => {
  try {
    const taskHandlers = await User.find({ role: "taskhandler" });
    if (!taskHandlers) {
      return res.status(404).json({ message: "No Task Handlers found" });
    }
    res.json(taskHandlers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch Filled Bins with nearby Collectors
exports.getFilledBinsWithCollectors = async (req, res) => {
  try {
    const filledBins = await Bin.find({ status: "full", collected: { $ne: true } });

    const result = [];

    for (const bin of filledBins) {
      // Validate coordinates existence and format
      if (
        !bin.location ||
        !Array.isArray(bin.location.coordinates) ||
        bin.location.coordinates.length !== 2 ||
        bin.location.coordinates.some(coord => typeof coord !== "number")
      ) {
        console.warn(`Skipping bin ${bin.binId} due to invalid or missing coordinates`);
        continue; // skip this bin if invalid
      }

      const nearbyCollectors = await Collector.find({
        activePersonal: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: bin.location.coordinates,
            },
            $maxDistance: 50000,
          },
        },
      });

      result.push({
        binId: bin.binId,
        location: bin.location,
        coordinates: bin.location.coordinates,
        collectors: nearbyCollectors.map((collector) => ({
          userId: collector.userId,
          coordinates: collector.location.coordinates,
        })),
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching filled bins and collectors:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Allocate Collector to Bin (Only Admins)
exports.allocateCollector = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied" });
  }

  const { binId, collectorId } = req.body;

  if (!binId || !collectorId) {
    return res.status(400).json({ message: "Bin ID and Collector ID are required" });
  }

  try {
    const bin = await Bin.findOne({ binId, status: "full", collected: { $ne: true } });
    if (!bin) {
      return res.status(404).json({ message: "Bin not found or already collected" });
    }

    // DEBUG LOGS: Inspect bin location fields before saving
    console.log('Bin before save:', bin);
    console.log('Location:', bin.location);
    console.log('Location type:', bin.location?.type);
    console.log('Location coordinates:', bin.location?.coordinates);

    const collector = await Collector.findById(collectorId);
    if (!collector || !collector.activePersonal) {
      return res.status(400).json({ message: "Collector not available" });
    }

    bin.collector = collectorId;
    bin.status = "assigned";

    await bin.save();

    collector.activePersonal = false;
    await collector.save();

    res.status(200).json({ message: "Collector allocated successfully" });
  } catch (err) {
    console.error("Error allocating collector:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch Available Collectors (Only Admins)
exports.getAvailableCollectors = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    // Fetching all collectors who are active
    const availableCollectors = await Collector.find({ activePersonal: true });

    if (!availableCollectors || availableCollectors.length === 0) {
      return res.status(404).json({ message: "No available collectors found" });
    }

    res.status(200).json(availableCollectors);
  } catch (err) {
    console.error("Error fetching available collectors:", err);
    res.status(500).json({ message: "Server error" });
  }
};
