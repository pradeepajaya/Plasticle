const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    assignedTo: { type: String, required: false, default: null },
    scanNo: { type: Number, required: false, default: 0 },
    });

const Machine = mongoose.model("Machine", machineSchema);
module.exports = Machine;