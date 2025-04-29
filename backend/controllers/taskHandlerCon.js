const bin = require("../models/Bin");
const Machine = require("../models/Machine");
const express = require("express");

const app = express();
app.use(express.json());

//placed to be modifed if assgin bin according to location
//keeping this as optional till now
/* 
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
} */

  // need to be updated
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

//count num of scan for each machine

