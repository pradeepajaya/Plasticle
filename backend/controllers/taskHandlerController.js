const TaskHandler = require("../models/taskhandler");
const Bin = require("../models/Bin");

// Get all full bins
const getFullBins = async (req, res) => {
  try {
    const bins = await Bin.find({ status: "full" });
    res.json(bins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get full bins" });
  }
};

// Get all active task handlers
const getActiveTaskHandlers = async (req, res) => {
  try {
    const handlers = await TaskHandler.find({ isActive: true });
    res.json(handlers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get active task handlers" });
  }
};

// Assign bin to task handler
const assignBinToHandler = async (req, res) => {
  const { handlerId, binId } = req.body;

  if (!handlerId || !binId) {
    return res.status(400).json({ message: "handlerId and binId are required" });
  }

  try {
    const bin = await Bin.findById(binId);
    if (!bin || bin.status !== "full") {
      return res.status(400).json({ message: "Invalid or unassignable bin" });
    }

    bin.status = "assigned";
    await bin.save();

    const handler = await TaskHandler.findByIdAndUpdate(
      handlerId,
      {
        $push: { assignedBins: bin._id },
        binAssigned: true,
      },
      { new: true }
    );

    res.json({ message: "Bin assigned successfully", handler });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Assignment failed" });
  }
};

// Get task handlers with assigned bins populated
const getTaskHandlerAssignments = async (req, res) => {
  try {
    const handlers = await TaskHandler.find({ assignedBins: { $exists: true, $ne: [] } })
      .populate('assignedBins', 'binId');
    res.json(handlers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch task handler assignments" });
  }
};

// Get task handler by userId
const getTaskHandlerByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const handler = await TaskHandler.findOne({ userId });

    if (!handler) {
      return res.status(404).json({ message: "Task handler not found" });
    }

    res.json(handler);
  } catch (error) {
    console.error("Error finding task handler:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get assigned bins with location for a specific task handler
const getAssignedBinsForHandler = async (req, res) => {
  const { handlerId } = req.params;

  try {
    const handler = await TaskHandler.findById(handlerId).populate(
      "assignedBins",
      "binId location locationName"
    );

    if (!handler) {
      return res.status(404).json({ message: "Task handler not found" });
    }

    res.json(handler.assignedBins);
  } catch (err) {
    console.error("Error fetching assigned bins:", err);
    res.status(500).json({ message: "Failed to fetch assigned bins" });
  }
};

/*const collectBinFromHandler = async (req, res) => {
  const { binId, handlerId } = req.params;

  try {
    // 1. Update bin status
    const updatedBin = await Bin.findByIdAndUpdate(
      binId,
      {
        status: "active",
        currentFill: 0,
        collected: true,
        collectionDate: new Date(),
      },
      { new: true }
    );

    if (!updatedBin) {
      return res.status(404).json({ message: "Bin not found" });
    }

    // 2. Remove bin from handler's assignedBins
    const updatedHandler = await TaskHandler.findByIdAndUpdate(
      handlerId,
      { $pull: { assignedBins: binId } },
      { new: true }
    );

    if (!updatedHandler) {
      return res.status(404).json({ message: "TaskHandler not found" });
    }

    res.json({ message: "Bin collected successfully", bin: updatedBin });
  } catch (err) {
    console.error("Error collecting bin:", err);
    res.status(500).json({ message: "Failed to collect bin" });
  }
};*/

const collectBin = async (req, res) => {
  const { binId, handlerId } = req.params;

  try {
    // 1. Update bin status
    const bin = await Bin.findByIdAndUpdate(
      binId,
      {
        status: "active",
        currentFill: 0,
        collected: true,
        collectionDate: new Date(),
      },
      { new: true }
    );

    if (!bin) {
      return res.status(404).json({ message: "Bin not found" });
    }

    // 2. Remove bin from task handler's assignedBins
    await TaskHandler.findByIdAndUpdate(handlerId, {
      $pull: { assignedBins: binId },
    });

    // 3. Check if all assigned bins are now collected
    const handler = await TaskHandler.findById(handlerId).populate("assignedBins");

    const hasUncollectedBins = handler.assignedBins.length > 0;

    if (!hasUncollectedBins) {
      handler.binAssigned = false;
      await handler.save();
    }

    res.json({ message: "Bin collected successfully", bin });
  } catch (err) {
    console.error("Error collecting bin:", err);
    res.status(500).json({ message: "Server error while collecting bin" });
  }
};



module.exports = {
  getFullBins,
  getActiveTaskHandlers,
  assignBinToHandler,
  getTaskHandlerAssignments,
  getTaskHandlerByUserId, 
  getAssignedBinsForHandler,
  collectBin
};
