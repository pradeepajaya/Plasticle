const { v4: uuidv4 } = require("uuid");
const Manufacturer = require("../models/Manufacturer");
const Bottle = require("../models/Bottle");

exports.generateQrCodes = async (req, res) => {
    try {
        console.log("\n [API REQUEST]: /generate-qr", req.body);

        const { manufacturerId, count } = req.body;

        // Validate request body
        if (!manufacturerId || !count || isNaN(count) || count <= 0) {
            return res.status(400).json({ error: "Invalid manufacturer ID or count" });
        }

        // Check if manufacturer exists
        const manufacturer = await Manufacturer.findOne({ userId: manufacturerId });
        if (!manufacturer) {
            return res.status(404).json({ error: "Manufacturer not found" });
        }

        let bottles = [];
        for (let i = 0; i < count; i++) {
            const bottleId = uuidv4();

            const newBottle = new Bottle({
                manufacturerId: manufacturer.userId,
                bottleId,
            });

            await newBottle.save();
            bottles.push({
                bottleId: newBottle.bottleId,
                manufacturerId: newBottle.manufacturerId,
            });

            console.log(`Bottle ${i + 1} Created - Bottle ID: ${bottleId}`);
        }

        // Update manufacturer's totalBottlesProduced count
        manufacturer.totalBottlesProduced += parseInt(count);
        await manufacturer.save();

        res.status(201).json({
            message: "QR codes generated successfully",
            bottles,
        });
    } catch (error) {
        console.error("Error generating QR codes:", error);
        res.status(500).json({ error: "Server error" });
    }
};
