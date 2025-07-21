const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Collector = require('../models/Collector');
const Bin = require('../models/Bin');
const Machine = require("../models/Machine");
const TaskHandler = require("../models/taskhandler");
//const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });


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

    user = new User({ username, email, passwordHash, role, isVerified: true,});
    await user.save();

  

// ...
const taskhandler = new TaskHandler({  // Capitalized constructor
  userId: user._id,
  username: user.username,
  isActive: true,
  region: "",
});
await taskhandler.save();


    res.status(201).json({ message: "Task Handler Created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch Existing Task Handlers
exports.getTaskHandlers = async (req, res) => {
  try {
    const taskHandlers = await User.find({ role: "taskhandler",isActive: true  });
    if (!taskHandlers) {
      return res.status(404).json({ message: "No Task Handlers found" });
    }
    res.json(taskHandlers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// deactivate Task Handler
exports.deactivateTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user first to construct new values
    const user = await User.findOne({ _id: id, role: 'taskhandler' });
    

    if (!user) {
      return res.status(404).json({ message: 'Task handler not found or invalid role' });
    }

    // Prepare updated values
    const updatedFields = {
      isActive: false,
      username: `deactivated-${user._id}`,
      email: `${user._id}@deactivated.com`,
    };

    const updatedHandler = await User.findByIdAndUpdate(id, updatedFields, { new: true });

     await TaskHandler.findOneAndUpdate(
      { userId: id },
      {
        isActive: false,
        username: `deactivated-${user._id}`,
      }
    );

    res.status(200).json({ message: 'Task handler deactivated', user: updatedHandler });
  } catch (error) {
    console.error('Error deactivating task handler:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Fetch Filled Bins with nearby Collectors
exports.getFilledBinsWithCollectors = async (req, res) => {
  try {
    const filledBins = await Bin.find({ status: "full", collected: { $ne: true } });

    const result = [];

    for (const bin of filledBins) {
      // Validate coordinates
      if (
        !bin.location ||
        !Array.isArray(bin.location.coordinates) ||
        bin.location.coordinates.length !== 2 ||
        bin.location.coordinates.some(coord => typeof coord !== "number")
      ) {
        console.warn(`Skipping bin ${bin.binId} due to invalid coordinates`);
        continue;
      }

      // Step 1: Collectors with this bin in preferredBins
      const preferredCollectors = await Collector.find({
        activePersonal: true,
        preferredBins: bin._id,
      });

      let collectorsToShow = preferredCollectors;

      // Step 2: If no preferredCollectors found for this bin,
      // show available collectors without any preferredBins, nearby the bin
      if (preferredCollectors.length === 0) {
        collectorsToShow = await Collector.find({
          activePersonal: true,
          $or: [
            { preferredBins: { $exists: false } },
            { preferredBins: { $size: 0 } },
          ],
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
      }

      result.push({
        binId: bin.binId,
        location: bin.location,
        coordinates: bin.location.coordinates,
        collectors: collectorsToShow.map((collector) => ({
          userId: collector.userId,
          collectorId: collector._id,
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
    const availableCollectors = await Collector.find({ activePersonal: true })
      .populate({
        path: 'userId',
        select: 'nickname email username',
        model: 'User'
      });

    if (!availableCollectors.length) {
      return res.status(200).json([]); // return empty array instead of 404
    }

    res.status(200).json(availableCollectors);
  } catch (err) {
    console.error("Error fetching available collectors:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch individual collected bins with currentFill as totalCollectedBottles
exports.getVehicleArrivalBasic = async (req, res) => {
  try {
    const collectedBins = await Bin.aggregate([
      {
        $match: {
          collected: true,
          vehicleId: { $exists: true, $ne: "" },
          collectionDate: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            vehicleId: "$vehicleId",
            collectorId: "$collectorId",
            collectionDate: "$collectionDate",
          },
          totalBins: { $sum: 1 },
          totalBottles: { $sum: "$previousFill" }, // ✅ use previousFill instead of currentFill
          collectedLocations: { $addToSet: "$location" }, // ✅ get location
        },
      },
      {
        $project: {
          _id: 0,
          vehicleId: "$_id.vehicleId",
          collectorId: "$_id.collectorId",
          collectionDate: "$_id.collectionDate",
          totalBins: 1,
          totalBottles: 1,
          collectedLocations: 1,
        },
      },
    ]);

    res.status(200).json(collectedBins);
  } catch (err) {
    console.error("Error fetching vehicle arrival data:", err);
    res.status(500).json({ message: "Error retrieving data" });
  }
};


exports.getDailyCollectionStats = async (req, res) => {
  try {
    const stats = await Bin.aggregate([
      {
        $match: {
          collectionDate: { $exists: true },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$collectionDate" } },
          totalBinsAssigned: { $sum: 1 },
          totalBinsCollected: { $sum: { $cond: ["$collected", 1, 0] } },
          totalBottlesCollected: { $sum: { $cond: ["$collected", "$previousFill", 0] } },
          collectors: { $addToSet: "$collectorId" },
        },
      },
      {
        $project: {
          date: "$_id",
          totalBinsAssigned: 1,
          totalBinsCollected: 1,
          totalBottlesCollected: 1,
          totalCollectors: { $size: "$collectors" },
          collectionSuccessRate: {
            $cond: [
              { $eq: ["$totalBinsAssigned", 0] },
              0,
              { $multiply: [{ $divide: ["$totalBinsCollected", "$totalBinsAssigned"] }, 100] }
            ],
          },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    res.status(500).json({ error: "Failed to fetch daily statistics" });
  }
};


exports.getManufacturers = async (req, res) => {
  try {
    const manufacturers = await User.find({ role: 'manufacturer' }).select(
      'username email companyLocation companyName companyRegNumber'
    );
    res.status(200).json(manufacturers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manufacturers' });
  }
};

exports.updateManufacturerDetails = async (req, res) => {
  const { userId } = req.params;
  const { companyName, companyLocation, companyRegNumber, companyTelephone } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { companyName, companyLocation, companyRegNumber, companyTelephone },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }

    res.json({ message: 'Manufacturer updated successfully', updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error updating manufacturer' });
  }
};

exports.checkFullBinsAndCollectors = async (req, res) => {
  try {
    const bins = await Bin.find({});
    const collectors = await Collector.find({});

    const allBinsFull = bins.every(
      (bin) => bin.currentFill >= bin.capacity || bin.status === 'full'
    );

    const noAvailableCollectors = collectors.every(
      (collector) => collector.activePersonal === false
    );

    return res.status(200).json({
      allBinsFull,
      noAvailableCollectors,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//code from SK 
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

    const { machineId, handlerId } = req.body; // Extract machineId and taskHandlerId from the request body

    // Validate input
    if (!machineId || !handlerId) {
      return res.status(400).json({ message: "machineId and taskHandlerId are required." });
    }

 
    // Find the machine by machineId
    const machine = await Machine.findById(machineId);

    // Log the found machine (or null if not found)
    //console.log("Found machine:", machine);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found." });
    }

    // Check if the machine is already assigned
    if (machine.assignedTo) {
      return res.status(400).json({ message: "Machine already assigned." });
    }

    // Update the machine's assignedTo field with the task handler's ID
    const updatedMachine = await Machine.findByIdAndUpdate(
      machineId,
      { assignedTo: handlerId }, // Assign the machine to the task handler
      { new: true } // Return the updated document
    );
    //console.log("Updated Machine:", updatedMachine);

    // Return success response
    return res.status(200).json({ message: "Machine successfully assigned" });
  } catch (error) {
    console.error("Error assigning machine:", error);
    return res.status(500).json({ message: "Server error while assigning machine." });
  }
}


