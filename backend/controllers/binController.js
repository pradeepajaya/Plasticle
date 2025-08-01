const QRCode = require("qrcode");
const Bin = require("../models/Bin");
const { v4: uuidv4 } = require('uuid'); 


// Function to get location name from coordinates using reverse geocoding
const getLocationName = async (coordinates) => {
  try {
    // Check if coordinates is a string (like "lat,lng") or has lat/lng properties
    let lat, lng;
    
    if (typeof coordinates === 'string') {
      const [latitude, longitude] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
      lat = latitude;
      lng = longitude;
    } else if (coordinates.lat && coordinates.lng) {
      lat = coordinates.lat;
      lng = coordinates.lng;
    } else if (Array.isArray(coordinates) && coordinates.length === 2) {
      [lat, lng] = coordinates;
    } else {
      return coordinates; // Return original if format is unrecognized
    }

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return coordinates;
    }

    // Use OpenStreetMap Nominatim API for reverse geocoding (free service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BinManagementSystem/1.0' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      console.warn(`Geocoding API error: ${response.status}`);
      return coordinates;
    }

    const data = await response.json();
    
    if (data && data.display_name) {
      // Extract meaningful location components
      const address = data.address || {};
      const locationParts = [];
      
      // Add relevant address components in order of preference
      if (address.road) locationParts.push(address.road);
      if (address.suburb) locationParts.push(address.suburb);
      if (address.city || address.town || address.village) {
        locationParts.push(address.city || address.town || address.village);
      }
      if (address.state) locationParts.push(address.state);
      
      // If we have meaningful parts, join them
      if (locationParts.length > 0) {
        return locationParts.join(', ');
      }
      
      // Fallback to display_name but truncate if too long
      return data.display_name.length > 100 
        ? data.display_name.substring(0, 100) + '...'
        : data.display_name;
    }
    
    return coordinates; // Return original coordinates if no name found
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return coordinates; // Return original coordinates on error
  }
};

exports.createBin = async (req, res) => {
  try {
    const { location, capacity } = req.body;

    // Generate a unique binId using uuid
    const binId = uuidv4(); 

    // Create new bin in the database with generated binId
    const newBin = new Bin({
      binId,  
      location,
      capacity,
      currentFill: 0, 
    });

    // Save the new bin document
    await newBin.save();

    // Generate QR code data (binId, location, currentFill)
    const qrData = JSON.stringify({
      binId: newBin.binId,  
      location: newBin.location,
      currentFill: newBin.currentFill,
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.json({
      binId: newBin.binId, 
      qrCodeImage,
    });
  } catch (error) {
    console.error("Error creating bin:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get bins grouped by city, and flag full + uncollected bins
exports.getDueLocations = async (req, res) => {
  try {
    const allBins = await Bin.find({});
    const grouped = {};

    for (const bin of allBins) {
      const city = bin.city || "Unknown";
      const isFull = bin.status === "full";
      const notCollected = bin.collected === undefined || bin.collected === false;
      const isCritical = isFull && notCollected;

      const areaName = bin.locationName || bin.location || "Unknown Area";

      if (!grouped[city]) grouped[city] = [];

      grouped[city].push({
        binId: bin.binId,
        area: areaName,
        isCritical,
      });
    }

    res.status(200).json(grouped);
  } catch (error) {
    console.error("Error in getDueLocations:", error);
    res.status(500).json({ message: "Error fetching due locations", error });
  }
};

// GET all bins
exports.getAllBins = async (req, res) => {
  try {
    const bins = await Bin.find({});
    res.status(200).json(bins);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve bins", error });
  }
};

// New function to get location name from coordinates
exports.getLocationNameFromCoordinates = async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    if (!coordinates) {
      return res.status(400).json({ error: "Coordinates are required" });
    }
    
    const locationName = await getLocationName(coordinates);
    
    res.status(200).json({ 
      coordinates, 
      locationName,
      success: locationName !== coordinates // true if conversion was successful
    });
  } catch (error) {
    console.error("Error converting coordinates to location name:", error);
    res.status(500).json({ error: "Failed to get location name" });
  }
};