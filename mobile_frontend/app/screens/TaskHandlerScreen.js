import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const TaskHandlerScreen = () => {
  const [location, setLocation] = useState(""); // Location address
  const [capacity, setCapacity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null); // Store lat, lng of selected location
  const [qrCode, setQrCode] = useState(null);

  // Google Maps API key
  const googleMapsApiKey = "AIzaSyCiB4iiZYHPtCR6BW3PM2XFnbgiqkaz1AI";

  // Function to generate a unique binId
  const generateBinId = () => {
    return `BIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Handle the map click event to get lat, lng
  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
    setLocation(`${lat}, ${lng}`); // You can also use Google Places to get a readable address if needed
  };

  const generateBinQR = async () => {
    if (!location || !capacity) {
      alert("Please enter location and capacity!");
      return;
    }

    const binId = generateBinId(); // Generate unique binId

    const response = await fetch("http://localhost:5000/api/bins/createBin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ binId, location, capacity }),
    });

    const data = await response.json();
    if (data.qrCodeImage) {
      setQrCode(data.qrCodeImage);
    } else {
      alert("Error generating QR code.");
    }
  };

  // Download QR code image
  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "bin-qr-code.png";  // You can customize the name of the file
    link.click();
  };

  return (
    <div style={{ padding: "20px", maxHeight: "100vh", overflowY: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Task Handler</h2>

      {/* Google Map with click to select location */}
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          id="location-picker-map"
          mapContainerStyle={{ width: "100%", height: "400px", marginBottom: "20px" }}
          center={{ lat: 6.9271, lng: 79.8612 }} // Default center (e.g., Colombo)
          zoom={12}
          onClick={onMapClick}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              label="Selected Location"
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Space between map and input fields */}
      <div style={{ marginBottom: "15px" }}></div>

      {/* Input field for location */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Selected Location (Lat, Lng)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        />
      </div>

      {/* Input for capacity */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="number"
          placeholder="Enter bin capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        />
      </div>

      {/* Generate QR Button */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button 
          onClick={generateBinQR}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generate Bin QR
        </button>
      </div>

      {/* QR Code Display */}
      {qrCode && (
        <div style={{ textAlign: "center" }}>
          <h3>Bin QR Code:</h3>
          <img src={qrCode} alt="Bin QR Code" style={{ width: "150px", height: "150px" }} />
          {/* Download Button */}
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={downloadQR}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskHandlerScreen;
