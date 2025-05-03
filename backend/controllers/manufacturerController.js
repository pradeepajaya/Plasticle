const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
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
                createdAt: new Date(),
            });

            await newBottle.save();

            // Create QR data and generate QR image
            const qrData = `bottleId : "${newBottle.bottleId}"\nmanufacturerId : "${newBottle.manufacturerId}"`;

            const qrCodeImage = await QRCode.toDataURL(qrData, {
                width: 400,
                errorCorrectionLevel: 'H',
            });

            bottles.push({
                bottleId: newBottle.bottleId,
                manufacturerId: newBottle.manufacturerId,
                qrCodeImage,
            });

            console.log(`Bottle ${i + 1} Created - Bottle ID: ${bottleId}`);
        }

        const countInt = parseInt(count);
        manufacturer.totalBottlesProduced += countInt;

        const currentMonth = new Date().toISOString().slice(0, 7);

        if (!manufacturer.monthlyProduction.has(currentMonth)) {
            manufacturer.monthlyProduction.set(currentMonth, 0);
        }

        manufacturer.monthlyProduction.set(
            currentMonth,
            manufacturer.monthlyProduction.get(currentMonth) + countInt
        );

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
