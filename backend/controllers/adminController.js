const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Bin = require('../models/Bin');
const Collector = require('../models/Collector');

const Machine = require("../models/Machine");
const express = require("express");

const app = express();
app.use(express.json());



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

    user = new User({ username, email, passwordHash, role, isVerified: true, });
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

//machine crud operations
//create
exports.createMachine = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newMachine = new Machine({
      name,
      description,
    });
    await newMachine.save();
    res.send('Machine created');
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}


//read
exports.getMachine = async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

//update
exports.updateMachine = async (req, res) => {
  try {
    // const { id } = req.body;
    const { id, name, description } = req.body;

    const updatedMachine = await Machine.findByIdAndUpdate(id, {
      name,
      description,
    }, { new: true });

    if (!updatedMachine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    res.json(updatedMachine);
  }
  catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

//delete
exports.deleteMachine = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const dltMachine = await Machine.findByIdAndDelete(id);

    if (!dltMachine) {
      return res.status(404).json({ error: "Machine not found" });
    }


    res.json({ message: "Machine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

//get task handler
exports.getTaskHandler = async (req, res) => {
  try {
    const taskhandler = await User.find({ role: "taskhandler" });
    res.json(taskhandler);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}


//assgin Machine to task handler
exports.assignMachine = async (req, res) => {
  try {
    // Log the request body for debugging
    console.log("Request Body:", req.body);

    const { machineId, taskHandlerId } = req.body; // Extract machineId and taskHandlerId from the request body

    // Validate input
    if (!machineId || !taskHandlerId) {
      return res.status(400).json({ message: "machineId and taskHandlerId are required." });
    }

    const machineToAssign = await Machine.findById(machineId);
    //const user = await User.findById("taskHandlerId");

    // Find the machine by machineId
    const machine = await Machine.findById(machineId);

    // Log the found machine (or null if not found)
    console.log("Found machine:", machine);

    if (!machineToAssign) {
      return res.status(404).json({ message: "Machine not found." });
    }

    // Check if the machine is already assigned
    if (machineToAssign.assignedTo) {
      return res.status(400).json({ message: "Machine already assigned." });
    }

    // Update the machine's assignedTo field with the task handler's ID
    const updatedMachine = await Machine.findByIdAndUpdate(
      machineId,
      { assignedTo: taskHandlerId }, // Assign the machine to the task handler
      { new: true } // Return the updated document
    );
    console.log("Updated Machine:", updatedMachine);

    // Return success response
    return res.status(200).json({ message: "Machine successfully assigned" });
  } catch (error) {
    console.error("Error assigning machine:", error);
    return res.status(500).json({ message: "Server error while assigning machine." });
  }
}

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

  const { binId, collectorId, collectionDate } = req.body;

  if (!binId || !collectorId || !collectionDate) {
    return res.status(400).json({ message: "Bin ID and Collector ID and Collection Date are required" });
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

    bin.collectorId = collectorId;
    bin.status = "assigned";
    bin.collectionDate = new Date(collectionDate);

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
//Bottle statistics controller

exports.getBottleSummary = async (req, res) => {
  try {
    const bottles = await Bottle.find().populate("manufacturerId").populate("binId");

    const monthlyData = {};
    const yearlyData = {};
    const districtData = {};
    const manufacturerData = {};

    bottles.forEach((bottle) => {
      const date = new Date(bottle.generatedAt);
      const year = date.getFullYear();
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      // Monthly
      monthlyData[month] = (monthlyData[month] || 0) + 1;

      // Yearly
      yearlyData[year] = (yearlyData[year] || 0) + 1;

      // Manufacturer
      const mName = bottle.manufacturerId?.name || "Unknown Manufacturer";
      manufacturerData[mName] = (manufacturerData[mName] || 0) + 1;

      // District
      const city = bottle.binId?.city || "Unknown District";
      districtData[city] = (districtData[city] || 0) + 1;
    });

    res.status(200).json({
      monthly: monthlyData,
      yearly: yearlyData,
      district: districtData,
      manufacturer: manufacturerData,
    });
  } catch (error) {
    console.error("Error in bottle summary:", error);
    res.status(500).json({ message: "Error fetching bottle summary" });
  }
};
