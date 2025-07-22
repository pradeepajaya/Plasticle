const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const Manufacturer = require("../models/Manufacturer");
const Bottle = require("../models/Bottle");
const User = require("../models/User");

// Helper function to validate base64 image
const isValidBase64 = (str) => {
    return /^data:image\/\w+;base64,/.test(str);
};

exports.getStats = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findOne({ userId: req.user.id });

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        error: "Manufacturer not found",
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalBottlesProduced: manufacturer.totalBottlesProduced || 0,
        totalBottlesRecycled: manufacturer.totalBottlesRecycled || 0,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch manufacturer stats",
    });
  }
};


exports.generateQrCodes = async (req, res) => {
    try {
        console.log("\n[API REQUEST]: /generate-qr", req.body);

        const { manufacturerId, count } = req.body;

        // Validate request body
        if (!manufacturerId || !count || isNaN(count) || count <= 0) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid manufacturer ID or count" 
            });
        }

        // Check if manufacturer exists
        const manufacturer = await Manufacturer.findOne({ userId: manufacturerId });
        if (!manufacturer) {
            return res.status(404).json({ 
                success: false,
                error: "Manufacturer not found" 
            });
        }

        let bottles = [];
        const generationPromises = Array.from({ length: count }).map(async (_, i) => {
            const bottleId = uuidv4();
            const newBottle = new Bottle({
                manufacturerId: manufacturer.userId,
                bottleId,
                createdAt: new Date(),
            });

            await newBottle.save();

            // <-- FIX HERE: Use old string format for qrData -->
            const qrData = `bottleId : "${newBottle.bottleId}"\nmanufacturerId : "${newBottle.manufacturerId}"`;

            const qrCodeImage = await QRCode.toDataURL(qrData, {
                width: 400,
                errorCorrectionLevel: 'H',
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            bottles.push({
                bottleId: newBottle.bottleId,
                manufacturerId: newBottle.manufacturerId,
                qrCodeImage,
            });

            console.log(`Bottle ${i + 1} Created - Bottle ID: ${bottleId}`);
        });

        await Promise.all(generationPromises);

        // Update manufacturer stats
        const countInt = parseInt(count);
        manufacturer.totalBottlesProduced += countInt;

        const currentMonth = new Date().toISOString().slice(0, 7);
        manufacturer.monthlyProduction.set(
            currentMonth,
            (manufacturer.monthlyProduction.get(currentMonth) || 0) + countInt
        );

        await manufacturer.save();

        res.status(201).json({
            success: true,
            message: "QR codes generated successfully",
            count: bottles.length,
            bottles,
        });

    } catch (error) {
        console.error("Error generating QR codes:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error during QR code generation" 
        });
    }
};

exports.generatePdf = async (req, res) => {
    try {
        const { qrCodes } = req.body;

        if (!qrCodes || !Array.isArray(qrCodes)) {
            return res.status(400).json({ 
                success: false,
                error: "QR codes array is required" 
            });
        }

        // Validate each QR code image
        for (const qr of qrCodes) {
            if (!qr.qrCodeImage || !isValidBase64(qr.qrCodeImage)) {
                return res.status(400).json({ 
                    success: false,
                    error: "Invalid QR code image format" 
                });
            }
        }

        // Create PDF document
        const doc = new PDFDocument({
            margin: 30,
            size: 'A4',
            info: {
                Title: 'Generated QR Codes',
                Author: 'Plasticle System',
                Creator: 'Plasticle Manufacturer Portal'
            }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=plasticle_qr_codes.pdf');

        // Pipe PDF directly to response
        doc.pipe(res);

        // Add header with company info
        const manufacturer = await Manufacturer.findOne({ userId: req.user.id });
        if (manufacturer) {
            doc.fontSize(16)
               .text(manufacturer.companyName || 'Plasticle Manufacturer', { 
                   align: 'center',
                   underline: true 
               });
            doc.moveDown();
        }

        // Add QR codes in grid layout
        const qrSize = 100;
        const margin = 20;
        let x = 50, y = 100;
        let qrPerRow = 0;
        const maxPerRow = 4;

        doc.fontSize(12).text('Generated on: ' + new Date().toLocaleString(), { align: 'right' });
        doc.moveDown(2);

        for (let i = 0; i < qrCodes.length; i++) {
            const qr = qrCodes[i];
            const base64Data = qr.qrCodeImage.replace(/^data:image\/png;base64,/, '');
            const imgBuffer = Buffer.from(base64Data, 'base64');

            // Draw QR code
            doc.image(imgBuffer, x, y, { 
                width: qrSize, 
                height: qrSize,
                align: 'center'
            });

            // Add label below QR
            doc.fontSize(10)
               .text(`ID: ${qr.bottleId || `QR_${i+1}`}`, x, y + qrSize + 5, {
                   width: qrSize,
                   align: 'center'
               });

            x += qrSize + margin;
            qrPerRow++;

            // Move to next row or page
            if (qrPerRow >= maxPerRow || x > (450 - qrSize)) {
                x = 50;
                y += qrSize + 40;
                qrPerRow = 0;

                // Add new page if needed
                if (y > 650 && i < qrCodes.length - 1) {
                    doc.addPage();
                    y = 50;
                    // Repeat header on new pages
                    if (manufacturer) {
                        doc.fontSize(12)
                           .text(manufacturer.companyName, { align: 'center' });
                        doc.moveDown();
                    }
                }
            }
        }

        // Add footer
        doc.fontSize(10)
           .text('© Plasticle Recycling System - ' + new Date().getFullYear(), {
               align: 'center',
               oblique: true
           });

        doc.end();

    } catch (error) {
        console.error("PDF generation error:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to generate PDF document",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { companyName, companyLocation, companyRegNumber, companyTelephone } = req.body;

        // Validate input
        if (!companyName || !companyLocation) {
            return res.status(400).json({
                success: false,
                error: "Company name and location are required"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                companyName, 
                companyLocation, 
                companyRegNumber, 
                companyTelephone,
                profileCompleted: true 
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                companyName: updatedUser.companyName,
                companyLocation: updatedUser.companyLocation,
                profileCompleted: updatedUser.profileCompleted
            }
        });

    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ 
            success: false,
            error: "Server error while updating profile",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Additional helper method
exports.getManufacturerStats = async (req, res) => {
    try {
        const manufacturer = await Manufacturer.findOne({ userId: req.user.id });
        
        if (!manufacturer) {
            return res.status(404).json({
                success: false,
                error: "Manufacturer not found"
            });
        }

        res.json({
            success: true,
            stats: {
                totalBottlesProduced: manufacturer.totalBottlesProduced,
                monthlyProduction: Object.fromEntries(manufacturer.monthlyProduction),
                lastUpdated: manufacturer.updatedAt
            }
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch manufacturer stats"
        });
    }
};
