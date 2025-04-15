const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    });

const Machine = mongoose.model("Machine", machineSchema);
module.exports = Machine;
