const bin = require("../models/Bin");
const Machine = require("../models/Machine");
const express = require("express");

const app = express();
app.use(express.json());

//placed to be modifed if assgin bin according to location
exports.assginBinAuto = async (req, res) => {
  try {
    const filledbin = await bin.findOne({ currentFill: 1 });
    if (!filledbin) {
      return res.status(404).json({ error: "No bins available" });
    }
    
    filledbin.assignedTo = req.body.id;
    filledbin.status = "assigned";
    await filledbin.save();

    res.json({ filledbin });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

exports.assginBinManual = async (req, res) => { 
    try {
        const filledbin = await bin.findOne({ currentFill: 1 });
        if (!filledbin) {
        return res.status(404).json({ error: "No bins available" });
        }
        // Find the collector by ID
        const collectorId = req.body.id; // Assuming the collector ID is sent in the request body
        filledbin.assignedTo = collectorId;
        filledbin.status = "assigned";
        await filledbin.save();
        res.json({ filledbin });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}


exports.createMachine = async (req, res) => {
  try {
    const {name , description } = req.body;
    const newMachine = new Machine({
      name,
      description,
    });
    await newMachine.save();
  }catch (error) { 
    res.status(500).json({ error: "Server error" });
  } 
}

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

exports.getMachine = async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

exports.deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteMachine = await Machine.findByIdAndDelete(id);

    if (!deleteMachine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    await deleteMachine.delete();

    res.json({ message: "Machine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}