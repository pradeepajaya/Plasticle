// controllers/adminController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

    user = new User({ username, email, passwordHash, role, isVerified: true,});
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
    const {name , description } = req.body;
    const newMachine = new Machine({
      name,
      description,
    });
    await newMachine.save();
    res.send('Machine created');
  }catch (error) { 
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
    const { id } = req.params;
    const { name, description } = req.body;

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
    const {_id}  = req.body;
    console.log(_id);
    if (!_id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const dltMachine = await Machine.findByIdAndDelete(_id);
  
    if (!dltMachine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    

    res.json({ message: "Machine deleted successfully" });
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
  }catch (error) {
    console.error("Error assigning machine:", error);
    return res.status(500).json({ message: "Server error while assigning machine." });
  }
}
